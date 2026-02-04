# Global Plan-Based Access - Frontend Implementation

## ✅ Implementation Complete

The frontend now supports global plan-based access across all content types (Courses, Trade Ideas, Trade Analysis, Crypto Projects, Social Feed, Live Streams).

## 📋 Changes Made

### 1. API Slice Update (`CryptoBuzz-fe/src/store/client/clientPaymentApiSlice.js`)
- ✅ Added `getPurchasedPlanIds` query endpoint
- ✅ Exports `useGetPurchasedPlanIdsQuery` hook
- ✅ Endpoint: `GET /common/payment/purchased-plans`

### 2. Access Control Hook Update (`CryptoBuzz-fe/src/hooks/use-access-control-content.js`)
- ✅ Integrated `useGetPurchasedPlanIdsQuery` to fetch user's purchased plan IDs
- ✅ Added global plan-based access checking logic
- ✅ Checks if `content.plans` array contains any purchased plan
- ✅ Works across all content types automatically

## 🔧 How to Use

### Basic Usage

```jsx
import { useAccessControlContent } from '@/hooks/use-access-control-content';

function MyContentComponent({ content }) {
  const {
    hasAccess,
    showLock,
    lockReason,
    lockMessage,
    tier,
    isLoadingPlans,
  } = useAccessControlContent(content);

  if (showLock && !hasAccess) {
    return <LockOverlay message={lockMessage} />;
  }

  return <ContentDisplay data={content} />;
}
```

### With Courses (with API access data)

```jsx
import { useAccessControlContent } from '@/hooks/use-access-control-content';
import { useCheckCourseAccessQuery } from '@/store/client/clientPaymentApiSlice';

function CourseComponent({ courseId, course }) {
  // For courses, you can optionally use API access check
  const { data: accessData } = useCheckCourseAccessQuery(courseId, {
    skip: !courseId,
  });

  const {
    hasAccess,
    showLock,
    lockReason,
    lockMessage,
  } = useAccessControlContent(course, courseId, accessData?.data);

  // Rest of component...
}
```

### With Trade Ideas / Trade Analysis / Other Content Types

```jsx
import { useAccessControlContent } from '@/hooks/use-access-control-content';

function TradeIdeaCard({ idea }) {
  // The hook automatically checks plans for global access
  const {
    hasAccess,
    showLock,
    lockReason,
    lockMessage,
    purchasedPlanIds, // Array of user's purchased plan IDs
  } = useAccessControlContent({
    tier: idea.accessType, // Trade Ideas use 'accessType' field
    plans: idea.plans, // Array of plan IDs
  });

  if (showLock && !hasAccess) {
    return <LockMessage message={lockMessage} />;
  }

  return <IdeaContent idea={idea} />;
}
```

## 🌐 Global Access Flow

1. **User purchases a plan** (from any module)
   - Webhook creates `CoursePurchase` record with `plan` reference
   - Backend stores plan purchase globally

2. **User accesses any content**
   - Frontend hook fetches purchased plan IDs via `useGetPurchasedPlanIdsQuery`
   - Hook checks if `content.plans` array contains any purchased plan
   - If match found → User gets access (global access across all modules)

3. **Example Scenarios**
   - User purchases Plan A from Courses → Gets access to all Courses, Trade Ideas, Trade Analysis, etc. with Plan A
   - User purchases Plan B from Trade Ideas → Gets access to all Courses, Trade Ideas, etc. with Plan B
   - Plan shared across modules → One purchase grants access everywhere

## 📝 Content Object Structure

Your content objects should have:

```javascript
{
  tier: "PUBLIC" | "LOGGED_IN" | "UID_ONLY" | "PRO", // Or use 'accessType' field
  plans: ["planId1", "planId2"], // Array of plan ObjectIds (strings)
  // ... other content fields
}
```

## 🎯 Return Values

The hook returns:

```javascript
{
  hasAccess: boolean,           // Whether user has access
  showLock: boolean,            // Whether to show lock overlay
  lockReason: string | null,    // "LOGIN_REQUIRED" | "UID_REQUIRED" | "PURCHASE_REQUIRED" | null
  lockMessage: string,          // User-friendly lock message
  tier: string,                 // Content tier
  isPremium: boolean,           // Whether content is premium
  isAuthenticated: boolean,     // User authentication status
  user: object,                 // Current user object
  userUid: string | null,       // User UID (if available)
  isLoadingPlans: boolean,      // Loading state for purchased plans
  purchasedPlanIds: string[],   // Array of user's purchased plan IDs
}
```

## 🔄 Migration Notes

- Existing code using `useAccessControlContent` will automatically benefit from global plan-based access
- No breaking changes - the hook is backward compatible
- For courses, continue using `accessData` parameter for most accurate access checking
- For other content types, just pass the content object with `tier`/`accessType` and `plans` array

## ✨ Benefits

1. **Global Access**: One plan purchase grants access across all modules
2. **Automatic**: No manual access checking needed - hook handles it
3. **Consistent**: Same access logic across all content types
4. **Efficient**: Plan IDs fetched once and cached
5. **Flexible**: Works with existing course access APIs and new global access
