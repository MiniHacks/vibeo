import { ColorModeScript } from "@chakra-ui/react";
import { Head, Html, Main, NextScript } from "next/document";
import theme from "../theme";

export default function Document(): JSX.Element {
  return (
    <Html lang={"en"}>
      <Head>
        <link rel={"preconnect"} href={"https://fonts.googleapis.com"} />
        <link rel={"preconnect"} href={"https://fonts.gstatic.com"} />
        <link
          href="https://fonts.googleapis.com/css2?family=Patrick+Hand&family=Poppins:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap"
          rel={"stylesheet"}
        />
      </Head>
      <body>
        <ColorModeScript initialColorMode={theme.config.initialColorMode} />
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
