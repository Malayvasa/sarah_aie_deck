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
		script: `So I have been using Datadog every day for the last 6 months, and last week my coworker came up to me and asked me if he could look at a Datadog alert. He was sort of looking over my shoulder, I was logged out so I was logging in and I was feeling overly conscious about what I was doing on my screen. I opened up the Datadog dashboard and just froze. I drew a blank, realized I have no idea where anything is. And this is not a knock on Datadog. The problem was that I had genuinely never opened the dashboard. I had been using Datadog every day without ever looking at it.

Today, I want to make an argument that sounds insane and then convince you it's obvious.`,
		segments: [
			{
				atStep: 0,
				section: "01b · Setup",
				script: `So I have been using Datadog every day for the last 6 months, and last week my coworker came up to me and asked me if he could look at a Datadog alert. He was sort of looking over my shoulder, I was logged out so I was logging in and I was feeling overly conscious about what I was doing on my screen.`,
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

> "hey i get an error when i search for '(prod)'"`,
	},
	fiveTools: {
		section: "06 · Five windows",
		script: `Seeing this message, I would have immediately spawned 5 different windows. Read the context in Slack, write a query in Datadog, check PostHog for the session recording, fix the bug in VSCode, and open the PR in GitHub.

Five tools, five UIs I have to learn and re-learn every time they ship a redesign. But frankly, redesigns are the least of my worries.`,
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

And you might be thinking, well, problem solved. This is the end of the story, right? Who needs a dashboard when MCP exists? But it is far from it, because MCP is a protocol, a channel of communication between agents and your service, and it's up to you, the service, to choose how to communicate with the agent, and that makes all the difference.`,
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
		script: `Let me show you the exact bug report from earlier and a demo of how I would solve this in 2026.

I would have my Claude connected to the Composio MCP.

So what I did here is I just copied and pasted the link to the message from Slack, asked it to use Sentry & Datadog to find the root cause & create a draft PR with the fix — nice and simple.

The first thing it does is it calls the **Composio Search** tool to state the task it wants to accomplish — in this case it states three: it wants to fetch Slack messages, search Sentry issues, and search Datadog logs. Composio returns the correct tools it needs with a plan on how to use them — for example, for Slack it recommends the agent should first find the channel ID it's trying to pull from before it attempts to pull the message.

Now, armed with all the context it needs, Claude begins pulling from data sources in parallel — Datadog, Sentry, Posthog, and scanning the codebase.

Then, once it identifies the root cause, it creates a PR with the fix in **less than 5 minutes**.

I did not have to build a workflow or write a skill to teach it how to do this. This is literally just Claude using Composio's MCP.

It has become so much easier to do things through Composio that opening up Claude is muscle memory, and some apps I used to open every day are slowly becoming unfamiliar to me.`,
	},
	nativeConnectorEvals: {
		section: "18b · The eval numbers",
		script: `The impact of designing for agents is measureable. These are some early, unreleased results comparing Composio against each app's own native MCP listed in the Claude marketplace — same tasks, same model.

**But why? Why is this experience so much better than the native MCPs?**`,
	},
	composioVisualization: {
		section: "19 · What Composio is building",
		script: `It's because, at Composio, we are developing a **brand-new interface specifically for agents.**

We translate messy, sparsely documented, ever-changing APIs from the apps you live in every day into something agents love to use. We build on top of MCP, CLI and native tools, to deliver a cohesive, unified and excellent experience for your agents that allows them to perform complex operations across these apps seamlessly.`,
	},
	dataVizDemo: {
		section: "20 · Demo · Onboarding & toolkit usage across two apps",
		script: `Let me show you what I mean.

So let's say I want to dig into some user data and see a distribution of what "vertical" my users select during onboarding. I can simply ask Claude for it.

Again it will run the Composio Search tool,

then write and execute the query in Posthog, nice and simple.

But now, what if I wanted to see which apps (we call them toolkits) are the most popular amongst those who selected Ecommerce. Well, the tool calling data exists in Metabase. Let's see if Claude can figure out how to query large amounts of data across these two platforms.

Once again it uses Composio Search,

Then, it queries the user IDs of those who selected Ecommerce from Posthog and saves the results without loading the full result into its context.

Then it makes some queries to find the correct project in Metabase, to get the database schema, to sample some data and get a feel for how things are structured.

Once it has the user IDs and a feel for the data, it uses the Composio Sandbox to write some code to dynamically generate an SQL query with a regex string to search for those user IDs — again without loading the entire thing into its context.

Then it executes, and BAM. We can see the more popular toolkits amongst this user persona in less than a few minutes, with data pulled from both Posthog and Metabase.

If you want to play with the live version, come find me or go to the Composio booth.`,
	},
	axIsNewUx: {
		section: "21 · Close",
		script: `And so, the dashboard has died.

I am thinking more and more about what this means for the future. Many startups have begun making their landing pages and websites "AI-friendly" for SEO/GEO purposes, but so few have really prepared their products for use by agents.

Composio began as a tool to help developers building agents. We took popular apps that users want to connect to and turned them into tools that agents can use.

But now we are getting requests from startups, saying their clients are begging for a way to use their services through their agents.

The humans are tired of dashboards, their agents are tired of poorly designed MCP servers.

This is a lesson for everyone building anything. **You are now serving a new species of user.** It doesn't have eyes. It won't click your sparkle button. It shows up with a goal and a set of tools, and it judges you on exactly one thing — whether it can get the job done.

For a decade, we built products to be easy for *people* to use. The next decade belongs to the ones that are easy for *agents* to use.

So picture me again: frozen in front of that Datadog dashboard, no idea where anything is. I used to think that was me falling behind. Now I think it was just a preview.

**Thank you.**`,
	},
} as const satisfies Record<string, SpeakerNote>;

export type SpeakerNoteKey = keyof typeof speakerNotes;
