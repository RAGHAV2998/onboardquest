# OnboardQuest: GitHub Copilot Project Instructions

## Project overview

You are helping build **OnboardQuest**, a web-based role-playing onboarding game for new hires, lateral hires, internal transfers, and employees entering a new technical domain.

The player explores a virtual workplace, meets team-member NPCs, learns the organization and technical territory, completes first-week missions, earns XP, and unlocks badges.

The immediate goal is to create a playable, non-AI MVP in Visual Studio Code with GitHub Copilot. AI or agent features are future enhancements and must not be implemented unless explicitly requested.

## Business objective

Build an engaging onboarding experience that helps employees:

- Understand the team and key contacts.
- Learn services, tools, repositories, and documentation.
- Complete practical first-week activities.
- Track onboarding progress through quests, XP, and badges.
- Find authoritative XStore onboarding material without copying or inventing restricted content.

## Technology stack

- Vite
- React
- TypeScript with strict mode
- Phaser.js for the playable game world
- HTML and CSS for dialogue, quest, profile, and progress panels
- Vitest for unit tests
- Local JSON files for MVP content and progress

Do not add a backend, database, cloud dependency, AI service, Microsoft Graph integration, or authentication until explicitly requested.

## Development principles

The developer is learning game and app development. Therefore:

1. Build one small, testable feature at a time.
2. Explain generated code and important Phaser concepts.
3. Prefer simple implementations over advanced patterns.
4. Keep files focused and reasonably small.
5. Separate game logic, content data, and React UI.
6. Use strict TypeScript types and avoid `any`.
7. Do not silently add packages. Explain why each dependency is needed.
8. Do not generate the entire game in one step.
9. Run or recommend the relevant lint, test, and build commands after each change.
10. Do not invent internal facts, links, people data, access procedures, or technical onboarding steps.

## MVP scope

The first playable version must include:

- One 2D top-down map named **Team Village**.
- A player character controlled with arrow keys or WASD.
- Four NPCs: Manager, Buddy, Senior Engineer, and Product Manager.
- Proximity detection and an interaction key such as `E`.
- Dialogue shown in a React overlay.
- A quest to speak with all four NPCs.
- XP awarded when the quest is completed.
- A badge unlocked after quest completion.
- Local progress persistence using `localStorage`.
- A reset-progress option for demos.

Use simple placeholder shapes or locally generated placeholder assets until approved assets are available.

## Planned game levels

### Level 1: Meet Your Team

**Purpose:** Help the player understand who is in the team and how each person can help during onboarding.

NPCs represent team members. The player walks up to an NPC and presses the interaction key.

Example player question:

> Tell me about Neeraj.

For the initial non-AI version, show approved, data-driven profile fields:

- Role
- Expertise
- Current projects
- How they can help

Implementation requirements:

- Store NPC content in `src/data/teamMembers.json` or a typed TypeScript data file.
- The game client must display only fields present in approved source data.
- Do not infer expertise, projects, responsibilities, availability, or reporting relationships.
- Use fictional or placeholder profiles in public demos unless real employee information has been explicitly approved.
- Treat “Neeraj” as example onboarding content, not as permission to fabricate or expose personal information.
- Track which NPCs have been visited.
- Complete the level after the required NPC conversations have occurred.

Suggested initial quest:

- Title: `Meet Your Team`
- Objective: `Speak with the Manager, Buddy, Senior Engineer, and Product Manager.`
- Reward: `50 XP`
- Badge: `Team Explorer`

Future enhancement, not part of the initial MVP:

- Replace scripted dialogue with a grounded agent that answers only from approved organizational sources.

### Level 2: Learn the Territory

**Purpose:** Help the player understand the organization and the technical landscape.

Display an interactive territory map with this hierarchy:

```text
Organization
├── Team
├── Services
├── Tools
├── Repositories
└── Documentation
```

Each territory becomes a quest area. Selecting or entering an area opens a list of onboarding quests backed by approved content.

Example quest:

```text
Quest: Understand SUNAD
Reward: +100 XP
Badge: SUNAD Explorer
```

Implementation requirements:

- Represent territory definitions as typed data rather than hard-coding them in scenes.
- Each territory must have an ID, title, description, prerequisites, quest IDs, and completion state.
- Each quest must have an ID, title, objective, source references, reward XP, badge, and completion rule.
- Start with one playable territory and one quest before adding the complete map.
- Opening an internal document may count as “visited,” but do not mark a learning quest complete merely because a link was opened.
- For the MVP, use an explicit quiz, acknowledgement, or in-game interaction as the completion rule.
- Never invent facts about SUNAD, XStore, tools, repositories, or services. Use only approved content supplied to the repository.

### Level 3: First Week Missions

**Purpose:** Turn the employee's first-week onboarding checklist into practical missions.

Example missions:

```text
Access Kusto
Run first query
Read architecture documentation
Meet mentor
Fix first bug
```

Implementation requirements for the non-AI MVP:

- Use a predefined mission template loaded from approved local data.
- Allow the player to mark manual missions complete.
- Support evidence notes or a confirmation checkbox where appropriate.
- Clearly label self-reported completion.
- Do not claim that access, meetings, queries, document reading, or bug fixes were automatically verified.
- Award XP only once per mission.
- Show completed and remaining missions in a quest panel.
- Persist progress locally.

Future enhancement, not part of the initial MVP:

- Generate personalized quests based on role and onboarding stage.
- Verify completion through approved integrations and least-privilege access.
- Require user visibility and confirmation before an integration changes completion status.

## XStore onboarding source

Use the internal document below as an authoritative content source when the developer supplies accessible excerpts or adds approved derived content to the repository:

- [Getting Started | XStore Common Onboarding Documentation](https://eng.ms/docs/cloud-ai-platform/azure-core/azure-storage/azure-storage-dev-mansah/xstore/onboarding)

Rules for using the source:

1. Do not scrape, crawl, reproduce, summarize, or guess content that is not available in the current workspace or provided directly by the developer.
2. Do not assume GitHub Copilot can access the internal page merely because the URL appears in this file.
3. Ask the developer to add only approved excerpts or structured summaries under `content/xstore/`.
4. Preserve a source URL and source title for every derived quest.
5. Keep internal onboarding content out of public repositories, screenshots, telemetry, and demo recordings.
6. Never copy credentials, secrets, tokens, personal data, incident details, production identifiers, or restricted operational procedures into game data.
7. When source content is missing, create a clearly labeled placeholder and state exactly what information is required.
8. When source content conflicts with local game data, flag the conflict instead of deciding which is current.

Recommended approved-content structure:

```text
content/
└── xstore/
    ├── README.md
    ├── onboarding-index.json
    └── quests/
        ├── team-overview.json
        ├── services-overview.json
        ├── tools-overview.json
        ├── repositories-overview.json
        └── documentation-overview.json
```

Each approved content item should use this structure:

```json
{
  "id": "unique-id",
  "title": "Approved title",
  "summary": "Approved short summary",
  "learningObjectives": ["Objective 1"],
  "sourceTitle": "Getting Started | XStore Common Onboarding Documentation",
  "sourceUrl": "https://eng.ms/docs/cloud-ai-platform/azure-core/azure-storage/azure-storage-dev-mansah/xstore/onboarding",
  "lastReviewed": "YYYY-MM-DD",
  "approvedForDemo": false
}
```

Do not fill unknown fields with guesses.

## Suggested project structure

```text
onboardquest/
├── .github/
│   └── copilot-instructions.md
├── content/
│   └── xstore/
├── public/
│   └── assets/
├── src/
│   ├── app/
│   ├── components/
│   │   ├── DialoguePanel.tsx
│   │   ├── QuestPanel.tsx
│   │   ├── PlayerProfile.tsx
│   │   └── TerritoryPanel.tsx
│   ├── data/
│   │   ├── teamMembers.json
│   │   ├── territories.json
│   │   └── quests.json
│   ├── game/
│   │   ├── entities/
│   │   │   ├── NPC.ts
│   │   │   └── Player.ts
│   │   ├── scenes/
│   │   │   ├── BootScene.ts
│   │   │   └── TeamVillageScene.ts
│   │   └── systems/
│   │       ├── ExperienceManager.ts
│   │       ├── InteractionSystem.ts
│   │       ├── ProgressStore.ts
│   │       └── QuestManager.ts
│   ├── types/
│   │   ├── npc.ts
│   │   ├── progress.ts
│   │   ├── quest.ts
│   │   └── territory.ts
│   ├── App.tsx
│   └── main.tsx
└── tests/
```

## Core domain types

Use explicit types for:

- `TeamMember`
- `NpcProfile`
- `Territory`
- `Quest`
- `QuestObjective`
- `Mission`
- `Reward`
- `Badge`
- `PlayerProgress`
- `SourceReference`

Quest completion must be deterministic. Prefer explicit completion rules such as:

- `talkToNpc`
- `visitTerritory`
- `answerQuiz`
- `manualConfirmation`
- `collectItem`

Do not use free-form text matching as the main completion mechanism.

## Architecture rules

- Phaser owns movement, collisions, map entities, and proximity detection.
- React owns dialogue, quest lists, profiles, menus, XP, badges, and accessibility-friendly UI.
- Use a small typed event bridge between Phaser and React.
- Keep quest state outside Phaser scenes so scenes can restart without losing progress.
- Treat local JSON files as content, not executable code.
- Validate imported content before displaying it.
- Keep employee and internal technical data separate from game engine code.

## Accessibility and usability

- Support keyboard controls.
- Provide visible interaction prompts.
- Do not rely only on color to communicate quest state.
- Provide readable text contrast and scalable UI text.
- Allow dialogue to be dismissed with keyboard controls.
- Avoid time limits in onboarding quests by default.
- Provide a non-game list view of quests for users who prefer it.

## Security and privacy

- Do not store secrets or access tokens in the repository.
- Do not publish internal XStore content in a public GitHub repository.
- Do not expose personal employee details beyond approved workplace profile information.
- Do not infer employee performance, sentiment, availability, or suitability.
- Keep the MVP offline and local unless an integration is explicitly requested.
- If a future integration is requested, use least privilege and clearly describe data access.

## Testing expectations

Create tests for:

- Quest progress changes only when the required action occurs.
- XP is awarded once.
- Badges unlock only after prerequisites are complete.
- Saved progress can be loaded safely.
- Invalid or incomplete content is rejected or displayed as unavailable.
- Reset progress returns the demo to its initial state.

## Definition of done for the first demo

The first demo is complete when:

1. The project starts locally from VS Code.
2. The player can move around Team Village.
3. The player can approach and interact with four NPCs.
4. Each NPC displays approved or clearly fictional profile information.
5. The quest panel updates after every required interaction.
6. Completing the quest awards XP and unlocks a badge once.
7. Refreshing the browser preserves progress.
8. Resetting progress allows the demo to be repeated.
9. `npm run build` succeeds.
10. Unit tests pass.

## How GitHub Copilot should respond

When asked to implement a feature:

1. Restate the smallest feature being implemented.
2. List files that will be created or changed.
3. Implement only that feature.
4. Explain the important code and Phaser concepts.
5. Provide commands to run or verify the change.
6. Mention assumptions and placeholders.
7. Suggest exactly one logical next step.

If the requested change is too large, break it into phases and implement only the first phase unless the developer explicitly requests otherwise.

## Initial Copilot prompt

Use this prompt after the repository is open in VS Code:

> Read `.github/copilot-instructions.md`. Scaffold the smallest playable OnboardQuest MVP using Vite, React, TypeScript, and Phaser. Start only with the app shell, Phaser canvas, TeamVillageScene, a player represented by a simple shape, and keyboard movement. Do not add NPCs, quests, XP, badges, AI, a backend, or cloud services yet. Before editing, show the files you will create and the commands you will run. After editing, run the build and explain the key files.
