import { Box, Text, Input } from "@chakra-ui/react";
import { useState } from "react";
import Card from "../Card";

export type NewNoteProps = {
  addNote: (note: string, time: Date) => void;
};

const NewNote = ({ addNote }: NewNoteProps) => {
  const [note, setNote] = useState("");

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setNote(event.target.value);
  };

  const handleAddNote = () => {
    if (note === "") return;

    addNote(note, new Date());
    setNote("");
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      handleAddNote();
    }
  };

  return (
    <Card flexGrow={1}>
      <Input
        size={"xs"}
        value={note}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
      />
    </Card>
  );
};

export default NewNote;
