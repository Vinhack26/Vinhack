import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';

interface RouterContextType {
  pathname: string;
  navigate: (to: string) => void;
  params: Record<string, string>;
}

const RouterContext = createContext<RouterContextType>({
  pathname: window.location.pathname || '/',
  navigate: () => {},
  params: {},
});

export const BrowserRouter: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [pathname, setPathname] = useState<string>(() => window.location.pathname || '/');
  const [params, setParams] = useState<Record<string, string>>({});

  useEffect(() => {
    const handleLocationChange = () => {
      setPathname(window.location.pathname || '/');
    };

    window.addEventListener('popstate', handleLocationChange);
    window.addEventListener('app:navigate', handleLocationChange);
    return () => {
      window.removeEventListener('popstate', handleLocationChange);
      window.removeEventListener('app:navigate', handleLocationChange);
    };
  }, []);

  const navigate = (to: string) => {
    if (window.location.pathname !== to) {
      window.history.pushState({}, '', to);
      setPathname(to);
      window.dispatchEvent(new Event('app:navigate'));
    }
  };

  return (
    <RouterContext.Provider value={{ pathname, navigate, params: useMemo(() => params, [params]) }}>
      {children}
    </RouterContext.Provider>
  );
};

export const useNavigate = () => {
  const { navigate } = useContext(RouterContext);
  return navigate;
};

export const useLocation = () => {
  const { pathname } = useContext(RouterContext);
  return { pathname };
};

export const useParams = <T extends Record<string, string | undefined>>(): T => {
  const { pathname } = useContext(RouterContext);
  // Extract id from patterns like /incidents/:id
  const segments = pathname.split('/').filter(Boolean);
  const params: Record<string, string> = {};

  if (segments[0] === 'incidents' && segments[1] && segments[1] !== 'new') {
    params.id = segments[1];
  }

  return params as T;
};

export const Link: React.FC<{
  to: string;
  className?: string;
  children: React.ReactNode;
  onClick?: () => void;
}> = ({ to, className, children, onClick }) => {
  const { navigate } = useContext(RouterContext);

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    if (onClick) onClick();
    navigate(to);
  };

  return (
    <a href={to} onClick={handleClick} className={className}>
      {children}
    </a>
  );
};

export const Navigate: React.FC<{ to: string; replace?: boolean }> = ({ to }) => {
  const { navigate } = useContext(RouterContext);
  useEffect(() => {
    navigate(to);
  }, [to, navigate]);
  return null;
};

interface RouteProps {
  path: string;
  element: React.ReactNode;
}

export const Route: React.FC<RouteProps> = () => null;

function matchPath(pattern: string, path: string): boolean {
  if (pattern === path) return true;
  if (pattern === '*' || pattern === '/*') return true;

  const patternParts = pattern.split('/').filter(Boolean);
  const pathParts = path.split('/').filter(Boolean);

  if (patternParts.length !== pathParts.length) return false;

  return patternParts.every((part, i) => {
    if (part.startsWith(':')) return true;
    return part === pathParts[i];
  });
}

export const Routes: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { pathname } = useContext(RouterContext);

  let match: React.ReactNode = null;

  React.Children.forEach(children, (child) => {
    if (match) return;
    if (React.isValidElement<RouteProps>(child)) {
      const { path, element } = child.props;
      if (matchPath(path, pathname)) {
        match = element;
      }
    }
  });

  return <>{match}</>;
};

export default {
  BrowserRouter,
  useNavigate,
  useLocation,
  useParams,
  Link,
  Navigate,
  Routes,
  Route,
};
