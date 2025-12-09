import {
  BookOpen,
  CalendarClock,
  ChartCandlestick,
  CircleDot,
  Dot,
  LayoutDashboard,
  Lightbulb,
  PlayCircle,
  ChartNoAxesCombined,
  MessageCircleMore,
  Star,
} from "lucide-react";

export const MENU_MEGA = [];

/**
 * Educator-only sidebar menu configuration
 * Defines the navigation structure for the educator dashboard
 */
export const sideMenus = {
  educator: [
    {
      title: "Dashboard",
      icon: <LayoutDashboard />,
      path: "/",
    },
    {
      title: "Academy",
      icon: <BookOpen />,
      path: "/educator/courses",
    },
    {
      title: "IQ Live",
      icon: <CalendarClock />,
      children: [
        {
          title: "Live Schedule",
          icon: <CalendarClock />,
          path: "/educator/stream-schedule",
        },
        {
          title: "Ended Schedule",
          icon: <CalendarClock />,
          path: "/educator/ended-stream-schedule",
        },
        {
          title: "Live Sessions",
          icon: <PlayCircle />,
          path: "/educator/live-session",
        },
        {
          title: "Ended Sessions",
          icon: <PlayCircle />,
          path: "/educator/ended-live-sessions",
        },
      ],
    },
    {
      title: "Recorded Live",
      icon: <CircleDot />,
      path: "/educator/stream-recording/list",
    },
    {
      title: "IQ Insight",
      icon: <ChartCandlestick />,
      path: "/educator/trade-analysis",
    },
    {
      title: "IQ Ideas",
      icon: <Lightbulb />,
      path: "/educator/ideas",
    },
    {
      title: "IQ Strategies",
      icon: <ChartNoAxesCombined />,
      children: [
        {
          title: "IQ Charts",
          icon: <Dot />,
          path: "https://www.iqcharts.com/",
          externalLink: true,
          newTab: true,
        },
      ],
    },
    {
      title: "IQ Social",
      icon: <MessageCircleMore />,
      path: "/educator/iq-social",
    },
    {
      title: "Educator Ratings",
      icon: <Star />,
      path: "/educator/rating",
    },
  ],
};

/**
 * Filter sidebar menu based on allowed routes from user plan
 * @param {Array} menu - Full menu configuration
 * @param {Array} allowedRoutes - Routes allowed by user's plan
 * @returns {Array} Filtered menu items
 */
export const filterSidebarByPlan = (menu, allowedRoutes) => {
  if (!allowedRoutes || allowedRoutes.length === 0) return menu;

  return menu
    .map((item) => {
      // If item has children, filter them recursively
      if (item?.children) {
        const filteredChildren = item.children.filter((child) =>
          allowedRoutes.includes(child?.path)
        );
        if (filteredChildren.length > 0) {
          return { ...item, children: filteredChildren };
        }
        return null;
      }

      // Check if the item's path is in allowed routes
      if (allowedRoutes.includes(item?.path)) {
        return item;
      }

      return null;
    })
    .filter(Boolean); // Remove null items
};
