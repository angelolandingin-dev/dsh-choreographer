# dsh-choreographer

A [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness) **Agent Teams**
preset: one lead that runs a request through a small, reusable roster of named teammates
instead of spawning a fresh worker per task.

It is a trimmed port of [x01Jin/openchoreographer](https://github.com/x01Jin/openchoreographer)
adapted to Agent Teams: one lead, one team, lanes as durable teammates.

## The idea

Worker-subagent orchestration pays a cold start for every task: a new agent, a new brief,
a new re-read of the same files, then the agent is thrown away. Most sessions end up
delegating serially, so the cold starts cost more than they save.

This preset keeps the workers alive instead. The lead:

- plans lanes for the request (backend, frontend, tester, reviewer, …),
- spawns a lane **once**, on its first real slice,
- creates a shared task with `write_scopes` for each piece of work and hands it to the
  lane owner by name,
- reuses that teammate with `send_message` for every later task in the same lane,
- verifies the work itself and owns the final diff.

A spawn is the exception; a reuse is the pattern. That is the whole design.

## What you get

One preset, `choreographer`:

| | |
| --- | --- |
| Role | Team lead: inspects, edits small changes itself, splits disjoint work across a reusable roster, verifies, reports |
| Tools | read / write / edit / glob / grep, platform shell, web fetch + search, todo, ask-user, time context, skills, goals, schedules, **team tools** (spawn / message / wait / tasks / roster), compaction |
| Not mounted | `subagent` and `subagent-control` — delegation happens through the team only |

Teammates inherit the lead's tools and none of its context, so the brief is the whole
role. The persona ships a brief template:

```
TASK: <task id>
ROLE: <the lane this teammate owns>
GOAL: <concrete outcome>
FILES: <paths it owns>
CONSTRAINTS: <patterns, things that must not change>
ACCEPTANCE: <observable criteria>
CHECK: <one command that proves it>
DO NOT TOUCH: <outside its scope>
RETURN: files changed, command + exit code, failures, unverified risks
```

## Install

### From the Plugins page

1. Open **Plugins** in the DSH sidebar.
2. Choose **Add plugin**, enter `dsh-choreographer`, and install.
3. Enable the bundle when the install finishes.
4. Make sure the Agent Teams bundle is enabled too
   (`@deepseek-ai/dsh-experimental-agent-team-profile`) — it mounts the team tools for every
   session; the preset deliberately does not mount them a second time.
5. Start a new session and pick **Choreographer** in the agent picker.

### From GitHub

Enter `github:angelolandingin-dev/dsh-choreographer` in **Plugins → Add plugin**, or run:

```sh
dsh plugin --profile desktop add github:angelolandingin-dev/dsh-choreographer
```

Then make sure `dsh-choreographer` is listed in `dsh.profile.bundles` in the profile
`package.json` (the Plugins page does this for you).

### From a checkout

```sh
dsh plugin --profile desktop add <path-to-this-repo>
```

The package has no build step and no runtime dependencies: one manifest plus one Cordis
patch file.

## Using it

Pick **Choreographer** as the session's agent. Presets are chosen per session and **lock
after the first turn**; to switch, start a new session.

The roster is yours to steer: `list_agents` shows who is resident and idle, `send_message`
wakes an idle teammate, `wait_agent` returns on its next message or status change.
Teammates stay resident between tasks by design; `inactive` means idle, not failed.

Rules the persona enforces:

- one owner per lane; a second teammate for the same lane is a last resort;
- a spawn must buy a slice worth ≥15 steps, or one independent check; work that is
  smaller stays with the lead;
- work goes to the lane that owns the domain — no substituting an idle lane for a busy one;
- a `BLOCKED: outside <lane> scope` report is a scope correction, not a failure;
- two to four active teammates; more is coordination cost;
- one writer per file; disjoint `write_scopes` are the only isolation there is;
- every report is a claim: the lead reads the changed files and runs the check itself.

Effort tiers survive the move to teams: Tier 0 answers with reads and spawns nothing, Tier 1
is the lead alone with one local check, Tier 2 splits disjoint slices across lanes plus one
reviewer when control flow or security changed, Tier 3 plans first, keeps risky edits with
the lead, and adds one reviewer and one tester pass.

## Verification policy

Verification is budgeted, not ritual. The lead proves its own edits with one cheap check and
a read of the changed file. Teammates prove their change with fast local checks (type
check, build, lint, focused tests) and stop there. Browser, end-to-end, or visual proof goes
to the `tester` lane once per round, for the criteria that actually need it. At most one
reviewer per round, and only for control-flow or security-relevant work.

## Requirements

- DeepSeek Harness **0.2.2-rc.1** or newer (tested on 0.2.2-rc.1).
- The **Agent Teams** profile bundle enabled, which provides `ctx.agentTeams` and the team
  tools. Without it the preset still composes, but the lead has no way to spawn a teammate,
  so it can only answer with reads and its own edits.
- The patch references components that ship inside the Harness. If a release renames or
  removes one, the preset fails to compose; update `cordis.patch.yml` and bump the version.
- Windows uses `tool-pwsh`, macOS and Linux use `tool-bash`, guarded per platform.

## How it is built

`cordis.patch.yml` inserts one `@deepseek-ai/dsh-agent-preset` row. It mounts a persona
prompt, the standard tool set, and `@deepseek-ai/dsh-experimental-tool-agent-team`
(`freshProvider: spawn`, `forkProvider: fork`) — no `subagent` rows.

```
cordis.patch.yml    one preset declaration
tools/validate.cjs  parses the patch and prints the composition (dev helper, not published)
```

Run `npm run validate` after editing the patch.

## Uninstall

Remove the bundle from the Plugins page. Sessions that already selected the preset keep
their transcript and keep running against the definition they composed with until restart;
a new session composed without the bundle falls back to the default preset.

## Credits and license

MIT. The orchestration rules and role split are ported from
[x01Jin/openchoreographer](https://github.com/x01Jin/openchoreographer) (MIT).
DeepSeek Harness and its plugin packages belong to their authors.
