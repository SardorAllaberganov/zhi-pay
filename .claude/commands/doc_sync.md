# /doc_sync [scope-hint]

**Execute immediately — do NOT propose a package and wait for approval.** Write the file changes directly. The user invokes `/doc_sync` to update docs in one shot.

1. Check what changed (`git diff --name-only`)
2. Update `ai_context/AI_CONTEXT.md` with current project state
3. If schema / KYC tiers / states / error codes changed → update `docs/models.md`
4. If product / personas / features / NFRs / open questions changed → update `docs/product_requirements_document.md`
5. If flows / state machines / mindmap changed → update the relevant file in `docs/mermaid_schemas/`
6. Checkpoint `ai_context/HISTORY.md` with date, summary, files touched
7. Report what was written, in 1–2 short paragraphs.
