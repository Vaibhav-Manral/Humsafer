import React from "react";
import { CircularProgress } from "@mui/material";

interface IProps {
  isLoading: boolean;
  text?: string;
}

export const Loading: React.FC<IProps> = (props) => {
  const { isLoading, text } = props;
  return (
    <>
      {!isLoading && `${text || ""}`}
      {isLoading && <CircularProgress size={25} color={"inherit"} />}
    </>
  );
};
