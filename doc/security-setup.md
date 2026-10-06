# Scrap Radar security setup

Checked against vendor documentation October 6, 2026. This is a setup runbook;
account settings below have not been activated by publishing code.

## Registration and DNS

Railway's [registered domains](https://docs.railway.com/networking/domains/railway-domains)
include WHOIS privacy. Confirm `scrapradarfamily.com` in the owner's Railway
workspace domain list, renewal and dedicated business contact details. Privacy
does not remove information already published elsewhere.

1. Add `scrapradarfamily.com` to Cloudflare on Free. Compare scanned records
   against existing authoritative DNS; scanning is not a complete backup.
2. Preserve every Zoho MX, SPF, DKIM, DMARC and ownership-verification record
   with its actual priority/value. Mail records stay DNS-only.
3. Preserve the verified Board Sense record:

   | Type | Name | Target |
   | --- | --- | --- |
   | CNAME | `boardsense` | `msg0gvyc.up.railway.app` |

4. If registrar DNSSEC is active, disable it before changing nameservers. In
   Railway workspace **Domains → domain → Nameservers → Use Custom
   Nameservers**, enter the two nameservers assigned to this Cloudflare zone.
   Save, wait for activation, then re-establish DNSSEC as supported by the
   registrar. No domain transfer is needed.
5. Proxy web records through Cloudflare. Test Board Sense HTTPS before adding
   origin restrictions. Railway currently [documents Full TLS](https://docs.railway.com/networking/domains/working-with-domains)
   for proxied Railway domains; verify that provider-specific setup. Use
   appropriate host-specific TLS settings when mixing hosting providers.

Cloudflare cannot proxy the GitHub account hostname through this zone. Moving
the frontend to an owned hostname requires [GitHub Pages domain verification and custom-domain setup](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site).
Its CNAME target would be `gfalvo1968-create.github.io` without a repository
path. Test paths and export browser data before changing origin: local device
cases and notes do not automatically move to another hostname. The market API
likewise needs an attached custom domain before proxying; its public Railway
URL is still directly reachable.

## Board Sense origin protection

1. In Cloudflare's [Request Header Transform Rules](https://developers.cloudflare.com/rules/transform/request-header-modification/),
   create a rule matching `http.host eq "boardsense.scrapradarfamily.com"`.
2. Set request header `X-Scrap-Radar-Origin-Key` to a newly generated private
   random value with at least 32 characters. Use **Set static**, which
   overwrites incoming values. Do not use a response header.
3. After the proxied site works, put the same value in the Board Sense server
   variable `BOARD_SENSE_ORIGIN_KEY` and deploy. Keep it out of GitHub, browser
   code, URLs and logs. The feature stays inactive until configured.
4. Verify proxied scans work, direct-origin analysis calls without the header
   return 403, and `/health` remains reachable. The daily gate trusts
   `CF-Connecting-IP` only with the authenticated origin header, avoiding a
   shared Cloudflare-edge quota bucket. `/health` reveals no visitor records.

This restricts application analysis access; it does not hide historical DNS,
erase hosting-provider identity or provide a network-level origin firewall.

## Free-tier traffic controls

Cloudflare provides automatic DDoS protection and a [Free Managed Ruleset](https://developers.cloudflare.com/waf/managed-rules/reference/cloudflare-free-managed-ruleset/).
Free allows [one rate-limiting rule](https://developers.cloudflare.com/waf/rate-limiting-rules/create-zone-dashboard/).
Use it for POST requests on Board Sense analysis paths, choose a supported
dashboard threshold, and test legitimate iPad uploads. Server-side daily
reservation remains the usage authority.

[Bot Fight Mode](https://developers.cloudflare.com/bots/get-started/bot-fight-mode/)
is under **Security → Settings → Bot traffic**. Test before broad activation:
its challenges can disrupt fetch/upload clients and cannot be skipped through
ordinary WAF rules. Paid bot-score expressions do not work on Free. Turnstile
would require server-side Siteverify validation; a widget alone is not a gate.

## Owner access

- GitHub: **Settings → Password and authentication → Two-factor
  authentication**. Enroll an authenticator or supported security key/passkey,
  verify it, and store recovery codes privately before signing out.
- Cloudflare: **My Profile → Authentication**. Add a supported authenticator
  or security-key method and private recovery access.
- Review Railway and Supabase security and the identity provider used to sign
  in. Use unique passwords, MFA where supported, restricted collaborators and
  minimal deployment/database keys. Never put service-role keys in frontend
  code.
- IRM's `BOARD_SENSE_IRM_ADMIN_KEY` is a separate server credential. Without a
  key of at least 32 characters those contact-record endpoints are disabled.
  Tester access cannot read contacts. Use a trusted private client; a public
  admin login UI with account MFA has not been implemented.

The static AI Hall password protects encrypted device notes only. GitHub
account access controls publishing. Public records and issues must contain no
private contacts, passwords, recovery codes or deployment keys.
