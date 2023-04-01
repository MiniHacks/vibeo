import { Box } from "@chakra-ui/react";

type VideoDoc = {
  name: "human name";
  type: "youtube" | "record" | "upload";
  youtube?: string; // youtube link
  done: boolean;
  progressMessage?: "Downloading" | "Processing";
  progress: number; // number between 0 and 1 representing current progress
  transcript?: TranscriptObj[];
  uid: string;
  created: Date;
};

type TranscriptObj = {
  time: number;
  text: string;
};

const CurrentProgress = () => {
  const data: VideoDoc[] = [];
  return <Box />;
};
