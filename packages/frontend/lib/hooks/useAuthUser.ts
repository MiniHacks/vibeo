import { useEffect, useState } from "react";
import { useAuth, useSigninCheck } from "reactfire";
import firebase from "firebase/compat";

export type UseAuthUserType = {
  authUser: firebase.User | null;
  loading: boolean;
};
export default function useAuthUser(): UseAuthUserType {
  const [authUser, setAuthUser] = useState<firebase.User | null>(null);
  const [loading, setLoading] = useState(true);
  const auth = useAuth();
  const { status } = useSigninCheck();

  useEffect(() => {
    if (status === "loading") {
      return () => {};
    }

    setLoading(false);
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setAuthUser(user as firebase.User | null);
    });

    return () => unsubscribe();
  }, [auth, status]);

  return { authUser, loading };
}
