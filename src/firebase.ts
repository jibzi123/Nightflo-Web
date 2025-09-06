import { initializeApp } from "firebase/app";
import { getMessaging, getToken, deleteToken } from "firebase/messaging";

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID",
};

const app = initializeApp(firebaseConfig);
export const messaging = getMessaging(app);

export async function getFirebaseToken() {
  try {
    const token = await getToken(messaging, {
      vapidKey: "YOUR_VAPID_KEY", // from Firebase Console → Project Settings → Cloud Messaging
    });
    return token;
  } catch (err) {
    console.error("Error getting Firebase token:", err);
    return "";
  }
}

export async function clearFirebaseToken() {
  try {
    await deleteToken(messaging);
  } catch (err) {
    console.error("Error clearing Firebase token:", err);
  }
}
