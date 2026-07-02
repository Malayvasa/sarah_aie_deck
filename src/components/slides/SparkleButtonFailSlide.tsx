"use client";

import "highlight.js/styles/atom-one-dark.css";
import { AnimatePresence, motion } from "framer-motion";
import { Loader2, Sparkles, TriangleAlert } from "lucide-react";
import { useContext, useEffect, useLayoutEffect, useRef, useState } from "react";
import { Notes, SlideContext } from "spectacle";
import { DeckSlide } from "~/components/deck/DeckSlide";
import { PresenterNote } from "~/components/deck/PresenterNote";
import { MacCursor } from "~/components/mocks/MacCursor";
import { highlightCode } from "~/lib/highlight";

/**
 * Slide 11 — the sparkle button, less magical. A single natural-language
 * input bar with a Generate chip; below it, the AI's SQL streams in and a
 * red error banner drops under it.
 */

const PROMPT = "Show me revenue by customer for Q4";

// Intentional bug: pm.order_id = o.user_id — user_id doesn't exist on orders.
const SQL = `SELECT c.name, SUM(oi.price * oi.quantity) AS revenue
FROM customers c
JOIN orders o ON o.customer_id = c.id
JOIN order_items oi ON oi.order_id = o.id
LEFT JOIN products p ON p.id = oi.product_id
JOIN payments pm ON pm.order_id = o.user_id
WHERE o.created_at >= '2024-10-01'
  AND o.created_at < '2025-01-01'
GROUP BY c.name
ORDER BY revenue DESC
LIMIT 100;`;

const ERROR_TEXT = 'ERROR: column "orders.user_id" does not exist  ·  LINE 6';

const TEXT = "#E4E7ED";
const TEXT_MUTED = "#9AA3B2";
const TEXT_DIM = "#7A8496";
const BORDER = "#242832";
const RED = "#F04B5B";

export function SparkleButtonFailSlide() {
	return (
		<DeckSlide padded={false}>
			<SparkleButtonFailBody />
			<Notes>
				<PresenterNote noteKey="sparkleButtonFail" />
			</Notes>
		</DeckSlide>
	);
}

// SQL split into whitespace-preserving tokens so we can emit whole words in
// each tick rather than one character at a time.
const SQL_TOKENS = SQL.split(/(\s+)/);

function SparkleButtonFailBody() {
	const { isSlideActive } = useContext(SlideContext);

	// 0 idle · 1 generate flash · 2 typing · 3 typing done · 4 error banner up
	const [phase, setPhase] = useState<0 | 1 | 2 | 3 | 4>(0);
	const [tokensShown, setTokensShown] = useState(0);

	// Cursor motion timeline:
	//   t=0     — cursor idle at bottom-right of slide
	//   t=800   — cursor starts drifting toward Generate button
	//   t=1900  — cursor arrives, click bump (phase 1)
	//   t=2300  — SQL streaming begins (phase 2), cursor fades out
	const [cursorMoving, setCursorMoving] = useState(false);
	const [cursorExiting, setCursorExiting] = useState(false);
	const [clickBump, setClickBump] = useState(false);
	// Match the SQL / error banner width to whatever the prompt+button row
	// happens to render at, and remember where the Generate button lives so
	// the cursor can drive to its center.
	const containerRef = useRef<HTMLDivElement>(null);
	const promptRef = useRef<HTMLDivElement>(null);
	const buttonRef = useRef<HTMLDivElement>(null);
	const [rowWidth, setRowWidth] = useState<number | null>(null);
	const [buttonCenter, setButtonCenter] = useState<{
		x: number;
		y: number;
	} | null>(null);
	useLayoutEffect(() => {
		if (promptRef.current) {
			setRowWidth(promptRef.current.offsetWidth);
		}
		// Use offsetLeft/offsetTop instead of getBoundingClientRect — those
		// return the pre-transform layout coords, which is exactly the frame
		// we translate the cursor motion.div in. Rect-based math would be off
		// by Spectacle's slide-fit scale factor.
		if (buttonRef.current) {
			// Walk up the offsetParent chain until we hit the container so we
			// don't depend on which ancestor happens to be position:relative.
			let x = 0;
			let y = 0;
			let el: HTMLElement | null = buttonRef.current;
			while (el && el !== containerRef.current) {
				x += el.offsetLeft;
				y += el.offsetTop;
				el = el.offsetParent as HTMLElement | null;
			}
			x += buttonRef.current.offsetWidth / 2;
			y += buttonRef.current.offsetHeight / 2;
			setButtonCenter({ x, y });
		}
	}, []);

	useEffect(() => {
		if (!isSlideActive) {
			setPhase(0);
			setTokensShown(0);
			setCursorMoving(false);
			setCursorExiting(false);
			setClickBump(false);
			return;
		}
		const timers: number[] = [];
		timers.push(window.setTimeout(() => setCursorMoving(true), 800));
		timers.push(window.setTimeout(() => setClickBump(true), 1850));
		timers.push(
			window.setTimeout(() => {
				setClickBump(false);
				setPhase(1);
			}, 2000),
		);
		timers.push(window.setTimeout(() => setPhase(2), 2350));
		timers.push(window.setTimeout(() => setCursorExiting(true), 2200));
		return () => timers.forEach(clearTimeout);
	}, [isSlideActive]);

	useEffect(() => {
		if (phase !== 2) return;
		let cancelled = false;
		let i = 0;
		const tick = () => {
			if (cancelled) return;
			i += 1;
			setTokensShown(i);
			if (i < SQL_TOKENS.length) {
				window.setTimeout(tick, 35);
			} else {
				window.setTimeout(() => !cancelled && setPhase(3), 400);
				window.setTimeout(() => !cancelled && setPhase(4), 950);
			}
		};
		tick();
		return () => {
			cancelled = true;
		};
	}, [phase]);

	const sqlVisible = SQL_TOKENS.slice(0, tokensShown).join("");
	// Once the typing is finished, wrap every offending token so we can drop
	// red squigglies under them. Applied post-stream so nothing lights up mid-
	// typing.
	const showErrorMarkup = phase >= 3;
	let highlighted = highlightCode(sqlVisible, "sql");
	if (showErrorMarkup) {
		// Dot-notation identifiers stay as raw text through hljs, so string
		// replace matches them cleanly. Multi-word phrases with SQL keywords
		// would get split across <span> tags and fail to match.
		const badTokens = [
			"oi.price",
			"oi.quantity",
			"p.id",
			"pm.order_id",
			"o.user_id",
		];
		for (const token of badTokens) {
			highlighted = highlighted.replace(
				token,
				`<span class="_sql_bad">${token}</span>`,
			);
		}
	}
	// Lines that carry an error marker in the gutter.
	const errorLines = showErrorMarkup ? [1, 5, 6] : [];

	return (
		<div
			ref={containerRef}
			className="relative flex h-full w-full flex-col items-center justify-center gap-8 bg-black px-20"
		>
			{/* Prompt row — plain text + Generate button, tight coupling */}
			<div
				ref={promptRef}
				className="flex items-center gap-4"
				style={{
					fontFamily:
						'-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
				}}
			>
				<div className="text-[36px]" style={{ color: TEXT }}>
					{PROMPT}
				</div>
				<div ref={buttonRef}>
					<GenerateChip pressed={clickBump} generating={phase === 2} />
				</div>
			</div>

			{/* SQL output — mounts once the Generate button has been clicked. */}
			<AnimatePresence>
				{phase >= 2 ? (
					<motion.div
						key="sql"
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						exit={{ opacity: 0 }}
						transition={{ duration: 0.35, ease: [0.34, 1.12, 0.6, 1] }}
						className="flex"
						style={{ minHeight: 380, width: rowWidth ?? undefined }}
					>
						<GutterNumbers
							linesShown={sqlVisible.split("\n").length}
							errorLines={errorLines}
						/>
						<pre
							className="m-0 flex-1 overflow-hidden px-4 py-2 text-[22px] leading-[1.55]"
							style={{
								background: "transparent",
								color: TEXT,
								fontFamily:
									'"JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
								whiteSpace: "pre",
							}}
						>
							<code
								className="hljs"
								style={{ background: "transparent", padding: 0 }}
								// biome-ignore lint/security/noDangerouslySetInnerHtml: local highlighter, static SQL
								dangerouslySetInnerHTML={{ __html: highlighted }}
							/>
						</pre>
					</motion.div>
				) : null}
			</AnimatePresence>

			{/* Cursor drifts in and clicks Generate. Positioned in slide coords
			    so it doesn't get pushed around by the layout shift when SQL
			    mounts. Fades once the click is registered. */}
			<AnimatePresence>
				{!cursorExiting && buttonCenter ? (
					<motion.div
						key="cursor"
						className="pointer-events-none absolute"
						initial={{
							x: buttonCenter.x + 260,
							y: buttonCenter.y + 260,
							scale: 1,
							opacity: 0,
						}}
						animate={{
							// Nudge -5/-3 to bring the cursor tip (not its bounding
							// box origin) onto the button center.
							x: cursorMoving
								? buttonCenter.x - 5
								: buttonCenter.x + 260,
							y: cursorMoving
								? buttonCenter.y - 3
								: buttonCenter.y + 260,
							scale: clickBump ? 0.85 : 1,
							opacity: 1,
						}}
						exit={{
							x: buttonCenter.x + 600,
							y: buttonCenter.y + 600,
							opacity: 0,
						}}
						transition={{
							x: { duration: 1.1, ease: [0.4, 0.02, 0.2, 1] },
							y: { duration: 1.1, ease: [0.4, 0.02, 0.2, 1] },
							scale: { duration: 0.15 },
							opacity: { duration: 0.35 },
						}}
						style={{ left: 0, top: 0, zIndex: 30 }}
					>
						<MacCursor size={30} />
					</motion.div>
				) : null}
			</AnimatePresence>

			{/* Error banner sits on the slide, not inside a panel */}
			<AnimatePresence>
				{phase >= 4 ? (
					<motion.div
						key="err"
						initial={{ y: 24, opacity: 0 }}
						animate={{ y: 0, opacity: 1 }}
						exit={{ y: 24, opacity: 0 }}
						transition={{ duration: 0.35, ease: [0.34, 1.12, 0.6, 1] }}
						className="flex items-start gap-3 px-4 py-3"
						style={{
							width: rowWidth ?? undefined,
							background:
								"linear-gradient(180deg, rgba(240,75,91,0.15) 0%, rgba(240,75,91,0.08) 100%)",
							borderTop: `2px solid ${RED}`,
						}}
					>
						<TriangleAlert
							size={18}
							color={RED}
							strokeWidth={2.4}
							style={{ marginTop: 2 }}
						/>
						<div className="flex flex-col gap-1">
							<span
								className="text-[18px] font-semibold"
								style={{
									color: RED,
									letterSpacing: "0.02em",
									fontFamily:
										'"JetBrains Mono", ui-monospace, monospace',
								}}
							>
								{ERROR_TEXT}
							</span>
							<span
								className="text-[15px]"
								style={{
									color: TEXT_MUTED,
									fontFamily:
										'-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
								}}
							>
								Query executed against{" "}
								<span style={{ color: TEXT }}>prod-analytics</span> · 0 rows
								returned in 42ms
							</span>
						</div>
					</motion.div>
				) : null}
			</AnimatePresence>

			<style>{`
				._sql_bad {
					color: ${RED} !important;
					text-decoration: underline wavy ${RED} 2px;
					text-underline-offset: 4px;
					background: rgba(240,75,91,0.12);
					padding: 0 2px;
					border-radius: 2px;
				}
			`}</style>
		</div>
	);
}

function GutterNumbers({
	linesShown,
	errorLines,
}: {
	linesShown: number;
	errorLines: number[];
}) {
	const total = 11;
	const errorSet = new Set(errorLines);
	return (
		<div
			className="select-none py-2 text-right text-[22px] leading-[1.55]"
			style={{
				color: TEXT_DIM,
				width: 68,
				borderRight: `1px solid ${BORDER}`,
				paddingRight: 14,
				fontFamily:
					'"JetBrains Mono", ui-monospace, monospace',
			}}
			aria-hidden
		>
			{Array.from({ length: total }, (_, i) => {
				const num = i + 1;
				const isError = errorSet.has(num);
				return (
					<div
						key={i}
						className="relative"
						style={{
							opacity: i < linesShown ? 1 : 0.35,
							color: isError ? RED : undefined,
							fontWeight: isError ? 700 : undefined,
						}}
					>
						{isError ? (
							<span
								aria-hidden
								className="absolute"
								style={{
									left: -14,
									top: "50%",
									transform: "translateY(-50%)",
									width: 6,
									height: 6,
									background: RED,
									borderRadius: 999,
									boxShadow: `0 0 8px ${RED}`,
								}}
							/>
						) : null}
						{num}
					</div>
				);
			})}
		</div>
	);
}

/* ─── Compact rainbow "Generate" chip echoing slide 10's hero. ───────────── */

function GenerateChip({
	pressed = false,
	generating = false,
}: {
	pressed?: boolean;
	generating?: boolean;
}) {
	return (
		<motion.div
			className="relative flex items-center overflow-hidden"
			// Subtle "actually got clicked" feedback — no upward jump. The
			// button briefly presses down and dims, then springs back to rest
			// as the SQL starts streaming.
			animate={{
				scale: pressed ? 0.96 : 1,
				filter: pressed ? "brightness(0.85)" : "brightness(1)",
			}}
			transition={{ duration: 0.12, ease: "easeOut" }}
			style={{
				gap: 10,
				padding: "14px 26px",
				borderRadius: 999,
				background:
					"linear-gradient(135deg, #6366F1 0%, #A855F7 55%, #D946EF 100%)",
				color: "#fff",
				fontFamily:
					'-apple-system, BlinkMacSystemFont, "SF Pro", "Helvetica Neue", Arial, sans-serif',
				fontSize: 20,
				fontWeight: 600,
				letterSpacing: "-0.01em",
			}}
		>
			{generating ? (
				<motion.span
					className="relative flex items-center justify-center"
					animate={{ rotate: 360 }}
					transition={{ duration: 0.9, repeat: Infinity, ease: "linear" }}
				>
					<Loader2
						size={20}
						strokeWidth={2.4}
						style={{ filter: "drop-shadow(0 0 6px rgba(255,255,255,0.65))" }}
					/>
				</motion.span>
			) : (
				<Sparkles
					size={20}
					strokeWidth={2.4}
					style={{ filter: "drop-shadow(0 0 6px rgba(255,255,255,0.65))" }}
				/>
			)}
			{/* Grid-stack both labels so the button's width is reserved for
			    the longer word — no width shift when toggling states. Both
			    labels center inside the shared cell. */}
			<span
				className="relative grid"
				style={{
					gridTemplateAreas: '"label"',
					justifyItems: "center",
					alignItems: "center",
					lineHeight: 1,
				}}
			>
				<span
					style={{
						gridArea: "label",
						visibility: generating ? "visible" : "hidden",
					}}
				>
					Generating
				</span>
				<span
					style={{
						gridArea: "label",
						visibility: generating ? "hidden" : "visible",
					}}
				>
					Generate
				</span>
			</span>
		</motion.div>
	);
}
