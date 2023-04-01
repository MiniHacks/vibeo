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
  // font family:
  fonts: {
    heading: "Patrick Hand",
    body: "Poppins",
  },
  // input:
  components: {
    Input: {
      baseStyle: {
        field: {
          border: "0px solid",
          bg: "gray.50",
          borderTopRightRadius: "full",
          borderBottomRightRadius: "full",
          _dark: {
            bg: "whiteAlpha.50",
          },

          _hover: {
            bg: "gray.200",
            _dark: {
              bg: "whiteAlpha.100",
            },
          },
          _readOnly: {
            boxShadow: "none !important",
            userSelect: "all",
          },
          _focusVisible: {
            bg: "gray.200",
            _dark: {
              bg: "whiteAlpha.100",
            },
          },
        },
        addon: {
          border: "0px solid",
          borderColor: "transparent",
          borderTopLeftRadius: "full",
          borderBottomLeftRadius: "full",
          color: "white",
        },
        element: {
          bg: "white",
          rounded: "full",
          border: "1px solid",
          borderColor: "gray.100",
          _dark: {
            bg: "whiteAlpha.50",
            borderColor: "whiteAlpha.100",
          },
        },
      },
    },
  },
});
