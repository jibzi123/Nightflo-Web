const KEYS = {
  USERINFO: "userInfo",
  REMEMBER_EMAIL: "rememberEmail",
  FIREBASE_TOKEN: "firebaseToken",
};

export const storeFirebaseToken = (firebase: string) => {
  localStorage.setItem(KEYS.FIREBASE_TOKEN, firebase);
};

export const getFirebaseToken = () => {
  return localStorage.getItem(KEYS.FIREBASE_TOKEN);
};

export const storeUserData = (value: any) => {
  localStorage.setItem(KEYS.USERINFO, JSON.stringify(value));
};

export const getUserData = () => {
  const value = localStorage.getItem(KEYS.USERINFO);
  return value ? JSON.parse(value) : null;
};

export const storeRememberMe = (email: string) => {
  localStorage.setItem(KEYS.REMEMBER_EMAIL, email);
};

export const getRememberedEmail = () => {
  return localStorage.getItem(KEYS.REMEMBER_EMAIL);
};

export const clearStorage = () => {
  localStorage.clear();
};
