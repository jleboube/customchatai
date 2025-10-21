# Dockerfile Build Error Fix

## Problem

When running `docker compose up --build -d` on the remote VM, the build failed with:

```
Error: Could not find Prisma Schema that is required for this command.
Checked following paths:
  schema.prisma: file not found
  prisma/schema.prisma: file not found
```

## Root Cause

The `package.json` has a `postinstall` script that runs `prisma generate`:

```json
{
  "scripts": {
    "postinstall": "prisma generate"
  }
}
```

The original Dockerfile order was:
1. `COPY package*.json ./` - Copy package files
2. `RUN npm ci` - Install deps (triggers postinstall → prisma generate)
3. `COPY . .` - Copy source code (including prisma/)

**Problem:** `prisma generate` runs during step 2, but the `prisma/schema.prisma` file isn't copied until step 3!

## Solution

Copy the prisma directory BEFORE running npm ci:

### Before (Broken)

```dockerfile
COPY package*.json ./
RUN npm ci                    # ❌ postinstall fails - no schema yet!
COPY . .                      # Schema copied too late
RUN npx prisma generate       # Redundant
```

### After (Fixed)

```dockerfile
COPY package*.json ./
COPY prisma ./prisma          # ✅ Copy schema first
RUN npm ci                    # ✅ postinstall succeeds - schema exists!
COPY . .                      # Copy rest of source
```

## Changes Made

**File:** `Dockerfile` (lines 6-14)

```diff
- # Install dependencies
  COPY package*.json ./
+ COPY prisma ./prisma
- RUN npm ci

- # Copy source code
+ # Install dependencies (postinstall will run prisma generate)
+ RUN npm ci
+
+ # Copy source code
  COPY . .

- # Generate Prisma client
- RUN npx prisma generate
-
  # Build the Next.js application
  RUN npm run build
```

## Why This Works

1. **package*.json** copied first (needed by npm ci)
2. **prisma/** directory copied second (needed by postinstall)
3. **npm ci** runs → triggers postinstall → `prisma generate` succeeds ✅
4. Rest of source code copied
5. Next.js build runs

## Benefits

- ✅ Fixes build error on remote VM
- ✅ Eliminates redundant `prisma generate` command
- ✅ Cleaner build process
- ✅ Follows Docker best practices (copy only what's needed for each step)

## Testing

To verify the fix works:

```bash
# Clean rebuild
docker compose down -v
docker compose build --no-cache
docker compose up -d

# Check build logs
docker compose logs app
```

Expected output:
```
✓ Prisma schema loaded from prisma/schema.prisma
✓ Generated Prisma Client
✓ Next.js build completed
```

## Status

✅ **Fixed** - Dockerfile updated and ready for deployment

The fix has been applied to the local codebase. On the remote VM, run:

```bash
# Get latest code
git pull

# Rebuild with fix
docker compose up --build -d
```
