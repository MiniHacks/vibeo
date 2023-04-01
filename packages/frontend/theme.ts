import { extendTheme } from "@chakra-ui/react";

export default extendTheme({
  initialColorMode: "light",
  // body background yellow:
  styles: {
    global: () => ({
      body: {
        bg: "#FFC700",
      },
    }),
  },
  // colors:
  colors: {
    brand: {
      100: "#FFC700",
      200: "#FFC700",
      300: "#FFC700",
      400: "#FFC700",
      500: "#FFC700",
      600: "#FFC700",
      700: "#FFC700",
      800: "#FFC700",
    },
  },
});
