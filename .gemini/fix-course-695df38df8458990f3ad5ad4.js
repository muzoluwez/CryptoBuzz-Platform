/**
 * DIRECT FIX FOR COURSE ID: 695df38df8458990f3ad5ad4
 * 
 * This script contains MongoDB commands to check and fix the specific course
 * that's showing "This course is free. Payment is not required." error.
 */

// ============================================================
// STEP 1: CHECK THE CURRENT COURSE DATA
// ============================================================

// Copy and paste this in MongoDB shell or Compass:
db.courses.findOne(
    { _id: ObjectId("695df38df8458990f3ad5ad4") },
    { title: 1, tier: 1, price: 1, hotmartProductId: 1, published: 1 }
);

/**
 * This will show you the current values.
 * 
 * Expected output (showing the problem):
 * {
 *   "_id": ObjectId("695df38df8458990f3ad5ad4"),
 *   "title": "Your Course Name",
 *   "tier": "FREE",           // ⚠️ This is the problem! Should be "PREMIUM"
 *   "price": 0,               // ⚠️ This is the problem! Should be > 0
 *   "hotmartProductId": null, // ⚠️ This might also be missing
 *   "published": true
 * }
 */

// ============================================================
// STEP 2: FIX THE COURSE
// ============================================================

// Copy and paste this in MongoDB shell or Compass:
db.courses.updateOne(
    { _id: ObjectId("695df38df8458990f3ad5ad4") },
    {
        $set: {
            tier: "PREMIUM",               // ✅ Set to PREMIUM
            price: 99.99,                  // ✅ Set your price (change this!)
            hotmartProductId: "YOUR_HOTMART_PRODUCT_ID"  // ✅ Add your Hotmart product ID
        }
    }
);

/**
 * ⚠️ IMPORTANT: Replace these values:
 * 
 * 1. price: 99.99
 *    → Change to your actual course price in USD
 * 
 * 2. hotmartProductId: "YOUR_HOTMART_PRODUCT_ID"
 *    → Get this from your Hotmart dashboard
 *    → It's the product ID you created in Hotmart for this course
 *    → Example: "1234567" or whatever ID Hotmart assigned
 * 
 * If you don't have a Hotmart product ID yet:
 * 1. Go to Hotmart dashboard
 * 2. Create a new product for this course
 * 3. Copy the product ID
 * 4. Use it in the query above
 */

// ============================================================
// STEP 3: VERIFY THE FIX
// ============================================================

// Copy and paste this to verify:
db.courses.findOne(
    { _id: ObjectId("695df38df8458990f3ad5ad4") },
    { title: 1, tier: 1, price: 1, hotmartProductId: 1 }
);

/**
 * Expected output after fix:
 * {
 *   "_id": ObjectId("695df38df8458990f3ad5ad4"),
 *   "title": "Your Course Name",
 *   "tier": "PREMIUM",        // ✅ Now PREMIUM
 *   "price": 99.99,           // ✅ Now has price
 *   "hotmartProductId": "..."  // ✅ Now has Hotmart ID
 * }
 */

// ============================================================
// STEP 4: TEST THE PURCHASE FLOW
// ============================================================

/**
 * After updating the database:
 * 
 * 1. Go to: http://localhost:5175/client/academy
 * 2. Select the course
 * 3. Click "Purchase Course" button
 * 4. Expected: Browser redirects to Hotmart checkout
 * 5. URL should be: https://pay.hotmart.com/YOUR_PRODUCT_ID
 * 
 * API Response should be:
 * {
 *   "statusCode": 200,
 *   "data": {
 *     "checkoutUrl": "https://pay.hotmart.com/...",
 *     "amount": 99.99,
 *     "currency": "USD"
 *   }
 * }
 * 
 * Should NOT see:
 * {
 *   "message": "This course is free. Payment is not required."
 * }
 */

// ============================================================
// ALTERNATIVE: UPDATE WITHOUT HOTMART PRODUCT ID (TEMPORARY)
// ============================================================

/**
 * If you don't have Hotmart product ID yet, you can update just tier and price:
 * 
 * Note: This will still fail at checkout because backend requires hotmartProductId
 * But it will change the error message to help you know what's missing
 */

db.courses.updateOne(
    { _id: ObjectId("695df38df8458990f3ad5ad4") },
    {
        $set: {
            tier: "PREMIUM",
            price: 99.99
        }
    }
);

// With this change, you'll get a different error:
// "Hotmart product ID not configured for this course. Please contact support."
// This confirms the tier/price are correct, just missing Hotmart setup.

// ============================================================
// QUICK REFERENCE
// ============================================================

/**
 * Course ID: 695df38df8458990f3ad5ad4
 * 
 * Current Status: ❌ tier="FREE" or price=0
 * Required Status: ✅ tier="PREMIUM" AND price>0 AND hotmartProductId set
 * 
 * Backend Check (payment.js:37):
 * if (course.tier === "FREE" || course.price <= 0) {
 *   return "This course is free. Payment is not required.";
 * }
 * 
 * This is working correctly! The issue is the data, not the code.
 */

// ============================================================
// FOR MONGODB COMPASS USERS
// ============================================================

/**
 * If using MongoDB Compass instead of shell:
 * 
 * 1. Connect to your database
 * 2. Select your database (usually named "cryptobuzz" or similar)
 * 3. Select "courses" collection
 * 4. Click "Filter" and enter:
 *    { _id: ObjectId("695df38df8458990f3ad5ad4") }
 * 
 * 5. Find the document and click "Edit" (pencil icon)
 * 6. Update these fields:
 *    - tier: Change "FREE" to "PREMIUM"
 *    - price: Change 0 to 99.99 (your price)
 *    - hotmartProductId: Add your Hotmart product ID
 * 
 * 7. Click "Update"
 */

// ============================================================
// TROUBLESHOOTING
// ============================================================

// Problem: "Course not found"
// Solution: Check the course ID is correct
db.courses.findOne({ _id: ObjectId("695df38df8458990f3ad5ad4") });

// Problem: "Still showing free course error after update"
// Solution: Verify the update was applied
db.courses.findOne(
    { _id: ObjectId("695df38df8458990f3ad5ad4") },
    { tier: 1, price: 1 }
);
// Should show: tier: "PREMIUM", price: 99.99

// Problem: "Hotmart product ID not configured"
// Solution: You updated tier/price but missing hotmartProductId
// Create product in Hotmart dashboard and add the ID

// ============================================================
// AFTER FIX - VERIFY API
// ============================================================

/**
 * Test the API directly using curl or Postman:
 * 
 * POST http://localhost:8000/api/v1/common/payment/checkout
 * Headers:
 *   Content-Type: application/json
 *   Authorization: Bearer YOUR_TOKEN
 * Body:
 *   {
 *     "courseId": "695df38df8458990f3ad5ad4"
 *   }
 * 
 * Expected Success Response:
 * {
 *   "statusCode": 200,
 *   "data": {
 *     "purchaseId": "...",
 *     "checkoutUrl": "https://pay.hotmart.com/...",
 *     "amount": 99.99,
 *     "currency": "USD"
 *   },
 *   "message": "Payment link generated successfully"
 * }
 */
