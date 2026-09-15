# DNS for AI Discovery (DNS-AID) Setup Guide

This guide documents the DNS-AID records and DNSSEC configuration for `solverspro.com`, adhering to [draft-mozleywilliams-dnsop-dnsaid](https://datatracker.ietf.org/doc/draft-mozleywilliams-dnsop-dnsaid/) and [RFC 9460](https://www.rfc-editor.org/rfc/rfc9460) (SVCB and HTTPS DNS Resource Records).

---

## 1. What is DNS-AID?

DNS-AID allows autonomous AI agents and resolver clients to discover AI capabilities, entrypoints, and authentication endpoints directly through standard DNS queries before initiating HTTP requests.

Records are published under the `_agents` subdomain using ServiceMode `SVCB` records (or `HTTPS` records for HTTPS endpoints), with `alpn` and endpoint connection parameters.

---

## 2. Recommended DNS Records

Add the following records to your Cloudflare DNS zone for `solverspro.com`:

### A. Index Discovery Record (`_index._agents.solverspro.com`)

```dns
_index._agents.solverspro.com. 3600 IN SVCB 1 solverspro.com. alpn="h2,h3" port=443 mandatory=alpn,port
```

### B. Agent-to-Agent / A2A Discovery Record (`_a2a._agents.solverspro.com`)

```dns
_a2a._agents.solverspro.com. 3600 IN SVCB 1 solverspro.com. alpn="a2a" port=443 mandatory=alpn,port
```

### C. ARD AI Catalog DNS Record (`_catalog._agents.solverspro.com`)

```dns
_catalog._agents.solverspro.com. 3600 IN TXT "url=https://solverspro.com/.well-known/ai-catalog.json"
```

### D. Fallback TXT Record (`_agents.solverspro.com`)

```dns
_agents.solverspro.com. 3600 IN TXT "v=dnsaid1; ai-catalog=https://solverspro.com/.well-known/ai-catalog.json; mcp=https://solverspro.com/.well-known/mcp/server-card.json; skills=https://solverspro.com/.well-known/agent-skills/index.json"
```

---

## 3. Cloudflare DNS Dashboard Setup Instructions

1. Open the [Cloudflare Dashboard](https://dash.cloudflare.com/) and navigate to your `solverspro.com` domain.
2. Click **DNS** > **Records**.
3. Add the following records:

| Type | Name | Priority | Target | Value/Content | TTL |
|------|------|----------|--------|---------------|-----|
| SVCB | `_index._agents` | 1 | `solverspro.com` | `alpn="h2,h3" port=443 mandatory=alpn,port` | Auto |
| SVCB | `_a2a._agents` | 1 | `solverspro.com` | `alpn="a2a" port=443 mandatory=alpn,port` | Auto |
| TXT | `_catalog._agents` | — | — | `url=https://solverspro.com/.well-known/ai-catalog.json` | Auto |
| TXT | `_agents` | — | — | `v=dnsaid1; ai-catalog=https://solverspro.com/.well-known/ai-catalog.json; mcp=https://solverspro.com/.well-known/mcp/server-card.json; skills=https://solverspro.com/.well-known/agent-skills/index.json` | Auto |

---

## 4. Enabling DNSSEC

To ensure validating resolvers return authenticated cryptographic data:
1. In the Cloudflare Dashboard, go to **DNS** > **Settings**.
2. Scroll to **DNSSEC** and click **Enable DNSSEC**.
3. Copy the DS record details (Key Tag, Algorithm, Digest Type, Digest) into your domain registrar's DNSSEC control panel.
4. Verify validation using:
   ```bash
   dig +dnssec _index._agents.solverspro.com SVCB
   dig _catalog._agents.solverspro.com TXT
   ```

---

## 5. Markdown for Agents (Cloudflare Dashboard)

To pass the Markdown for Agents check, enable Cloudflare's built-in toggle:
1. In the Cloudflare Dashboard, navigate to your zone (`solverspro.com`).
2. Go to **Rules** > **Managed Transforms** (or search for "Markdown for Agents").
3. Toggle **Markdown for Agents** to **On**.

This automatically handles `Accept: text/markdown` content negotiation at the edge — no code changes required. The `functions/_middleware.ts` file in the repo serves as a fallback for non-Cloudflare deployments.
