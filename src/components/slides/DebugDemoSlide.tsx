"use client";

import { Notes } from "spectacle";
import { DeckSlide, Kicker } from "~/components/deck/DeckSlide";
import { PresenterNote } from "~/components/deck/PresenterNote";

export function DebugDemoSlide() {
	return (
		<DeckSlide>
			<div className="flex h-full w-full flex-col justify-center gap-6">
				<Kicker>18 · Demo</Kicker>
				<h1 className="max-w-[22ch] font-normal font-mono text-[84px] leading-[1.05] tracking-tight text-foreground">Debugging from a Slack link</h1>
				<p className="max-w-[40ch] font-mono text-[28px] leading-[1.35] text-muted-foreground">Claude → Composio Search → PR, in under 5 minutes.</p>
			</div>
			<Notes>
				<PresenterNote noteKey="debugDemo" />
			</Notes>
		</DeckSlide>
	);
}
