/**
 * QUICK FIX GUIDE - Course Purchase Error
 * Course ID: 695df38df8458990f3ad5ad4
 */

// ============================================================
// COPY-PASTE MONGODB COMMANDS (Choose one method)
// ============================================================

// METHOD 1: MongoDB Shell (mongosh)
// ------------------------------------------------------------
// Run this command to connect:
mongosh "YOUR_MONGODB_CONNECTION_STRING"

// Then paste:
use cryptobuzz  // or your database name

// Check the course:
db.courses.findOne(
    { _id: ObjectId("695df38df8458990f3ad5ad4") },
    { title: 1, tier: 1, price: 1, hotmartProductId: 1 }
)

// Fix the course (UPDATE THE VALUES!):
db.courses.updateOne(
    { _id: ObjectId("695df38df8458990f3ad5ad4") },
    {
        $set: {
            tier: "PREMIUM",
            price: 99.99,  // ← CHANGE THIS to your actual price!
            hotmartProductId: "YOUR_HOTMART_PRODUCT_ID"  // ← ADD YOUR HOTMART PRODUCT ID!
        }
    }
)

// Verify:
db.courses.findOne(
    { _id: ObjectId("695df38df8458990f3ad5ad4") },
    { title: 1, tier: 1, price: 1, hotmartProductId: 1 }
)


// METHOD 2: MongoDB Compass (GUI)
// ------------------------------------------------------------
/**
 * 1. Open MongoDB Compass
 * 2. Connect to your database
 * 3. Go to "courses" collection
 * 4. Click "Filter" button
 * 5. Enter filter:
 *    { "_id": { "$oid": "695df38df8458990f3ad5ad4" } }
 * 6. Press "Find"
 * 7. Click the pencil icon to edit
 * 8. Update:
 *    - tier: "PREMIUM"
 *    - price: 99.99 (your price)
 *    - hotmartProductId: "your_hotmart_id"
 * 9. Click "Update"
 */


// ============================================================
// WHAT TO EXPECT
// ============================================================

// BEFORE FIX (Current Status):
{
    "_id": ObjectId("695df38df8458990f3ad5ad4"),
        "title": "Your Course",
            "tier": "FREE",           // ❌ Problem
                "price": 0,               // ❌ Problem
                    "hotmartProductId": null  // ❌ Problem
}

// API Response: ❌
{
    "message": "This course is free. Payment is not required."
}


// AFTER FIX (Expected):
{
    "_id": ObjectId("695df38df8458990f3ad5ad4"),
        "title": "Your Course",
            "tier": "PREMIUM",        // ✅ Fixed
                "price": 99.99,           // ✅ Fixed
                    "hotmartProductId": "123" // ✅ Fixed
}

// API Response: ✅
{
    "statusCode": 200,
        "data": {
        "checkoutUrl": "https://pay.hotmart.com/...",
            "amount": 99.99,
                "currency": "USD"
    }
}


// ============================================================
// SIMPLIFIED ONE-LINER (If you know your values)
// ============================================================

db.courses.updateOne({ _id: ObjectId("695df38df8458990f3ad5ad4") }, { $set: { tier: "PREMIUM", price: 99.99, hotmartProductId: "YOUR_ID" } })
