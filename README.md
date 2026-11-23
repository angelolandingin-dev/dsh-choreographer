# dsh-choreographer

A [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness) agent preset that ships one
thing the `standard` preset leaves out: a written delegation discipline. Same harness tools, same
shell, same filesystem — plus rules that say when a child agent is worth its cold start, how to brief
it, and how much verification a change earns.

## Why this exists

Delegation is easy to get wrong in both directions. Delegate nothing and a long task serializes
behind one agent. Delegate everything and you pay a cold start — a new agent, a re-read of the files,
a rebuilt context, roughly 15k–100k input tokens — for work you could have done in five steps.

The preset encodes the middle: the lead edits small things itself, splits only disjoint or risky
work, reuses the children it already has, and verifies every claim it accepts.

## What it is

A single agent preset named `choreographer`:

| | |
| --- | --- |
| Role | Coding lead: reads, edits, delegates disjoint slices, verifies, reports |
| Tools | read / write / edit / glob / grep, platform shell, web fetch + search, todo, ask-user, time context, skills, goals, schedules, `subagent` + `subagent_fork` + `list_agents` / `send_message` / `wait_agent`, compaction |
| Not mounted | `tool-jobs`, `tool-cordis`, `tool-office`, the plugin market tools, plan mode, `present` — mount what you need in your own patch |
| Policy | one 4.7 KB persona: delegation cost, brief template, effort tiers, verification budget, artifact rules |

The delegation rows are declared here rather than inherited, so the preset works even when the
profile does not mount them for every session.

## Install

```sh
git clone https://github.com/angelolandingin-dev/dsh-choreographer
```

Then in DeepSeek Harness: **Settings → Plugins → Bundles → install**, pointing at the cloned
directory (or `dsh plugin install <path>`). Enable the bundle, restart once, and pick
**Choreographer** when you start a session.

## Using it

- **Briefs are the interface.** Every child prompt carries `TASK / ROLE / GOAL / FILES /
  CONSTRAINTS / CHECK / RETURN`; a child that finishes without `CHECKS` or with an unverified claim
  gets its work checked or redone.
- **One owner per file.** Disjoint `FILES` lists, one writer per file, no substitution of an idle
  lane for a busy one.
- **Reuse before spawning.** `list_agents` shows what exists; `send_message` continues a child
  instead of starting a twin with the same brief. `inactive` means idle, not failed.
- **A report is a claim.** The lead reads the changed file and runs the check itself.
- **Tiers.** Tier 0 answers with reads and spawns nothing; Tier 1 is the lead alone with one check;
  Tier 2 splits disjoint slices and adds one reviewer when control flow or security changed;
  Tier 3 plans first, keeps the risky edits, and adds one reviewer plus one tester pass.
- **Artifacts.** Browser screenshots go to `<Downloads>/dsh-qa/<workspace>/<date>/<NN>-<lane>-<slug>.png`,
  keepers move to `<workspace>/.dsh-artifacts/qa/<date>/<lane>/`, and a QA task is not done while
  its screenshots are loose.

## Requirements

- DeepSeek Harness with the `subagent` / `subagent-fork` / `subagent-control` plugins available
  (`@deepseek-ai/dsh-tool-subagent`, `@deepseek-ai/dsh-tool-subagent-control`) — they ship with the
  harness and the `standard` preset; this preset mounts its own rows so it does not depend on the
  profile.
- No optional bundles. Without the harness delegation plugins the preset still composes, it just
  cannot spawn.

## Verify

```sh
npm run validate
```

Checks that the bundle parses, that the single preset declares the expected 17 plugins, that the
delegation group is present, that the shell rows stay platform-guarded, and prints the persona size.

## License

MIT.
