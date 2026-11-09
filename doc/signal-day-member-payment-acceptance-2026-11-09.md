# Signal Day: paid member launch acceptance gate

**Created:** November 9, 2026
**Decision:** Target paid signup November 19 ONLY after end-to-end test and owner sign-off. Do not charge customers while any critical gate remains unverified.

## Evidence checked
- Frontend branch `feature/signal-day-island-preview` contains `account.html`, `account.js`, and `customer_auth_config.json`.
- `customer_auth_config.json` currently has `email_flows_verified: true`, using a Supabase auth endpoint and Scrap Radar Railway backend API. This is a configuration claim, NOT evidence of successful signup or email delivery.
- The account page contains a signup button and recovery button, enabled by the config, but still says payments and paid access are being prepared and checkout isn't available.
- `account.js` performs password sign-in, sign-up, recovery, sign-out and reads `/api/account` with the Supabase access token. It renders subscriptions returned by the backend. It does **not** grant paid membership in the browser.
- No end-to-end paid checkout, webhook, subscription entitlement, refund/cancellation or cross-device return-login test was verified in this review.

## Required no-money checks (isolated test account)
1. Open final release-candidate `/account.html` in a fresh iPad private browser.
2. Create a unique test account with strong password. Verify real confirmation email and correct callback URL on the actual launch domain.
3. Sign in, sign out and sign back in; inspect account endpoint status while authenticated; confirm an unauthenticated request is denied and errors do not expose internals.
4. Trigger password reset and confirm single-use expiration and return URL.
5. Confirm no membership is shown by default for a fresh free account.
6. Complete Board Sense and Scrap Radar trial journeys, quota enforcement and error states, without using real payment credentials.
7. Verify support contact, approved privacy/terms, sponsor links, mobile layout and accessibility.

## Payment sandbox / test mode, no production charges
1. Verify PayPal business account and correct **sandbox** app, plan IDs, amounts and currency; never print credentials or secret keys.
2. Start checkout with one test customer for each active plan; handle success, cancel, decline, pending, duplicate-click and timeout.
3. Verify signed PayPal webhooks on the server, idempotency for duplicate/out-of-order webhooks, plan-user mapping and non-forgeable entitlements.
4. Confirm account displays the right plan only after verified server-side payment state; sign out/back in, switch device, and retry.
5. Test failed renewal, cancellation, refund, chargeback and subscription expiry; ensure entitlements update consistently.
6. Confirm no checkout button or live payment collection is exposed before sandbox end-to-end testing passes.
7. Match owner-approved pricing and the Everyone/Everything future-feature promise before publishing; avoid silent plan changes.
8. Log test case IDs, expected/actual result and evidence without personal data.

## Release choice
- **All critical cases pass:** owner authorizes production live checkout with carefully monitored first real payment.
- **Checkout not ready but account security works:** consider free-only launch with checkout OFF and clear notice.
- **Account/security/privacy critical failure:** delay public signup until corrected.

## Still to inspect
- Actual backend `/api/account` auth and subscription state, PayPal create/verify/webhook path, test-mode deployment and domain-specific Supabase redirect allowlist.
- Production versus preview `email_flows_verified` config, confirmation email deliverability and password recovery.
- Live secrets/roles must never be copied into repo or public documents.

This note is a checklist, not a passing test report. No payment or production mutation was performed.
