import { Box, Text } from "@chakra-ui/react";
import React from "react";

const RenderTitle = ({ title }: { title: string }): JSX.Element => {
  if (!title) return <span />;
  const splitters = /:|\||-/;
  const rendered = title.split(splitters).map((word, index) => {
    if (index < 1)
      return (
        <Text
          key={word}
          fontSize={"lg"}
          fontWeight={600}
          color={"gray.700"}
          m={0}
          overflow={"hidden"}
          textOverflow={"ellipsis"}
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
        overflow={"hidden"}
        textOverflow={"ellipsis"}
        m={0}
      >
        {word}
      </Text>
    );
  });
  return (
    <Box mb={2} mt={1} mx={2} textOverflow={"ellipsis"} overflow={"hidden"}>
      {rendered}
    </Box>
  );
};

export default RenderTitle;
