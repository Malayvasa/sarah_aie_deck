"use client";

import { motion } from "framer-motion";
import { Check, TriangleAlert } from "lucide-react";
import { useContext } from "react";
import { Notes, SlideContext } from "spectacle";
import { DeckSlide } from "~/components/deck/DeckSlide";
import { PresenterNote } from "~/components/deck/PresenterNote";
import { Message, TerminalWindow } from "~/components/terminal-kit";

/**
 * Slide 15 — "Amnesia." Two Claude-theme terminals side-by-side, both
 * showing the same agent transcript on two different days. Same prompt,
 * same botched Slack URL, same user correction. The agent didn't remember
 * any of yesterday's beat.
 *
 * Terminal styling ported from Karan's CodingArc / TerminalBlock so both
 * decks feel consistent.
 */

export function AmnesiaSlide() {
	return (
		<DeckSlide padded={false}>
			<AmnesiaBody />
			<Notes>
				<PresenterNote noteKey="amnesia" />
			</Notes>
		</DeckSlide>
	);
}

// Dimensions cribbed from Karan's CodingArcSlide so both decks feel matched.
const BLOCK_W = 505;
const BLOCK_H = 400;
const GAP_W = 90;

function AmnesiaBody() {
	const { isSlideActive } = useContext(SlideContext);
	const fade = (delay: number) => ({
		initial: { opacity: 0, y: 24 },
		animate: isSlideActive ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 },
		transition: {
			duration: 0.55,
			ease: [0.34, 1.12, 0.6, 1] as [number, number, number, number],
			delay,
		},
	});

	return (
		<div className="flex h-full w-full items-center justify-center bg-black">
			<div className="flex flex-col items-center gap-14">
				{/* Two terminals row */}
				<div
					className="flex items-center"
					style={{ height: BLOCK_H, gap: GAP_W }}
				>
					<motion.div
						{...fade(0.05)}
						className="shrink-0"
						style={{ width: BLOCK_W, height: BLOCK_H }}
					>
						<Transcript />
					</motion.div>
					<motion.div
						{...fade(0.25)}
						className="shrink-0"
						style={{ width: BLOCK_W, height: BLOCK_H }}
					>
						<Transcript />
					</motion.div>
				</div>

				{/* Labels row — one word per terminal, mono 22px, matches
				    Karan's 2023/2026 timeline treatment. */}
				<div
					className="flex items-center"
					style={{ gap: GAP_W }}
				>
					<motion.span
						{...fade(0.4)}
						className="whitespace-nowrap font-mono text-[22px] tabular-nums text-white"
						style={{ width: BLOCK_W, textAlign: "center" }}
					>
						Yesterday
					</motion.span>
					<motion.span
						{...fade(0.55)}
						className="whitespace-nowrap font-mono text-[22px] tabular-nums text-white"
						style={{ width: BLOCK_W, textAlign: "center" }}
					>
						Today
					</motion.span>
				</div>
			</div>
		</div>
	);
}

/* ─── Transcript that fills the terminal ────────────────────────────────── */

function Transcript() {
	return (
		<TerminalWindow
			className="tk-claude-dark h-full"
			fill
			path="~/agents/slack-poster"
			pinScrollBottom
			theme="claude"
			variant="dark"
			bodyClassName="pb-3"
		>
			<div className="flex flex-col gap-3 text-[13px]">
				<Message>Post the changelog to #eng-launches</Message>

				<ToolCall
					name="slack.send_message"
					arg='channel="#eng-launches"'
					kind="err"
					result={
						<div className="flex flex-col gap-0.5">
							<span
								style={{
									color: "var(--terminal-red)",
									fontWeight: 600,
								}}
							>
								SlackAPIError: invalid_blocks (400)
							</span>
							<span
								className="text-[11.5px]"
								style={{ color: "var(--terminal-dim)" }}
							>
								plain URL rejected — expected{" "}
								<code
									style={{
										background: "rgba(255,255,255,0.10)",
										padding: "0 4px",
										borderRadius: 2,
										fontSize: 11,
									}}
								>
									&lt;url|text&gt;
								</code>
							</span>
						</div>
					}
				/>

				<Message>
					Use{" "}
					<code
						style={{
							background: "rgba(255,255,255,0.10)",
							padding: "1px 5px",
							borderRadius: 3,
							fontFamily:
								'"JetBrains Mono", ui-monospace, monospace',
							fontSize: 12,
						}}
					>
						&lt;url|text&gt;
					</code>{" "}
					format.
				</Message>
			</div>
		</TerminalWindow>
	);
}

/* ─── Karan-style terminal helpers ──────────────────────────────────────── */

function ToolCall({
	name,
	arg,
	result,
	kind = "ok",
}: {
	name: string;
	arg: string;
	result: React.ReactNode;
	kind?: "ok" | "err";
}) {
	const err = kind === "err";
	const accent = err ? "var(--terminal-red)" : "var(--terminal-green)";
	return (
		<motion.div
			className="font-mono text-[13px]"
			initial={{ opacity: 0, y: 4 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.25 }}
		>
			<div className="flex items-baseline gap-2 whitespace-pre">
				<span style={{ color: accent }}>⏺</span>
				<span style={{ color: "var(--terminal-fg)" }}>{name}</span>
				<span
					className="truncate"
					style={{ color: "var(--terminal-dim)" }}
				>
					({arg})
				</span>
			</div>
			<div
				className="mt-1 ml-[5px] flex items-start gap-2 border-l pl-3"
				style={{
					borderColor: err
						? "rgba(255,90,90,0.4)"
						: "var(--terminal-border)",
					color: "var(--terminal-dim)",
				}}
			>
				{err ? (
					<TriangleAlert
						className="mt-[3px] size-3.5 shrink-0"
						style={{ color: accent }}
						strokeWidth={2.4}
					/>
				) : (
					<Check
						className="mt-[3px] size-3.5 shrink-0"
						style={{ color: accent }}
					/>
				)}
				<div className="min-w-0 flex-1">{result}</div>
			</div>
		</motion.div>
	);
}

function AssistantLine({ children }: { children: React.ReactNode }) {
	return (
		<motion.div
			className="px-1 text-[13px] leading-relaxed"
			style={{
				color: "color-mix(in srgb, var(--terminal-fg) 82%, transparent)",
			}}
			initial={{ opacity: 0, y: 4 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.3 }}
		>
			{children}
		</motion.div>
	);
}

function Ident({ children }: { children: React.ReactNode }) {
	return (
		<span
			className="rounded-sm px-1 py-[1px]"
			style={{
				background: "rgba(77,159,255,0.14)",
				color: "var(--terminal-blue)",
				fontFamily: '"JetBrains Mono", ui-monospace, monospace',
				fontSize: 12,
			}}
		>
			{children}
		</span>
	);
}
