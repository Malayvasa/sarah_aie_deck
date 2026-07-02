[Slide] Dashboards are dead: AX is the new UX, and how to build for agents.

Hello everyone. My name is Sarah, and I have a confession.

So I have been using Datadog every day for the last 6 months, and last week my coworker came up to me and asked me if he could look at a Datadog alert. He was sort of looking over my shoulder, and I was feeling overly conscious about what I was doing on my screen. I opened up the Datadog dashboard and just froze. I drew a blank, realized I have no idea where anything is. And this is not a knock on Datadog. The problem was that I had genuinely never opened the dashboard. I had been using Datadog every day without ever looking at it.

Today, I want to make an argument that sounds insane and then convince you it's obvious.

[Slide] The dashboard is dead.

The dashboard is dead.

And I think that's great news for everyone in this room.

[Slide] The Composio dashboard
Except maybe for me, because my team is responsible for the Composio dashboard.

[Slide] Dashbords Post-mortem
Alas, how did we get here? I believe a post-mortem is in order, shall we?

[Slide] Screenshot of this slack message
The year is 2022, the dark ages. Someone pings me in Slack, this is a real message: "hey i get an error when i search for '(prod)'".

[Slide] 5 different windows/tabs
Seeing this message, I would have immediately spawned 5 different windows. Read the context in Slack, write a query in Datadog, check PostHog for the session recording, fix the bug in VSCode, and open the PR in GitHub.

Five tools, five UIs I have to learn and re-learn every time they ship a redesign. But frankly, redesigns are the least of my worries.

[Slide] All the different query languages across these apps (e.g. Jira, Slack, Linear, Datadog, Sentry, ect.)
Every single tool has its own query language I need to learn:

- Datadog has its own query syntax.
- Jira has JQL.
- Slack has its search modifiers.

And it gets worse because even when these tools speak the same language, say, SQL,

[Slide] All the different SQL variants/versoins (e.g. Clickhouse, Neon, Salesforce ect.)
they don't even agree on SQL.

We don't talk about Salesforce.

[Slide] Some visual??
Every dashboard you've ever used, every obscure query language written was a translation device between you and your data because the machine on the other side couldn't understand what you actually wanted. You didn't want the dashboard or its cursed query language. You wanted the answer.

[Slide] A sparkle button in a void
And so in 2023, the Sparkle button was born. With the click of this magical button,

[Slide] Example of the sparkle button generating a DB query and then it failing because its not valid syntax
an LLM would write a sometimes correct query to get you the answer you need, that is, if your question does not require more than 2 joins.

[Slide] All the different Sparkle buttons across Salesforce, Datadog, Linear, ect.
And soon enough, these sparkling buttons were everywhere.

But alas, Dashboards became AI native so… problem solved, right?

Not quite.

[Slide] Anthropic announcing MCP
In November 2024, Anthropic announced the MCP protocol with the promise to create an "open standard for connecting AI systems with data sources," and that it did. Instead of using a sparkle button, your own agent, Claude, whom you already use every day, could generate the query for you, execute it on your behalf, and give you the answer directly.

And you might be thinking, well, problem solved. This is the end of the story, right? Who needs a dashboard when MCP exists? But it is far from it, because MCP is a protocol, a channel of communication between agents and your service, and it's up to you, the service, to choose how to communicate with the agent, and that makes all the difference.

[Slide]
If you've ever actually wired up a dozen MCP servers, you will know the reality is a mess. Three reasons.

[Slide] Amnesia
Agents don't learn. Every conversation starts from zero it has no memory of how it fumbled formatting links properly when it sent that message in Slack yesterday, so it fumbles it again today. We patch this with "skills," but a skill is a bandaid.

[Slide] Context overload
Agents becomes dumber with the more context you provide and loading more tools takes more context. Connect enough servers and you're dumping thousands of tool definitions straight into the context window. I mean our GitHub MCP alone has over 200 tools. The model drowns. It grabs the wrong tool or struggles to resolve dependencies and can't figure out which one it needs to call first.

[Slide] Isolated apps
And third, every app is isolated. Each MCP server knows about itself and nothing else. The moment a task spans two apps, and the they always do, stitching them together is back to being your problem.

So MCP gave agents a door into every app. But it left them standing in a thousand separate rooms, no map, and no memory of ever having been there.

[Slide] Live demo for debugging issue reported in Slack
Let me show you the exact bug report from earlier _"hey i get an error when i search for '(prod)'"_ how I solve this in 2026.

I can just copy the link to the message in Slack.

Claude uses the Composio Search to state the task it wants to accomplish, and Composio returns the correct tools it needs and how to use them.

Now, armed with all the context it needs, Claude begins pulling from data sources in parallel Datadog, Sentry, Posthog, and scanning the codebase.

Then, once it identifies the root cause, it creates a PR with the fix in less than 5 minutes.

I did not have to build a workflow or write a skill to teach it how to do this. This is literally just Claude using Composio's MCP.

It has become so much easier to do things through Composio that opening up Claude is muscle memory, and some apps I used to open every day are slowly becoming unfamiliar to me. But why? What makes this so different from the traditional MCP experience?

[Slide] Composio visualization
It's because, at Composio, we are developing a brand-new interface specifically for agents. We translate messy, sparsely documented, ever-changing APIs from the apps you live in every day into something agents love to use. We build on top of MCP, CLI and native tools, to deliver a cohesive, unified and excellent experience for your agents that allows them to perform complex operations across these apps seamlessly.

[Slide] Live demo for visualizing data
Let me show you what I mean.

So let's say I want to do some data digging and visualize our retention rate. Our signups exist in Posthog, but our tool calls exist in Metabase. I can simply ask for a 5-by-5 weekly retention rate grid showing day 1 through day 5 retention for Composio For You. It writes code to orchestrate batch tool calls across both applications to produce a single cohesive response.

Workbench becomes even more powerful in long-running and complex tasks.

[Slide] Dashboard port morteum (same as before)
And so, the dashboard has died.

I am thinking more and more about what this means for the future. Many startups have begun making their landing pages and websites "AI-friendly" for SEO/GEO purposes, but so few have really prepared their products for use by agents.

Composio began as a tool to help developers building agents. We took popular apps that users want to connect to and turned them into tools that agents can use.

But now we are getting requests from startups, saying their clients are begging for a way to use their services through their agents.

The humans are tired of dashboards, their agents are tired of MCP.

This is a lesson for everyone building anything. You are now serving a new species of user. It doens't have eyes. It won't click your sparkle button. It shows up with a goal and a set of tools, and it judges you on exactly one thing whether it can get the job done.

For a decade, we built products to be easy for _people_ to use. The next decade belongs to the ones that are easy for _agents_ to use.

So picture me again: frozen in front of that Datadog dashboard, no idea where anything is. I used to think that was me falling behind. Now I think it was just a preview.

[Slide] AX is the new UX

For a decade, we built products to be easy for _people_ to use. The next decade belongs to the ones that are easy for _agents_ to use.

So picture me again: frozen in front of that Datadog dashboard, no idea where anything is. I used to think that was me falling behind. Now I think it was just a preview.

Thank you