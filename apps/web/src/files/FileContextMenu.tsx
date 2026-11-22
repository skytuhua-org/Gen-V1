import {
	useRef,
	type KeyboardEvent,
	type ReactNode,
	type RefObject,
} from "react";
import { ExternalLink, FolderOpen, FolderSearch } from "lucide-react";
import { Popover } from "../../../../packages/ui-shell/Popover";
import type { OverlayAnchor } from "../../../../packages/ui-shell/overlay-position";
import { useListNavigation } from "../../../../packages/ui-shell/list-navigation";
import { desktopOpenBlocked } from "../../../../packages/desktop-contract/index.ts";
import { displayFilePath, type FilesEntry } from "./FilesView";

export type FileMenuAction = "reveal" | "open";
export const openDisabledTitle =
	"Open is turned off for programs and scripts. Use Show in File Explorer.";

interface MenuItem {
	id: FileMenuAction;
	label: string;
	icon: ReactNode;
	disabled?: boolean;
	title?: string;
}

export function fileMenuItems(entry: FilesEntry): MenuItem[] {
	const folder = entry.kind === "directory";
	return [
		{
			id: "reveal",
			label: "Show in File Explorer",
			icon: <FolderSearch size={14} aria-hidden="true" />,
		},
		{
			id: "open",
			label: folder ? "Open folder" : "Open with default app",
			icon: folder ? (
				<FolderOpen size={14} aria-hidden="true" />
			) : (
				<ExternalLink size={14} aria-hidden="true" />
			),
			disabled: !folder && desktopOpenBlocked(entry.name),
			title:
				!folder && desktopOpenBlocked(entry.name)
					? openDisabledTitle
					: undefined,
		},
	];
}

export function FileContextMenu({
	entry,
	anchor,
	getAnchorRect,
	open,
	onClose,
	run,
}: {
	entry: FilesEntry;
	anchor: RefObject<HTMLElement | null>;
	getAnchorRect?: () => OverlayAnchor;
	open: boolean;
	onClose: () => void;
	run: (action: FileMenuAction) => void;
}) {
	const content = useRef<HTMLDivElement>(null);
	const items = fileMenuItems(entry);
	const close = () => {
		onClose();
		anchor.current?.focus();
	};
	const choose = (index: number) => {
		const item = items[index];
		if (!item || item.disabled) return;
		onClose();
		run(item.id);
	};
	const navigation = useListNavigation(items, choose, close);
	return (
		<Popover
			anchor={anchor}
			getAnchorRect={getAnchorRect}
			contentRef={content}
			open={open}
			width={248}
			height={items.length * 36 + 26}
			preferredSide="below"
			role="menu"
			aria-label={`Actions for ${displayFilePath(entry.name)}`}
			tabIndex={-1}
			className="ui-control-popup files-context-menu"
			onDismiss={onClose}
			onKeyDown={(event: KeyboardEvent) => navigation.onKeyDown(event)}
			onReady={() => {
				content.current?.focus();
				navigation.focus(navigation.edge());
			}}
		>
			{items.map((item, index) => (
				<button
					key={item.id}
					ref={(node) => {
						navigation.rows.current[index] = node;
					}}
					type="button"
					tabIndex={-1}
					role="menuitem"
					title={item.title}
					disabled={item.disabled}
					className="ui-control-option"
					onFocus={() => navigation.onFocus(index)}
					onClick={() => choose(index)}
				>
					{item.icon}
					<span>{item.label}</span>
				</button>
			))}
		</Popover>
	);
}
