import React, { useState, useMemo } from 'react';
import { Play, Calendar, Loader2, Share2 } from 'lucide-react';
import { toast } from 'sonner';
import { Card } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import EducatorLiveStreamView from './EducatorLiveStreamView';
import RatingModal from './RatingModel';
import VideoPlayerModal from './VideoPlayerModal';
import { useParams } from 'react-router';
import { useGetEducatorDetailsQuery } from '../../../store/client/clientEducatorApiSlice';
import { formatDistanceToNow } from 'date-fns';

export default function ViewProfile() {
    const { id: educatorId } = useParams();
    const [isRatingModalOpen, setIsRatingModalOpen] = useState(false);
    const [selectedRecording, setSelectedRecording] = useState(null);
    const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);

    // Fetch educator details
    const { data, isLoading, isError, error } = useGetEducatorDetailsQuery(educatorId, {
        skip: !educatorId,
    });

    // Extract data from response
    const educatorData = data?.data || {};
    const {
        educator = {},
        courses = [],
        ideas = [],
        insights = [],
        recordings = [],
        liveFeed = [], // General Updates posts (category: "General Updates")
        analysisUpdates = [], // Analysis Updates posts (category: "Analysis Updates")
    } = educatorData;

    // Filter to ensure correct categories are displayed in the right sections
    // Live Feed should show only "General Updates"
    const generalUpdates = liveFeed.filter(post =>
        post.category === 'General Updates' || !post.category
    );

    // Analysis Updates should show only "Analysis Updates"
    const analysisUpdatesFiltered = analysisUpdates.filter(post =>
        post.category === 'Analysis Updates'
    );

    // Get user initials
    const getUserInitials = (user) => {
        if (user?.first_name && user?.last_name) {
            return `${user?.first_name?.[0] || ''}${user?.last_name?.[0] || ''}`.toUpperCase();
        }
        if (user?.name) {
            const names = user.name?.split(' ') || [];
            if (names.length >= 2) {
                return `${names[0]?.[0] || ''}${names[1]?.[0] || ''}`.toUpperCase();
            }
            return user.name?.[0]?.toUpperCase() || 'U';
        }
        return 'U';
    };

    // Format date
    const formatDate = (dateString) => {
        if (!dateString) return '';
        try {
            return formatDistanceToNow(new Date(dateString), { addSuffix: true });
        } catch {
            return dateString;
        }
    };

    // Format recording date
    const formatRecordingDate = (dateString) => {
        if (!dateString) return '';
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
        } catch {
            return dateString;
        }
    };

    // Get educator name
    const educatorName = useMemo(() => {
        if (educator?.first_name && educator?.last_name) {
            return `${educator?.first_name || ''} ${educator?.last_name || ''}`.trim();
        }
        return educator?.name || educator?.email?.split('@')?.[0] || 'Educator';
    }, [educator]);

    // Handle share functionality
    const handleShare = () => {
        const currentUrl = window.location.href;
        navigator.clipboard
            .writeText(currentUrl)
            .then(() => {
                toast.success('Profile link copied to clipboard!');
            })
            .catch((err) => {
                console.error('Failed to copy URL:', err);
                toast.error('Failed to copy link. Please try again.');
            });
    };

    // Loading state
    if (isLoading) {
        return (
            <div className="container my-6 flex items-center justify-center min-h-[400px]">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    // Error state
    if (isError) {
        return (
            <div className="container my-6">
                <Card className="p-6 text-center">
                    <p className="text-red-500">Error loading educator details. Please try again later.</p>
                    {error && <p className="text-sm text-gray-500 mt-2">{error?.data?.message || error?.message}</p>}
                </Card>
            </div>
        );
    }



    return (
        <div className="container my-6">
            <div className="w-full bg-gradient-to-r from-[#a76100] via-[#a76100] to-[#a76100] p-6 rounded-2xl flex items-center justify-between shadow-lg mb-6">

                {/* LEFT SECTION — Profile */}
                <div className="flex items-center gap-4">
                    {educator?.image ? (
                        <img
                            src={educator?.image}
                            alt={educatorName}
                            className="w-16 h-16 rounded-full border-2 border-white shadow-md object-cover"
                            onError={(e) => {
                                if (e?.target) {
                                    e.target.style.display = 'none';
                                    if (e.target?.nextSibling) {
                                        e.target.nextSibling.style.display = 'flex';
                                    }
                                }
                            }}
                        />
                    ) : null}
                    <div
                        className={`w-16 h-16 rounded-full border-2 border-white shadow-md bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center text-white text-xl font-bold ${educator?.image ? 'hidden' : ''}`}
                    >
                        {getUserInitials(educator)}
                    </div>
                    <h2 className="text-lg font-semibold text-white">{educatorName}</h2>
                </div>

                {/* MIDDLE — Volume Control */}
                {/* <div className="hidden md:flex items-center gap-3 bg-white/10 backdrop-blur-md border border-white/20 px-4 py-2 rounded-lg">

                    <span className="text-white text-lg">🔊</span>

                    <button className="text-white text-xl font-bold hover:text-blue-300">−</button>

                    <input
                        type="range"
                        min="0"
                        max="100"
                        defaultValue="60"
                        className="w-32 accent-yellow-400"
                    />

                    <button className="text-white text-xl font-bold hover:text-blue-300">＋</button>
                </div> */}

                {/* RIGHT SECTION — Buttons */}
                <div className="flex flex-col items-end gap-3">

                    <div className="flex gap-3">
                        {/* Sound Button */}
                        {/* <button className="px-4 py-2 bg-[#ffcd0b] text-dark rounded-lg text-sm flex items-center gap-1 shadow-md">
                            🔊
                        </button> */}

                        {/* Share Button */}
                        <button 
                            onClick={handleShare}
                            className="px-4 py-2 bg-[#ffcd0b] text-dark rounded-lg text-sm flex items-center gap-2 shadow-md hover:bg-yellow-500 transition-colors"
                        >
                            <Share2 size={16} />
                            Share
                        </button>
                    </div>

                    {/* Rate Me Button */}
                    <Button
                        onClick={() => setIsRatingModalOpen(true)}
                        variant="primary"
                        size="md"
                        className="px-5 py-2 bg-[#ffcd0b] text-dark rounded-lg text-sm flex items-center gap-2 shadow-md hover:bg-yellow-500 transition-colors"
                    >
                        ⭐ Rate Me
                    </Button>

                </div>
            </div>
            {/* Live Stream Section */}
            <div className="grid grid-cols-12 gap-y-8 md:gap-x-8">
                <div className="col-span-12 xl:col-span-12 space-y-8 mb-8">
                    <EducatorLiveStreamView />
                </div>
            </div>

            <div className="grid grid-cols-3 gap-6">
                {/* Main Content Area */}
                <div className="col-span-12 lg:col-span-2 space-y-6">
                    <Card className="rounded-2xl p-6 shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-gray-900 dark:text-gray-200 text-xl font-bold">Courses</h3>
                            <button className="text-primary text-sm hover:text-yellow-500 font-medium cursor-pointer">View All →</button>
                        </div>
                        <div className="grid grid-col-12 sm:grid-cols-2 gap-4">
                            {courses.length > 0 ? (
                                courses.slice(0, 2).map((course) => (
                                    <div key={course?._id || course?.id} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden hover:shadow-lg transition-shadow">
                                        {course?.imageUrl ? (
                                            <div className="h-32 relative">
                                                <img
                                                    src={course?.imageUrl}
                                                    alt={course?.title || 'Course'}
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                        ) : (
                                            <div className={`h-32 relative bg-gradient-to-br from-yellow-400 to-yellow-600`}>
                                                <div className="absolute left-0 top-0 bottom-0 w-1/2 overflow-hidden">
                                                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-32 h-32 rounded-full opacity-40 -translate-x-1/2 bg-yellow-300"></div>
                                                </div>
                                                <div className="absolute inset-0 flex items-center justify-center">
                                                    <div className="text-center text-white">
                                                        <p className="text-xs tracking-wider mb-1 font-semibold">{course?.category?.name || 'COURSE'}</p>
                                                        <p className="text-2xl font-bold">COURSE</p>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                        <div className="p-4">
                                            <p className="text-sm text-gray-700 font-medium dark:text-white">{course?.title || 'Course'}</p>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-gray-500 dark:text-gray-400 col-span-2">No courses available</p>
                            )}
                        </div>
                    </Card>

                    {/* Ideas Section */}
                    <Card className="rounded-2xl p-6 shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-gray-900 dark:text-gray-200 text-xl font-bold">Idea</h3>
                            <button className="text-primary text-sm hover:text-yellow-500 font-medium cursor-pointer">View All →</button>
                        </div>
                        <div className="grid grid-col-12 sm:grid-cols-3 gap-4">
                            {ideas.length > 0 ? (
                                ideas.slice(0, 3).map((idea, index) => (
                                    <div key={idea?._id || idea?.id} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden hover:shadow-lg transition-shadow">
                                        {idea?.image_Url || (idea?.image && idea.image?.length > 0) ? (
                                            <div className="h-32 relative">
                                                <img
                                                    src={idea?.image_Url || idea?.image?.[0]}
                                                    alt={idea?.name || 'Idea'}
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                        ) : (
                                            <div className="h-32 bg-gray-900 relative">
                                                <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-red-500/10">
                                                    <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                                                        <polyline
                                                            points="0,80 20,60 40,70 60,40 80,50 100,30"
                                                            fill="none"
                                                            stroke={idea?.type === 'buy' ? "#22c55e" : "#ef4444"}
                                                            strokeWidth="2"
                                                        />
                                                        <polyline
                                                            points="0,70 25,55 50,60 75,35 100,40"
                                                            fill="none"
                                                            stroke="#ffcd0b"
                                                            strokeWidth="1.5"
                                                            opacity="0.5"
                                                        />
                                                    </svg>
                                                </div>
                                            </div>
                                        )}
                                        <div className="p-4">
                                            <p className="font-bold text-gray-900 dark:text-white">{idea?.name || 'Idea'}</p>
                                            <p className="text-xs text-gray-600 mt-1 dark:text-gray-300">{idea?.type || idea?.description?.substring(0, 50) || ''}</p>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-gray-500 dark:text-gray-400 col-span-3">No ideas available</p>
                            )}
                        </div>
                    </Card>

                    {/* Insights Section */}
                    <Card className="rounded-2xl p-6 shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-gray-900 dark:text-gray-200 text-xl font-bold">Insights</h3>
                            <button className="text-primary text-sm hover:text-yellow-500 font-medium cursor-pointer">View All →</button>
                        </div>
                        <div className="grid grid-col-12 sm:grid-cols-3 gap-4">
                            {insights.length > 0 ? (
                                insights.slice(0, 3).map((insight) => (
                                    <div key={insight?._id || insight?.id} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden hover:shadow-lg transition-shadow">
                                        {insight?.photos && insight.photos?.length > 0 ? (
                                            <div className="h-32 relative">
                                                <img
                                                    src={insight?.photos?.[0]}
                                                    alt={insight?.title || 'Insight'}
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                        ) : (
                                            <div className="h-32 bg-gray-900 relative">
                                                <div className="absolute inset-0">
                                                    <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                                                        <polyline
                                                            points="0,50 20,45 40,55 60,35 80,40 100,25"
                                                            fill="none"
                                                            stroke="#ef4444"
                                                            strokeWidth="2"
                                                        />
                                                        <polyline
                                                            points="10,60 30,50 50,65 70,45 90,50"
                                                            fill="none"
                                                            stroke="#ffcd0b"
                                                            strokeWidth="1.5"
                                                            opacity="0.6"
                                                        />
                                                    </svg>
                                                </div>
                                            </div>
                                        )}
                                        <div className="p-4">
                                            <p className="font-bold text-gray-900 text-sm dark:text-white">{insight?.title || 'Insight'}</p>
                                            <p className="text-xs text-gray-600 mt-2 line-clamp-2 dark:text-gray-300">{insight?.description?.substring(0, 100) || ''}</p>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-gray-500 dark:text-gray-400 col-span-3">No insights available</p>
                            )}
                        </div>
                    </Card>

                </div>
                {/* Right Sidebar */}
                <div className="col-span-12 lg:col-span-1 mb-6">
                    <div className="space-y-6">
                        {/* About Me */}
                        {/* <Card className="rounded-2xl p-6 shadow-sm h-full">
                            <h3 className="text-gray-900 dark:text-gray-200 text-lg font-bold mb-4">About Me</h3>
                            <div className="bg-white dark:bg-gray-900 rounded-lg p-4 text-gray-700 text-sm border border-gray-200">
                                <p>Professional crypto trader and educator specializing in BTC analysis and trading strategies.</p>
                            </div>
                        </Card> */}
                        {/* Live Feed - General Updates */}
                        <Card className="rounded-2xl p-6 shadow-sm">
                            <h3 className="text-gray-900 dark:text-white text-lg font-bold mb-4">Live Feed</h3>
                            <div className="space-y-4">
                                <div className='h-[300px] overflow-y-auto'>
                                    {generalUpdates.length > 0 ? (
                                        generalUpdates.map((feed) => {
                                            const author = feed?.author || {};
                                            const authorName = author?.first_name && author?.last_name
                                                ? `${author?.first_name || ''} ${author?.last_name || ''}`.trim()
                                                : author?.name || 'User';
                                            return (
                                                <div key={feed?._id || feed?.id} className="flex gap-3 pb-4 border-b border-gray-100 dark:border-gray-700 last:border-b-0 last:pb-0">
                                                    {author?.image ? (
                                                        <img
                                                            src={author.image}
                                                            alt={authorName}
                                                            className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                                                        />
                                                    ) : (
                                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                                                            {getUserInitials(author)}
                                                        </div>
                                                    )}
                                                    <div className="flex-1">
                                                        <p className="text-gray-900 text-sm font-semibold dark:text-white">{authorName}</p>
                                                        <p className="text-gray-500 text-xs mb-1 dark:text-gray-400">{formatDate(feed?.createdAt)}</p>
                                                        <p className="text-gray-700 text-sm dark:text-gray-400">{feed?.content || ''}</p>
                                                    </div>
                                                </div>
                                            );
                                        })
                                    ) : (
                                        <p className="text-gray-500 dark:text-gray-400 text-sm">No live feed available</p>
                                    )}
                                </div>
                            </div>
                        </Card>

                        {/* Analysis Updates - Analysis Updates category */}
                        <Card className="rounded-2xl p-6 shadow-sm">
                            <h3 className="text-gray-900 dark:text-white text-lg font-bold mb-4">Analysis Updates</h3>
                            <div className="space-y-4">
                                <div className='h-[300px] overflow-y-auto'>
                                    {analysisUpdatesFiltered.length > 0 ? (
                                        analysisUpdatesFiltered.map((update) => {
                                            const author = update?.author || {};
                                            const authorName = author?.first_name && author?.last_name
                                                ? `${author?.first_name || ''} ${author?.last_name || ''}`.trim()
                                                : author?.name || 'User';
                                            return (
                                                <div key={update?._id || update?.id} className="flex gap-3 pb-4 border-b border-gray-100 dark:border-gray-700 last:border-b-0 last:pb-0">
                                                    {author?.image ? (
                                                        <img
                                                            src={author.image}
                                                            alt={authorName}
                                                            className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                                                        />
                                                    ) : (
                                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-500 to-yellow-700 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                                                            {getUserInitials(author)}
                                                        </div>
                                                    )}
                                                    <div className="flex-1">
                                                        <p className="text-gray-900 text-sm font-semibold dark:text-white">{authorName}</p>
                                                        <p className="text-gray-500 text-xs mb-1 dark:text-gray-400">{formatDate(update?.createdAt)}</p>
                                                        {update?.content && (
                                                            <p className="text-gray-700 text-sm dark:text-gray-400">{update?.content || ''}</p>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })
                                    ) : (
                                        <p className="text-gray-500 dark:text-gray-400 text-sm">No analysis updates available</p>
                                    )}
                                </div>
                            </div>
                        </Card>
                    </div>
                </div>
            </div>
            {/* Recordings Section */}
            <Card className="rounded-2xl p-6 shadow-sm mt-8">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-gray-900 dark:text-gray-200 text-xl font-bold">Recordings</h3>
                    <button className="text-primary text-sm hover:text-yellow-500 font-medium cursor-pointer">View All →</button>
                </div>
                <div className="grid grid-col-12 sm:grid-cols-3 gap-4">
                    {recordings.length > 0 ? (
                        recordings.slice(0, 3).map((recording) => (
                            <div 
                                key={recording?._id || recording?.id} 
                                className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                                onClick={() => {
                                    if (recording?.videoUrl) {
                                        setSelectedRecording(recording);
                                        setIsVideoModalOpen(true);
                                    }
                                }}
                            >
                                <div className="h-40 bg-gradient-to-br from-yellow-600 via-yellow-700 to-yellow-900 relative">
                                    {recording?.thumbnail && (
                                        <img
                                            src={recording?.thumbnail}
                                            alt={recording?.call_title || 'Recording'}
                                            className="w-full h-full object-cover absolute inset-0"
                                        />
                                    )}
                                    <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                                        <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition-colors">
                                            <Play className="w-8 h-8 text-white fill-white ml-1" />
                                        </div>
                                    </div>
                                    <div className="absolute bottom-3 right-3 text-right">
                                        <p className="text-white text-sm font-bold">{educator?.first_name?.toUpperCase() || ''}</p>
                                        <p className="text-white text-sm font-bold">{educator?.last_name?.toUpperCase() || ''}</p>
                                    </div>
                                </div>
                                <div className="p-4">
                                    <p className="text-sm font-medium text-gray-900 mb-2 dark:text-white">{recording?.call_title || 'Recording'}</p>
                                    <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-300">
                                        <Calendar className="w-4 h-4" />
                                        {formatRecordingDate(recording?.start_time || recording?.createdAt)}
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className="text-gray-500 dark:text-gray-400 col-span-3">No recordings available</p>
                    )}
                </div>
            </Card>

            {/* Rating Modal */}
            <RatingModal
                isOpen={isRatingModalOpen}
                onClose={() => setIsRatingModalOpen(false)}
                educatorId={educatorId}
            />

            {/* Video Player Modal */}
            <VideoPlayerModal
                open={isVideoModalOpen}
                onOpenChange={setIsVideoModalOpen}
                videoUrl={selectedRecording?.videoUrl}
                data={selectedRecording}
            />
        </div>
    );
}