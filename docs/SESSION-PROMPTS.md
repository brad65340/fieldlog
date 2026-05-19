# First Claude Code Session Prompt

Copy and paste this EXACTLY to start the first Claude Code session tonight.

---

## PASTE THIS TO START

```
We are starting a new project called FieldLog for the Codefi Vibeathon 2026.
This is a solo build. Deadline is May 22. We are doing Phase 1 tonight.

I have already created the project documentation files. Before writing any
application code, read these files in this order:

1. BLUEPRINT.md
2. .claude/CLAUDE.md
3. DECISIONS.md
4. SECURITY.md
5. docs/phases/phase-01-foundation.md

After reading all five files, confirm back to me:
- What FieldLog does (one sentence)
- The full tech stack
- The six database tables and their key constraint (applications immutability)
- What Phase 1 delivers
- The first task in Module 1.1

Then wait for me to say "start."
```

---

## After Claude Code Confirms -- Say This

```
Start. Build Module 1.1 -- Project Scaffold.

Follow the steps exactly as written in phase-01-foundation.md.
Do not skip steps. Do not add features not in the spec.
After Module 1.1 is complete and the build passes, stop and confirm before moving to 1.2.
```

---

## Between Modules -- Say This

```
Module [X.X] confirmed complete. Move to Module [X.X] -- [Name].
Follow the spec in phase-01-foundation.md exactly.
Stop and confirm after each module before moving to the next.
```

---

## End of Session -- Say This

```
We are wrapping this session. Run the Session End Protocol from BLUEPRINT.md:

1. pnpm run build -- confirm 0 errors
2. pnpm run lint -- confirm 0 errors
3. Security spot check on any new endpoints
4. Code health check on new files
5. Write handoff to docs/handoffs/phase-01-mod-[X.X]-session-1.md

Then commit and push.
```

---

## Start of Next Session -- Say This

```
Read BLUEPRINT.md and the most recent file in docs/handoffs/ before doing anything.

Confirm back:
- Current phase and module
- What was completed last session
- What we are building today
- Any security checks outstanding

Then wait for my first task.
```
