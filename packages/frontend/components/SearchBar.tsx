import {
  InputGroup,
  InputRightElement,
  Input,
  Image,
  BoxProps,
} from "@chakra-ui/react";

export default function SearchBar(props: BoxProps): JSX.Element {
  const handleSearch = (event) => {
    console.log("lol");
  };

  return (
    <InputGroup>
      <Input
        bg={"white"}
        type={"text"}
        border={"3px solid black !important"}
        boxShadow={"-5px 7px 0px black !important"}
        borderRadius={"lg"}
        onChange={handleSearch}
        {...props}
      />
      <InputRightElement
        cursor={"pointer"}
        h={"100%"}
        p={3}
        bg={"transparent"}
        border={"none"}
      >
        <Image onClick={handleSearch} src={"search.svg"} />
      </InputRightElement>
    </InputGroup>
  );
}
