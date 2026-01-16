/**
 * Course Purchase Diagnostic Script
 * Add this temporarily to AcademyPage.jsx to debug course access issues
 */

// Add this useEffect after line 975 in AcademyPage.jsx:

useEffect(() => {
    if (currentCourseId && courseAccessMap[currentCourseId]) {
        console.group('🔍 Course Access Diagnostic');
        console.log('Course ID:', currentCourseId);
        console.log('Current Course Section:', currentCourseSection);
        console.log('Access Map Entry:', courseAccessMap[currentCourseId]);
        console.log('Computed Values:', {
            hasAccess,
            isPremium,
            coursePrice,
            courseTier: currentCourseSection?.tier,
        });
        console.log('Expected Behavior:', {
            shouldShowLock: isPremium && !hasAccess,
            shouldShowPurchaseButton: isPremium && !hasAccess,
            shouldAllowVideoPlay: !isPremium || hasAccess,
        });
        console.groupEnd();
    }
}, [currentCourseId, courseAccessMap, hasAccess, isPremium, coursePrice]);

/**
 * Alternative: Add this to browser console while on academy page:
 */
// Copy and paste this in browser DevTools console:
(() => {
    console.group('🔍 Full Page Diagnostic');

    // Check local storage
    console.log('Auth Token:', localStorage.getItem('token') ? 'Present' : 'Missing');

    // Check for React dev tools
    if (window.__REACT_DEVTOOLS_GLOBAL_HOOK__) {
        console.log('React DevTools: Available');
    }

    // Network tab check
    console.log('\n📡 Check Network Tab For:');
    console.log('1. GET /api/v1/common/course/...');
    console.log('2. POST /api/v1/common/payment/access/batch');
    console.log('3. Look for courseAccessMap in response');

    console.log('\n🎯 Expected Response Format:');
    console.log({
        data: {
            "courseId1": {
                hasAccess: true,
                isPremium: false,
                coursePrice: 0,
                courseTier: "FREE"
            },
            "courseId2": {
                hasAccess: false,
                isPremium: true,
                coursePrice: 99.99,
                courseTier: "PREMIUM"
            }
        }
    });

    console.groupEnd();
})();

/**
 * Backend Diagnostic Query (MongoDB)
 * Run this in MongoDB shell or MongoDB Compass:
 */
// Check all courses and their tiers:
db.courses.find({}, { title: 1, tier: 1, price: 1, hotmartProductId: 1 }).pretty();

// Check specific course:
db.courses.findOne({ _id: ObjectId("YOUR_COURSE_ID_HERE") });

// Check user purchases:
db.coursepurchases.find({ user: ObjectId("YOUR_USER_ID_HERE") }).pretty();

/**
 * Backend API Test (using curl or Postman)
 */
// Test batch access check:
curl - X POST http://localhost:YOUR_PORT/api/v1/common/payment/access/batch \
-H "Content-Type: application/json" \
-H "Authorization: Bearer YOUR_TOKEN" \
-d '{"courseIds": ["COURSE_ID_1", "COURSE_ID_2"]}'

// Expected response:
{
    "statusCode": 200,
        "data": {
        "COURSE_ID_1": {
            "hasAccess": true,
                "isPremium": false,
                    "reason": "free_course",
                        "coursePrice": 0,
                            "courseTier": "FREE"
        }
    },
    "message": "Batch access check completed"
}

/**
 * Quick Fix for Free Course Access Issue:
 * If free courses are showing lock, likely causes:
 */

// Cause 1: Course tier not set correctly
// Fix in database:
db.courses.updateMany(
    { price: { $lte: 0 } },
    { $set: { tier: "FREE" } }
);

// Cause 2: Frontend access check logic
// Verify in use-batch-course-access.js line 82-94:
// Should return hasAccess: true for FREE tier courses

// Cause 3: Batch access API not returning correct data
// Check backend payment.js line 468-476:
// Should set hasAccess: true for FREE courses

/**
 * Testing Steps:
 */
/*
1. Open browser DevTools
2. Go to /client/academy
3. Check Console for diagnostic logs
4. Check Network tab for API calls:
   - Find: POST /api/v1/common/payment/access/batch
   - Check Response
5. Verify courseAccessMap structure
6. Check if course tier matches expected (FREE vs PREMIUM)
*/
