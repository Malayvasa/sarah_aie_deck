"use client";

import { Notes } from "spectacle";
import { DeckSlide } from "~/components/deck/DeckSlide";
import { PresenterNote } from "~/components/deck/PresenterNote";

/**
 * Final slide — the callback and the close, merged. Just the line "AX is
 * the new UX." with "AX" wearing the sparkle-button rainbow gradient (same
 * 9-stop palette, same 9s horizontal slide). No halo, no stars.
 */

const SPARKLE_GRADIENT =
	"linear-gradient(90deg, #06B6D4 0%, #3B82F6 12%, #6366F1 24%, #A855F7 36%, #D946EF 48%, #F97316 62%, #F59E0B 74%, #EAB308 84%, #06B6D4 100%)";

export function AxIsNewUxSlide() {
	return (
		<DeckSlide>
			<div className="flex h-full w-full items-center justify-center">
				<style>{`
					@keyframes _ax_hue_slide {
						from { background-position: 0% 50%; }
						to   { background-position: 300% 50%; }
					}
				`}</style>
				<h1 className="max-w-[22ch] font-normal font-mono text-[112px] leading-[1.05] tracking-tight text-foreground">
					<span
						className="inline-block bg-clip-text text-transparent"
						style={{
							backgroundImage: SPARKLE_GRADIENT,
							backgroundSize: "300% 100%",
							animation: "_ax_hue_slide 9s linear infinite",
							WebkitBackgroundClip: "text",
							WebkitTextFillColor: "transparent",
						}}
					>
						AX
					</span>{" "}
					is the new UX.
				</h1>
			</div>
			<Notes>
				<PresenterNote noteKey="axIsNewUx" />
			</Notes>
		</DeckSlide>
	);
}
