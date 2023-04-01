import React, { useEffect, useState } from "react";
import {
  Button as ChakraButton,
  Popover,
  PopoverArrow,
  PopoverBody,
  PopoverCloseButton,
  PopoverContent,
  PopoverTrigger,
  SimpleGrid,
} from "@chakra-ui/react";

const ColorPicker = ({
  colors,
  onSetColor,
}: {
  colors: string[];
  onSetColor: (color: string) => void;
}): JSX.Element => {
  const [color, setColor] = useState(colors[0]);
  useEffect(() => {
    onSetColor(color);
  }, [color, onSetColor]);

  return (
    <Popover variant={"picker"}>
      <PopoverTrigger>
        <ChakraButton
          // as={Button}
          size={"sm"}
          aria-label={color}
          background={color}
          _hover={{ background: color }}
          _active={{ background: color }}
          height={"26px"}
          minWidth={"26px"}
          // ml={2}
          // padding={0}
          // minWidth={"unset"}
          // borderRadius={0}
        />
      </PopoverTrigger>
      <PopoverContent width={"170px"} border={"3px solid black !important"}>
        <PopoverArrow bg={color} />
        <PopoverCloseButton color={"black"} />
        <PopoverBody>
          <SimpleGrid columns={5} spacing={2}>
            {colors.map((c) => (
              <ChakraButton
                key={c}
                aria-label={c}
                background={c}
                height={"22px"}
                width={"22px"}
                padding={0}
                minWidth={"unset"}
                borderRadius={3}
                _hover={{ background: c }}
                onClick={() => {
                  setColor(c);
                }}
              />
            ))}
          </SimpleGrid>
        </PopoverBody>
      </PopoverContent>
    </Popover>
  );
};

export default ColorPicker;
