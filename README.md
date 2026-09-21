# OnboardQuest

OnboardQuest is a local-first onboarding role-playing game built with React,
TypeScript, and Phaser. Players explore Team Village, meet fictional team-member
NPCs, complete quests and first-week missions, choose a career path, and review
their progress through an executive insights dashboard.

The current MVP has no backend, cloud database, authentication, telemetry upload,
or external analytics. Game content and progress remain in the browser.

## Features

- Keyboard-controlled 2D Phaser game world.
- Scripted NPC dialogue and deterministic quest completion.
- Territories, missions, XP, levels, badges, and career paths.
- Local progress persistence with a confirmed demo reset.
- Read-only Content Studio with validation and dependency views.
- Employee and manager insights, journey analytics, and JSON export.
- Optional Microsoft or GitHub sign-in on Azure-hosted deployments.
- Browser-local onboarding profile with display name, role, team, and start date.
- Responsive React interface for desktop and mobile.

## Technology

- Vite
- React 19
- TypeScript in strict mode
- Phaser 3
- Vitest
- Browser `localStorage`

## Run Locally

### Prerequisites

- Node.js 22 LTS
- npm

### Setup

```powershell
npm ci
npm run dev
```

Open the URL printed by Vite, normally `http://localhost:5173`.

### Commands

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the Vite development server. |
| `npm test` | Run the Vitest unit suite once. |
| `npm run build` | Type-check and create the production site in `dist/`. |
| `npm run preview` | Preview the production build locally. |

Progress is stored under the browser key `onboardquest.progress.v1`. Resetting
progress removes that save and reloads the Day 1 experience. It does not alter
the source-controlled content definitions.

The hosted Azure app also supports optional Microsoft and GitHub sign-in through
Azure Static Web Apps managed authentication. The onboarding profile is stored
under `onboardquest.profile.v1`. Authentication identifies the current visitor,
but profile and game progress remain local to the current browser and do not sync
between devices.

## Where To Host It

Use two services with different responsibilities:

- **GitHub private repository:** source control, reviews, and deployment workflow.
- **Azure Static Web Apps:** hosting, HTTPS, custom domains, continuous deployment,
  and pull-request preview environments.

GitHub Pages can host a simple public build, but Azure Static Web Apps is the
better fit when Azure is the target platform. The application is entirely static,
so App Service, containers, a database, and an API are unnecessary.

> [!IMPORTANT]
> A private GitHub repository does not make the deployed website private. An Azure
> Static Web Apps site is publicly reachable by default. Deploy only fictional or
> explicitly approved demo content. Do not publish internal XStore content,
> employee data, credentials, tokens, or restricted operational procedures.

## Publish The Source To GitHub

Create an empty **private** repository in GitHub, then run the following from the
project root:

```powershell
git init
git add .
git commit -m "Initial OnboardQuest release"
git branch -M main
git remote add origin https://github.com/<YOUR_ACCOUNT>/onboardquest.git
git push -u origin main
```

Before the first push, inspect `git status` and confirm that `node_modules/`,
`dist/`, local environment files, and private content are not staged.

If GitHub CLI is installed and authenticated, it can create and push the private
repository in one command after the initial commit:

```powershell
gh repo create onboardquest --private --source=. --remote=origin --push
```

## Deploy To Azure Static Web Apps

The easiest first deployment is through the Azure portal connected to GitHub.
This lets Azure create and manage the GitHub Actions workflow for the site.

1. Push this project to a private GitHub repository.
2. In the [Azure portal](https://portal.azure.com), select **Create a resource**
   and search for **Static Web App**.
3. Choose the subscription and resource group, then enter a globally unique app
   name and a nearby region.
4. Use the **Free** plan for the prototype unless organizational requirements need
   a different plan.
5. For deployment details, select **GitHub**, authorize Azure, and choose the
   repository and `main` branch.
6. Enter these build values:

   | Setting | Value |
   | --- | --- |
   | Build preset | React or Custom |
   | App location | `/` |
   | API location | Leave blank |
   | Output location | `dist` |
   | Build command | `npm run build` |

7. For deployment authorization, use the Azure deployment token option recommended
   by Static Web Apps unless your organization requires another policy.
8. Select **Review + create**, then create the resource.
9. Azure adds a workflow named similar to
   `.github/workflows/azure-static-web-apps-<name>.yml` and starts deployment.
10. In GitHub, open **Actions** and wait for the workflow to pass. The Azure
    resource overview then shows the site URL.

The generated workflow should contain the equivalent of:

```yaml
app_location: "/"
api_location: ""
output_location: "dist"
app_build_command: "npm run build"
```

Every push to `main` will rebuild and deploy the production site. Pull requests
can receive temporary preview environments from Azure Static Web Apps.

Official references:

- [Azure Static Web Apps quickstart](https://learn.microsoft.com/azure/static-web-apps/getting-started)
- [Azure Static Web Apps build configuration](https://learn.microsoft.com/azure/static-web-apps/build-configuration)

## Deployment Checklist

Run these checks before publishing:

```powershell
npm test
npm run build
```

- Confirm all displayed content is fictional or approved for the target audience.
- Keep the GitHub repository private if it may contain organization-specific work.
- Never commit deployment tokens, secrets, `.env` files, or credentials.
- Confirm the Azure workflow uses `/` for the app and `dist` for output.
- Treat the hosted URL as public until access controls are explicitly configured.

## Project Boundaries

- Phaser owns movement, collisions, entities, and proximity detection.
- React owns panels, dashboards, menus, and accessible views.
- Managers own progression and analytics logic.
- `AuthManager` reads Azure managed identity without storing provider identifiers.
- `ProfileStore` validates and persists optional profile fields in the browser.
- The Content Registry owns local content loading and validation.
- `localStorage` is the only progress store in the MVP.

See [`.github/copilot-instructions.md`](.github/copilot-instructions.md) for the
project's development, privacy, and approved-content rules.