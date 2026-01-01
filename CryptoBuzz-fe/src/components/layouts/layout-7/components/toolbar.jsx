import { Fragment, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { MENU_MEGA } from '@/config/layout-7.config';
import { cn } from '@/lib/utils';
import { useMenu } from '@/hooks/use-menu';


function Toolbar({ children }) {
  return (
    <div className="container">
      {/* <div className="border-t border-border"></div> */}
      <div className="flex items-center justify-between flex-wrap gap-2 la:gap-5 my-5">
        {children}
      </div>
      {/* <div className="border-b border-border mb-5 lg:mb-7.5"></div> */}
    </div>
  );
}

function ToolbarActions({ children }) {
  return (
    <div className="flex items-center gap-2 text-sm font-normal text-gray-700">
      {children}
    </div>
  );
}

function ToolbarBreadcrumbs() {
  const { pathname } = useLocation();
  const { getBreadcrumb, isActive } = useMenu(pathname);
  const items = getBreadcrumb(MENU_MEGA);

  if (items.length === 0) {
    return null;
  }

  return (
    <div className="flex items-center gap-1 text-sm">
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        const active = item.path ? isActive(item.path) : false;

        return (
          <Fragment key={index}>
            {item.path ? (
              <Link
                to={item.path}
                className={cn(
                  'flex items-center gap-1',
                  active
                    ? 'text-mono'
                    : 'text-secondary-foreground hover:text-primary',
                )}
              >
                {item.title}
              </Link>
            ) : (
              <span
                className={cn(
                  isLast ? 'text-mono' : 'text-secondary-foreground',
                )}
              >
                {item.title}
              </span>
            )}
            {!isLast && <span className="text-muted-foreground">/</span>}
          </Fragment>
        );
      })}
    </div>
  );
}



function ToolbarHeading({ title = '', description = '' }) {
  const { pathname } = useLocation();
  const { getCurrentItem } = useMenu(pathname);
  const item = getCurrentItem(MENU_MEGA);

  // Update document title so browser tab shows the page name instead of URL
  useEffect(() => {
    const pageTitle = title || item?.title || 'CryptoBuzz';
    document.title = `${pageTitle} - CryptoBuzz`;
  }, [title, item?.title]);

  return (
    <div className="flex flex-col gap-1">
      <h1 className="text-2xl font-semibold text-black dark:text-white">
        {title || item?.title}
      </h1>
      {description && (
        <p className="text-sm text-gray-500 mt-1">{description}</p>
      )}
      <ToolbarBreadcrumbs />
    </div>
  );
}

export { Toolbar, ToolbarActions, ToolbarBreadcrumbs, ToolbarHeading };