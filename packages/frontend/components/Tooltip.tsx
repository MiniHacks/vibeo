import { Box, Collapse } from "@chakra-ui/react";

type TooltipProps = {
  children: React.ReactNode;
  isOpen: boolean;
};

export default function Tooltip({
  children,
  isOpen,
}: TooltipProps): JSX.Element {
  return (
    <Collapse in={isOpen} animateOpacity>
      <Box p={8} my={4} bg={"#F1AD0E"} rounded={"lg"}>
        {children}
      </Box>
    </Collapse>
  );
}
