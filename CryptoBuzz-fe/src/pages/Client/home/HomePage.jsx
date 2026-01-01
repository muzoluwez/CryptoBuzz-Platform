import { useEffect, useMemo, useState } from 'react';
import { useGetAllActiveLiveStreamsQuery } from '@/store/client/clientScheduleApiSlice';
import { useGetSocialsQuery } from '@/store/client/clientSocialApiSlice';
import { Activity, ChevronLeft, ChevronRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Toolbar, ToolbarHeading } from '@/components/layouts/layout-7/components/toolbar';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardHeading, CardTitle, CardToolbar } from '../../../components/ui/card';
import { LoginRequired } from '@/components/common/access-states/LoginRequired';
import { useAuthContext } from '@/context/AuthContext';


const DummyImage = ({ src, alt = "", className = "" }) => (
  <img src={src} alt={alt} className={`w-full h-full object-cover ${className}`} />
);

// Helper function to format time ago
const timeAgo = (date) => {
  if (!date) return 'Unknown';
  const now = new Date();
  const dateObj = date instanceof Date ? date : new Date(date);
  const diffInSeconds = Math.floor((now - dateObj) / 1000);

  if (diffInSeconds < 60) return 'just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} mins ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;
  return dateObj.toLocaleDateString();
};

// Helper function to convert HTML to plain text
const htmlToPlainText = (html) => {
  if (!html) return '';
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = html;
  return tempDiv.textContent || tempDiv.innerText || '';
};

// Helper function to get short content
const getShortContent = (content) => {
  if (!content) return '';
  const plainText = htmlToPlainText(content);
  return plainText.length > 120 ? plainText.substring(0, 120) + '...' : plainText;
};

export default function HomePage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthContext();
  const [socialType, setSocialType] = useState('social');
  const [currentLiveIndex, setCurrentLiveIndex] = useState(0);
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  const [showLoginRequired, setShowLoginRequired] = useState(false);

  // Fetch active live streams
  const { data: liveStreamsData, isLoading: isLiveStreamsLoading, isError: isLiveStreamsError } = useGetAllActiveLiveStreamsQuery(undefined, {
    pollingInterval: 30000, // Poll every 30 seconds
  });

  // Fetch social posts
  const { data: socialData, isLoading: isPostsLoading, isError: isPostsError, isFetching: isFetchingPosts } = useGetSocialsQuery({
    page: 1,
    limit: 5,
    category: socialType === 'company' ? 'company' : undefined,
  });

  // Transform live streams data
  const liveStreams = useMemo(() => {
    if (!liveStreamsData?.data) return [];
    return liveStreamsData.data.map((stream) => ({
      _id: stream._id,
      educator: stream.educator || {},
      schedule: stream.schedule || {},
      callId: stream.callId,
      title: stream.title || stream.schedule?.title || '',
      description: stream.schedule?.description || stream.educator?.description || '',
      image: stream.schedule?.image || stream.educator?.bannerImage || '',
    }));
  }, [liveStreamsData]);

  // Reset index when liveStreams change
  useEffect(() => {
    if (liveStreams.length > 0 && currentLiveIndex >= liveStreams.length) {
      setCurrentLiveIndex(0);
    }
  }, [liveStreams.length, currentLiveIndex]);

  // Auto-slide for multiple educators
  useEffect(() => {
    if (liveStreams.length > 1) {
      const interval = setInterval(() => {
        setCurrentLiveIndex((prev) => (prev + 1) % liveStreams.length);
      }, 5000); // Change slide every 5 seconds
      return () => clearInterval(interval);
    }
  }, [liveStreams.length]);

  // Touch handlers for swipe functionality
  const minSwipeDistance = 50;

  const onTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe && liveStreams.length > 1) {
      setCurrentLiveIndex((prev) => (prev + 1) % liveStreams.length);
    }
    if (isRightSwipe && liveStreams.length > 1) {
      setCurrentLiveIndex((prev) => (prev - 1 + liveStreams.length) % liveStreams.length);
    }
  };

  // Get current live stream
  const currentLiveStream = liveStreams[currentLiveIndex] || null;

  // Transform posts data
  const posts = useMemo(() => {
    if (!socialData?.data) return [];
    return socialData.data.map((post) => ({
      _id: post._id,
      content: post.content || '',
      author: {
        first_name: post.author?.first_name || '',
        last_name: post.author?.last_name || '',
        image: post.author?.image || '/media/avatars/1.png',
      },
      createdAt: post.createdAt || new Date(),
    }));
  }, [socialData]);
  return (
    <>
      {/* <Toolbar>
        <ToolbarHeading title="Home" />
      </Toolbar> */}
      <div className="container my-6">
        <main className="">
          {/* Page Header */}
          <header className="mb-6">
            <h1 className="text-2xl font-bold">Cripto Buzz Home</h1>
            <p className="text-sm text-gray-500">Home</p>
          </header>

          {/* HERO */}
          <section className="card mb-6 bg-white !rounded-2xl">
            <div className="relative h-52 md:h-60 lg:h-72">
              <DummyImage
                src="https://images.unsplash.com/photo-1542744173-8e7e53415bb0?q=80&w=1600&auto=format&fit=crop"
                alt="hero"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>

              <div className="absolute left-6 bottom-6 text-white mb-4">
                <h2 className="text-2xl md:text-3xl font-semibold drop-shadow-md">
                  Cripto Buzz
                </h2>
                <p className="text-sm md:text-base drop-shadow-sm">
                  CryptoBuzz is a platform for learning about cryptocurrencies
                  and trading strategies.
                </p>
              </div>
            </div>
          </section>

          {/* TWO COLUMN FEATURES */}
          <section className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
            <div className="lg:col-span-2 space-y-6">
              {/* Top-left stacked cards */}
              <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
                <div className="flex flex-col gap-5">
                  <Card className="relative text-white bg-[url('../../../../public/media/images/FreeMembershipTraining.png')] bg-cover h-64 overflow-hidden">
                    <CardContent className="flex flex-col justify-center h-full z-10 max-w-[75%]">
                      <div>
                        <CardHeading className="text-2xl font-black">
                          Academy
                        </CardHeading>
                        <p className="mt-2 text-lg">
                          Comprehensive trading education from basics to
                          advanced strategies
                        </p>
                      </div>
                      <div className="mt-4">
                        <Link
                          to="/client/academy"
                          className="btn bg-black text-white cursor-pointer "
                        >
                          Start Learning
                        </Link>
                      </div>
                    </CardContent>
                    <div className="absolute inset-0 bg-gradient-green z-0"></div>
                  </Card>
                  <Card className="relative text-white bg-[url('../../../../public/media/images/PremiumAcademy.png')] bg-cover h-64 overflow-hidden">
                    <CardContent className="flex flex-col justify-center h-full z-10 max-w-[75%]">
                      <div>
                        <CardHeading className="text-2xl font-black">
                          Premium Membership
                        </CardHeading>
                        <p className="mt-2 text-lg">
                          CryptoBuzz Premium Membership is a platform for
                          learning about cryptocurrencies and trading
                          strategies.
                        </p>
                      </div>
                      <div className="mt-4">
                        <Link
                          to="/client/home"
                          className="btn bg-white text-black cursor-pointer "
                        >
                          Start Membership
                        </Link>
                      </div>
                    </CardContent>
                    <div className="absolute inset-0 bg-gradient-blue z-0"></div>
                  </Card>
                </div>
              </div>
            </div>

            {/* Right big highlighted card */}
            <div className="lg:col-span-2 space-y-6">
              <Card className="relative text-white bg-[url('../../../../public/media/images/live-user--bg.png')] bg-cover overflow-hidden h-full">
                {/* Live Badge - Only show when there are live streams */}
                {liveStreams.length > 0 && !isLiveStreamsLoading && (
                  <div className="absolute top-4 left-4 z-30 bg-red-600 text-white text-xs font-semibold px-3 py-1.5 rounded-full flex items-center gap-2 shadow-lg">
                    <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
                    LIVE
                  </div>
                )}
                <CardContent className="flex flex-col items-center justify-between w-full z-10 h-full py-10">
                  <div className="text-center">
                    <CardHeading className="text-3xl font-black mb-5 leading-10">
                      Who is live on <br /> Cripto Buzz
                    </CardHeading>
                    <p className="mt-2 text-lg opacity-95 leading-6">
                      {isLiveStreamsLoading
                        ? 'Loading live streams...'
                        : liveStreams.length === 0
                          ? 'No educators are currently live. Check back soon!'
                          : 'Join our live trading sessions and learn from experts'}
                    </p>
                  </div>

                  {isLiveStreamsLoading ? (
                    <div className="flex flex-col items-center mt-7">
                      <div className="h-34 w-34 radius-live-user overflow-hidden mb-3 bg-gray-300 animate-pulse"></div>
                      <div className="h-6 w-32 bg-gray-300 rounded animate-pulse mb-2"></div>
                      <div className="h-4 w-24 bg-gray-300 rounded animate-pulse"></div>
                    </div>
                  ) : isLiveStreamsError ? (
                    <div className="flex flex-col items-center mt-7">
                      <p className="text-red-300 text-sm">
                        Failed to load live streams
                      </p>
                    </div>
                  ) : liveStreams.length > 0 && currentLiveStream ? (
                    <div
                      className="flex flex-col items-center mt-7 w-full relative"
                      onTouchStart={onTouchStart}
                      onTouchMove={onTouchMove}
                      onTouchEnd={onTouchEnd}
                    >
                      {/* Slider Navigation - Only show if multiple educators */}
                      {liveStreams.length > 1 && (
                        <>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setCurrentLiveIndex(
                                (prev) =>
                                  (prev - 1 + liveStreams.length) %
                                  liveStreams.length,
                              );
                            }}
                            className="absolute left-2 top-1/2 -translate-y-1/2 z-20 bg-black/60 hover:bg-black/80 text-white p-2 rounded-full transition-all shadow-lg"
                            aria-label="Previous educator"
                          >
                            <ChevronLeft size={20} />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setCurrentLiveIndex(
                                (prev) => (prev + 1) % liveStreams.length,
                              );
                            }}
                            className="absolute right-2 top-1/2 -translate-y-1/2 z-20 bg-black/60 hover:bg-black/80 text-white p-2 rounded-full transition-all shadow-lg"
                            aria-label="Next educator"
                          >
                            <ChevronRight size={20} />
                          </button>
                          {/* Dots indicator */}
                          <div className="absolute bottom-16 flex gap-2 z-20">
                            {liveStreams.map((_, index) => (
                              <button
                                key={index}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setCurrentLiveIndex(index);
                                }}
                                className={`w-2.5 h-2.5 rounded-full transition-all ${
                                  index === currentLiveIndex
                                    ? 'bg-white w-6'
                                    : 'bg-white/50 hover:bg-white/70'
                                }`}
                                aria-label={`Go to slide ${index + 1}`}
                              />
                            ))}
                          </div>
                          {/* Counter */}
                          <div className="absolute top-2 right-2 z-20 bg-black/60 text-white text-xs px-2 py-1 rounded-full">
                            {currentLiveIndex + 1} / {liveStreams.length}
                          </div>
                        </>
                      )}

                      <div className="flex flex-col items-center">
                        <Link
                          to={`/client/view-profile/${currentLiveStream.educator?._id}`}
                          className="flex flex-col items-center cursor-pointer hover:opacity-90 transition-opacity"
                          onClick={(e) => {
                            // Only prevent navigation if clicking on slider navigation buttons, dots, or counter
                            const isSliderButton = e.target.closest('button[aria-label*="educator"]') || 
                                                   e.target.closest('button[aria-label*="slide"]');
                            const isCounter = e.target.closest('[class*="absolute"][class*="top-2"][class*="right-2"]');
                            
                            if (isSliderButton || isCounter) {
                              e.preventDefault();
                              e.stopPropagation();
                            }
                            // Allow navigation for image, name, and title clicks
                          }}
                        >
                          <div className="h-34 w-34 radius-live-user overflow-hidden mb-3 relative">
                            <img
                              src={
                                currentLiveStream.educator?.image ||
                                currentLiveStream.educator?.bannerImage ||
                                'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=800&auto=format&fit=crop'
                              }
                              alt={
                                currentLiveStream.educator?.first_name ||
                                'Educator'
                              }
                              className="w-full h-full object-cover transition-opacity duration-300"
                              onError={(e) => {
                                e.target.src =
                                  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=800&auto=format&fit=crop';
                              }}
                            />
                            {/* Live indicator badge */}
                          </div>
                          <h4 className="font-semibold text-lg hover:underline">
                            {currentLiveStream.educator?.first_name || ''}{' '}
                            {currentLiveStream.educator?.last_name || ''}
                          </h4>
                          <p className="text-sm text-white/90">
                            {currentLiveStream.title ||
                              currentLiveStream.schedule?.title ||
                              'Live Trading Session'}
                          </p>
                        </Link>
                      </div>
                      <button
                        onClick={() => {
                          if (!isAuthenticated) {
                            setShowLoginRequired(true);
                          } else {
                            navigate(
                              `/client/view-profile/${currentLiveStream.educator?._id}`,
                            );
                          }
                        }}
                        className="btn bg-white text-black mt-2 hover:bg-gray-100 transition-colors"
                      >
                        Watch Now
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center mt-7">
                      <div className="h-34 w-34 radius-live-user overflow-hidden mb-3">
                        <img
                          src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=800&auto=format&fit=crop"
                          alt="No live stream"
                          className="w-full h-full object-cover opacity-70"
                        />
                      </div>
                      <h4 className="font-semibold text-lg text-white/70">
                        No educators live
                      </h4>
                      <p className="text-sm text-white/60">Check back later</p>
                    </div>
                  )}
                </CardContent>
                <div className="absolute bg-gradient-yellow  inset-0 bg-gradient-green z-0"></div>
              </Card>
            </div>
          </section>

          <section className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
            <Card className="relative bg-black text-white h-[438px] p-0 overflow-hidden">
              <CardContent className="p-0">
                <div className="relative h-full">
                  <img
                    src="https://images.unsplash.com/photo-1519389950473-47ba0277781c?q=80&w=800&auto=format&fit=crop"
                    alt="live sessions"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute left-4 bottom-4 text-white z-10">
                    <h4 className=" text-2xl font-bold">
                      Cripto Buzz Live Sessions
                    </h4>
                    <p className="text-md mt-1 mb-5">
                      Join live trading sessions and webinars
                    </p>
                    <Link
                      to="/client/live"
                      className="mt-3 btn bg-transparent border border-white text-white cursor-pointer"
                    >
                      Start Learning
                    </Link>
                  </div>
                </div>
              </CardContent>
              <div className="absolute bg-gradient-black  inset-0 bg-gradient-green z-0"></div>
            </Card>

            <Card className="relative bg-black text-white h-[438px] p-0 overflow-hidden">
              <CardContent className="p-0">
                <div className="relative h-full">
                  <img
                    src="https://images.unsplash.com/photo-1559526324-593bc073d938?q=80&w=800&auto=format&fit=crop"
                    alt="trading ideas"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute left-4 bottom-4 text-white z-10">
                    <h4 className=" text-2xl font-bold">
                      Cripto Buzz Trading Ideas
                    </h4>
                    <p className="text-md mt-1 mb-5">
                      Get the latest trading ideas to help you make better
                      decisions
                    </p>
                    <Link
                      to="/client/idea"
                      className="mt-3 btn bg-transparent border border-white text-white cursor-pointer"
                    >
                      Start Learning
                    </Link>
                  </div>
                </div>
              </CardContent>
              <div className="absolute bg-gradient-black  inset-0 bg-gradient-green z-0"></div>
            </Card>

            <Card className="relative bg-black text-white h-[438px] p-0 overflow-hidden">
              <CardContent className="p-0">
                <div className="relative h-full">
                  <img
                    src="https://images.unsplash.com/photo-1519389950473-47ba0277781c?q=80&w=800&auto=format&fit=crop"
                    alt="social feed"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute left-4 bottom-4 text-white z-10">
                    <h4 className=" text-2xl font-bold">
                      Cripto Buzz Social Feed
                    </h4>
                    <p className="text-md mt-1 mb-5">
                      Follow the latest news and updates from the crypto world
                    </p>
                    <Link
                      to="/client/social"
                      className="mt-3 btn bg-transparent border border-white text-white cursor-pointer"
                    >
                      Start Learning
                    </Link>
                  </div>
                </div>
              </CardContent>
              <div className="absolute bg-gradient-black  inset-0 bg-gradient-green z-0"></div>
            </Card>
          </section>

          {/* FEED + SIDEBAR */}
          <section className="grid grid-cols-3 lg:grid-cols-3 gap-6">
            {/* Activity feed (large left) */}
            <div className="col-span-12 lg:col-span-2 rounded-2xl">
              <div className="card rounded-2xl p-6 h-full">
                {/* Header */}
                <div className="flex flex-wrap items-center justify-between mb-6 gap-3">
                  <h3 className="text-lg font-bold dark:text-white flex items-center gap-2">
                    <Activity className="w-5 h-5 text-yellow-400" />
                    Live Activity Feed
                  </h3>

                  <div className="flex gap-1 p-1 rounded-lg">
                    {/* <button
                      onClick={() => setSocialType("company")}
                      className={`
                        px-4 py-2 rounded-md text-sm font-medium transition-all
                        ${
                          socialType === "company"
                            ? "bg-purple-600 text-white shadow-md"
                            : "text-gray-600 hover:bg-gray-700/50"
                        }
                      `}
                    >
                      Corporate
                    </button> */}

                    <button
                      onClick={() => setSocialType('social')}
                      className={`
                       py-2 px-4 rounded-lg cursor-pointer bg-yellow-400 text-sm 
                      text-black
                      `}
                    >
                      Social
                    </button>
                  </div>
                </div>

                <div className="space-y-3">
                  {isPostsLoading || isFetchingPosts ? (
                    <>
                      {[1, 2, 3, 4, 5].map((i) => (
                        <div
                          key={i}
                          className="flex items-center gap-3 p-3 rounded-xl bg-gray-500 animate-pulse"
                        >
                          <div className="w-10 h-10 rounded-full bg-gray-300 dark:bg-gray-700/40"></div>

                          <div className="flex-1 space-y-2">
                            <div className="flex items-center justify-between">
                              <div className="w-24 h-4 bg-gray-300 dark:bg-gray-700/40 rounded"></div>
                              <div className="w-14 h-4 bg-gray-300 dark:bg-gray-700/40 rounded"></div>
                            </div>

                            <div className="w-full h-4 bg-gray-300 dark:bg-gray-700/40 rounded"></div>

                            <div className="w-3/4 h-4 bg-gray-300 dark:bg-gray-700/40 rounded"></div>
                          </div>

                          <div className="w-4 h-4 bg-gray-300 dark:bg-gray-700/40 rounded"></div>
                        </div>
                      ))}
                    </>
                  ) : isPostsError ? (
                    <div className="text-center py-10 text-red-500">
                      <p className="mb-2">Failed to load social feed</p>
                      <p className="text-sm text-gray-500">
                        Please try again later
                      </p>
                    </div>
                  ) : posts.length > 0 ? (
                    posts.map((post) => (
                      <div
                        key={post._id}
                        className="flex items-center gap-3 p-3 bg-gray-100 dark:bg-gray-900 rounded-xl hover:bg-gray-100 transition cursor-pointer"
                        onClick={() =>
                          navigate(`/client/social?socialType=${socialType}`)
                        }
                      >
                        <div className="relative">
                          <img
                            src={post.author?.image || '/media/avatars/1.png'}
                            alt={post.author?.first_name || 'IQNOIC'}
                            className="w-10 h-10 rounded-full object-cover"
                            onError={(e) => {
                              e.target.src = '/media/avatars/1.png';
                            }}
                          />
                        </div>

                        <div className="flex-1">
                          <div className="flex items-center justify-between ">
                            <p className="dark:text-white font-medium text-[11px]">
                              {post.author?.first_name || 'IQNOIC'}{' '}
                              {post.author?.last_name || 'EDUCATOR'}
                            </p>
                            <p className="text-xs text-gray-600 dark:text-gray-400 font-medium text-[11px]">
                              {timeAgo(post.createdAt || new Date())}
                            </p>
                          </div>

                          <p className="text-xs text-gray-700 dark:text-gray-300 mt-1 font-medium text-[14px]">
                            {getShortContent(post.content)}
                            {htmlToPlainText(post.content).length > 120 && (
                              <span
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigate(
                                    `/client/social?socialType=${socialType}`,
                                  );
                                }}
                                className="ml-1 text-yellow-600 dark:text-yellow-400 font-medium cursor-pointer"
                              >
                                See more
                              </span>
                            )}
                          </p>
                        </div>

                        <ChevronRight className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-10 text-gray-500 dark:text-gray-400">
                      No posts available right now.
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right Sidebar */}
            <div className="col-span-12 lg:col-span-1">
              <aside className="space-y-6 mb-5">
                <Card className="p-4">
                  <CardHeader className="!p-0 min-h-0 !pb-3 mb-3">
                    <CardTitle>Connect With Us</CardTitle>
                  </CardHeader>
                  <CardContent className="!p-0">
                    <div className="rounded-md p-3 bg-blue-100 text-black flex items-center gap-3">
                      <div className="h-10 w-10 rounded-md bg-blue-700 text-white flex items-center justify-center">
                        C
                      </div>
                      <div>
                        <p className="text-sm font-medium">
                          Follow Cripto Buzz
                        </p>
                        <p className="text-xs text-gray-500">@criptobuzz</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="p-4 ">
                  <CardHeader className="!p-0 min-h-0 !pb-3 mb-3">
                    <CardTitle>Download our Apps</CardTitle>
                  </CardHeader>
                  <CardContent className="!p-0">
                    <div className="flex flex-col gap-3">
                      <div className="flex items-center gap-3 bg-[#fbf6e6] rounded-md p-3">
                        <div className="h-10 w-10 rounded-md bg-black text-white flex items-center justify-center">
                          C
                        </div>
                        <div>
                          <p className="text-sm font-medium dark:text-gray-900">
                            Cripto Buzz App
                          </p>
                          <p className="text-xs text-gray-500">Users</p>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <img
                          src="https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg"
                          alt="play"
                          className="h-8"
                        />
                        <img
                          src="https://developer.apple.com/assets/elements/badges/download-on-the-app-store.svg"
                          alt="appstore"
                          className="h-8"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="p-4">
                  <CardHeader className="!p-0 min-h-0 !pb-3 mb-3">
                    <CardTitle>Ideas and Analysis</CardTitle>
                  </CardHeader>
                  <CardContent className="!p-0">
                    <div className="space-y-3">
                      <Link
                        to="/client/idea"
                        className="rounded-md p-3 bg-yellow-400 text-black flex items-center gap-3"
                      >
                        <div className="h-10 w-10 rounded-md bg-black text-white flex items-center justify-center">
                          C
                        </div>
                        <p>Cripto Ideas</p>
                      </Link>
                      <Link
                        to="/client/insight"
                        className="rounded-md p-3 bg-yellow-400 text-black flex items-center gap-3"
                      >
                        <div className="h-10 w-10 rounded-md bg-black text-white flex items-center justify-center">
                          C
                        </div>
                        <p>Cripto Insight</p>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              </aside>
            </div>
          </section>
        </main>
      </div>

      {/* Login Required Modal/Dialog */}
      {showLoginRequired && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full p-6 relative">
            <button
              onClick={() => setShowLoginRequired(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-xl font-bold w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              aria-label="Close"
            >
              ×
            </button>
            <LoginRequired
              onLogin={() => {
                setShowLoginRequired(false);
                navigate('/login');
              }}
            />
          </div>
        </div>
      )}
    </>
  );
}