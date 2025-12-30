import React, { useEffect, useState } from 'react';
import { ChevronDown, Lock, Play } from 'lucide-react';
import { useAccessControl } from "@/hooks/use-access-control";
import { AccessGate } from "@/components/common/AccessGate";
import { Toolbar, ToolbarHeading } from '@/components/layouts/layout-7/components/toolbar';
import { Card, CardContent } from '../../../components/ui/card';


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

function CryptoUI({ activeTab, setActiveTab, toggle, open, introLessons, sections, courses }) {
  const { checkAccess } = useAccessControl();
  // Example: Main video requires 'PRO' plan or LOGIN - simulating a protected resource
  const mainVideoAccess = checkAccess("PLAN_BASED", ["PRO", "MAX"]);
  
  // Video player state
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  
  // Mock video URLs with dummy YouTube URLs for testing
  const videoUrls = {
    'Intro Series': {
      1: 'https://videos.dyntube.com/iframes/jOiU3b1zQv83K7b1zQv83K', // Crypto Basics
      2: 'https://videos.dyntube.com/iframes/VXZX7eMwekCjHkcZOFQQ ', // Blockchain Explained
      3: 'https://videos.dyntube.com/iframes/VXZX7eMwekCjHkcZOFQQ', // Cryptocurrency Trading
    },
    'Dolor Sit Series': {
      1: 'https://videos.dyntube.com/iframes/VXZX7eMwekCjHkcZOFQQ', // Advanced Crypto Strategies
      2: 'https://www.youtube.com/watch?v=Yw6u6YkTgQ4', // Crypto Market Analysis
      3: 'https://www.youtube.com/watch?v=U3qYN8Su4Us', // Investment Tips
    },
    'Tempor Incididunt Series': {
      1: 'https://videos.dyntube.com/iframes/VXZX7eMwekCjHkcZOFQQ', // Technical Analysis
      2: 'https://www.youtube.com/watch?v=G7uU8sXERMo', // Market Trends
    },
    'Enim Ad Minim Series': {
      1: 'https://videos.dyntube.com/iframes/VXZX7eMwekCjHkcZOFQQ', // Risk Management
      2: 'https://www.youtube.com/watch?v=u6XAPnuFjJc', // Portfolio Diversification
    },
  };
  
  // Handle video selection
  const handleVideoSelect = (lessonId, videoUrl) => {
    if (videoUrl) {
      setSelectedVideo({ id: lessonId, url: videoUrl });
      setIsVideoPlaying(true);
    }
  };
  
  // Handle play button click on main video area
  const handleMainVideoPlay = () => {
    if (mainVideoAccess.hasAccess) {
      // Set first lesson video as default
      const firstLesson = introLessons[0];
      const firstVideoUrl = firstLesson?.videoUrl || videoUrls["Intro Series"]?.[1];
      if (firstVideoUrl) {
        handleVideoSelect(firstLesson?.id || 1, firstVideoUrl);
      }
    }
  };
  
  // Auto-select first video on mount
  useEffect(() => {
    if (mainVideoAccess.hasAccess && !selectedVideo && introLessons.length > 0) {
      const firstLesson = introLessons[0];
      const firstVideoUrl = firstLesson.videoUrl || videoUrls["Intro Series"]?.[firstLesson.id];
      if (firstVideoUrl) {
        setSelectedVideo({ id: firstLesson.id, url: firstVideoUrl });
        setIsVideoPlaying(true);
      }
    }
  }, [mainVideoAccess.hasAccess]);

  return (
    <>
      <div className="container my-6">

        <h1 className="text-2xl font-bold">Courses</h1>
        <p className="text-sm text-gray-500">Home / Courses / Crypto</p>

        <Card className="mt-5 p-4 rounded-xl shadow-sm">
          <div className="flex gap-3">
            {["Crypto", "Trading", "Digital Marketing"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 text-sm font-medium cursor-pointer ${activeTab === tab ? "bg-[#FFF9E2] text-primary rounded-lg" : "text-gray-600"
                  }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-5">
          <div className="lg:col-span-2">
            {/* Protected Main Video Area */}
            {isVideoPlaying && selectedVideo && mainVideoAccess.hasAccess ? (
              <div className="aspect-video w-full border border-gray-200 rounded-lg overflow-hidden shadow-lg bg-black">
                <iframe
                  src={getEmbedUrl(selectedVideo.url)}
                  className="w-full h-full rounded-lg"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  title="Video Player"
                />
              </div>
            ) : (
              <div className="relative bg-gradient-to-br from-yellow-600 via-yellow-700 to-gray-800 rounded-lg overflow-hidden aspect-video shadow-lg">
                {!mainVideoAccess.hasAccess && (
                  <div className="absolute inset-0 z-20 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center text-center p-6">
                    <Lock className="w-12 h-12 text-white/50 mb-4" />
                    <h3 className="text-2xl font-bold text-white mb-2">Premium Masterclass</h3>
                    <p className="text-gray-200 mb-6 max-w-md">Unlock this exclusive masterclass and take your trading skills to the next level.</p>
                    <button className="px-6 py-2 bg-yellow-500 hover:bg-yellow-400 text-black font-semibold rounded-lg transition-colors">
                      Upgrade to Pro
                    </button>
                  </div>
                )}

                <div className="absolute inset-0 flex items-center justify-center">
                  <button 
                    onClick={handleMainVideoPlay}
                    className="bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-all rounded-xl p-6"
                  >
                    <Play className="w-12 h-12 text-white fill-white" />
                  </button>
                </div>
                <div className="absolute inset-0 bg-black/20"></div>
              </div>
            )}

            <div className="flex items-center justify-between flex-wrap gap-4 mt-6">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-200">
                {selectedVideo ? introLessons.find(l => l.id === selectedVideo.id)?.title || "Lorem Ipsum Dolor Sit Amet" : "Lorem Ipsum Dolor Sit Amet"}
              </h2>
              {selectedVideo && mainVideoAccess.hasAccess && (
                <button className="mt-3 btn bg-transparent border border-white text-gray-800 dark:text-white cursor-pointer">
                  Mark as Complete
                </button>
              )}
            </div>

            <p className="text-gray-600 dark:text-gray-400 mt-4 leading-relaxed">
              {selectedVideo 
                ? "Watch and learn from this comprehensive lesson designed to enhance your trading skills and knowledge."
                : "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat."
              }
            </p>
          </div>

          <div className="lg:col-span-1">
            <Card className="rounded-lg shadow-md p-4 md:p-6 sticky top-6">

              <div className="mb-2">
                <button
                  onClick={() => toggle("Intro Series")}
                  className="w-full flex items-center gap-3 p-3 rounded-lg transition-colors justify-between hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
                >
                  <h3 className="font-bold text-gray-900 dark:text-gray-200">
                    Intro Series
                  </h3>
                  <ChevronDown
                    className={`w-5 h-5 text-gray-600 dark:text-gray-400 transition-transform
              ${open === "Intro Series" ? "rotate-180" : ""}
            `}
                  />
                </button>

                {open === "Intro Series" && (
                  <div className="space-y-2">
                    {introLessons.map((lesson) => {
                      const isSelected = selectedVideo?.id === lesson.id;
                      const videoUrl = lesson.videoUrl || videoUrls["Intro Series"]?.[lesson.id];
                      
                      return (
                        <button
                          key={lesson.id}
                          onClick={() => {
                            if (videoUrl && mainVideoAccess.hasAccess) {
                              handleVideoSelect(lesson.id, videoUrl);
                              // Update active state
                              introLessons.forEach(l => l.active = false);
                              lesson.active = true;
                            }
                          }}
                          className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors mt-2 ${
                            isSelected && mainVideoAccess.hasAccess
                              ? "bg-yellow-400 hover:bg-yellow-500"
                              : lesson.active
                              ? "bg-yellow-400 hover:bg-yellow-500"
                              : "bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 "
                          }`}
                        >
                          <div className="w-8 h-8 rounded-full flex items-center justify-center bg-gray-900">
                            <Play className="w-4 h-4 text-white fill-white" />
                          </div>

                          <span
                            className={`text-sm font-medium ${
                              isSelected || lesson.active
                                ? "text-gray-900"
                                : "text-gray-700 dark:text-gray-300"
                            }`}
                          >
                            {lesson.title}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

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
                      {sections[section].map((title, index) => (
                        <button
                          key={index}
                          className="w-full flex items-center gap-3 p-3 rounded-lg 
                             bg-gray-100 hover:bg-gray-200 
                             dark:bg-gray-800 dark:hover:bg-gray-700
                             transition-colors"
                        >
                          <div className="w-8 h-8 rounded-full flex items-center justify-center bg-gray-900">
                            <Play className="w-4 h-4 text-white fill-white" />
                          </div>

                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            {title}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </Card>
          </div>
        </div>
        <div className="mt-12">
          <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-200">Recommended Courses</h3>
            <div className="flex gap-4">
              <button className="text-sm text-gray-600 hover:text-gray-900 dark:hover:text-white cursor-pointer flex items-center gap-1">
                Experience <ChevronDown className="w-4 h-4" />
              </button>
              <button className="text-sm text-gray-600 hover:text-gray-900 dark:hover:text-white cursor-pointer flex items-center gap-1">
                Style <ChevronDown className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => {
              const { hasAccess } = checkAccess(course.accessType, course.allowedPlans);

              return (
                <Card key={course.id} className="relative bg-black text-white h-[438px] p-0 overflow-hidden group">
                  {!hasAccess && (
                    <div className="absolute inset-0 z-20 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center p-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <Lock className="w-10 h-10 text-white mb-2" />
                      <p className="text-center font-semibold">Locked Content</p>
                    </div>
                  )}
                  <CardContent className="p-0">
                    <div className="relative h-full">
                      <img
                        src="https://images.unsplash.com/photo-1559526324-593bc073d938?q=80&w=800&auto=format&fit=crop"
                        alt="live sessions"
                        className={`w-full h-full object-cover transition-all duration-300 ${!hasAccess ? 'grayscale blur-[2px]' : ''}`}
                      />
                      <div className="absolute left-4 bottom-4 text-white z-10">
                        <h4 className=" text-2xl font-bold">{course.title}</h4>
                        <p className="text-md mt-3 text-gray-200">{course.description}</p>
                        <button className="text-yellow-600 hover:text-yellow-700 text-sm font-medium cursor-pointer">
                          {hasAccess ? course.link : "Unlock Course"}
                        </button>
                      </div>
                    </div>
                  </CardContent>
                  <div className='absolute bg-gradient-black  inset-0 bg-gradient-green z-0'></div>
                </Card>
              )
            })}
          </div>
        </div>
      </div>
    </>
  );
}
function TradingUI({ activeTab, setActiveTab, toggle, open, introLessons, sections, courses }) {
  const { checkAccess } = useAccessControl();
  const mainVideoAccess = checkAccess("PLAN_BASED", ["PRO", "MAX"]);
  
  // Video player state
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  
  // Mock video URLs with dummy YouTube URLs for testing
  const videoUrls = {
    "Intro Series": {
      1: "https://www.youtube.com/watch?v=2F2t1RJsUxU", // Trading Basics
      2: "https://www.youtube.com/watch?v=2uVvBVdO_yI", // Stock Market Fundamentals
      3: "https://www.youtube.com/watch?v=KYdD5R2R_xs", // Forex Trading Guide
    },
    "Dolor Sit Series": {
      1: "https://www.youtube.com/watch?v=kXYiU_JCYtU",
      2: "https://www.youtube.com/watch?v=Yw6u6YkTgQ4",
      3: "https://www.youtube.com/watch?v=U3qYN8Su4Us",
    },
    "Tempor Incididunt Series": {
      1: "https://www.youtube.com/watch?v=pSTNhBlfV_s",
      2: "https://www.youtube.com/watch?v=G7uU8sXERMo",
    },
    "Enim Ad Minim Series": {
      1: "https://www.youtube.com/watch?v=WNeLUngb-Xg",
      2: "https://www.youtube.com/watch?v=u6XAPnuFjJc",
    },
  };
  
  const handleVideoSelect = (lessonId, videoUrl) => {
    if (videoUrl) {
      setSelectedVideo({ id: lessonId, url: videoUrl });
      setIsVideoPlaying(true);
    }
  };
  
  const handleMainVideoPlay = () => {
    if (mainVideoAccess.hasAccess) {
      const firstLesson = introLessons[0];
      const firstVideoUrl = firstLesson?.videoUrl || videoUrls["Intro Series"]?.[1];
      if (firstVideoUrl) {
        handleVideoSelect(firstLesson?.id || 1, firstVideoUrl);
      }
    }
  };
  
  useEffect(() => {
    if (mainVideoAccess.hasAccess && !selectedVideo && introLessons.length > 0) {
      const firstLesson = introLessons[0];
      const firstVideoUrl = firstLesson.videoUrl || videoUrls["Intro Series"]?.[firstLesson.id];
      if (firstVideoUrl) {
        setSelectedVideo({ id: firstLesson.id, url: firstVideoUrl });
        setIsVideoPlaying(true);
      }
    }
  }, [mainVideoAccess.hasAccess]);

  return (
    <>
      <div className="container my-6">

        <h1 className="text-2xl font-bold">Courses</h1>
        <p className="text-sm text-gray-500">Home / Courses / Crypto</p>

        <Card className="mt-5 p-4 rounded-xl shadow-sm">
          <div className="flex gap-3">
            {["Crypto", "Trading", "Digital Marketing"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 text-sm font-medium cursor-pointer ${activeTab === tab ? "bg-[#FFF9E2] text-primary rounded-lg" : "text-gray-600"
                  }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-5">
          <div className="lg:col-span-2">
            {isVideoPlaying && selectedVideo && mainVideoAccess.hasAccess ? (
              <div className="aspect-video w-full border border-gray-200 rounded-lg overflow-hidden shadow-lg bg-black">
                <iframe
                  src={getEmbedUrl(selectedVideo.url)}
                  className="w-full h-full rounded-lg"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  title="Video Player"
                />
              </div>
            ) : (
              <div className="relative bg-gradient-to-br from-green-600 via-green-700 to-gray-800 rounded-lg overflow-hidden aspect-video shadow-lg">
                {!mainVideoAccess.hasAccess && (
                  <div className="absolute inset-0 z-20 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center text-center p-6">
                    <Lock className="w-12 h-12 text-white/50 mb-4" />
                    <h3 className="text-2xl font-bold text-white mb-2">Advanced Trading Strategies</h3>
                    <p className="text-gray-200 mb-6 max-w-md">Master the art of technical analysis and risk management with our premium course.</p>
                    <button className="px-6 py-2 bg-green-500 hover:bg-green-400 text-black font-semibold rounded-lg transition-colors">
                      Upgrade to Pro
                    </button>
                  </div>
                )}

                <div className="absolute inset-0 flex items-center justify-center">
                  <button 
                    onClick={handleMainVideoPlay}
                    className="bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-all rounded-xl p-6"
                  >
                    <Play className="w-12 h-12 text-white fill-white" />
                  </button>
                </div>
                <div className="absolute inset-0 bg-black/20"></div>
              </div>
            )}

            <div className="flex items-center justify-between flex-wrap gap-4 mt-6">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-200">
                {selectedVideo ? introLessons.find(l => l.id === selectedVideo.id)?.title || "Consectetur Adipiscing Elit" : "Consectetur Adipiscing Elit"}
              </h2>
              {selectedVideo && mainVideoAccess.hasAccess && (
                <button className="mt-3 btn bg-transparent border border-white text-gray-800 dark:text-white cursor-pointer">
                  Mark as Complete
                </button>
              )}
            </div>

            <p className="text-gray-600 dark:text-gray-400 mt-4 leading-relaxed">
              {selectedVideo 
                ? "Watch and learn from this comprehensive lesson designed to enhance your trading skills and knowledge."
                : "Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum."
              }
            </p>
          </div>

          <div className="lg:col-span-1">
            <Card className="rounded-lg shadow-md p-4 md:p-6 sticky top-6">

              {/* ----------------- INTRO SERIES ACCORDION ----------------- */}
              <div className="mb-2">
                <button
                  onClick={() => toggle("Intro Series")}
                  className="w-full flex items-center gap-3 p-3 rounded-lg transition-colors justify-between hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
                >
                  <h3 className="font-bold text-gray-900 dark:text-gray-200">
                    Intro Series
                  </h3>
                  <ChevronDown
                    className={`w-5 h-5 text-gray-600 dark:text-gray-400 transition-transform
              ${open === "Intro Series" ? "rotate-180" : ""}
            `}
                  />
                </button>

                {open === "Intro Series" && (
                  <div className="space-y-2">
                    {introLessons.map((lesson) => {
                      const isSelected = selectedVideo?.id === lesson.id;
                      const videoUrl = lesson.videoUrl || videoUrls["Intro Series"]?.[lesson.id];
                      
                      return (
                        <button
                          key={lesson.id}
                          onClick={() => {
                            if (videoUrl && mainVideoAccess.hasAccess) {
                              handleVideoSelect(lesson.id, videoUrl);
                              introLessons.forEach(l => l.active = false);
                              lesson.active = true;
                            }
                          }}
                          className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors mt-2 ${
                            isSelected && mainVideoAccess.hasAccess
                              ? "bg-green-400 hover:bg-green-500"
                              : lesson.active
                              ? "bg-green-400 hover:bg-green-500"
                              : "bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 "
                          }`}
                        >
                          <div className="w-8 h-8 rounded-full flex items-center justify-center bg-gray-900">
                            <Play className="w-4 h-4 text-white fill-white" />
                          </div>

                          <span
                            className={`text-sm font-medium ${
                              isSelected || lesson.active
                                ? "text-gray-900"
                                : "text-gray-700 dark:text-gray-300"
                            }`}
                          >
                            {lesson.title}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

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
                      {sections[section].map((title, index) => (
                        <button
                          key={index}
                          className="w-full flex items-center gap-3 p-3 rounded-lg 
                             bg-gray-100 hover:bg-gray-200 
                             dark:bg-gray-800 dark:hover:bg-gray-700
                             transition-colors"
                        >
                          <div className="w-8 h-8 rounded-full flex items-center justify-center bg-gray-900">
                            <Play className="w-4 h-4 text-white fill-white" />
                          </div>

                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            {title}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </Card>
          </div>
        </div>
        <div className="mt-12">
          <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-200">Recommended Courses</h3>
            <div className="flex gap-4">
              <button className="text-sm text-gray-600 hover:text-gray-900 dark:hover:text-white cursor-pointer flex items-center gap-1">
                Experience <ChevronDown className="w-4 h-4" />
              </button>
              <button className="text-sm text-gray-600 hover:text-gray-900 dark:hover:text-white cursor-pointer flex items-center gap-1">
                Style <ChevronDown className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => {
              const { hasAccess } = checkAccess(course.accessType, course.allowedPlans);

              return (
                <Card key={course.id} className="relative bg-black text-white h-[438px] p-0 overflow-hidden group">
                  {!hasAccess && (
                    <div className="absolute inset-0 z-20 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center p-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <Lock className="w-10 h-10 text-white mb-2" />
                      <p className="text-center font-semibold">Locked Content</p>
                    </div>
                  )}
                  <CardContent className="p-0">
                    <div className="relative h-full">
                      <img
                        src="https://images.unsplash.com/photo-1559526324-593bc073d938?q=80&w=800&auto=format&fit=crop"
                        alt="live sessions"
                        className={`w-full h-full object-cover transition-all duration-300 ${!hasAccess ? 'grayscale blur-[2px]' : ''}`}
                      />
                      <div className="absolute left-4 bottom-4 text-white z-10">
                        <h4 className=" text-2xl font-bold">{course.title}</h4>
                        <p className="text-md mt-3 text-gray-200">{course.description}</p>
                        <button className="text-yellow-600 hover:text-yellow-700 text-sm font-medium cursor-pointer">
                          {hasAccess ? course.link : "Unlock Course"}
                        </button>
                      </div>
                    </div>
                  </CardContent>
                  <div className='absolute bg-gradient-black  inset-0 bg-gradient-green z-0'></div>
                </Card>
              )
            })}
          </div>
        </div>
      </div>
    </>
  );
}
function DigitalMarketingUI({ activeTab, setActiveTab, toggle, open, introLessons, sections, courses }) {
  const { checkAccess } = useAccessControl();
  const mainVideoAccess = checkAccess("PLAN_BASED", ["PRO", "MAX"]);
  
  // Video player state
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  
  // Mock video URLs with dummy YouTube URLs for testing
  const videoUrls = {
    "Intro Series": {
      1: "https://www.youtube.com/watch?v=bIZsnKGV8TE", // Digital Marketing Basics
      2: "https://www.youtube.com/watch?v=OXGznpKZ_sA", // Social Media Marketing
      3: "https://www.youtube.com/watch?v=HqlCK8I3q5Y", // Content Marketing Strategy
    },
    "Dolor Sit Series": {
      1: "https://www.youtube.com/watch?v=kXYiU_JCYtU",
      2: "https://www.youtube.com/watch?v=Yw6u6YkTgQ4",
      3: "https://www.youtube.com/watch?v=U3qYN8Su4Us",
    },
    "Tempor Incididunt Series": {
      1: "https://www.youtube.com/watch?v=pSTNhBlfV_s",
      2: "https://www.youtube.com/watch?v=G7uU8sXERMo",
    },
    "Enim Ad Minim Series": {
      1: "https://www.youtube.com/watch?v=WNeLUngb-Xg",
      2: "https://www.youtube.com/watch?v=u6XAPnuFjJc",
    },
  };
  
  const handleVideoSelect = (lessonId, videoUrl) => {
    if (videoUrl) {
      setSelectedVideo({ id: lessonId, url: videoUrl });
      setIsVideoPlaying(true);
    }
  };
  
  const handleMainVideoPlay = () => {
    if (mainVideoAccess.hasAccess) {
      const firstLesson = introLessons[0];
      const firstVideoUrl = firstLesson?.videoUrl || videoUrls["Intro Series"]?.[1];
      if (firstVideoUrl) {
        handleVideoSelect(firstLesson?.id || 1, firstVideoUrl);
      }
    }
  };
  
  useEffect(() => {
    if (mainVideoAccess.hasAccess && !selectedVideo && introLessons.length > 0) {
      const firstLesson = introLessons[0];
      const firstVideoUrl = firstLesson.videoUrl || videoUrls["Intro Series"]?.[firstLesson.id];
      if (firstVideoUrl) {
        setSelectedVideo({ id: firstLesson.id, url: firstVideoUrl });
        setIsVideoPlaying(true);
      }
    }
  }, [mainVideoAccess.hasAccess]);

  return (
    <>
      <div className="container my-6">

        <h1 className="text-2xl font-bold">Courses</h1>
        <p className="text-sm text-gray-500">Home / Courses / Crypto</p>

        <Card className="mt-5 p-4 rounded-xl shadow-sm">
          <div className="flex gap-3">
            {["Crypto", "Trading", "Digital Marketing"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 text-sm font-medium cursor-pointer ${activeTab === tab ? "bg-[#FFF9E2] text-primary rounded-lg" : "text-gray-600"
                  }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-5">
          <div className="lg:col-span-2">
            {isVideoPlaying && selectedVideo && mainVideoAccess.hasAccess ? (
              <div className="aspect-video w-full border border-gray-200 rounded-lg overflow-hidden shadow-lg bg-black">
                <iframe
                  src={getEmbedUrl(selectedVideo.url)}
                  className="w-full h-full rounded-lg"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  title="Video Player"
                />
              </div>
            ) : (
              <div className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-gray-800 rounded-lg overflow-hidden aspect-video shadow-lg">
                {!mainVideoAccess.hasAccess && (
                  <div className="absolute inset-0 z-20 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center text-center p-6">
                    <Lock className="w-12 h-12 text-white/50 mb-4" />
                    <h3 className="text-2xl font-bold text-white mb-2">Digital Marketing Mastery</h3>
                    <p className="text-gray-200 mb-6 max-w-md">Learn how to build and scale your brand in the digital age.</p>
                    <button className="px-6 py-2 bg-blue-500 hover:bg-blue-400 text-black font-semibold rounded-lg transition-colors">
                      Upgrade to Pro
                    </button>
                  </div>
                )}

                <div className="absolute inset-0 flex items-center justify-center">
                  <button 
                    onClick={handleMainVideoPlay}
                    className="bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-all rounded-xl p-6"
                  >
                    <Play className="w-12 h-12 text-white fill-white" />
                  </button>
                </div>
                <div className="absolute inset-0 bg-black/20"></div>
              </div>
            )}

            <div className="flex items-center justify-between flex-wrap gap-4 mt-6">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-200">
                {selectedVideo ? introLessons.find(l => l.id === selectedVideo.id)?.title || "Sed Do Eiusmod Tempor" : "Sed Do Eiusmod Tempor"}
              </h2>
              {selectedVideo && mainVideoAccess.hasAccess && (
                <button className="mt-3 btn bg-transparent border border-white text-gray-800 dark:text-white cursor-pointer">
                  Mark as Complete
                </button>
              )}
            </div>

            <p className="text-gray-600 dark:text-gray-400 mt-4 leading-relaxed">
              {selectedVideo 
                ? "Watch and learn from this comprehensive lesson designed to enhance your trading skills and knowledge."
                : "Incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat duis aute irure dolor."
              }
            </p>
          </div>

          <div className="lg:col-span-1">
            <Card className="rounded-lg shadow-md p-4 md:p-6 sticky top-6">

              {/* ----------------- INTRO SERIES ACCORDION ----------------- */}
              <div className="mb-2">
                <button
                  onClick={() => toggle("Intro Series")}
                  className="w-full flex items-center gap-3 p-3 rounded-lg transition-colors justify-between hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
                >
                  <h3 className="font-bold text-gray-900 dark:text-gray-200">
                    Intro Series
                  </h3>
                  <ChevronDown
                    className={`w-5 h-5 text-gray-600 dark:text-gray-400 transition-transform
              ${open === "Intro Series" ? "rotate-180" : ""}
            `}
                  />
                </button>

                {open === "Intro Series" && (
                  <div className="space-y-2">
                    {introLessons.map((lesson) => {
                      const isSelected = selectedVideo?.id === lesson.id;
                      const videoUrl = lesson.videoUrl || videoUrls["Intro Series"]?.[lesson.id];
                      
                      return (
                        <button
                          key={lesson.id}
                          onClick={() => {
                            if (videoUrl && mainVideoAccess.hasAccess) {
                              handleVideoSelect(lesson.id, videoUrl);
                              introLessons.forEach(l => l.active = false);
                              lesson.active = true;
                            }
                          }}
                          className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors mt-2 ${
                            isSelected && mainVideoAccess.hasAccess
                              ? "bg-blue-400 hover:bg-blue-500"
                              : lesson.active
                              ? "bg-blue-400 hover:bg-blue-500"
                              : "bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 "
                          }`}
                        >
                          <div className="w-8 h-8 rounded-full flex items-center justify-center bg-gray-900">
                            <Play className="w-4 h-4 text-white fill-white" />
                          </div>

                          <span
                            className={`text-sm font-medium ${
                              isSelected || lesson.active
                                ? "text-gray-900"
                                : "text-gray-700 dark:text-gray-300"
                            }`}
                          >
                            {lesson.title}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

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
                      {sections[section].map((title, index) => (
                        <button
                          key={index}
                          className="w-full flex items-center gap-3 p-3 rounded-lg 
                             bg-gray-100 hover:bg-gray-200 
                             dark:bg-gray-800 dark:hover:bg-gray-700
                             transition-colors"
                        >
                          <div className="w-8 h-8 rounded-full flex items-center justify-center bg-gray-900">
                            <Play className="w-4 h-4 text-white fill-white" />
                          </div>

                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            {title}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </Card>
          </div>
        </div>
        <div className="mt-12">
          <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-200">Recommended Courses</h3>
            <div className="flex gap-4">
              <button className="text-sm text-gray-600 hover:text-gray-900 dark:hover:text-white cursor-pointer flex items-center gap-1">
                Experience <ChevronDown className="w-4 h-4" />
              </button>
              <button className="text-sm text-gray-600 hover:text-gray-900 dark:hover:text-white cursor-pointer flex items-center gap-1">
                Style <ChevronDown className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => {
              const { hasAccess } = checkAccess(course.accessType, course.allowedPlans);

              return (
                <Card key={course.id} className="relative bg-black text-white h-[438px] p-0 overflow-hidden group">
                  {!hasAccess && (
                    <div className="absolute inset-0 z-20 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center p-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <Lock className="w-10 h-10 text-white mb-2" />
                      <p className="text-center font-semibold">Locked Content</p>
                    </div>
                  )}
                  <CardContent className="p-0">
                    <div className="relative h-full">
                      <img
                        src="https://images.unsplash.com/photo-1559526324-593bc073d938?q=80&w=800&auto=format&fit=crop"
                        alt="live sessions"
                        className={`w-full h-full object-cover transition-all duration-300 ${!hasAccess ? 'grayscale blur-[2px]' : ''}`}
                      />
                      <div className="absolute left-4 bottom-4 text-white z-10">
                        <h4 className=" text-2xl font-bold">{course.title}</h4>
                        <p className="text-md mt-3 text-gray-200">{course.description}</p>
                        <button className="text-yellow-600 hover:text-yellow-700 text-sm font-medium cursor-pointer">
                          {hasAccess ? course.link : "Unlock Course"}
                        </button>
                      </div>
                    </div>
                  </CardContent>
                  <div className='absolute bg-gradient-black  inset-0 bg-gradient-green z-0'></div>
                </Card>
              )
            })}
          </div>
        </div>
      </div>
    </>
  );
}


export function AcademyPage() {
  const [activeTab, setActiveTab] = useState("Crypto");
  const [open, setOpen] = useState("Intro Series");

  const toggle = (section) => {
    setOpen(open === section ? null : section);
  };

  const introLessons = [
    {
      id: 1,
      title: 'Introduction to Cryptocurrency',
      active: true,
      videoUrl: 'https://videos.dyntube.com/iframes/jOiU3b1zQv83K7b1zQv83K',
    },
    {
      id: 2,
      title: 'Understanding Blockchain Technology',
      active: false,
      videoUrl: 'https://videos.dyntube.com/iframes/VXZX7eMwekCjHkcZOFQQ',
    },
    {
      id: 3,
      title: 'Cryptocurrency Trading Basics',
      active: false,
      videoUrl: 'https://videos.dyntube.com/iframes/VXZX7eMwekCjHkcZOFQQ',
    },
  ];

  const sections = {
    "Dolor Sit Series": [
      { title: "Advanced Trading Strategies", videoUrl: "https://www.youtube.com/watch?v=kXYiU_JCYtU" },
      { title: "Market Analysis Techniques", videoUrl: "https://www.youtube.com/watch?v=Yw6u6YkTgQ4" },
      { title: "Investment Best Practices", videoUrl: "https://www.youtube.com/watch?v=U3qYN8Su4Us" },
    ],
    "Tempor Incididunt Series": [
      { title: "Technical Analysis Fundamentals", videoUrl: "https://www.youtube.com/watch?v=pSTNhBlfV_s" },
      { title: "Understanding Market Trends", videoUrl: "https://www.youtube.com/watch?v=G7uU8sXERMo" },
    ],
    "Enim Ad Minim Series": [
      { title: "Risk Management Strategies", videoUrl: "https://www.youtube.com/watch?v=WNeLUngb-Xg" },
      { title: "Portfolio Diversification", videoUrl: "https://www.youtube.com/watch?v=u6XAPnuFjJc" },
    ],
  };

  // Upgraded mock data with Access Control
  const courses = [
    {
      id: 1,
      title: "Lorem Ipsum Dolor Bootcamp",
      description: "Sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna",
      link: "Show more",
      accessType: "PUBLIC"
    },
    {
      id: 2,
      title: "Sed Diam Nonumy Blueprint",
      description: "Eirmod tempor invidunt ut labore et dolore magna aliqua erat volutpat sed diam voluptua",
      link: "Show more",
      accessType: "LOGIN_REQUIRED"
    },
    {
      id: 3,
      title: "Lorem Dolor",
      description: "Nonumy eirmod tempor invidunt ut labore et dolore magna aliqua erat volutpat amet consectetur",
      link: "Show more",
      accessType: "PLAN_BASED",
      allowedPlans: ["PRO", "MAX"]
    },
  ];

  return (
    <>
      {activeTab === "Crypto" && (
        <CryptoUI
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          toggle={toggle}
          open={open}
          introLessons={introLessons}
          sections={sections}
          courses={courses}
        />
      )}

      {activeTab === "Trading" && (
        <TradingUI
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          toggle={toggle}
          open={open}
          introLessons={introLessons}
          sections={sections}
          courses={courses}
        />
      )}

      {activeTab === "Digital Marketing" && (
        <DigitalMarketingUI
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          toggle={toggle}
          open={open}
          introLessons={introLessons}
          sections={sections}
          courses={courses}
        />
      )}
    </>
  );
}