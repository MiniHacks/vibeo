import type { NextPage } from "next";
import { Box } from "@chakra-ui/react";
import React from "react";
import PageLayout from "../components/Layout/PageLayout";
import Card from "../components/Card";

const Home: NextPage = () => {
  return (
    <PageLayout title={"geese, by minihacks"}>
      <Box px={[5, 10]} py={10}>
        <Card>testing</Card>
      </Box>
    </PageLayout>
  );
};

export default Home;
