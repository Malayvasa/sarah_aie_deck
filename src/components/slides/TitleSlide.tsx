"use client";

import { Notes } from "spectacle";
import { PresenterNote } from "~/components/deck/PresenterNote";
import { DeckSlide } from "~/components/deck/DeckSlide";

/**
 * Slide 1 — title. Monospace title pinned top-left, speaker byline bottom-left,
 * on solid black. Content sits inside the 128px slide margin; title and byline
 * are pushed to the top and bottom edges of that safe area.
 */
export function TitleSlide() {
	return (
		<DeckSlide>
			<div className="flex flex-1 flex-col justify-between">
				<h1 className="max-w-[24ch] font-normal font-mono text-[84px] leading-[1.05] tracking-tight text-foreground">
					Dashboards are dead: AX is the new UX
				</h1>

				<div className="font-mono text-[30px] leading-[1.35] text-foreground">
					<div>Sarah Simionescu</div>
					<div>UX Engineering Lead, Composio</div>
				</div>
			</div>

			<Notes>
				<PresenterNote noteKey="title" />
			</Notes>
		</DeckSlide>
	);
}
