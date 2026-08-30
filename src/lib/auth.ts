const TOKEN_KEY = 'authToken';
const USER_DATA_KEY = 'userData';

export const getToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
};

export const setToken = (token: string): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(TOKEN_KEY, token);
};

export const removeToken = (): void => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(TOKEN_KEY);
};

export const isAuthenticated = (): boolean => {
  return !!getToken();
};

export const getUserData = (): any | null => {
  if (typeof window === 'undefined') return null;
  const data = localStorage.getItem(USER_DATA_KEY);
  if (!data) return null;
  try {
    return JSON.parse(data);
  } catch (error) {
    console.error('Error parsing userData from localStorage', error);
    return null;
  }
};

export const setUserData = (user: any): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(USER_DATA_KEY, JSON.stringify(user));
};

export const isDirectAdminSession = (): boolean => {
  if (typeof window === 'undefined') return false;
  if (localStorage.getItem('is_direct_admin') === 'true') return true;

  // Check if communityData is a dummy global-admin marker
  const communityStr = localStorage.getItem('communityData');
  if (communityStr) {
    try {
      const comm = JSON.parse(communityStr);
      if (comm.community_uuid === 'global-admin-uuid') return true;
    } catch (e) {}
  }
  return false;
};

export const setDirectAdminSession = (isDirect: boolean): void => {
  if (typeof window === 'undefined') return;
  if (isDirect) {
    localStorage.setItem('is_direct_admin', 'true');
  } else {
    localStorage.removeItem('is_direct_admin');
  }
};

export const logout = (): void => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_DATA_KEY);
  localStorage.removeItem('is_global_admin');
  localStorage.removeItem('is_direct_admin');
  localStorage.clear();
  sessionStorage.clear();
  window.location.href = '/community';
};
