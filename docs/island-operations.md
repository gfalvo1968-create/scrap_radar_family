# Island operations — release gates
Owner retains final release and moderation authority. Preview is not production.
## Current verified baseline
- Vercel preview c9d90fc85cbd367a5f862e8490f283934801ffd4 READY (build status only).
- Owner confirmed Wall of Names renders newly approved entries on iPad; five approved, two test entries pending at last review.
- Supabase Scrap Radar Family reports ACTIVE_HEALTHY; no separate Scrap Radar staging project found. Do not use OSINT Radar as staging.
- Owner review UI and draft SQL committed; RPCs not activated and owner account not provisioned.
## Release gate (all must pass before owner signoff)
1. Isolated staging database with synthetic records, same schema and policies; no customer records copied.
2. Verify administrator identity, least privilege, revocation, and session expiration. Anonymous and ordinary signed-in users cannot read pending names, edit, approve, reject, or read audit logs.
3. Test owner review, edit, approve, reject, repeat/stale requests, audit history, sign-out, and failure states. Confirm pending names stay private and public rotation only reads approved records.
4. Check homepage radar, personal log refresh, Wall rotation, account, Scrap Radar calculations and SPIKE safe-input handling on iPad. Record exact commit and evidence.
5. Confirm backups/restoration path and rollback target, monitor errors, obtain owner signoff. Recheck target and environment before any production deployment or migration.
## Routine operations
- Daily: inspect build failures, backend health, public availability, moderation queue and error trends; report verified failures and unknowns separately.
- Weekly: review costs/quotas, security advisories, backups, restore drill schedule, and outstanding defects.
- Incident: record time, affected service, last known good release; stop further releases; diagnose; obtain approval for rollback or data changes; verify recovery and document cause.
## Mission Control roadmap
Wall moderation first; then read-only service health, Board Sense metrics, market feed freshness, membership status, security, maintenance, AI Hall and Attic. Use actual server data; show unavailable when unverified. Never expose credentials or private metrics in public pages.
