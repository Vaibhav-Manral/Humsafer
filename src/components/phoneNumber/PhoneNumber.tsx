import { forwardRef } from "react";
import { TextField } from "@mui/material";
const phoneInput = (props: any, ref: any) => (
  <TextField
    onChange={props.onChange}
    autoFocus={true}
    type={"tel"}
    placeholder="Enter contact number"
    inputRef={ref}
    fullWidth
    size="small"
    label=""
    variant="outlined"
    name="phone"
  />
);
export default forwardRef(phoneInput);
