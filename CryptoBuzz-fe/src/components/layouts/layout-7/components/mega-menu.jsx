import { Link, useLocation } from 'react-router-dom';
import { MENU_MEGA } from '@/config/layout-7.config';
import { cn } from '@/lib/utils';
import { useMenu } from '@/hooks/use-menu';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from '@/components/ui/navigation-menu';
import { MegaMenuSubAccount } from '../../layout-1/shared/mega-menu/mega-menu-sub-account';
import { MegaMenuSubAuth } from '../../layout-1/shared/mega-menu/mega-menu-sub-auth';
import { MegaMenuSubNetwork } from '../../layout-1/shared/mega-menu/mega-menu-sub-network';
import { MegaMenuSubProfiles } from '../../layout-1/shared/mega-menu/mega-menu-sub-profiles';
import { MegaMenuSubStore } from '../../layout-1/shared/mega-menu/mega-menu-sub-store';

export function MegaMenu() {
  const { pathname } = useLocation();
  const { isActive, hasActiveChild } = useMenu(pathname);
  const homeItem = MENU_MEGA[0];
  const publicProfilesItem = MENU_MEGA[1];
  const myAccountItem = MENU_MEGA[2];
  const networkItem = MENU_MEGA[3];
  const storeItem = MENU_MEGA[5];
  const authItem = MENU_MEGA[4];
  const linkClass = `
  relative text-sm font-medium text-white px-0 py-2 transition-all duration-200
  hover:text-gray-light
  before:absolute before:-bottom-1 before:left-0 before:h-[2px] before:w-0 before:bg-white before:transition-all before:duration-300
  hover:before:w-full
  data-[active=true]:text-mono data-[active=true]:before:w-full data-[active=true]:before:bg-white
`;

  return (
    <NavigationMenu>
      <NavigationMenuList className="gap-7.5">
        {/* Home Item */}
        <NavigationMenuItem>
          <NavigationMenuLink asChild>
            <Link
              to="/client/home"
              className={cn(linkClass)}
              data-active={isActive('/client/home') || undefined}
            >
              Home
            </Link>
          </NavigationMenuLink>
        </NavigationMenuItem>

        <NavigationMenuItem>
          <NavigationMenuLink asChild>
            <Link
              to="/client/academy"
              className={cn(linkClass)}
              data-active={isActive('/client/academy') || undefined}
            >
              Academy
            </Link>
          </NavigationMenuLink>
        </NavigationMenuItem>

        <NavigationMenuItem>
          <NavigationMenuLink asChild>
            <Link
              to="/client/live"
              className={cn(linkClass)}
              data-active={isActive('/client/live') || undefined}
            >
              Live
            </Link>
          </NavigationMenuLink>
        </NavigationMenuItem>

        <NavigationMenuItem>
          <NavigationMenuLink asChild>
            <Link
              to="/client/analysis"
              className={cn(linkClass)}
              data-active={isActive('/client/analysis') || undefined}
            >
              Analysis
            </Link>
          </NavigationMenuLink>
        </NavigationMenuItem>

        <NavigationMenuItem>
          <NavigationMenuLink asChild>
            <Link
              to="/client/idea"
              className={cn(linkClass)}
              data-active={isActive('/client/idea') || undefined}
            >
              Idea
            </Link>
          </NavigationMenuLink>
        </NavigationMenuItem>

        <NavigationMenuItem>
          <NavigationMenuLink asChild>
            <Link
              to="/client/blog"
              className={cn(linkClass)}
              data-active={isActive('/client/blog') || undefined}
            >
              Blog
            </Link>
          </NavigationMenuLink>
        </NavigationMenuItem>

        <NavigationMenuItem>
          <NavigationMenuLink asChild>
            <Link
              to="/client/journaling"
              className={cn(linkClass)}
              data-active={isActive('/client/journaling') || undefined}
            >
              Journaling
            </Link>
          </NavigationMenuLink>
        </NavigationMenuItem>

        <NavigationMenuItem>
          <NavigationMenuLink asChild>
            <Link
              to="/client/social"
              className={cn(linkClass)}
              data-active={isActive('/client/social') || undefined}
            >
              Social
            </Link>
          </NavigationMenuLink>
        </NavigationMenuItem>

        {/* Public Profiles Item */}
        {/* <NavigationMenuItem>
          <NavigationMenuTrigger
            className={cn(linkClass)}
            data-active={
              hasActiveChild(publicProfilesItem.children) || undefined
            }
          >
            {publicProfilesItem.title}
          </NavigationMenuTrigger>
          <NavigationMenuContent className="p-0">
            <MegaMenuSubProfiles items={MENU_MEGA} />
          </NavigationMenuContent>
        </NavigationMenuItem> */}

        {/* My Account Item */}
        {/* <NavigationMenuItem>
          <NavigationMenuTrigger
            className={cn(linkClass)}
            data-active={hasActiveChild(myAccountItem.children) || undefined}
          >
            {myAccountItem.title}
          </NavigationMenuTrigger>
          <NavigationMenuContent className="p-0">
            <MegaMenuSubAccount items={MENU_MEGA} />
          </NavigationMenuContent>
        </NavigationMenuItem> */}

        {/* Network Item */}
        {/* <NavigationMenuItem>
          <NavigationMenuTrigger
            className={cn(linkClass)}
            data-active={
              hasActiveChild(networkItem.children || []) || undefined
            }
          >
            {networkItem.title}
          </NavigationMenuTrigger>
          <NavigationMenuContent className="p-0">
            <MegaMenuSubNetwork items={MENU_MEGA} />
          </NavigationMenuContent>
        </NavigationMenuItem> */}

        {/* Store Item */}
        {/* <NavigationMenuItem>
          <NavigationMenuTrigger
            className={cn(linkClass)}
            data-active={hasActiveChild(storeItem.children || []) || undefined}
          >
            {storeItem.title}
          </NavigationMenuTrigger>
          <NavigationMenuContent className="p-0">
            <MegaMenuSubStore items={MENU_MEGA} />
          </NavigationMenuContent>
        </NavigationMenuItem> */}

        {/* Authentication Item */}
        {/* <NavigationMenuItem>
          <NavigationMenuTrigger
            className={cn(linkClass)}
            data-active={hasActiveChild(authItem.children) || undefined}
          >
            {authItem.title}
          </NavigationMenuTrigger>
          <NavigationMenuContent className="p-0">
            <MegaMenuSubAuth items={MENU_MEGA} />
          </NavigationMenuContent>
        </NavigationMenuItem> */}
      </NavigationMenuList>
    </NavigationMenu>
  );
}
