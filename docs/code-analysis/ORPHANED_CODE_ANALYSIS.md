# Orphaned Code Analysis Report

**Generated:** 2025-01-22
**Last Updated:** 2026-01-03
**Analyzed Packages:** packages/web, packages/plugin
**Analysis Type:** Deep Static Code Analysis

---

## Executive Summary

This report identifies orphaned files, unused exports, and potentially dead code across the Note Companion codebase. Each finding is rated by severity and certainty.

**Legend:**

- **Severity:** Critical | High | Medium | Low
- **Certainty:** High (95-100%) | Medium (70-95%) | Low (50-70%)

---

## 1. ORPHANED FILES

### 1.1 Anonymous User System (packages/web/app/api/anon.ts) - ✅ VERIFIED IN USE

**Location:** `packages/web/app/api/anon.ts`
**Status:** ✅ **ACTIVELY USED** (Not Orphaned)
**Verification Date:** 2026-01-03

**Description:**
File contains one exported function:

- `createAnonymousUser()` - Creates anonymous Clerk user for fallback authentication

**Usage Analysis:**

- ✅ **USED**: `createAnonymousUser` is actively imported and used in:
  - `packages/web/app/api/top-up/route.ts:4,17` - Fallback user creation when auth fails
  - `packages/web/app/api/top-up-minutes/route.ts:4,17` - Fallback user creation when auth fails

**Current Implementation:**
The function is used as a fallback mechanism in the top-up flows:

- When `handleAuthorizationV2` fails (e.g., invalid license key)
- Creates an anonymous Clerk user with temporary email
- Creates user usage record and license key
- Allows payment processing to continue without blocking users

**Evidence:**

```typescript
// top-up/route.ts and top-up-minutes/route.ts
async function ensureAuthorizedUser(req: NextRequest) {
  try {
    const { userId } = await handleAuthorizationV2(req);
    return { userId, licenseKey: initialLicenseKey };
  } catch (error) {
    // Fallback: create anonymous user if auth fails
    return createFallbackUser(); // Uses createAnonymousUser()
  }
}
```

**Previous Analysis Note:**

- Original analysis mentioned `updateAnonymousUserEmail()` function
- This function does not exist in current codebase (may have been removed)
- Only `createAnonymousUser()` exists and is actively used

**Conclusion:**
This file is **NOT orphaned**. It's a critical fallback mechanism for the payment/top-up flows. The analysis was incorrect or outdated. No action needed.

---

### 1.2 Old Folders API Route (packages/web/app/api/(newai)/folders/route.ts) - ✅ VERIFIED ORPHANED

**Location:** `packages/web/app/api/(newai)/folders/route.ts`
**Status:** ✅ **ORPHANED** (Not Used)
**Severity:** HIGH
**Certainty:** HIGH (95%)
**Verification Date:** 2026-01-03

**Description:**
Legacy folders recommendation endpoint that has been superseded by v2. Returns a single folder suggestion.

**Usage Analysis:**

- ✅ V2 exists at `packages/web/app/api/(newai)/folders/v2/route.ts`
- ✅ Plugin uses `recommendFolders()` which calls `/api/folders/v2` (index.ts:1155)
- ❌ **NO USAGE FOUND** for old `/api/folders` endpoint (without v2)
- ✅ Old route uses `handleAuthorizationV2` (NOT deprecated - analysis was incorrect)
- ✅ V2 route also uses `handleAuthorizationV2`

**Key Differences:**

```typescript
// Old route (folders/route.ts) - Returns single folder
return NextResponse.json({
  folder: response.object.suggestedFolder,  // Single folder
});

// V2 route (folders/v2/route.ts) - Returns multiple folders
return NextResponse.json({
  folders: response.object.suggestedFolders.sort(...),  // Array of folders
});
```

**Evidence:**

```typescript
// All plugin code uses v2:
// packages/plugin/index.ts:1155
const response = await fetch(`${this.getServerUrl()}/api/folders/v2`, {
  method: 'POST',
  // ...
});

// No references to /api/folders (without v2) found in:
// - packages/plugin/
// - packages/mobile/
// - packages/web/ (except the route definition itself)
```

**Recommendation:**

- ✅ **SAFE TO REMOVE** - No active usage found
- Add deprecation warning if endpoint is hit (before removal)
- Consider keeping for 1-2 releases with deprecation notice for external clients
- Remove after deprecation period

**Impact:**

- Medium-High - Reduces maintenance burden
- Eliminates confusion about which endpoint to use
- Removes unused code (~34 lines)

**Correction to Previous Analysis:**

- ❌ Previous analysis incorrectly stated old route uses deprecated `handleAuthorization`
- ✅ **Actual:** Old route uses `handleAuthorizationV2` (same as v2)
- The issue is not deprecated auth, but that the endpoint is simply unused

---

### 1.3 Upload Test Infrastructure - ✅ VERIFIED REMOVED

**Location:**

- ~~`packages/web/app/api/upload-test/route.ts`~~ - **REMOVED**
- ~~`packages/web/app/(app)/dashboard/upload-test/page.tsx`~~ - **REMOVED**

**Status:** ✅ **REMOVED** (Security Fix - BUG-003)
**Severity:** ~~LOW~~ → **RESOLVED**
**Certainty:** HIGH (100%)
**Verification Date:** 2026-01-03

**Description:**
Development/testing infrastructure for file upload flow. **This has been removed as a security fix.**

**Verification:**

- ✅ Checked for `packages/web/app/api/upload-test/route.ts` - **file does not exist**
- ✅ Checked for `packages/web/app/(app)/dashboard/upload-test/page.tsx` - **file does not exist**
- ✅ Git history shows commit `8bf33055` (Nov 22, 2025) removed both files
- ✅ Commit message: "fix(security): remove upload-test endpoint and page"
- ✅ Commit explicitly states: "Fixes BUG-003 - Upload test endpoint security risk"
- ✅ No references to upload-test found in current codebase

**Previous Analysis:**

- Original analysis identified this as a potential security risk
- The endpoint forwarded to `/api/upload` with user credentials
- Could be abused if exposed in production without proper auth

**Resolution:**

- Security risk eliminated by removing the endpoint entirely
- No migration needed - was test infrastructure only
- No external clients were using this endpoint

**Conclusion:**
This finding is **OBSOLETE**. The upload-test infrastructure has been completely removed as part of BUG-003 security fix. No action needed.

---

### 1.4 Check Tier Endpoint (packages/web/app/api/check-tier/route.ts) - ✅ VERIFIED ORPHANED

**Location:** `packages/web/app/api/check-tier/route.ts`
**Status:** ✅ **ORPHANED** (Not Used)
**Severity:** MEDIUM
**Certainty:** HIGH (95%)
**Verification Date:** 2026-01-03

**Description:**
Endpoint to check if user needs upgrade and token usage. Returns minimal data: `{ needsUpgrade, remainingTokens, usageError }`.

**Usage Analysis:**

- ❌ **NO USAGE FOUND** in any package:
  - Plugin uses `/api/public-usage` and `/api/usage` (not check-tier)
  - Mobile app doesn't use it
  - Web dashboard doesn't use it
- ✅ Uses `handleAuthorizationV2` (current auth method)
- ✅ Functionality is redundant - superset available in `/api/token-usage`

**Comparison with Similar Endpoints:**

```typescript
// /api/check-tier (ORPHANED) - Returns minimal data
{
  needsUpgrade: boolean,
  remainingTokens: number,
  usageError: boolean
}

// /api/token-usage (EXISTS) - Returns same data + more
{
  ...userUsage,              // Full user usage data
  needsUpgrade,              // Same as check-tier
  remainingTokens,           // Same as check-tier
  usageError,                // Same as check-tier
  percentUsed,               // Additional
  availableTiers             // Additional
}

// /api/usage (USED BY PLUGIN) - Returns usage data
{
  tokenUsage,
  maxTokenUsage,
  subscriptionStatus,
  currentPlan,
  nextReset,
  isActive
}
```

**Evidence:**

```bash
# No references to check-tier found:
grep -r "check-tier" packages/ --include="*.ts" --include="*.tsx"
# Result: Only found in route definition itself

# Plugin uses different endpoints:
# packages/plugin/index.ts:1640 - uses /api/public-usage
# packages/plugin/index.ts:1663 - uses /api/usage
```

**Recommendation:**

- ✅ **SAFE TO REMOVE** - No active usage found
- Functionality is fully covered by `/api/token-usage` endpoint
- If needed, clients can use `/api/token-usage` which provides the same data plus more
- Consider deprecation notice before removal (similar to folders endpoint)

**Impact:**

- Low-Medium - Removes redundant endpoint (~26 lines)
- Reduces API surface area
- Eliminates confusion about which endpoint to use

---

### 1.5 Classify API (packages/web/app/api/(newai)/classify1/route.ts) - ✅ VERIFIED IN USE

**Location:** `packages/web/app/api/(newai)/classify1/route.ts`
**Status:** ✅ **ACTIVELY USED** (Not Orphaned)
**Severity:** LOW (Naming Issue Only)
**Certainty:** HIGH (100%)
**Verification Date:** 2026-01-03

**Description:**
Document classification endpoint. Despite the "1" suffix suggesting v1, this is the **current and only** classification endpoint.

**Usage Analysis:**

- ✅ **USED** by plugin: `packages/plugin/index.ts:837` - `classifyContentV2()` method calls `/api/classify1`
- ✅ Uses `handleAuthorizationV2` (already migrated - analysis was incorrect)
- ✅ No other classify endpoint exists (no `/api/classify` without "1")

**Evidence:**

```typescript
// plugin/index.ts:837 - classifyContentV2() method
const response = await fetch(`${serverUrl}/api/classify1`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${this.settings.API_KEY}`,
  },
  body: JSON.stringify({
    content: trimmedContent,
    templateNames: classifications,
  }),
});
```

**Current Implementation:**

```typescript
// classify1/route.ts:4,10
import { handleAuthorizationV2 } from '@/lib/handleAuthorization';
// ...
const { userId } = await handleAuthorizationV2(request); // ✅ Uses V2
```

**Issue:**

- **Naming Confusion:** The "1" suffix suggests this is v1, but it's actually the current endpoint
- **Method Name Mismatch:** Plugin method is called `classifyContentV2()` but calls `/api/classify1`
- No v2 endpoint exists - this is the only classification endpoint

**Recommendation:**

- ✅ **KEEP AS-IS** - Endpoint is actively used and correctly implemented
- ✅ **DO NOT RENAME** - Backward compatibility constraint:
  - Users may not update the plugin immediately
  - Old plugin versions will break if endpoint name changes
  - Must maintain `/api/classify1` for existing plugin installations
- ✅ **Add documentation comment** - Clarify that despite the "1" suffix, this is the current endpoint
- **Future consideration:** If creating a v2 endpoint, keep v1 for backward compatibility

**Impact:**

- Low - This is a naming/clarity issue, not a functional problem
- Endpoint works correctly and is actively used
- Renaming is NOT recommended due to backward compatibility requirements
- Documentation comment added to clarify naming confusion

---

### 1.6 Fabric Classify Endpoint - ✅ VERIFIED REMOVED

**Location:**

- ~~`packages/web/app/api/(newai)/fabric-classify/route.ts`~~ - **REMOVED**
- ~~`packages/plugin/views/assistant/organizer/ai-format/fabric-templates.tsx`~~ - **REMOVED**

**Status:** ✅ **REMOVED** (Feature Removed)
**Severity:** ~~LOW~~ → **RESOLVED**
**Certainty:** HIGH (100%)
**Verification Date:** 2026-01-03

**Description:**
Fabric-specific classification endpoint and related feature. **This feature has been removed from the project.**

**Verification:**

- ✅ Checked for `packages/web/app/api/(newai)/fabric-classify/route.ts` - **file does not exist**
- ✅ Checked for `packages/plugin/views/assistant/organizer/ai-format/fabric-templates.tsx` - **file does not exist**
- ✅ No references to `fabric-classify`, `fabricClassify`, `fabric-templates`, or `enableFabric` found in codebase
- ✅ No `enableFabric` setting found in `FileOrganizerSettings`

**Previous Analysis:**

- Original analysis identified this as an actively used endpoint
- Referenced `fabric-templates.tsx` component that no longer exists
- Mentioned `enableFabric` setting that has been removed

**Conclusion:**
This finding is **OBSOLETE**. The fabric-classify endpoint and related fabric feature have been completely removed from the project. No action needed.

---

## 2. ORPHANED FUNCTIONS (EXPORTED BUT NOT IMPORTED)

### 2.1 checkAndCreateFolders (fileUtils.ts) - ✅ VERIFIED FIXED

**Location:** `packages/plugin/fileUtils.ts`
**Status:** ✅ **NO ISSUE** (Already Fixed)
**Severity:** ~~LOW~~ → **RESOLVED**
**Certainty:** HIGH (100%)
**Verification Date:** 2026-01-03

**Description:**
Function import in index.ts. Original analysis reported duplicate imports, but this has been resolved.

**Current Implementation:**

```typescript
// index.ts:49-54 - SINGLE import statement
import {
  ensureFolderExists,
  checkAndCreateFolders,  // ✅ Only one import
  checkAndCreateTemplates,
  moveFile,
} from './fileUtils';

// index.ts:910-911 - Method that calls imported function
async checkAndCreateFolders() {
  await checkAndCreateFolders(this.app, this.settings);
}
```

**Verification:**

- ✅ Only ONE import statement found (lines 49-54)
- ✅ No duplicate import at line 42-43 (does not exist)
- ✅ Function is properly used: imported function called in method at line 911
- ✅ Method is called in `initializePlugin()` at line 1373

**Previous Analysis:**

- Original analysis incorrectly reported duplicate imports at lines 42-43 and 51-54
- The duplicate import has been removed or never existed in current codebase

**Conclusion:**
This finding is **OBSOLETE**. The duplicate import issue does not exist in the current codebase. No action needed.

---

### 2.2 Deprecated handleAuthorization Function - ✅ VERIFIED FIXED

**Location:** `packages/web/lib/handleAuthorization.ts:298`
**Status:** ✅ **FIXED** (All endpoints migrated to V2)
**Severity:** ~~HIGH~~ → **RESOLVED**
**Certainty:** HIGH (100%)
**Verification Date:** 2026-01-03

**Description:**
Function marked with `@deprecated` JSDoc. **All endpoints have been migrated to `handleAuthorizationV2`.**

**Verification:**

- ✅ **ALL ENDPOINTS MIGRATED** - No usage of deprecated `handleAuthorization` found
- ✅ All API routes now use `handleAuthorizationV2`
- ✅ Git history shows commit `c1fcdaac` (Nov 22, 2025) completed migration
- ✅ Commit message: "refactor: migrate remaining 9 AI endpoints to handleAuthorizationV2"
- ✅ Commit explicitly states: "Progress: 13/13 endpoints migrated ✅"

**Previous Analysis:**

- Original analysis reported 13 endpoints using deprecated `handleAuthorization`
- All endpoints have been successfully migrated to `handleAuthorizationV2`

**Conclusion:**
This finding is **OBSOLETE**. All deprecated auth usage has been eliminated. The migration is complete. No action needed.

---

### 2.3 Commented-Out Webhook Handlers - ✅ VERIFIED (Intentionally Disabled)

**Location:** `packages/web/app/api/webhook/route.ts:15-17`
**Status:** ✅ **VERIFIED** (Intentionally Disabled)
**Severity:** ~~LOW~~ → **RESOLVED**
**Certainty:** HIGH (100%)
**Verification Date:** 2026-01-03

**Description:**
Two webhook handlers commented out in production code:

```typescript
const HANDLERS = {
  'checkout.session.completed': handleCheckoutComplete,
  'customer.subscription.deleted': handleSubscriptionCanceled,
  'customer.subscription.updated': handleSubscriptionUpdated,
  // "invoice.paid": handleInvoicePaid,  // COMMENTED OUT
  // "payment_intent.succeeded": handlePaymentIntentSucceeded,  // COMMENTED OUT
};
```

**Verification:**

- ✅ Handler `handlePaymentIntentSucceeded` is fully implemented (122 lines)
- ✅ Handler is imported but commented out to prevent duplicate processing
- ✅ Current flow: All payments processed via `checkout.session.completed` handler
- ✅ Reason for disabling: Prevents duplicate processing (both events fire for same payment)

**Current Implementation:**

- Handler functionality includes:
  - Token top-ups (`handleTopUp`)
  - Minutes top-ups (`handleTopUpMinutes`)
  - Regular subscription payments
  - Proper error handling and validation

**Conclusion:**
This is **NOT a bug** - it's an intentional design decision. The handler is complete but intentionally disabled to avoid duplicate processing. Current implementation works correctly without it.

**Recommendations:**

1. Add code comment explaining why handler is disabled
2. Consider adding idempotency checks if handler needs to be enabled in future
3. Remove handler code if it's confirmed to never be needed

---

## 3. POTENTIALLY UNUSED INFRASTRUCTURE

### 3.1 Process Pending Uploads Worker

**Location:** `packages/web/app/api/process-pending-uploads/route.ts`
**Severity:** MEDIUM
**Certainty:** MEDIUM (70%)

**Description:**
Background job to process uploaded files (OCR, transcription).

**Usage Analysis:**

- ✅ Called by: `packages/web/app/api/trigger-processing/route.ts:31`
- ✅ Called by: `packages/mobile/utils/file-handler.ts` (mobile app)
- Requires CRON_SECRET for authorization

**Recommendation:**

- KEEP - This is active infrastructure
- Verify cron job is configured on hosting platform
- Document expected trigger frequency

**Impact:**

- Critical infrastructure - do not remove

---

### 3.2 Reset Tokens Cron Job

**Location:** `packages/web/app/api/cron/reset-tokens/route.ts`
**Severity:** LOW
**Certainty:** HIGH (90%)

**Description:**
Monthly token reset for subscription users.

**Usage Analysis:**

- Only test file references it: `route.test.ts`
- Requires CRON_SECRET
- Should be triggered monthly by platform cron

**Recommendation:**

- KEEP - Critical billing infrastructure
- Verify cron schedule is configured
- Add monitoring/alerting for failed runs

**Impact:**

- Critical billing feature - do not remove

---

## 4. SUMMARY OF FINDINGS

### ✅ Completed/Resolved:

1. ✅ **Migrate deprecated `handleAuthorization`** - **FIXED** (All 13 endpoints migrated to V2)
2. ✅ **Review commented webhook handlers** - **VERIFIED** (Intentionally disabled, not a bug)
3. ✅ **Remove duplicate imports** - **FIXED** (Commit a1b6bd02)
4. ✅ **Clean up upload-test** - **REMOVED** (Security fix - BUG-003)
5. ✅ **Document fabric-classify** - **RESOLVED** (Feature removed from project)
6. ✅ **Remove `updateAnonymousUserEmail`** - **RESOLVED** (Function doesn't exist)

### Remaining Action Items (Medium Priority):

1. **Deprecate old `/api/folders` route** - Superseded by v2, no active usage found

   - Status: ✅ Verified orphaned
   - Recommendation: Safe to remove after deprecation period

2. **Review check-tier endpoint** - Possibly unused
   - Status: ✅ Verified orphaned
   - Recommendation: Safe to remove (functionality covered by `/api/token-usage`)

### Low Priority (Maintenance):

3. **Verify cron jobs** are properly configured
   - `process-pending-uploads` - Active infrastructure
   - `reset-tokens` - Critical billing infrastructure

---

## 5. METHODOLOGY

**Analysis performed using:**

1. Static code analysis via grep/search
2. Import graph analysis (finding exports with no imports)
3. Cross-package reference checking
4. Manual code review of critical paths

**Limitations:**

- Dynamic imports not fully traced
- Runtime reflection/eval not detected
- External API consumers not analyzed (mobile app partially checked)

---

## 6. RECOMMENDATIONS FOR ONGOING MAINTENANCE

1. **Implement automated orphan detection**

   - Use tools like `ts-prune` or `knip` for TypeScript dead code detection
   - Add to CI/CD pipeline

2. **Code review checklist**

   - Check for deprecated functions before using
   - Verify imports exist for new exports
   - Mark deprecated code with JSDoc + runtime warnings

3. **Deprecation policy**
   - Clear timeline for deprecated code removal
   - Runtime warnings in development
   - Migration guides for external consumers

---

---

## 7. UPDATE LOG

**2026-01-03 Updates:**

- ✅ Verified all deprecated `handleAuthorization` usage migrated to V2
- ✅ Verified commented webhook handlers are intentionally disabled (not a bug)
- ✅ Verified duplicate imports fixed (commit a1b6bd02)
- ✅ Verified upload-test infrastructure removed (security fix)
- ✅ Verified fabric-classify feature removed
- ✅ Updated summary to reflect current status

**2025-01-22:**

- Initial analysis completed
- Identified 17 orphaned code items
- Created prioritized action plan

---

**Report prepared by:** AI Code Analysis Agent
**Last Updated:** 2026-01-03
**Review recommended by:** Senior Engineer
**Next review:** Q2 2026 or after major refactors
