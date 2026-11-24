// M16 C4 — Windows selected-window observation bridge.
//
// App-owned consent chooser only: listWindows() enumerates live top-level
// application windows and, inside the same enumeration pass, binds a
// GraphicsCaptureItem for each row (CreateForWindow) that is HELD for the
// selection lifetime. The row's creation-bound identity is the bound item
// itself — an HWND value plus process id cannot prove window creation
// identity because HWNDs recycle within a process, so no hwnd/pid token is
// ever re-derivation used post-binding. Same-object proof between
// enumeration and binding comes from a window PROP token (window properties
// are destroyed with the window object, so GetProp==token after
// CreateForWindow proves the bound object is still the enumerated one; the
// prop is kept for the binding lifetime as the revalidation marker).
// Invalidation is reliable: the item's Closed event fires when the bound
// window is destroyed, frame production starves, and the prop vanishes — any
// of those closes the binding and every later op fails closed.
//
// Node-API surface (called only from apps/desktop/control-bridge.ts):
//   pickWindow(ownerHwndBuffer|null) -> HELD: system picker cannot bind an HWND (CONTROL_PICKER_BINDING_UNSUPPORTED)
//   listWindows()                    -> Promise<windowObject[]> — app-owned chooser feed; each row carries a bindingId
//   windowIdentity(bindingId:string) -> Promise<same|null> — live re-proof of the held binding
//   captureWindow(bindingId:string)  -> Promise<{data:Buffer,width,height}> — capture via the already-bound item
//   dropBinding(bindingId:string)    -> Promise<null> — release a held binding (Stop/cancel)

#define WIN32_LEAN_AND_MEAN
#define NOMINMAX
#define UNICODE
#include <windows.h>
#include <delayimp.h>
#include <string.h>
#include <windows.graphics.capture.interop.h>
#include <windows.graphics.directx.direct3d11.interop.h>
#include <node_api.h>
#include <winrt/base.h>
#include <winrt/Windows.Foundation.h>
#include <winrt/Windows.Graphics.Capture.h>
#include <winrt/Windows.Graphics.DirectX.h>
#include <winrt/Windows.Graphics.DirectX.Direct3D11.h>
#include <winrt/Windows.Graphics.Imaging.h>
#include <winrt/Windows.Storage.Streams.h>
#include <d3d11.h>
#include <dxgi1_2.h>
#include <dwmapi.h>
#include <wincodec.h>
#include <wrl/client.h>
#include <shobjidl.h>
#include <string>
#include <vector>
#include <memory>
#include <deque>
#include <exception>
#include <future>
#include <optional>
#include <unordered_map>
#include <cstdint>
#include <cstdio>
#include <stdexcept>
#include <atomic>
#include <mutex>
#include <condition_variable>
#include <chrono>
#include <limits>

// The addon is linked /DELAYLOAD:node.exe so its node imports bind to the
// host executable at load time: inside Electron there is no node.exe to
// resolve. Same preload mechanism node-gyp injects as win_delay_load_hook.cc,
// declared via the installed SDK's own type.
static FARPROC WINAPI delayLoadNodeExe(unsigned int dliNotify,PDelayLoadInfo info){
 if(dliNotify!=dliNotePreLoadLibrary)return NULL;
 if(_stricmp(info->szDll,"node.exe")!=0)return NULL;
 return (FARPROC)GetModuleHandle(NULL);
}
decltype(__pfnDliNotifyHook2) __pfnDliNotifyHook2=delayLoadNodeExe;

namespace {
namespace wgc = winrt::Windows::Graphics::Capture;
namespace wgi = winrt::Windows::Graphics::Imaging;
namespace wdx = winrt::Windows::Graphics::DirectX;
namespace wdx3 = winrt::Windows::Graphics::DirectX::Direct3D11;
using Microsoft::WRL::ComPtr;
using Windows::Graphics::DirectX::Direct3D11::IDirect3DDxgiInterfaceAccess;

void require(bool condition, const char* stage) { if (!condition) throw std::runtime_error(stage); }
void hr(HRESULT result, const char* stage) { require(SUCCEEDED(result), stage); }

struct WindowDesc {
  HWND hwnd = nullptr;
  DWORD pid = 0;
  DWORD threadId = 0;
  std::wstring title;
  RECT rect{};
  UINT dpi = 96;
  std::string bindingId;
};

std::wstring windowText(HWND hwnd) {
  int length = GetWindowTextLengthW(hwnd);
  std::wstring value(length > 0 ? length : 1, L'\0');
  int written = GetWindowTextW(hwnd, value.data(), length + 1);
  value.resize(written > 0 ? written : 0);
  return value;
}

std::wstring windowClass(HWND hwnd) {
  wchar_t name[256]{};
  int written = GetClassNameW(hwnd, name, 255);
  return std::wstring(name, written > 0 ? written : 0);
}

// A prove-able application window: visible top-level, owned by a real process,
// not cloaked, not a shell surface. Titles may be empty (some apps) — identity
// is never title-based alone.
bool enumerableAppWindow(HWND hwnd) {
  if (!IsWindowVisible(hwnd) || IsIconic(hwnd)) return false;
  if (GetWindow(hwnd, GW_OWNER) != nullptr) return false;
  LONG_PTR ex = GetWindowLongPtrW(hwnd, GWL_EXSTYLE);
  if (ex & WS_EX_TOOLWINDOW) return false;
  DWORD cloaked = 0;
  if (SUCCEEDED(DwmGetWindowAttribute(hwnd, DWMWA_CLOAKED, &cloaked, sizeof(cloaked))) && cloaked != 0) return false;
  DWORD pid = 0;
  GetWindowThreadProcessId(hwnd, &pid);
  if (pid == 0 || pid == GetCurrentProcessId()) return false; // our own app is not a target
  std::wstring klass = windowClass(hwnd);
  if (klass == L"Progman" || klass == L"WorkerW" || klass == L"Shell_TrayWnd" || klass == L"Shell_SecondaryTrayWnd" || klass == L"DV2ControlHost") return false;
  RECT rect{};
  if (!GetWindowRect(hwnd, &rect)) return false;
  return (rect.right - rect.left) > 0 && (rect.bottom - rect.top) > 0;
}

// ---- Bound-window registry -------------------------------------------------
//
// Each binding holds the item created for the enumerated window. The marker
// links metadata and CreateForWindow to the same window object, including when
// Windows recycles an HWND. Several bindings for that object can share its
// marker. Only the last owner can clear it.

uintptr_t nextBindingSerial() {
  static uintptr_t serial = 0; // STA only
  require(serial != UINTPTR_MAX, "The control bridge has exhausted its binding identifiers.");
  return ++serial;
}

const wchar_t* bindingPropertyName() {
  // One property name per bridge instance bounds the number of property names
  // used by re-listing and keeps cleanup isolated from other processes.
  static auto* name = [] {
    GUID guid{};
    wchar_t text[39]{};
    hr(CoCreateGuid(&guid), "The control bridge cannot create a window marker.");
    require(StringFromGUID2(guid, text, 39) == 39, "The control bridge cannot format a window marker.");
    return new std::wstring(std::wstring(L"GenV1M16Bind-") + text);
  }();
  return name->c_str();
}

struct WindowMarker;
std::unordered_map<HANDLE, std::weak_ptr<WindowMarker>>& windowMarkers() {
  static auto* map = new std::unordered_map<HANDLE, std::weak_ptr<WindowMarker>>();
  return *map;
}

struct WindowMarker {
  WindowMarker(HWND hwnd, HANDLE token, const wchar_t* property)
      : hwnd(hwnd), token(token), property(property) {}
  WindowMarker(const WindowMarker&) = delete;
  WindowMarker& operator=(const WindowMarker&) = delete;

  ~WindowMarker() {
    // All bridge property writes run on the STA. The token check keeps an
    // old owner from clearing the marker on a replacement window.
    if (!installed) return;
    if (matches()) RemovePropW(hwnd, property);
    windowMarkers().erase(token);
  }

  bool matches() const { return installed && GetPropW(hwnd, property) == token; }

  const HWND hwnd;
  const HANDLE token;
  const wchar_t* const property;
  bool installed = false;
};

std::shared_ptr<WindowMarker> markWindow(HWND hwnd) {
  const wchar_t* property = bindingPropertyName();
  auto& markers = windowMarkers();
  if (HANDLE token = GetPropW(hwnd, property)) {
    auto found = markers.find(token);
    if (found == markers.end()) return nullptr;
    auto marker = found->second.lock();
    if (!marker || marker->hwnd != hwnd || !marker->matches()) return nullptr;
    return marker;
  }

  HANDLE token = reinterpret_cast<HANDLE>(nextBindingSerial());
  auto marker = std::make_shared<WindowMarker>(hwnd, token, property);
  if (!SetPropW(hwnd, property, token)) return nullptr;
  marker->installed = true;
  markers.emplace(token, marker);
  return marker;
}

struct HeldBinding {
  std::shared_ptr<WindowMarker> marker;
  wgc::GraphicsCaptureItem item{nullptr};
  std::shared_ptr<std::atomic_bool> closed = std::make_shared<std::atomic_bool>(false);
  wgc::IGraphicsCaptureItem::Closed_revoker closedRevoker;
};

// All registry access stays on the STA. The Closed callback owns only its
// binding's flag, so a late callback can neither access the registry nor
// mark a different binding closed.
//
// Leak the map at process exit: its destructor could otherwise release
// GraphicsCaptureItems after the WinRT apartment is gone. Drop paths release
// resources during runtime. Waiting for an STA drain from env teardown can
// deadlock while ExitProcess serializes the threads.
std::unordered_map<std::string, HeldBinding>& bindings() {
  static auto* map = new std::unordered_map<std::string, HeldBinding>();
  return *map;
}

std::optional<WindowDesc> describe(HWND hwnd) {
  if (!IsWindow(hwnd) || !enumerableAppWindow(hwnd)) return std::nullopt;
  WindowDesc desc{};
  desc.hwnd = hwnd;
  desc.threadId = GetWindowThreadProcessId(hwnd, &desc.pid);
  if (!desc.threadId || !desc.pid) return std::nullopt;
  desc.title = windowText(hwnd);
  if (!GetWindowRect(hwnd, &desc.rect)) return std::nullopt;
  desc.dpi = GetDpiForWindow(hwnd);
  return desc;
}

std::optional<WindowDesc> describeBinding(const HeldBinding& binding) {
  if (binding.closed->load() || !binding.marker->matches()) return std::nullopt;
  auto desc = describe(binding.marker->hwnd);
  if (binding.closed->load() || !binding.marker->matches()) return std::nullopt;
  return desc;
}

// ---- JS marshalling -------------------------------------------------------

std::string utf8(const std::wstring& wide) {
  if (wide.empty()) return {};
  int size = WideCharToMultiByte(CP_UTF8, 0, wide.data(), (int)wide.size(), nullptr, 0, nullptr, nullptr);
  std::string value(size, '\0');
  WideCharToMultiByte(CP_UTF8, 0, wide.data(), (int)wide.size(), value.data(), size, nullptr, nullptr);
  return value;
}

napi_value windowObject(napi_env env, const WindowDesc& desc) {
  napi_value object;
  napi_create_object(env, &object);
  napi_set_named_property(env, object, "handle", ([&] { napi_value v; napi_create_double(env, (double)(intptr_t)desc.hwnd, &v); return v; })());
  napi_set_named_property(env, object, "processId", ([&] { napi_value v; napi_create_uint32(env, desc.pid, &v); return v; })());
  napi_set_named_property(env, object, "title", ([&] { napi_value v; napi_create_string_utf8(env, utf8(desc.title).c_str(), NAPI_AUTO_LENGTH, &v); return v; })());
  napi_value bounds, x, y, w, h;
  napi_create_object(env, &bounds);
  napi_create_int32(env, desc.rect.left, &x);
  napi_create_int32(env, desc.rect.top, &y);
  napi_create_int32(env, desc.rect.right - desc.rect.left, &w);
  napi_create_int32(env, desc.rect.bottom - desc.rect.top, &h);
  napi_set_named_property(env, bounds, "x", x);
  napi_set_named_property(env, bounds, "y", y);
  napi_set_named_property(env, bounds, "width", w);
  napi_set_named_property(env, bounds, "height", h);
  napi_set_named_property(env, object, "bounds", bounds);
  napi_set_named_property(env, object, "dpiScale", ([&] { napi_value v; napi_create_double(env, desc.dpi / 96.0, &v); return v; })());
  napi_set_named_property(env, object, "bindingId", ([&] { napi_value v; napi_create_string_utf8(env, desc.bindingId.c_str(), NAPI_AUTO_LENGTH, &v); return v; })());
  return object;
}

// ---- Async worker ---------------------------------------------------------

struct Work {
  HWND hwnd = nullptr;
  std::string bindingId;
  enum class Kind { Pick, Identity, Capture, List, Drop } kind = Kind::Pick;
  // Results
  bool hasWindow = false;
  WindowDesc window{};
  std::vector<BYTE> png;
  std::vector<WindowDesc> windows;
  uint32_t width = 0, height = 0;
  std::string error;
};

void complete(napi_env env, napi_deferred deferred, const Work& work, bool isNull) {
  napi_value result = nullptr;
  if (work.kind == Work::Kind::List) {
    napi_create_array_with_length(env, work.windows.size(), &result);
    for (size_t i = 0; i < work.windows.size(); ++i) {
      napi_set_element(env, result, (uint32_t)i, windowObject(env, work.windows[i]));
    }
  } else if (isNull) {
    napi_get_null(env, &result);
  } else if (work.kind == Work::Kind::Capture) {
    napi_create_object(env, &result);
    napi_value data;
    void* bytes = nullptr;
    napi_create_buffer_copy(env, work.png.size(), work.png.data(), &bytes, &data);
    memcpy(bytes, work.png.data(), work.png.size());
    napi_set_named_property(env, result, "data", data);
    napi_value w, h;
    napi_create_uint32(env, work.width, &w);
    napi_create_uint32(env, work.height, &h);
    napi_set_named_property(env, result, "width", w);
    napi_set_named_property(env, result, "height", h);
  } else {
    result = windowObject(env, work.window);
  }
  napi_resolve_deferred(env, deferred, result);
}

void reject(napi_env env, napi_deferred deferred, const char* message) {
  napi_value text, error;
  napi_create_string_utf8(env, message, NAPI_AUTO_LENGTH, &text);
  napi_create_error(env, nullptr, text, &error);
  napi_reject_deferred(env, deferred, error);
}

struct PendingWork {
  napi_async_work handle = nullptr;
  napi_deferred deferred = nullptr;
  std::shared_ptr<Work> operation;
  std::future<void> done;
};

void waitForWork(napi_env, void* data) {
  auto& pending = *static_cast<PendingWork*>(data);
  try {
    pending.done.get();
  } catch (const std::future_error&) {
    pending.operation->error = "The control bridge STA thread is unavailable.";
  } catch (const std::exception& error) {
    pending.operation->error = error.what();
  } catch (...) {
    pending.operation->error = "The control bridge operation failed.";
  }
}

void finish(napi_env env, napi_status status, void* data) {
  std::unique_ptr<PendingWork> pending(static_cast<PendingWork*>(data));
  if (status != napi_ok) {
    // A cancelled waiter can complete before the STA. The STA retains its
    // own reference and uses no Node-API objects.
    reject(env, pending->deferred, "The control bridge operation was cancelled.");
  } else {
    const auto& work = *pending->operation;
    if (work.error.empty()) {
      const bool isNull = !work.hasWindow &&
          (work.kind == Work::Kind::Pick || work.kind == Work::Kind::Identity || work.kind == Work::Kind::Drop);
      complete(env, pending->deferred, work, isNull);
    } else {
      reject(env, pending->deferred, work.error.c_str());
    }
  }
  napi_delete_async_work(env, pending->handle);
}

// ---- WinRT execution context ----------------------------------------------

// One STA owns the WinRT apartment and drains a FIFO of Node-API requests.
// Each future belongs to one caller and receives only that job's outcome.
struct StaThread {
  HANDLE pending = nullptr;
  std::mutex lock;
  std::deque<std::packaged_task<void()>> jobs;
  bool failed = false;
};

StaThread& sta() {
  // The dispatcher and its event live as long as the process.
  static auto* instance = new StaThread();
  static std::once_flag once;
  std::call_once(once, [] {
    // The STA is process-owned, including if a Node environment closes.
    HMODULE module = nullptr;
    require(GetModuleHandleExW(GET_MODULE_HANDLE_EX_FLAG_FROM_ADDRESS | GET_MODULE_HANDLE_EX_FLAG_PIN,
        reinterpret_cast<LPCWSTR>(&sta), &module), "The control bridge could not pin its STA module.");
    instance->pending = CreateEventW(nullptr, FALSE, FALSE, nullptr);
    require(instance->pending != nullptr, "The control bridge could not create its STA wake event.");
    HANDLE thread = CreateThread(nullptr, 0, [](void* raw) -> DWORD {
      auto* self = static_cast<StaThread*>(raw);
      try {
        winrt::init_apartment(winrt::apartment_type::single_threaded);
      } catch (...) {
        std::lock_guard guard(self->lock);
        self->failed = true;
        self->jobs.clear();
        return 0;
      }

      for (;;) {
        MSG message{};
        while (PeekMessageW(&message, nullptr, 0, 0, PM_REMOVE)) {
          TranslateMessage(&message);
          DispatchMessageW(&message);
        }

        std::packaged_task<void()> job;
        {
          std::lock_guard guard(self->lock);
          if (!self->jobs.empty()) {
            job = std::move(self->jobs.front());
            self->jobs.pop_front();
          }
        }
        if (job.valid()) {
          job();
          continue; // Drain the queue before waiting on a coalesced wake.
        }
        DWORD wake = MsgWaitForMultipleObjectsEx(1, &self->pending, INFINITE, QS_ALLINPUT, MWMO_INPUTAVAILABLE);
        if (wake != WAIT_OBJECT_0 && wake != WAIT_OBJECT_0 + 1) break;
      }
      {
        std::lock_guard guard(self->lock);
        self->failed = true;
        self->jobs.clear(); // Give waiting callers a broken promise.
      }
      winrt::uninit_apartment();
      return 0;
    }, instance, 0, nullptr);
    if (!thread) {
      CloseHandle(instance->pending);
      instance->pending = nullptr;
      throw std::runtime_error("The control bridge could not start its STA thread.");
    }
    CloseHandle(thread);
  });
  return *instance;
}

void enqueueOnSta(std::packaged_task<void()> job) {
  auto& context = sta();
  std::lock_guard guard(context.lock);
  require(!context.failed, "The control bridge STA thread is unavailable.");
  context.jobs.push_back(std::move(job));
  if (!SetEvent(context.pending)) {
    context.jobs.pop_back();
    throw std::runtime_error("The control bridge could not wake its STA thread.");
  }
}

// ---- Picker ---------------------------------------------------------------

struct PickResult { bool cancelled = false; WindowDesc window{}; std::string error; HWND owner = nullptr; std::string bindingId; };

// HOLD_PICKER_BINDING (D02/D04): the system GraphicsCapturePicker returns a
// GraphicsCaptureItem whose DisplayName/Size are not an authoritative window
// identity, and no public API maps the item back to its HWND. A heuristic
// match against EnumWindows titles or client dimensions cannot prove which
// object the picker returned — a display and a same-sized window are
// indistinguishable — so it was removed and every window operation fails
// closed until an approved same-object binding exists.
void pickOnSta(void* raw) {
  auto* result = static_cast<PickResult*>(raw);
  result->error = "CONTROL_PICKER_BINDING_UNSUPPORTED: the capture picker cannot return an authoritative window identity; selected-window control is held.";
}

// ---- WGC capture ----------------------------------------------------------

// Create a GraphicsCaptureItem for an HWND. Called exactly once per chooser
// row, inside listWindows' enumeration — the returned item is then held in
// the binding registry and is the only object capture sessions may use.
wgc::GraphicsCaptureItem createItemForWindow(HWND hwnd) {
  auto interop = winrt::get_activation_factory<wgc::GraphicsCaptureItem, IGraphicsCaptureItemInterop>();
  wgc::GraphicsCaptureItem item{nullptr};
  hr(interop->CreateForWindow(hwnd, winrt::guid_of<wgc::GraphicsCaptureItem>(), winrt::put_abi(item)), "The selected window cannot be captured.");
  require(bool(item), "The selected window cannot be captured.");
  return item;
}

class WgcSession {
 public:
  // The item arrives already bound (from the held registry entry) — this
  // class never derives a capture object from an HWND.
  explicit WgcSession(const wgc::GraphicsCaptureItem& item) : item_(item) {
    D3D_FEATURE_LEVEL levels[] = {D3D_FEATURE_LEVEL_11_1, D3D_FEATURE_LEVEL_11_0};
    hr(D3D11CreateDevice(nullptr, D3D_DRIVER_TYPE_HARDWARE, nullptr, D3D11_CREATE_DEVICE_BGRA_SUPPORT, levels, 2, D3D11_SDK_VERSION, &device_, nullptr, &context_), "Direct3D is unavailable for capture.");

    ComPtr<IDXGIDevice> dxgi;
    hr(device_.As(&dxgi), "Direct3D is unavailable for capture.");
    ComPtr<::IInspectable> inspectable;
    hr(CreateDirect3D11DeviceFromDXGIDevice(dxgi.Get(), &inspectable), "Direct3D is unavailable for capture.");
    winrt::check_hresult(inspectable->QueryInterface(winrt::guid_of<wdx3::IDirect3DDevice>(), winrt::put_abi(deviceRT_)));

    framePool_ = wgc::Direct3D11CaptureFramePool::CreateFreeThreaded(
        deviceRT_, wdx::DirectXPixelFormat::B8G8R8A8UIntNormalized, 1, item_.Size());
    session_ = framePool_.CreateCaptureSession(item_);
    // Cursor/border toggles exist on Windows 10 2004+; keep them best-effort.
    try { session_.IsCursorCaptureEnabled(false); session_.IsBorderRequired(false); } catch (...) {}
  }

  // Copy one fresh frame into CPU-readable PNG bytes.
  bool grab(std::vector<BYTE>& png, uint32_t& width, uint32_t& height) {
    wgc::Direct3D11CaptureFrame frame{nullptr};
    {
      struct FrameArrival {
        std::mutex mutex;
        std::condition_variable changed;
        bool ready = false;
      };
      auto arrival = std::make_shared<FrameArrival>();
      // An in-flight callback may outlive revocation. It only signals arrival
      // through shared state. The STA alone reads the pool and frame.
      struct FrameSubscription {
        wgc::Direct3D11CaptureFramePool& pool;
        winrt::event_token token;
        ~FrameSubscription() { pool.FrameArrived(token); }
      } subscription{framePool_, framePool_.FrameArrived([arrival](auto&&, auto&&) {
        std::lock_guard lock(arrival->mutex);
        arrival->ready = true;
        arrival->changed.notify_one();
      })};

      session_.StartCapture();
      const auto deadline = std::chrono::steady_clock::now() + std::chrono::seconds(10);
      // This lock unwinds before the subscription revokes the callback.
      std::unique_lock lock(arrival->mutex);
      while (arrival->changed.wait_until(lock, deadline, [&] { return arrival->ready; })) {
        arrival->ready = false;
        lock.unlock();
        frame = framePool_.TryGetNextFrame();
        if (frame || std::chrono::steady_clock::now() >= deadline) break;
        lock.lock();
      }
    }
    if (!frame) return false;
    const auto size = frame.ContentSize();
    require(size.Width > 0 && size.Height > 0, "The captured content is empty.");

    ComPtr<ID3D11Texture2D> source;
    ComPtr<IDirect3DDxgiInterfaceAccess> access;
    winrt::check_hresult(reinterpret_cast<IInspectable*>(winrt::get_abi(frame.Surface()))->QueryInterface(IID_PPV_ARGS(&access)));
    hr(access->GetInterface(IID_PPV_ARGS(&source)), "The captured frame is unreadable.");

    D3D11_TEXTURE2D_DESC desc{};
    source->GetDesc(&desc);
    // The pool keeps its original texture size. On shrink only the
    // top-left content rectangle is defined, and on growth it may be clipped.
    const UINT contentWidth = static_cast<UINT>(size.Width);
    const UINT contentHeight = static_cast<UINT>(size.Height);
    require(contentWidth <= desc.Width && contentHeight <= desc.Height, "The captured content exceeds the frame texture.");
    require(desc.Format == DXGI_FORMAT_B8G8R8A8_UNORM &&
            contentWidth <= std::numeric_limits<UINT>::max() / 4 / contentHeight, "Unsupported captured frame layout.");
    const UINT stride = contentWidth * 4;
    std::vector<BYTE> pixels(static_cast<size_t>(stride) * contentHeight);
    desc.CPUAccessFlags = D3D11_CPU_ACCESS_READ;
    desc.Usage = D3D11_USAGE_STAGING;
    desc.BindFlags = 0;
    desc.MiscFlags = 0;
    ComPtr<ID3D11Texture2D> staging;
    hr(device_->CreateTexture2D(&desc, nullptr, &staging), "The captured frame is unreadable.");
    context_->CopyResource(staging.Get(), source.Get());
    D3D11_MAPPED_SUBRESOURCE mapped{};
    hr(context_->Map(staging.Get(), 0, D3D11_MAP_READ, 0, &mapped), "The captured frame is unreadable.");
    if (!mapped.pData || mapped.RowPitch < stride) {
      context_->Unmap(staging.Get(), 0);
      throw std::runtime_error("The mapped frame cannot hold the captured content.");
    }
    for (uint32_t row = 0; row < contentHeight; ++row) {
      memcpy(pixels.data() + static_cast<size_t>(row) * stride,
          static_cast<const BYTE*>(mapped.pData) + static_cast<size_t>(row) * mapped.RowPitch, stride);
    }
    context_->Unmap(staging.Get(), 0);

    // PNG encode via WIC — software bitmap round trip keeps a documented codec.
    ComPtr<IWICImagingFactory> wic;
    hr(CoCreateInstance(CLSID_WICImagingFactory, nullptr, CLSCTX_INPROC_SERVER, IID_PPV_ARGS(&wic)), "The PNG encoder is unavailable.");
    ComPtr<IWICBitmap> bitmap;
    hr(wic->CreateBitmapFromMemory(contentWidth, contentHeight, GUID_WICPixelFormat32bppBGRA, stride, (UINT)pixels.size(), pixels.data(), &bitmap), "The captured frame is unreadable.");
    ComPtr<IWICStream> stream;
    hr(wic->CreateStream(&stream), "The PNG encoder is unavailable.");
    ComPtr<IStream> memory;
    hr(CreateStreamOnHGlobal(nullptr, TRUE, memory.GetAddressOf()), "The PNG encoder is unavailable.");
    hr(stream->InitializeFromIStream(memory.Get()), "The PNG encoder is unavailable.");
    ComPtr<IWICBitmapEncoder> encoder;
    hr(wic->CreateEncoder(GUID_ContainerFormatPng, nullptr, &encoder), "The PNG encoder is unavailable.");
    hr(encoder->Initialize(stream.Get(), WICBitmapEncoderNoCache), "The PNG encoder is unavailable.");
    ComPtr<IWICBitmapFrameEncode> frameEncode;
    hr(encoder->CreateNewFrame(&frameEncode, nullptr), "The PNG encoder is unavailable.");
    hr(frameEncode->Initialize(nullptr), "The PNG encoder is unavailable.");
    hr(frameEncode->SetSize(contentWidth, contentHeight), "The PNG encoder is unavailable.");
    WICPixelFormatGUID format = GUID_WICPixelFormat32bppBGRA;
    hr(frameEncode->SetPixelFormat(&format), "The PNG encoder is unavailable.");
    require(format == GUID_WICPixelFormat32bppBGRA, "The PNG encoder is unavailable.");
    hr(frameEncode->WriteSource(bitmap.Get(), nullptr), "The PNG encoder is unavailable.");
    hr(frameEncode->Commit(), "The PNG encoder is unavailable.");
    hr(encoder->Commit(), "The PNG encoder is unavailable.");
    STATSTG stats{};
    hr(memory->Stat(&stats, STATFLAG_NONAME), "The PNG encoder is unavailable.");
    png.resize((size_t)stats.cbSize.QuadPart);
    LARGE_INTEGER zero{};
    hr(memory->Seek(zero, STREAM_SEEK_SET, nullptr), "The PNG encoder is unavailable.");
    ULONG read = 0;
    hr(memory->Read(png.data(), (ULONG)png.size(), &read), "The PNG encoder is unavailable.");
    require(read == png.size(), "The PNG encoder is unavailable.");
    width = contentWidth;
    height = contentHeight;
    return true;
  }

  ~WgcSession() {
    try { session_.Close(); } catch (...) {}
    try { framePool_.Close(); } catch (...) {}
  }

 private:
  wgc::GraphicsCaptureItem item_{nullptr};
  ComPtr<ID3D11Device> device_;
  ComPtr<ID3D11DeviceContext> context_;
  wdx3::IDirect3DDevice deviceRT_{nullptr};
  wgc::Direct3D11CaptureFramePool framePool_{nullptr};
  wgc::GraphicsCaptureSession session_{nullptr};
};

// Capture uses the held binding's already-created item — the HWND is only
// consulted for liveness revalidation, never to construct a capture object,
// so HWND recycling cannot redirect capture to a different window.
struct CaptureResult { std::vector<BYTE> png; uint32_t width = 0, height = 0; std::string error; std::string bindingId; };

void captureOnSta(void* raw) {
  auto* result = static_cast<CaptureResult*>(raw);
  try {
    auto found = bindings().find(result->bindingId);
    if (found == bindings().end()) {
      result->error = "The selected window binding is closed; the target no longer exists or cannot be re-proven.";
      return;
    }
    auto& binding = found->second;
    if (!describeBinding(binding)) {
      bindings().erase(found);
      result->error = "The selected window binding is closed; the target no longer exists or cannot be re-proven.";
      return;
    }
    bool hasFrame;
    {
      WgcSession session(binding.item);
      hasFrame = session.grab(result->png, result->width, result->height);
    }
    const bool bindingLost = binding.closed->load() || !binding.marker->matches();
    if (bindingLost || !hasFrame) {
      // Terminal frame starvation ends the binding after the session releases it.
      bindings().erase(found);
      result->error = bindingLost ? "The selected window binding closed during capture."
                                  : "The selected window produced no capturable frame.";
    }
  } catch (const winrt::hresult_error& error) {
    result->error = "Window capture failed: " + utf8(std::wstring(error.message().c_str(), error.message().size()));
  } catch (const std::exception& error) {
    result->error = error.what();
  } catch (...) {
    result->error = "Window capture failed.";
  }
}

void identityOnSta(void* raw) {
  auto* result = static_cast<PickResult*>(raw);
  auto found = bindings().find(result->bindingId);
  if (found == bindings().end()) { result->cancelled = true; return; }
  auto desc = describeBinding(found->second);
  if (!desc) { result->cancelled = true; return; }
  desc->bindingId = result->bindingId;
  result->window = std::move(*desc);
}

constexpr size_t kMaxChooserRows = 64;
constexpr size_t kMaxHeldWindowBindings = 256;

struct ListResult { std::vector<WindowDesc> windows; std::string error; };

BOOL CALLBACK bindEnumeratedWindow(HWND hwnd, LPARAM param) {
  auto& rows = *reinterpret_cast<std::vector<WindowDesc>*>(param);
  try {
    if (rows.size() >= kMaxChooserRows || bindings().size() >= kMaxHeldWindowBindings) return TRUE;
    if (!enumerableAppWindow(hwnd)) return TRUE;
    auto marker = markWindow(hwnd);
    if (!marker || !marker->matches()) return TRUE;

    auto desc = describe(hwnd);
    if (!desc || !marker->matches()) return TRUE;

    HeldBinding binding{};
    binding.marker = std::move(marker);
    binding.item = createItemForWindow(hwnd);
    binding.closedRevoker = binding.item.Closed(winrt::auto_revoke, [closed = binding.closed](auto&&, auto&&) {
      closed->store(true);
    });
    if (binding.closed->load() || !binding.marker->matches()) return TRUE;

    char id[32];
    snprintf(id, sizeof(id), "wgc-%llx", static_cast<unsigned long long>(nextBindingSerial()));
    desc->bindingId = id;
    auto [entry, inserted] = bindings().try_emplace(desc->bindingId, std::move(binding));
    if (!inserted) return TRUE;
    try {
      rows.push_back(std::move(*desc));
    } catch (...) {
      bindings().erase(entry);
      throw;
    }
  } catch (...) {
    // Windows that cannot be proven are excluded from the chooser.
  }
  return TRUE;
}

void listOnSta(void* raw) {
  auto* result = static_cast<ListResult*>(raw);
  if (!EnumWindows(bindEnumeratedWindow, reinterpret_cast<LPARAM>(&result->windows))) {
    for (const auto& row : result->windows) bindings().erase(row.bindingId);
    result->windows.clear();
    result->error = "Window enumeration failed.";
  }
}

void dropOnSta(void* raw) {
  auto* result = static_cast<PickResult*>(raw);
  bindings().erase(result->bindingId);
}

// ---- napi entry points ----------------------------------------------------

void runOnSta(Work& work) {
  switch (work.kind) {
    case Work::Kind::Pick:
    case Work::Kind::Identity: {
      PickResult result{};
      result.owner = work.hwnd;
      result.bindingId = work.bindingId;
      if (work.kind == Work::Kind::Pick) pickOnSta(&result);
      else identityOnSta(&result);
      work.error = std::move(result.error);
      work.hasWindow = work.error.empty() && !result.cancelled;
      if (work.hasWindow) work.window = std::move(result.window);
      break;
    }
    case Work::Kind::List: {
      ListResult result{};
      listOnSta(&result);
      work.error = std::move(result.error);
      work.windows = std::move(result.windows);
      break;
    }
    case Work::Kind::Drop: {
      PickResult result{};
      result.bindingId = work.bindingId;
      dropOnSta(&result);
      break;
    }
    case Work::Kind::Capture: {
      CaptureResult result{};
      result.bindingId = work.bindingId;
      captureOnSta(&result);
      work.error = std::move(result.error);
      work.png = std::move(result.png);
      work.width = result.width;
      work.height = result.height;
      break;
    }
  }
}

napi_value queueWork(napi_env env, Work operation) {
  auto pending = std::make_unique<PendingWork>();
  pending->operation = std::make_shared<Work>(std::move(operation));
  std::packaged_task<void()> job([work = pending->operation] { runOnSta(*work); });
  pending->done = job.get_future();

  napi_value promise, name;
  if (napi_create_promise(env, &pending->deferred, &promise) != napi_ok) {
    napi_throw_error(env, nullptr, "The control bridge could not create a promise.");
    return nullptr;
  }
  if (napi_create_string_utf8(env, "gen-v1-control-bridge", NAPI_AUTO_LENGTH, &name) != napi_ok ||
      napi_create_async_work(env, nullptr, name, waitForWork, finish, pending.get(), &pending->handle) != napi_ok ||
      napi_queue_async_work(env, pending->handle) != napi_ok) {
    if (pending->handle) napi_delete_async_work(env, pending->handle);
    reject(env, pending->deferred, "The control bridge could not queue an operation.");
    return promise;
  }
  pending.release(); // The complete callback now owns the waiter.

  // Publish from the Node-API entry point. A libuv worker only waits for
  // its own result, so worker startup order cannot reorder the STA queue.
  try {
    enqueueOnSta(std::move(job));
  } catch (...) {
    // The abandoned packaged task wakes the waiter with a broken promise.
  }
  return promise;
}

napi_value pickWindow(napi_env env, napi_callback_info info) {
  napi_value argv[1] = {nullptr};
  size_t argc = 1;
  napi_get_cb_info(env, info, &argc, argv, nullptr, nullptr);
  Work work{};
  work.kind = Work::Kind::Pick;
  napi_valuetype type = napi_undefined;
  if (argc > 0) napi_typeof(env, argv[0], &type);
  if (type == napi_object) { // Buffer with the owner HWND bytes
    void* data = nullptr;
    size_t length = 0;
    if (napi_get_buffer_info(env, argv[0], &data, &length) == napi_ok && data && length >= sizeof(intptr_t)) {
      work.hwnd = (HWND)(intptr_t)*(uint64_t*)data;
    }
  }
  return queueWork(env, std::move(work));
}

std::string bindingArg(napi_env env, napi_callback_info info) {
  napi_value argv[1] = {nullptr};
  size_t argc = 1;
  napi_get_cb_info(env, info, &argc, argv, nullptr, nullptr);
  char buffer[64]{};
  size_t length = 0;
  if (argc > 0) napi_get_value_string_utf8(env, argv[0], buffer, sizeof(buffer) - 1, &length);
  return std::string(buffer, length);
}

napi_value windowIdentity(napi_env env, napi_callback_info info) {
  Work work{};
  work.kind = Work::Kind::Identity;
  work.bindingId = bindingArg(env, info);
  return queueWork(env, std::move(work));
}

napi_value captureWindow(napi_env env, napi_callback_info info) {
  Work work{};
  work.kind = Work::Kind::Capture;
  work.bindingId = bindingArg(env, info);
  return queueWork(env, std::move(work));
}

napi_value dropBindingOp(napi_env env, napi_callback_info info) {
  Work work{};
  work.kind = Work::Kind::Drop;
  work.bindingId = bindingArg(env, info);
  return queueWork(env, std::move(work));
}

// App-owned consent chooser feed: rows of live enumerable application windows
// — each carrying an opaque bindingId naming the capture item bound for that
// exact window object inside this call (identity is the held item, never a
// derived hwnd/pid match).
napi_value listWindows(napi_env env, napi_callback_info) {
  Work work{};
  work.kind = Work::Kind::List;
  return queueWork(env, std::move(work));
}

napi_value init(napi_env env, napi_value exports) {
  napi_set_named_property(env, exports, "pickWindow", ([&] { napi_value f; napi_create_function(env, "pickWindow", NAPI_AUTO_LENGTH, pickWindow, nullptr, &f); return f; })());
  napi_set_named_property(env, exports, "listWindows", ([&] { napi_value f; napi_create_function(env, "listWindows", NAPI_AUTO_LENGTH, listWindows, nullptr, &f); return f; })());
  napi_set_named_property(env, exports, "windowIdentity", ([&] { napi_value f; napi_create_function(env, "windowIdentity", NAPI_AUTO_LENGTH, windowIdentity, nullptr, &f); return f; })());
  napi_set_named_property(env, exports, "captureWindow", ([&] { napi_value f; napi_create_function(env, "captureWindow", NAPI_AUTO_LENGTH, captureWindow, nullptr, &f); return f; })());
  napi_set_named_property(env, exports, "dropBinding", ([&] { napi_value f; napi_create_function(env, "dropBinding", NAPI_AUTO_LENGTH, dropBindingOp, nullptr, &f); return f; })());
  return exports;
}

} // namespace

NAPI_MODULE(NODE_GYP_MODULE_NAME, init)
