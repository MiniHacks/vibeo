import { Box, HStack, useToken } from "@chakra-ui/react";
import React from "react";
import Button from "../Button";
import Card from "../Card";
import ColorPicker from "./ColorPicker";

export default function CanvasToolbar({
  onSetColor,
}: {
  onSetColor: (color: string) => void;
}): JSX.Element {
  const colors = [
    "pink.500",
    "gray.500",
    "red.500",
    "gray.700",
    "green.500",
    "blue.500",
    "blue.800",
    "yellow.300",
    "orange.500",
    "purple.500",
  ];

  const tokens = useToken("colors", colors);
  return (
    <HStack mt={5} spacing={3} justifyContent={"flex-end"}>
      <Button colorScheme={"yellow"} onClick={() => null}>
        Clear
      </Button>
      <Button
        bg={"white"}
        _active={{ bg: "white" }}
        _hover={{ bg: "white" }}
        p={2}
      >
        {/* Color */}
        <ColorPicker onSetColor={onSetColor} colors={tokens} />
      </Button>
      {/* <Box flexGrow={1} /> */}
      <Button colorScheme={"blue"} zIndex={-1}>
        Save
      </Button>
    </HStack>
  );
}
