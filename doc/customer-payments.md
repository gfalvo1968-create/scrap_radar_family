# Customer accounts, pricing and payments — launch requirements

Status: implementation requirements recorded October 6, 2026. Checkout, paid access and the customer dashboard are not yet implemented or verified.

## Approved monthly prices — October 6, 2026

| Offering | Scope | Price status |
|---|---|---|
| Public preview | Existing daily board-analysis allowance | Free; keep server-side enforcement |
| Scrap Radar subscription | Scrap planning and comparison tools | $19.95 USD/month |
| Board Sense subscription | Board investigation tools | $29.95 USD/month; paid usage allowance remains to be set |
| Family subscription | Both products and future Scrap Radar Family software modules | $44.95 USD/month for early members |

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
