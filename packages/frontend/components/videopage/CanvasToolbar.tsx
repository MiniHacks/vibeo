import { Box, HStack, useToken } from "@chakra-ui/react";
import React, { useState } from "react";
import Button from "../Button";
import Card from "../Card";
import ColorPicker from "./ColorPicker";

export default function CanvasToolbar({
  onSetColor,
  onSave,
}: {
  onSetColor: (color: string) => void;
  onSave: () => Promise<void>;
}): JSX.Element {
  const [isSaving, setIsSaving] = useState(false);
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
  const clear = () => {
    if (typeof window !== "undefined")
      window.document
        ?.querySelector("canvas")
        ?.getContext("2d")
        ?.clearRect(0, 0, 10000, 10000);
  };
  return (
    <HStack spacing={3} justifyContent={"flex-end"}>
      <Button colorScheme={"yellow"} onClick={() => clear()}>
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
      <Button
        colorScheme={"blue"}
        onClick={() => {
          setIsSaving(true);
          onSave().then(() => {
            setIsSaving(false);
            clear();
          });
        }}
        isLoading={isSaving}
      >
        Save
      </Button>
    </HStack>
  );
}
