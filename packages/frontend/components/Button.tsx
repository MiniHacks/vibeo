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
        transform: "translateX(-6px) translateY(6px)",
        boxShadow: "-4px 6px 0px black",
      }}
      transition={{
        ease: "easeOut",
        duration: "200ms",
      }}
      {...props}
    />
  );
}
