import type { NextPage } from "next";
import { Box, Heading } from "@chakra-ui/react";
import PageLayout from "../components/Layout/PageLayout";
import Footer from "../components/Layout/Footer";

const Home: NextPage = () => {
  return (
    <PageLayout title={"geese, by minihacks"}>
      <Box px={[5, 10]}>
        <Heading as={"h1"}>geese</Heading>
      </Box>
      <Footer />
    </PageLayout>
  );
};

export default Home;
