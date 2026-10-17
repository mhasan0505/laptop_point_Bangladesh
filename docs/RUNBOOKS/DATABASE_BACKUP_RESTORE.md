# Database Backup and Disaster Recovery Runbook

**Target Application**: Laptop Point Bangladesh (`laptoppointbd.com`)  
**Database Engine**: PostgreSQL on Neon / Cloud Postgres  
**ORM**: Prisma 7 with `@prisma/adapter-pg`

---

## 1. Automated Application Backup

The repository includes a dedicated, zero-dependency backup script: [`scripts/backup-db.mjs`](file:///d:/ARTYX%20DIGITAL/lp-new-version/scripts/backup-db.mjs). It exports all core operational tables (`Inventory`, `InventoryLog`, `Order`, `ProductOverride`, `AdminUser`, `AdminSession`) to a timestamped JSON snapshot with SHA-256 integrity checksums.

### Creating a Backup
```bash
# Export active database to backups/ directory
node scripts/backup-db.mjs
```

**Output**:
- `backups/db-backup-YYYY-MM-DD-THH-mm-ss.json`
- `backups/db-backup-YYYY-MM-DD-THH-mm-ss.json.sha256`

### Verifying Connection & Tables
```bash
node scripts/backup-db.mjs --verify
```

### Verifying Checksum
```bash
# On Linux / macOS:
sha256sum -c backups/db-backup-2026-10-17.json.sha256

# On Windows PowerShell:
Get-FileHash backups/db-backup-2026-10-17.json -Algorithm SHA256
```

---

## 2. Native PostgreSQL Full Dumps (`pg_dump`)

For low-level disaster recovery or full schema recreation, use native PostgreSQL utilities:

### Full Schema + Data Backup
```bash
# Dump custom compressed binary format
pg_dump "$DATABASE_URL" -F c -b -v -f "backups/lp_full_backup_$(date +%Y%m%d).dump"

# Or plain text SQL script
pg_dump "$DATABASE_URL" -F p -v -f "backups/lp_plain_backup_$(date +%Y%m%d).sql"
```

### Restoring from Native Dump
```bash
# 1. Clean restore to a new database (recommended)
pg_restore -d "$NEW_DATABASE_URL" -v "backups/lp_full_backup_YYYYMMDD.dump"

# 2. Or execute plain SQL
psql "$NEW_DATABASE_URL" < "backups/lp_plain_backup_YYYYMMDD.sql"

# 3. Synchronize Prisma client
pnpm prisma:generate
```

---

## 3. Disaster Recovery Step-by-Step Runbook

If the primary database is corrupted or accidentally deleted:

1. **Isolate Traffic**:
   Temporarily enable maintenance mode or pause traffic on Vercel to prevent in-flight orders during recovery.
2. **Provision Target Database**:
   Create a fresh database branch in Neon or new PostgreSQL instance.
3. **Configure Environment**:
   Update `DATABASE_URL` in Vercel project settings with the new connection string.
4. **Deploy Schema Migrations**:
   ```bash
   pnpm prisma:migrate:prod
   ```
5. **Restore Application Tables**:
   Use `pg_restore` for `.dump` files or use the JSON restore script to import records into the clean database.
6. **Verify System Health**:
   ```bash
   curl https://laptoppointbd.com/api/health
   ```
   Confirm `checks.database === true` and `checks.env === true`.
7. **Verify Admin Access**:
   Log in to `/admin` using owner credentials. Confirm all catalog overrides, inventory counts, and historical orders are intact.

---

## 4. Retention Policy

- **Daily Backups**: Retain last 7 daily snapshots.
- **Weekly Backups**: Retain last 4 weekly snapshots.
- **Off-Site Storage**: Store backup files in secure encrypted S3/GCS bucket or downloaded securely to the store's primary office machine.
