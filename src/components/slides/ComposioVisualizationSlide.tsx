"use client";

import { Notes } from "spectacle";
import { DeckSlide, Kicker } from "~/components/deck/DeckSlide";
import { PresenterNote } from "~/components/deck/PresenterNote";

export function ComposioVisualizationSlide() {
	return (
		<DeckSlide>
			<div className="flex h-full w-full flex-col justify-center gap-6">
				<Kicker>19 · What we're building</Kicker>
				<h1 className="max-w-[22ch] font-normal font-mono text-[84px] leading-[1.05] tracking-tight text-foreground">An interface built for agents, not for people.</h1>
				<p className="max-w-[40ch] font-mono text-[28px] leading-[1.35] text-muted-foreground">We translate messy APIs into tools agents love.</p>
			</div>
			<Notes>
				<PresenterNote noteKey="composioVisualization" />
			</Notes>
		</DeckSlide>
	);
}
