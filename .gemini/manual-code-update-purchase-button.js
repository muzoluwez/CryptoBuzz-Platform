/**
 * MANUAL CODE UPDATE REQUIRED
 * File: CryptoBuzz-fe/src/pages/Client/academy/AcademyPage.jsx
 * 
 * This update adds a prominent purchase button to the course header
 * for better user experience when viewing premium courses.
 */

// ============================================================
// STEP 1: Locate the section around line 336-340
// ============================================================
// Current code looks like:
/*
                  {selectedVideo && (
                    <button className="mt-3 btn bg-transparent border border-white text-gray-800 dark:text-white cursor-pointer">
                      Mark as Complete
                    </button>
                  )}
*/

// ============================================================
// STEP 2: Replace lines 336-340 with the following:
// ============================================================

<div className="flex gap-3 items-center flex-wrap">
    {/* Purchase button for premium courses without access */}
    {isPremium && !hasAccess && (
        <PurchaseButton
            courseId={currentCourseId}
            courseTitle={currentCourseSection?.title || currentCourseSection?.name}
            price={coursePrice}
            onPurchaseSuccess={() => {
                toast.success('Redirecting to checkout...');
            }}
            onPurchaseError={(error) => {
                console.error('Purchase failed:', error);
            }}
            className="bg-primary hover:bg-primary/90 text-white"
        />
    )}
    {/* Mark as complete button - only show for accessible courses with selected video */}
    {selectedVideo && hasAccess && (
        <button className="btn bg-transparent border border-white text-gray-800 dark:text-white cursor-pointer">
            Mark as Complete
        </button>
    )}
</div>

// ============================================================
// COMPLETE CONTEXT (lines 328-356):
// ============================================================
/*
                <div className="flex items-center justify-between flex-wrap gap-4 mt-6">
                  <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-200">
                    {lecture?.title || selectedVideo
                      ? (introLessons?.find(l => (l?.id === selectedVideo?.id || l?._id === selectedVideo?.id))?.title ||
                        currentCourse?.flatMap(c => c?.lectures || [])?.find(l => l?._id === selectedVideo?.id)?.title ||
                        "Lesson Title")
                      : "Select a lesson to begin"}
                  </h2>
                  <div className="flex gap-3 items-center flex-wrap">
                    {isPremium && !hasAccess && (
                      <PurchaseButton
                        courseId={currentCourseId}
                        courseTitle={currentCourseSection?.title || currentCourseSection?.name}
                        price={coursePrice}
                        onPurchaseSuccess={() => {
                          toast.success('Redirecting to checkout...');
                        }}
                        onPurchaseError={(error) => {
                          console.error('Purchase failed:', error);
                        }}
                        className="bg-primary hover:bg-primary/90 text-white"
                      />
                    )}
                    {selectedVideo && hasAccess && (
                      <button className="btn bg-transparent border border-white text-gray-800 dark:text-white cursor-pointer">
                        Mark as Complete
                      </button>
                    )}
                  </div>
                </div>

                <p className="text-gray-600 dark:text-gray-400 mt-4 leading-relaxed">
                  {(() => {
                    const lectureDesc = lecture?.description || selectedVideo
                      ? currentCourse?.flatMap(c => c?.lectures || [])?.find(l => l?._id === selectedVideo?.id)?.description
                      : null;

                    if (lectureDesc) return convertRtkEditorToFormattedPlainText(lectureDesc, true);

                    if (selectedVideo) return "Watch and learn from this comprehensive lesson designed to enhance your trading skills and knowledge.";

                    return "Select a lesson from the sidebar to start learning.";
                  })()}
                </p>
*/

// ============================================================
// WHAT THIS CHANGE DOES:
// ============================================================
/*
1. Adds a wrapper div with flex layout for buttons
2. Shows PurchaseButton when:
   - Course is premium (isPremium === true)
   - User doesn't have access (hasAccess === false)
3. Shows "Mark as Complete" button when:
   - Video is selected (selectedVideo !== null)
   - User has access (hasAccess === true)
4. Provides better UX by making purchase button visible in main content area
*/

// ============================================================
// VERIFICATION:
// ============================================================
/*
After making this change:
1. Open http://localhost:5175/client/academy
2. Select a premium course
3. You should see:
   - Purchase button in the header (if not purchased)
   - Purchase button on lock overlay
   - Lock icons on lessons
4. After purchase:
   - Purchase button disappears
   - "Mark as Complete" button appears
   - All lessons become accessible
*/
