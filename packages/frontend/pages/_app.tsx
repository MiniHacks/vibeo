import * as React from "react";
import App, { AppContext, AppProps } from "next/app";
import { ChakraProvider } from "@chakra-ui/react";
import { initializeApp } from "firebase/app";
import {
  connectAuthEmulator,
  indexedDBLocalPersistence,
  initializeAuth,
  inMemoryPersistence,
} from "firebase/auth";
import {
  AuthProvider,
  DatabaseProvider,
  FirebaseAppProvider,
  FirestoreProvider,
} from "reactfire";

import { getFirestore } from "@firebase/firestore";
import { getDatabase } from "@firebase/database";
import theme from "../theme";
import configuration from "../configuration";
import { isBrowser } from "../lib/generic/isBrowser";

function getAuthEmulatorHost() {
  const host = process.env.NEXT_PUBLIC_FIREBASE_EMULATOR_HOST;
  const port = process.env.NEXT_PUBLIC_FIREBASE_AUTH_EMULATOR_PORT;

  return ["http://", host, ":", port].join("");
}

function MyApp(props: AppProps): JSX.Element {
  const { Component, pageProps } = props;

  // polyfill for rxdb
  if (typeof window !== "undefined" && !("global" in window)) {
    // polyfill for rxjs
    (window as any).global = window;
  }

  // we initialize the firebase app
  // using the configuration that we defined above
  const app = initializeApp(configuration.firebase);

  // make sure we're not using IndexedDB when SSR
  // as it is only supported on browser environments
  const persistence = isBrowser()
    ? indexedDBLocalPersistence
    : inMemoryPersistence;
  const auth = initializeAuth(app, { persistence });
  // prevent emulator from being
  // called multiple times on page navigations
  if (configuration.emulator && !("emulator" in auth.config)) {
    // we can get the host by
    // combining the local emulator host with the Auth port
    const host = getAuthEmulatorHost();
    connectAuthEmulator(auth, host, { disableWarnings: true });
  }

  return (
    <FirebaseAppProvider firebaseApp={app}>
      <AuthProvider sdk={auth}>
        <FirestoreProvider sdk={getFirestore(app)}>
          <DatabaseProvider sdk={getDatabase(app)}>
            <ChakraProvider theme={theme}>
              <Component {...pageProps} />
            </ChakraProvider>
          </DatabaseProvider>
        </FirestoreProvider>
      </AuthProvider>
    </FirebaseAppProvider>
  );
}

// 🚨 this disables all server-side rendering for this app o.o
//      this is probably fine as the data should theoretically all client-side
//      or this is an electron app -- so we don't need SSR anyway.
MyApp.getInitialProps = async (appContext) => {
  const appProps = await App.getInitialProps(appContext);

  return { ...appProps };
};

export default MyApp;
