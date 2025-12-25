import React, { useEffect, useMemo, useState } from 'react';
import { useGetAcademyCategoryFetchQuery } from '@/store/client/clientAcademyCategoryApiSlice';
import { useNavigate } from 'react-router';
import { Card } from '../../../components/ui/card';
import { useGetScheduleQuery } from '../../../store/client/clientScheduleApiSlice';

export function LivePage() {
  const [activeCategory, setActiveCategory] = useState(null);
  const [activeCategoryId, setActiveCategoryId] = useState(null);
  const [activeWeek, setActiveWeek] = useState('Current Week');
  const navigate = useNavigate();

  // First, fetch categories
  const { data: categoriesData, isLoading: categoriesLoading } =
    useGetAcademyCategoryFetchQuery();

  // Get categories list
  const categories = useMemo(() => {
    if (!categoriesData?.data) return [];
    return categoriesData.data;
  }, [categoriesData]);

  // Set first category as active when categories are loaded
  useEffect(() => {
    if (categories.length > 0 && !activeCategory) {
      const firstCategory = categories[0];
      setActiveCategory(firstCategory.name);
      setActiveCategoryId(firstCategory._id);
    }
  }, [categories, activeCategory]);

  // Calculate date range for current week and next week
  const getWeekDates = (weekType) => {
    const now = new Date();
    const currentDay = now.getDay(); // 0 = Sunday, 1 = Monday, etc.
    const daysToMonday = currentDay === 0 ? -6 : 1 - currentDay; // Get to Monday

    if (weekType === 'Current Week') {
      const monday = new Date(now);
      monday.setDate(now.getDate() + daysToMonday);
      monday.setHours(0, 0, 0, 0);

      const sunday = new Date(monday);
      sunday.setDate(monday.getDate() + 6);
      sunday.setHours(23, 59, 59, 999);

      return { startDate: monday, endDate: sunday };
    } else {
      // Next Week
      const nextMonday = new Date(now);
      nextMonday.setDate(now.getDate() + daysToMonday + 7);
      nextMonday.setHours(0, 0, 0, 0);

      const nextSunday = new Date(nextMonday);
      nextSunday.setDate(nextMonday.getDate() + 6);
      nextSunday.setHours(23, 59, 59, 999);

      return { startDate: nextMonday, endDate: nextSunday };
    }
  };

  // Calculate week dates for the active week
  const currentWeekDates = getWeekDates(activeWeek);

  // Fetch schedules from API - only if category is selected
  // Dates are sent as ISO strings (same format as reference code)
  const { data, isLoading, error } = useGetScheduleQuery(
    {
      categoryId: activeCategoryId,
      startDate: currentWeekDates.startDate.toISOString(),
      endDate: currentWeekDates.endDate.toISOString(),
    },
    {
      skip: !activeCategoryId, // Skip query if no category selected
    },
  );

  // Helper function to format time from datetime
  const formatTime = (datetime) => {
    if (!datetime) return '';
    const date = new Date(datetime);
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'pm' : 'am';
    const displayHours = hours % 12 || 12;
    const displayMinutes = minutes.toString().padStart(2, '0');

    // Calculate end time (assuming 1 hour duration, adjust as needed)
    const endDate = new Date(date);
    endDate.setHours(endDate.getHours() + 1);
    const endHours = endDate.getHours();
    const endAmpm = endHours >= 12 ? 'pm' : 'am';
    const displayEndHours = endHours % 12 || 12;
    const displayEndMinutes = endDate.getMinutes().toString().padStart(2, '0');

    return `${displayHours}:${displayMinutes}${ampm}-${displayEndHours}:${displayEndMinutes}${endAmpm}`;
  };

  // Helper function to get day name from date
  const getDayName = (date) => {
    const days = [
      'Sunday',
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday',
    ];
    return days[date.getDay()];
  };

  // Get days of the week for calendar display
  const getWeekDays = () => {
    const days = [];
    const startDate = new Date(currentWeekDates.startDate);
    for (let i = 0; i < 7; i++) {
      const day = new Date(startDate);
      day.setDate(startDate.getDate() + i);
      days.push(day);
    }
    return days;
  };

  const weekDays = getWeekDays();

  // Helper to check if date is same day
  const isSameDay = (date1, date2) => {
    return (
      date1.getDate() === date2.getDate() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getFullYear() === date2.getFullYear()
    );
  };

  // Transform API data to match component structure
  const educators = useMemo(() => {
    if (!data?.data) return [];

    // Group schedules by educator
    const educatorsMap = {};

    data.data.forEach((schedule) => {
      const educator = schedule.educator || {};

      // Skip if educator is inactive (but allow admin/super_admin)
      if (educator.status === 'false' || educator.status === 'inactive') return;

      const educatorId = educator._id?.toString() || 'unknown';
      const educatorName =
        educator.first_name && educator.last_name
          ? `${educator.first_name} ${educator.last_name}`
          : educator.first_name || educator.last_name || 'Unknown Educator';

      if (!educatorsMap[educatorId]) {
        educatorsMap[educatorId] = {
          id: educatorId,
          name: educatorName,
          image: educator.image || 'plaid',
          avatar: educator.image,
          first_name: educator.first_name,
          last_name: educator.last_name,
          sessions: {}, // Will store sessions by day
        };
      }

      // Get schedule date
      const scheduleDate = new Date(schedule.datetime);

      // Find which day of the week this schedule belongs to
      const dayIndex = weekDays.findIndex((day) =>
        isSameDay(day, scheduleDate),
      );

      if (dayIndex !== -1) {
        const dayKey = dayIndex.toString();
        if (!educatorsMap[educatorId].sessions[dayKey]) {
          educatorsMap[educatorId].sessions[dayKey] = [];
        }

        // Add session
        educatorsMap[educatorId].sessions[dayKey].push({
          title: schedule.title || 'Untitled Session',
          time: formatTime(schedule.datetime),
          datetime: schedule.datetime,
          _id: schedule._id,
          ...schedule,
        });
      }
    });

    return Object.values(educatorsMap);
  }, [data, weekDays]);

  // Loading state - check both categories and schedules
  if (categoriesLoading || (isLoading && activeCategoryId)) {
    return (
      <>
        <Card className="w-full flex justify-center mb-6 p-3">
          <div className="container">
            <div className="flex gap-4">
              <button
                onClick={() => navigate('/client/live')}
                className="px-6 py-2 bg-primary text-gray-700 text-sm font-medium rounded-lg shadow-sm transition cursor-pointer"
              >
                Live Sessions
              </button>
              <button
                onClick={() => navigate('/client/educators')}
                className="px-6 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-200 text-gray-700 text-sm font-medium rounded-lg shadow-sm transition cursor-pointer"
              >
                Educators
              </button>
            </div>
          </div>
        </Card>
        <div className="container mb-6">
          <div className="mb-5">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Live
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Home / Live / Live Sessions
            </p>
          </div>
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <p className="mt-4 text-gray-500">
                {categoriesLoading
                  ? 'Loading categories...'
                  : 'Loading schedules...'}
              </p>
            </div>
          </div>
        </div>
      </>
    );
  }

  // Error state
  if (error) {
    return (
      <>
        <Card className="w-full flex justify-center mb-6 p-3">
          <div className="container">
            <div className="flex gap-4">
              <button
                onClick={() => navigate('/client/live')}
                className="px-6 py-2 bg-primary text-gray-700 text-sm font-medium rounded-lg shadow-sm transition cursor-pointer"
              >
                Live Sessions
              </button>
              <button
                onClick={() => navigate('/client/educators')}
                className="px-6 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-200 text-gray-700 text-sm font-medium rounded-lg shadow-sm transition cursor-pointer"
              >
                Educators
              </button>
            </div>
          </div>
        </Card>
        <div className="container mb-6">
          <div className="mb-5">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Live
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Home / Live / Live Sessions
            </p>
          </div>
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <p className="text-red-500 text-lg font-semibold">
                Error loading schedules
              </p>
              <p className="text-gray-500 mt-2">
                {error?.data?.message ||
                  error?.error ||
                  'Something went wrong. Please try again later.'}
              </p>
            </div>
          </div>
        </div>
      </>
    );
  }

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
              Live Sessions
            </button>

            {/* Button 2 */}
            <button
              onClick={() => navigate('/client/educators')}
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
              Educators
            </button>
          </div>
        </div>
      </Card>

      <div className="container mb-6">
        {/* Header */}
        <div className="mb-5">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Live
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Home / Live / Live Sessions
          </p>
        </div>

        <div className="">
          {/* Category Tabs */}
          <Card className="mt-5 p-4 rounded-xl shadow-sm">
            {categoriesLoading ? (
              <div className="flex gap-3">
                <div className="h-10 w-24 bg-gray-200 rounded-lg animate-pulse"></div>
                <div className="h-10 w-24 bg-gray-200 rounded-lg animate-pulse"></div>
                <div className="h-10 w-24 bg-gray-200 rounded-lg animate-pulse"></div>
              </div>
            ) : (
              <div className="flex gap-3 flex-wrap">
                {categories.map((category) => (
                  <button
                    key={category._id}
                    onClick={() => {
                      setActiveCategory(category.name);
                      setActiveCategoryId(category._id);
                    }}
                    className={`px-4 py-2 text-sm font-medium cursor-pointer transition-colors ${
                      activeCategory === category.name
                        ? 'bg-[#FFF9E2] text-primary rounded-lg'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    {category.name}
                  </button>
                ))}
              </div>
            )}
          </Card>

          {/* Week Tabs */}
          <div className="flex gap-8 mb-8 border-b border-gray-200 dark:border-gray-700 mt-8">
            {['Current Week', 'Next Week'].map((week) => (
              <button
                key={week}
                onClick={() => setActiveWeek(week)}
                className={`pb-3 text-sm font-medium transition-colors border-b-2 cursor-pointer ${
                  activeWeek === week
                    ? 'border-yellow-400 text-yellow-600'
                    : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                {week}
              </button>
            ))}
          </div>

          {/* Schedule Grid */}
          {!activeCategoryId ? (
            <Card className="rounded-lg shadow-sm p-8">
              <div className="text-center text-gray-500">
                <p>Please select a category to view schedules</p>
              </div>
            </Card>
          ) : educators.length === 0 ? (
            <Card className="rounded-lg shadow-sm p-8">
              <div className="text-center text-gray-500">
                <p>
                  No schedules available for {activeCategory} in {activeWeek}
                </p>
              </div>
            </Card>
          ) : (
            <Card className="rounded-lg shadow-sm overflow-hidden">
              {/* Days Header */}
              <div className="grid grid-cols-8 bg-gradient-to-r from-yellow-600 to-yellow-700">
                <div className="p-4 font-semibold text-center text-white border-r border-yellow-600">
                  Educators
                </div>
                {weekDays.map((day, index) => (
                  <div
                    key={index}
                    className="p-4 text-center font-semibold text-white border-r border-yellow-600 last:border-r-0"
                  >
                    <div className="text-sm">
                      {day.toLocaleDateString('en-US', { weekday: 'short' })}
                    </div>
                    <div className="text-xs mt-1">{day.getDate()}</div>
                  </div>
                ))}
              </div>

              {/* Educators and Sessions */}
              {educators.map((educator, index) => (
                <div
                  key={educator.id}
                  className={`grid grid-cols-8 border-t border-gray-200 dark:border-gray-700 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}
                >
                  {/* Educator Profile */}
                  <div className="p-4 border-r border-gray-200 dark:border-gray-700 flex items-center justify-center">
                    <div className="flex flex-col items-center">
                      {educator.avatar ? (
                        <img
                          src={educator.avatar}
                          alt={educator.name}
                          className="w-16 h-16 rounded-lg object-cover mb-2 cursor-pointer"
                          onClick={() =>
                            navigate(`/client/viewprofile/${educator.id}`)
                          }
                        />
                      ) : (
                        <div
                          className={`w-16 h-16 rounded-lg overflow-hidden mb-2 ${
                            educator.image === 'plaid'
                              ? 'bg-gradient-to-br from-red-900 via-red-800 to-gray-800'
                              : 'bg-gradient-to-br from-blue-900 via-blue-800 to-slate-700'
                          }`}
                        >
                          <div className="w-full h-full flex items-center justify-center text-white font-bold text-xl">
                            {educator.name[0]}
                          </div>
                        </div>
                      )}
                      <p className="text-xs font-medium text-center text-gray-700 dark:text-gray-300 mt-1">
                        {educator.name}
                      </p>
                    </div>
                  </div>

                  {/* Sessions for each day */}
                  {weekDays.map((day, dayIndex) => {
                    const dayKey = dayIndex.toString();
                    const daySessions = educator.sessions[dayKey] || [];
                    const isToday = isSameDay(day, new Date());

                    return (
                      <div
                        key={dayIndex}
                        className="p-3 border-r border-gray-200 dark:border-gray-700 last:border-r-0 min-h-[120px]"
                      >
                        {daySessions.length > 0 ? (
                          daySessions.map((session, idx) => (
                            <div
                              key={session._id || idx}
                              className={`rounded-md p-2 mb-2 last:mb-0 cursor-pointer transition-all ${
                                isToday
                                  ? 'bg-[#4E34E3] text-white shadow-lg'
                                  : 'bg-yellow-100 border-yellow-300 text-gray-900'
                              }`}
                              onClick={() =>
                                navigate(`/client/viewprofile/${educator.id}`)
                              }
                            >
                              <p
                                className={`text-xs font-semibold mb-1 ${isToday ? 'text-white' : 'text-gray-900'}`}
                              >
                                {session.title}
                              </p>
                              <p
                                className={`text-xs ${isToday ? 'text-white' : 'text-gray-600'}`}
                              >
                                {session.time}
                              </p>
                            </div>
                          ))
                        ) : (
                          <div className="text-xs text-gray-400 text-center">
                            –
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}
            </Card>
          )}

          {/* Educator Cards */}
          {educators.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
              {educators.map((educator) => (
                <div
                  key={educator.id}
                  className={`rounded-lg overflow-hidden shadow-lg relative h-96 ${
                    educator.image === 'plaid'
                      ? 'bg-gradient-to-br from-gray-400 via-gray-500 to-gray-600'
                      : 'bg-gradient-to-br from-slate-500 via-slate-600 to-slate-700'
                  }`}
                >
                  <img
                    src={
                      educator.avatar ||
                      'https://images.unsplash.com/photo-1559526324-593bc073d938?q=80&w=800&auto=format&fit=crop'
                    }
                    alt={educator.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <h3 className="text-2xl font-bold text-white mb-4">
                      {educator.name}
                    </h3>
                    <button
                      onClick={() =>
                        navigate(`/client/viewprofile/${educator.id}`)
                      }
                      className="px-6 py-2 cursor-pointer bg-transparent border-2 border-white text-white rounded-md hover:bg-white hover:text-gray-900 transition-colors font-medium"
                    >
                      View Profile
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
