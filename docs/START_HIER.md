# TaskJuvo — clickable prototype

This package contains the built website. You do not need to install packages, create an account or supply API keys.

## Open the prototype

Extract the entire ZIP file. Open a terminal in the extracted `TaskJuvo-prototype` folder and start it with Node.js:

```bash
node start.mjs out
```

Then open the local address on port 3000 in your browser. Alternatively, use Python:

```bash
python3 -m http.server 3000 --directory out
```

Stop the server with Ctrl+C. Serve `index.html` through a web server; opening it directly as a file does not support the application’s script paths.

## Share with experts

Upload the contents of `out/` to static hosting. Keep `index.html`, `icon.svg` and the `_next/` directory together and accessible from the website root. No database or application backend is required. Fonts and icons are included locally, so the prototype does not call external APIs during use.

The package also includes a screenshot gallery and a multi-page overview image. Use them to review the homepage, business overview, task wizard, matches, profile, confirmation, workspace, talent view and feedback side by side. Use the running prototype to assess interactions and keyboard behavior.

In the running prototype, choose **Explore the demo** to see nine screen previews. Each card opens its corresponding screen.

## Try the demo

1. Choose **Post your first task**.
2. Use **Fill in example**, or describe a competitor analysis for expansion into Germany yourself.
3. Review deliverables, skills, practical details and the final summary.
4. Compare three matches, open a profile and select talent.
5. Confirm the example project and explore progress and deliverables.
6. Choose **Give feedback**, save observations and download them.

`EXPERTREVIEW.md` provides a facilitator guide. Use **Start again** for a new participant. Download feedback first: resetting clears local browser storage.

## What is simulated?

All people, projects, scores, reviews and work samples are fictional. Verification and the Project Guarantee are concepts. There are no real accounts, payments, agreements, delivered messages or support requests. Task details, selections, messages and feedback are stored only in the local browser. Milestone progress is an example state and may reset when the workspace reopens.
