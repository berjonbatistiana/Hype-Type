import React from "react";
import TextField from "@material-ui/core/TextField";

export const TextFieldInput = ({ input, label }) => {
  console.log(input);
  return <TextField {...input} label={label} fullWidth />;
};
