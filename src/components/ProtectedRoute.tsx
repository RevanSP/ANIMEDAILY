import React, { useEffect } from 'react';
import { ProtectedRouteProps } from '../types/type';

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const isLoggedIn = localStorage.getItem('isLogin') === 'true';

  const redirectUrl =
    import.meta.env.MODE === 'production'
      ? 'https://animedaily.vercel.app/'
      : '/'; 

  useEffect(() => {
    if (!isLoggedIn) {
      window.location.href = redirectUrl;
    }
  }, [isLoggedIn, redirectUrl]);

  if (!isLoggedIn) {
    return null; 
  }

  return <>{children}</>;
};

export default ProtectedRoute;
