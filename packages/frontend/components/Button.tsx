import { motion } from "framer-motion";
import { Button as ChakraButton, ButtonProps } from "@chakra-ui/react";
import { CardProps } from "./Card";

export default function Button(props: ButtonProps): JSX.Element {
  return (
    <ChakraButton
      as={motion.button}
      {...CardProps}
      colorScheme={"purple"}
      whileTap={{
        transform: "translateX(-4px) translateY(5px)",
        boxShadow: "-2px 3px 0px black",
      }}
      transition={{
        type: "spring",
      }}
      {...props}
    />
  );
}
