---
title: SolversPro Agent Authentication & Registration
version: 1.0.0
last_updated: 2026-09-15
issuer: https://solverspro.com
docs: https://solverspro.com/docs
contact: support@solverspro.com
---

# SolversPro Agent Authentication (Auth.md)

Welcome to SolversPro. This document outlines programmatic authentication, identity discovery, and registration mechanisms for autonomous AI agents, automated tool runners, and API clients.

## Overview

- **Public Utilities & Calculators**: 100% free, client-side, and require **no authentication** or API keys.
- **AI Multi-Step Solver API (`/api/solve`)**: Publicly accessible with rate-limiting. For high-volume agent workflows or programmatic integration, pass an `Authorization` header.

## Discovery Endpoints

- **OAuth 2.0 Authorization Server**: [/.well-known/oauth-authorization-server](https://solverspro.com/.well-known/oauth-authorization-server)
- **OpenID Connect Discovery**: [/.well-known/openid-configuration](https://solverspro.com/.well-known/openid-configuration)
- **OAuth Protected Resource (RFC 9728)**: [/.well-known/oauth-protected-resource](https://solverspro.com/.well-known/oauth-protected-resource)
- **API Catalog (RFC 9727)**: [/.well-known/api-catalog](https://solverspro.com/.well-known/api-catalog)
- **MCP Server Card**: [/.well-known/mcp/server-card.json](https://solverspro.com/.well-known/mcp/server-card.json)
- **Agent Skills Discovery Index**: [/.well-known/agent-skills/index.json](https://solverspro.com/.well-known/agent-skills/index.json)

## Agent Registration & Identification

Autonomous agents should provide identifying User-Agent and Authorization headers:

```http
POST /api/solve HTTP/1.1
Host: solverspro.com
Content-Type: application/json
User-Agent: MyAutonomousAgent/1.0 (+https://myagent.example.com/bot; bot@example.com)
Authorization: Bearer <TOKEN_OR_API_KEY>

{
  "prompt": "Solve 2x^2 + 5x - 3 = 0"
}
```

### Supported Identity Types
- `agent`: Autonomous autonomous agents and AI assistants
- `service`: Machine-to-machine background daemons
- `user`: Interactive human users

### Credential Types
- `bearer`: Bearer token (JWT or API token)
- `api_key`: API key passed via `Authorization: Bearer <key>` or `x-api-key` header

### Obtaining Credentials
To register an agent or request increased rate limits:
1. Visit [SolversPro Contact](https://solverspro.com/contact) or [Documentation](https://solverspro.com/docs).
2. For open automated agent testing, free tier requests are permitted without registration subject to fair-use rate limiting (60 requests/minute per IP).

## Supported Scopes
- `read`: Read documentation, tools catalog, and status.
- `solve`: Invoke the AI problem solver stream.
- `tools:execute`: Programmatic execution of developer conversion and calculation utilities.

## Token Revocation
- **Revocation URL**: `https://solverspro.com/oauth/revoke`
- Send standard RFC 7009 token revocation POST requests.
