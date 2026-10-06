# Customer account setup and verification

The existing Scrap Radar Family Supabase project is used for managed authentication. The browser uses a publishable key only. The SDK is pinned to 2.117.2 with Subresource Integrity. No service-role credential is shipped.

`account.html` supports existing-account sign-in and sign-out. Registration and password recovery handlers are built but disabled by `email_flows_verified:false` until email delivery and redirects are confirmed. `GET /api/account` validates the bearer token online with Supabase, requires a confirmed email and a non-anonymous authenticated user, and returns only records belonging to the verified UUID. Posted customer IDs and editable user metadata never determine plan access. Account responses are not cached. Existing private browser operating profiles remain a separate feature.

## Required provider settings

In the project's Authentication settings:

1. Keep email confirmations enabled and anonymous sign-in disabled.
2. Configure production email delivery through an authorized SMTP provider; verify sender ownership and delivery. Password reset and signup confirmation must both reach a real test inbox. Do not put SMTP secrets into repository files or chat.
3. Add the exact return URL `https://gfalvo1968-create.github.io/scrap_radar_family/account.html` to the redirect allowlist. Add the exact account URL for each separately verified custom domain before using it. Do not allow wildcard external domains.
4. Set a suitable production Site URL and review password strength, Auth rate limits and bot protection.
5. Complete a real signup → email confirmation → login → account read → sign-out test. Confirm an unverified account is denied by the market API.
6. Test recovery from the same browser used to request it; the PKCE verifier is browser-specific. Test an expired recovery link and a refreshed session.
7. Only after passing these checks, enable email flows in the public configuration and retest from the published account page.

The existing-account login path still needs a real consenting tester. No real person was emailed, no test customer was invented and no live subscription was granted by this release.

## Remaining scope

Payments, paid entitlement enforcement, 25-case daily enforcement, saved board-case synchronization, receipts, account deletion and the private admin customer dashboard are not implemented by the account page. All displayed membership prices are prelaunch offers. Customer authentication alone never grants paid access.

Backend tests cover missing/invalid credentials, authentication outage, confirmed email requirements, anonymous denial, account isolation, ignored posted IDs, user-metadata privilege attempts and no-store responses. UI tests cover sign-in requests, password clearing, disabled unverified email flows and sign-out clearing. These fixtures do not prove email delivery.
