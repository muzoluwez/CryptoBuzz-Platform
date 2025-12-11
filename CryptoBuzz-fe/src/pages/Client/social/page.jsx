import {
  Toolbar,
  ToolbarHeading,
} from '@/components/layouts/layout-7/components/toolbar';
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
          <Card className="max-w-full overflow-hidden rounded-xl shadow-md mb-5">
            <CardHeader className="p-4 justify-between">
              <div className="flex items-start gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src="/media/avatars/1.png" alt="CriptoBuzz Corporate" />
                  <AvatarFallback>IQ</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <div className="text-sm font-semibold truncate">CriptoBuzz Corporate <span className="text-xs font-normal text-gray-400">• Educator</span></div>
                      <div className="text-xs text-gray-400 truncate">about 7 hours ago</div>
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
                <p className="text-sm text-gray-600 dark:text-gray-300 mt-2 line-clamp-3">Lorem ipsum dolor sit amet, consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris <span className="text-blue-400">...more</span></p>
              </div>
              <Link to="/client/viewprofile">
                <div className="rounded-xl overflow-hidden bg-gradient-to-r from-black via-primary-600 to-green-500 h-72 relative">
                  <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1545239351-1141bd82e8a6?q=80&w=1400&auto=format&fit=crop')] bg-cover bg-center opacity-60"></div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
                  <div className="absolute left-4 bottom-4 text-white">
                    <div className="text-xs uppercase opacity-80 tracking-wider">Hosted by</div>
                    <div className="text-lg font-bold text-primary">Lorem Ipsum</div>
                    <div className="text-sm opacity-90">Dolor Sit Amet</div>
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
              <div className="text-xs text-gray-700">1.2K views</div>
            </CardFooter>
          </Card>
          <Card className="max-w-full overflow-hidden rounded-xl shadow-md mb-5">
            <CardHeader className="p-4 justify-between">
              <div className="flex items-start gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src="/media/avatars/1.png" alt="CriptoBuzz Corporate" />
                  <AvatarFallback>IQ</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <div className="text-sm font-semibold truncate">CriptoBuzz Corporate <span className="text-xs font-normal text-gray-400">• Educator</span></div>
                      <div className="text-xs text-gray-400 truncate">about 7 hours ago</div>
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
                <p className="text-sm text-gray-600 dark:text-gray-300 mt-2 line-clamp-3">Sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquam erat volutpat. Sed diam voluptua at vero eos et accusam et justo duo dolores et ea rebum stet clita <span className="text-blue-400">...more</span></p>
              </div>
              <Link to="/client/viewprofile">
                <div className="rounded-xl overflow-hidden bg-gradient-to-r from-black via-primary-600 to-green-500 h-72 relative">
                  <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1545239351-1141bd82e8a6?q=80&w=1400&auto=format&fit=crop')] bg-cover bg-center opacity-60"></div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
                  <div className="absolute left-4 bottom-4 text-white">
                    <div className="text-xs uppercase opacity-80 tracking-wider">Hosted by</div>
                    <div className="text-lg font-bold text-primary">Consectetur Adipiscing</div>
                    <div className="text-sm opacity-90">Elit Sed Do</div>
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
              <div className="text-xs text-gray-700">1.2K views</div>
            </CardFooter>
          </Card>
          <Card className="max-w-full overflow-hidden rounded-xl shadow-md mb-5">
            <CardHeader className="p-4 justify-between">
              <div className="flex items-start gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src="/media/avatars/1.png" alt="CriptoBuzz Corporate" />
                  <AvatarFallback>IQ</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <div className="text-sm font-semibold truncate">CriptoBuzz Corporate <span className="text-xs font-normal text-gray-400">• Educator</span></div>
                      <div className="text-xs text-gray-400 truncate">about 7 hours ago</div>
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
                <p className="text-sm text-gray-600 dark:text-gray-300 mt-2 line-clamp-3">Eiusmod tempor invidunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat duis aute irure dolor <span className="text-blue-400">...more</span></p>
              </div>
              <Link to="/client/viewprofile">
                <div className="rounded-xl overflow-hidden bg-gradient-to-r from-black via-primary-600 to-green-500 h-72 relative">
                  <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1545239351-1141bd82e8a6?q=80&w=1400&auto=format&fit=crop')] bg-cover bg-center opacity-60"></div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
                  <div className="absolute left-4 bottom-4 text-white">
                    <div className="text-xs uppercase opacity-80 tracking-wider">Hosted by</div>
                    <div className="text-lg font-bold text-primary">Incididunt Ut Labore</div>
                    <div className="text-sm opacity-90">Et Dolore Magna</div>
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
              <div className="text-xs text-gray-700">1.2K views</div>
            </CardFooter>
          </Card>
        </div>
      </div>
    </>
  );
}

