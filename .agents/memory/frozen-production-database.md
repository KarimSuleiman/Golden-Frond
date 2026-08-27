---
name: Frozen production database
description: Recovery for published apps that report a disabled database endpoint while development still works.
---

A published app can build and start successfully while its production PostgreSQL database is frozen. Development connectivity does not prove production is available.

**Why:** Production database queries fail with SQLSTATE `28000` and “The endpoint has been disabled” even when the development database is ready.

**How to apply:** Check production explicitly. If it reports that the database is frozen, use the Database tool’s production selector and choose “Unpause database”; do not change application code or the database URL first.