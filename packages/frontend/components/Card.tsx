import { Box, BoxProps } from "@chakra-ui/react";

export const CardProps = {
  border: "3px solid black",
  borderRadius: "lg",
  boxShadow: "-5px 7px 0px black",
};
export default function Card(props: BoxProps): JSX.Element {
  return (
    <Box
      bg={"white"}
      overflow={"hidden"}
      px={4}
      py={2}
      {...CardProps}
      {...props}
    />
  );
}
