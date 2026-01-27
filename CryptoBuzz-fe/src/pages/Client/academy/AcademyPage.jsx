import React, { useEffect, useState, useRef } from 'react';
import { ChevronDown, Play, Lock } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router';
import { useSelector } from 'react-redux';
import { Card, CardContent } from '../../../components/ui/card';
import useDocumentTitle from '../../../hooks/use-document-title';
import { convertRtkEditorToFormattedPlainText } from '../../../lib/rtkEditorUtils';
import { useGetAcademyCategoryByMainSectionQuery } from '../../../store/client/clientAcademyCategoryApiSlice';
import { useCourseAccessFromMap } from '../../../hooks/use-batch-course-access';
import { useBatchCourseAccess } from '../../../hooks/use-batch-course-access';
import { CourseLockOverlay } from '../../../components/payment/CourseLockOverlay';
import { PurchaseButton } from '../../../components/payment/PurchaseButton';
import { PlanSelectionModal } from '../../../components/payment/PlanSelectionModal';
import { RecommendedCourseCard } from '../../../components/payment/RecommendedCourseCard';
import { useCreatePaymentLinkMutation, useLazyGetCoursePlansQuery } from '../../../store/client/clientPaymentApiSlice';
import { selectCurrentToken, selectIsAuthenticated } from '../../../store/authSlice';
import { toast } from 'sonner';
import { selectSelectedLanguage } from '../../../store/languageSlice';



// Helper function to convert video URLs to embeddable formats
const getEmbedUrl = (url) => {
  if (!url) return "";

  if (url.includes("youtube.com/watch?v=")) {
    const videoId = url.split("v=")[1].split("&")[0];
    return `https://www.youtube.com/embed/${videoId}`;
  }

  if (url.includes("youtu.be/")) {
    const videoId = url.split("youtu.be/")[1].split("?")[0];
    return `https://www.youtube.com/embed/${videoId}`;
  }

  if (url.includes("vimeo.com/")) {
    const parts = url.split("vimeo.com/")[1].split("/");
    const videoId = parts[0].split("?")[0];
    const hash = parts[1] ? parts[1].split("?")[0] : null;
    return hash
      ? `https://player.vimeo.com/video/${videoId}?h=${hash}`
      : `https://player.vimeo.com/video/${videoId}`;
  }

  if (url.includes("dailymotion.com/video/")) {
    const videoId = url.split("dailymotion.com/video/")[1].split("?")[0];
    return `https://www.dailymotion.com/embed/video/${videoId}`;
  }

  // Loom
  if (url.includes("loom.com/share/")) {
    const videoId = url.split("loom.com/share/")[1].split("?")[0];
    return `https://www.loom.com/embed/${videoId}`;
  }

  // Dyntube
  if (url.includes("app.dyntube.com/#/video/")) {
    const match = url.match(/video\/([^/]+)/);
    if (match?.[1]) return `https://player.dyntube.com/video/${match[1]}`;
  }

  if (url.includes("videos.dyntube.com/iframes/")) {
    const match = url.match(/iframes\/([^/?#]+)/);
    if (match?.[1]) return `https://videos.dyntube.com/iframes/${match[1]}`;
  }

  if (url.includes("player.dyntube.com/video/")) {
    const match = url.match(/video\/([^/?#]+)/);
    if (match?.[1]) return `https://player.dyntube.com/video/${match[1]}`;
  }

  if (url.includes("dyntube.com/")) return url;

  return url;
};

function CourseUI({
  activeTab,
  setActiveTab,
  toggle,
  open,
  introLessons,
  sections,
  courses,
  categories = [],
  currentCourse = [],
  activeLectureId,
  lecture,
  onLectureSelect,
  data,
  hideVault = false,
  onCourseClick,
  onBackToVault,
  academyCourseLoading = false,
  academyCourseFetching = false,
  courseAccessMap = {},
  currentCourseHasAccess = false
}) {

  // console.log("CourseUI Rendered with lecture:", lecture, "and currentCourse:", currentCourse);
  // console.log("introLessons:", introLessons, "sections:", sections);
  // console.log("activeLectureId:", activeLectureId);
  // console.log("activeTab:", activeTab, "open:", open);
  // console.log("categories:", categories);
  // console.log("courses:", courses);
  // console.log("hideVault:", hideVault);
  // console.log("data:", data);
  // Video player state - sync with parent lecture state
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);

  // Payment state
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [modalPlans, setModalPlans] = useState([]); // Plans to show in modal (from query or checkout response)
  const [createPaymentLink, { isLoading: isPurchasing }] = useCreatePaymentLinkMutation();

  // Get token at component level (hooks must be at top level)
  const authToken = useSelector(selectCurrentToken) || localStorage.getItem('token') || '';

  // Get current course for access check
  // Note: currentCourse[0] is a section, the actual course ID is in currentCourse[0].course
  const currentCourseSection = currentCourse?.[0] || null;
  const currentCourseId = currentCourseSection?.course || currentCourseSection?._id || null;

  // Use lazy query to fetch plans only when needed
  // This ensures we always get fresh data when purchase is clicked
  const [triggerGetPlans, { data: plansData, isLoading: isLoadingPlans, isFetching: isFetchingPlans }] = useLazyGetCoursePlansQuery();

  const plans = plansData?.data?.plans || [];

  // Update modal plans when plans data changes
  useEffect(() => {
    if (plans.length > 0) {
      setModalPlans(plans);
    }
  }, [plans]);

  // Use batch access map for access checking (no individual API calls)
  const { hasAccess, isPremium, coursePrice, courseTier, lockReason, lockMessage, showLock } = useCourseAccessFromMap(
    currentCourseId,
    courseAccessMap, // Use batch access map
    currentCourseSection // Pass course section if available
  );

  // Get authentication state
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const navigate = useNavigate();

  // Handle purchase - Check authentication first, then fetch plans
  const handlePurchase = async () => {
    console.log('🚨🚨🚨 handlePurchase CALLED! 🚨🚨🚨');
    console.log('Current courseId:', currentCourseId);

    if (!currentCourseId) {
      console.error('❌ No courseId!');
      toast.error('Course ID is required');
      return;
    }

    // For PRO courses, check authentication first
    // If not authenticated, redirect to login
    if (courseTier === 'PRO' && !isAuthenticated) {
      console.log('⚠️ User not authenticated - redirecting to login');
      navigate('/login', { state: { from: window.location.pathname } });
      return;
    }

    console.log('✅ Purchase clicked - Fetching plans for course:', currentCourseId);

    // Show loading state
    toast.info('Loading plans...', { duration: 2000 });

    // CRITICAL: Fetch plans FIRST before doing anything else using RTK Query
    console.log('🔄 STEP 1: Starting plans fetch for course:', currentCourseId);

    try {
      // Use RTK Query lazy hook to fetch plans
      console.log('📡 STEP 2: Calling plans API via RTK Query for course:', currentCourseId);
      
      const plansResult = await triggerGetPlans(currentCourseId).unwrap();
      console.log('📦 STEP 3: Plans API response received:', plansResult);

      // Extract plans from the response
      let fetchedPlans = [];
      if (plansResult?.data?.plans) {
        fetchedPlans = plansResult.data.plans;
      } else if (plansResult?.plans) {
        fetchedPlans = plansResult.plans;
      } else if (Array.isArray(plansResult?.data)) {
        fetchedPlans = plansResult.data;
      }

      console.log('✅ Plans extracted:', { fetchedPlans, count: fetchedPlans.length });

      // Check if multiple plans
      if (fetchedPlans.length > 1) {
        // Multiple plans - show modal
        console.log('✅ Multiple plans detected, opening modal', { plansCount: fetchedPlans.length, plans: fetchedPlans });
        setModalPlans(fetchedPlans);
        setShowPlanModal(true);
        return; // Exit early - don't call checkout
      }

      // Even if single plan, log it
      console.log('Single plan or no plans:', { plansCount: fetchedPlans.length, plans: fetchedPlans });

      // Single plan or no plans - proceed with checkout
      const planId = fetchedPlans.length === 1 ? fetchedPlans[0]._id : undefined;
      const payload = planId ? { courseId: currentCourseId, planId } : currentCourseId;

      console.log('💰 STEP 5: Proceeding to checkout with payload:', payload);
      console.log('⚠️ CHECKOUT API WILL BE CALLED NOW');
      const response = await createPaymentLink(payload).unwrap();

      if (response?.data?.checkoutUrl) {
        window.location.href = response.data.checkoutUrl;
      } else {
        throw new Error('Checkout URL not received');
      }
    } catch (error) {
      console.error('❌ Purchase error:', error);
      console.error('Error details:', {
        message: error?.message,
        data: error?.data,
        status: error?.status,
        stack: error?.stack
      });

      // If error is from plans fetch (RTK Query error), don't proceed to checkout
      // RTK Query errors have status and data properties
      if (error?.status === 401 || error?.data?.message === "Invalid or expired token" || 
          error?.message?.includes('Plans API failed') || error?.status) {
        const errorMessage = error?.data?.message || error?.message || 'Failed to load payment plans. Please try again.';
        toast.error(errorMessage);
        return; // Exit - don't call checkout
      }

      // If error says plan selection needed, try to get plans from error response
      if (error?.data?.data?.requiresPlanSelection || error?.data?.data?.plans) {
        const errorPlans = error.data.data.plans || [];
        if (errorPlans.length > 1) {
          setModalPlans(errorPlans);
          setShowPlanModal(true);
          return;
        }
      }

      // Only show error if we haven't already handled it
      if (!error?.message?.includes('Plans API failed')) {
        toast.error(error?.data?.message || error?.message || 'Failed to create payment link');
      }
    }
  };

  // Check if current category has no courses
  // Show "Coming Soon" if:
  // 1. We have an active tab
  // 2. Current course is empty
  // 3. The active tab matches the ActiveCategory from API (meaning we've fetched for this category)
  // 4. The API returned empty course array for this category
  const activeCategoryId = data?.ActiveCategory?.[0]?.categoryId;
  const tabMatchesActiveCategory = activeTab && activeCategoryId &&
    (activeTab === `${activeCategoryId}` || activeTab === activeCategoryId);
  const hasNoCourses = tabMatchesActiveCategory &&
    currentCourse?.length === 0 &&
    (!data?.course || data?.course?.length === 0);

  // Get video URL from lecture (prefer videoUrl, fallback to content)
  const getVideoUrl = (lecture) => {
    return lecture?.videoUrl || lecture?.content || null;
  };

  // Reset video when switching to category with no courses
  useEffect(() => {
    if (hasNoCourses) {
      setSelectedVideo(null);
      setIsVideoPlaying(false);
    }
  }, [hasNoCourses]);

  // Sync selected video with lecture prop
  useEffect(() => {
    // Reset video if no courses for this category
    if (hasNoCourses) {
      setSelectedVideo(null);
      setIsVideoPlaying(false);
      return;
    }

    const videoUrl = getVideoUrl(lecture);
    if (videoUrl) {
      setSelectedVideo({ id: lecture?._id, url: videoUrl });
      setIsVideoPlaying(true);
    } else {
      // Reset if lecture has no video
      setSelectedVideo(null);
      setIsVideoPlaying(false);
    }
  }, [lecture, hasNoCourses]);

  // Handle video selection
  const handleVideoSelect = (lessonId, videoUrl) => {
    // Prevent video selection if course is locked
    if (showLock && !hasAccess) {
      toast.error('Please purchase this course to access the lessons');
      return;
    }

    if (videoUrl) {
      setSelectedVideo({ id: lessonId, url: videoUrl });
      setIsVideoPlaying(true);
      // Notify parent component
      if (onLectureSelect) {
        onLectureSelect(lessonId);
      }
    }
  };

  // Handle play button click on main video area
  const handleMainVideoPlay = () => {
    // Prevent play if course is locked
    if (showLock && !hasAccess) {
      toast.error('Please purchase this course to access the lessons');
      return;
    }

    // Set first lesson video as default
    const firstLesson = introLessons?.[0];
    const videoUrl = getVideoUrl(firstLesson);
    if (videoUrl) {
      handleVideoSelect(firstLesson?.id || firstLesson?._id, videoUrl);
    }
  };

  // Auto-select first video on mount
  useEffect(() => {
    if (!selectedVideo && introLessons?.length > 0) {
      const firstLesson = introLessons[0];
      const videoUrl = getVideoUrl(firstLesson);
      if (videoUrl) {
        handleVideoSelect(firstLesson?.id || firstLesson?._id, videoUrl);
      }
    }
  }, [introLessons]);

  return (
    <>
      <div className="">

        <h1 className="text-2xl font-bold">Academia</h1>
        <p className="text-sm text-gray-500">Inicio / Academia / Crypto</p>

        <Card className="mt-5 p-4 rounded-xl shadow-sm">
          <div className="flex gap-3">
            {categories?.map((category) => {
              const categoryId = `${category?._id}`;
              const isActive = activeTab === categoryId;
              return (
                <button
                  key={category?._id}
                  onClick={() => setActiveTab(categoryId)}
                  className={`px-4 py-2 text-sm font-medium cursor-pointer ${isActive ? "bg-[#FFF9E2] dark:bg-[#fff9e224] text-primary rounded-lg" : "text-gray-600"
                    }`}
                >
                  {category?.name}
                </button>
              );
            })}
          </div>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-5">
          <div className="lg:col-span-2">
            {/* Show "Coming Soon" if no courses for active category */}
            {hasNoCourses ? (
              <div className="card rounded-lg">
                <div className="flex flex-col items-center justify-center py-20 px-6">
                  <div className="text-center">
                    <div className="text-6xl mb-4">📚</div>
                    <h3 className="text-xl font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Course Coming Soon
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400">
                      Courses for this category are being prepared. Please check back soon!
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <>
                {/* Main Video Area */}
                <div className="relative">
                  {isVideoPlaying && selectedVideo && hasAccess ? (
                    <div className="aspect-video w-full border border-gray-200 rounded-lg overflow-hidden shadow-lg bg-black ">
                      <iframe
                        src={getEmbedUrl(selectedVideo?.url)}
                        className="w-full h-full rounded-lg"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        title="Video Player"
                      />
                    </div>
                  ) : (
                    <div className="relative bg-gradient-to-br from-yellow-600 via-yellow-700 to-gray-800 rounded-lg overflow-hidden aspect-video shadow-lg">
                      <div className="absolute inset-0 flex items-center justify-center">
                        <button
                          onClick={handleMainVideoPlay}
                          disabled={showLock && !hasAccess}
                          className="bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-all rounded-xl p-6 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Play className="w-12 h-12 text-white fill-white" />
                        </button>
                      </div>
                      <div className="absolute inset-0 bg-black/20"></div>

                      {/* Show lock overlay if course is premium and not purchased */}
                      {showLock && !hasAccess && (
                        <CourseLockOverlay
                          course={currentCourseSection}
                          onPurchase={handlePurchase}
                          isPurchasing={isPurchasing || isLoadingPlans}
                          price={coursePrice}
                          tier={courseTier}
                          lockReason={lockReason}
                          lockMessage={lockMessage}
                          contentType="course"
                        />
                      )}
                    </div>
                  )}

                  {/* Show lock overlay over video player if course is locked */}
                  {isVideoPlaying && selectedVideo && showLock && !hasAccess && (
                    <CourseLockOverlay
                      course={currentCourseSection}
                      onPurchase={handlePurchase}
                      isPurchasing={isPurchasing || isLoadingPlans}
                      price={coursePrice}
                      contentType="course"
                    />
                  )}
                </div>

                <div className="flex items-start justify-between flex-wrap gap-4 mt-6">
                  <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-200 max-w-[650px]">
                    {lecture?.title || selectedVideo
                      ? (introLessons?.find(l => (l?.id === selectedVideo?.id || l?._id === selectedVideo?.id))?.title ||
                        currentCourse?.flatMap(c => c?.lectures || [])?.find(l => l?._id === selectedVideo?.id)?.title ||
                        "Lesson Title")
                      : "Select a lesson to begin"}
                  </h2>
                  {selectedVideo && (
                    <button className="btn bg-transparent border border-white text-gray-800 dark:text-white cursor-pointer">
                      Mark as Complete
                    </button>
                  )}
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
              </>
            )}
          </div>

          <div className="lg:col-span-1">
            <Card className="rounded-lg shadow-md p-4 md:p-6 sticky top-20">
              {/* Show "Coming Soon" in sidebar if no courses */}
              {hasNoCourses ? (
                <div className="flex flex-col items-center justify-center py-12 px-6">
                  <div className="text-center">
                    <div className="text-4xl mb-4">📚</div>
                    <h3 className="text-lg font-medium text-gray-700 dark:text-gray-600 mb-2">
                      Coming Soon
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">
                      Courses are being prepared for this category.
                    </p>
                  </div>
                </div>
              ) : (
                <>
                  {/* First Section (Intro Series) */}
                  {currentCourse?.length > 0 && currentCourse?.[0]?.title && (
                    <div className="mb-2">
                      <button
                        onClick={() => toggle(currentCourse?.[0]?.title || "Intro Series")}
                        className="w-full flex items-center gap-3 p-3 rounded-lg transition-colors justify-between hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
                      >
                        <h3 className="font-bold text-gray-900 dark:text-gray-200">
                          {currentCourse?.[0]?.title || "Intro Series"}
                        </h3>
                        <ChevronDown
                          className={`w-5 h-5 text-gray-600 dark:text-gray-400 transition-transform
                ${open === (currentCourse?.[0]?.title || "Intro Series") ? "rotate-180" : ""}
              `}
                        />
                      </button>

                      {open === (currentCourse?.[0]?.title || "Intro Series") && (
                        <div className="space-y-2">
                          {introLessons?.map((lesson) => {
                            const lessonId = lesson?._id || lesson?.id;
                            const isSelected = activeLectureId === lessonId || selectedVideo?.id === lessonId;
                            const videoUrl = lesson?.videoUrl || lesson?.content;
                            const isLocked = showLock && !hasAccess;

                            return (
                              <button
                                key={lessonId}
                                onClick={() => {
                                  if (isLocked) {
                                    toast.error('Please purchase this course to access the lessons');
                                    return;
                                  }
                                  if (videoUrl) {
                                    handleVideoSelect(lessonId, videoUrl);
                                  }
                                }}
                                disabled={isLocked}
                                className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors mt-2 relative ${isSelected
                                  ? "bg-yellow-400 hover:bg-yellow-500"
                                  : "bg-gray-100 hover:bg-gray-200 dark:bg-[#201a09] dark:hover:bg-[#201a09] cursor-pointer"
                                  } ${isLocked ? "opacity-60 cursor-not-allowed" : ""}`}
                              >
                                {isLocked && (
                                  <div className="absolute right-2 top-2">
                                    <Lock className="w-4 h-4 text-gray-500" />
                                  </div>
                                )}
                                <div className="w-8 h-8 rounded-full flex items-center justify-center bg-gray-800 dark:bg-gray-600">
                                  <Play className="w-4 h-4 text-white fill-white" />
                                </div>

                                <span
                                  className={`text-sm font-medium flex-1 text-left ${isSelected
                                    ? "text-gray-900"
                                    : "text-gray-700 dark:text-gray-300"
                                    }`}
                                >
                                  {lesson?.title}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}

                  {/* ----------------- OTHER ACCORDIONS ----------------- */}
                  {Object.keys(sections).map((section) => (
                    <div key={section} className="mb-2">

                      {/* HEADER */}
                      <button
                        onClick={() => toggle(section)}
                        className="w-full flex items-center justify-between p-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
                      >
                        <span className="font-bold text-gray-900 dark:text-gray-200">
                          {section}
                        </span>

                        <ChevronDown
                          className={`w-5 h-5 text-gray-600 dark:text-gray-400 transition-transform ${open === section ? "rotate-180" : ""
                            }`}
                        />
                      </button>

                      {/* CONTENT */}
                      {open === section && (
                        <div className="mt-2 space-y-2">
                          {sections?.[section]?.map((lectureItem, index) => {
                            const lectureId = lectureItem?._id || index;
                            const isSelected = activeLectureId === lectureId;
                            const videoUrl = lectureItem?.videoUrl || lectureItem?.content;
                            const isLocked = showLock && !hasAccess;

                            return (
                              <button
                                key={lectureId}
                                onClick={() => {
                                  if (isLocked) {
                                    toast.error('Please purchase this course to access the lessons');
                                    return;
                                  }
                                  if (videoUrl) {
                                    handleVideoSelect(lectureId, videoUrl);
                                  }
                                }}
                                disabled={isLocked}
                                className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors relative ${isSelected
                                  ? "bg-yellow-400 hover:bg-yellow-500"
                                  : "bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700"
                                  } ${isLocked ? "opacity-60 cursor-not-allowed" : ""}`}
                              >
                                {isLocked && (
                                  <div className="absolute right-2 top-2">
                                    <Lock className="w-4 h-4 text-gray-500" />
                                  </div>
                                )}
                                <div className="w-8 h-8 rounded-full flex items-center justify-center bg-gray-900">
                                  <Play className="w-4 h-4 text-white fill-white" />
                                </div>
                                <span className={`text-sm font-medium flex-1 text-left ${isSelected
                                  ? "text-gray-900"
                                  : "text-gray-700 dark:text-gray-300"
                                  }`}>
                                  {lectureItem?.title || `Lesson ${index + 1}`}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  ))}
                </>
              )}
            </Card>
          </div>
        </div>
        {/* Recommended Courses Section (IQ Vault) - Show only if courses exist and not hidden */}
        {!hideVault && courses && courses.length > 0 && (
          <div className="mt-12">
            <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-200">Cursos Recomendados</h3>
              {/* <div className="flex gap-4">
                <button className="text-sm text-gray-600 hover:text-gray-900 dark:hover:text-white cursor-pointer flex items-center gap-1">
                  Experience <ChevronDown className="w-4 h-4" />
                </button>
                <button className="text-sm text-gray-600 hover:text-gray-900 dark:hover:text-white cursor-pointer flex items-center gap-1">
                  Style <ChevronDown className="w-4 h-4" />
                </button>
              </div> */}
            </div>

            {(academyCourseLoading || academyCourseFetching) ? (
              <div className="mt-6">
                <Card className="rounded-lg p-6 shadow-md text-center">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                  <p className="mt-4 text-gray-500">Loading courses...</p>
                </Card>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {courses.map((course) => {
                  return (
                    <RecommendedCourseCard
                      key={course?.id || course?._id}
                      course={course}
                      onCourseClick={onCourseClick}
                      accessMap={courseAccessMap}
                    />
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* Course-Specific Recommended Courses - Show when available */}
        {hideVault && data?.recommendedCourses && data.recommendedCourses.length > 0 && (
          <div className="mt-12">
            <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-200">Cursos Recomendados</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {data.recommendedCourses.map((course) => {
                return (
                  <RecommendedCourseCard
                    key={course?.id || course?._id}
                    course={course}
                    onCourseClick={onCourseClick}
                    accessMap={courseAccessMap}
                  />
                )
              })}
            </div>
          </div>
        )}

        {/* Back to Vault Button - Show when vault is hidden */}
        {/* {hideVault && (
          <div className="mt-6 flex justify-center">
            <button
              onClick={onBackToVault}
              className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
            >
              ← Back to Recommended Courses
            </button>
          </div>
        )} */}
      </div>

      {/* Plan Selection Modal - Always render when showPlanModal is true */}
      <PlanSelectionModal
        open={showPlanModal}
        onOpenChange={setShowPlanModal}
        courseId={currentCourseId}
        courseTitle={currentCourseSection?.title || 'this course'}
        plans={modalPlans.length > 0 ? modalPlans : plans}
      />
    </>
  );
}


export default function AcademyPage() {
  useDocumentTitle('Courses');
  const [activeTab, setActiveTab] = useState('');
  const [open, setOpen] = useState('');
  const [currentCourse, setCurrentCourse] = useState([]);
  const [activeLectureId, setActiveLectureId] = useState(null);
  const [lecture, setLecture] = useState(null);
  const [selectedCourseId, setSelectedCourseId] = useState(null); // For API id parameter
  const [hideVault, setHideVault] = useState(false); // Hide Recommended Courses when course is clicked
  const [recommendedCourses, setRecommendedCourses] = useState([]); // Store recommended courses separately to persist across category changes
  const [courseAccessMap, setCourseAccessMap] = useState({}); // Batch access map for all courses
  const isCheckingAccessRef = useRef(false); // Prevent duplicate API calls

  // Get token from Redux state (primary) or localStorage (fallback)
  const tokenFromRedux = useSelector(selectCurrentToken);

  // URL parameter handling
  const { search, state } = useLocation();
  const params = new URLSearchParams(search);
  console.log("URL Params:", Object.fromEntries(params.entries()));
  const mainSection = params?.get?.("mainSection");
  const languageFromUrl = params?.get?.("language");
  const categoryName = params?.get?.("categoryId");
  const courseId = params?.get?.("courseId");

  // Get selected language from Redux store
  const selectedLanguage = useSelector(selectSelectedLanguage);
  // Use URL language first, then Redux store language, then default to 'English'
  const language = languageFromUrl || selectedLanguage?.name || 'English';

  // Handle course passed from navigation state (from ViewProfilePage)
  useEffect(() => {
    if (state?.selectedCourse) {
      const course = state?.selectedCourse;
      const courseIdFromState = course?._id || course?.id;
      if (courseIdFromState) {
        // Set the course ID to trigger API call
        setSelectedCourseId(courseIdFromState);
        // Hide vault to show course content
        setHideVault(true);
        // Clear state to prevent re-triggering on re-render
        window?.history?.replaceState?.({}, document?.title);
      }
    }
  }, [state?.selectedCourse]);

  // Handle courseId from URL parameter
  useEffect(() => {
    if (courseId) {
      // Set the course ID to trigger API call
      setSelectedCourseId(courseId);
      // Hide vault to show course content
      setHideVault(true);
    }
  }, [courseId]);

  // API call with category and id parameters - refetches when activeTab or selectedCourseId changes
  const {
    data: academyCourseData,
    isLoading: academyCourseLoading,
    isFetching: academyCourseFetching,
    isError,
    refetch,
  } = useGetAcademyCategoryByMainSectionQuery(
    {
      mainSection: mainSection ? mainSection : 'Academy',
      language: language,
      category: activeTab ? activeTab : activeTab || undefined,
      id: courseId ? courseId : selectedCourseId || undefined,
    },
    {
      refetchOnMountOrArgChange: true,
      refetchOnFocus: true,
      refetchOnReconnect: true,
    },
  );

  console.log(academyCourseData, "academyCourseData");
  console.log("selectedCourseId:", selectedCourseId, "activeTab:", activeTab);

  // Extract data from API response
  const data = academyCourseData;
  const categories = data?.categories || [];
  const course = data?.course || [];

  // Auto-select first category tab when data loads (only on initial load)
  useEffect(() => {
    // Only auto-select if we have categories but no active tab yet
    if (data?.categories?.length > 0 && !activeTab) {
      // Priority 1: Try to select from ActiveCategory
      if (data?.ActiveCategory?.length > 0) {
        setActiveTab(`${data?.ActiveCategory?.[0]?.categoryId}`);
      }
      // Priority 2: Try to select from categories
      else {
        setActiveTab(`${data?.categories?.[0]?._id}`);
      }
    }
  }, [data?.categories, data?.ActiveCategory]);

  // Handle course data and lecture selection based on active tab or selectedCourseId
  useEffect(() => {
    // If selectedCourseId is set (course clicked from Recommended Courses), handle that first
    if (selectedCourseId && data?.course && Array.isArray(data?.course) && data?.course?.length > 0) {
      // Display the course data from API response
      setCurrentCourse(data?.course);

      // Auto-select first lecture
      const firstCourse = data?.course?.[0];
      if (firstCourse?.lectures?.length > 0) {
        const firstLecture = firstCourse?.lectures?.[0];
        setActiveLectureId(firstLecture?._id);
        setLecture(firstLecture);
      }

      // Set activeTab to match the course's category from API response
      // Always update activeTab based on API response when course is clicked
      const activeCategoryId = data?.ActiveCategory?.[0]?.categoryId;
      if (activeCategoryId) {
        setActiveTab(`${activeCategoryId}`);
      }
      return; // Exit early if handling selectedCourseId
    }

    // When activeTab changes, reset course data first (only if no selectedCourseId)
    if (activeTab && !selectedCourseId) {
      setCurrentCourse([]);
      setActiveLectureId(null);
      setLecture(null);
    }

    // If we have course data and activeTab matches the category
    const hasValidCourseData = Array.isArray(data?.course) && data?.course?.length > 0;
    const activeCategoryId = data?.ActiveCategory?.[0]?.categoryId;
    const tabMatches = activeTab && (activeTab === `${activeCategoryId}` || activeTab === activeCategoryId);

    if (hasValidCourseData && tabMatches && !selectedCourseId) {
      setCurrentCourse(data?.course);

      // 🟢 Also auto select first lecture whenever data changes
      const firstCourse = data?.course?.[0];
      if (firstCourse?.lectures?.length > 0) {
        const firstLecture = firstCourse?.lectures?.[0];
        setActiveLectureId(firstLecture?._id);
        setLecture(firstLecture);
      }
    } else if (activeTab && tabMatches && !hasValidCourseData && !selectedCourseId) {
      // If tab matches but no course data, ensure currentCourse is empty
      setCurrentCourse([]);
      setActiveLectureId(null);
      setLecture(null);
    }
  }, [data, activeTab, selectedCourseId]);

  // Reset course data when activeTab changes to prevent showing old data
  useEffect(() => {
    if (!activeTab) {
      setCurrentCourse([]);
      return;
    }

    // Only set course data if we have course data AND the active tab matches
    const activeCategoryId = data?.ActiveCategory?.[0]?.categoryId;
    const tabMatches = activeTab === `${activeCategoryId}` || activeTab === activeCategoryId;

    if (data?.course && data?.course?.length > 0 && tabMatches) {
      setCurrentCourse(data?.course);
    } else {
      // Reset course data if no course data or tab doesn't match
      setCurrentCourse([]);
    }
  }, [data, activeTab]);

  // 🟢 Auto-select first lecture when data loads
  useEffect(() => {
    if (data?.course?.length > 0) {
      const firstCourse = data?.course?.[0];
      if (firstCourse?.lectures?.length > 0) {
        const firstLectureId = firstCourse?.lectures?.[0]?._id;
        // Only set if no lecture is currently selected
        if (!activeLectureId) {
          setActiveLectureId(firstLectureId);
          setLecture(firstCourse?.lectures?.[0] || {});
        }
      } else {
        setLecture({});
      }
    }
  }, [data, activeTab, activeLectureId]);

  // This effect is now handled in the auto-select effect above

  // Refetch data when activeTab or selectedCourseId changes
  useEffect(() => {
    if (activeTab || selectedCourseId) {
      refetch();
    }
  }, [activeTab, selectedCourseId, refetch]);

  // Refetch data when component mounts or when returning to page
  useEffect(() => {
    // Listen for visibility change to refetch when user returns to page
    const handleVisibilityChange = () => {
      if (!document?.hidden && activeTab) {
        refetch();
      }
    };

    document?.addEventListener?.("visibilitychange", handleVisibilityChange);

    // Cleanup listener on unmount
    return () => {
      document?.removeEventListener?.("visibilitychange", handleVisibilityChange);
    };
  }, [refetch, activeTab]);

  // This effect is now handled in the auto-select effect above

  // Handle banner click to select lecture
  const handleBannerClick = (clickedLectureId) => {
    const lectureData = currentCourse?.flatMap((c) => c?.lectures || []);
    const displayLecture = lectureData?.find(
      (lecture) => lecture?._id === clickedLectureId
    );
    if (displayLecture) {
      setLecture(displayLecture);
      setActiveLectureId(clickedLectureId);
    }
  };



  const toggle = (section) => {
    setOpen(open === section ? null : section);
  };

  // Auto-open intro series and first section when course loads
  useEffect(() => {
    if (currentCourse?.length > 0) {
      // Open the first section (Intro Series)
      const firstCourse = currentCourse?.[0];
      if (firstCourse?.title) {
        setOpen(firstCourse.title); // Auto-open intro series
      }
    }
  }, [currentCourse]);

  // When user clicks a category: set active tab and reset course selection so vault shows category courses
  const handleCategoryClick = (categoryId) => {
    // Reset selection state
    setSelectedCourseId(null);
    setHideVault(false);
    setCurrentCourse([]);
    setLecture(null);
    setActiveLectureId(null);

    // Update active tab. If same category clicked again, force a refetch so API is called with the current mainSection/language/category
    setActiveTab((prev) => {
      if (prev === categoryId) {
        refetch();
        return prev;
      }
      return categoryId;
    });
  };

  // Transform API data to match UI component expectations
  const transformIntroLessons = (courseData) => {
    if (!courseData || courseData?.length === 0) return [];

    // Get first section's lectures as intro lessons
    const firstSection = courseData?.[0];
    if (!firstSection?.lectures || firstSection?.lectures?.length === 0) return [];

    return firstSection?.lectures?.map((lecture, index) => ({
      id: lecture?._id,
      title: lecture?.title || `Lesson ${index + 1}`,
      active: activeLectureId === lecture?._id,
      videoUrl: lecture?.videoUrl || lecture?.content || '',
      content: lecture?.content || '',
      _id: lecture?._id,
    })) || [];
  };

  // Transform sections data
  const transformSections = (courseData) => {
    if (!courseData || courseData?.length === 0) return {};

    const sectionsObj = {};
    // Skip first section (it's used for intro lessons)
    courseData?.slice(1)?.forEach((section) => {
      if (section?.title && section?.lectures && section?.lectures?.length > 0) {
        sectionsObj[section.title] = section?.lectures?.map((lecture) => ({
          title: lecture?.title,
          videoUrl: lecture?.videoUrl || lecture?.content || '',
          content: lecture?.content || '',
          _id: lecture?._id,
        })) || [];
      }
    });

    return sectionsObj;
  };

  // Get category name for display
  const getCategoryName = (categoryId) => {
    if (!categoryId || !data) return '';
    const category = data?.categories?.find?.(cat => `${cat?._id}` === `${categoryId}`);
    return category?.name || categoryId;
  };

  // Get intro lessons and sections for current active tab
  const introLessons = transformIntroLessons(currentCourse);
  const sections = transformSections(currentCourse);

  // Reset everything when categoryName (URL param) changes
  useEffect(() => {
    if (categoryName) {
      // Force UI to pick the category from URL
      setActiveTab(categoryName);
      setCurrentCourse([]); // reset previous course
      setLecture(null); // reset previous lecture
      setActiveLectureId(null); // reset active lecture
      setHideVault(false); // Show vault when URL category changes
      setSelectedCourseId(null); // Reset course ID
    }
  }, [categoryName]);

  // Store recommended courses from initial load (don't overwrite on category change)
  useEffect(() => {
    const newCourses = (data?.upcomingCourse && data?.upcomingCourse?.length > 0)
      ? data.upcomingCourse
      : (data?.AllCourse && data?.AllCourse?.length > 0)
        ? data.AllCourse
        : [];

    // Always update recommended courses when API returns new course lists (initial load or category selection)
    if (newCourses?.length > 0) {
      setRecommendedCourses(newCourses);
    } else {
      setRecommendedCourses([]);
    }
  }, [data?.upcomingCourse, data?.AllCourse, activeTab]);

  // Get recommended courses - use stored courses or current data
  const courses = recommendedCourses?.length > 0
    ? recommendedCourses
    : (data?.upcomingCourse && data?.upcomingCourse?.length > 0)
      ? data?.upcomingCourse
      : (data?.AllCourse && data?.AllCourse?.length > 0)
        ? data?.AllCourse
        : [];

  // Combine recommended courses with current course for batch access check
  const currentCourseForBatch = React.useMemo(() => {
    const currentSection = currentCourse?.[0] || null;
    const currentId = currentSection?.course || currentSection?._id || null;
    return currentId ? { _id: currentId, ...currentSection } : null;
  }, [currentCourse]);

  const allCoursesForBatchCheck = React.useMemo(() => {
    const allCourses = [...courses];
    // Add current course if it's not already in the list
    if (currentCourseForBatch && !allCourses.find(c => (c?._id || c?.id) === currentCourseForBatch._id)) {
      allCourses.push(currentCourseForBatch);
    }

    // Add recommended courses from API response if available
    if (data?.recommendedCourses && Array.isArray(data.recommendedCourses)) {
      data.recommendedCourses.forEach(recCourse => {
        const recCourseId = recCourse._id || recCourse.id;
        if (recCourseId && !allCourses.find(c => (c?._id || c?.id) === recCourseId)) {
          allCourses.push(recCourse);
        }
      });
    }

    // Debug logging
    console.log('📚 All Courses for Batch Check:', {
      recommendedCoursesCount: courses.length,
      courseSpecificRecommendedCount: data?.recommendedCourses?.length || 0,
      allCoursesCount: allCourses.length,
      courses: allCourses.map(c => ({
        id: c?._id || c?.id,
        title: c?.title,
        tier: c?.tier,
        price: c?.price
      }))
    });

    return allCourses;
  }, [courses, currentCourseForBatch, data?.recommendedCourses]);

  // Batch access hook for all courses (recommended + current)
  const { checkAccess: checkBatchAccess, courseIds } = useBatchCourseAccess(allCoursesForBatchCheck);

  // Create a stable string key from courseIds for comparison
  const courseIdsKey = React.useMemo(() => {
    return courseIds.length > 0 ? courseIds.sort().join(',') : '';
  }, [courseIds]);

  // Batch check access when courseIds change (only when courses actually change)
  useEffect(() => {
    // Check token from Redux state OR localStorage/sessionStorage
    const token = tokenFromRedux || localStorage.getItem('token') || sessionStorage.getItem('token');

    // Debug logging
    console.log('🔍 Batch Access Check Effect:', {
      courseIds,
      courseIdsKey,
      coursesCount: courses.length,
      allCoursesForBatchCheck: allCoursesForBatchCheck.length,
      isCheckingAccessRef: isCheckingAccessRef.current,
      hasToken: !!token,
      tokenSource: tokenFromRedux ? 'Redux' : (localStorage.getItem('token') ? 'localStorage' : 'none')
    });

    // Prevent duplicate calls
    if (isCheckingAccessRef.current) {
      console.log('⏸️ Skipping batch access check - already checking');
      return;
    }

    if (courseIds.length > 0) {
      // Always call API - RTK Query will handle token automatically via baseQuery
      // The API will return proper access data even if user is not authenticated (just all courses will show as locked)
      console.log('✅ Calling batch access API with courseIds:', courseIds);
      isCheckingAccessRef.current = true;
      checkBatchAccess().then((accessMap) => {
        console.log('✅ Batch access API response:', accessMap);
        if (accessMap && Object.keys(accessMap).length > 0) {
          setCourseAccessMap(accessMap);
        } else {
          console.warn('⚠️ Batch access API returned empty or invalid response');
        }
        isCheckingAccessRef.current = false;
      }).catch((error) => {
        console.error('❌ Error fetching batch access:', error);
        isCheckingAccessRef.current = false;
      });
    } else {
      console.log('⚠️ No courseIds available - clearing access map');
      // Clear access map if no courses
      setCourseAccessMap({});
      isCheckingAccessRef.current = false;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseIdsKey, tokenFromRedux]); // Use stable courseIdsKey instead of courseIds array

  // Handle course click from Recommended Courses (IQ Vault behavior)
  const handleCourseClick = (course) => {
    const courseId = course?._id || course?.id;

    // Set the course ID for API - this will trigger API call with course ID
    // The API will return the course data and category information
    setSelectedCourseId(courseId);

    // Hide the Vault section
    setHideVault(true);

    // Reset course and lecture state - will be populated when API response arrives
    setCurrentCourse([]);
    setLecture(null);
    setActiveLectureId(null);

    // Don't manually set activeTab - let the API response determine it
    // The useEffect will handle setting activeTab based on API response's ActiveCategory
  };

  // Handle "Back to Vault" - reset to show Recommended Courses again
  const handleBackToVault = () => {
    setHideVault(false);
    setSelectedCourseId(null);
    // Optionally reset to first category
    if (data?.ActiveCategory?.length > 0) {
      setActiveTab(`${data?.ActiveCategory?.[0]?.categoryId}`);
    } else if (data?.categories?.length > 0) {
      setActiveTab(`${data?.categories?.[0]?._id}`);
    }
    setCurrentCourse([]);
    setLecture(null);
    setActiveLectureId(null);
  };

  // Determine which UI component to render based on category name
  const getCategoryUI = (categoryName) => {
    const name = categoryName?.toLowerCase() || '';
    if (name.includes('crypto')) return 'Crypto';
    if (name.includes('trading') || name.includes('forex')) return 'Trading';
    if (name.includes('marketing') || name.includes('digital')) return 'Digital Marketing';
    return 'Crypto'; // Default fallback
  };

  // Get current active category name
  const activeCategoryName = getCategoryName(activeTab);
  const uiType = getCategoryUI(activeCategoryName);

  // Check access for current course to determine if recommended courses should be shown
  const currentCourseSection = currentCourse?.[0] || null;
  const currentCourseId = currentCourseSection?.course || currentCourseSection?._id || null;
  const { hasAccess: currentCourseHasAccess } = useCourseAccessFromMap(
    currentCourseId,
    courseAccessMap,
    currentCourseSection
  );

  // Show loading state
  if (academyCourseLoading) {
    return (
      <div className="container my-6">
        <div className="flex items-center justify-center py-16">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <p className="mt-4 text-gray-500">Loading courses...</p>
          </div>
        </div>
      </div>
    );
  }

  // Show message if no data
  if (!data || !categories || categories.length === 0) {
    return (
      <div className="container my-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <p className="text-gray-500">No courses available</p>
        </div>
      </div>
    );
  }
  console.log("Rendering AcademyPage with UI Type:", uiType);
  console.log("Current Course:", currentCourse);
  console.log('Active Tab:', activeTab);

  return (
    <>
      <CourseUI
        activeTab={activeTab}
        setActiveTab={handleCategoryClick}
        toggle={toggle}
        open={open}
        introLessons={introLessons}
        sections={sections}
        courses={courses}
        categories={categories}
        currentCourse={currentCourse}
        activeLectureId={activeLectureId}
        lecture={lecture}
        data={data}
        hideVault={hideVault}
        academyCourseLoading={academyCourseLoading}
        academyCourseFetching={academyCourseFetching}
        courseAccessMap={courseAccessMap}
        currentCourseHasAccess={currentCourseHasAccess}
        onCourseClick={handleCourseClick}
        onBackToVault={handleBackToVault}
        onLectureSelect={(lectureId) => {
          const lectureData = currentCourse?.flatMap((c) => c?.lectures || []);
          const selectedLecture = lectureData?.find(
            (l) => l?._id === lectureId,
          );
          if (selectedLecture) {
            setLecture(selectedLecture);
            setActiveLectureId(lectureId);
          }
        }}
      />
    </>
  );
}