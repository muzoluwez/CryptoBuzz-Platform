import React, { useState } from 'react';
import { Play, Calendar } from 'lucide-react';
import { Card } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import EducatorLiveStreamView from './EducatorLiveStreamView';
import RatingModal from './RatingModel';
import { useParams } from 'react-router';

export default function ViewProfile() {
    const { id: educatorId } = useParams();
    const [isRatingModalOpen, setIsRatingModalOpen] = useState(false);

    const courses = [
        {
            id: 1,
            title: 'BTC accelerator al trading',
            image: 'crypto-Courses',
            category: 'CRYPTO COURSES'
        },
        {
            id: 2,
            title: 'BTC trading accelerator bootcamp',
            image: 'day-trading',
            category: '3-DAY BIG TRADING'
        }
    ];

    const ideas = [
        {
            id: 1,
            pair: 'BTC/USD',
            type: 'Position call out',
            chart: 'chart1'
        },
        {
            id: 2,
            pair: 'BTC/USD',
            type: 'BTC live idea',
            chart: 'chart2'
        },
        {
            id: 3,
            pair: 'BTC/USD',
            type: 'BTC potential consolidation features ride 10th pause',
            chart: 'chart3'
        }
    ];

    const insights = [
        {
            id: 1,
            title: 'BTC hit tp #1',
            description: 'BTC taking rally and it´s late time to build some portfolio',
            chart: 'insight1'
        },
        {
            id: 2,
            title: 'BTC in profits',
            description: 'We HS trade with us SBs, last time to move its Sx for profit follow More',
            chart: 'insight2'
        },
        {
            id: 3,
            title: 'Checking BTC ideas',
            description: 'Explained BTC idea as price never hit parts',
            chart: 'insight3'
        }
    ];

    const recordings = [
        {
            id: 1,
            title: 'Analisis live BTC',
            date: '09/12/2025'
        },
        {
            id: 2,
            title: 'BTC live trading',
            date: '08/11/2025'
        },
        {
            id: 3,
            title: 'Analisi live BTC',
            date: '05/12/2025'
        }
    ];

    const liveFeed = [
        {
            id: 1,
            user: 'Filipe Forner',
            time: 'about 13 hours ago',
            content: 'Stering live in italiano!',
            type: 'status'
        },
        {
            id: 2,
            user: 'Filipe Forner',
            time: '4 days ago',
            content: 'Scalping session starts in 15 minutes! Come hang out and check out the views 📊📈',
            type: 'status'
        },
        {
            id: 3,
            user: 'Filipe Forner',
            time: '5 days ago',
            content: 'Stering live in italiano!',
            type: 'status'
        }
    ];

    const analysisUpdates = [
        {
            id: 1,
            user: 'Filipe Forner',
            time: '1 week ago',
            content: 'The market left without achieving our entry. Deleting idea'
        },
        {
            id: 2,
            user: 'Filipe Forner',
            time: '1w days ago',
            content: 'Both sell ans from our idea session hit tp1! Took of 2200 pos for at 1.3 B and 3.3 took in ronuarii\n\nSee you on landmarketxw 📊'
        },
        {
            id: 3,
            user: 'Filipe Forner',
            time: '2w days ago',
            content: ''
        }
    ];

    const callId = 'livestream';


    return (
        <div className="container my-6">
            <div className="w-full bg-gradient-to-r from-[#a76100] via-[#a76100] to-[#a76100] p-6 rounded-2xl flex items-center justify-between shadow-lg mb-6">

                {/* LEFT SECTION — Profile */}
                <div className="flex items-center gap-4">
                    <img
                        src="https://i.pravatar.cc/150?img=12"
                        alt="creator"
                        className="w-16 h-16 rounded-full border-2 border-white shadow-md"
                    />
                    <h2 className="text-lg font-semibold text-white">Filipe Forner</h2>
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
                        <button className="px-4 py-2 bg-[#ffcd0b] text-dark rounded-lg text-sm flex items-center gap-1 shadow-md">
                            🔊
                        </button>

                        {/* Share Button */}
                        <button className="px-4 py-2 bg-[#ffcd0b] text-dark rounded-lg text-sm flex items-center gap-2 shadow-md">
                            <span>🔗</span> Share
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
            <div className="grid grid-cols-12 gap-y-6 mb-8">
                <div className="col-span-12 xl:col-span-12 space-y-8">
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
                            {courses.map((course) => (
                                <div key={course.id} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden hover:shadow-lg transition-shadow">
                                    <div className={`h-32 relative ${course.image === 'crypto-courses'
                                        ? 'bg-gradient-to-br from-yellow-400 to-yellow-600'
                                        : 'bg-gradient-to-br from-blue-500 to-blue-700'
                                        }`}>
                                        <div className="absolute left-0 top-0 bottom-0 w-1/2 overflow-hidden">
                                            <div className={`absolute left-0 top-1/2 -translate-y-1/2 w-32 h-32 rounded-full opacity-40 -translate-x-1/2 ${course.image === 'crypto-Courses' ? 'bg-yellow-300' : 'bg-blue-400'
                                                }`}></div>
                                        </div>
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <div className="text-center text-white">
                                                <p className="text-xs tracking-wider mb-1 font-semibold">{course.category}</p>
                                                <p className="text-2xl font-bold">
                                                    {course.image === 'crypto-Courses' ? 'ITALIAN' : 'ACCELERATORS'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="p-4">
                                        <p className="text-sm text-gray-700 font-medium dark:text-white">{course.title}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card>

                    {/* Ideas Section */}
                    <Card className="rounded-2xl p-6 shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-gray-900 dark:text-gray-200 text-xl font-bold">Idea</h3>
                            <button className="text-primary text-sm hover:text-yellow-500 font-medium cursor-pointer">View All →</button>
                        </div>
                        <div className="grid grid-col-12 sm:grid-cols-3 gap-4">
                            {ideas.map((idea) => (
                                <div key={idea.id} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden hover:shadow-lg transition-shadow">
                                    <div className="h-32 bg-gray-900 relative">
                                        <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-red-500/10">
                                            <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                                                <polyline
                                                    points="0,80 20,60 40,70 60,40 80,50 100,30"
                                                    fill="none"
                                                    stroke={idea.id === 2 ? "#22c55e" : "#ef4444"}
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
                                    <div className="p-4">
                                        <p className="font-bold text-gray-900 dark:text-white">{idea.pair}</p>
                                        <p className="text-xs text-gray-600 mt-1 dark:text-gray-300">{idea.type}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card>

                    {/* Insights Section */}
                    <Card className="rounded-2xl p-6 shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-gray-900 dark:text-gray-200 text-xl font-bold">Insights</h3>
                            <button className="text-primary text-sm hover:text-yellow-500 font-medium cursor-pointer">View All →</button>
                        </div>
                        <div className="grid grid-col-12 sm:grid-cols-3 gap-4">
                            {insights.map((insight) => (
                                <div key={insight.id} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden hover:shadow-lg transition-shadow">
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
                                                {insight.id === 2 && (
                                                    <polyline
                                                        points="5,45 25,40 45,50 65,30 85,35"
                                                        fill="none"
                                                        stroke="#22c55e"
                                                        strokeWidth="1.5"
                                                    />
                                                )}
                                            </svg>
                                        </div>
                                    </div>
                                    <div className="p-4">
                                        <p className="font-bold text-gray-900 text-sm dark:text-white">{insight.title}</p>
                                        <p className="text-xs text-gray-600 mt-2 line-clamp-2 dark:text-gray-300">{insight.description}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card>

                    {/* Recordings Section */}
                    <Card className="rounded-2xl p-6 shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-gray-900 dark:text-gray-200 text-xl font-bold">Recordings</h3>
                            <button className="text-primary text-sm hover:text-yellow-500 font-medium cursor-pointer">View All →</button>
                        </div>
                        <div className="grid grid-col-12 sm:grid-cols-3 gap-4">
                            {recordings.map((recording) => (
                                <div key={recording.id} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden hover:shadow-lg transition-shadow">
                                    <div className="h-40 bg-gradient-to-br from-yellow-600 via-yellow-700 to-yellow-900 relative">
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition-colors cursor-pointer">
                                                <Play className="w-8 h-8 text-white fill-white ml-1" />
                                            </div>
                                        </div>
                                        <div className="absolute bottom-3 right-3 text-right">
                                            <p className="text-white text-sm font-bold">FILIPE</p>
                                            <p className="text-white text-sm font-bold">FORNER</p>
                                        </div>
                                    </div>
                                    <div className="p-4">
                                        <p className="text-sm font-medium text-gray-900 mb-2 dark:text-white">{recording.title}</p>
                                        <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-300">
                                            <Calendar className="w-4 h-4" />
                                            {recording.date}
                                        </div>
                                    </div>
                                </div>
                            ))}
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
                        {/* Live Feed */}
                        <Card className="rounded-2xl p-6 shadow-sm">
                            <h3 className="text-gray-900 dark:text-white text-lg font-bold mb-4">Live Feed</h3>
                            <div className="space-y-4">
                                {liveFeed.map((feed) => (
                                    <div key={feed.id} className="flex gap-3 pb-4 border-b border-gray-100 dark:border-gray-700 last:border-b-0 last:pb-0">
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                                            FF
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-gray-900 text-sm font-semibold dark:text-white">{feed.user}</p>
                                            <p className="text-gray-500 text-xs mb-1 dark:text-gray-400">{feed.time}</p>
                                            <p className="text-gray-700 text-sm dark:text-gray-400">{feed.content}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </Card>

                        {/* Analysis Updates */}
                        <Card className="rounded-2xl p-6 shadow-sm">
                            <h3 className="text-gray-900 dark:text-white text-lg font-bold mb-4">Analysis Updates</h3>
                            <div className="space-y-4">
                                {analysisUpdates.map((update) => (
                                    <div key={update.id} className="flex gap-3 pb-4 border-b border-gray-100 dark:border-gray-700 last:border-b-0 last:pb-0">
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-500 to-yellow-700 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                                            FF
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-gray-900 text-sm font-semibold dark:text-white">{update.user}</p>
                                            <p className="text-gray-500 text-xs mb-1 dark:text-gray-400">{update.time}</p>
                                            {update.content && (
                                                <p className="text-gray-700 text-sm dark:text-gray-400">{update.content}</p>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </Card>
                    </div>
                </div>
            </div>

            {/* Rating Modal */}
            <RatingModal
                isOpen={isRatingModalOpen}
                onClose={() => setIsRatingModalOpen(false)}
                educatorId={educatorId}
            />
        </div>
    );
}