import { Box, Text } from "@chakra-ui/react";
import React from "react";

const RenderTitle = ({ title }: { title: string }): JSX.Element => {
  const splitters = /:|\|/;
  const rendered = title.split(splitters).map((word, index) => {
    if (index < 1)
      return (
        <Text
          key={word}
          fontSize={"lg"}
          fontWeight={600}
          color={"gray.700"}
          m={0}
        >
          {word}
        </Text>
      );
    return (
      <Text
        key={word}
        fontSize={"sm"}
        fontWeight={400}
        color={"gray.600"}
        display={"inline"}
        m={0}
      >
        {word}
      </Text>
    );
  });
  return (
    <Box mb={3} mx={2}>
      {rendered}
    </Box>
  );
};

export default RenderTitle;
