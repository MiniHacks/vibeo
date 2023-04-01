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
  colors: {
    brand: "#FFC700",
  },
});
