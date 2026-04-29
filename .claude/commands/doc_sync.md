# /doc_sync [scope-hint]

1. Check what changed (`git diff --name-only`)
2. Update `ai_context/AI_CONTEXT.md` with current project state
3. If schema / KYC tiers / states / error codes changed → update `docs/models.md`
4. If product / personas / features / NFRs / open questions changed → update `docs/product_requirements_document.md`
5. If flows / state machines / mindmap changed → update the relevant file in `docs/mermaid_schemas/`
6. Checkpoint `ai_context/HISTORY.md` with date, summary, files touched
