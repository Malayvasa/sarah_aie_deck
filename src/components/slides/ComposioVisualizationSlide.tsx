"use client";

import { motion } from "framer-motion";
import { Book, Search } from "lucide-react";
import { useContext } from "react";
import { Notes, SlideContext } from "spectacle";
import { DeckSlide } from "~/components/deck/DeckSlide";
import { PresenterNote } from "~/components/deck/PresenterNote";
import { TerminalWindow } from "~/components/terminal-kit";

/**
 * Slide 19 — the translation panel. Two dark cards side-by-side.
 *
 * Left card: GitHub REST endpoints — method + path + endpoint title, plus
 * the metadata a developer reading the docs actually needs (rate limit,
 * OAuth scope). Right card: the same surface as Composio tools with the
 * metadata an *agent* needs (token cost per tool, required scopes, and
 * the prerequisite tool chain the agent should call first). The
 * substantive metadata is what marks the right side as agent-native,
 * not any explicit label.
 */

const GH = {
	panel: "#0d1117",
	border: "rgba(255,255,255,0.06)",
	text: "#e5e9ef",
	muted: "#8b949e",
	dim: "#5f6672",
	link: "#79b8ff",
	post: { fg: "#6dda9f", bg: "rgba(63,185,80,0.14)", border: "rgba(63,185,80,0.32)" },
	get: { fg: "#7ba7ff", bg: "rgba(47,129,247,0.14)", border: "rgba(47,129,247,0.32)" },
	patch: { fg: "#f5c26f", bg: "rgba(210,153,34,0.14)", border: "rgba(210,153,34,0.32)" },
	put: { fg: "#bfa4f8", bg: "rgba(130,80,223,0.14)", border: "rgba(130,80,223,0.32)" },
	delete: { fg: "#f19898", bg: "rgba(248,81,73,0.12)", border: "rgba(248,81,73,0.32)" },
} as const;

const CX = {
	panel: "#0b0b0d",
	border: "rgba(255,255,255,0.06)",
	text: "#e5e9ef",
	muted: "#8b8f96",
	dim: "#585c65",
	accent: "#D97757",
	accentSoft: "rgba(217,119,87,0.12)",
	accentBorder: "rgba(217,119,87,0.32)",
	green: "#6dda9f",
	greenSoft: "rgba(63,185,80,0.12)",
	greenBorder: "rgba(63,185,80,0.30)",
} as const;

const SANS =
	'-apple-system, BlinkMacSystemFont, "SF Pro", "SF Pro Text", "Segoe UI", Helvetica, Arial, sans-serif';
const MONO =
	'"JetBrains Mono", ui-monospace, SFMono-Regular, "SF Mono", Consolas, monospace';

const PANEL_W = 640;
const PANEL_H = 640;

export function ComposioVisualizationSlide() {
	return (
		<DeckSlide padded={false}>
			<Body />
			<Notes>
				<PresenterNote noteKey="composioVisualization" />
			</Notes>
		</DeckSlide>
	);
}

function Body() {
	const { isSlideActive } = useContext(SlideContext);
	const fade = (delay: number) => ({
		initial: { opacity: 0, y: 20 },
		animate: isSlideActive ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 },
		transition: {
			duration: 0.6,
			ease: [0.34, 1.14, 0.6, 1] as [number, number, number, number],
			delay,
		},
	});

	return (
		<div className="flex h-full w-full items-center justify-center bg-black">
			<div className="flex items-center" style={{ gap: 32 }}>
				<motion.div {...fade(0)}>
					<GithubEndpointsCard />
				</motion.div>
				<motion.div {...fade(0.15)}>
					<ComposioToolsCard />
				</motion.div>
			</div>
		</div>
	);
}

/* ─── Shared card shell ─────────────────────────────────────────────────── */

function CardShell({
	borderColor,
	children,
}: {
	borderColor: string;
	children: React.ReactNode;
}) {
	return (
		<div
			className="flex overflow-hidden rounded-xl shrink-0"
			style={{
				width: PANEL_W,
				height: PANEL_H,
				background: "#0b0b0d",
				border: `1px solid ${borderColor}`,
				fontFamily: SANS,
				boxShadow:
					"0 42px 80px rgba(0,0,0,0.55), 0 14px 30px rgba(0,0,0,0.4), 0 1px 0 rgba(255,255,255,0.04) inset",
			}}
		>
			{children}
		</div>
	);
}

/* ─── Left: GitHub REST endpoints ───────────────────────────────────────── */

type Endpoint = {
	method: "GET" | "POST" | "PATCH" | "PUT" | "DELETE";
	path: string;
	title: string;
	rate?: string; // rate limit hint the docs surface
};

const PULL_SECTIONS: Array<{ heading: string; endpoints: Endpoint[] }> = [
	{
		heading: "Pull requests",
		endpoints: [
			{ method: "GET", path: "/repos/{owner}/{repo}/pulls", title: "List pull requests" },
			{ method: "POST", path: "/repos/{owner}/{repo}/pulls", title: "Create a pull request" },
			{ method: "GET", path: "/repos/{owner}/{repo}/pulls/{n}", title: "Get a pull request" },
			{ method: "PATCH", path: "/repos/{owner}/{repo}/pulls/{n}", title: "Update a pull request" },
			{ method: "GET", path: "/repos/{owner}/{repo}/pulls/{n}/files", title: "List pull request files" },
			{ method: "PUT", path: "/repos/{owner}/{repo}/pulls/{n}/merge", title: "Merge a pull request" },
		],
	},
	{
		heading: "Reviews",
		endpoints: [
			{ method: "GET", path: "/repos/{owner}/{repo}/pulls/{n}/reviews", title: "List reviews on a pull request" },
			{ method: "POST", path: "/repos/{owner}/{repo}/pulls/{n}/reviews", title: "Create a review for a pull request" },
			{ method: "PUT", path: "/repos/{owner}/{repo}/pulls/{n}/reviews/{r}/dismissals", title: "Dismiss a review" },
		],
	},
	{
		heading: "Review comments",
		endpoints: [
			{ method: "GET", path: "/repos/{owner}/{repo}/pulls/comments", title: "List review comments in a repository" },
			{ method: "POST", path: "/repos/{owner}/{repo}/pulls/{n}/comments", title: "Create a review comment for a pull request" },
			{ method: "DELETE", path: "/repos/{owner}/{repo}/pulls/comments/{cid}", title: "Delete a review comment" },
		],
	},
];

function GithubEndpointsCard() {
	const total = PULL_SECTIONS.reduce((s, x) => s + x.endpoints.length, 0);
	return (
		<CardShell borderColor={GH.border}>
			<div className="flex min-w-0 flex-1 flex-col overflow-hidden">
				<Header
					icon={<Book size={14} strokeWidth={2} style={{ color: GH.muted }} />}
					crumbs={["docs.github.com", "REST", "Pulls"]}
					title="Pull requests"
					accent={GH.link}
					borderColor={GH.border}
					muted={GH.muted}
					dim={GH.dim}
					text={GH.text}
					meta={[
						{ label: "endpoints", value: `${total}` },
						{ label: "auth", value: "OAuth · repo" },
						{ label: "rate limit", value: "5,000 / h" },
						{ label: "reference", value: "v2022-11-28" },
					]}
				/>

				<FilterBar placeholder="Search endpoints" borderColor={GH.border} dim={GH.dim} />

				<div className="flex min-h-0 flex-1 flex-col overflow-hidden">
					{PULL_SECTIONS.map((section, i) => (
						<div key={section.heading}>
							<SectionHeader
								borderColor={GH.border}
								muted={GH.muted}
								label={section.heading}
								count={section.endpoints.length}
								first={i === 0}
							/>
							{section.endpoints.map((e) => (
								<EndpointRow key={e.method + e.path} endpoint={e} />
							))}
						</div>
					))}
				</div>
			</div>
		</CardShell>
	);
}

function EndpointRow({ endpoint }: { endpoint: Endpoint }) {
	const tone = {
		GET: GH.get,
		POST: GH.post,
		PATCH: GH.patch,
		PUT: GH.put,
		DELETE: GH.delete,
	}[endpoint.method];

	return (
		<div
			className="flex items-center gap-3 px-5 py-2.5"
			style={{ borderBottom: `1px solid ${GH.border}` }}
		>
			<span
				className="shrink-0 text-center"
				style={{
					background: tone.bg,
					color: tone.fg,
					border: `1px solid ${tone.border}`,
					borderRadius: 4,
					fontSize: 9,
					fontFamily: MONO,
					fontWeight: 700,
					letterSpacing: "0.08em",
					padding: "2px 6px",
					minWidth: 52,
				}}
			>
				{endpoint.method}
			</span>
			<div className="flex min-w-0 flex-1 flex-col leading-tight">
				<span
					className="truncate"
					style={{
						fontFamily: MONO,
						color: GH.text,
						fontSize: 11.5,
						letterSpacing: "-0.005em",
					}}
				>
					{endpoint.path}
				</span>
				<span
					className="truncate"
					style={{
						color: GH.muted,
						fontSize: 11,
						fontFamily: SANS,
						marginTop: 2,
					}}
				>
					{endpoint.title}
				</span>
			</div>
		</div>
	);
}

/* ─── Right: Composio meta-tools inside the pi terminal shell ───────────── */

type MetaTool = {
	name: string;
	summary: string;
	req: string;
	res: React.ReactNode;
};

const META_TOOLS: MetaTool[] = [
	{
		name: "COMPOSIO_SEARCH_TOOLS",
		summary:
			"Ask in plain English. Get the exact app tools + a plan with prerequisites and pitfalls.",
		req: `{ ask: "how do I open a pull request
         from a feature branch?" }`,
		res: (
			<>
				<span style={{ color: CX.muted }}>plan for github:</span>
				<PlanRow tool="GITHUB_GET_A_BRANCH" note="validate refs exist" />
				<PlanRow
					tool="GITHUB_COMPARE_TWO_COMMITS"
					note="confirm head is ahead"
				/>
				<PlanRow
					tool="GITHUB_CREATE_A_PULL_REQUEST"
					note="open the PR"
				/>
				<span style={{ color: CX.muted, fontSize: 10, marginTop: 2 }}>
					+ 3 more tools · 2 pitfalls attached
				</span>
			</>
		),
	},
	{
		name: "COMPOSIO_MANAGE_CONNECTIONS",
		summary:
			"Checks connection status for a toolkit and returns a branded auth link when the user needs to connect — covers OAuth, API keys, and every other auth type.",
		req: `{ toolkit: "github", user_id: "u_42" }`,
		res: (
			<>
				<span>
					<Kv k="status" v="not_connected" />
				</span>
				<span>
					<Kv k="auth" v="oauth2" />
				</span>
				<span>
					<Kv
						k="connect_url"
						v='"https://composio.dev/connect/gh_…"'
					/>
				</span>
			</>
		),
	},
	{
		name: "COMPOSIO_MULTI_EXECUTE_TOOL",
		summary:
			"Executes up to 50 tools in parallel and returns structured outputs ready for immediate analysis.",
		req: `{ tool_calls: [
  { name: "SLACK_FETCH_THREAD", args: {…} },
  { name: "SENTRY_RETRIEVE_ISSUES", args: {…} },
  { name: "DATADOG_SEARCH_LOGS", args: {…} },
] }`,
		res: (
			<>
				<span>
					<span style={{ color: CX.green, fontWeight: 700 }}>✓</span>{" "}
					<span style={{ color: CX.text }}>3/3 succeeded</span>{" "}
					<span style={{ color: CX.muted }}>· 412 ms total</span>
				</span>
				<span style={{ color: CX.muted }}>
					results[] returned in call order
				</span>
			</>
		),
	},
	{
		name: "COMPOSIO_REMOTE_BASH_TOOL",
		summary:
			"Runs bash commands in a remote sandbox for file operations, data processing, and system tasks.",
		req: `$ jq '.rows | length' /mnt/files/results.json`,
		res: (
			<>
				<span style={{ color: CX.text }}>1,284</span>
				<span style={{ color: CX.muted }}>
					stdout:6 · stderr:0 · sandbox:sh_92j
				</span>
			</>
		),
	},
	{
		name: "COMPOSIO_REMOTE_WORKBENCH",
		summary:
			"Runs Python in a persistent remote sandbox to process large remote files and script bulk or repeated tool executions.",
		req: `import pandas as pd
df = pd.read_csv('/mnt/files/users.csv')
top = df.groupby('country').size().nlargest(3)
print(top.to_dict())`,
		res: (
			<>
				<span style={{ color: CX.text }}>
					{"{'US': 2412, 'IN': 1183, 'DE': 754}"}
				</span>
				<span style={{ color: CX.muted }}>
					sandbox:py_6i6 · state persists across calls
				</span>
			</>
		),
	},
];

function ComposioToolsCard() {
	const search = META_TOOLS.find((t) => t.name === "COMPOSIO_SEARCH_TOOLS")!;
	const runtime = META_TOOLS.filter(
		(t) => t.name !== "COMPOSIO_SEARCH_TOOLS",
	);
	return (
		<div
			className="flex flex-col"
			style={{ width: PANEL_W, height: PANEL_H, gap: 10 }}
		>
			<div style={{ height: 320 }}>
				<MetaToolTerminal tool={search} expanded />
			</div>
			<div
				className="grid grid-cols-2 min-h-0 flex-1"
				style={{ gap: 10 }}
			>
				{runtime.map((tool) => (
					<MetaToolTerminal key={tool.name} tool={tool} />
				))}
			</div>
		</div>
	);
}

/* Each meta-tool is its own pi terminal window — same Claude theme as the
 * demo terminals, no traffic lights, header carries the tool name. The
 * featured `SEARCH_TOOLS` terminal is taller and renders a fuller plan
 * (steps + pitfalls + connections) so it reads as the "hero" primitive. */
function MetaToolTerminal({
	tool,
	expanded,
}: {
	tool: MetaTool;
	expanded?: boolean;
}) {
	const isSearch = tool.name === "COMPOSIO_SEARCH_TOOLS";
	return (
		<div
			className="h-full overflow-hidden rounded-lg"
			style={{
				boxShadow:
					"0 18px 32px rgba(0,0,0,0.45), 0 4px 12px rgba(0,0,0,0.3), 0 1px 0 rgba(255,255,255,0.04) inset",
			}}
		>
			<TerminalWindow
				className="tk-claude-dark h-full [&_.terminal-body-scroll]:!overflow-y-auto"
				fill
				path={tool.name}
				showTrafficLights={false}
				theme="claude"
				variant="dark"
				bodyClassName="pb-2"
			>
				<div className="flex flex-col">
					<div
						className="px-3 pt-1.5 pb-1"
						style={{
							color: CX.muted,
							fontSize: expanded ? 11.5 : 10,
							fontFamily: SANS,
							lineHeight: 1.4,
						}}
					>
						{tool.summary}
					</div>
					<ShellRow label="REQ" labelColor="#a1b0c6">
						<pre
							style={{
								margin: 0,
								fontFamily: MONO,
								fontSize: expanded ? 11 : 10,
								color: CX.text,
								whiteSpace: "pre-wrap",
							}}
						>
							{tool.req}
						</pre>
					</ShellRow>
					<ShellRow label="RES" labelColor={CX.accent} last>
						<div
							className="flex flex-col gap-0.5"
							style={{
								fontFamily: MONO,
								fontSize: expanded ? 11 : 10,
								color: CX.text,
							}}
						>
							{expanded && isSearch ? <SearchExpandedRes /> : tool.res}
						</div>
					</ShellRow>
				</div>
			</TerminalWindow>
		</div>
	);
}

/* Fuller preview of what COMPOSIO_SEARCH_TOOLS returns — plan steps,
 * pitfalls, and the connection it will run through. Sold as the "output
 * shape" for the hero primitive. */
function SearchExpandedRes() {
	return (
		<>
			<span style={{ color: CX.muted }}>plan for github:</span>
			<PlanStepRow
				n={1}
				tool="GITHUB_GET_A_BRANCH"
				note="validate refs exist"
			/>
			<PlanStepRow
				n={2}
				tool="GITHUB_COMPARE_TWO_COMMITS"
				note="confirm head is ahead of base"
			/>
			<PlanStepRow
				n={3}
				tool="GITHUB_CREATE_A_PULL_REQUEST"
				note="open the PR"
			/>
			<div style={{ color: CX.muted, marginTop: 4 }}>
				<span style={{ color: "#f5c26f" }}>⚠</span>{" "}
				CREATE_A_PULL_REQUEST: HTTP 422 if base/head invalid or PR exists
			</div>
			<div style={{ color: CX.muted }}>
				<span style={{ color: "#f5c26f" }}>⚠</span>{" "}
				GET_A_BRANCH: use owner-qualified head when comparing forks
			</div>
			<div style={{ color: CX.muted, marginTop: 4 }}>
				connections:{" "}
				<span style={{ color: CX.green }}>●</span>{" "}
				<span style={{ color: CX.text }}>github</span>{" "}
				<span style={{ color: CX.muted }}>
					@composio-github (default)
				</span>
			</div>
		</>
	);
}

function PlanStepRow({
	n,
	tool,
	note,
}: {
	n: number;
	tool: string;
	note: string;
}) {
	return (
		<div className="flex items-baseline gap-2">
			<span style={{ color: CX.muted, minWidth: 12 }}>{n}.</span>
			<span
				style={{
					color: CX.accent,
					background: CX.accentSoft,
					border: `1px solid ${CX.accentBorder}`,
					borderRadius: 3,
					padding: "0 5px",
					fontSize: 10,
					fontFamily: MONO,
					fontWeight: 600,
				}}
			>
				{tool}
			</span>
			<span style={{ color: CX.muted, fontSize: 10 }}>{note}</span>
		</div>
	);
}

function ShellRow({
	label,
	labelColor,
	last,
	children,
}: {
	label: string;
	labelColor: string;
	last?: boolean;
	children: React.ReactNode;
}) {
	return (
		<div
			className="flex gap-2 px-3 py-1.5"
			style={{
				borderBottom: last ? undefined : "1px solid rgba(255,255,255,0.04)",
			}}
		>
			<span
				className="shrink-0"
				style={{
					color: labelColor,
					border: `1px solid ${labelColor}55`,
					borderRadius: 4,
					fontSize: 8.5,
					fontFamily: MONO,
					fontWeight: 700,
					letterSpacing: "0.14em",
					padding: "1px 5px",
					height: "fit-content",
					lineHeight: 1.4,
				}}
			>
				{label}
			</span>
			<div className="min-w-0 flex-1">{children}</div>
		</div>
	);
}

function PlanRow({ tool, note }: { tool: string; note: string }) {
	return (
		<div className="flex items-baseline gap-2">
			<span
				style={{
					color: CX.accent,
					background: CX.accentSoft,
					border: `1px solid ${CX.accentBorder}`,
					borderRadius: 3,
					padding: "0 5px",
					fontSize: 10,
					fontFamily: MONO,
					fontWeight: 600,
				}}
			>
				{tool}
			</span>
			<span style={{ color: CX.muted, fontSize: 10 }}>{note}</span>
		</div>
	);
}

function Kv({ k, v }: { k: string; v: string }) {
	return (
		<span>
			<span style={{ color: CX.muted }}>{k}:</span>{" "}
			<span style={{ color: CX.text }}>{v}</span>
		</span>
	);
}

/* ─── Shared header, filter, section header ─────────────────────────────── */

function Header({
	icon,
	crumbs,
	title,
	accent,
	borderColor,
	muted,
	dim,
	text,
	meta,
}: {
	icon: React.ReactNode;
	crumbs: string[];
	title: string;
	accent: string;
	borderColor: string;
	muted: string;
	dim: string;
	text: string;
	meta: Array<{ label: string; value: string }>;
}) {
	return (
		<div
			className="flex flex-col gap-3 px-5 pt-4 pb-4"
			style={{ borderBottom: `1px solid ${borderColor}` }}
		>
			<div className="flex items-center gap-2">
				{icon}
				<div
					className="flex items-center gap-1.5 truncate"
					style={{ fontSize: 11, color: muted }}
				>
					{crumbs.map((c, i) => (
						<span
							key={c + i}
							className="flex items-center gap-1.5"
							style={{
								color: i === crumbs.length - 1 ? accent : muted,
								fontFamily: MONO,
								fontWeight: i === crumbs.length - 1 ? 500 : 400,
							}}
						>
							{i > 0 ? <span style={{ color: dim }}>/</span> : null}
							{c}
						</span>
					))}
				</div>
			</div>
			<div
				className="truncate"
				style={{
					color: text,
					fontSize: 18,
					fontWeight: 700,
					letterSpacing: "-0.02em",
				}}
			>
				{title}
			</div>
			<div className="grid grid-cols-2 gap-x-6 gap-y-1.5">
				{meta.map((m) => (
					<div
						key={m.label}
						className="flex items-baseline gap-2"
					>
						<span
							className="shrink-0"
							style={{
								color: dim,
								fontSize: 9.5,
								fontFamily: SANS,
								fontWeight: 700,
								letterSpacing: "0.14em",
								textTransform: "uppercase",
							}}
						>
							{m.label}
						</span>
						<span
							className="truncate"
							style={{
								color: text,
								fontSize: 11,
								fontFamily: MONO,
							}}
						>
							{m.value}
						</span>
					</div>
				))}
			</div>
		</div>
	);
}

function FilterBar({
	placeholder,
	borderColor,
	dim,
}: {
	placeholder: string;
	borderColor: string;
	dim: string;
}) {
	return (
		<div
			className="flex items-center gap-2 px-5 py-2.5"
			style={{ borderBottom: `1px solid ${borderColor}` }}
		>
			<Search size={12} style={{ color: dim }} />
			<span style={{ color: dim, fontSize: 11.5, fontFamily: SANS }}>
				{placeholder}
			</span>
		</div>
	);
}

function SectionHeader({
	label,
	count,
	first,
	borderColor,
	muted,
}: {
	label: string;
	count: number;
	first?: boolean;
	borderColor: string;
	muted: string;
}) {
	return (
		<div
			className="flex items-baseline justify-between px-5 py-2"
			style={{
				background: "rgba(255,255,255,0.015)",
				borderTop: first ? undefined : `1px solid ${borderColor}`,
				borderBottom: `1px solid ${borderColor}`,
			}}
		>
			<span
				style={{
					color: muted,
					fontSize: 10,
					fontWeight: 700,
					letterSpacing: "0.16em",
					textTransform: "uppercase",
					fontFamily: SANS,
				}}
			>
				{label}
			</span>
			<span
				style={{
					color: muted,
					fontSize: 10,
					fontFamily: MONO,
					fontWeight: 500,
				}}
			>
				{count}
			</span>
		</div>
	);
}
