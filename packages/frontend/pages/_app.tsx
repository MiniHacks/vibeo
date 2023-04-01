import * as React from "react";
import type { AppProps } from "next/app";
import { ChakraProvider } from "@chakra-ui/react";
import { initializeApp } from "firebase/app";
import {
  connectAuthEmulator,
  indexedDBLocalPersistence,
  initializeAuth,
  inMemoryPersistence,
} from "firebase/auth";
import { FirebaseAppProvider, AuthProvider } from "reactfire";

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
        <ChakraProvider theme={theme}>
          <Component {...pageProps} />
        </ChakraProvider>
      </AuthProvider>
    </FirebaseAppProvider>
  );
}

export default MyApp;
