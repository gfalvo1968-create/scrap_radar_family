# Customer accounts, pricing and payments — launch requirements

Status: implementation requirements recorded October 6, 2026. Checkout, paid access and the customer dashboard are not yet implemented or verified.

## Product decisions to finalize

| Offering | Scope | Price status |
|---|---|---|
| Public preview | Existing daily board-analysis allowance | Free; keep server-side enforcement |
| Scrap Radar subscription | Scrap planning and comparison tools | Monthly price needs owner decision |
| Board Sense subscription | Board investigation tools | Monthly price and paid usage allowance need owner decision |
| Family subscription | Both products; future module inclusion needs an explicit policy | Monthly price needs owner decision |

Publish a plain comparison of features, usage limits, billing interval and cancellation terms. Do not activate placeholder prices. Scrap buyer rates and assumed recovered-metal values are separate from subscription prices.

## Required customer records

- Authenticated customer ID and verified email; customer ID comes from the authenticated session.
- Provider customer/subscription references, selected plan, subscription state, renewal date and entitlement expiry.
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

1. Finalize prices, paid allowances and entitlement rules.
2. Implement customer authentication and account isolation.
3. Connect payment checkout and verified server notifications.
4. Implement customer account page and private administrator view.
5. Test the complete payment-to-access flow in sandbox, then a controlled live transaction.

Launch readiness requires demonstrated payment and access behavior, not just a working checkout button.
