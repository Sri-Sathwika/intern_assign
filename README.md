# Intern Assign — Project & Task Dashboard

Live demo: https://internassign-vert.vercel.app

A TypeScript + Next.js project that provides a project / task management dashboard with members, activity feed, charts and task actions. The app uses Prisma for database access and a session/auth layer for user sign-in and protected pages.

## Key features
- Dashboard view with project and task summaries
- Task list with actions (assign, complete, delete, edit)
- Task charts (visualization of task stats)
- Project member management (add/remove members)
- Activity feed to show recent actions
- Authenticated routes (session/provider layer)
- Responsive UI components and shared UI primitives

## Tech stack
- Next.js (App Router, React + TypeScript)
- TypeScript (main language)
- Prisma (database ORM)
- PostCSS / CSS for styling
- Vercel for deployment (site linked above)

## Repository layout (high level)
- src/
  - app/ — Next.js app routes and pages
    - dashboard/ — main dashboard page and UI
    - login/ — login page
    - register/ — registration page
    - projects/ — project pages
    - page.tsx, layout.tsx, globals.css, favicon
  - components/ — reusable React components
    - ActivityFeed.tsx
    - AddMember.tsx
    - DeleteProjectButton.tsx
    - Navbar.tsx
    - RemoveMemberButton.tsx
    - SessionProvider.tsx — session/auth wrapper
    - TaskActions.tsx — task action controls
    - TaskChart.tsx — chart component
    - TaskList.tsx — task list UI
    - ui/ — small UI primitives (eg. button.tsx)
  - lib/ — utilities and integrations
    - auth.ts — authentication helpers
    - prisma.ts — Prisma client wrapper
    - utils.ts
- prisma/ — Prisma schema & migrations (project expects Prisma usage)
- public/ — static assets and favicon
- next.config.ts, tsconfig.json, postcss.config.mjs, eslint.config.mjs, package.json

## Local setup (quick)
1. Clone the repo
   - git clone https://github.com/Sri-Sathwika/intern_assign.git
2. Install dependencies
   - npm install
3. Create environment file
   - Copy `.env.example` (if present) to `.env` and set values. Typical variables you will need:
     - DATABASE_URL — connection string for your database
     - NEXTAUTH_URL — (if using NextAuth) base URL
     - NEXTAUTH_SECRET — session/crypto secret
     - Any OAuth client IDs / secrets if third-party sign-in is used
4. Prepare Prisma
   - npx prisma generate
   - npx prisma migrate dev --name init
5. Run the dev server
   - npm run dev
6. Open http://localhost:3000

Notes: The app uses Prisma — make sure your database is running and DATABASE_URL is set before running migrations.

## Scripts
Common scripts you’ll likely find in package.json:
- dev — start the Next.js dev server
- build — build the production app
- start — run the production build
- lint — run ESLint

(Inspect package.json for exact script names.)

## Deployment
This project is ready to deploy to Vercel (Next.js first-class hosting). Link your repository, set the same environment variables in the Vercel project settings, and deploy. The live demo is available at the project homepage.

## Contributing
- Open an issue for feature requests or bugs.
- Fork the repo, create a feature branch, and send a PR with a clear description and relevant tests or screenshots.
- Follow the existing code style (TypeScript + React components + CSS/PostCSS).

## Troubleshooting & notes
- If you see issues related to Prisma, confirm the DATABASE_URL and run prisma generate/migrate.
- If auth/session pages don't work, ensure the session secret and any OAuth credentials are correct and matching your provider settings.

## Acknowledgements
Built with Next.js, React and Prisma.

## License
No license file present in the repository — add a LICENSE file to make usage terms explicit.

## Contact
Repository: https://github.com/Sri-Sathwika/intern_assign
Author: Sri-Sathwika
