# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |

## Reporting a Vulnerability

We take the security of the **Global Data Security Observatory** seriously. As an application assessing global privacy and security frameworks, our architecture adheres to strict **Privacy by Design (PbD)** principles:

- **Zero Tracking**: No tracking cookies, third-party analytics, or telemetry scripts.
- **Client-Side Sandbox**: All user-added dynamic inputs are isolated to private browser `localStorage` and never transmitted to external servers.
- **Defensive Sanitization**: All scraped content and user inputs are strictly sanitized against Cross-Site Scripting (XSS), script injection, and URL spoofing.
- **Strict Content Security Policy (CSP)**: Disallowing unauthorized remote scripts, object embeds, and framing.

If you discover a security vulnerability or potential threat in this codebase:

1. **Do not** create a public GitHub issue.
2. Please open a private Security Advisory on GitHub or contact the maintainers directly.
3. Include details of the potential vulnerability, steps to reproduce, and impact assessment.

We will acknowledge receipt within 48 hours and work with you on a swift, coordinated disclosure.

