import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Globe,
  Moon,
  UserCircle,
} from 'lucide-react';
import { useTheme } from 'next-themes';
import { Link, useNavigate } from 'react-router';
import { toAbsoluteUrl } from '@/lib/helpers';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Switch } from '@/components/ui/switch';
import { useAuthContext } from '@/context/AuthContext';
import { useGetLanguagesQuery } from '@/store/client/clientLanguageApiSlice';
import {
  selectLanguages,
  selectSelectedLanguage,
  setLanguages,
  setSelectedLanguage,
} from '@/store/languageSlice';

// Default language fallback
const DEFAULT_LANGUAGE = {
  _id: 'default',
  name: 'English',
};

export function UserDropdownMenu({ trigger }) {
  const dispatch = useDispatch();
  const { theme, setTheme } = useTheme();
  const { user, logout } = useAuthContext();
  const navigate = useNavigate();

  // Redux selectors
  const languages = useSelector(selectLanguages);
  const selectedLanguage = useSelector(selectSelectedLanguage);

  // Fetch languages from backend
  const { data: languagesData, isSuccess } = useGetLanguagesQuery();

  // Update Redux store when languages are fetched
  useEffect(() => {
    if (isSuccess && languagesData?.data) {
      dispatch(setLanguages(languagesData?.data));
    }
  }, [isSuccess, languagesData, dispatch]);

  // Handle language change - pass _id to the reducer
  const handleLanguageChange = (langId) => {
    dispatch(setSelectedLanguage(langId));
  };

  const handleThemeToggle = (checked) => {
    setTheme(checked ? 'dark' : 'light');
  };

  const handleLogout = () => {
    logout();
    navigate('/client/home');
  };

  // Get user data with fallbacks
  const userName = user?.name ||
    (user?.first_name && user?.last_name
      ? `${user?.first_name} ${user?.last_name}`
      : user?.first_name || user?.email?.split('@')?.[0] || 'User');

  const userEmail = user?.email || '';

  // Get user image with default fallback
  const userImage = user?.image ||
    toAbsoluteUrl('/media/avatars/300-2.png');

  // Get user initials for fallback
  const getUserInitials = () => {
    if (user?.first_name && user?.last_name) {
      return `${user?.first_name?.[0]}${user?.last_name?.[0]}`?.toUpperCase();
    }
    if (user?.name) {
      const names = user?.name?.split(' ');
      if (names?.length >= 2) {
        return `${names?.[0]?.[0]}${names?.[1]?.[0]}`?.toUpperCase();
      }
      return user?.name?.[0]?.toUpperCase();
    }
    if (user?.email) {
      return user?.email?.[0]?.toUpperCase();
    }
    return 'U';
  };

  // Use selected language or default
  const currentLanguage = selectedLanguage || DEFAULT_LANGUAGE;
  const displayLanguages = languages?.length > 0 ? languages : [DEFAULT_LANGUAGE];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>{trigger}</DropdownMenuTrigger>
      <DropdownMenuContent className="w-64" side="bottom" align="end">
        {/* Header */}
        <div className="flex items-center justify-between p-3">
          <div className="flex items-center gap-2">
            {userImage && userImage !== toAbsoluteUrl('/media/avatars/300-2.png') ? (
              <img
                className="size-9 rounded-full border-2 border-green-500 object-cover"
                src={userImage}
                alt="User avatar"
                onError={(e) => {
                  // Fallback to default image if user image fails to load
                  e.target.src = toAbsoluteUrl('/media/avatars/300-2.png');
                }}
              />
            ) : (
              <div className="size-9 rounded-full border-2 border-green-500 bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center text-white font-semibold text-sm">
                {getUserInitials()}
              </div>
            )}

            <div className="flex flex-col">
              <Link
                to="/client/profile"
                className="text-sm text-mono hover:text-primary font-semibold"
              >
                {userName}
              </Link>
              {userEmail && (
                <a
                  href={`mailto:${userEmail}`}
                  className="text-xs text-muted-foreground hover:text-primary"
                >
                  {userEmail}
                </a>
              )}
            </div>
          </div>
          {user?.subscription?.plan && user?.subscription?.plan !== 'FREE' && (
            <Badge variant="primary" appearance="light" size="sm">
              {user?.subscription?.plan === 'PRO' ? 'Pro' : user?.subscription?.plan}
            </Badge>
          )}
        </div>

        <DropdownMenuSeparator />

        {/* Menu Items */}
        <DropdownMenuItem asChild>
          <Link to="#" className="flex items-center gap-2">
            <UserCircle />
            My Profile
          </Link>
        </DropdownMenuItem>

        {/* Language Submenu with Radio Group */}
        <DropdownMenuSub>
          <DropdownMenuSubTrigger className="flex items-center gap-2 [&_[data-slot=dropdown-menu-sub-trigger-indicator]]:hidden hover:[&_[data-slot=badge]]:border-input data-[state=open]:[&_[data-slot=badge]]:border-input">
            <Globe />
            <span className="flex items-center justify-between gap-2 grow relative">
              Language
              <Badge
                variant="outline"
                className="absolute end-0 top-1/2 -translate-y-1/2"
              >
                {currentLanguage?.name || 'English'}
              </Badge>
            </span>
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent className="w-48">
            <DropdownMenuRadioGroup
              value={currentLanguage?._id}
              onValueChange={handleLanguageChange}
            >
              {displayLanguages?.map((item) => (
                <DropdownMenuRadioItem
                  key={item?._id}
                  value={item?._id}
                  className="flex items-center gap-2"
                >
                  <span>{item?.name}</span>
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
          </DropdownMenuSubContent>
        </DropdownMenuSub>

        <DropdownMenuSeparator />

        {/* Footer */}
        <DropdownMenuItem
          className="flex items-center gap-2"
          onSelect={(event) => event.preventDefault()}
        >
          <Moon />
          <div className="flex items-center gap-2 justify-between grow">
            Dark Mode
            <Switch
              size="sm"
              checked={theme === 'dark'}
              onCheckedChange={handleThemeToggle}
            />
          </div>
        </DropdownMenuItem>
        <div className="p-2 mt-1">
          <Button
            variant="outline"
            size="sm"
            className="w-full"
            onClick={handleLogout}
          >
            Logout
          </Button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
