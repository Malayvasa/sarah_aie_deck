/**
 * Speaker notes for the deck. Each entry is keyed by a stable slide key and
 * carries the speech `section` label plus the spoken `script` for that slide.
 *
 * The script supports a tiny subset of markdown, rendered by <PresenterNote>:
 *   - blank-line-separated paragraphs
 *   - **bold** and *italic*
 *   - a paragraph beginning with "> " renders as a blockquote
 *
 * Source: docs/sarah-speech.md
 */

export type SpeakerNote = {
	section: string;
	script: string;
	segments?: { atStep: number; section: string; script: string }[];
};

export const speakerNotes = {
	title: {
		section: "01 · Opening",
		script: `Hello everyone. My name is Sarah, and I have a confession.`,
	},
	datadogConfession: {
		section: "01b · The confession",
		script: `So I have been using Datadog every day for the last 6 months, and last week my manager came up to me and asked me to open up Datadog so he could look at an alert. He was sort of looking over my shoulder, and I was feeling overly conscious about what I was doing on my screen. I opened up the Datadog dashboard and just froze. I drew a blank, realized I have no idea where anything is. And this is not a knock on Datadog. The problem was that I had genuinely never opened the dashboard. I had been using Datadog every day without ever looking at it.

Today, I want to make an argument that sounds insane and then convince you it's obvious.`,
		segments: [
			{
				atStep: 0,
				section: "01b · Setup",
				script: `So I have been using Datadog every day for the last 6 months, and last week my manager came up to me and asked me to open up Datadog so he could look at an alert. He was sort of looking over my shoulder, and I was feeling overly conscious about what I was doing on my screen.`,
			},
			{
				atStep: 1,
				section: "01b · The blank stare",
				script: `I opened up the Datadog dashboard and just froze. I drew a blank, realized I have no idea where anything is. And this is not a knock on Datadog. The problem was that I had genuinely never opened the dashboard. I had been using Datadog every day without ever looking at it.

Today, I want to make an argument that sounds insane and then convince you it's obvious.`,
			},
			{
				atStep: 2,
				section: "02 · The claim",
				script: `The dashboard is dead.

And I think that's great news for everyone in this room.`,
			},
		],
	},
	composioDashboard: {
		section: "03 · The confession",
		script: `Except maybe for me, because my team is responsible for the Composio dashboard.`,
	},
	postMortem: {
		section: "04 · Post-mortem",
		script: `Alas, how did we get here? I believe a post-mortem is in order, shall we?`,
	},
	slackMessage: {
		section: "05 · 2022 · The bug report",
		script: `The year is 2022, the dark ages. Someone pings me in Slack, this is a real message:

> "The playground is not working for this user."`,
	},
	fiveTools: {
		section: "06 · Five windows",
		script: `Seeing this message, I would have immediately spawned 5 different windows. Read the context in Slack, write a query in Datadog, check PostHog for the session recording, fix the bug in VSCode, and open the PR in GitHub.

Five tools, five UIs I have to learn and re-learn every time they ship a redesign. But frankly, redesigns are not the biggest problem.`,
	},
	queryLanguages: {
		section: "07 · A tower of query languages",
		script: `Every single tool has its own query language I need to learn:

- Datadog has its own query syntax.
- Jira has JQL.
- Slack has its search modifiers.

And it gets worse because even when these tools speak the same language, say, SQL, they don't even agree on SQL.`,
	},
	salesforceSoql: {
		section: "08 · We don't talk about Salesforce",
		script: `*We don't talk about Salesforce.*`,
	},
	translationDevice: {
		section: "09 · What a dashboard actually is",
		script: `Every dashboard you've ever used, every obscure query language written was a **translation device** between you and your data — because the machine on the other side couldn't understand what you actually wanted.

You didn't want the dashboard or its cursed query language. **You wanted the answer.**`,
	},
	sparkleButton: {
		section: "10 · 2023 · The sparkle button",
		script: `And so in 2023, the Sparkle button was born. With the click of this magical button,`,
	},
	sparkleButtonFail: {
		section: "11 · The sparkle button, less magical",
		script: `an LLM would write a *sometimes* correct query to get you the answer you need — that is, if your question does not require more than 2 joins.`,
	},
	sparkleButtonsEverywhere: {
		section: "12 · Sparkles everywhere",
		script: `And soon enough, these sparkling buttons were everywhere.

But alas, Dashboards became AI native so… problem solved, right?

Not quite.`,
	},
	mcpAnnounced: {
		section: "13 · Nov 2024 · MCP",
		script: `In November 2024, Anthropic announced the MCP protocol with the promise to create an "open standard for connecting AI systems with data sources," and that it did.

Instead of using a sparkle button, your own agent, Claude, whom you already use every day, could generate the query for you, execute it on your behalf, and give you the answer directly.

And you might be thinking, well, problem solved. This is the end of the story, right? Who needs a dashboard when MCP exists? But it is far from it, because, to put it nicely… **it's just not that good, yet.**`,
	},
	mcpProblems: {
		section: "14 · The reality of MCP",
		script: `If you've ever actually wired up a dozen MCP servers, you will know the reality is a mess. Three reasons.`,
	},
	amnesia: {
		section: "15 · Problem 1 · Amnesia",
		script: `**Agents don't learn.** Every conversation starts from zero — it has no memory of how it fumbled formatting links properly when it sent that message in Slack yesterday, so it fumbles it again today.

We patch this with "skills," but a skill is a bandaid.`,
	},
	contextOverload: {
		section: "16 · Problem 2 · Context overload",
		script: `Agents becomes dumber with the more context you provide and loading more tools takes more context. Connect enough servers and you're dumping thousands of tool definitions straight into the context window. I mean our GitHub MCP alone has over 200 tools. The model drowns. It grabs the wrong tool or struggles to resolve dependencies and can't figure out which one it needs to call first.`,
	},
	isolatedApps: {
		section: "17 · Problem 3 · Isolated apps",
		script: `And third, every app is isolated. Each MCP server knows about itself and nothing else. The moment a task spans two apps, and the they always do, stitching them together is back to being your problem.

So MCP gave agents a door into every app. But it left them standing in a thousand separate rooms, no map, and no memory of ever having been there.`,
	},
	debugDemo: {
		section: "18 · Demo · Debugging from Slack",
		script: `Let me show you the exact bug report from earlier — *"Playground's not working for this user"* — how I solve this in 2026.

I can just copy the link to the message in Slack.

Claude uses **Composio Search** to state the task it wants to accomplish, and Composio returns the correct tools it needs and how to use them.

Now, armed with all the context it needs, Claude begins pulling from data sources in parallel — Datadog, Sentry, Posthog, and scanning the codebase.

Then, once it identifies the root cause, it creates a PR with the fix in **less than 5 minutes**.

I did not have to build a workflow or write a skill to teach it how to do this. This is literally just Claude using Composio's MCP.

It has become so much easier to do things through Composio that opening up Claude is muscle memory, and some apps I used to open every day are slowly becoming unfamiliar to me. But why? What makes this so different from the traditional MCP experience?`,
	},
	composioVisualization: {
		section: "19 · What Composio is building",
		script: `It's because, at Composio, we are developing a **brand-new interface specifically for agents.**

We translate messy, sparsely documented, ever-changing APIs from the apps you live in every day into something agents love to use. We build on top of MCP, CLI and native tools, to deliver a cohesive, unified and excellent experience for your agents that allows them to perform complex operations across these apps seamlessly.`,
	},
	dataVizDemo: {
		section: "20 · Demo · Retention across two apps",
		script: `Let me show you what I mean.

So let's say I want to do some data digging and visualize our retention rate. Our signups exist in Posthog, but our tool calls exist in Metabase. I can simply ask for a 5-by-5 weekly retention rate grid showing day 1 through day 5 retention for Composio For You. It writes code to orchestrate batch tool calls across both applications to produce a single cohesive response.

Workbench becomes even more powerful in long-running and complex tasks.`,
	},
	dashboardIsDeadCallback: {
		section: "21 · The dashboard has died",
		script: `And so, the dashboard has died.

I am thinking more and more about what this means for the future. Many startups have begun making their landing pages and websites "AI-friendly" for SEO/GEO purposes, but so few have really prepared their products for use by agents.

Composio began as a tool to help developers building agents. We took popular apps that users want to connect to and turned them into tools that agents love to use.

But now we are getting requests from startups, saying their clients are begging for a way to use their services through their agents.

The humans are tired of dashboards, their agents are tired of MCP.

This is a lesson for everyone building anything. **You are now serving a new species of user.** It doesn't have eyes. It won't click your sparkle button. It shows up with a goal and a set of tools, and it judges you on exactly one thing — whether it can get the job done.`,
	},
	axIsNewUx: {
		section: "22 · Close",
		script: `**AX is the new UX.**`,
	},
} as const satisfies Record<string, SpeakerNote>;

export type SpeakerNoteKey = keyof typeof speakerNotes;
