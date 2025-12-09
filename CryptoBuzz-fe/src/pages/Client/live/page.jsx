import {
  Toolbar,
  ToolbarHeading,
} from '@/components/layouts/layout-7/components/toolbar';
import React, { useState } from 'react';
import { Card } from '../../../components/ui/card';
import { useNavigate } from 'react-router';

export function LivePage() {
  const [activeCategory, setActiveCategory] = useState('Crypto');
  const [activeWeek, setActiveWeek] = useState('Current Week');
  const navigate = useNavigate();

  const educators = [
    {
      id: 1,
      name: 'Fabrizio',
      image: 'plaid',
      sessions: {
        'Current Week': {
          Monday: [
            { title: 'Weekly Market Forecast', time: '9:00am-10:00am' }
          ],
          Wednesday: [
            { title: 'Weekly Market Forecast', time: '9:00am-10:00am' },
            { title: 'Forex Basics', time: '9:00am-10:00am' }
          ],
          Friday: [
            { title: 'Forex Basics', time: '9:00am-10:00am' }
          ],
          Saturday: [
            { title: 'Weekly Market Forecast', time: '9:00am-10:00am' },
            { title: 'Forex Basics', time: '9:00am-10:00am' }
          ]
        },
        'Next Week': {
          Tuesday: [
            { title: 'Advanced Trading Strategies', time: '10:00am-11:00am' }
          ],
          Thursday: [
            { title: 'Market Analysis Deep Dive', time: '2:00pm-3:00pm' }
          ],
          Friday: [
            { title: 'Weekly Wrap-up', time: '4:00pm-5:00pm' }
          ]
        }
      }
    },
    {
      id: 2,
      name: 'Buzz Team',
      image: 'blue',
      sessions: {
        'Current Week': {
          Monday: [
            { title: 'Weekly Market Forecast', time: '9:00am-10:00am' }
          ],
          Wednesday: [
            { title: 'Weekly Market Forecast', time: '9:00am-10:00am' },
            { title: 'Forex Basics', time: '9:00am-10:00am' }
          ],
          Saturday: [
            { title: 'Weekly Market Forecast', time: '9:00am-10:00am' },
            { title: 'Forex Basics', time: '9:00am-10:00am' }
          ]
        },
        'Next Week': {
          Monday: [
            { title: 'Crypto Market Overview', time: '11:00am-12:00pm' }
          ],
          Wednesday: [
            { title: 'Technical Analysis Workshop', time: '1:00pm-2:00pm' }
          ],
          Friday: [
            { title: 'Q&A Session', time: '3:00pm-4:00pm' }
          ]
        }
      }
    }
  ];

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
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
              onClick={() => navigate("/client/educators")}
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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Live</h1>
          <p className="text-sm text-gray-500 mt-1">Home / Live / Live Sessions</p>
        </div>

        <div className="">
          {/* Category Tabs */}
          <Card className="mt-5 p-4 rounded-xl shadow-sm">
            <div className='flex gap-3'>
              {['Crypto', 'Trading', 'Digital marketing'].map((category) => (
                <button
                  key={category}
                  onClick={() => setActiveCategory(category)}
                  className={`px-4 py-2 text-sm font-medium cursor-pointer  ${activeCategory === category
                    ? 'bg-[#FFF9E2] text-primary rounded-lg'
                    : 'text-gray-600'
                    }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </Card>

          {/* Week Tabs */}
          <div className="flex gap-8 mb-8 border-b border-gray-200 dark:border-gray-700 mt-8">
            {['Current Week', 'Next Week'].map((week) => (
              <button
                key={week}
                onClick={() => setActiveWeek(week)}
                className={`pb-3 text-sm font-medium transition-colors border-b-2 cursor-pointer ${activeWeek === week
                  ? 'border-yellow-400 text-yellow-600'
                  : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                  }`}
              >
                {week}
              </button>
            ))}
          </div>

          {/* Schedule Grid */}
          <Card className="rounded-lg shadow-sm overflow-hidden">
            {/* Days Header */}
            <div className="grid grid-cols-8 bg-gradient-to-r from-yellow-600 to-yellow-700">
              <div className="p-4 font-semibold text-center text-white border-r border-yellow-600">
                Educators
              </div>
              {days.map((day) => (
                <div key={day} className="p-4 text-center font-semibold text-white border-r border-yellow-600 last:border-r-0">
                  {day}
                </div>
              ))}
            </div>

            {/* Educators and Sessions */}
            {educators.map((educator, index) => (
              <Card key={educator.id} className={`grid grid-cols-8 ${index % 2 === 0 ? '' : ''}`}>
                {/* Educator Profile */}
                <div className="p-4 border-r border-gray-200 dark:border-gray-700 flex items-center justify-center">
                  <div className="flex flex-col items-center">
                    <div className={`w-16 h-16 rounded-lg overflow-hidden mb-2 ${educator.image === 'plaid'
                      ? 'bg-gradient-to-br from-red-900 via-red-800 to-gray-800'
                      : 'bg-gradient-to-br from-blue-900 via-blue-800 to-slate-700'
                      }`}>
                      <div className="w-full h-full flex items-center justify-center text-white font-bold text-xl">
                        {educator.name[0]}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Sessions for each day */}
                {days.map((day) => (
                  <div key={day} className="p-3 border-r border-gray-200 dark:border-gray-700 last:border-r-0 min-h-[120px]">
                    {educator.sessions[activeWeek]?.[day]?.map((session, idx) => (
                      <div
                        key={idx}
                        className="bg-yellow-100 border-yellow-300 rounded-md p-2 mb-2 last:mb-0"
                      >
                        <p className="text-xs font-semibold text-gray-900 mb-1">
                          {session.title}
                        </p>
                        <p className="text-xs text-gray-600">{session.time}</p>
                      </div>
                    ))}
                  </div>
                ))}
              </Card>
            ))}
          </Card>

          {/* Educator Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
            {educators.map((educator) => (
              <div
                key={educator.id}
                className={`rounded-lg overflow-hidden shadow-lg relative h-96 ${educator.image === 'plaid'
                  ? 'bg-gradient-to-br from-gray-400 via-gray-500 to-gray-600'
                  : 'bg-gradient-to-br from-slate-500 via-slate-600 to-slate-700'
                  }`}
              >
                <img
                  src="https://images.unsplash.com/photo-1559526324-593bc073d938?q=80&w=800&auto=format&fit=crop"
                  alt="live sessions"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <h3 className="text-2xl font-bold text-white mb-4">{educator.name}</h3>
                  <button className="px-6 py-2 cursor-pointer bg-transparent border-2 border-white text-white rounded-md hover:bg-white hover:text-gray-900 transition-colors font-medium">
                    View Profile
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

