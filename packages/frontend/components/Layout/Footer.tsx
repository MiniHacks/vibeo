import { Box, Flex, HStack, Link, Text, VStack } from "@chakra-ui/react";
import React from "react";

const Footer = (): JSX.Element => {
  return (
    <Box>
      <Flex h={"160px"} bg={"black"} justifyContent={"center"}>
        <HStack justifyContent={"space-between"}>
          <VStack alignItems={"left"}>
            <Text
              lineHeight={"100%"}
              m={0}
              p={0}
              fontSize={"3xl"}
              color={"white"}
            >
              vibeo
            </Text>
            <Text
              letterSpacing={"0.05em"}
              lineHeight={"100%"}
              m={0}
              p={0}
              fontWeight={"semibold"}
              color={"white"}
            >
              by{" "}
              <Text as={"span"} color={"brand"}>
                samyok
              </Text>
              ,{" "}
              <Text as={"span"} color={"brand"}>
                mini
              </Text>
              ,{" "}
              <Text as={"span"} color={"brand"}>
                sasha
              </Text>
              , and{" "}
              <Text as={"span"} color={"brand"}>
                jack
              </Text>
            </Text>
            <Flex
              align={"center"}
              direction={"column"}
              justify={"center"}
              fontSize={"xs"}
              letterSpacing={"0.18em"}
              fontFamily={"Poppins"}
              color={"white"}
            >
              <Text>
                <Link href={"https://github.com/MiniHacks/vibeo"}>github</Link>
                {" | "}
                <Link href={"https://devpost.com/software/vibeo"}>devpost</Link>
              </Text>
              <Text fontWeight={"thin"} fontSize={"xs"} color={"white"}>
                made with vibes for hackprinceton 2023
              </Text>
            </Flex>
          </VStack>
        </HStack>
      </Flex>
    </Box>
  );
};

export default Footer;
