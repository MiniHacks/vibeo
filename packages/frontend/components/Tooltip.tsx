import { Box, Collapse, useDisclosure } from "@chakra-ui/react";
import Button from "./Button";

export default function Tooltip(): JSX.Element {
  const { isOpen, onToggle } = useDisclosure();
  return (
    <>
      <Button onClick={onToggle}>Click Me</Button>
      <Collapse in={isOpen} animateOpacity>
        <Box
          p={8}
          my={4}
          bg={"#F1AD0E"} // FIXME: idk what color to actually make this / put in theme
          rounded={"lg"}
        >
          meow meow meow meow
        </Box>
      </Collapse>
    </>
  );
}
