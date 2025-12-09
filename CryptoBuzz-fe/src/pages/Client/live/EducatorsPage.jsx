import React, { useState } from 'react'
import { Card } from '../../../components/ui/card';
import { useNavigate } from 'react-router';
import { Search, Eye, Check, Plus, ChevronDown } from 'lucide-react';

const EducatorsPage = () => {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('All');
  const [selectedCategory, setSelectedCategory] = useState('Select Category');
  const [searchQuery, setSearchQuery] = useState('');
  const [followingIds, setFollowingIds] = useState([1]);

  const educators = [
    {
      id: 1,
      name: 'Filipe Forner',
      title: 'FILIPE FORNER',
      subtitle: 'CRYPTO EDUCATOR',
      category: 'Crypto',
      specialty: 'Smart Money',
      description: 'BTC scalper and intra day trader. Leverages low time frames for higher risk/reward set ups.',
      courses: 4,
      tradeIdeas: 17,
      insights: 5,
      gradient: 'from-yellow-600 to-yellow-900',
      bgPattern: 'yellow'
    },
    {
      id: 2,
      name: 'Kevin Barquero',
      title: 'KEVIN BARQUERO',
      subtitle: 'CRYPTO EDUCATOR',
      category: 'Crypto',
      specialty: 'Intra-Day',
      description: 'Price Action / Fibonacci Technical Analysis',
      courses: 0,
      tradeIdeas: 5,
      insights: 4,
      gradient: 'from-yellow-600 to-yellow-900',
      bgPattern: 'yellow'
    },
    {
      id: 3,
      name: 'Ralph Danquah',
      title: 'RALPH DANQUAH',
      subtitle: 'FOREX EDUCATOR',
      category: 'Forex',
      specialty: 'Intra-Day - Supernova',
      description: 'Ralph, 10-year FX trader, specializes in day trading and price action; teaches with clarity using tools like Supernova.',
      courses: 2,
      tradeIdeas: 17,
      insights: 86,
      gradient: 'from-blue-700 to-blue-950',
      bgPattern: 'blue'
    },
    {
      id: 4,
      name: 'Sarah Mitchell',
      title: 'SARAH MITCHELL',
      subtitle: 'DIGITAL MARKETING EDUCATOR',
      category: 'Digital Marketing',
      specialty: 'Yield Farming',
      description: 'Digital Marketing specialist focusing on yield optimization and liquidity provision strategies.',
      courses: 3,
      tradeIdeas: 12,
      insights: 24,
      gradient: 'from-green-600 to-green-900',
      bgPattern: 'green'
    },
    {
      id: 5,
      name: 'Marcus Chen',
      title: 'MARCUS CHEN',
      subtitle: 'CRYPTO EDUCATOR',
      category: 'Crypto',
      specialty: 'Swing Trading',
      description: 'Long-term crypto investor and swing trader with focus on altcoins and market cycles.',
      courses: 5,
      tradeIdeas: 23,
      insights: 15,
      gradient: 'from-purple-600 to-purple-900',
      bgPattern: 'purple'
    },
    {
      id: 6,
      name: 'Emily Rodriguez',
      title: 'EMILY RODRIGUEZ',
      subtitle: 'FOREX EDUCATOR',
      category: 'Forex',
      specialty: 'Scalping',
      description: 'Professional forex scalper specializing in major pairs and high-frequency trading.',
      courses: 6,
      tradeIdeas: 31,
      insights: 42,
      gradient: 'from-blue-700 to-blue-950',
      bgPattern: 'blue'
    }
  ];

  const categories = ['Select Category', 'Crypto', 'Forex', 'Digital Marketing'];

  const handleFollow = (id) => {
    if (followingIds.includes(id)) {
      setFollowingIds(followingIds.filter(fId => fId !== id));
    } else {
      setFollowingIds([...followingIds, id]);
    }
  };

  const filteredEducators = educators.filter(educator => {
    const matchesTab = activeTab === 'All' ||
      (activeTab === 'Following' && followingIds.includes(educator.id));
    const matchesCategory = selectedCategory === 'Select Category' ||
      educator.category === selectedCategory;
    const matchesSearch = educator.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      educator.specialty.toLowerCase().includes(searchQuery.toLowerCase()) ||
      educator.description.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesTab && matchesCategory && matchesSearch;
  });

  return (
    <>
      <Card className="w-full flex justify-center mb-6 p-3">
        <div className="container">
          <div className="flex gap-4">
            {/* Button 1 */}
            <button
              onClick={() => navigate("/client/live")}
              className="
            px-6 py-2 
             bg-gray-100 
            hover:bg-gray-200 
            dark:bg-gray-800
            dark:text-gray-200
            text-gray-700 
            text-sm 
            font-medium 
            rounded-lg 
            shadow-sm
            transition
            cursor-pointer
          "
            >
              Live Sessions
            </button>

            {/* Button 2 */}
            <button
              onClick={() => navigate("/client/educators")}
              className="
            px-6 py-2 
            bg-primary
            text-gray-700 
            text-sm 
            font-medium 
            rounded-lg 
            shadow-sm
            transition
            cursor-pointer
          "
            >
              Educators
            </button>

          </div>
        </div>
      </Card>
      <div className="container mb-6">
        {/* Header Controls */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            {/* Tabs */}
            <button
              onClick={() => setActiveTab('All')}
              className={`px-6 py-2 rounded-lg font-medium cursor-pointer transition-all ${activeTab === 'All'
                ? 'bg-primary text-white shadow-lg'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-200 hover:dark:bg-gray-700'
                }`}
            >
              All
            </button>
            <button
              onClick={() => setActiveTab('Following')}
              className={`px-6 py-2 rounded-lg font-medium cursor-pointer transition-all ${activeTab === 'Following'
                ? 'bg-primary text-white shadow-lg'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-200 hover:dark:bg-gray-700'
                }`}
            >
              Following
            </button>

            {/* Category Dropdown */}
            <div className="relative">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="appearance-none bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg px-4 py-2 pr-10 text-gray-700 dark:text-gray-200 font-medium cursor-pointer hover:border-gray-400 dark:hover:border-gray-600 transition-colors focus:outline-none w-48"
              >
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 pointer-events-none" />
            </div>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
            <input
              type="text"
              placeholder="Search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none w-80"
            />
          </div>
        </div>

        {/* Educators Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEducators.map((educator) => (
            <Card key={educator.id} className="rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
              {/* Header Card */}
              <div className={`relative h-64 bg-gradient-to-br ${educator.gradient} overflow-hidden`}>
                {/* Category Badge */}
                <div className="absolute top-4 left-4 z-10">
                  <span className="bg-primary text-dark px-3 py-1 rounded-full text-sm font-medium">
                    {educator.category}
                  </span>
                </div>

                {/* Decorative Shape */}
                <div className={`absolute -left-20 -top-20 w-64 h-64 ${educator.bgPattern === 'purple' ? 'bg-purple-500' :
                  educator.bgPattern === 'blue' ? 'bg-blue-500' :
                    'bg-primary'
                  } opacity-30 rounded-full`}></div>

                {/* Educator Info */}
                <div className="absolute top-1/2 right-6 -translate-y-1/2 text-right">
                  <h3 className="text-white text-2xl font-bold tracking-wider mb-1">
                    {educator.title}
                  </h3>
                  <p className="text-white/80 text-sm tracking-wide">
                    {educator.subtitle}
                  </p>
                </div>

                {/* Profile Image Circle */}
              </div>

              {/* Content */}
              <div className="pt-6 px-6 pb-6">
                <h4 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-1">
                  {educator.name}
                </h4>
                <p className="text-yellow-600 font-medium text-sm mb-3">
                  {educator.specialty}
                </p>
                <p className="text-gray-600 dark:text-gray-300 text-xs line-clamp-2 h-16">
                  {educator.description}
                </p>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{educator.courses}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Courses</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{educator.tradeIdeas}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Trade Ideas</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{educator.insights}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Insights</p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => handleFollow(educator.id)}
                    className={`py-2 rounded-lg font-medium transition-all flex items-center justify-center gap-2 cursor-pointer ${followingIds.includes(educator.id)
                      ? 'bg-yellow-600 text-white hover:bg-primary-dark'
                      : 'bg-yellow-100 dark:bg-yellow-700 text-yellow-600 dark:text-yellow-200 hover:bg-yellow-200'
                      }`}
                  >
                    {followingIds.includes(educator.id) ? (
                      <>
                        <Check className="w-4 h-4" />
                        Following
                      </>
                    ) : (
                      <>
                        <Plus className="w-4 h-4" />
                        Follow
                      </>
                    )}
                  </button>
                  <button onClick={() => navigate("/client/viewprofile")} className="py-2 bg-white dark:bg-gray-800 border-1 border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-200 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-all flex items-center justify-center gap-2 cursor-pointer">
                    <Eye className="w-4 h-4" />
                    View Profile
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* No Results */}
        {filteredEducators.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No educators found matching your criteria.</p>
          </div>
        )}
      </div>
    </>
  )
}

export default EducatorsPage;