# Refactoring Plan: Plan-Based Hotmart Integration

## Overview
This document outlines the refactoring to move from direct `hotmartProductId` in courses to a centralized **Plan** model that stores all Hotmart product details.

## Benefits
1. ✅ Centralized Hotmart product management
2. ✅ Store checkout code, product details, and price in one place
3. ✅ Easier to update checkout codes (update plan, not all courses)
4. ✅ Better separation of concerns
5. ✅ Reusable plans across multiple courses

---

## Phase 1: Create Plan Model & Admin APIs

### 1.1 Create Plan Model
**File**: `CryptoBuzz-be/src/models/plan.js`

```javascript
{
  name: String,              // Plan name (e.g., "Premium Course Plan")
  description: String,       // Plan description
  price: Number,            // Plan price (required since Hotmart API doesn't return it)
  
  // Hotmart Integration
  hotmartProductId: String, // Hotmart product ID (numeric or alphanumeric)
  hotmartCheckoutCode: String, // Hotmart checkout code (e.g., "J103673988Y")
  hotmartCheckoutUrl: String,  // Full checkout URL
  hotmartProductDetails: {
    // Store all available product details from Hotmart API
    id: String,
    name: String,
    description: String,
    // ... other fields from Hotmart API response
  },
  
  // Status & Metadata
  status: { type: String, enum: ["active", "inactive"], default: "active" },
  createdBy: ObjectId (ref: "user"),
  isDeleted: Boolean,
  deletedAt: Date,
  timestamps: true
}
```

### 1.2 Create Plan Controller
**File**: `CryptoBuzz-be/src/controllers/admin/plan.js`

**Endpoints**:
- `GET /api/v1/admin/plans` - List all plans
- `GET /api/v1/admin/plans/:id` - Get plan details
- `POST /api/v1/admin/plans` - Create plan
  - Fetch Hotmart products
  - Allow selecting product
  - Allow manual checkout code input
  - Store price (required)
- `PUT /api/v1/admin/plans/:id` - Update plan
- `DELETE /api/v1/admin/plans/:id` - Soft delete plan

### 1.3 Create Plan Routes
**File**: `CryptoBuzz-be/src/routes/v1/admin/plan.routes.js`

---

## Phase 2: Update Course Model

### 2.1 Update Course Schema
**File**: `CryptoBuzz-be/src/models/course.js`

**Changes**:
- ❌ Remove: `hotmartProductId: String`
- ✅ Add: `plan: { type: ObjectId, ref: "Plan" }`

**Migration Strategy**:
- Keep `hotmartProductId` temporarily for backward compatibility
- Add `plan` field
- Migration script to create plans from existing courses or link to default plan

### 2.2 Update Course Validation Schema
**File**: `CryptoBuzz-be/src/controllers/common/course.js`

**Changes**:
- ❌ Remove: `hotmartProductId: yup.string().nullable().optional()`
- ✅ Add: `plan: yup.string().matches(/^[0-9a-fA-F]{24}$/).nullable().optional()`

---

## Phase 3: Update Payment Flow

### 3.1 Update createPaymentLink
**File**: `CryptoBuzz-be/src/controllers/common/payment.js`

**Current Logic**:
```javascript
const hotmartProductId = course.hotmartProductId || process.env.HOTMART_DEFAULT_PRODUCT_ID;
```

**New Logic**:
```javascript
// Get plan from course
const plan = await Plan.findById(course.plan).populate('plan');
const hotmartCheckoutCode = plan?.hotmartCheckoutCode || null;

if (!hotmartCheckoutCode) {
  return res.status(400).json({
    message: "Checkout code not configured for this course's plan."
  });
}

const checkoutUrl = `${HOTMART_CHECKOUT_BASE_URL}/${hotmartCheckoutCode}`;
```

### 3.2 Update Webhook Handler
**File**: `CryptoBuzz-be/src/controllers/common/payment.js`

**Current Logic**:
```javascript
const course = await Course.findOne({ hotmartProductId });
```

**New Logic**:
```javascript
// Find plan by hotmartProductId or hotmartCheckoutCode
const plan = await Plan.findOne({ 
  $or: [
    { hotmartProductId: hotmartProductId },
    { hotmartCheckoutCode: hotmartProductId }
  ]
});

if (!plan) {
  console.error(`Plan not found for Hotmart product ID: ${hotmartProductId}`);
  return;
}

// Find courses using this plan
const courses = await Course.find({ plan: plan._id });
// Process purchases for all courses using this plan
```

**Note**: Webhook might receive either product ID or checkout code, so search both fields.

---

## Phase 4: Update Frontend Course Forms

### 4.1 Update Admin Course Form
**File**: `CryptoBuzz-admin/src/pages/admin/courses/pages/Settings/components/forms/CourseForm.jsx`

**Changes**:
- ❌ Remove: `useGetHotmartProductsQuery`
- ❌ Remove: `hotmartProductId` field
- ✅ Add: `useGetPlansQuery` hook
- ✅ Add: `plan` field (dropdown/select)

**Schema Update**:
```javascript
plan: z.string().optional(),
// Validation: If tier === "PREMIUM", plan is required
```

### 4.2 Update Educator Course Form
**File**: `CryptBuzz-edu/src/pages/educator/courses/pages/Settings/components/forms/CourseForm.jsx`

**Same changes as admin form**

### 4.3 Create Plan API Slices
**Files**:
- `CryptoBuzz-admin/src/store/api/admin/adminPlanApiSlice.js`
- `CryptBuzz-edu/src/store/api/educator/educatorPlanApiSlice.js`

**Queries**:
- `useGetPlansQuery()` - List all active plans

---

## Phase 5: Create Admin Plan Management UI

### 5.1 Plan List Page
**File**: `CryptoBuzz-admin/src/pages/admin/plans/PlanList.jsx`

**Features**:
- List all plans
- Create new plan button
- Edit/Delete actions

### 5.2 Plan Form Component
**File**: `CryptoBuzz-admin/src/pages/admin/plans/components/PlanForm.jsx`

**Features**:
- Fetch Hotmart products (`useGetHotmartProductsQuery`)
- Select product from dropdown
- Input field for checkout code (auto-populated or manual)
- Input field for price (required)
- Store full product details

### 5.3 Plan API Integration
**File**: `CryptoBuzz-admin/src/store/api/admin/adminPlanApiSlice.js`

---

## Phase 6: Clean Up & Remove Old Code

### 6.1 Remove Old Endpoints
**File**: `CryptoBuzz-be/src/controllers/common/payment.js`

- ❌ Remove: `updateCourseCheckoutCode` function (lines 565-619)

**File**: `CryptoBuzz-be/src/routes/v1/common/payment.routes.js`

- ❌ Remove: `router.post("/update-checkout-code", ...)`

### 6.2 Remove Old Validations
**File**: `CryptoBuzz-be/src/controllers/common/payment.js`

- ❌ Remove: Numeric product ID validation (lines 39-51)
- Update to check if plan exists and has checkout code

### 6.3 Remove Old Frontend Code
**Files**:
- ❌ Remove: `useGetHotmartProductsQuery` from course forms
- ❌ Remove: `hotmartProductId` field from course forms
- ❌ Remove: Hotmart product dropdown from course forms

### 6.4 Remove Hotmart Products API Usage from Course Forms
**Keep**: Hotmart products API still needed for Plan creation (admin only)

---

## Phase 7: Update Course Data Access

### 7.1 Update Course Responses
**File**: `CryptoBuzz-be/src/controllers/user/course.js`

**Current**:
```javascript
hotmartProductId: item.hotmartProductId
```

**New**:
```javascript
plan: {
  _id: plan._id,
  name: plan.name,
  price: plan.price,
  checkoutCode: plan.hotmartCheckoutCode
}
```

**Populate plan**:
```javascript
.populate('plan', 'name price hotmartCheckoutCode')
```

---

## Files to Create

1. ✅ `CryptoBuzz-be/src/models/plan.js`
2. ✅ `CryptoBuzz-be/src/controllers/admin/plan.js`
3. ✅ `CryptoBuzz-be/src/routes/v1/admin/plan.routes.js`
4. ✅ `CryptoBuzz-admin/src/pages/admin/plans/PlanList.jsx`
5. ✅ `CryptoBuzz-admin/src/pages/admin/plans/components/PlanForm.jsx`
6. ✅ `CryptoBuzz-admin/src/pages/admin/plans/components/CreatePlanModal.jsx`
7. ✅ `CryptoBuzz-admin/src/store/api/admin/adminPlanApiSlice.js`
8. ✅ `CryptBuzz-edu/src/store/api/educator/educatorPlanApiSlice.js` (if educators can see plans)

---

## Files to Modify

### Backend
1. ✅ `CryptoBuzz-be/src/models/course.js` - Add plan field
2. ✅ `CryptoBuzz-be/src/controllers/common/course.js` - Update validation
3. ✅ `CryptoBuzz-be/src/controllers/common/payment.js` - Update payment & webhook logic
4. ✅ `CryptoBuzz-be/src/controllers/user/course.js` - Populate plan in responses
5. ✅ `CryptoBuzz-be/src/routes/v1/common/payment.routes.js` - Remove update endpoint

### Frontend (Admin)
1. ✅ `CryptoBuzz-admin/src/pages/admin/courses/pages/Settings/components/forms/CourseForm.jsx`
2. ✅ `CryptoBuzz-admin/src/pages/admin/courses/pages/Settings/components/CreateCourseModal.jsx`

### Frontend (Educator)
1. ✅ `CryptBuzz-edu/src/pages/educator/courses/pages/Settings/components/forms/CourseForm.jsx`
2. ✅ `CryptBuzz-edu/src/pages/educator/courses/pages/Settings/components/CreateCourseModal.jsx`

---

## Files to Remove/Deprecate

1. ❌ `CryptoBuzz-be/src/controllers/common/payment.js` - `updateCourseCheckoutCode` function
2. ❌ Route: `POST /api/v1/common/payment/update-checkout-code`
3. ❌ Validation: Numeric product ID check in `createPaymentLink`

---

## Migration Strategy

### Step 1: Create Plan Model & APIs (Non-breaking)
- Add Plan model
- Create plan CRUD endpoints
- Courses can still use `hotmartProductId` temporarily

### Step 2: Create Default Plans
- Script to create plans from existing `hotmartProductId` values
- Link courses to plans

### Step 3: Update Payment Flow (Support Both)
- Check `course.plan` first
- Fallback to `course.hotmartProductId` for backward compatibility
- Log deprecation warnings

### Step 4: Update Frontend Forms
- Add plan dropdown
- Keep `hotmartProductId` temporarily (optional)
- Validation: If plan exists, ignore `hotmartProductId`

### Step 5: Migrate Existing Courses
- Update all courses to use plans
- Remove `hotmartProductId` from Course model
- Remove backward compatibility code

---

## Testing Checklist

- [ ] Create plan with Hotmart product
- [ ] Create course with plan
- [ ] Purchase flow works with plan
- [ ] Webhook handles purchases correctly
- [ ] Course forms show plans dropdown
- [ ] Plan management UI works
- [ ] Existing courses still work (during migration)
- [ ] Backward compatibility works

---

## Notes

1. **Price Storage**: Hotmart API doesn't return price, so we must store it manually in Plan
2. **Checkout Code**: Can be auto-extracted from Hotmart product URL or entered manually
3. **Webhook Compatibility**: Webhooks might send product ID or checkout code, so search both
4. **Migration**: Keep `hotmartProductId` during transition, remove after all courses migrated
