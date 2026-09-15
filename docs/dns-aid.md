# DNS for AI Discovery (DNS-AID) Setup Guide

This guide documents the DNS-AID records and DNSSEC configuration for `solverspro.com`, adhering to [draft-mozleywilliams-dnsop-dnsaid](https://datatracker.ietf.org/doc/draft-mozleywilliams-dnsop-dnsaid/) and [RFC 9460](https://www.rfc-editor.org/rfc/rfc9460) (SVCB and HTTPS DNS Resource Records).

---

## 1. What is DNS-AID?

DNS-AID allows autonomous AI agents and resolver clients to discover AI capabilities, entrypoints, and authentication endpoints directly through standard DNS queries before initiating HTTP requests.

Records are published under the `_agents` subdomain using ServiceMode `HTTPS` or `SVCB` records.

---

## 2. Recommended DNS Records (Cloudflare DNS / BIND Zone)

Add the following records to your DNS provider (e.g. Cloudflare DNS):

### A. Index Discovery Record (`_index._agents.solverspro.com`)
Points resolvers directly to your AI catalog manifest.

```bind
_index._agents.solverspro.com. 3600 IN HTTPS 1 solverspro.com. (
    alpn="h2,h3"
    port="443"
    key65353="/.well-known/ai-catalog.json"
)
```

### B. Agent-to-Agent / MCP Discovery Record (`_a2a._agents.solverspro.com`)
Points resolvers directly to your MCP server card or agent skills catalog.

```bind
_a2a._agents.solverspro.com. 3600 IN HTTPS 1 solverspro.com. (
    alpn="h2,h3"
    port="443"
    key65353="/.well-known/mcp/server-card.json"
)
```

### C. Fallback TXT Records (For Resolvers without SVCB/HTTPS support)
```bind
_agents.solverspro.com. 3600 IN TXT "v=dnsaid1; ai-catalog=https://solverspro.com/.well-known/ai-catalog.json; mcp=https://solverspro.com/.well-known/mcp/server-card.json; skills=https://solverspro.com/.well-known/agent-skills/index.json"
```

---

## 3. Cloudflare DNS Dashboard Setup Instructions

1. Open the [Cloudflare Dashboard](https://dash.cloudflare.com/) and navigate to your `solverspro.com` domain.
2. Click **DNS** > **Records**.
3. Click **Add record**:
   - **Type**: `HTTPS`
   - **Name**: `_index._agents`
   - **Priority**: `1`
   - **Target**: `solverspro.com`
   - **Value**: `alpn="h2,h3" port="443" key65353="/.well-known/ai-catalog.json"`
   - **TTL**: `Auto`
4. Add another record:
   - **Type**: `HTTPS`
   - **Name**: `_a2a._agents`
   - **Priority**: `1`
   - **Target**: `solverspro.com`
   - **Value**: `alpn="h2,h3" port="443" key65353="/.well-known/mcp/server-card.json"`
   - **TTL**: `Auto`
5. Add fallback TXT record:
   - **Type**: `TXT`
   - **Name**: `_agents`
   - **Content**: `v=dnsaid1; ai-catalog=https://solverspro.com/.well-known/ai-catalog.json; mcp=https://solverspro.com/.well-known/mcp/server-card.json`

---

## 4. Enabling DNSSEC

To ensure validating resolvers return authenticated cryptographic data:
1. In the Cloudflare Dashboard, go to **DNS** > **Settings**.
2. Scroll to **DNSSEC** and click **Enable DNSSEC**.
3. Copy the DS record details (Key Tag, Algorithm, Digest Type, Digest) into your domain registrar's DNSSEC control panel.
4. Verify validation using:
   ```bash
   dig +dnssec _index._agents.solverspro.com HTTPS
   ```
