"use client";

import dynamic from "next/dynamic";
import { FullscreenButton } from "~/components/deck/FullscreenButton";

// Spectacle touches window/document on mount, so load the deck client-only.
const DeckRoot = dynamic(
	() => import("~/components/deck/DeckRoot").then((m) => m.DeckRoot),
	{
		ssr: false,
		loading: () => (
			<div className="flex h-screen w-screen items-center justify-center bg-background text-mono-sm uppercase tracking-widest text-muted-foreground">
				Loading deck…
			</div>
		),
	},
);

export default function Home() {
	return (
		<main className="h-screen w-screen overflow-hidden bg-background">
			<DeckRoot />
			<FullscreenButton />
		</main>
	);
}
