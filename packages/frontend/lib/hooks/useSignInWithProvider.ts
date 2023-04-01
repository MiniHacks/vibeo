import { useAuth } from "reactfire";
import { FirebaseError } from "firebase/app";

import { browserPopupRedirectResolver, signInWithPopup, UserCredential } from "firebase/auth";

import { useCallback } from "react";
import { GoogleAuthProvider } from "@firebase/auth";
import { State, useRequestState } from "./useRequestState";

export type UseSignInWithProviderType = [() => Promise<void>, State<UserCredential, FirebaseError>];

const generateGoogleProvider = () => {
  const provider = new GoogleAuthProvider();
  provider.addScope("https://www.googleapis.com/auth/userinfo.email");
  provider.addScope("https://www.googleapis.com/auth/userinfo.profile");
  provider.addScope("https://www.googleapis.com/auth/calendar");
  provider.addScope("https://www.googleapis.com/auth/calendar.events");
  provider.addScope("https://www.googleapis.com/auth/calendar.settings.readonly");
  return provider;
};

export function useSignInWithProvider(): UseSignInWithProviderType {
  const auth = useAuth();

  const { state, setLoading, setData, setError } = useRequestState<UserCredential, FirebaseError>();

  const signInWithProvider = useCallback(async () => {
    const provider = generateGoogleProvider();
    setLoading(true);

    try {
      const credential = await signInWithPopup(auth, provider, browserPopupRedirectResolver);

      setData(credential);
    } catch (error) {
      setError(error as FirebaseError);
    }
  }, [auth, setData, setError, setLoading]);

  return [signInWithProvider, state] as [typeof signInWithProvider, typeof state];
}
