import React, { useState } from 'react';
import { ChevronDown, Play } from 'lucide-react';
import { Card, CardContent } from '../../../components/ui/card';
import {
  Toolbar,
  ToolbarHeading,
} from '@/components/layouts/layout-7/components/toolbar';

function CryptoUI({ activeTab, setActiveTab, toggle, open, introLessons, sections, courses }) {
  return (
    <>
      <div className="container my-6">

        <h1 className="text-2xl font-bold">Academy</h1>
        <p className="text-sm text-gray-500">Home / Academy / Crypto</p>

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
            <div className="relative bg-gradient-to-br from-yellow-600 via-yellow-700 to-gray-800 rounded-lg overflow-hidden aspect-video shadow-lg">
              <div className="absolute inset-0 flex items-center justify-center">
                <button className="bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-all rounded-xl p-6">
                  <Play className="w-12 h-12 text-white fill-white" />
                </button>
              </div>
              <div className="absolute inset-0 bg-black/20"></div>
            </div>

            <div className="flex items-center justify-between flex-wrap gap-4 mt-6">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-200">Lorem Ipsum Dolor Sit Amet</h2>
              <button className="mt-3 btn bg-transparent border border-white text-gray-800 dark:text-white cursor-pointer">
                Mark as Complete
              </button>
            </div>

            <p className="text-gray-600 dark:text-gray-400 mt-4 leading-relaxed">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
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
                    {introLessons.map((lesson) => (
                      <button
                        key={lesson.id}
                        className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors mt-2 ${lesson.active
                          ? "bg-yellow-400 hover:bg-yellow-500"
                          : "bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 "
                          }`}
                      >
                        <div className="w-8 h-8 rounded-full flex items-center justify-center bg-gray-900">
                          <Play className="w-4 h-4 text-white fill-white" />
                        </div>

                        <span
                          className={`text-sm font-medium ${lesson.active
                            ? "text-gray-900"
                            : "text-gray-700 dark:text-gray-300"
                            }`}
                        >
                          {lesson.title}
                        </span>
                      </button>
                    ))}
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
            {courses.map((course) => (
              <Card key={course.id} className="relative bg-black text-white h-[438px] p-0 overflow-hidden">
                <CardContent className="p-0">
                  <div className="relative h-full">
                    <img
                      src="https://images.unsplash.com/photo-1559526324-593bc073d938?q=80&w=800&auto=format&fit=crop"
                      alt="live sessions"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute left-4 bottom-4 text-white z-10">
                      <h4 className=" text-2xl font-bold">{course.title}</h4>
                      <p className="text-md mt-3 text-gray-200">{course.description}</p>
                      <button className="text-yellow-600 hover:text-yellow-700 text-sm font-medium cursor-pointer">{course.link}</button>
                    </div>
                  </div>
                </CardContent>
                <div className='absolute bg-gradient-black  inset-0 bg-gradient-green z-0'></div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
function TradingUI({ activeTab, setActiveTab, toggle, open, introLessons, sections, courses }) {
  return (
    <>
      <div className="container my-6">

        <h1 className="text-2xl font-bold">Academy</h1>
        <p className="text-sm text-gray-500">Home / Academy / Crypto</p>

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
            <div className="relative bg-gradient-to-br from-green-600 via-green-700 to-gray-800 rounded-lg overflow-hidden aspect-video shadow-lg">
              <div className="absolute inset-0 flex items-center justify-center">
                <button className="bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-all rounded-xl p-6">
                  <Play className="w-12 h-12 text-white fill-white" />
                </button>
              </div>
              <div className="absolute inset-0 bg-black/20"></div>
            </div>

            <div className="flex items-center justify-between flex-wrap gap-4 mt-6">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-200">Consectetur Adipiscing Elit</h2>
              <button className="mt-3 btn bg-transparent border border-white text-gray-800 dark:text-white cursor-pointer">
                Mark as Complete
              </button>
            </div>

            <p className="text-gray-600 dark:text-gray-400 mt-4 leading-relaxed">
              Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
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
                    {introLessons.map((lesson) => (
                      <button
                        key={lesson.id}
                        className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors mt-2 ${lesson.active
                          ? "bg-green-400 hover:bg-green-500"
                          : "bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 "
                          }`}
                      >
                        <div className="w-8 h-8 rounded-full flex items-center justify-center bg-gray-900">
                          <Play className="w-4 h-4 text-white fill-white" />
                        </div>

                        <span
                          className={`text-sm font-medium ${lesson.active
                            ? "text-gray-900"
                            : "text-gray-700 dark:text-gray-300"
                            }`}
                        >
                          {lesson.title}
                        </span>
                      </button>
                    ))}
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
            {courses.map((course) => (
              <Card key={course.id} className="relative bg-black text-white h-[438px] p-0 overflow-hidden">
                <CardContent className="p-0">
                  <div className="relative h-full">
                    <img
                      src="https://images.unsplash.com/photo-1559526324-593bc073d938?q=80&w=800&auto=format&fit=crop"
                      alt="live sessions"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute left-4 bottom-4 text-white z-10">
                      <h4 className=" text-2xl font-bold">{course.title}</h4>
                      <p className="text-md mt-3 text-gray-200">{course.description}</p>
                      <button className="text-yellow-600 hover:text-yellow-700 text-sm font-medium cursor-pointer">{course.link}</button>
                    </div>
                  </div>
                </CardContent>
                <div className='absolute bg-gradient-black  inset-0 bg-gradient-green z-0'></div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
function DigitalMarketingUI({ activeTab, setActiveTab, toggle, open, introLessons, sections, courses }) {
  return (
    <>
      <div className="container my-6">

        <h1 className="text-2xl font-bold">Academy</h1>
        <p className="text-sm text-gray-500">Home / Academy / Crypto</p>

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
            <div className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-gray-800 rounded-lg overflow-hidden aspect-video shadow-lg">
              <div className="absolute inset-0 flex items-center justify-center">
                <button className="bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-all rounded-xl p-6">
                  <Play className="w-12 h-12 text-white fill-white" />
                </button>
              </div>
              <div className="absolute inset-0 bg-black/20"></div>
            </div>

            <div className="flex items-center justify-between flex-wrap gap-4 mt-6">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-200">Sed Do Eiusmod Tempor</h2>
              <button className="mt-3 btn bg-transparent border border-white text-gray-800 dark:text-white cursor-pointer">
                Mark as Complete
              </button>
            </div>

            <p className="text-gray-600 dark:text-gray-400 mt-4 leading-relaxed">
              Incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat duis aute irure dolor.
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
                    {introLessons.map((lesson) => (
                      <button
                        key={lesson.id}
                        className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors mt-2 ${lesson.active
                          ? "bg-blue-400 hover:bg-blue-500"
                          : "bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 "
                          }`}
                      >
                        <div className="w-8 h-8 rounded-full flex items-center justify-center bg-gray-900">
                          <Play className="w-4 h-4 text-white fill-white" />
                        </div>

                        <span
                          className={`text-sm font-medium ${lesson.active
                            ? "text-gray-900"
                            : "text-gray-700 dark:text-gray-300"
                            }`}
                        >
                          {lesson.title}
                        </span>
                      </button>
                    ))}
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
            {courses.map((course) => (
              <Card key={course.id} className="relative bg-black text-white h-[438px] p-0 overflow-hidden">
                <CardContent className="p-0">
                  <div className="relative h-full">
                    <img
                      src="https://images.unsplash.com/photo-1559526324-593bc073d938?q=80&w=800&auto=format&fit=crop"
                      alt="live sessions"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute left-4 bottom-4 text-white z-10">
                      <h4 className=" text-2xl font-bold">{course.title}</h4>
                      <p className="text-md mt-3 text-gray-200">{course.description}</p>
                      <button className="text-yellow-600 hover:text-yellow-700 text-sm font-medium cursor-pointer">{course.link}</button>
                    </div>
                  </div>
                </CardContent>
                <div className='absolute bg-gradient-black  inset-0 bg-gradient-green z-0'></div>
              </Card>
            ))}
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
    { id: 1, title: "Lorem Ipsum Dolor", active: true },
    { id: 2, title: "Sit Amet Consectetur", active: false },
    { id: 3, title: "Adipiscing Elit Sed", active: false },
  ];

  const sections = {
    "Dolor Sit Series": ["Lorem Ipsum Dolor Sit", "Consectetur Adipiscing", "Elit Sed Do Eiusmod"],
    "Tempor Incididunt Series": ["Ut Labore Et Dolore", "Magna Aliqua Ut"],
    "Enim Ad Minim Series": ["Veniam Quis Nostrud", "Exercitation Ullamco"],
  };

  const courses = [
    { id: 1, title: "Lorem Ipsum Dolor Bootcamp", description: "Sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna", link: "Show more" },
    { id: 2, title: "Sed Diam Nonumy Blueprint", description: "Eirmod tempor invidunt ut labore et dolore magna aliqua erat volutpat sed diam voluptua", link: "Show more" },
    { id: 3, title: "Lorem Dolor", description: "Nonumy eirmod tempor invidunt ut labore et dolore magna aliqua erat volutpat amet consectetur", link: "Show more" },
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
