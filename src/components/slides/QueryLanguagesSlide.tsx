"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useContext, useEffect, useRef, useState } from "react";
import { Notes, SlideContext } from "spectacle";
import { DeckSlide } from "~/components/deck/DeckSlide";
import { PresenterNote } from "~/components/deck/PresenterNote";

/**
 * Slide 07 — "Tower of query languages." Dense streaming log where each row
 * is a real documented query in a different tool's syntax. New entries emit
 * every 500ms and push the older ones down; once the list fills the panel,
 * the tail rolls off the bottom under a gradient fade.
 *
 * Pattern ported from Karan's EventLogSlide. Every snippet is a real dialect
 * — see per-entry comments for the tell.
 */

type Query = {
	slug: string;
	tool: string;
	syntax: string;
	tint: string;
	code: string;
};

const QUERIES: Query[] = [
	{
		slug: "datadog",
		tool: "datadog",
		syntax: "search",
		tint: "#C6A6EF",
		code: "service:api env:prod status:error @endpoint:/v1/playground",
	},
	{
		slug: "jira",
		tool: "jira",
		syntax: "JQL",
		tint: "#4EA1F3",
		code:
			'project = COMP AND status = "In Progress" AND assignee = currentUser()',
	},
	{
		slug: "slack",
		tool: "slack",
		syntax: "modifiers",
		tint: "#ECB22E",
		code: "from:@alex in:#support has:link after:yesterday",
	},
	{
		slug: "github",
		tool: "github",
		syntax: "search",
		tint: "#8B949E",
		code: "is:pr is:open author:malayvasa review-requested:@me",
	},
	{
		slug: "posthog",
		tool: "posthog",
		syntax: "HogQL",
		tint: "#F9BD2B",
		code:
			"SELECT event, count() FROM events WHERE event = 'run_playground' AND timestamp > now() - INTERVAL 1 DAY",
	},
	{
		slug: "sentry",
		tool: "sentry",
		syntax: "search",
		tint: "#E1567C",
		code:
			'is:unresolved level:error transaction:"POST /v1/playground" environment:production',
	},
	{
		slug: "grafana",
		tool: "grafana",
		syntax: "LogQL",
		tint: "#F5A623",
		code: '{app="api", env="prod"} |= "error" | json',
	},
	{
		slug: "elasticsearch",
		tool: "elastic",
		syntax: "KQL",
		tint: "#00BFB3",
		code: 'service.name : "api" and http.response.status_code >= 500',
	},
	{
		slug: "salesforce",
		tool: "salesforce",
		syntax: "SOQL",
		tint: "#00A1E0",
		code:
			"SELECT Id, Name FROM Opportunity WHERE StageName = 'Closed Won' AND CloseDate = LAST_QUARTER",
	},
	{
		slug: "linear",
		tool: "linear",
		syntax: "filter",
		tint: "#9BA1FF",
		code: "assignee:@me state:in_progress created:>-7d",
	},
	// SQL variants — even the "SQL" tools don't speak the same SQL.
	// ClickHouse: today(), FORMAT JSON, LIMIT n BY are ClickHouse-only.
	{
		slug: "clickhouse",
		tool: "clickhouse",
		syntax: "SQL",
		tint: "#FFCC01",
		code:
			"SELECT event, count() FROM events WHERE date = today() GROUP BY event LIMIT 10 FORMAT JSON",
	},
	// Snowflake: QUALIFY + window function replacement for HAVING.
	{
		slug: "snowflake",
		tool: "snowflake",
		syntax: "SQL",
		tint: "#29B5E8",
		code:
			"SELECT event, COUNT(*) FROM events QUALIFY ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY ts DESC) = 1",
	},
	// Databricks: MERGE INTO from a lakehouse-y CTE.
	{
		slug: "databricks",
		tool: "databricks",
		syntax: "SQL",
		tint: "#FF3621",
		code:
			"MERGE INTO events e USING updates u ON e.id = u.id WHEN MATCHED THEN UPDATE SET *",
	},
	// Neon (Postgres): standard Postgres — the "control" that makes the
	// dialect drift on the other rows read as absurd.
	{
		slug: "neon",
		tool: "neon",
		syntax: "SQL",
		tint: "#00E599",
		code:
			"SELECT event, count(*) FROM events WHERE created_at > NOW() - INTERVAL '1 day' GROUP BY event",
	},
];

const C = {
	textPrimary: "#c9d1d9",
	textSecondary: "#8b949e",
	textMuted: "#6e7681",
	textVeryMuted: "#484f58",
	canvas: "#000000",
	rowSep: "rgba(255,255,255,0.04)",
	blue: "#79c0ff",
} as const;

const PANEL_W = 1040;
const PANEL_H = 600;
const ROW_H = 44;
const VISIBLE_COUNT = Math.floor(PANEL_H / ROW_H);
const EMIT_INTERVAL_MS = 500;
const BASE_MS = 9 * 3600 * 1000 + 42 * 60 * 1000 + 15 * 1000 + 842;

type QueryWithId = Query & { _id: string; time: string };

function makeTimestamp(seq: number): string {
	const t = BASE_MS + seq * EMIT_INTERVAL_MS;
	const hh = Math.floor(t / 3600000) % 24;
	const mm = Math.floor((t / 60000) % 60);
	const ss = Math.floor((t / 1000) % 60);
	const mmm = t % 1000;
	return `${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}:${String(ss).padStart(2, "0")}.${String(mmm).padStart(3, "0")}`;
}

export function QueryLanguagesSlide() {
	return (
		<DeckSlide padded={false}>
			<QueryLanguagesBody />
			<Notes>
				<PresenterNote noteKey="queryLanguages" />
			</Notes>
		</DeckSlide>
	);
}

function QueryLanguagesBody() {
	const { isSlideActive } = useContext(SlideContext);

	return (
		<div className="flex h-full w-full items-center justify-center">
			<motion.div
				className="relative"
				style={{ width: PANEL_W, height: PANEL_H }}
				initial={{ opacity: 0, y: 16 }}
				animate={
					isSlideActive ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }
				}
				transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
			>
				<ScrollList active={isSlideActive} />
			</motion.div>
		</div>
	);
}

function ScrollList({ active }: { active: boolean }) {
	const [visible, setVisible] = useState<QueryWithId[]>([]);
	const counterRef = useRef(0);

	useEffect(() => {
		if (!active) {
			setVisible([]);
			counterRef.current = 0;
			return;
		}
		const interval = window.setInterval(() => {
			const entryIdx = counterRef.current % QUERIES.length;
			const seq = counterRef.current + 1;
			const next: QueryWithId = {
				...QUERIES[entryIdx],
				_id: `q-${seq}`,
				time: makeTimestamp(seq),
			};
			setVisible((prev) => [next, ...prev.slice(0, VISIBLE_COUNT - 1)]);
			counterRef.current = seq;
		}, EMIT_INTERVAL_MS);
		return () => window.clearInterval(interval);
	}, [active]);

	return (
		<div
			className="relative"
			style={{
				height: PANEL_H,
				background: C.canvas,
				overflow: "hidden",
			}}
		>
			<AnimatePresence initial={false} mode="popLayout">
				{visible.map((q) => (
					<motion.div
						key={q._id}
						layout
						initial={{ opacity: 0, y: -8, scale: 0.985 }}
						animate={{ opacity: 1, y: 0, scale: 1 }}
						exit={{ opacity: 0, y: 10 }}
						transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
						style={{ willChange: "transform, opacity" }}
					>
						<QueryRow q={q} />
					</motion.div>
				))}
			</AnimatePresence>

			<div
				className="pointer-events-none absolute inset-x-0 top-0"
				style={{
					height: 40,
					background: `linear-gradient(to bottom, ${C.canvas} 0%, transparent 100%)`,
					zIndex: 5,
				}}
			/>
			<div
				className="pointer-events-none absolute inset-x-0 bottom-0"
				style={{
					height: ROW_H + 48,
					background: `linear-gradient(to top, ${C.canvas} 0%, ${C.canvas} 40%, transparent 100%)`,
					zIndex: 5,
				}}
			/>
		</div>
	);
}

function QueryRow({ q }: { q: QueryWithId }) {
	return (
		<div
			className="flex items-center"
			style={{
				height: ROW_H,
				padding: "0 20px",
				gap: 14,
				borderBottom: `1px solid ${C.rowSep}`,
				fontFamily:
					'"JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
				fontSize: 13,
				color: C.textPrimary,
			}}
		>
			<div
				style={{
					width: 20,
					height: 20,
					flexShrink: 0,
					display: "flex",
					alignItems: "center",
					justifyContent: "center",
				}}
			>
				{/* eslint-disable-next-line @next/next/no-img-element */}
				<img
					src={`/logos/${q.slug}.svg`}
					width={18}
					height={18}
					alt=""
					style={{
						width: 18,
						height: 18,
						display: "block",
						flexShrink: 0,
					}}
				/>
			</div>

			<span
				style={{
					color: C.textPrimary,
					width: 100,
					flexShrink: 0,
					fontSize: 12.5,
					fontWeight: 500,
					whiteSpace: "nowrap",
					overflow: "hidden",
					textOverflow: "ellipsis",
				}}
			>
				{q.tool}
			</span>

			<span
				className="rounded-sm"
				style={{
					padding: "2px 8px",
					background: `${q.tint}18`,
					color: q.tint,
					border: `1px solid ${q.tint}44`,
					fontSize: 10.5,
					fontWeight: 600,
					letterSpacing: "0.10em",
					textTransform: "uppercase",
					width: 88,
					textAlign: "center",
					flexShrink: 0,
				}}
			>
				{q.syntax}
			</span>

			<span
				style={{
					flex: 1,
					minWidth: 0,
					color: C.textPrimary,
					whiteSpace: "nowrap",
					overflow: "hidden",
					textOverflow: "ellipsis",
					fontSize: 13,
				}}
			>
				<Highlight code={q.code} />
			</span>

			<span
				style={{
					width: 96,
					color: C.textVeryMuted,
					fontSize: 11,
					textAlign: "right",
					flexShrink: 0,
				}}
			>
				{q.time}
			</span>
		</div>
	);
}

/**
 * Cheap syntax hinter — just tints known keywords, strings, and identifier
 * prefixes. Not a real parser, but enough visual variety per row.
 */
function Highlight({ code }: { code: string }) {
	const KW =
		/\b(SELECT|FROM|WHERE|AND|OR|NOT|ORDER BY|GROUP BY|IN|IS|LIKE|LAST_QUARTER|LAST_MONTH|INTERVAL|DAY|NOW|now|count|json|by)\b/;
	const parts = code.split(/(".*?"|'.*?'|\{[^}]*\}|\s+)/);
	return (
		<>
			{parts.map((p, i) => {
				if (!p) return null;
				if (/^\s+$/.test(p)) return <span key={i}>{p}</span>;
				if (/^".*"$/.test(p) || /^'.*'$/.test(p)) {
					return (
						<span key={i} style={{ color: "#a5d6ff" }}>
							{p}
						</span>
					);
				}
				if (/^\{.*\}$/.test(p)) {
					return (
						<span key={i} style={{ color: "#7ee787" }}>
							{p}
						</span>
					);
				}
				if (KW.test(p)) {
					return (
						<span key={i} style={{ color: "#ff7b72" }}>
							{p}
						</span>
					);
				}
				// key:value tokens — colorize just the key
				const m = p.match(/^([@#]?[\w\.]+)(:)(.*)$/);
				if (m) {
					return (
						<span key={i}>
							<span style={{ color: C.blue }}>{m[1]}</span>
							<span style={{ color: C.textMuted }}>{m[2]}</span>
							<span>{m[3]}</span>
						</span>
					);
				}
				return <span key={i}>{p}</span>;
			})}
		</>
	);
}
