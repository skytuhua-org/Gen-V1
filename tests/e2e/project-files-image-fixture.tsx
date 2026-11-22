import { useState } from "react";
import { createRoot } from "react-dom/client";
import { ProjectFiles } from "../../apps/web/src/files/ProjectFiles";
import type {
	ProjectSearchAdapter,
	ProjectSearchPage,
	ProjectSearchRequest,
} from "../../apps/web/src/files/project-search-api";
import { taskFixture } from "./task-interface-fixture";
import type { Snapshot } from "../../packages/contracts";
import "../../apps/web/src/styles.css";

const params = new URLSearchParams(location.search);
const sha = "b".repeat(64);
declare global {
	interface Window {
		projectFilesImageFixture: { requests: ProjectSearchRequest[] };
	}
}
const controls = (window.projectFilesImageFixture = {
	requests: [] as ProjectSearchRequest[],
});
const adapter: ProjectSearchAdapter = {
	available: true,
	async search(request) {
		controls.requests.push(structuredClone(request));
		const page: ProjectSearchPage = {
			owner: {
				...request.owner,
				workingCopyId: `copy-${request.owner.projectId}`,
				binding: "b".repeat(64),
			},
			matches: [
				{
					path: "icon.svg",
					kind: "text",
					line: 1,
					column: 1,
					preview: '<svg viewBox="0 0 10 10">',
					sha256: sha,
				},
			],
			nextCursor: null,
			complete: true,
			exclusions: [],
			limits: {
				files: 10000,
				bytes: 33554432,
				matches: 1000,
				timeoutMs: 2000,
				fileBytes: 1048576,
			},
			issues: [],
			issuesTruncated: false,
		};
		return page;
	},
};
const source = taskFixture({
	root: "text",
	elements: {
		text: { type: "Text", props: { text: "Synthetic Files image preview" } },
	},
});
source.resources = [
	{ id: "grant-a", threadId: "task-thread", label: "Alpha grant" },
] as Snapshot["resources"];
function Fixture() {
	const [projectId, setProject] = useState("project-one"),
		[threadId, setThread] = useState("task-thread"),
		[active, setActive] = useState(true);
	return (
		<>
			<p>Synthetic production Files renderer · no live resources</p>
			<div className="fixture-controls">
				<button
					onClick={() =>
						setProject((value) =>
							value === "project-one" ? "project-two" : "project-one",
						)
					}
				>
					Switch project
				</button>
				<button
					onClick={() =>
						setThread((value) =>
							value === "task-thread" ? "other-thread" : "task-thread",
						)
				}
				>
					Switch thread
				</button>
				<button onClick={() => setActive((value) => !value)}>
					Toggle active
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
				<ProjectFiles
					base={`/api/projects/${projectId}`}
					query={`threadId=${threadId}`}
					active={active}
					fallback={<p>Project not connected</p>}
					searchAdapter={adapter}
				/>
			</div>
		</>
	);
}
document.documentElement.dataset.theme = params.get("theme") ?? "dark";
document.documentElement.dataset.motion = params.get("motion") ?? "system";
createRoot(document.getElementById("root")!).render(<Fixture />);
