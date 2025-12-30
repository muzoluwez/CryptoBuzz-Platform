import React, { useCallback, useMemo, useState } from 'react';
import { Check, Eye, Plus } from 'lucide-react';
import { useNavigate } from 'react-router';
import SearchInput from '../../../components/common/SearchInput';
import { SelectWithClear } from '../../../components/common/SelectInput';
import { Card } from '../../../components/ui/card';
import { useGetAcademyCategoryFetchQuery } from '../../../store/client/clientAcademyCategoryApiSlice';
import { useGetAllEducatorsQuery } from '../../../store/client/clientEducatorApiSlice';


const EducatorsPage = () => {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('All');
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [followingIds, setFollowingIds] = useState([]);

  // Fetch categories from API
  const {
    data: categoriesResponse,
    isLoading: categoriesLoading,
  } = useGetAcademyCategoryFetchQuery();

  // Extract categories data from response
  const categories = useMemo(() => {
    if (!categoriesResponse?.data) return [];
    return categoriesResponse.data;
  }, [categoriesResponse]);

  // Build query parameters
  const queryParams = useMemo(() => {
    const params = {
      page: 1,
      limit: 100, // Get all educators for now
    };

    if (searchQuery.trim()) {
      params.search = searchQuery.trim();
    }

    // Use category ID if available
    if (selectedCategoryId) {
      params.category = selectedCategoryId;
    }

    return params;
  }, [searchQuery, selectedCategoryId]);

  // Fetch educators from API
  const {
    data: educatorsResponse,
    isLoading,
    isError,
    error,
  } = useGetAllEducatorsQuery(queryParams);

  // Extract educators data from response
  const educatorsData = educatorsResponse?.data || [];
  const pagination = educatorsResponse?.pagination || {};

  // Helper function to get gradient based on category
  const getGradient = (categoryName) => {
    const gradients = {
      crypto: 'from-yellow-600 to-yellow-900',
      forex: 'from-blue-700 to-blue-950',
      'digital marketing': 'from-green-600 to-green-900',
      default: 'from-purple-600 to-purple-900',
    };
    return (
      gradients[categoryName?.toLowerCase()] || gradients.default
    );
  };

  // Transform API data to match component structure
  const educators = useMemo(() => {
    return educatorsData.map((educator) => {
      const categoryName =
        educator.categories?.[0]?.name || educator.category || 'General';
      const categoryId = educator.categories?.[0]?._id || null;
      const fullName = `${educator.first_name || ''} ${educator.last_name || ''}`.trim() || educator.title || 'Unknown';
      
      return {
        id: educator._id,
        _id: educator._id,
        name: fullName,
        title: educator.title || educator.first_name?.toUpperCase() || 'EDUCATOR',
        bio: educator.bio || educator.description || '',
        category: categoryName,
        categoryId: categoryId,
        specialty: educator.title || educator.educatorRole || categoryName,
        description: educator.description || educator.bio || '',
        courses: educator.courseCount || 0,
        tradeIdeas: educator.tradeIdeas || 0, // This might not be in API response
        insights: educator.insights || 0, // This might not be in API response
        gradient: getGradient(categoryName),
        bgPattern: categoryName.toLowerCase().split(' ')[0],
        image: educator.image,
        bannerImage: educator.bannerImage,
      };
    });
  }, [educatorsData]);

  // Handle category change from SelectInput
  const handleCategoryChange = (categoryId, categoryOption) => {
    setSelectedCategoryId(categoryId || null);
  };

  // Handle clear category
  const handleClearCategory = () => {
    setSelectedCategoryId(null);
  };

  const handleFollow = (id) => {
    if (followingIds.includes(id)) {
      setFollowingIds(followingIds.filter((fId) => fId !== id));
    } else {
      setFollowingIds([...followingIds, id]);
    }
  };

  // Filter educators based on active tab (client-side filtering for "Following" tab)
  // Note: Search and category filtering is done via API query params
  const filteredEducators = useMemo(() => {
    return educators.filter((educator) => {
      const matchesTab =
        activeTab === 'All' ||
        (activeTab === 'Following' && followingIds.includes(educator.id));
      
      // Additional client-side search for cases where API doesn't handle it
      const matchesSearch =
        !searchQuery.trim() ||
        educator.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        educator.specialty.toLowerCase().includes(searchQuery.toLowerCase()) ||
        educator.description.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesTab && matchesSearch;
    });
  }, [educators, activeTab, followingIds, searchQuery]);

  return (
    <>
      <Card className="w-full flex justify-center mb-6 p-3">
        <div className="container">
          <div className="flex gap-4">
            {/* Button 1 */}
            <button
              onClick={() => navigate('/client/live')}
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
              onClick={() => navigate('/client/educators')}
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
              className={`px-6 py-2 rounded-lg font-medium cursor-pointer transition-all ${
                activeTab === 'All'
                  ? 'bg-primary text-white shadow-lg'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-200 hover:dark:bg-gray-700'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setActiveTab('Following')}
              className={`px-6 py-2 rounded-lg font-medium cursor-pointer transition-all ${
                activeTab === 'Following'
                  ? 'bg-primary text-white shadow-lg'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-200 hover:dark:bg-gray-700'
              }`}
            >
              Following
            </button>

            {/* Category Dropdown */}
            <div className="w-48">
              <SelectWithClear
                options={categories}
                value={selectedCategoryId}
                onValueChange={handleCategoryChange}
                onClear={handleClearCategory}
                placeholder="Select Category"
                valueKey="_id"
                labelKey="name"
                className=""
                disabled={categoriesLoading}
                size="md"
              />
            </div>
          </div>

          {/* Search */}
          <SearchInput
            value={searchQuery}
            onValueChange={setSearchQuery}
            onClear={() => {
              setSearchQuery('');
            }}
            placeholder="Search"
            width="w-80"
            debounceDelay={300}
          />
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">Loading educators...</p>
          </div>
        )}

        {/* Error State */}
        {isError && (
          <div className="text-center py-12">
            <p className="text-red-500 text-lg">
              Error loading educators:{' '}
              {error?.data?.message || error?.message || 'Unknown error'}
            </p>
          </div>
        )}

        {/* Educators Grid */}
        {!isLoading && !isError && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEducators.map((educator) => (
              <Card
                key={educator.id}
                className="rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
              >
                <div
                  className={`relative h-64 bg-gradient-to-br ${educator.gradient} overflow-hidden`}
                >
                  {/* Category Badge */}
                  <div className="absolute top-4 left-4 z-10">
                    <span className="bg-primary text-dark px-3 py-1 rounded-full text-sm font-medium">
                      {educator.category}
                    </span>
                  </div>

                  {/* Profile Image Circle */}
                  {educator.image && (
                    <div className="absolute bottom-0 right-0">
                      <img
                        src={educator.image}
                        alt={educator.name}
                        className="w-24 h-24 rounded-full object-cover border-4 border-white dark:border-gray-800"
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                    </div>
                  )}
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
                    {educator.bio}
                  </p>

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                        {educator.courses}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Courses
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                        {educator.tradeIdeas}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Trade Ideas
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                        {educator.insights}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Insights
                      </p>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => handleFollow(educator.id)}
                      className={`py-2 rounded-lg font-medium transition-all flex items-center justify-center gap-2 cursor-pointer ${
                        followingIds.includes(educator.id)
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
                    <button
                      onClick={() =>
                        navigate(`/client/viewprofile`, {
                          state: { educatorId: educator._id || educator.id },
                        })
                      }
                      className="py-2 bg-white dark:bg-gray-800 border-1 border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-200 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Eye className="w-4 h-4" />
                      View Profile
                    </button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* No Results */}
        {!isLoading && !isError && filteredEducators.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">
              No educators found matching your criteria.
            </p>
          </div>
        )}
      </div>
    </>
  );
};

export default EducatorsPage;