import type { NextPage } from "next";
import { Box, HStack } from "@chakra-ui/react";
import React from "react";
import PageLayout from "../components/Layout/PageLayout";
import Card from "../components/Card";
import Button from "../components/Button";

const Home: NextPage = () => {
  return (
    <PageLayout title={"geese, by minihacks"}>
      <Box px={[5, 10]} py={10}>
        <HStack spacing={5}>
          <Card>testing</Card>
          <Button>Testing</Button>
        </HStack>
      </Box>
    </PageLayout>
  );
};

export default Home;
