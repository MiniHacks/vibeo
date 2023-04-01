import type { NextPage } from "next";
import { Image, Box } from "@chakra-ui/react";
import PageLayout from "../components/Layout/PageLayout";
import Footer from "../components/Layout/Footer";
import Card from "../components/Card";

const Home: NextPage = () => {

  return (
    <PageLayout title={"geese, by minihacks"}>
      <Box flexDirection={"column"} minH={"100vh"} display={"flex"}> 
        <Box flex={"1"}>
          <Image 
            fit={"fill"}
            src={"bg-marker.png"}
            style={{
              userSelect: "none",
              position: "absolute",
              zIndex: "1"
            }}
          />
          <Image
            fit={"fill"}
            src={"bg-base.png"}
            zIndex={"0"}
          />
        </Box>
      </Box>
      <Footer />
    </PageLayout>
  );
};

export default Home;
