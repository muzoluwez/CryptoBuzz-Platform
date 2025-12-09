import { createContext, useContext, useEffect, useState } from "react";
import { useLocation } from "react-router";
import { useMenuChildren } from "@/components/menu";
import { useScrollPosition } from "@/hooks/useScrollPosition";
import { useMenus } from "@/providers";
import { useLayout } from "@/providers";
import { deepMerge } from "@/utils";
import { demo1LayoutConfig } from "./";
import { useAuthContext } from "../../auth/useAuthContext";
import { sideMenus } from "../../config/menu.config";

const initalLayoutProps = {
  layout: demo1LayoutConfig,
  megaMenuEnabled: false,
  headerSticky: false,
  mobileSidebarOpen: false,
  mobileMegaMenuOpen: false,
  sidebarMouseLeave: false,
  setSidebarMouseLeave: (state) => console.log(`${state}`),
  setMobileMegaMenuOpen: (open) => console.log(`${open}`),
  setMobileSidebarOpen: (open) => console.log(`${open}`),
  setMegaMenuEnabled: (enabled) => console.log(`${enabled}`),
  setSidebarCollapse: (collapse) => console.log(`${collapse}`),
  setSidebarTheme: (mode) => console.log(`${mode}`),
};

const Demo1LayoutContext = createContext(initalLayoutProps);
const useDemo1Layout = () => useContext(Demo1LayoutContext);

const Demo1LayoutProvider = ({ children }) => {
  const { pathname } = useLocation();
  const { setMenuConfig } = useMenus();
  const { auth } = useAuthContext();

  const { getLayout, updateLayout, setCurrentLayout } = useLayout();
  const getLayoutConfig = () =>
    deepMerge(demo1LayoutConfig, getLayout(demo1LayoutConfig.name));
  const [layout, setLayout] = useState(getLayoutConfig());

  const [megaMenuEnabled, setMegaMenuEnabled] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [mobileMegaMenuOpen, setMobileMegaMenuOpen] = useState(false);
  const [sidebarMouseLeave, setSidebarMouseLeave] = useState(false);

  const scrollPosition = useScrollPosition();
  const headerSticky = scrollPosition > 0;

  /**
   * Set educator menu configuration
   * This application is educator-only, so we always use the educator menu
   */
  useEffect(() => {
    if (!auth?.user) return;

    const educatorMenu = sideMenus?.educator || [];
    const secondaryMenu = useMenuChildren(pathname, educatorMenu, 0);

    setMenuConfig("primary", educatorMenu);
    setMenuConfig("secondary", secondaryMenu);
  }, [auth, pathname, setMenuConfig]);

  // Update layout whenever state changes
  useEffect(() => {
    setCurrentLayout(layout);
  }, [layout, setCurrentLayout]);

  const setSidebarCollapse = (collapse) => {
    const updatedLayout = {
      options: {
        sidebar: { collapse },
      },
    };
    updateLayout(demo1LayoutConfig.name, updatedLayout);
    setLayout(getLayoutConfig());
  };

  const setSidebarTheme = (mode) => {
    const updatedLayout = {
      options: {
        sidebar: { theme: mode },
      },
    };
    setLayout(deepMerge(layout, updatedLayout));
  };

  return (
    <Demo1LayoutContext.Provider
      value={{
        layout,
        headerSticky,
        mobileSidebarOpen,
        mobileMegaMenuOpen,
        megaMenuEnabled,
        sidebarMouseLeave,
        setMobileSidebarOpen,
        setMegaMenuEnabled,
        setSidebarMouseLeave,
        setMobileMegaMenuOpen,
        setSidebarCollapse,
        setSidebarTheme,
      }}
    >
      {children}
    </Demo1LayoutContext.Provider>
  );
};

export { Demo1LayoutProvider, useDemo1Layout };
