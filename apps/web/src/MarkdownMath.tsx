import {useEffect, useLayoutEffect, useMemo, useRef} from 'react';
import {CopyButton} from './CopyButton';
import type {MathSpan} from './markdown-math';
import {createMathRenderQueue, MATH_RENDER_QUEUE_LIMITS, type MathRenderHandle, type MathRenderQueue} from './math-render-queue';
import './markdown-math.css';

export interface MathRenderOwner {
  queue: MathRenderQueue;
  registerPending: (leafKey: string, target: HTMLElement) => () => void;
}

export interface MarkdownMathProps {
  span: MathSpan;
  leafKey: string;
  ownerKey: string;
  sourceRevision: number;
  owner: MathRenderOwner;
}

const noopHandle = {cancel() {}, release() {}};
let enginePromise: Promise<typeof import('./math-renderer')> | undefined;

function createOwner() {
  let queue: MathRenderQueue | undefined;
  let observer: MutationObserver | undefined;
  let pendingDocument: Document | undefined;
  const pending = new Map<string, {target: HTMLElement}>();
  const resume = () => queue?.resume();

  function disconnect() {
    observer?.disconnect();
    observer = undefined;
    pendingDocument?.removeEventListener('selectionchange', resume);
    pendingDocument?.removeEventListener('visibilitychange', resume);
    pendingDocument?.defaultView?.removeEventListener('resize', resume);
    pendingDocument = undefined;
  }

  function observeTargets() {
    observer?.disconnect();
    const targets = new Set<Element>();
    for (const {target} of pending.values()) {
      for (let element: Element | null = target; element && !targets.has(element); element = element.parentElement) {
        targets.add(element);
        observer?.observe(element, {
          attributes: true,
          attributeFilter: ['hidden', 'inert', 'aria-hidden', 'class', 'style', 'open'],
          childList: true,
        });
      }
    }
  }

  const owner: MathRenderOwner = {
    queue: {
      enqueue: job => queue?.enqueue(job) ?? noopHandle,
      invalidate: (key, revision) => queue?.invalidate(key, revision),
      resume,
      dispose: () => {
        queue?.dispose();
        queue = undefined;
        disconnect();
        pending.clear();
      },
    },
    registerPending(key, target) {
      if (!queue || pending.size >= MATH_RENDER_QUEUE_LIMITS.maxPendingJobs) return () => {};
      if (!pendingDocument) {
        pendingDocument = target.ownerDocument;
        pendingDocument.addEventListener('selectionchange', resume);
        pendingDocument.addEventListener('visibilitychange', resume);
        pendingDocument.defaultView?.addEventListener('resize', resume);
        observer = new MutationObserver(records => {
          if (records.some(record => record.type === 'childList')) observeTargets();
          resume();
        });
      }
      const registration = {target};
      pending.set(key, registration);
      observeTargets();
      return () => {
        if (pending.get(key) !== registration) return;
        pending.delete(key);
        if (pending.size === 0) disconnect();
        else observeTargets();
      };
    },
  };

  return {
    owner,
    start(key: string, revision: number) {
      queue = createMathRenderQueue(key, revision);
    },
  };
}

export function useMathRenderOwner(ownerKey: string, sourceRevision: number, enabled: boolean): MathRenderOwner {
  const holder = useMemo(createOwner, [ownerKey, enabled]);
  const revision = useRef(sourceRevision);
  useLayoutEffect(() => {
    if (enabled) holder.start(ownerKey, revision.current);
    return holder.owner.queue.dispose;
  }, [enabled, holder, ownerKey]);
  useLayoutEffect(() => {
    revision.current = sourceRevision;
    holder.owner.queue.invalidate(ownerKey, sourceRevision);
  }, [holder, ownerKey, sourceRevision]);
  return holder.owner;
}

function isEligible(root: HTMLElement) {
  const document = root.ownerDocument;
  if (!root.isConnected || document.hidden || root.closest('[hidden], [inert], [aria-hidden="true"]')) return false;
  if (!root.checkVisibility({visibilityProperty:true, opacityProperty:true})) return false;
  const selection = document.getSelection();
  if (!selection || selection.isCollapsed) return true;
  for (let index = 0; index < selection.rangeCount; index++) {
    if (selection.getRangeAt(index).intersectsNode(root)) return false;
  }
  return true;
}

export function MarkdownMath({span, leafKey, ownerKey, sourceRevision, owner}: MarkdownMathProps) {
  const {raw, tex, mode} = span;
  const rootRef = useRef<HTMLElement>(null);
  const sourceRef = useRef<HTMLSpanElement>(null);
  const outputRef = useRef<HTMLSpanElement>(null);
  const failureRef = useRef<HTMLSpanElement>(null);
  const accepted = useRef<MathRenderHandle | null>(null);
  const failed = useRef(false);
  const generation = useRef(0);
  const revision = useRef(sourceRevision);
  const display = mode === 'display';

  useLayoutEffect(() => {
    revision.current = sourceRevision;
  }, [sourceRevision]);

  useLayoutEffect(() => {
    const output = outputRef.current;
    const source = sourceRef.current;
    const failure = failureRef.current;
    return () => {
      generation.current++;
      if (output) {
        output.replaceChildren();
        output.hidden = true;
      }
      if (source) source.hidden = false;
      if (failure) failure.hidden = true;
      accepted.current?.release();
      accepted.current = null;
      failed.current = false;
    };
  }, [owner, ownerKey, leafKey, raw, tex, mode]);

  useEffect(() => {
    const root = rootRef.current;
    const source = sourceRef.current;
    const output = outputRef.current;
    const failure = failureRef.current;
    if (!root || !source || !output || accepted.current || failed.current) return;

    const currentGeneration = generation.current;
    let cancelled = false;
    let loading = false;
    let renderMath: typeof import('./math-renderer').renderMath | undefined;
    let loadFailed = false;
    let detached: HTMLSpanElement | undefined;
    const isCurrent = () => !cancelled && generation.current === currentGeneration &&
      revision.current === sourceRevision &&
      root.isConnected && rootRef.current === root && outputRef.current === output;
    const unregister = owner.registerPending(leafKey, root);
    const job = {
      ownerKey, sourceRevision, leafKey, raw, mode, tex, isCurrent,
      eligible() {
        if (!isEligible(root)) return false;
        if (!loading) {
          loading = true;
          enginePromise ??= import('./math-renderer');
          void enginePromise.then(engine => {
            if (isCurrent()) renderMath = engine.renderMath;
          }, () => {
            if (isCurrent()) loadFailed = true;
          }).then(() => {
            if (isCurrent()) owner.queue.resume();
          });
        }
        return Boolean(renderMath || loadFailed);
      },
      render(remainingNodes: number) {
        if (!renderMath) return {kind:'source', reason:'engine'} as const;
        detached = root.ownerDocument.createElement('span');
        detached.dataset.sourceTransformed = 'true';
        // The transformed wrapper is connected with the engine's descendants.
        const result = renderMath(tex, mode, detached, Math.min(
          remainingNodes, MATH_RENDER_QUEUE_LIMITS.maxPerResult,
        ) - 1);
        return result.kind === 'rendered' ? {...result, elements:result.elements + 1} : result;
      },
      commit() {
        if (!detached) throw new Error('Missing rendered formula');
        output.replaceChildren(detached);
        detached = undefined;
        output.hidden = false;
        source.hidden = true;
        accepted.current = handle;
        unregister();
      },
      fail() {
        detached = undefined;
        failed.current = true;
        if (failure) failure.hidden = false;
        unregister();
      },
    };
    const handle = owner.queue.enqueue(job);
    return () => {
      cancelled = true;
      handle.cancel();
      unregister();
    };
  }, [owner, ownerKey, leafKey, raw, tex, mode, sourceRevision]);

  const Leaf = display ? 'div' : 'span';
  return <Leaf ref={node => {rootRef.current = node;}} data-markdown-math={mode}>
    <span ref={sourceRef} className="markdown-math-source">{raw}</span>
    <span ref={outputRef} className="markdown-math-output" hidden
      role={display ? 'region' : undefined} aria-label={display ? 'Rendered formula' : undefined}
      tabIndex={display ? 0 : undefined} />
    {display && <>
      <span ref={failureRef} className="markdown-math-failure" data-source-selection-ui hidden>Math display unavailable. Source shown.</span>
      <details className="markdown-math-disclosure" data-source-selection-ui>
        <summary>Formula source</summary>
        <pre>{raw}</pre>
        <CopyButton text={raw} label="Copy formula source" />
      </details>
    </>}
  </Leaf>;
}
