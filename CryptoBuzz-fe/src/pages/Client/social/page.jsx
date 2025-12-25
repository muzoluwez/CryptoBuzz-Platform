import {
  Toolbar,
  ToolbarHeading,
} from '@/components/layouts/layout-7/components/toolbar';
import { AccessGate } from "@/components/common/AccessGate";
import { useAccessControl } from "@/hooks/use-access-control";
import { Card, CardContent, CardHeader, CardFooter, CardHeading, CardTitle, CardToolbar } from '../../../components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ChevronDown, Filter, FilterIcon, Forward, MessageCircle, Settings, ThumbsUp, ThumbsUpIcon } from 'lucide-react';
import { Button } from 'react-aria-components';
import { Link } from 'react-router';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useState } from 'react';

export function SocialPage() {

  const [sortValue, setSortValue] = useState("latest");
  const [filters, setFilters] = useState({
    images: false,
    videos: false,
    textPosts: false,
  });

  const { checkAccess } = useAccessControl();

  const posts = [
    {
      id: 1,
      author: {
        name: "CriptoBuzz Corporate",
        role: "Educator",
        avatar: "/media/avatars/1.png",
        fallback: "IQ"
      },
      time: "about 7 hours ago",
      content: "Lorem ipsum dolor sit amet, consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris",
      image: "https://images.unsplash.com/photo-1545239351-1141bd82e8a6?q=80&w=1400&auto=format&fit=crop",
      host: {
        name: "Lorem Ipsum",
        desc: "Dolor Sit Amet"
      },
      views: "1.2K",
      accessType: "PUBLIC"
    },
    {
      id: 2,
      author: {
        name: "CriptoBuzz Corporate",
        role: "Educator",
        avatar: "/media/avatars/1.png",
        fallback: "IQ"
      },
      time: "about 12 hours ago",
      content: "Sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquam erat volutpat. Sed diam voluptua at vero eos et accusam et justo duo dolores et ea rebum stet clita",
      image: "https://images.unsplash.com/photo-1545239351-1141bd82e8a6?q=80&w=1400&auto=format&fit=crop",
      host: {
        name: "Consectetur Adipiscing",
        desc: "Elit Sed Do"
      },
      views: "900",
      accessType: "LOGIN_REQUIRED"
    },
    {
      id: 3,
      author: {
        name: "Pro Trader Exclusive",
        role: "Analyst",
        avatar: "/media/avatars/3.png",
        fallback: "PT"
      },
      time: "1 hour ago",
      content: "Exclusive market analysis for Pro members only. Detailed technical setup and entry points included.",
      image: "https://images.unsplash.com/photo-1611974765270-ca12586343bb?q=80&w=1400&auto=format&fit=crop",
      host: {
        name: "Alpha Signal",
        desc: "High Probability"
      },
      views: "150",
      accessType: "PLAN_BASED",
      allowedPlans: ["PRO", "MAX"]
    }
  ];

  return (
    <>
      <div className="container py-6">
        <div className='flex justify-between items-center mb-6'>
          <header className="">
            <h1 className="text-2xl font-semibold text-black dark:text-white">Social</h1>
            <p className="text-xs text-gray-500 mt-1">Home / Social</p>
          </header>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className="btn !flex gap-2 bg-primary !text-dark cursor-pointer ">Filter <FilterIcon className='w-5' /> </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-48">
              <DropdownMenuLabel>Filter</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuRadioGroup  >
                <DropdownMenuRadioItem >
                  Email Notifications
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem >
                  SMS Notifications
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem >
                  Push Notifications
                </DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div>
          {posts.map((post) => (
            <AccessGate
              key={post.id}
              accessType={post.accessType}
              allowedPlans={post.allowedPlans}
              fallback={
                <Card className="max-w-full overflow-hidden rounded-xl shadow-md mb-5 opacity-75">
                  <CardHeader className="p-4 justify-between blur-[2px]">
                    {/* Masked Header */}
                    <div className="flex items-start gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback>?</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="h-4 w-32 bg-gray-200 rounded animate-pulse mb-2"></div>
                        <div className="h-3 w-24 bg-gray-100 rounded animate-pulse"></div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4 pt-2 flex flex-col items-center justify-center min-h-[200px] gap-3">
                    <span className="text-lg font-semibold text-gray-500">
                      {post.accessType === 'LOGIN_REQUIRED' ? "Login to view this post" : "Upgrade to view this post"}
                    </span>
                    <Button className="bg-primary text-white" disabled>
                      Locked Content
                    </Button>
                  </CardContent>
                </Card>
              }
            >
              <Card className="max-w-full overflow-hidden rounded-xl shadow-md mb-5">
                <CardHeader className="p-4 justify-between">
                  <div className="flex items-start gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={post.author.avatar} alt={post.author.name} />
                      <AvatarFallback>{post.author.fallback}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <div className="text-sm font-semibold truncate">{post.author.name} <span className="text-xs font-normal text-gray-400">• {post.author.role}</span></div>
                          <div className="text-xs text-gray-400 truncate">{post.time}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <CardToolbar>
                    <Button mode="icon" variant="outline" size="sm" className="opacity-80">
                      <Settings />
                    </Button>
                  </CardToolbar>
                </CardHeader>

                <CardContent className="p-4 pt-2">
                  <div className='mb-5'>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mt-2 line-clamp-3">{post.content} <span className="text-blue-400">...more</span></p>
                  </div>
                  <Link to="/client/viewprofile">
                    <div className="rounded-xl overflow-hidden bg-gradient-to-r from-black via-primary-600 to-green-500 h-72 relative">
                      <div className={`absolute inset-0 bg-cover bg-center opacity-60`} style={{ backgroundImage: `url('${post.image}')` }}></div>
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
                      <div className="absolute left-4 bottom-4 text-white">
                        <div className="text-xs uppercase opacity-80 tracking-wider">Hosted by</div>
                        <div className="text-lg font-bold text-primary">{post.host.name}</div>
                        <div className="text-sm opacity-90">{post.host.desc}</div>
                      </div>
                    </div>
                  </Link>
                </CardContent>

                <CardFooter className="p-4 pt-2 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Button mode="icon" variant="ghost" size="sm" className="text-gray-600 cursor-pointer hover:text-primary"><ThumbsUpIcon /></Button>
                    <Button mode="icon" variant="ghost" size="sm" className="text-gray-600 cursor-pointer hover:text-primary"><MessageCircle /></Button>
                    <Button mode="icon" variant="ghost" size="sm" className="text-gray-600 cursor-pointer hover:text-primary"><Forward /></Button>
                  </div>
                  <div className="text-xs text-gray-700">{post.views} views</div>
                </CardFooter>
              </Card>
            </AccessGate>
          ))}
        </div>
      </div>
    </>
  );
}

