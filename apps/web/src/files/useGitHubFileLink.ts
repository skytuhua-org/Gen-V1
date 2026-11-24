import { useCallback } from "react";
import { ApiError, authenticated, read } from "../api";
import { useFilesRead } from "./useFilesRead";
import {
	GitHubFileLinkSchema,
	type GitHubFileLink,
} from "../../../../packages/contracts/github-file-link.ts";
import { z } from "zod";

export interface GitHubFileLinkKey {
	projectId: string;
	threadId: string | null;
	path: string;
	sha256: string;
}

// A 404 means the connected server predates the route: hide the control for
// the rest of this session instead of re-probing on every selection.
let routeMissing = false;

export function useGitHubFileLink(
	base: string,
	query: string,
	key: GitHubFileLinkKey | null,
) {
	const keyString = key ? JSON.stringify(key) : "";
	const readLink = useCallback(
		(signal: AbortSignal) => {
			const current = JSON.parse(keyString) as GitHubFileLinkKey;
			const params = new URLSearchParams(query);
			params.set("path", current.path);
			params.set("sha256", current.sha256);
			return authenticated(() =>
				fetch(base + "/file/github-link?" + params, {
					credentials: "same-origin",
					cache: "no-store",
					signal,
				}),
			).then(async (response) => {
				if (response.status === 404) {
					routeMissing = true;
					throw new Error("ROUTE_MISSING");
				}
				const body = await read<unknown>(response);
				const parsed = GitHubFileLinkSchema.safeParse(body);
				if (!parsed.success)
					throw new ApiError(
						"INVALID_RESPONSE",
						z.prettifyError(parsed.error).slice(0, 200),
					);
				return parsed.data as GitHubFileLink;
			});
		},
		[base, query, keyString],
	);
	const result = useFilesRead(keyString, !!key && !routeMissing, readLink);
	if (routeMissing)
		return { value: null, pending: false, error: "", errorCode: "ROUTE_MISSING", hidden: true, refresh: result.refresh };
	return { ...result, hidden: false };
}
