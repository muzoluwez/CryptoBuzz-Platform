import {
  Toolbar,
  ToolbarHeading,
} from '@/components/layouts/layout-7/components/toolbar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const DummyImg = ({ src, alt = "" }) => (
  <img src={src} alt={alt} className="w-full h-full object-cover" />
);

export function AcademyPage() {
  return (
    <>
      <Toolbar>
        <ToolbarHeading title="Academy" />
      </Toolbar>
      <div className="container">
         

          {/* Tabs Section */}
          <Tabs defaultValue="crypto" className="w-full mb-8">
            <TabsList className="bg-white shadow-sm rounded-xl p-3 h-auto gap-4">
              <TabsTrigger value="crypto" className="px-4 py-2 rounded-lg data-[state=active]:bg-yellow-300">
                Crypto
              </TabsTrigger>
              <TabsTrigger value="trading" className="px-4 py-2 rounded-lg data-[state=active]:bg-yellow-300">
                Trading
              </TabsTrigger>
              <TabsTrigger value="defi" className="px-4 py-2 rounded-lg data-[state=active]:bg-yellow-300">
                DeFi
              </TabsTrigger>
            </TabsList>
            <TabsContent value="crypto">{/* Content for Crypto */}</TabsContent>
            <TabsContent value="trading">{/* Content for Trading */}</TabsContent>
            <TabsContent value="defi">{/* Content for DeFi */}</TabsContent>
          </Tabs>

          {/* 2-Column Layout */}
          <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">

            {/* Left — Video and Description */}
            <div className="lg:col-span-2">

              {/* Video Banner */}
              <div className="relative card overflow-hidden rounded-2xl">
                <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/80 to-black/60 z-10"></div>
                <div className="absolute inset-0 flex items-center justify-center z-20">
                  <button className="h-16 w-16 rounded-full bg-white flex items-center justify-center shadow-xl">
                    ▶
                  </button>
                </div>
                <DummyImg
                  src="https://images.unsplash.com/photo-1574068468668-a05a11f871da?q=80&w=1500&auto=format&fit=crop"
                  alt="course video"
                  className="rounded-2xl h-72"
                />
              </div>

              {/* Course Title */}
              <div className="flex items-center justify-between mt-8">
                <h2 className="text-2xl font-semibold">What is Forex ?</h2>
                <button className="px-4 py-2 text-sm rounded-md bg-gray-200 hover:bg-gray-300">
                  Mark as Complete
                </button>
              </div>

              {/* Description */}
              <p className="text-gray-600 mt-4 leading-relaxed text-[15px]">
                In this video, you’ll explore how the Forex market evolved — from the gold standard
                and Bretton Woods system to today’s decentralized digital trading environment.
                Understand the key milestones that shaped modern currency trading.
              </p>

              {/* Recommended Courses */}
              <h3 className="text-xl font-semibold mt-10 mb-4">Recommended Courses</h3>

              <div className="flex items-center gap-4 mb-6">
                <select className="px-3 py-2 bg-white rounded-lg shadow text-sm">
                  <option>Experience</option>
                </select>
                <select className="px-3 py-2 bg-white rounded-lg shadow text-sm">
                  <option>Style</option>
                </select>
              </div>

              {/* Recommended Course Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">

                {/* Card 1 */}
                <div className="card rounded-xl overflow-hidden">
                  <div className="relative h-56">
                    <DummyImg src="https://images.unsplash.com/photo-1543269865-4430f94492b9?q=80&w=800&auto=format&fit=crop" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                    <div className="absolute bottom-4 left-4 text-white">
                      <h4 className="font-semibold text-lg">The Market Blueprint Bootcamp</h4>
                      <p className="text-xs mt-1 opacity-90">In this course, we dive deep... <span className="text-yellow-300">Show More</span></p>
                    </div>
                  </div>
                </div>

                {/* Card 2 */}
                <div className="card rounded-xl overflow-hidden">
                  <div className="relative h-56">
                    <DummyImg src="https://images.unsplash.com/photo-1596496050754-9d2de1a785f9?q=80&w=800&auto=format&fit=crop" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 to-transparent"></div>
                    <div className="absolute bottom-4 left-4 text-white">
                      <h4 className="font-semibold text-lg">The Starting Point Blueprint Course</h4>
                      <p className="text-xs mt-1 opacity-90">A step-by-step trading frame... <span className="text-yellow-300">Show More</span></p>
                    </div>
                  </div>
                </div>

                {/* Card 3 */}
                <div className="card rounded-xl overflow-hidden">
                  <div className="relative h-56">
                    <DummyImg src="https://images.unsplash.com/photo-1531297484001-80022131f5a1?q=80&w=800&auto=format&fit=crop" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 to-transparent"></div>
                    <div className="absolute bottom-4 left-4 text-white">
                      <h4 className="font-semibold text-lg">WEEKLY OVERVIEW</h4>
                      <p className="text-xs mt-1 opacity-90">Every weekend I take time... <span className="text-yellow-300">Show More</span></p>
                    </div>
                  </div>
                </div>

              </div>
            </div>

            {/* RIGHT SIDEBAR */}
            <aside className="space-y-4">

              {/* Lesson List */}
              <div className="bg-white shadow rounded-xl p-4">

                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-semibold">Intro Series</h4>
                  <span className="text-sm text-gray-500">1/4</span>
                </div>

                <div className="space-y-2">

                  {/* Active Lesson */}
                  <button className="w-full flex items-center gap-3 px-4 py-3 bg-yellow-400 rounded-lg">
                    <span className="h-4 w-4 rounded-full bg-black flex items-center justify-center text-white text-[10px]">
                      ►
                    </span>
                    <span className="text-sm font-semibold">What is Forex</span>
                  </button>

                  {/* Lesson Items */}
                  {[
                    "History of Forex",
                    "What's Traded in Forex",
                    "Forex Market Participants",
                  ].map((item, i) => (
                    <button
                      key={i}
                      className="w-full flex items-center gap-3 px-4 py-3 bg-gray-200 rounded-lg hover:bg-gray-300 transition"
                    >
                      <span className="h-4 w-4 rounded-full bg-black flex items-center justify-center text-white text-[10px]">
                        ►
                      </span>
                      <span className="text-sm">{item}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Accordion Sections */}
              {["Software Series", "Terminology Series", "Essentials Series"].map(
                (title, i) => (
                  <div key={i} className="bg-white rounded-xl shadow p-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold">{title}</h4>
                      <span className="text-xl">⌄</span>
                    </div>
                  </div>
                )
              )}
            </aside>
          </section>
         
      </div>
    </>
  );
}

