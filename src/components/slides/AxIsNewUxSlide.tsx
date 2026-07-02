"use client";

import { Notes } from "spectacle";
import { DeckSlide, Kicker } from "~/components/deck/DeckSlide";
import { PresenterNote } from "~/components/deck/PresenterNote";

export function AxIsNewUxSlide() {
	return (
		<DeckSlide>
			<div className="flex h-full w-full flex-col justify-center gap-6">
				<Kicker>22 · Close</Kicker>
				<h1 className="max-w-[22ch] font-normal font-mono text-[84px] leading-[1.05] tracking-tight text-foreground">AX is the new UX.</h1>

			</div>
			<Notes>
				<PresenterNote noteKey="axIsNewUx" />
			</Notes>
		</DeckSlide>
	);
}
