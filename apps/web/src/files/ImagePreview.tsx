import { useEffect, useState } from "react";
import { formatImageBytes, type ProjectImage } from "./project-image";

export type FilesMode = "fit" | "actual" | "source";
export const imageModeOptions = (
	svg: boolean,
): { value: FilesMode; label: string }[] =>
	svg
		? [
				{ value: "fit", label: "Fit" },
				{ value: "actual", label: "100%" },
				{ value: "source", label: "Source" },
			]
		: [
				{ value: "fit", label: "Fit" },
				{ value: "actual", label: "100%" },
			];

export function FilesModeToggle({
	options,
	value,
	onChange,
}: {
	options: { value: FilesMode; label: string }[];
	value: FilesMode;
	onChange: (mode: FilesMode) => void;
}) {
	return (
		<span className="files-mode-toggle" role="group" aria-label="Image zoom">
			{options.map((option) => (
				<button
					key={option.value}
					type="button"
					aria-pressed={value === option.value}
					onClick={() => onChange(option.value)}
				>
					{option.label}
				</button>
			))}
		</span>
	);
}

export function ProjectImagePreview({
	name,
	image,
	svg,
	mode,
	onMode,
}: {
	name: string;
	image: ProjectImage;
	svg: boolean;
	mode: FilesMode;
	onMode: (mode: FilesMode) => void;
}) {
	const [url, setUrl] = useState("");
	const [size, setSize] = useState<{
		width: number;
		height: number;
	} | null>(null);
	const [empty, setEmpty] = useState(false);
	const [failed, setFailed] = useState(false);
	useEffect(() => {
		const next = URL.createObjectURL(image.blob);
		setUrl(next);
		setFailed(false);
		setEmpty(false);
		return () => URL.revokeObjectURL(next);
	}, [image.blob]);
	const actual = size
		? { width: size.width || 300, height: size.height || 150 }
		: null;
	// Browsers give some SVGs (no width/height attributes) a zero-size render box;
	// then Fit means the whole stage since the vector scales losslessly.
	const style =
		mode === "actual" && actual
			? {
					width: `${actual.width}px`,
					height: `${actual.height}px`,
					maxWidth: "none",
					maxHeight: "none",
				}
			: empty
				? { width: "100%", height: "100%" }
				: undefined;
	return (
		<div className="files-image">
			<div className="files-image-bar">
				<FilesModeToggle
					options={imageModeOptions(svg)}
					value={mode}
					onChange={onMode}
				/>
				<span className="files-image-meta">
					{size
						? `${
								size.width === 0
									? "SVG (no fixed size)"
									: `${size.width} × ${size.height} px`
							} · `
						: ""}
					<span className="files-image-size">
						{formatImageBytes(image.bytes)}
					</span>
				</span>
			</div>
			<div className="files-image-stage" data-mode={mode}>
				{failed ? (
					<p className="files-message files-error">
						This image could not be decoded.
					</p>
				) : url ? (
					<img
						src={url}
						alt={name}
						decoding="async"
						draggable={false}
						data-loaded={size ? "true" : undefined}
						style={style}
						onLoad={(event) => {
							const element = event.currentTarget;
							setSize({
								width: element.naturalWidth,
								height: element.naturalHeight,
							});
							requestAnimationFrame(() =>
								requestAnimationFrame(() =>
									setEmpty(
										element.getBoundingClientRect().width === 0,
									),
								),
							);
						}}
						onError={() => setFailed(true)}
					/>
				) : null}
			</div>
		</div>
	);
}
