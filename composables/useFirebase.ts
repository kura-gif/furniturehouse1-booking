import type { Firestore } from "firebase/firestore";
import type { Auth } from "firebase/auth";
import type { FirebaseStorage } from "firebase/storage";

/**
 * Firebase instances with proper type safety
 * Throws an error if Firebase is not initialized
 */
export const useFirebase = () => {
  const { $db, $auth, $storage } = useNuxtApp();

  const getFirestore = (): Firestore => {
    if (!$db) {
      throw new Error("Firestore is not initialized");
    }
    return $db;
  };

  const getAuth = (): Auth => {
    if (!$auth) {
      throw new Error("Firebase Auth is not initialized");
    }
    return $auth;
  };

  const getStorage = (): FirebaseStorage => {
    if (!$storage) {
      throw new Error("Firebase Storage is not initialized");
    }
    return $storage;
  };

  const isFirebaseInitialized = (): boolean => {
    return !!$db && !!$auth;
  };

  return {
    getFirestore,
    getAuth,
    getStorage,
    isFirebaseInitialized,
  };
};
