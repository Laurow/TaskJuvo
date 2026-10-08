# TaskJuvo

An English, clickable prototype for conversations with business owners, students, coaches and UX experts. Built with Next.js, TypeScript and Tailwind CSS. The navy and orange design and project structure draw on the supplied EarlyWorks references; the product name is TaskJuvo throughout.

## Run locally

Use Node.js 24 and npm. The existing checkout is at `/workspace/TaskJuvo`.

```bash
cd /workspace/TaskJuvo
npm ci
npm run dev
```

The development server uses port 3000. To build and run the shareable production version:

```bash
npm run build
npm run start
```

`npm run build` produces a standalone static website in `out/`. `npm run start` serves that directory with the included Node.js server. Stop a running server with Ctrl+C before starting another on the same port. Stop the development server before building; both use `.next/`.

## Explore the prototype

- Homepage and business overview with example tasks.
- A five-step task wizard with custom deliverables, skills, planning, budget, validation and an editable summary.
- Three curated talent matches with a comparison view, concrete fit explanations and points to discuss.
- Talent profiles with example evidence, reviews and an explanation of TaskJuvo Verified.
- Project confirmation with scope, budget, deadline, milestones and a proposed Project Guarantee.
- Project workspace with example deliverables, approval and revision actions, local messages, project terms and simulated support.
- Talent view with five example opportunities.
- Expert feedback with three ratings, written observations, browser storage and Markdown download.

Use **Fill in example** in the task wizard to load the demonstration: competitor analysis for expansion into Germany, €300, 10 days, Market research + Excel + PowerPoint. You can also complete the main flow with your own fictional task.

Choose **Explore the demo** on the homepage to browse the screen overview. Nine preview cards open the individual screens, so experts can review the complete journey or focus on one stage.

## Expert feedback

Use [the review guide](docs/EXPERTREVIEW.md) for a 20–30 minute session. The feedback feature stores observations only in the current browser. Download them before choosing **Start again**, which clears the local task, selection, messages and feedback. Milestone progress is a simulated state and may reset when the workspace reopens.

All people, tasks, scores, reviews and project evidence are fictional. Matches are preset examples for each category. TaskJuvo Verified and the Project Guarantee are concepts to investigate. There is no real matching, verification, authentication, payment, agreement, message delivery or support service.

## Accessibility

The interface uses English document language, semantic headings, explicit field labels, visible keyboard focus, native checkbox and radio choices, errors associated with fields, status announcements, focus management and Escape/Tab behavior in dialogs. Comparisons stack on mobile. The interface respects `prefers-reduced-motion`. Fonts and icons are bundled locally; no external APIs or font requests are needed during use.

Browser checks cover the full task flow, validation, local storage, feedback download, 320px and 390px screens, keyboard interaction and automated axe checks for WCAG 2 A/AA and 2.1. An automated check is not a complete WCAG conformance statement; the review guide describes additional manual checks.

## Validate

```bash
npm run typecheck
npm run build
npm test
```

The cloud environment provides Chromium at `/usr/bin/chromium`, which is the Playwright default. On another machine, install Chromium with `npx playwright install chromium` and set `PLAYWRIGHT_CHROMIUM_PATH` to that executable. The tests start the development server when needed and use at most two workers.

You can override `PLAYWRIGHT_BASE_URL` and `PLAYWRIGHT_SERVER_COMMAND` to test another running server or the production version. For example, after building, set `PLAYWRIGHT_SERVER_COMMAND='npm run start'` when running `npm test`. Stop the development server first.

## Share and review the screens

[TaskJuvo-prototype.zip](artifacts/TaskJuvo-prototype.zip) contains the built site, a start script, screenshots, a screenshot gallery and the review guide. Extract the archive and follow `START_HERE.md`. You can also upload the contents of `out/` to static hosting. Keep `_next/` beside `index.html` and host this version from the website root.

[TaskJuvo-gallery.html](artifacts/TaskJuvo-gallery.html) lets reviewers browse individual screens. [TaskJuvo-pages.png](artifacts/TaskJuvo-pages.png) shows the main pages together. Individual images cover the homepage, business overview, task wizard, matches, profile, project confirmation, workspace, talent view, expert feedback and mobile layout.

Create a new bundle with `npm run bundle` (requires Python 3 as well as Node.js).

## Structure

`src/components/TaskJuvo.tsx` contains navigation, the homepage, business overview, talent view and feedback. `TaskWizard`, `Matches` and `ProjectWorkspace` contain the main flow. `src/lib/data.ts` contains fictional data. `src/components/ui.tsx` supplies shared icons, badges, avatars and dialogs.
