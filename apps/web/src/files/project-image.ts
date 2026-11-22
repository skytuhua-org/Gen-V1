import { ApiError, authenticated, read } from "../api";

export type ProjectImageKind = "raster" | "svg";
export interface ProjectImage {
	blob: Blob;
	sha256: string;
	bytes: number;
}

export const IMAGE_BYTE_LIMIT = 10 * 1024 * 1024;

const IMAGE_KINDS: Record<string, ProjectImageKind> = {
	".png": "raster",
	".jpg": "raster",
	".jpeg": "raster",
	".gif": "raster",
	".webp": "raster",
	".svg": "svg",
};
export const imageKindFor = (name: string): ProjectImageKind | null => {
	const dot = name.lastIndexOf(".");
	return dot < 0 ? null : (IMAGE_KINDS[name.slice(dot).toLowerCase()] ?? null);
};

const byteFormat = new Intl.NumberFormat(undefined, {
	maximumFractionDigits: 1,
});
export const formatImageBytes = (bytes: number) =>
	bytes < 1024
		? `${bytes} B`
		: bytes < 1024 * 1024
			? `${byteFormat.format(bytes / 1024)} KB`
			: `${byteFormat.format(bytes / (1024 * 1024))} MB`;

const tooLarge = () =>
	new ApiError("RESOURCE_LIMIT", "Image preview is limited to 10 MiB.");

export async function readProjectImage(
	base: string,
	query: string,
	path: string,
	signal: AbortSignal,
): Promise<ProjectImage> {
	const params = new URLSearchParams(query);
	params.set("path", path);
	const response = await authenticated(() =>
		fetch(base + "/file/image?" + params, {
			credentials: "same-origin",
			cache: "no-store",
			signal,
		}),
	);
	if (!response.ok) await read(response);
	const length = Number(response.headers.get("Content-Length") ?? "0");
	if (length > IMAGE_BYTE_LIMIT) throw tooLarge();
	const blob = await response.blob();
	if (blob.size > IMAGE_BYTE_LIMIT) throw tooLarge();
	return {
		blob,
		sha256: response.headers.get("X-File-Sha256") ?? "",
		bytes: blob.size,
	};
}
