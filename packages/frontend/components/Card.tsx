import { Box, BoxProps } from "@chakra-ui/react";

export default function Card(props: BoxProps): JSX.Element {
  return (
    <Box
      bg={"white"}
      borderWidth={"3px"}
      borderColor={"black"}
      borderRadius={"lg"}
      overflow={"hidden"}
      boxShadow={"-8px 10px 0px black"}
      px={4}
      py={2}
      {...props}
    />
  );
}
