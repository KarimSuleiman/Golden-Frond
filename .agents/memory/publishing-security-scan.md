---
name: Publishing security scan
description: How to interpret publish failures where the build succeeds but the security scan disconnects.
---

When a publish build reaches layer creation successfully and then reports `Security scan skipped: connection lost`, treat it as a publishing-service/infrastructure failure rather than an application build failure.

**Why:** The application can build and start normally while the publish attempt still fails in the final security-scan stage.

**How to apply:** Verify `npm run build`, start the production command, and confirm `/` returns HTTP 200. If those pass, retry publishing rather than changing application code for this error.