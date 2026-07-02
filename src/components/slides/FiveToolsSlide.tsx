"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useContext, useEffect, useState } from "react";
import { Notes, SlideContext } from "spectacle";
import { DeckSlide } from "~/components/deck/DeckSlide";
import { PresenterNote } from "~/components/deck/PresenterNote";
import { BrowserWindow } from "~/components/mocks/BrowserWindow";

/**
 * Slide 06 — "5 windows to answer one question." Single Chrome window with
 * five tabs (Slack, Datadog, PostHog, VSCode, GitHub) spawning in sequence,
 * then cycling the active tab forever to show the relentless context-switch.
 * Ported from Karan's KnowledgeFragmentsSlide.
 */

const TABS = [
	{
		slug: "slack",
		title: "#support — Slack",
		url: "app.slack.com/client/T02A1B2C/C08X9Z1Y",
	},
	{
		slug: "datadog",
		title: "Log Explorer — Datadog",
		url: "app.datadoghq.com/logs?query=playground",
	},
	{
		slug: "posthog",
		title: "Session recording — PostHog",
		url: "app.posthog.com/replay/018f2c",
	},
	{
		slug: "vscode",
		title: "playground.ts — Visual Studio Code",
		url: "vscode.dev/composio/composio/blob/main/apps/web/src/playground.ts",
	},
	{
		slug: "github",
		title: "Fix playground timeout · Pull Request #4211",
		url: "github.com/composio/composio/pull/4211",
	},
] as const;

const FIRST_TAB_DELAY = 0.4;
const TAB_STAGGER = 0.9;
const PHASE2_CYCLE = 2.0;

const BROWSER_W = 1200;
const BROWSER_H = 640;

export function FiveToolsSlide() {
	return (
		<DeckSlide padded={false}>
			<FiveToolsBody />
			<Notes>
				<PresenterNote noteKey="fiveTools" />
			</Notes>
		</DeckSlide>
	);
}

function FiveToolsBody() {
	const { isSlideActive } = useContext(SlideContext);
	const [enteredCount, setEnteredCount] = useState(0);
	const [activeIdx, setActiveIdx] = useState(-1);

	useEffect(() => {
		if (!isSlideActive) {
			setEnteredCount(0);
			setActiveIdx(-1);
			return;
		}
		let cancelled = false;
		let cycleInterval: ReturnType<typeof setInterval> | null = null;
		const timers: ReturnType<typeof setTimeout>[] = [];

		// Phase 1 — spawn each tab in sequence, newest becomes active.
		for (let i = 0; i < TABS.length; i++) {
			const delay = (FIRST_TAB_DELAY + i * TAB_STAGGER) * 1000;
			timers.push(
				setTimeout(() => {
					if (cancelled) return;
					setEnteredCount(i + 1);
					setActiveIdx(i);
				}, delay),
			);
		}

		// Phase 2 — all five open, cycle the active one forever.
		const phase2Start =
			(FIRST_TAB_DELAY + (TABS.length - 1) * TAB_STAGGER + 1.4) * 1000;
		timers.push(
			setTimeout(() => {
				if (cancelled) return;
				let cycleI = TABS.length - 1;
				cycleInterval = setInterval(() => {
					if (cancelled) return;
					cycleI = (cycleI + 1) % TABS.length;
					setActiveIdx(cycleI);
				}, PHASE2_CYCLE * 1000);
			}, phase2Start),
		);

		return () => {
			cancelled = true;
			timers.forEach(clearTimeout);
			if (cycleInterval) clearInterval(cycleInterval);
		};
	}, [isSlideActive]);

	// Map each tab into BrowserWindow's tabs[]: hide any that haven't entered.
	const tabs = TABS.map((t, i) => ({
		title: t.title,
		slug: t.slug,
		url: t.url,
		visible: i < enteredCount,
	}));

	return (
		<div className="flex h-full w-full items-center justify-center">
			<div className="relative">
				<BrowserWindow
					tabs={tabs}
					activeIndex={activeIdx >= 0 ? activeIdx : 0}
					width={BROWSER_W}
					height={BROWSER_H}
				>
					<AnimatePresence mode="wait">
						{activeIdx >= 0 ? (
							<motion.div
								key={TABS[activeIdx].slug}
								initial={{ opacity: 0 }}
								animate={{ opacity: 1 }}
								exit={{ opacity: 0 }}
								transition={{ duration: 0.25 }}
								className="absolute inset-0"
							>
								<AppFakeUI slug={TABS[activeIdx].slug} />
							</motion.div>
						) : (
							<div
								className="absolute inset-0"
								style={{ background: "#202124" }}
							/>
						)}
					</AnimatePresence>
				</BrowserWindow>

				{/* Bottom fade — dissolves the window edge into the slide bg. */}
				<div
					className="pointer-events-none absolute inset-x-0"
					style={{
						top: "58%",
						bottom: -1,
						background:
							"linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.55) 45%, rgba(0,0,0,0.92) 75%, #000 100%)",
					}}
				/>
			</div>
		</div>
	);
}

/* ─── Fake per-app UIs ────────────────────────────────────────────────────── */

const SANS =
	'-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';

function AppFakeUI({ slug }: { slug: string }) {
	switch (slug) {
		case "slack":
			return <SlackFake />;
		case "datadog":
			return <DatadogFake />;
		case "posthog":
			return <PostHogFake />;
		case "vscode":
			return <VSCodeFake />;
		case "github":
			return <GitHubFake />;
		default:
			return null;
	}
}

/* ─── Slack ──────────────────────────────────────────────────────────────── */

function SlackFake() {
	const channels: { name: string; unread?: number; mention?: number }[] = [
		{ name: "general" },
		{ name: "eng" },
		{ name: "eng-platform", unread: 4 },
		{ name: "support", mention: 3 },
		{ name: "deals" },
		{ name: "launches" },
		{ name: "incidents" },
		{ name: "random" },
	];
	return (
		<div
			className="flex h-full w-full"
			style={{ background: "#1A1D21", color: "#E8E8E8", fontFamily: SANS, fontSize: 13 }}
		>
			{/* Workspace rail */}
			<div
				className="flex w-[64px] shrink-0 flex-col items-center gap-3 py-3"
				style={{ background: "#0F0E11", borderRight: "1px solid #2A2D31" }}
			>
				<div
					className="flex size-9 items-center justify-center rounded-lg"
					style={{
						background: "linear-gradient(135deg, #4A154B 0%, #6B1D6F 100%)",
						color: "#fff",
						fontWeight: 900,
					}}
				>
					C
				</div>
				<div
					className="flex size-9 items-center justify-center rounded-lg text-[11px]"
					style={{ background: "#2A2D31", color: "#9C9EA3" }}
				>
					+
				</div>
				<div className="mt-auto flex flex-col items-center gap-3">
					<div className="text-[13px] text-white/50">🏠</div>
					<div className="text-[13px] text-white/50">🔔</div>
					<div className="text-[13px] text-white/50">•••</div>
				</div>
			</div>

			{/* Channel sidebar */}
			<div
				className="flex w-[240px] shrink-0 flex-col gap-0.5"
				style={{ background: "#19171D", borderRight: "1px solid #2A2D31" }}
			>
				<div
					className="flex items-center justify-between px-3 py-3"
					style={{ borderBottom: "1px solid #2A2D31" }}
				>
					<div className="flex items-center gap-1.5">
						<span className="text-[14px] font-bold">composio</span>
						<span className="text-[10px]" style={{ color: "#8B8D91" }}>▾</span>
					</div>
					<span className="text-[13px]" style={{ color: "#8B8D91" }}>✎</span>
				</div>
				<div className="flex flex-col gap-0.5 px-2 py-2">
					{[
						{ i: "🧵", label: "Threads" },
						{ i: "📌", label: "Mentions & reactions" },
						{ i: "🗂️", label: "Later" },
						{ i: "📄", label: "Drafts & sent" },
					].map((r) => (
						<div key={r.label} className="flex items-center gap-2 px-2 py-1" style={{ color: "#C9C9C9" }}>
							<span className="w-4 text-[11px] opacity-80">{r.i}</span>
							<span>{r.label}</span>
						</div>
					))}
				</div>
				<div className="flex items-center justify-between px-4 pt-2" style={{ color: "#8B8D91" }}>
					<span className="text-[11px] font-semibold">Channels</span>
					<span className="text-[12px]">+</span>
				</div>
				<div className="flex flex-col gap-0.5 px-2 py-1">
					{channels.map((c) => {
						const active = c.name === "support";
						return (
							<div
								key={c.name}
								className="flex items-center gap-2 rounded px-2 py-1"
								style={{
									background: active ? "#1164A3" : "transparent",
									color: active
										? "#fff"
										: c.unread || c.mention
											? "#fff"
											: "#B7B9BC",
									fontWeight: c.unread || c.mention || active ? 700 : 400,
								}}
							>
								<span style={{ opacity: 0.6 }}># </span>
								<span className="flex-1 truncate">{c.name}</span>
								{c.mention ? (
									<span
										className="rounded-full px-1.5 py-[1px] text-[10px]"
										style={{ background: "#E01E5A", color: "#fff", fontWeight: 700 }}
									>
										{c.mention}
									</span>
								) : c.unread ? (
									<span className="text-[10.5px]" style={{ color: "#fff" }}>
										{c.unread}
									</span>
								) : null}
							</div>
						);
					})}
				</div>
				<div className="mt-2 flex items-center justify-between px-4" style={{ color: "#8B8D91" }}>
					<span className="text-[11px] font-semibold">Direct Messages</span>
					<span className="text-[12px]">+</span>
				</div>
				<div className="flex flex-col gap-0.5 px-2 py-1">
					{[
						{ n: "Priya (you)", dot: "#3DB88B" },
						{ n: "Malay", dot: "#3DB88B" },
						{ n: "Karan", dot: "#F5C518" },
						{ n: "Alex Chen", dot: "#3B4048" },
					].map((d) => (
						<div
							key={d.n}
							className="flex items-center gap-2 rounded px-2 py-1"
							style={{ color: "#B7B9BC" }}
						>
							<span className="size-[7px] rounded-full" style={{ background: d.dot }} />
							<span className="truncate">{d.n}</span>
						</div>
					))}
				</div>
			</div>

			{/* Main pane */}
			<div className="flex min-w-0 flex-1 flex-col">
				<div
					className="flex items-center gap-2 px-4 py-3"
					style={{ borderBottom: "1px solid #2A2D31" }}
				>
					<span className="text-[15px] font-bold">
						<span style={{ color: "#8B8D91" }}># </span>support
					</span>
					<span className="text-[13px]" style={{ color: "#8B8D91" }}>▾</span>
					<span
						className="ml-2 rounded px-2 py-0.5 text-[11px]"
						style={{ background: "#2A2D31", color: "#C9C9C9" }}
					>
						12 members
					</span>
					<span className="text-[11.5px]" style={{ color: "#8B8D91" }}>
						· Product support triage · SLO: reply within 30 min
					</span>
					<div className="ml-auto flex items-center gap-3 text-[13px]" style={{ color: "#C9C9C9" }}>
						<span>📞</span>
						<span>👥</span>
						<span>📌 4</span>
						<span>⋯</span>
					</div>
				</div>

				<div className="flex flex-1 min-h-0 flex-col overflow-hidden">
					<div className="flex flex-col gap-3 px-6 py-3">
						<DayDivider label="Today" />
						<SlackMsg
							name="Alex Chen"
							avatar="#B45AA3"
							role="Customer"
							time="9:42 AM"
							body={
								<>
									The playground is not working for this user{" "}
									<span
										className="mx-0.5 rounded px-1 py-[1px]"
										style={{ background: "rgba(29,155,209,0.18)", color: "#5FA9D0" }}
									>
										@priya
									</span>{" "}
									— screenshot in thread 🙏
								</>
							}
							reactions={[
								{ emoji: "👀", count: 3 },
								{ emoji: "🔥", count: 1 },
							]}
							thread={{ count: 4, lastReply: "2 min ago" }}
						/>
						<SlackMsg
							name="Priya"
							avatar="#E01E5A"
							role="Support Eng"
							time="9:44 AM"
							body="Looking into it — do we have a session recording?"
						/>
						<SlackMsg
							name="Malay"
							avatar="#2EB67D"
							role="Platform Eng"
							time="9:45 AM"
							body={
								<>
									Pulling logs from Datadog now — errors on{" "}
									<span
										className="rounded px-1 py-[1px] font-mono text-[12.5px]"
										style={{ background: "#3B4048", color: "#F04B5B" }}
									>
										POST /v1/playground
									</span>
									. Also opening a PR to bump the timeout.
								</>
							}
							reactions={[
								{ emoji: "👍", count: 4 },
								{ emoji: "🫡", count: 2 },
							]}
						/>
						<SlackMsg
							name="Karan"
							avatar="#ECB22E"
							role="CTO"
							time="9:47 AM"
							body="If we bump the timeout let's also add retries + jitter. Don't want a thundering herd."
							reactions={[{ emoji: "✅", count: 3 }]}
						/>
					</div>

					{/* Composer */}
					<div className="mt-auto px-4 py-3">
						<div
							className="flex items-center gap-2 rounded-lg px-3 py-2"
							style={{ border: "1px solid #3B4048", background: "#222529" }}
						>
							<span style={{ color: "#8B8D91" }}>B</span>
							<span style={{ color: "#8B8D91" }}>𝘐</span>
							<span style={{ color: "#8B8D91" }}>S</span>
							<span className="flex-1 text-[13px]" style={{ color: "#8B8D91" }}>
								Message #support
							</span>
							<span style={{ color: "#8B8D91" }}>📎</span>
							<span style={{ color: "#8B8D91" }}>@</span>
							<span style={{ color: "#8B8D91" }}>😀</span>
							<span
								className="ml-1 rounded px-2 py-1 text-[11px]"
								style={{ background: "#1D9BD1", color: "#fff", fontWeight: 700 }}
							>
								Send
							</span>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}

function DayDivider({ label }: { label: string }) {
	return (
		<div className="my-1 flex items-center gap-3">
			<div className="h-px flex-1" style={{ background: "#2A2D31" }} />
			<span
				className="rounded-full px-3 py-0.5 text-[10.5px] font-semibold"
				style={{ background: "#19171D", color: "#C9C9C9", border: "1px solid #2A2D31" }}
			>
				{label}
			</span>
			<div className="h-px flex-1" style={{ background: "#2A2D31" }} />
		</div>
	);
}

function SlackMsg({
	name,
	avatar,
	role,
	time,
	body,
	reactions,
	thread,
}: {
	name: string;
	avatar: string;
	role?: string;
	time: string;
	body: React.ReactNode;
	reactions?: { emoji: string; count: number }[];
	thread?: { count: number; lastReply: string };
}) {
	return (
		<div className="flex items-start gap-3">
			<div
				className="flex size-9 shrink-0 items-center justify-center rounded"
				style={{ background: avatar, color: "#fff", fontWeight: 800, fontSize: 13 }}
			>
				{name[0]}
			</div>
			<div className="min-w-0 flex-1">
				<div className="flex items-baseline gap-2">
					<span className="text-[13.5px] font-bold">{name}</span>
					{role ? (
						<span
							className="rounded px-1 py-[1px] text-[10px] font-semibold"
							style={{ background: "#2A2D31", color: "#B7B9BC" }}
						>
							{role}
						</span>
					) : null}
					<span className="text-[11px]" style={{ color: "#8B8D91" }}>
						{time}
					</span>
				</div>
				<div className="text-[13.5px] leading-[1.4]">{body}</div>
				{reactions?.length ? (
					<div className="mt-1.5 flex flex-wrap gap-1">
						{reactions.map((r) => (
							<span
								key={r.emoji}
								className="flex items-center gap-1 rounded-full border px-2 py-[1px] text-[11px]"
								style={{
									background: "rgba(29,155,209,0.10)",
									borderColor: "rgba(29,155,209,0.35)",
									color: "#5FA9D0",
								}}
							>
								<span>{r.emoji}</span>
								<span style={{ color: "#5FA9D0", fontWeight: 700 }}>{r.count}</span>
							</span>
						))}
						<span
							className="rounded-full border px-2 py-[1px] text-[11px]"
							style={{ borderColor: "#3B4048", color: "#8B8D91" }}
						>
							+
						</span>
					</div>
				) : null}
				{thread ? (
					<div className="mt-1.5 flex items-center gap-2 text-[11.5px]" style={{ color: "#5FA9D0" }}>
						<div className="flex -space-x-1.5">
							{["#E01E5A", "#2EB67D", "#ECB22E"].map((c, i) => (
								<span
									key={i}
									className="inline-block size-[16px] rounded"
									style={{ background: c, border: "2px solid #1A1D21" }}
								/>
							))}
						</div>
						<span style={{ fontWeight: 700 }}>{thread.count} replies</span>
						<span style={{ color: "#8B8D91" }}>Last reply {thread.lastReply}</span>
					</div>
				) : null}
			</div>
		</div>
	);
}

/* ─── Datadog (compact log explorer) ─────────────────────────────────────── */

function DatadogFake() {
	const rows: { t: string; level: "INFO" | "WARN" | "ERROR"; msg: React.ReactNode; bg?: string }[] = [
		{
			t: "14:22:31.884",
			level: "ERROR",
			msg: (
				<>
					<span style={{ color: "#F04B5B" }}>POST /v1/playground</span> — 500
					Internal Server Error <span style={{ color: "#8A8A9C" }}>· duration=30.02s</span>
				</>
			),
			bg: "rgba(240,75,91,0.14)",
		},
		{ t: "14:22:31.883", level: "INFO", msg: "user_id=u_47812 org=acme playground=pg_9a4b" },
		{
			t: "14:22:31.879",
			level: "ERROR",
			msg: (
				<>
					<span style={{ color: "#F04B5B" }}>Error:</span> playground.run failed —{" "}
					<span style={{ color: "#E3C07B" }}>ECONNRESET</span> from executor pool
				</>
			),
			bg: "rgba(240,75,91,0.14)",
		},
		{ t: "14:22:31.412", level: "WARN", msg: "timeout waiting for backend response (30_000ms)", bg: "rgba(245,197,24,0.10)" },
		{ t: "14:22:29.184", level: "INFO", msg: "GET /v1/playgrounds/9a4b — 200 (34ms)" },
		{ t: "14:22:28.902", level: "INFO", msg: "GET /v1/users/me — 200 (11ms)" },
		{ t: "14:22:27.611", level: "WARN", msg: "db pool at 92% capacity (28/30)", bg: "rgba(245,197,24,0.10)" },
		{ t: "14:22:24.008", level: "INFO", msg: "session started · user_id=u_47812" },
	];
	const color = { INFO: "#8AB4F0", WARN: "#F5C518", ERROR: "#F04B5B" } as const;
	const facets: { label: string; opts: { name: string; n: number; on?: boolean }[] }[] = [
		{
			label: "Status",
			opts: [
				{ name: "error", n: 142, on: true },
				{ name: "warn", n: 388, on: true },
				{ name: "info", n: 3757 },
			],
		},
		{
			label: "Service",
			opts: [
				{ name: "api", n: 4211, on: true },
				{ name: "worker", n: 76 },
			],
		},
		{
			label: "Env",
			opts: [
				{ name: "prod", n: 4287, on: true },
				{ name: "staging", n: 0 },
			],
		},
	];
	return (
		<div
			className="flex h-full w-full"
			style={{ background: "#12111A", color: "#E4E7ED", fontFamily: SANS, fontSize: 12 }}
		>
			{/* Purple app rail */}
			<div
				className="flex w-[52px] shrink-0 flex-col items-center gap-3 py-3"
				style={{ background: "linear-gradient(180deg, #3A196B 0%, #24104A 100%)" }}
			>
				<div className="flex size-8 items-center justify-center rounded bg-[#632CA6] text-[12px] font-black text-white">
					🐶
				</div>
				{["📊", "📈", "🪵", "🔔", "🕸️", "🔒"].map((i, ix) => (
					<div
						key={ix}
						className="text-[13px]"
						style={{ opacity: ix === 2 ? 1 : 0.55, color: "#fff" }}
					>
						{i}
					</div>
				))}
			</div>

			<div className="flex min-w-0 flex-1 flex-col">
				{/* Top bar */}
				<div
					className="flex items-center gap-3 px-3 py-2"
					style={{ background: "#1B1B27", borderBottom: "1px solid rgba(255,255,255,0.06)" }}
				>
					<span
						className="rounded px-2 py-1 text-[10.5px] font-semibold uppercase tracking-wider"
						style={{ background: "#632CA6", color: "#fff" }}
					>
						Log Explorer
					</span>
					<div
						className="flex flex-1 items-center gap-2 rounded border px-2 py-1 font-mono text-[11px]"
						style={{ background: "#0F0E17", borderColor: "#2C2A3F", color: "#E4E7ED" }}
					>
						<span style={{ color: "#8A8A9C" }}>🔍</span>
						<span style={{ color: "#8AB4F0" }}>service:api</span>
						<span style={{ color: "#F5C518" }}>env:prod</span>
						<span style={{ color: "#F04B5B" }}>status:(error OR warn)</span>
						<span style={{ color: "#8A8A9C" }}>@endpoint:/v1/playground</span>
					</div>
					<span
						className="rounded border px-2 py-1 text-[10.5px]"
						style={{ borderColor: "#2C2A3F", color: "#C6B0EF" }}
					>
						Past 15 min ▾
					</span>
				</div>

				<div className="flex min-h-0 flex-1">
					{/* Facets sidebar */}
					<div
						className="flex w-[168px] shrink-0 flex-col gap-3 px-3 py-3"
						style={{ background: "#15141F", borderRight: "1px solid rgba(255,255,255,0.06)" }}
					>
						{facets.map((f) => (
							<div key={f.label} className="flex flex-col gap-1">
								<div
									className="text-[10px] uppercase tracking-wider"
									style={{ color: "#8A8A9C" }}
								>
									{f.label}
								</div>
								{f.opts.map((o) => (
									<div
										key={o.name}
										className="flex items-center gap-1.5 text-[11px]"
										style={{ color: o.on ? "#fff" : "#B0AFC0" }}
									>
										<span
											className="flex size-[11px] items-center justify-center rounded-[2px]"
											style={{
												border: `1px solid ${o.on ? "#8B5CF6" : "#3D3B52"}`,
												background: o.on ? "#8B5CF6" : "transparent",
												color: "#fff",
												fontSize: 9,
											}}
										>
											{o.on ? "✓" : ""}
										</span>
										<span className="flex-1 truncate">{o.name}</span>
										<span style={{ color: "#5E5E70" }}>{o.n.toLocaleString()}</span>
									</div>
								))}
							</div>
						))}
					</div>

					{/* Main pane */}
					<div className="flex min-w-0 flex-1 flex-col">
						{/* Bar histogram */}
						<div
							className="flex flex-col gap-1 px-3 py-2"
							style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
						>
							<div className="flex items-center justify-between text-[10.5px]" style={{ color: "#8A8A9C" }}>
								<span>4,287 events</span>
								<span>Auto-refresh · 30s</span>
							</div>
							<div className="flex h-[54px] items-end gap-[2px]">
								{Array.from({ length: 48 }).map((_, i) => {
									const t = (Math.sin(i * 0.6) + 1) / 2;
									const err = i >= 42 ? 32 + t * 22 : t * 6;
									const warn = 6 + t * 14;
									const info = 20 + t * 30;
									const total = err + warn + info;
									return (
										<div key={i} className="flex flex-1 flex-col justify-end">
											<div style={{ height: `${(err / total) * 100}%`, background: "#F04B5B" }} />
											<div style={{ height: `${(warn / total) * 100}%`, background: "#F5C518" }} />
											<div style={{ height: `${(info / total) * 100}%`, background: "#4A6FB0" }} />
										</div>
									);
								})}
							</div>
						</div>
						{/* Column headers */}
						<div
							className="grid grid-cols-[100px_50px_1fr] gap-3 px-3 py-1 text-[10px] uppercase tracking-wider"
							style={{ borderBottom: "1px solid rgba(255,255,255,0.06)", color: "#8A8A9C" }}
						>
							<span>Date</span>
							<span>Status</span>
							<span>Content</span>
						</div>
						{/* Log rows */}
						<div className="flex-1 overflow-hidden font-mono text-[11.5px]">
							{rows.map((r, i) => (
								<div
									key={i}
									className="grid grid-cols-[100px_50px_1fr] gap-3 px-3 py-1"
									style={{ background: r.bg, borderBottom: "1px solid rgba(255,255,255,0.04)" }}
								>
									<span style={{ color: "#5E5E70" }}>{r.t}</span>
									<span
										className="shrink-0 rounded px-1.5 text-center"
										style={{
											color: color[r.level],
											border: `1px solid ${color[r.level]}55`,
											background: `${color[r.level]}22`,
											fontWeight: 700,
											fontSize: 10.5,
										}}
									>
										{r.level}
									</span>
									<span className="truncate">{r.msg}</span>
								</div>
							))}
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}

/* ─── PostHog (session recording) ─────────────────────────────────────────── */

function PostHogFake() {
	const events: { t: string; type: string; label: string; ok: boolean }[] = [
		{ t: "0:12", type: "$pageview", label: "/dashboard", ok: true },
		{ t: "0:34", type: "click", label: "New playground", ok: true },
		{ t: "0:58", type: "$pageview", label: "/playground/pg_9a4b", ok: true },
		{ t: "1:22", type: "input", label: "code editor", ok: true },
		{ t: "2:41", type: "click", label: "Run", ok: true },
		{ t: "3:11", type: "$autocapture", label: "toast: Retrying…", ok: false },
		{ t: "3:41", type: "$pageview", label: "/playground/pg_9a4b (reload)", ok: false },
		{ t: "4:12", type: "click", label: "Contact support", ok: false },
	];
	return (
		<div
			className="flex h-full w-full"
			style={{ background: "#F6F7F9", color: "#1E1F26", fontFamily: SANS, fontSize: 12 }}
		>
			{/* Left nav */}
			<div
				className="flex w-[180px] shrink-0 flex-col gap-1 px-3 py-3"
				style={{ background: "#111827", color: "#E5E7EB", borderRight: "1px solid #1F2937" }}
			>
				<div className="mb-2 flex items-center gap-2">
					<div
						className="flex size-7 items-center justify-center rounded-md"
						style={{ background: "#F9BD2B", color: "#111", fontWeight: 900, fontSize: 13 }}
					>
						🦔
					</div>
					<span className="text-[13px] font-bold">PostHog</span>
				</div>
				{[
					{ i: "📊", n: "Product analytics" },
					{ i: "🎬", n: "Session replay", on: true },
					{ i: "🎯", n: "Feature flags" },
					{ i: "🅰️", n: "Experiments" },
					{ i: "🔥", n: "Heatmaps" },
					{ i: "⚗️", n: "Surveys" },
					{ i: "📥", n: "Data pipelines" },
				].map((r) => (
					<div
						key={r.n}
						className="flex items-center gap-2 rounded px-2 py-1 text-[11.5px]"
						style={{
							background: r.on ? "rgba(249,189,43,0.14)" : "transparent",
							color: r.on ? "#F9BD2B" : "#9CA3AF",
							fontWeight: r.on ? 700 : 400,
							borderLeft: r.on ? "2px solid #F9BD2B" : "2px solid transparent",
						}}
					>
						<span className="w-4">{r.i}</span>
						<span className="truncate">{r.n}</span>
					</div>
				))}
			</div>

			{/* Session pane */}
			<div className="flex min-w-0 flex-1 flex-col">
				<div
					className="flex items-center gap-3 px-4 py-2"
					style={{ background: "#fff", borderBottom: "1px solid #E5E7EB" }}
				>
					<span className="text-[10px] uppercase tracking-wider" style={{ color: "#6B7280" }}>
						Session replay
					</span>
					<span style={{ color: "#9CA3AF" }}>/</span>
					<span className="text-[12.5px] font-bold">u_47812</span>
					<span
						className="rounded px-2 py-0.5 text-[10.5px]"
						style={{ background: "#F3F4F6", color: "#374151" }}
					>
						acme.com
					</span>
					<span className="text-[11px]" style={{ color: "#6B7280" }}>
						Chrome 128 · macOS · 1440×900
					</span>
					<span
						className="ml-auto rounded px-2 py-1 text-[10.5px] font-semibold"
						style={{ background: "#EF4444", color: "#fff" }}
					>
						● Rage-clicked
					</span>
					<span
						className="rounded px-2 py-1 text-[10.5px] font-semibold"
						style={{ background: "#1D4AFF", color: "#fff" }}
					>
						Watch ▸
					</span>
				</div>

				<div className="flex min-h-0 flex-1">
					{/* Player */}
					<div className="flex min-w-0 flex-1 flex-col items-center justify-center px-4 py-4">
						<div
							className="relative flex w-full flex-col rounded-md"
							style={{
								maxWidth: 620,
								height: 340,
								background: "#fff",
								boxShadow: "0 20px 40px rgba(0,0,0,0.15), 0 1px 0 rgba(0,0,0,0.05)",
								border: "1px solid #E5E7EB",
								overflow: "hidden",
							}}
						>
							<div className="flex items-center gap-1.5 border-b px-3 py-1.5">
								<span className="size-[8px] rounded-full bg-[#FF5F57]" />
								<span className="size-[8px] rounded-full bg-[#FEBC2E]" />
								<span className="size-[8px] rounded-full bg-[#28C840]" />
								<span
									className="ml-3 flex-1 rounded px-2 py-1 text-[10px] font-mono"
									style={{ background: "#F3F4F6", color: "#6B7280" }}
								>
									composio.dev/playground/pg_9a4b
								</span>
							</div>
							<div className="flex flex-1 flex-col p-4 gap-3">
								<div className="flex items-center gap-2 border-b pb-2">
									<div className="size-4 rounded" style={{ background: "#111" }} />
									<span className="text-[12px] font-semibold">Playground</span>
									<span
										className="ml-auto rounded bg-[#EF4444] px-1.5 py-0.5 text-[10px] font-semibold text-white"
									>
										Broken
									</span>
								</div>
								<div
									className="relative flex flex-1 items-center justify-center rounded-md"
									style={{ background: "#FEE2E2", color: "#991B1B" }}
								>
									<div className="flex flex-col items-center gap-1">
										<span className="text-[32px]">⚠</span>
										<span className="text-[12px] font-semibold">
											Something went wrong
										</span>
										<span className="text-[10.5px]" style={{ color: "#B91C1C" }}>
											Request timed out. Please try again.
										</span>
									</div>
									{/* Rage-click ripples */}
									{[0, 1, 2].map((i) => (
										<span
											key={i}
											className="absolute size-8 rounded-full"
											style={{
												left: `${58 + i * 3}%`,
												top: `${65 + i * 2}%`,
												border: "2px solid rgba(239,68,68,0.5)",
											}}
										/>
									))}
								</div>
							</div>
						</div>
					</div>

					{/* Right rail: events + console */}
					<div
						className="flex w-[260px] shrink-0 flex-col"
						style={{ background: "#fff", borderLeft: "1px solid #E5E7EB" }}
					>
						<div className="flex border-b" style={{ borderColor: "#E5E7EB" }}>
							{["Events", "Console", "Network"].map((t, i) => (
								<span
									key={t}
									className="px-3 py-2 text-[11px] font-semibold"
									style={{
										color: i === 0 ? "#1D4AFF" : "#6B7280",
										borderBottom: i === 0 ? "2px solid #1D4AFF" : "none",
									}}
								>
									{t}
								</span>
							))}
						</div>
						<div className="flex-1 overflow-hidden">
							{events.map((e, i) => (
								<div
									key={i}
									className="flex items-start gap-2 border-b px-3 py-1.5"
									style={{
										borderColor: "#F3F4F6",
										background: e.ok ? undefined : "rgba(239,68,68,0.06)",
									}}
								>
									<span
										className="mt-1 size-[6px] rounded-full"
										style={{ background: e.ok ? "#3EB489" : "#EF4444" }}
									/>
									<div className="min-w-0 flex-1">
										<div className="flex items-baseline justify-between">
											<span
												className="rounded px-1 py-[1px] text-[10px] font-mono"
												style={{ background: "#F3F4F6", color: "#4B5563" }}
											>
												{e.type}
											</span>
											<span className="text-[10px]" style={{ color: "#9CA3AF" }}>
												{e.t}
											</span>
										</div>
										<div className="truncate text-[11.5px]">{e.label}</div>
									</div>
								</div>
							))}
						</div>
					</div>
				</div>

				{/* Timeline / scrubber */}
				<div
					className="flex items-center gap-3 px-4 py-2"
					style={{ background: "#fff", borderTop: "1px solid #E5E7EB" }}
				>
					<span className="text-[11px]" style={{ color: "#6B7280" }}>0:00</span>
					<div className="relative h-[6px] flex-1 rounded-full" style={{ background: "#E5E7EB" }}>
						{/* Colored event markers */}
						{[10, 22, 34, 48, 68, 76, 88].map((p, i) => (
							<span
								key={i}
								className="absolute -top-[2px] size-[10px] rounded-full"
								style={{
									left: `${p}%`,
									background: i >= 5 ? "#EF4444" : "#3EB489",
									border: "1px solid #fff",
								}}
							/>
						))}
						<div className="absolute left-0 h-full rounded-full" style={{ width: "62%", background: "#1D4AFF" }} />
						<span
							className="absolute -top-[3px] size-[12px] rounded-full"
							style={{ left: "62%", background: "#1D4AFF", border: "2px solid #fff" }}
						/>
					</div>
					<span className="text-[11px]" style={{ color: "#6B7280" }}>4:12</span>
					<span className="rounded px-1.5 py-1 text-[11px]" style={{ background: "#F3F4F6" }}>
						1×
					</span>
					<span className="rounded px-1.5 py-1 text-[11px]" style={{ background: "#F3F4F6" }}>
						⇒
					</span>
				</div>
			</div>
		</div>
	);
}

/* ─── VSCode (playground.ts) ─────────────────────────────────────────────── */

function VSCodeFake() {
	// Token colors mimic Dark+ theme.
	const C = {
		kw: "#569CD6", // import/export/const/if/await
		id: "#DCDCAA", // function names
		type: "#4EC9B0", // types
		str: "#CE9178", // strings
		num: "#B5CEA8", // numbers
		com: "#6A9955", // comments
		punc: "#D4D4D4",
	};
	type Line = { n: number; content: React.ReactNode; hi?: boolean; error?: boolean };
	const lines: Line[] = [
		{ n: 1, content: <><span style={{ color: C.kw }}>import</span> {"{ "}<span style={{ color: C.type }}>Playground</span>{" }"} <span style={{ color: C.kw }}>from</span> <span style={{ color: C.str }}>{'"./types"'}</span>;</> },
		{ n: 2, content: <><span style={{ color: C.kw }}>import</span> {"{ "}<span style={{ color: C.id }}>redis</span>{" }"} <span style={{ color: C.kw }}>from</span> <span style={{ color: C.str }}>{'"~/lib/redis"'}</span>;</> },
		{ n: 3, content: <> </> },
		{ n: 4, content: <><span style={{ color: C.com }}>{'/** Runs a playground and returns its output. */'}</span></> },
		{ n: 5, content: <><span style={{ color: C.kw }}>export</span> <span style={{ color: C.kw }}>async</span> <span style={{ color: C.kw }}>function</span> <span style={{ color: C.id }}>runPlayground</span>(<span>id</span>: <span style={{ color: C.type }}>string</span>) {"{"}</> },
		{ n: 6, content: <>{"  "}<span style={{ color: C.kw }}>const</span> pg = <span style={{ color: C.kw }}>await</span> redis.<span style={{ color: C.id }}>get</span>&lt;<span style={{ color: C.type }}>Playground</span>&gt;(<span style={{ color: C.str }}>{"`pg:${id}`"}</span>);</> },
		{ n: 7, content: <>{"  "}<span style={{ color: C.kw }}>if</span> (!pg) <span style={{ color: C.kw }}>throw</span> <span style={{ color: C.kw }}>new</span> <span style={{ color: C.type }}>Error</span>(<span style={{ color: C.str }}>{'"not found"'}</span>);</> },
		{ n: 8, content: <> </> },
		{ n: 9, content: <>{"  "}<span style={{ color: C.kw }}>const</span> result = <span style={{ color: C.kw }}>await</span> <span style={{ color: C.id }}>execute</span>(pg, {"{"}</> },
		{ n: 10, content: <>{"    "}timeout: <span style={{ color: C.num }}>30_000</span>, <span style={{ color: C.com }}>{'// ← the 30s that kept failing'}</span></>, hi: true, error: true },
		{ n: 11, content: <>{"  "}{"});"}</> },
		{ n: 12, content: <> </> },
		{ n: 13, content: <>{"  "}<span style={{ color: C.kw }}>return</span> result;</> },
		{ n: 14, content: <>{"}"}</> },
	];
	const openFiles = [
		{ name: "playground.ts", active: true, mod: true },
		{ name: "execute.ts", active: false, mod: false },
		{ name: "types.ts", active: false, mod: false },
	];
	return (
		<div
			className="flex h-full w-full flex-col"
			style={{ background: "#1E1E1E", color: "#D4D4D4", fontFamily: SANS, fontSize: 12 }}
		>
			<div className="flex flex-1 min-h-0">
				{/* Activity bar */}
				<div
					className="flex w-[48px] shrink-0 flex-col items-center gap-4 py-3"
					style={{ background: "#333333", color: "#858585" }}
				>
					{[
						{ i: "📄", on: true },
						{ i: "🔎", on: false },
						{ i: "⎇", on: false, badge: 3 },
						{ i: "▶", on: false },
						{ i: "🧩", on: false },
						{ i: "⚠", on: false, badge: 1 },
					].map((r, ix) => (
						<div key={ix} className="relative text-[15px]" style={{ opacity: r.on ? 1 : 0.55, color: r.on ? "#fff" : undefined }}>
							{r.i}
							{r.badge ? (
								<span
									className="absolute -right-1.5 -top-1.5 flex size-[14px] items-center justify-center rounded-full text-[9px] font-bold text-white"
									style={{ background: "#007ACC" }}
								>
									{r.badge}
								</span>
							) : null}
						</div>
					))}
					<div className="mt-auto text-[15px]" style={{ opacity: 0.55 }}>
						⚙
					</div>
				</div>

				{/* Sidebar */}
				<div
					className="flex w-[220px] shrink-0 flex-col"
					style={{ background: "#252526", borderRight: "1px solid #333" }}
				>
					<div
						className="flex items-center justify-between px-3 py-1.5 text-[10.5px] uppercase tracking-wider"
						style={{ color: "#CCCCCC" }}
					>
						<span>Explorer</span>
						<span style={{ color: "#858585" }}>⋯</span>
					</div>
					<div
						className="flex items-center justify-between px-3 py-1 text-[10.5px] font-semibold uppercase"
						style={{ color: "#CCCCCC", background: "#2D2D2D" }}
					>
						<span>▾ COMPOSIO</span>
					</div>
					<div className="text-[12.5px]" style={{ color: "#D4D4D4" }}>
						{[
							{ d: 1, l: "▾ apps" },
							{ d: 2, l: "▾ web" },
							{ d: 3, l: "▾ src" },
							{ d: 4, l: "▾ playground", active: true },
							{ d: 5, l: "playground.ts", tint: "#3178C6", sel: true, mod: true },
							{ d: 5, l: "execute.ts", tint: "#3178C6", mod: false },
							{ d: 5, l: "types.ts", tint: "#3178C6" },
							{ d: 4, l: "▸ auth" },
							{ d: 4, l: "▸ dashboard" },
							{ d: 3, l: "▸ pages" },
							{ d: 2, l: "▸ tests" },
							{ d: 1, l: "▸ packages" },
							{ d: 1, l: "▸ .github" },
						].map((f, i) => (
							<div
								key={i}
								className="flex items-center gap-1 py-0.5"
								style={{
									paddingLeft: 8 + f.d * 8,
									background: f.sel ? "#37373D" : undefined,
									color: f.sel ? "#fff" : undefined,
									fontWeight: f.active ? 600 : 400,
								}}
							>
								{f.tint ? (
									<span
										className="mr-1 text-[9px] font-bold"
										style={{ color: f.tint }}
									>
										TS
									</span>
								) : null}
								<span className="flex-1 truncate">{f.l}</span>
								{f.mod ? <span style={{ color: "#E2C08D" }}>●</span> : null}
							</div>
						))}
					</div>
					<div
						className="mt-auto flex items-center justify-between px-3 py-1.5 text-[10.5px] uppercase tracking-wider"
						style={{ color: "#CCCCCC", borderTop: "1px solid #333" }}
					>
						<span>▸ Outline</span>
						<span>▸ Timeline</span>
					</div>
				</div>

				{/* Editor + panel */}
				<div className="flex min-w-0 flex-1 flex-col">
					{/* Tabs */}
					<div className="flex" style={{ background: "#2D2D30", borderBottom: "1px solid #333" }}>
						{openFiles.map((f) => (
							<div
								key={f.name}
								className="flex items-center gap-2 px-3 py-1.5 text-[12px]"
								style={{
									background: f.active ? "#1E1E1E" : "#2D2D30",
									color: f.active ? "#fff" : "#858585",
									borderRight: "1px solid #252526",
									borderTop: f.active ? "1px solid #007ACC" : "1px solid transparent",
								}}
							>
								<span style={{ color: "#3178C6", fontWeight: 700, fontSize: 9 }}>TS</span>
								<span>{f.name}</span>
								<span style={{ color: f.mod ? "#E2C08D" : "#858585" }}>{f.mod ? "●" : "✕"}</span>
							</div>
						))}
						<div className="ml-auto flex items-center gap-3 px-3" style={{ color: "#858585" }}>
							<span>↩</span>
							<span>⤢</span>
							<span>⋯</span>
						</div>
					</div>
					{/* Breadcrumb */}
					<div
						className="flex items-center gap-1 px-3 py-1 text-[11px]"
						style={{ background: "#1E1E1E", color: "#858585", borderBottom: "1px solid #252526" }}
					>
						<span>apps</span>
						<span>›</span>
						<span>web</span>
						<span>›</span>
						<span>src</span>
						<span>›</span>
						<span>playground</span>
						<span>›</span>
						<span style={{ color: "#CCC" }}>playground.ts</span>
						<span>›</span>
						<span style={{ color: "#DCDCAA" }}>runPlayground</span>
					</div>
					{/* Editor + minimap */}
					<div className="flex flex-1 min-h-0">
						<pre
							className="m-0 flex-1 overflow-hidden px-2 py-2 text-[12.5px] leading-[1.55]"
							style={{ fontFamily: '"JetBrains Mono", ui-monospace, monospace', whiteSpace: "pre" }}
						>
							{lines.map((l) => (
								<div
									key={l.n}
									className="flex"
									style={{ background: l.hi ? "rgba(255,255,255,0.05)" : undefined }}
								>
									<span
										className="w-[36px] shrink-0 text-right pr-3"
										style={{ color: l.hi ? "#fff" : "#858585" }}
									>
										{l.n}
									</span>
									<span
										className="mr-1 shrink-0 text-right"
										style={{ color: l.error ? "#F14C4C" : "transparent", width: 10 }}
									>
										●
									</span>
									<span>{l.content}</span>
								</div>
							))}
						</pre>
						{/* Minimap */}
						<div
							className="w-[68px] shrink-0"
							style={{ background: "#1E1E1E", borderLeft: "1px solid #252526" }}
						>
							<div className="p-1.5">
								{lines.map((l) => (
									<div key={l.n} className="mb-[3px] flex gap-[1px]">
										{Array.from({ length: 12 }).map((_, i) => (
											<span
												key={i}
												style={{
													width: 3,
													height: 3,
													background:
														i > 8
															? "transparent"
															: l.error && i > 4
																? "#F14C4C"
																: l.n === 10 && i < 6
																	? "#B5CEA8"
																	: l.n < 3 || l.n === 5
																		? "#569CD6"
																		: "#4E4E4E",
													opacity: l.n < 3 || (l.n === 5 && i < 4) ? 1 : 0.55,
												}}
											/>
										))}
									</div>
								))}
							</div>
						</div>
					</div>
					{/* Panel: Problems */}
					<div
						className="flex flex-col"
						style={{ background: "#1E1E1E", borderTop: "1px solid #252526", height: 90 }}
					>
						<div className="flex items-center gap-4 px-3 py-1 text-[11px]" style={{ borderBottom: "1px solid #252526" }}>
							<span style={{ color: "#fff", borderBottom: "1px solid #fff" }}>PROBLEMS</span>
							<span style={{ color: "#858585" }}>OUTPUT</span>
							<span style={{ color: "#858585" }}>DEBUG CONSOLE</span>
							<span style={{ color: "#858585" }}>TERMINAL</span>
							<span
								className="ml-auto rounded-full px-1.5 py-[1px] text-[9px] font-bold text-white"
								style={{ background: "#F14C4C" }}
							>
								1
							</span>
						</div>
						<div className="flex items-start gap-2 px-3 py-1 font-mono text-[11px]">
							<span style={{ color: "#F14C4C" }}>✕</span>
							<span style={{ color: "#F14C4C" }}>[error]</span>
							<span>
								Request timed out (30_000ms) — <span style={{ color: "#E2C08D" }}>execute.ts</span>
								<span style={{ color: "#858585" }}> · line 42</span>
							</span>
						</div>
						<div className="flex items-start gap-2 px-3 py-1 font-mono text-[11px]">
							<span style={{ color: "#CCA700" }}>⚠</span>
							<span style={{ color: "#CCA700" }}>[warn]</span>
							<span>
								Consider adding retries when timeout &gt; 10_000ms.
							</span>
						</div>
					</div>
				</div>
			</div>
			{/* Status bar */}
			<div
				className="flex items-center gap-3 px-3 py-1 text-[11px]"
				style={{ background: "#007ACC", color: "#fff" }}
			>
				<span>⎇ fix/playground-timeout</span>
				<span>↑ 3 ↓ 0</span>
				<span>✕ 1</span>
				<span>⚠ 2</span>
				<span className="ml-auto">Ln 10, Col 22</span>
				<span>Spaces: 2</span>
				<span>UTF-8</span>
				<span>TypeScript React</span>
				<span>⚡ Prettier</span>
			</div>
		</div>
	);
}

/* ─── GitHub (pull request) ──────────────────────────────────────────────── */

function GitHubFake() {
	return (
		<div
			className="flex h-full w-full flex-col"
			style={{ background: "#0D1117", color: "#E6EDF3", fontFamily: SANS, fontSize: 12 }}
		>
			{/* App bar */}
			<div
				className="flex items-center gap-3 px-4 py-2"
				style={{ background: "#010409", borderBottom: "1px solid #21262D" }}
			>
				<span className="text-[16px]">🐙</span>
				<div
					className="flex flex-1 items-center gap-2 rounded-md px-2 py-1"
					style={{ background: "#0D1117", border: "1px solid #21262D", color: "#7D8590" }}
				>
					<span>🔍</span>
					<span className="text-[11.5px]">Type / to search</span>
					<span className="ml-auto rounded border px-1 py-[1px] text-[10px]" style={{ borderColor: "#30363D" }}>
						⌘K
					</span>
				</div>
				{["Pulls", "Issues", "Marketplace", "Explore"].map((t) => (
					<span key={t} className="text-[11.5px]" style={{ color: "#E6EDF3" }}>
						{t}
					</span>
				))}
				<div className="flex items-center gap-2 text-[13px]">
					<span>🔔</span>
					<span>+</span>
					<span
						className="flex size-5 items-center justify-center rounded-full"
						style={{ background: "#8B5CF6", fontSize: 10, fontWeight: 700 }}
					>
						M
					</span>
				</div>
			</div>

			{/* Repo header */}
			<div className="px-6 pt-3 pb-2" style={{ borderBottom: "1px solid #21262D" }}>
				<div className="flex items-center gap-2 text-[13px]">
					<span>📖</span>
					<span style={{ color: "#2F81F7" }}>composio</span>
					<span style={{ color: "#7D8590" }}>/</span>
					<span className="font-semibold" style={{ color: "#2F81F7" }}>
						composio
					</span>
					<span
						className="ml-2 rounded-full px-2 py-0.5 text-[10px]"
						style={{ border: "1px solid #30363D", color: "#7D8590" }}
					>
						Public
					</span>
					<div className="ml-auto flex items-center gap-1.5 text-[10.5px]">
						<span
							className="rounded-md border px-2 py-1"
							style={{ borderColor: "#30363D" }}
						>
							☆ Star 24.3k
						</span>
						<span
							className="rounded-md border px-2 py-1"
							style={{ borderColor: "#30363D" }}
						>
							⑂ Fork 1.4k
						</span>
					</div>
				</div>
				<div className="mt-2 flex gap-5 text-[11.5px]" style={{ color: "#E6EDF3" }}>
					{[
						{ i: "◇", l: "Code" },
						{ i: "⊙", l: "Issues", n: 82 },
						{ i: "⇅", l: "Pull requests", n: 12, active: true },
						{ i: "▶", l: "Actions" },
						{ i: "⚏", l: "Projects" },
						{ i: "🔒", l: "Security" },
						{ i: "📈", l: "Insights" },
					].map((t) => (
						<span
							key={t.l}
							className="pb-1"
							style={{
								borderBottom: t.active ? "2px solid #F78166" : "none",
								fontWeight: t.active ? 600 : 400,
								color: t.active ? "#E6EDF3" : "#7D8590",
							}}
						>
							<span className="mr-1">{t.i}</span>
							{t.l}
							{t.n ? (
								<span
									className="ml-1 rounded-full px-1.5 py-0.5 text-[10px]"
									style={{ background: "#21262D" }}
								>
									{t.n}
								</span>
							) : null}
						</span>
					))}
				</div>
			</div>

			{/* PR title */}
			<div className="px-6 pt-3">
				<div className="flex items-center gap-2">
					<span
						className="rounded-full px-2.5 py-1 text-[11px] font-semibold"
						style={{ background: "#238636", color: "#fff" }}
					>
						● Open
					</span>
					<span className="text-[16px] font-semibold">
						Fix playground timeout for large workspaces
					</span>
					<span className="text-[16px]" style={{ color: "#7D8590" }}>#4211</span>
				</div>
				<div className="mt-1 text-[12px]" style={{ color: "#7D8590" }}>
					<span style={{ color: "#E6EDF3", fontWeight: 600 }}>malayvasa</span> wants to
					merge <span style={{ color: "#E6EDF3" }}>3 commits</span> into{" "}
					<span
						className="rounded px-1 py-[1px]"
						style={{ background: "#0d1a2b", color: "#7CE38B", border: "1px solid #21262D" }}
					>
						main
					</span>{" "}
					from{" "}
					<span
						className="rounded px-1 py-[1px]"
						style={{ background: "#0d1a2b", color: "#7CE38B", border: "1px solid #21262D" }}
					>
						fix/playground-timeout
					</span>
					<span className="mx-2">·</span>
					<span>opened 12 minutes ago by <span style={{ color: "#2F81F7" }}>malayvasa</span></span>
				</div>
			</div>

			{/* PR tabs */}
			<div className="mt-2 flex gap-6 px-6 text-[12.5px]" style={{ borderBottom: "1px solid #21262D" }}>
				{[
					{ label: "Conversation", n: 4, i: "💬", active: false },
					{ label: "Commits", n: 3, i: "◇", active: false },
					{ label: "Checks", n: 12, i: "✓", active: false },
					{ label: "Files changed", n: 2, i: "≡", active: true },
				].map((t) => (
					<div
						key={t.label}
						className="pb-2 pt-1"
						style={{
							color: t.active ? "#E6EDF3" : "#7D8590",
							fontWeight: t.active ? 600 : 400,
							borderBottom: t.active ? "2px solid #F78166" : "none",
						}}
					>
						<span className="mr-1">{t.i}</span>
						{t.label}{" "}
						<span
							className="ml-1 rounded-full px-1.5 py-0.5 text-[10.5px]"
							style={{ background: "#21262D" }}
						>
							{t.n}
						</span>
					</div>
				))}
			</div>

			{/* Main: diff on the left, sidebar on the right */}
			<div className="flex flex-1 min-h-0 gap-4 px-6 py-3">
				<div className="flex min-w-0 flex-1 flex-col gap-3">
					{/* Checks summary strip */}
					<div
						className="flex items-center gap-3 rounded-md border px-3 py-2"
						style={{ borderColor: "#30363D", background: "#0D1117" }}
					>
						<span style={{ color: "#3FB950" }}>✓</span>
						<span className="text-[11.5px]">
							<span style={{ color: "#E6EDF3", fontWeight: 600 }}>All checks passed</span>
							<span style={{ color: "#7D8590" }}> · 12 successful (2 skipped)</span>
						</span>
						<span
							className="ml-auto rounded-md px-2 py-1 text-[11px] font-semibold"
							style={{ background: "#238636", color: "#fff" }}
						>
							Merge pull request ▾
						</span>
					</div>

					{/* Diff file */}
					<div
						className="rounded-md border font-mono text-[11.5px]"
						style={{ borderColor: "#30363D", background: "#0D1117" }}
					>
						<div
							className="flex items-center gap-2 border-b px-3 py-2"
							style={{ borderColor: "#30363D" }}
						>
							<span style={{ color: "#7D8590" }}>▾</span>
							<span style={{ color: "#3178C6", fontWeight: 700, fontSize: 10 }}>TS</span>
							<span>apps/web/src/playground.ts</span>
							<span
								className="rounded-full px-1.5 py-[1px] text-[10px]"
								style={{ background: "#161B22", color: "#7D8590" }}
							>
								+4 −1
							</span>
							<span className="ml-auto flex items-center gap-3 text-[11px]" style={{ color: "#7D8590" }}>
								<span>Viewed</span>
								<span>⋯</span>
							</span>
						</div>
						<pre className="m-0 overflow-hidden py-1 leading-[1.55]" style={{ whiteSpace: "pre" }}>
							<DiffLine n={7} kind="ctx" text=" export async function runPlayground(id: string) {" />
							<DiffLine n={8} kind="ctx" text="   const pg = await redis.get<Playground>(`pg:${id}`);" />
							<DiffLine n={9} kind="ctx" text="   if (!pg) throw new Error('not found');" />
							<DiffLine n={10} kind="ctx" text=" " />
							<DiffLine n={11} kind="ctx" text="   const result = await execute(pg, {" />
							<DiffLine n={12} kind="del" text="    timeout: 30_000," />
							<DiffLine n={12} kind="add" text="    timeout: 120_000," />
							<DiffLine n={13} kind="add" text="    retries: 2," />
							<DiffLine n={14} kind="add" text="    backoff: 'exponential'," />
							<DiffLine n={15} kind="add" text="    jitter: true," />
							<DiffLine n={16} kind="ctx" text="   });" />
							<DiffLine n={17} kind="ctx" text=" " />
							<DiffLine n={18} kind="ctx" text="   return result;" />
						</pre>
					</div>
				</div>

				{/* Sidebar */}
				<div className="hidden w-[188px] shrink-0 flex-col gap-3 text-[11.5px] md:flex">
					<SidebarBlock
						label="Reviewers"
						content={
							<>
								<div className="flex items-center gap-1.5">
									<span
										className="flex size-4 items-center justify-center rounded-full"
										style={{ background: "#F5C518", color: "#111", fontWeight: 800, fontSize: 9 }}
									>
										K
									</span>
									<span>karan-vaidya</span>
									<span className="ml-auto" style={{ color: "#3FB950" }}>✓</span>
								</div>
								<div className="mt-1 flex items-center gap-1.5">
									<span
										className="flex size-4 items-center justify-center rounded-full"
										style={{ background: "#8B5CF6", color: "#fff", fontWeight: 800, fontSize: 9 }}
									>
										P
									</span>
									<span>priyasrini</span>
									<span className="ml-auto" style={{ color: "#F5C518" }}>◐</span>
								</div>
							</>
						}
					/>
					<SidebarBlock
						label="Assignees"
						content={
							<div className="flex items-center gap-1.5">
								<span
									className="flex size-4 items-center justify-center rounded-full"
									style={{ background: "#2F81F7", color: "#fff", fontWeight: 800, fontSize: 9 }}
								>
									M
								</span>
								<span>malayvasa</span>
							</div>
						}
					/>
					<SidebarBlock
						label="Labels"
						content={
							<div className="flex flex-wrap gap-1">
								{[
									{ l: "bug", c: "#F85149" },
									{ l: "playground", c: "#8B5CF6" },
									{ l: "prod-hotfix", c: "#F78166" },
								].map((l) => (
									<span
										key={l.l}
										className="rounded-full px-2 py-[1px] text-[10px] font-semibold"
										style={{ background: `${l.c}22`, color: l.c, border: `1px solid ${l.c}55` }}
									>
										{l.l}
									</span>
								))}
							</div>
						}
					/>
					<SidebarBlock
						label="Milestone"
						content={<span style={{ color: "#2F81F7" }}>v0.42.0 (3 of 8 done)</span>}
					/>
					<SidebarBlock
						label="Linked issues"
						content={
							<>
								<div>
									<span style={{ color: "#7D8590" }}>Closes </span>
									<span style={{ color: "#2F81F7" }}>#4198</span>
								</div>
								<div>
									<span style={{ color: "#7D8590" }}>Closes </span>
									<span style={{ color: "#2F81F7" }}>#4210</span>
								</div>
							</>
						}
					/>
				</div>
			</div>
		</div>
	);
}

function SidebarBlock({
	label,
	content,
}: {
	label: string;
	content: React.ReactNode;
}) {
	return (
		<div className="border-b pb-3" style={{ borderColor: "#21262D" }}>
			<div
				className="mb-1 flex items-center justify-between text-[11px]"
				style={{ color: "#7D8590" }}
			>
				<span className="font-semibold">{label}</span>
				<span>⚙</span>
			</div>
			{content}
		</div>
	);
}

function DiffLine({
	n,
	kind,
	text,
}: {
	n: number;
	kind: "ctx" | "add" | "del";
	text: string;
}) {
	const bg =
		kind === "add"
			? "rgba(46,160,67,0.15)"
			: kind === "del"
				? "rgba(248,81,73,0.15)"
				: undefined;
	const marker = kind === "add" ? "+" : kind === "del" ? "−" : " ";
	const markerColor = kind === "add" ? "#3FB950" : kind === "del" ? "#F85149" : "#7D8590";
	return (
		<div className="flex" style={{ background: bg }}>
			<span className="w-[32px] shrink-0 text-right pr-2" style={{ color: "#7D8590" }}>
				{n}
			</span>
			<span className="w-[18px] shrink-0 text-center" style={{ color: markerColor }}>
				{marker}
			</span>
			<span style={{ color: "#E6EDF3" }}>{text}</span>
		</div>
	);
}
