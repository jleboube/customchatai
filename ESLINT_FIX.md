# ESLint Build Error Fix

## Problem

The Next.js build failed with an ESLint error:

```
./app/dashboard/keys/page.tsx
161:73  Error: `'` can be escaped with `&apos;`, `&lsquo;`, `&#39;`, `&rsquo;`.  react/no-unescaped-entities
```

## Root Cause

Next.js ESLint enforces the `react/no-unescaped-entities` rule, which requires apostrophes and quotes in JSX to be escaped to prevent rendering issues.

The offending line was:
```tsx
Your API key has been created. Copy it now - you won't be able to see it again!
```

The apostrophe in "won't" was not properly escaped.

## Solution

Replaced the apostrophe with its HTML entity:

### Before (Broken)
```tsx
<p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
  Your API key has been created. Copy it now - you won't be
  able to see it again!
</p>
```

### After (Fixed)
```tsx
<p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
  Your API key has been created. Copy it now - you won&apos;t be
  able to see it again!
</p>
```

## Common HTML Entities for Text

When writing JSX content, use these HTML entities:

| Character | Entity | Use Case |
|-----------|--------|----------|
| `'` | `&apos;` | Apostrophe (don't, won't, can't) |
| `"` | `&quot;` | Double quotes |
| `<` | `&lt;` | Less than |
| `>` | `&gt;` | Greater than |
| `&` | `&amp;` | Ampersand |

## Verification

Checked all other files for similar issues:
```bash
grep -rn "won't\|don't\|can't" app/ components/ --include="*.tsx"
```

Result: No other instances found ✅

## Status

✅ **Fixed** - ESLint error resolved

The build should now succeed. The application is ready for deployment.

## Note

This is a standard Next.js ESLint requirement. In the future, when writing JSX content:
- Use HTML entities for special characters in text
- Or use curly braces with template strings: `{"You won't see it"}`
- Or disable the rule in `.eslintrc.json` (not recommended)
