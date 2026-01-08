/**
 * COURSE PRICING ISSUE - DIAGNOSTIC & FIX
 * 
 * Problem: Course shows "This course is free. Payment is not required."
 * When clicking Purchase Course button, even though it's a paid course.
 * 
 * Root Cause: Course data in database has tier="FREE" or price=0
 */

// ============================================================
// STEP 1: DIAGNOSE THE ISSUE
// ============================================================

// Run this in MongoDB shell or MongoDB Compass to check your course:

// Replace 'YOUR_COURSE_ID' with the actual course ID having the issue
db.courses.findOne(
    { _id: ObjectId("YOUR_COURSE_ID") },
    { title: 1, tier: 1, price: 1, hotmartProductId: 1 }
);

// Expected output for PAID course:
{
    "_id": ObjectId("..."),
        "title": "Your Course Name",
            "tier": "PREMIUM",        // ⚠️ Must be "PREMIUM" not "FREE"
                "price": 99.99,           // ⚠️ Must be > 0
                    "hotmartProductId": "..." // ⚠️ Should have Hotmart product ID
}

// If you see tier="FREE" or price=0, that's the problem!

// ============================================================
// STEP 2: CHECK ALL COURSES
// ============================================================

// Find all courses and their pricing:
db.courses.find(
    {},
    { title: 1, tier: 1, price: 1, hotmartProductId: 1 }
).pretty();

// ============================================================
// STEP 3: FIX INDIVIDUAL COURSE
// ============================================================

// Option A: Fix by Course ID
db.courses.updateOne(
    { _id: ObjectId("YOUR_COURSE_ID") },
    {
        $set: {
            tier: "PREMIUM",
            price: 99.99,  // Set your actual price
            hotmartProductId: "YOUR_HOTMART_PRODUCT_ID" // Add Hotmart product ID
        }
    }
);

// Option B: Fix by Course Title
db.courses.updateOne(
    { title: "Your Course Name Here" },
    {
        $set: {
            tier: "PREMIUM",
            price: 99.99,
            hotmartProductId: "YOUR_HOTMART_PRODUCT_ID"
        }
    }
);

// ============================================================
// STEP 4: FIX MULTIPLE COURSES AT ONCE
// ============================================================

// Fix all courses with a specific pattern:
db.courses.updateMany(
    {
        // Criteria: courses that should be premium
        title: { $regex: /Premium|Advanced|Pro/i }
    },
    {
        $set: {
            tier: "PREMIUM",
            price: 99.99  // Set default price
        }
    }
);

// ============================================================
// STEP 5: BACKEND VALIDATION IMPROVEMENT
// ============================================================

/**
 * The backend logic at payment.js:37 is correct:
 * if (course.tier === "FREE" || course.price <= 0) {
 *   return "This course is free. Payment is not required."
 * }
 * 
 * This is working as intended - the issue is the course data!
 */

// ============================================================
// STEP 6: VERIFY THE FIX
// ============================================================

// After updating, verify the course:
db.courses.findOne(
    { _id: ObjectId("YOUR_COURSE_ID") },
    { title: 1, tier: 1, price: 1, hotmartProductId: 1 }
);

// Should now show:
{
    "tier": "PREMIUM",  // ✅
        "price": 99.99,     // ✅
            "hotmartProductId": "..." // ✅
}

// ============================================================
// STEP 7: TEST PURCHASE FLOW
// ============================================================

/**
 * After fixing the database:
 * 1. Reload the academy page
 * 2. Click on the course
 * 3. Click "Purchase Course" button
 * 4. Expected: Redirect to Hotmart checkout
 * 5. Should NOT see: "This course is free. Payment is not required."
 */

// ============================================================
// COMMON ISSUES & SOLUTIONS
// ============================================================

// Issue 1: Course created without tier/price
// Solution: Update course with tier="PREMIUM" and price > 0

// Issue 2: Course updated but tier not changed
// Solution: When updating course, ensure tier and price are set

// Issue 3: Multiple courses affected
// Solution: Use updateMany to fix all at once

// Issue 4: Hotmart product ID missing
// Solution: Add hotmartProductId to course document

// ============================================================
// FRONTEND ADMIN - CREATE/UPDATE COURSE
// ============================================================

/**
 * Note for Frontend Developers:
 * 
 * When creating/updating courses in the admin panel,
 * ensure the form includes:
 * 
 * - Tier dropdown: ['FREE', 'PREMIUM']
 * - Price input: Number (dollars)
 * - Hotmart Product ID: String (for premium courses)
 * 
 * The form should:
 * 1. If tier == 'PREMIUM', require price > 0
 * 2. If tier == 'PREMIUM', require hotmartProductId
 * 3. If tier == 'FREE', set price = 0
 */

// ============================================================
// QUICK FIX SCRIPT (Run in MongoDB shell)
// ============================================================

// Replace course ID and values with your actual data:
const courseId = "YOUR_COURSE_ID_HERE";
const coursePrice = 99.99;
const hotmartProductId = "YOUR_HOTMART_PRODUCT_ID";

db.courses.updateOne(
    { _id: ObjectId(courseId) },
    {
        $set: {
            tier: "PREMIUM",
            price: coursePrice,
            hotmartProductId: hotmartProductId
        }
    }
);

// Verify:
db.courses.findOne({ _id: ObjectId(courseId) });

// ============================================================
// ALTERNATIVE: USE MONGOOSE SCRIPT
// ============================================================

/**
 * Create a file: scripts/fix-course-pricing.js
 * Run with: node scripts/fix-course-pricing.js
 */

import mongoose from 'mongoose';
import Course from '../src/models/course.js';
import dotenv from 'dotenv';

dotenv.config();

async function fixCoursePricing() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // Fix specific course
        const courseId = 'YOUR_COURSE_ID_HERE';
        const result = await Course.updateOne(
            { _id: courseId },
            {
                $set: {
                    tier: 'PREMIUM',
                    price: 99.99,
                    hotmartProductId: 'YOUR_HOTMART_PRODUCT_ID'
                }
            }
        );

        console.log('Update result:', result);

        // Verify
        const course = await Course.findById(courseId);
        console.log('Updated course:', course);

        await mongoose.disconnect();
        console.log('Disconnected from MongoDB');
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

fixCoursePricing();

// ============================================================
// SUMMARY
// ============================================================

/**
 * The issue is NOT in the code - the code is working correctly!
 * 
 * The issue is in the DATABASE:
 * - Course has tier = "FREE" (should be "PREMIUM")
 * - Course has price = 0 (should be > 0)
 * 
 * Fix Steps:
 * 1. Find the problematic course in database
 * 2. Update tier to "PREMIUM"
 * 3. Update price to actual price (e.g., 99.99)
 * 4. Add hotmartProductId if missing
 * 5. Test purchase flow again
 * 
 * After fixing, the purchase flow will work correctly!
 */
