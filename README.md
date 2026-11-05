# dsh-choreographer

A trimmed [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness) port of
[x01Jin/openchoreographer](https://github.com/x01Jin/openchoreographer): one hands-on
tech-lead agent that edits small changes itself and delegates large, parallel, or risky work
to eight specialist worker agents.

The port keeps the part that makes orchestration work — one agent that inspects, plans,
delegates, and verifies — and drops the rest. The original 14 agents become 9 presets:
the five separate reviewer roles collapse into one reviewer that takes a lens, and
database + devops become one platform role.

## What you get

| Preset | Role | Tools |
| --- | --- | --- |
| **choreographer** | Hands-on tech lead: inspects, edits small changes itself, splits genuinely parallel work, delegates, verifies, reports | read / write / edit / glob / grep, platform shell, web fetch + search, todo, ask-user, time context, skills, goals, schedules, subagent delegation, compaction |
| explore | Returns a `path:line` map of the codebase. No edits, no commands | read-only fs |
| backend | APIs, services, auth, integrations, jobs, server-side validation | fs + platform shell |
| frontend | Components, client state, styling, a11y, responsive layout, loading/error states | fs + platform shell |
| platform | Database and devops merged: schemas, migrations, queries, build, CI, containers, deploy | fs + platform shell |
| tester | Reproduces first, then verifies behavior against the exact command and exit code | fs + platform shell |
| designer | States before pixels. Copy, accessibility, acceptance criteria. No code | read-only fs |
| writer | Docs only: current behavior, verified commands, markdown | fs + platform shell |
| reviewer | One lens per task: `correctness` (default), `security`, `plan`, `scope`, `execution` | read-only fs |

Workers share one return contract, so their results are easy to read side by side:
`TASK`, `FILES`, `CHECKS`, `NOT DONE`, `BLOCKED`, `RISK`.

## Install

### From the Plugins page

1. Open **Plugins** in the DSH sidebar.
2. Choose **Add plugin**, enter `dsh-choreographer`, and install.
3. Enable the bundle when the install finishes.
4. Start a new session and pick **Choreographer** in the agent picker.

### From GitHub (before the package is on npm)

Enter `github:angelolandingin-dev/dsh-choreographer` in **Plugins → Add plugin**, or run:

```sh
dsh plugin --profile desktop add github:angelolandingin-dev/dsh-choreographer
```

Then make sure `dsh-choreographer` is listed in `dsh.profile.bundles` in the
profile `package.json` (the Plugins page does this for you).

### From a checkout

```sh
dsh plugin --profile desktop add <path-to-this-repo>
```

Then add `dsh-choreographer` to `dsh.profile.bundles` in the profile's `package.json`
(the managed install done by the Plugins page writes that entry for you).

The plugin needs no build step and no runtime dependencies. It is a package manifest
plus one Cordis patch file that declares the presets.

## Using it

Pick **Choreographer** as the session's agent. It reads the repository and makes small
changes itself; when the work splits into disjoint areas it spawns worker presets through
the `subagent` tool with an explicit `agent_preset`. It dispatches those slices together
so they run in parallel, keeps working while they run, and verifies the result before
reporting.

- Presets are chosen per session and **lock after the first turn**. To switch, start a
  new session.
- The reviewer takes its lens from the task, for example:
  `lens: security — review the diff for authz gaps`.
- Workers cannot delegate further and cannot ask the user questions; a blocked worker
  reports `BLOCKED:` instead of guessing.

## Verification policy

Verification is budgeted, not ritual. The lead proves its own edits with one cheap check and a read of the changed file. Workers prove their change with fast local checks (type check, build, lint, focused tests) and stop there; they never open a browser, start a dev server, or run an end-to-end pass. Browser and end-to-end proof belongs to the `tester` preset, which the lead dispatches once per round for the criteria that actually need it. Reviewers are read-only and capped at one per round. The lead reads files and worker evidence and is told never to drive a browser or a dev server itself, so runtime proof always comes from that single tester pass.
## Requirements

- DeepSeek Harness **0.2.2-rc.1** (tested).
- The patch references components that ship inside the Harness
  (`@deepseek-ai/dsh-persona`, `dsh-tool-fs`, `dsh-tool-subagent`, …). If a future
  Harness release renames or removes one, that preset fails to compose and the failing
  row appears under **Settings → Session plugins**; update `cordis.patch.yml` and bump
  the version.
- Windows uses `tool-pwsh`; macOS and Linux use `tool-bash`. Both rows exist in the lead
  and in every worker preset with a platform guard, mirroring the shipped standard preset.

## How it is built

`cordis.patch.yml` inserts nine `@deepseek-ai/dsh-agent-preset` rows. Each row lists
ordinary Harness plugins: a persona prompt, the tool mounts for that role, and — for
the lead — a `subagent` instance whose `allowedAgentPresets` exposes exactly the eight
worker ids.

```
cordis.patch.yml   nine preset declarations
tools/validate.cjs parses the patch and prints the roster (dev helper, not published)
```

Run `npm run validate` after editing the patch.

## Uninstall

Remove the bundle from the Plugins page. The presets disappear with it; sessions that
already selected one keep their transcript but will fall back to the default preset
when a new turn composes without the bundle.

## Credits and license

MIT. The agent roles, prompts, and orchestration rules are ported from
[x01Jin/openchoreographer](https://github.com/x01Jin/openchoreographer) (MIT).
DeepSeek Harness and its plugin packages belong to their authors.

