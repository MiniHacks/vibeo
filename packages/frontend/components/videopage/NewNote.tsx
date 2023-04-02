import { Box, Text, Input } from "@chakra-ui/react";
import { useState } from "react";
import Card from "../Card";
import { Note } from "./Notes";

export type NewNoteProps = {
  addNote: (note: Partial<Note>) => void;
};

const NewNote = ({ addNote }: NewNoteProps) => {
  const [note, setNote] = useState("");

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setNote(event.target.value);
  };

  const handleAddNote = () => {
    if (note === "") return;

    addNote({
      content: note,
    });
    setNote("");
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      handleAddNote();
    }
  };

  return (
    <Card flexGrow={1} p={0}>
      <Input
        size={"md"}
        height={"100%"}
        placeholder={"Add a note"}
        value={note}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
      />
    </Card>
  );
};

export default NewNote;
