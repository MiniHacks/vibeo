import {
  InputGroup,
  InputRightElement,
  Input,
  Image,
  BoxProps,
} from "@chakra-ui/react";
import { ChangeEvent } from "react";

export type SearchBarProps = {
  onSearch: (query: string) => void;
} & BoxProps;

export default function SearchBar({
  onSearch,
  ...props
}: SearchBarProps): JSX.Element {
  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    return onSearch(event.target.value);
  };

  return (
    <InputGroup>
      <Input
        bg={"white"}
        type={"text"}
        border={"3px solid black !important"}
        boxShadow={"-5px 7px 0px black !important"}
        borderRadius={"lg"}
        onChange={handleChange}
        {...props}
      />
      <InputRightElement
        cursor={"pointer"}
        h={"100%"}
        p={3}
        bg={"transparent"}
        border={"none"}
      >
        <Image alt={"magnifying glass search icon"} src={"search.svg"} />
      </InputRightElement>
    </InputGroup>
  );
}
