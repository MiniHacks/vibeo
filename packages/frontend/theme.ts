import { extendTheme } from "@chakra-ui/react";

export default extendTheme({
  initialColorMode: "light",
  styles: {
    global: () => ({
      body: {
        bg: "#FFC700",
      },
      color: {
        yellow: {
          100: "#FFC700",
        },
      },
    }),
  }
});
