import { Box, Flex, FlexProps, Heading, Link, Text } from "@chakra-ui/react";
import React from "react";

const Footer = (props: FlexProps): JSX.Element => {
  return (
    <Flex
      h={"400px"}
      bg={"black"}
      direction={"column"}
      justifyContent={"center"}
      py={"8em"}
      {...props}
    >
      <Box px={"4em"} my={"1.5em"}>
        <Heading
          lineHeight={"100%"}
          fontSize={"70px"}
          color={"white"}
          mb={"0.25em"}
        >
          vibeo.video
        </Heading>
        <Text
          letterSpacing={"0.05em"}
          fontSize={"3xl"}
          lineHeight={"100%"}
          fontWeight={"semibold"}
          color={"white"}
          mb={10}
          mt={5}
        >
          by{" "}
          <Text
            as={"a"}
            color={"brand"}
            href={"https://www.linkedin.com/in/samyok"}
          >
            samyok
          </Text>
          ,{" "}
          <Text as={"span"} color={"brand"}>
            mini
          </Text>
          ,{" "}
          <Text
            as={"a"}
            color={"brand"}
            href={"https://github.com/iCalculated"}
          >
            sasha
          </Text>
          , and{" "}
          <Text as={"span"} color={"brand"}>
            jack
          </Text>
        </Text>
      </Box>
      <Flex
        align={"center"}
        direction={"column"}
        justify={"center"}
        fontSize={"s"}
        letterSpacing={"0.18em"}
        fontFamily={"Poppins"}
        color={"white"}
      >
        <Text mb={"0.25em"}>
          <Link href={"https://github.com/MiniHacks/vibeo"}>github</Link>
          {" | "}
          <Link href={"https://devpost.com/software/vibeo"}>devpost</Link>
        </Text>
        <Text
          fontWeight={"thin"}
          fontSize={"s"}
          fontFamily={"Poppins"}
          color={"white"}
        >
          made with vibes for hackprinceton 2023
        </Text>
      </Flex>
    </Flex>
  );
};

export default Footer;
