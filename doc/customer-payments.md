# Customer accounts, pricing and payments — launch requirements

Status: implementation requirements recorded October 6, 2026. Checkout, paid access and the customer dashboard are not yet implemented or verified.

## Approved monthly prices — October 6, 2026

| Offering | Scope | Price status |
|---|---|---|
| Public preview | Existing daily board-analysis allowance | Free; keep server-side enforcement |
| Scrap Radar subscription | Scrap planning and comparison tools | $19.95 USD/month |
| Board Sense subscription | Board investigation tools | $29.95 USD/month; 25 board cases per day |
| Family subscription | Both products and future Scrap Radar Family software modules | $44.95 USD/month for early members; 25 board cases per day |

Publish a plain comparison of features, usage limits, billing interval and cancellation terms. Do not activate placeholder prices. Scrap buyer rates and assumed recovered-metal values are separate from subscription prices.

## Early-member Family rate

The owner approved these prices and this policy on October 6, 2026. The $44.95 monthly Family rate stays with an early member while their subscription remains active. It includes all current and future Scrap Radar Family software modules for one account, subject to published usage allowances. New customers may be offered a higher price later; an existing qualifying member keeps their rate. A member who cancels and later rejoins pays the price offered at rejoining.

Usage allowances and the handling of failed payments, payment-retry grace periods, pauses and plan changes remain undecided. Do not silently remove the early-member rate for a temporary payment failure. Define and publish these rules before enabling billing. No unlimited processing promise is approved.

## Required customer records

- Authenticated customer ID and verified email; customer ID comes from the authenticated session.
- Provider customer/subscription references, selected plan, subscription state, renewal date and entitlement expiry.
- Store the customer's original price/version, early-member eligibility and continuity history independently of the current public price. Future module entitlements must follow Family membership, not require a second purchase.
- Daily usage counters and support history appropriate to the account.
- Payment event IDs and timestamps for audit and duplicate-event protection.
- Keep card details with the payment provider. Collect no card numbers in Scrap Radar.

Customers may read only their own account and cases. A private administrator view must support customer lookup, plan, payment state and access state. Administrative actions need authentication, MFA and an audit record.

## Payment integration acceptance criteria

Use the owner's business payment account; confirm the provider and its supported subscription flow before implementation. Credentials belong on the server, not in browser code or chat.

1. A customer signs in, chooses a published plan and sees its price and recurring terms before checkout.
2. Checkout occurs through the provider's supported flow. Returning to a success page alone never grants access.
3. The server verifies payment notifications, associates them with the correct account, and processes each event idempotently.
4. Paid access follows verified subscription state and a documented expiry policy. Failed payments, cancellation, expiration, refunds and disputes have explicit rules.
5. Customers can see their plan, renewal information, receipts and how to cancel. Cancellation does not silently promise a refund.
6. Sandbox testing covers successful payment, abandoned checkout, duplicate and delayed notifications, invalid notification, failed renewal, cancellation and cross-account access attempts.
7. Before live payments: final prices, business account connection, customer support contact, refund/cancellation policy and privacy/retention policy are approved and published.

## Work order

1. Prices and the early-member policy are approved. Finalize paid allowances and remaining entitlement rules.
2. Implement customer authentication and account isolation.
3. Connect payment checkout and verified server notifications.
4. Implement customer account page and private administrator view.
5. Test the complete payment-to-access flow in sandbox, then a controlled live transaction.

Launch readiness requires demonstrated payment and access behavior, not just a working checkout button.

## Implementation checkpoint — October 6 evening

The market backend now provides a versioned membership catalog with the approved prices and checkout disabled. An internal SQLite ledger freezes subscription prices, binds subscriptions to trusted customer IDs, and records idempotent reconciled state changes. Payment failure alone preserves rate continuity. This is foundation code: authentication, verified email, PayPal checkout and verified notifications, entitlement enforcement, customer pages and admin tracking remain unimplemented. All 24 market-backend tests pass. No payment or live customer record was created.

## Approved paid board allowance — October 6, 2026

The owner approved 25 physical board cases per day for Board Sense and Family subscribers. Several permitted views of one board count as one case, not one allowance per photo. This allowance is recorded in the backend catalog; authenticated server-side enforcement is not yet implemented. Scrap Radar-only membership does not include the paid Board Sense allowance. Define daily reset timing and failed-analysis counting before checkout. Do not consume paid allowance for validation failures or mixed-board rejection. Payment retry/grace rules remain pending.

## November 22, 2026 — verified billing state and next implementation gate

**Billing is NOT a launch-ready paid feature.** Current `account.html` says checkout is unavailable. The actual `Scrapradar-backend` repository now contains more recent owner-only PayPal **sandbox** work than this October 6 baseline describes:

- `PAYPAL_SANDBOX.md`, `paypal_checkout.py` and `paypal_sandbox.py` document a **sandbox-only**, identity-bound PayPal subscription pilot. Owner iPad testing documented all three approved prices, PayPal ACTIVE state, test payments, return to site and cancellation/reconciliation checks. These are test transactions, not live revenue or enabled entitlements.
- The pilot restricts checkout to the confirmed owner test identity and requires sandbox settings; separate `paypal_pilot_*` tables prevent granting production membership. Server-side canonical PayPal subscription/plan/price/binding checks and webhook verification implementation exist. The documentation says real signed sandbox webhook delivery verification is **still pending**.
- Current customer account API, `customer_accounts.py`, explicitly returns `checkout_enabled:false`, `paid_access_enabled:false`, and paid board allowance enforcement `not_connected`. The public `account.html` states that checkout and paid analysis are not available. No live money should be collected until an authenticated, fully tested production entitlement path exists.
- Price contract stays **$19.95 Scrap Radar; $29.95 Board Sense (25 cases/day); $44.95 Family (25 cases/day, all current and future Family software modules for active members)**. One physical board with multiple views consumes one allowance, not multiple cases. Preserve the founder price for qualifying continuous membership; do not remove it merely due to a temporary failed renewal.

**Remaining work in release order:** (1) confirm sandbox webhook signature/delivery, failures, duplicates, cancellations and delayed events; (2) implement authenticated, server-enforced customer entitlements and paid scan counts with a written daily reset rule and failed-analysis refund/credit policy; (3) implement account self-service/receipts/cancellation and secure customer support; (4) approve grace-period, refund and recurring-payment disclosures, including future Family module promise; (5) complete full sandbox acceptance with cross-account isolation and provider outage; (6) connect/test production PayPal business environment using server-only credentials and controlled real transaction, then explicitly approve paid rollout. **No payment keys or passwords in GitHub, browser HTML or chat.**

**November 23 launch scope:** Limit to separately verified free informational tools and controlled free Board Sense sampling if approved. Do not present subscriptions as available or accept paid customers until every billing gate above passes.
