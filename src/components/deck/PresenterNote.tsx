"use client";

import { useContext } from "react";
import { SlideContext } from "spectacle";
import {
	type SpeakerNote,
	type SpeakerNoteKey,
	speakerNotes,
} from "~/content/speaker-notes";

/**
 * Speaker note rendered inside a slide's <Notes>. Because <Notes> portals its
 * children into Spectacle's presenter column while keeping them under the slide's
 * SlideContext, this component can read the live step state and tell the
 * presenter, in plain language, what the next arrow press will do:
 *
 *   - "Next → NEXT SLIDE" once every in-slide animation has played, or
 *   - "Next ▸ plays animation X of Y" while reveals remain.
 *
 * Pass `steps` = the total number of in-slide animation steps (the number you
 * gave to useStepMotion / useSteps on that slide). Omit it (or 0) for static
 * slides with no reveals.
 */
export function PresenterNote({
	noteKey,
	steps = 0,
}: {
	noteKey: SpeakerNoteKey;
	steps?: number;
}) {
	const note: SpeakerNote = speakerNotes[noteKey];
	const slide = useContext(SlideContext);
	// activeStepIndex maps 1:1 to "how many reveals are showing" for a single
	// threshold-1 stepper, which is every stepped slide in this deck.
	const shown = clamp(slide?.activeStepIndex ?? 0, 0, steps);
	const done = shown >= steps;

	// Step-keyed slides: the segment being spoken is the last one whose `atStep`
	// has been reached. Render every segment so the presenter can read ahead, but
	// highlight the active one and dim the others.
	const segments = note.segments;
	const activeIdx = segments
		? segments.reduce((acc, seg, i) => (seg.atStep <= shown ? i : acc), 0)
		: 0;

	// What the next forward press reveals, if it maps to a named segment.
	const nextLabel =
		!done && segments
			? segments.find((seg) => seg.atStep === shown + 1)?.section
			: undefined;

	return (
		<div style={{ display: "flex", flexDirection: "column", gap: "0.9em" }}>
			<StepStatus shown={shown} steps={steps} done={done} nextLabel={nextLabel} />
			{segments ? (
				segments.map((seg, i) => (
					<div
						// biome-ignore lint/suspicious/noArrayIndexKey: fixed segment list
						key={i}
						style={{ opacity: i === activeIdx ? 1 : 0.4 }}
					>
						<SectionLabel
							text={seg.section}
							active={i === activeIdx}
							shownAtStep={seg.atStep}
						/>
						<Script text={seg.script} />
					</div>
				))
			) : (
				<>
					<SectionLabel text={note.section} active />
					<Script text={note.script} />
				</>
			)}
		</div>
	);
}

function SectionLabel({
	text,
	active,
	shownAtStep,
}: {
	text: string;
	active: boolean;
	shownAtStep?: number;
}) {
	if (!text) return null;
	return (
		<div
			style={{
				fontSize: "0.7em",
				letterSpacing: "0.12em",
				textTransform: "uppercase",
				opacity: active ? 0.55 : 1,
				marginBottom: "0.4em",
			}}
		>
			{shownAtStep !== undefined ? (
				<span style={{ opacity: 0.7 }}>{`@ step ${shownAtStep} · `}</span>
			) : null}
			{text}
		</div>
	);
}

function StepStatus({
	shown,
	steps,
	done,
	nextLabel,
}: {
	shown: number;
	steps: number;
	done: boolean;
	nextLabel?: string;
}) {
	// green = the next press leaves this slide; amber = it plays another reveal.
	const accent = done ? "#34d399" : "#fbbf24";
	const headline = done
		? "Next →  GOES TO NEXT SLIDE"
		: nextLabel
			? `Next ▸  reveals ${nextLabel}`
			: `Next ▸  plays animation ${shown + 1} of ${steps}`;
	const sub =
		steps === 0
			? "No animations on this slide."
			: done
				? `All ${steps} animation${steps === 1 ? "" : "s"} shown — slide is complete.`
				: `${shown} of ${steps} shown — keep pressing → to reveal the rest.`;

	return (
		<div
			style={{
				borderLeft: `4px solid ${accent}`,
				// Solid bg (not 4% white over dark) so scrolling script text
				// behind the sticky panel doesn't bleed through. Matches the
				// presenter column background and adds a soft inset bottom
				// border for separation.
				background: "#181818",
				boxShadow: "inset 0 -1px 0 rgba(255,255,255,0.08)",
				borderRadius: 6,
				padding: "0.6em 0.8em",
				// Pin to the top of Spectacle's scrolling NotesContainer so
				// the step status stays visible no matter how long the script
				// gets. Spectacle's NotesContainer has overflow-y: scroll, so
				// sticky here resolves to that container's top.
				position: "sticky",
				top: 0,
				zIndex: 2,
				display: "flex",
				flexDirection: "column",
				gap: "0.25em",
			}}
		>
			<div style={{ color: accent, fontWeight: 700, fontSize: "0.92em" }}>
				{headline}
			</div>
			<div style={{ opacity: 0.6, fontSize: "0.72em" }}>{sub}</div>
			{steps > 0 ? <Pips total={steps} shown={shown} accent={accent} /> : null}
		</div>
	);
}

function Pips({
	total,
	shown,
	accent,
}: {
	total: number;
	shown: number;
	accent: string;
}) {
	return (
		<div style={{ display: "flex", gap: 4, marginTop: "0.35em" }}>
			{Array.from({ length: total }, (_, i) => (
				<span
					// biome-ignore lint/suspicious/noArrayIndexKey: fixed-length step row
					key={i}
					style={{
						width: 16,
						height: 5,
						borderRadius: 3,
						background: i < shown ? accent : "rgba(255,255,255,0.15)",
					}}
				/>
			))}
		</div>
	);
}

/** Render the mini-markdown script: paragraphs, > blockquotes, **bold**, *italic*. */
function Script({ text }: { text: string }) {
	const paragraphs = text.trim().split(/\n\n+/);
	return (
		<div style={{ display: "flex", flexDirection: "column", gap: "0.65em" }}>
			{paragraphs.map((para, i) => {
				const isQuote = para.startsWith("> ");
				const body = isQuote ? para.slice(2) : para;
				return isQuote ? (
					<blockquote
						// biome-ignore lint/suspicious/noArrayIndexKey: static script paragraphs
						key={i}
						style={{
							margin: 0,
							paddingLeft: "0.8em",
							borderLeft: "3px solid rgba(255,255,255,0.25)",
							fontStyle: "italic",
							opacity: 0.85,
						}}
					>
						{renderInline(body)}
					</blockquote>
				) : (
					// biome-ignore lint/suspicious/noArrayIndexKey: static script paragraphs
					<p key={i} style={{ margin: 0 }}>
						{renderInline(body)}
					</p>
				);
			})}
		</div>
	);
}

/** Split a line into **bold** / *italic* / plain runs. No nesting needed. */
function renderInline(line: string) {
	const parts = line.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g);
	return parts.map((part, i) => {
		if (part.startsWith("**") && part.endsWith("**")) {
			// biome-ignore lint/suspicious/noArrayIndexKey: stable split order
			return <strong key={i}>{part.slice(2, -2)}</strong>;
		}
		if (part.startsWith("*") && part.endsWith("*") && part.length > 2) {
			// biome-ignore lint/suspicious/noArrayIndexKey: stable split order
			return <em key={i}>{part.slice(1, -1)}</em>;
		}
		return part;
	});
}

function clamp(n: number, lo: number, hi: number) {
	return Math.max(lo, Math.min(n, hi));
}
