import { useState } from "react";
import { createRoot } from "react-dom/client";
import type { Snapshot } from "../../packages/contracts";
import { WorkspaceSurfaceBody } from "../../apps/web/src/WorkspaceSurfaceBody";
import { Toaster } from "../../packages/ui-shell/Toast";
import { taskFixture } from "./task-interface-fixture";
import "../../apps/web/src/styles.css";

const params = new URLSearchParams(location.search);
const source = taskFixture({
	root: "text",
	elements: {
		text: { type: "Text", props: { text: "Synthetic Files fixture" } },
	},
});
source.artifacts = [];
source.resources = params.has("no-grants")
	? []
	: ([
			{ id: "grant-a", threadId: "task-thread", label: "Alpha grant" },
			{ id: "grant-b", threadId: "task-thread", label: "Beta grant" },
			{ id: "other-grant", threadId: "other-thread", label: "Other owner" },
		] as Snapshot["resources"]);
function Fixture() {
	const [threadId, setThread] = useState("task-thread"),
		[projectId, setProject] = useState("project-one"),
		[active, setActive] = useState(true),
		[preferred, setPreferred] = useState(params.get("preferred") ?? undefined);
	const snapshot = { ...source, activeThreadId: threadId };
	return (
		<>
			<p>Synthetic production Files renderer · no live resources</p>
			<Toaster />
			<div className="fixture-controls">
				<button
					onClick={() =>
						setThread((value) =>
							value === "task-thread" ? "other-thread" : "task-thread",
						)
					}
				>
					Switch thread
				</button>
				<button
					onClick={() =>
						setProject((value) =>
							value === "project-one" ? "project-two" : "project-one",
						)
					}
				>
					Switch project
				</button>
				<button onClick={() => setActive((value) => !value)}>
					Toggle active
				</button>
				<button onClick={() => setPreferred("grant-b")}>
					Prefer Beta grant
				</button>
			</div>
			<div
				data-testid="files-owner"
				style={{
					width: Number(params.get("width") ?? 920),
					height: 540,
					maxWidth: "100%",
					border: "1px solid var(--border)",
				}}
			>
				<WorkspaceSurfaceBody
					kind="files"
					binding={{
						authority: { kind: "local" },
						threadId,
						...(!params.has("granted") ? { projectId } : {}),
						...(preferred ? { resourceId: preferred } : {}),
					}}
					snapshot={snapshot}
					refresh={async () => {}}
					active={active}
				/>
			</div>
		</>
	);
}
declare global {
	interface Window {
		__projectPathCalls?: {
			projectId: string;
			threadId?: string;
			path: string;
			action: string;
		}[];
	}
}
if (params.has("bridge")) {
	window.__projectPathCalls = [];
	window.harnessDesktop = {
		projectPath: (request: {
			projectId: string;
			threadId?: string;
			path: string;
			action: "reveal" | "open";
		}) => {
			window.__projectPathCalls!.push(request);
			if (
				params.get("bridge-fail") === "open" &&
				request.action === "open"
			)
				return Promise.reject(
					Error(
						"Windows could not open this file. No application is registered.",
					),
				);
			return Promise.resolve({ action: request.action });
		},
	} as unknown as Window["harnessDesktop"];
}
document.documentElement.dataset.theme = params.get("theme") ?? "dark";
createRoot(document.getElementById("root")!).render(<Fixture />);
