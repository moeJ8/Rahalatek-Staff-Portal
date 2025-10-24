export const isProtectedPage = (pathname, isAuthenticated) => {
  if (!isAuthenticated) return false; // Only protected if user is authenticated

  const protectedRoutes = [
    '/dashboard',
    '/dashboard/edit-tour',
    '/dashboard/edit-hotel',
    '/edit-office',
    '/office',
    '/client',
    '/home',
    '/booking',
    '/vouchers',
    '/edit-voucher',
    '/vouchers/new',
    '/vouchers/trash',
    '/notifications',
    '/notifications/manage',
    '/tours', // Authenticated tours page
    '/hotels', // Authenticated hotels page
    '/profile',
    '/attendance',
  ];

  return protectedRoutes.some(route => pathname.startsWith(route));
};

export const isAuthPage = (pathname) => {
  const authRoutes = [
    '/verify-email',
  ];
  return authRoutes.includes(pathname);
};

export const shouldForceLTR = (pathname, isAuthenticated) => {
  return isAuthPage(pathname) || isProtectedPage(pathname, isAuthenticated);
};

export const shouldHideLanguageSwitcher = (pathname, isAuthenticated) => {
  return shouldForceLTR(pathname, isAuthenticated);
};
