"use client";

import { motion } from "framer-motion";
import { Book, Search, Sparkles } from "lucide-react";
import { useContext } from "react";
import { Notes, SlideContext } from "spectacle";
import { DeckSlide } from "~/components/deck/DeckSlide";
import { PresenterNote } from "~/components/deck/PresenterNote";

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

/* ─── Right: Composio tools with agent-relevant metadata ────────────────── */

type Tool = {
	name: string;
	summary: string;
	params: number;
	tokens: number;
	scopes?: string[];
	requires?: string[];
};

const TOOL_SECTIONS: Array<{ heading: string; tools: Tool[] }> = [
	{
		heading: "Pull requests",
		tools: [
			{
				name: "GITHUB_LIST_PULL_REQUESTS",
				summary: "List PRs with state, base, head, sort filters",
				params: 8,
				tokens: 214,
				scopes: ["repo:read"],
			},
			{
				name: "GITHUB_CREATE_A_PULL_REQUEST",
				summary: "Open a PR from head into base",
				params: 7,
				tokens: 268,
				scopes: ["repo:write"],
				requires: ["GITHUB_GET_A_BRANCH", "GITHUB_COMPARE_TWO_COMMITS"],
			},
			{
				name: "GITHUB_GET_A_PULL_REQUEST",
				summary: "Fetch a single PR by number",
				params: 3,
				tokens: 128,
				scopes: ["repo:read"],
			},
			{
				name: "GITHUB_UPDATE_A_PULL_REQUEST",
				summary: "Edit title, body, base, or state of an open PR",
				params: 8,
				tokens: 246,
				scopes: ["repo:write"],
				requires: ["GITHUB_GET_A_PULL_REQUEST"],
			},
			{
				name: "GITHUB_LIST_PULL_REQUEST_FILES",
				summary: "List files changed in a pull request",
				params: 5,
				tokens: 172,
				scopes: ["repo:read"],
			},
			{
				name: "GITHUB_MERGE_A_PULL_REQUEST",
				summary: "Merge, squash, or rebase a pull request",
				params: 6,
				tokens: 234,
				scopes: ["repo:write"],
				requires: ["GITHUB_GET_A_PULL_REQUEST"],
			},
		],
	},
	{
		heading: "Reviews",
		tools: [
			{
				name: "GITHUB_LIST_REVIEWS_ON_A_PULL_REQUEST",
				summary: "List reviews for a pull request",
				params: 5,
				tokens: 162,
				scopes: ["repo:read"],
			},
			{
				name: "GITHUB_CREATE_A_REVIEW",
				summary: "Post a review — approve, comment, request_changes",
				params: 6,
				tokens: 232,
				scopes: ["repo:write"],
				requires: ["GITHUB_LIST_PULL_REQUEST_FILES"],
			},
			{
				name: "GITHUB_DISMISS_A_REVIEW",
				summary: "Dismiss a review with a message",
				params: 4,
				tokens: 146,
				scopes: ["repo:write"],
			},
		],
	},
];

function ComposioToolsCard() {
	const total = TOOL_SECTIONS.reduce((s, x) => s + x.tools.length, 0);
	const tokens = TOOL_SECTIONS.reduce(
		(s, x) => s + x.tools.reduce((t, tool) => t + tool.tokens, 0),
		0,
	);
	return (
		<CardShell borderColor={CX.accentBorder}>
			<div className="flex min-w-0 flex-1 flex-col overflow-hidden">
				<Header
					icon={
						<Sparkles
							size={14}
							strokeWidth={2.2}
							style={{ color: CX.accent }}
						/>
					}
					crumbs={["platform.composio.dev", "tools", "github"]}
					title="Pull requests"
					accent={CX.accent}
					borderColor={CX.border}
					muted={CX.muted}
					dim={CX.dim}
					text={CX.text}
					meta={[
						{ label: "tools", value: `${total}` },
						{ label: "context", value: `~${(tokens / 1000).toFixed(1)}k tok` },
						{ label: "scopes", value: "repo:read · repo:write" },
						{ label: "runtime", value: "MCP · SDK · direct" },
					]}
				/>

				<FilterBar placeholder="Search tools" borderColor={CX.border} dim={CX.dim} />

				<div className="flex min-h-0 flex-1 flex-col overflow-hidden">
					{TOOL_SECTIONS.map((section, i) => (
						<div key={section.heading}>
							<SectionHeader
								borderColor={CX.border}
								muted={CX.muted}
								label={section.heading}
								count={section.tools.length}
								first={i === 0}
							/>
							{section.tools.map((t) => (
								<ToolRow key={t.name} tool={t} />
							))}
						</div>
					))}
				</div>
			</div>
		</CardShell>
	);
}

function ToolRow({ tool }: { tool: Tool }) {
	const hasMeta =
		(tool.scopes && tool.scopes.length > 0) ||
		(tool.requires && tool.requires.length > 0);
	return (
		<div
			className="flex flex-col gap-1.5 px-5 py-2.5"
			style={{ borderBottom: `1px solid ${CX.border}` }}
		>
			<div className="flex items-baseline gap-3">
				<span
					className="truncate"
					style={{
						fontFamily: MONO,
						color: CX.text,
						fontSize: 12,
						fontWeight: 600,
						letterSpacing: "-0.01em",
					}}
				>
					{tool.name}
				</span>
				<div className="ml-auto flex shrink-0 items-center gap-1.5">
					<StatChip label={`${tool.params}p`} tone="neutral" />
					<StatChip label={`${tool.tokens} tok`} tone="accent" />
				</div>
			</div>
			<span
				className="truncate"
				style={{
					color: CX.muted,
					fontSize: 11,
					fontFamily: SANS,
					lineHeight: 1.4,
				}}
			>
				{tool.summary}
			</span>
			{hasMeta ? (
				<div className="mt-0.5 flex flex-wrap items-center gap-1.5">
					{tool.scopes?.map((s) => (
						<MetaChip
							key={s}
							kind="scope"
							label={s}
						/>
					))}
					{tool.requires && tool.requires.length > 0 ? (
						<MetaChip
							kind="req"
							label={`needs ${tool.requires.join(" · ")}`}
						/>
					) : null}
				</div>
			) : null}
		</div>
	);
}

function StatChip({
	label,
	tone,
}: {
	label: string;
	tone: "neutral" | "accent";
}) {
	const isAccent = tone === "accent";
	return (
		<span
			className="shrink-0"
			style={{
				background: isAccent ? CX.accentSoft : "rgba(255,255,255,0.03)",
				color: isAccent ? CX.accent : CX.muted,
				border: `1px solid ${isAccent ? CX.accentBorder : "rgba(255,255,255,0.08)"}`,
				borderRadius: 4,
				fontSize: 9.5,
				fontFamily: MONO,
				fontWeight: 700,
				letterSpacing: "0.04em",
				padding: "1.5px 6px",
			}}
		>
			{label}
		</span>
	);
}

function MetaChip({
	kind,
	label,
}: {
	kind: "scope" | "req";
	label: string;
}) {
	const isScope = kind === "scope";
	return (
		<span
			className="inline-flex items-center gap-1"
			style={{
				background: isScope ? CX.greenSoft : "rgba(255,255,255,0.02)",
				color: isScope ? CX.green : CX.muted,
				border: `1px solid ${isScope ? CX.greenBorder : "rgba(255,255,255,0.08)"}`,
				borderRadius: 3,
				fontSize: 9.5,
				fontFamily: MONO,
				padding: "1px 5px",
				lineHeight: 1.4,
			}}
		>
			<span style={{ opacity: 0.7 }}>{isScope ? "🔒" : "↳"}</span>
			<span>{label}</span>
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
