import {
  Toolbar,
  ToolbarHeading,
} from '@/components/layouts/layout-7/components/toolbar';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardHeading,
  CardTitle,
  CardToolbar,
} from '../../../components/ui/card';

const DummyImage = ({ src, alt = "", className = "" }) => (
  <img src={src} alt={alt} className={`w-full h-full object-cover ${className}`} />
);

export function HomePage() {
  return (
    <>
      <Toolbar>
        <ToolbarHeading title="Home" />
      </Toolbar>
      <div className="container">
        <main className="">
          {/* Page Header */}
          <header className="mb-6">
            <h1 className="text-2xl font-semibold text-black dark:text-white">Cripto Buzz Home</h1>
            <p className="text-xs text-gray-500 mt-1">Home</p>
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
                <h2 className="text-2xl md:text-3xl font-semibold drop-shadow-md">Cripto buzz</h2>
                <p className="text-sm md:text-base drop-shadow-sm">Save thousands to millions of bucks by using tool great skills</p>
              </div>
            </div>
          </section>

          {/* TWO COLUMN FEATURES */}
          <section className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
            <div className="lg:col-span-2 space-y-6">
              {/* Top-left stacked cards */}
              <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
                <div className='flex flex-col gap-5'>
                  <Card className="relative text-white bg-[url('../../../../public/media/images/FreeMembershipTraining.png')] bg-cover h-64 overflow-hidden">

                    <CardContent className="flex flex-col justify-center h-full z-10 max-w-[75%]">
                      <div>
                        <CardHeading className="text-2xl font-black">Free Membership Training</CardHeading>
                        <p className="mt-2 text-lg">
                          Begin your journey with us, let us guide you to the whole process
                        </p>
                      </div>
                      <div className="mt-4">
                        <button className="btn bg-black text-white cursor-pointer ">Start Learning</button>
                      </div>
                    </CardContent>
                    <div className='absolute inset-0 bg-gradient-green z-0'></div>
                  </Card>
                  <Card className="relative text-white bg-[url('../../../../public/media/images/PremiumAcademy.png')] bg-cover h-64 overflow-hidden">
                    <CardContent className="flex flex-col justify-center h-full z-10 max-w-[75%]">
                      <div>
                        <CardHeading className="text-2xl font-black">Premium Academy</CardHeading>
                        <p className="mt-2 text-lg">
                          Comprehensive trading education from basics to advanced strategies
                        </p>
                      </div>
                      <div className="mt-4">
                        <button className="btn bg-white text-black cursor-pointer ">Start Learning</button>
                      </div>
                    </CardContent>
                    <div className='absolute inset-0 bg-gradient-blue z-0'></div>
                  </Card>
                </div>
              </div>
            </div>

            {/* Right big highlighted card */}
            <div className="lg:col-span-2 space-y-6">
              <Card className="relative text-white bg-[url('../../../../public/media/images/live-user--bg.png')] bg-cover overflow-hidden h-full" >
                <CardContent className="flex flex-col items-center justify-between w-full z-10 h-full py-10">
                  <div className="text-center">
                    <CardHeading className="text-3xl font-black mb-5 leading-10">Who is live on <br /> Cripto Buzz</CardHeading>
                    <p className="mt-2 text-lg opacity-95 leading-6">Comprehensive trading education from basics to <br /> advanced strategies</p>
                  </div>

                  <div className="flex flex-col items-center mt-7">
                    <div className="h-34 w-34 radius-live-user overflow-hidden mb-3">
                      <img src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=800&auto=format&fit=crop" alt="host" className="w-full h-full object-cover" />
                    </div>
                    <h4 className="font-semibold text-lg">Jania Garnbet</h4>
                    <p className="text-sm text-white/90">Development Lead</p>
                    <button className="btn bg-white text-black mt-2">Watch Now</button>
                  </div>
                </CardContent>
                <div className='absolute bg-gradient-yellow  inset-0 bg-gradient-green z-0'></div>
              </Card>
            </div>
          </section>

          <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            <Card className="relative bg-black text-white h-[438px] p-0 overflow-hidden">
              <CardContent className="p-0">
                <div className="relative h-full">
                  <img
                    src="https://images.unsplash.com/photo-1559526324-593bc073d938?q=80&w=800&auto=format&fit=crop"
                    alt="live sessions"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute left-4 bottom-4 text-white z-10">
                    <h4 className=" text-2xl font-bold">Cripto Buzz Live Sessions</h4>
                    <p className="text-md mt-1 mb-5">Join live trading sessions and webinars</p>
                    <button className="mt-3 btn bg-transparent border border-white text-white cursor-pointer">Start Learning</button>
                  </div>
                </div>
              </CardContent>
              <div className='absolute bg-gradient-black  inset-0 bg-gradient-green z-0'></div>
            </Card>

            <Card className="relative bg-black text-white h-[438px] p-0 overflow-hidden">
              <CardContent className="p-0">
                <div className="relative h-full">
                  <img
                    src="https://images.unsplash.com/photo-1518599807937-1f4b1062a6f3?q=80&w=800&auto=format&fit=crop"
                    alt="live sessions"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute left-4 bottom-4 text-white z-10">
                    <h4 className=" text-2xl font-bold">Cripto Buzz Tools</h4>
                    <p className="text-md mt-1 mb-5">Join live trading sessions and webinars</p>
                    <button className="mt-3 btn bg-transparent border border-white text-white cursor-pointer">Start Learning</button>
                  </div>
                </div>
              </CardContent>
              <div className='absolute bg-gradient-black  inset-0 bg-gradient-green z-0'></div>
            </Card>


                <Card className="relative bg-black text-white h-[438px] p-0 overflow-hidden">
              <CardContent className="p-0">
                <div className="relative h-full">
                  <img
                    src="https://images.unsplash.com/photo-1519389950473-47ba0277781c?q=80&w=800&auto=format&fit=crop"
                    alt="live sessions"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute left-4 bottom-4 text-white z-10">
                    <h4 className=" text-2xl font-bold">Cripto Buzz Social Feed</h4>
                    <p className="text-md mt-1 mb-5">Join live trading sessions and webinars</p>
                    <button className="mt-3 btn bg-transparent border border-white text-white cursor-pointer">Start Learning</button>
                  </div>
                </div>
              </CardContent>
              <div className='absolute bg-gradient-black  inset-0 bg-gradient-green z-0'></div>
            </Card>
          </section>


          {/* FEED + SIDEBAR */}
          <section className="grid grid-cols-3 lg:grid-cols-3 gap-6">
            {/* Activity feed (large left) */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between w-full">
                    <CardHeading>Live Activity Feed</CardHeading>
                    <div className="flex gap-2 items-center">
                      <button className="btn bg-[#eef2f5] text-sm text-gray-700">CryptoBuzz Announcements</button>
                      <button className="btn bg-yellow-400 text-sm text-black">Social</button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {Array.from({ length: 6 }).map((_, idx) => (
                      <article key={idx} className="flex gap-4 items-start bg-white">
                        <img
                          src={`https://i.pravatar.cc/48?img=${idx + 10}`}
                          alt="avatar"
                          className="h-10 w-10 rounded-full object-cover"
                        />
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium">Mr. Anderson</p>
                              <p className="text-xs text-gray-500">Long before you sit down to put digital pen to paper you need to make sure you have to sit down and write. <span className="text-blue-500">See more</span></p>
                            </div>
                            <time className="text-xs text-gray-400">2 Days ago</time>
                          </div>
                        </div>
                      </article>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Sidebar */}
            <div className=" lg:col-span-1">
              <aside className="space-y-4">
                <Card className="p-4 bg-white">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>Connect With Us</CardTitle>
                      <button className="btn bg-[#edf2ff] text-sm">Follow</button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-xs text-gray-500">@cryptobuzz</p>
                  </CardContent>
                </Card>

                <Card className="p-4 bg-white">
                  <CardHeader>
                    <CardTitle>Download our Apps</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col gap-3">
                      <div className="flex items-center gap-3 bg-[#fbf6e6] rounded-md p-3">
                        <div className="h-10 w-10 rounded-md bg-black text-white flex items-center justify-center">C</div>
                        <div>
                          <p className="text-sm font-medium">Cripto Buzz App</p>
                          <p className="text-xs text-gray-500">2K+ Beta Users</p>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <img src="https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg" alt="play" className="h-8" />
                        <img src="https://developer.apple.com/assets/elements/badges/download-on-the-app-store.svg" alt="appstore" className="h-8" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="p-4 bg-white">
                  <CardHeader>
                    <CardTitle>Ideas and Analysis</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="rounded-md p-3 bg-yellow-400 text-black">Cripto Ideas</div>
                      <div className="rounded-md p-3 bg-yellow-400 text-black">Buzz Analysis</div>
                    </div>
                  </CardContent>
                </Card>
              </aside>
            </div>
          </section>
        </main>
      </div>
    </>
  );
}

