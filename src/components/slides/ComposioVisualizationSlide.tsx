"use client";

import { motion } from "framer-motion";
import { Book, ChevronDown, ChevronUp, Sparkles } from "lucide-react";
import { useContext } from "react";
import { Notes, SlideContext } from "spectacle";
import { DeckSlide } from "~/components/deck/DeckSlide";
import { PresenterNote } from "~/components/deck/PresenterNote";

/**
 * Slide 19 — the translation panel. Left: GitHub's REST docs entry for
 * "Create a pull request" rendered in the dark GitHub app aesthetic ported
 * from karan_aie_deck's VerificationSolutionSlide (bg #0d1117, card #161b22,
 * left rail with a doc icon, section headers, muted borders). Right: the
 * same operation as a Composio tool — Composio-orange rail, LLM-tuned
 * description, typed schema, returns.
 */

/* ─── GitHub-dark palette (matches karan's ChecksCard) ──────────────────── */
const GH = {
	bg: "#0d1117",
	card: "#161b22",
	cardHi: "#1c2128",
	border: "#30363d",
	borderMuted: "#21262d",
	text: "#c9d1d9",
	textStrong: "#f0f6fc",
	muted: "#8b949e",
	link: "#2f81f7",
	success: "#3fb950",
	attention: "#d29922",
	danger: "#f85149",
	requiredBg: "rgba(248,81,73,0.14)",
	postBg: "#238636",
} as const;

/* ─── Composio palette (dark, orange accent) ────────────────────────────── */
const CX = {
	bg: "#0B0B0C",
	card: "#111214",
	cardHi: "#16171A",
	border: "#22232A",
	borderMuted: "#191A1F",
	text: "#C6C6CC",
	textStrong: "#E7E7EA",
	muted: "#6D6D75",
	accent: "#FF7A2F",
	accentSoft: "rgba(255,122,47,0.14)",
	types: "#67C0A0",
	dim: "#4A4A52",
} as const;

const SANS =
	'-apple-system, BlinkMacSystemFont, "Segoe UI", "Noto Sans", Helvetica, Arial, sans-serif';
const MONO =
	'"JetBrains Mono", ui-monospace, SFMono-Regular, "SF Mono", Consolas, monospace';

const PANEL_W = 600;
const PANEL_H = 560;

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
			duration: 0.55,
			ease: [0.34, 1.14, 0.6, 1] as [number, number, number, number],
			delay,
		},
	});

	return (
		<div className="flex h-full w-full items-center justify-center bg-black">
			<div className="flex items-start" style={{ gap: 44 }}>
				<motion.div
					{...fade(0)}
					className="flex flex-col items-center gap-3"
				>
					<PanelLabel>for people</PanelLabel>
					<GithubDocsCard />
				</motion.div>

				<motion.div
					{...fade(0.15)}
					className="flex flex-col items-center gap-3"
				>
					<PanelLabel>for agents</PanelLabel>
					<ComposioToolCard />
				</motion.div>
			</div>
		</div>
	);
}

function PanelLabel({ children }: { children: React.ReactNode }) {
	return (
		<span
			className="font-mono text-[12px] font-semibold uppercase tracking-[0.22em]"
			style={{ color: "rgba(255,255,255,0.4)" }}
		>
			{children}
		</span>
	);
}

/* ─── Left: GitHub-dark API-ref card ────────────────────────────────────── */

function GithubDocsCard() {
	return (
		<div
			className="flex overflow-hidden rounded-md shrink-0"
			style={{
				width: PANEL_W,
				height: PANEL_H,
				background: GH.card,
				border: `1px solid ${GH.border}`,
				fontFamily: SANS,
				boxShadow:
					"0 32px 60px rgba(0,0,0,0.55), 0 12px 24px rgba(0,0,0,0.4)",
			}}
		>
			{/* Left rail — matches karan's PR-icon treatment */}
			<div className="flex shrink-0 items-start pt-3 pl-3">
				<div
					className="flex size-8 items-center justify-center rounded-md"
					style={{
						background: "#3d444d",
						border: `1px solid ${GH.border}`,
					}}
				>
					<Book size={14} strokeWidth={2} style={{ color: GH.text }} />
				</div>
			</div>

			<div className="flex min-w-0 flex-1 flex-col">
				{/* Header */}
				<div
					className="flex items-start gap-2.5 px-4 py-3"
					style={{ borderBottom: `1px solid ${GH.borderMuted}` }}
				>
					<div className="min-w-0 flex-1 leading-tight">
						<div
							className="flex items-center gap-1.5"
							style={{ fontSize: 11.5, color: GH.muted }}
						>
							<span>REST API</span>
							<span style={{ color: GH.borderMuted }}>/</span>
							<span>Pulls</span>
							<span style={{ color: GH.borderMuted }}>/</span>
							<span style={{ color: GH.link, fontWeight: 500 }}>
								Pulls
							</span>
						</div>
						<div
							className="mt-1 text-[16px] font-semibold"
							style={{ color: GH.textStrong }}
						>
							Create a pull request
						</div>
					</div>
					<ChevronUp size={14} style={{ color: GH.muted, marginTop: 4 }} />
				</div>

				{/* Endpoint box */}
				<div
					className="mx-4 mt-3 flex items-center gap-2 rounded-md px-3 py-2"
					style={{
						background: GH.bg,
						border: `1px solid ${GH.border}`,
					}}
				>
					<span
						className="rounded px-2 py-0.5 text-[10px] font-bold"
						style={{ background: GH.postBg, color: "#fff" }}
					>
						POST
					</span>
					<span
						style={{
							fontFamily: MONO,
							color: GH.textStrong,
							fontSize: 12,
						}}
					>
						/repos/{"{owner}"}/{"{repo}"}/pulls
					</span>
				</div>

				{/* Parameters section */}
				<div className="px-4 pt-3">
					<GhSectionHeader label="Parameters" />
				</div>
				<div className="px-4">
					<GhParamRow name="accept" type="string" where="header" />
					<GhParamRow name="owner" type="string" where="path" required />
					<GhParamRow name="repo" type="string" where="path" required />
					<div
						className="mt-2 pt-2"
						style={{
							borderTop: `1px solid ${GH.borderMuted}`,
							color: GH.muted,
							fontSize: 11,
							fontFamily: MONO,
						}}
					>
						body
					</div>
					<GhParamRow name="title" type="string" where="body" required />
					<GhParamRow name="head" type="string" where="body" required />
					<GhParamRow name="base" type="string" where="body" required />
					<GhParamRow name="body" type="string" where="body" />
					<GhParamRow
						name="maintainer_can_modify"
						type="boolean"
						where="body"
					/>
					<GhParamRow name="draft" type="boolean" where="body" />
					<GhParamRow name="issue" type="integer" where="body" />
				</div>

				{/* Status codes */}
				<div
					className="mt-2 border-t px-4 pt-3 pb-3"
					style={{ borderColor: GH.borderMuted }}
				>
					<GhSectionHeader label="HTTP response status codes" />
					<div className="mt-1.5 flex flex-col gap-0.5">
						<GhStatusRow code="201" text="Created" tone="success" />
						<GhStatusRow code="403" text="Forbidden" tone="danger" />
						<GhStatusRow
							code="422"
							text="Validation failed, or the endpoint has been spammed."
							tone="danger"
						/>
					</div>
				</div>
			</div>
		</div>
	);
}

function GhSectionHeader({ label }: { label: string }) {
	return (
		<div className="flex items-center gap-1.5">
			<span className="text-[12.5px]" style={{ color: GH.text }}>
				{label}
			</span>
			<ChevronDown size={11} style={{ color: GH.muted }} />
		</div>
	);
}

function GhParamRow({
	name,
	type,
	where,
	required,
}: {
	name: string;
	type: string;
	where: string;
	required?: boolean;
}) {
	return (
		<div
			className="flex items-baseline gap-2 py-[3px]"
			style={{
				borderTop: `1px solid ${GH.borderMuted}`,
				fontFamily: MONO,
				fontSize: 11,
			}}
		>
			<span
				style={{ color: GH.textStrong, fontWeight: 600, minWidth: 168 }}
			>
				{name}
			</span>
			<span style={{ color: GH.attention }}>{type}</span>
			<span style={{ color: GH.muted }}>{where}</span>
			{required ? (
				<span
					className="ml-auto rounded px-1.5"
					style={{
						color: GH.danger,
						background: GH.requiredBg,
						fontSize: 9.5,
						fontFamily: SANS,
					}}
				>
					Required
				</span>
			) : null}
		</div>
	);
}

function GhStatusRow({
	code,
	text,
	tone,
}: {
	code: string;
	text: string;
	tone: "success" | "danger";
}) {
	return (
		<div
			className="flex items-baseline gap-2 py-[3px]"
			style={{ fontFamily: MONO, fontSize: 11 }}
		>
			<span
				style={{
					color: tone === "success" ? GH.success : GH.danger,
					fontWeight: 600,
				}}
			>
				{code}
			</span>
			<span style={{ color: GH.muted, fontFamily: SANS }}>{text}</span>
		</div>
	);
}

/* ─── Right: Composio tool card ─────────────────────────────────────────── */

function ComposioToolCard() {
	return (
		<div
			className="flex overflow-hidden rounded-md shrink-0"
			style={{
				width: PANEL_W,
				height: PANEL_H,
				background: CX.card,
				border: `1px solid ${CX.border}`,
				fontFamily: SANS,
				boxShadow:
					"0 32px 60px rgba(0,0,0,0.55), 0 12px 24px rgba(0,0,0,0.4)",
			}}
		>
			{/* Left rail — orange accent instead of GH's slate */}
			<div className="flex shrink-0 items-start pt-3 pl-3">
				<div
					className="flex size-8 items-center justify-center rounded-md"
					style={{
						background: CX.accent,
						border: `1px solid ${CX.accent}`,
					}}
				>
					<Sparkles
						size={14}
						strokeWidth={2.2}
						style={{ color: "#0B0B0C" }}
					/>
				</div>
			</div>

			<div className="flex min-w-0 flex-1 flex-col">
				{/* Header */}
				<div
					className="flex items-start gap-2.5 px-4 py-3"
					style={{ borderBottom: `1px solid ${CX.borderMuted}` }}
				>
					<div className="min-w-0 flex-1 leading-tight">
						<div
							className="flex items-center gap-1.5"
							style={{ fontSize: 11.5, color: CX.muted }}
						>
							<span>tools</span>
							<span style={{ color: CX.dim }}>/</span>
							<span>github</span>
							<span style={{ color: CX.dim }}>/</span>
							<span style={{ color: CX.accent, fontWeight: 500 }}>
								create_a_pull_request
							</span>
						</div>
						<div
							className="mt-1"
							style={{
								fontFamily: MONO,
								color: CX.textStrong,
								fontSize: 15,
								fontWeight: 700,
								letterSpacing: "-0.01em",
							}}
						>
							GITHUB_CREATE_A_PULL_REQUEST
						</div>
					</div>
					<span
						className="rounded-full px-2 py-0.5 text-[9.5px] font-semibold uppercase tracking-wider"
						style={{
							background: CX.accentSoft,
							color: CX.accent,
						}}
					>
						agent-ready
					</span>
				</div>

				{/* Description */}
				<div className="px-4 pt-3">
					<CxSectionHeader label="Description" />
					<p
						className="mt-1.5"
						style={{
							color: CX.text,
							fontSize: 12.5,
							lineHeight: 1.55,
						}}
					>
						Open a pull request from <CxInline>head</CxInline> into{" "}
						<CxInline>base</CxInline>. Use for shipping changes, opening
						drafts for review, or converting an existing issue to a PR.
						Prefer <CxInline>draft: true</CxInline> when the branch isn't
						ready to merge.
					</p>
				</div>

				{/* Input schema */}
				<div className="px-4 pt-3">
					<CxSectionHeader label="Input schema" />
					<div
						className="mt-1.5 rounded-md px-3 py-2"
						style={{
							background: CX.bg,
							border: `1px solid ${CX.border}`,
							fontFamily: MONO,
							fontSize: 11.5,
							lineHeight: 1.7,
						}}
					>
						<div className="whitespace-pre">
							<span style={{ color: CX.muted }}>{"{"}</span>
						</div>
						<CxRow name="owner" type="string" desc="repo owner login" />
						<CxRow name="repo" type="string" desc="repository name" />
						<CxRow name="title" type="string" desc="PR title" />
						<CxRow
							name="head"
							type="string"
							desc="branch with your changes"
						/>
						<CxRow
							name="base"
							type="string"
							desc="target branch, e.g. main"
						/>
						<CxRow name="body" type="string" optional desc="markdown body" />
						<CxRow
							name="draft"
							type="boolean"
							optional
							desc="open as draft"
						/>
						<div className="whitespace-pre">
							<span style={{ color: CX.muted }}>{"}"}</span>
						</div>
					</div>
				</div>

				{/* Returns */}
				<div
					className="mt-3 border-t px-4 pt-3 pb-3"
					style={{ borderColor: CX.borderMuted }}
				>
					<CxSectionHeader label="Returns" />
					<p
						className="mt-1"
						style={{ color: CX.text, fontSize: 12 }}
					>
						<CxInline>{"{ number, html_url, state, draft }"}</CxInline> —
						the PR number, canonical URL, and current state.
					</p>
				</div>
			</div>
		</div>
	);
}

function CxSectionHeader({ label }: { label: string }) {
	return (
		<div
			style={{
				fontSize: 10.5,
				color: CX.muted,
				textTransform: "uppercase",
				letterSpacing: "0.16em",
				fontWeight: 600,
			}}
		>
			{label}
		</div>
	);
}

function CxInline({ children }: { children: React.ReactNode }) {
	return (
		<span
			style={{
				fontFamily: MONO,
				background: CX.accentSoft,
				color: "#FF9E63",
				padding: "0 5px",
				borderRadius: 3,
				fontSize: 11.5,
			}}
		>
			{children}
		</span>
	);
}

function CxRow({
	name,
	type,
	desc,
	optional,
}: {
	name: string;
	type: string;
	desc: string;
	optional?: boolean;
}) {
	return (
		<div className="flex items-baseline gap-2 whitespace-pre">
			<span style={{ color: CX.muted }}>{"  "}</span>
			<span
				style={{
					color: CX.textStrong,
					minWidth: 92,
					fontWeight: 600,
				}}
			>
				{name}
				{optional ? "?" : ""}
			</span>
			<span style={{ color: CX.muted }}>:</span>
			<span style={{ color: CX.types }}>{type}</span>
			<span className="ml-auto" style={{ color: CX.dim }}>
				// {desc}
			</span>
		</div>
	);
}
