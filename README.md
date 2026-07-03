# Dashboards are dead: AX is the new UX

A talk deck by **Sarah Simionescu** (Member of Technical Staff, Composio) arguing that the dashboard is dead, that **AX — agent experience — is the new UX**, and how to build software for agents.

🔗 **Live deck:** [sarah-aie.vercel.app](https://sarah-aie.vercel.app)

Built with [Next.js 16](https://nextjs.org), [Spectacle](https://formidable.com/open-source/spectacle/), [Framer Motion](https://www.framer.com/motion/), and Tailwind CSS. The deck features live-animated terminal demos, mock product UIs (Datadog, Slack, Composio), and synchronized speaker-note beats.

## Getting started

```bash
pnpm install
pnpm dev
```

Then open [http://localhost:3000](http://localhost:3000).

## Scripts

| Command      | Description                     |
| ------------ | ------------------------------- |
| `pnpm dev`   | Start the local dev server      |
| `pnpm build` | Create a production build       |
| `pnpm start` | Serve the production build      |

## Project structure

```
src/
├── app/                  # Next.js app router entry
├── components/
│   ├── deck/             # Spectacle deck root + controls
│   ├── slides/           # One component per slide
│   ├── mocks/            # Mock product UIs used in demos
│   └── terminal-kit/     # Animated terminal primitives
├── content/              # Speaker notes
└── lib/                  # Utilities, themes, syntax highlighting
docs/
└── sarah-speech.md       # Full talk script
```

## License

[MIT](./LICENSE)
