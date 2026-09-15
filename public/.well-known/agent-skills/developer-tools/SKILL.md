---
name: developer-tools
description: Format, validate, and convert developer data formats including JSON, XML, YAML, Base64, and JWTs using SolversPro.
version: 1.0.0
author: SolversPro Team
homepage: https://solverspro.com/developer
license: MIT
---

# Developer Tools Agent Skill

This skill allows agents to format, validate, convert, and inspect developer data structures.

## Available Utilities
1. **JSON Tools**: Format, validate, minify, and convert JSON to CSV, YAML, TypeScript, Python, and Go.
2. **XML Tools**: Format, validate, and convert XML documents.
3. **Base64 Converter**: Encode and decode standard and URL-safe Base64 strings.
4. **JWT Decoder**: Decode JWT headers, payload claims, and check token expiry without secret verification.
5. **UUID Generator**: Generate cryptographically random RFC 4122 v4 UUID identifiers.
6. **Hash Generator**: Generate SHA-256, SHA-384, and SHA-512 hashes.

## Client-Side WebMCP Integration
When executing in browser agent environments (such as Chrome with WebMCP or Puppeteer), agents can directly call browser-registered tools:
- `solverspro_json_format({ json: string, indent: number })`
- `solverspro_base64({ text: string, action: "encode" | "decode" })`
- `solverspro_solve({ prompt: string })`
