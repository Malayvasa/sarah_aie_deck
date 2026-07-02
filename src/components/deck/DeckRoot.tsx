"use client";

import { Deck, defaultTransition } from "spectacle";

import { AmnesiaSlide } from "~/components/slides/AmnesiaSlide";
import { AxIsNewUxSlide } from "~/components/slides/AxIsNewUxSlide";
import { ComposioDashboardSlide } from "~/components/slides/ComposioDashboardSlide";
import { ComposioVisualizationSlide } from "~/components/slides/ComposioVisualizationSlide";
import { ContextOverloadSlide } from "~/components/slides/ContextOverloadSlide";
import { DatadogConfessionSlide } from "~/components/slides/DatadogConfessionSlide";
import { DataVizDemoSlide } from "~/components/slides/DataVizDemoSlide";
import { DebugDemoSlide } from "~/components/slides/DebugDemoSlide";
import { FiveToolsSlide } from "~/components/slides/FiveToolsSlide";
import { IsolatedAppsSlide } from "~/components/slides/IsolatedAppsSlide";
import { McpAnnouncedSlide } from "~/components/slides/McpAnnouncedSlide";
import { McpProblemsSlide } from "~/components/slides/McpProblemsSlide";
import { NativeConnectorEvalsSlide } from "~/components/slides/NativeConnectorEvalsSlide";
import { PostMortemSlide } from "~/components/slides/PostMortemSlide";
import { QueryLanguagesSlide } from "~/components/slides/QueryLanguagesSlide";
import { SalesforceSoqlSlide } from "~/components/slides/SalesforceSoqlSlide";
import { SlackMessageSlide } from "~/components/slides/SlackMessageSlide";
import { SparkleButtonFailSlide } from "~/components/slides/SparkleButtonFailSlide";
import { SparkleButtonSlide } from "~/components/slides/SparkleButtonSlide";
import { SparkleButtonsEverywhereSlide } from "~/components/slides/SparkleButtonsEverywhereSlide";
import { TitleSlide } from "~/components/slides/TitleSlide";
import { TranslationDeviceSlide } from "~/components/slides/TranslationDeviceSlide";

const theme = {
	// IMPORTANT: backdropStyle REPLACES Spectacle's default; keep position/size
	// or the deck stops scaling (caps at 1366×768).
	backdropStyle: {
		position: "fixed",
		top: 0,
		left: 0,
		width: "100vw",
		height: "100vh",
		backgroundColor: "#000000",
	},
	fonts: {
		header: "var(--font-abc-diatype), sans-serif",
		text: "var(--font-abc-diatype), sans-serif",
		monospace: "var(--font-jetbrains-mono), monospace",
	},
	colors: { primary: "#ffffff", secondary: "#0007cd" },
};

export function DeckRoot() {
	return (
		<Deck
			theme={theme}
			transition={defaultTransition}
			// Suppress Spectacle's default footer (progress dots + fullscreen
			// button). Without this it renders a full-width white pixel row at
			// the bottom of every slide.
			template={() => null}
		>
			<TitleSlide />
			<DatadogConfessionSlide />
			<ComposioDashboardSlide />
			<PostMortemSlide />
			<SlackMessageSlide />
			<FiveToolsSlide />
			<QueryLanguagesSlide />
			<SalesforceSoqlSlide />
			<TranslationDeviceSlide />
			<SparkleButtonSlide />
			<SparkleButtonFailSlide />
			<SparkleButtonsEverywhereSlide />
			<McpAnnouncedSlide />
			<McpProblemsSlide />
			<AmnesiaSlide />
			<ContextOverloadSlide />
			<IsolatedAppsSlide />
			<DebugDemoSlide />
			<NativeConnectorEvalsSlide />
			<ComposioVisualizationSlide />
			<DataVizDemoSlide />
			<AxIsNewUxSlide />
		</Deck>
	);
}

export default DeckRoot;
