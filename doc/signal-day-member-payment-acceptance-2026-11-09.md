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

## November 9 owner iPad account-flow evidence

- Screenshot at 1:34 AM Eastern: email confirmation led to a GitHub Pages account page with a signed-in session and a clear 'No paid membership is attached to this account' response. The callback landing on GitHub Pages rather than the originally tested Vercel site requires final-domain redirect review.
- Screenshot at 1:37 AM Eastern: after signing out and returning to `scrap-radar-family-phase7c-test.vercel.app`, the account page showed a signed-in session, 'Signed in.' status, the expected account identifier and an empty paid-membership state.
- **Passed (manual owner observation):** return password sign-in to Vercel test site, display of authenticated account and no automatic paid entitlement.
- **Not established:** signup email timing and every redirect step, password recovery, customer account security under adversarial conditions, PayPal payment, server webhook verification, paid entitlement activation, cancellation or renewal.
- Account screenshots contained a test login email. This audit records observations without copying that personal address.

## November 9 backend source inspection: sandbox pilot already exists

**Correct Railway production service source:** `gfalvo1968-create/Scrapradar-backend` (note lowercase d and hyphen), project `sparkling-manifestation`, service `Scrapradar-backend`; Railway has live `PAYPAL_CLIENT_ID`, `PAYPAL_CLIENT_SECRET`, `PAYPAL_ENVIRONMENT`, `PAYPAL_SANDBOX_WEBHOOK_ID` variable names (values not viewed or disclosed), with a successful October 10 deployment. Do **not** mistake separate `ScrapRadar-Backend2` repo for deployed code.

**Implemented in deployed source:**
- `customer_accounts.py` validates Bearer tokens against Supabase Auth, demands confirmed email, and returns customer-specific `GET /api/account`.
- `paypal_checkout.py` exposes owner-only sandbox `/api/paypal/pilot/checkout`, `/intents/{intent}`, and signed `/webhook`; sandbox mode required, matching owner account enforced, accepted approval URL allowlisted; writes only `paypal_pilot_*` tables and explicitly refuses any production entitlement.
- `sandbox_checkout.html` / JS already exist in frontend but are not public paid checkout.
- `PAYPAL_SANDBOX.md` documents owner iPad October 8 successful sandbox tests across all three prices with ACTIVE state, recorded test payments and cancellation observations. October 10 webhook registration included seven subscription events plus PAYMENT.SALE.COMPLETED; real signed webhook delivery still unverified, and no live payment-to-app permission wiring exists.
- `membership_records.py` is an isolated customer ledger, and `/api/account` returns `checkout_enabled: false`, `paid_access_enabled: false`, `usage.enforcement: not_connected`. This is an intentional fail-closed state.

**Critical gap for Nov 19 paid launch:** reliable server-side PayPal live-mode subscription lifecycle + verified and reconciled webhooks + entitlements actually checked by both product backends + 25-per-day usage allowance, cancellation, refund, and payment failure handling. None should be inferred from the sandbox pilot.

**No production changes made in this inspection.** Leave public checkout and paid access off until an isolated integration test and reviewed release approval.
