import { useState, useEffect, forwardRef, createRef } from "react";
import { TextField } from "@mui/material";
import styles from "./OtpInput.module.css";
import { useMediaQuery, Theme } from '@mui/material';

interface IOtpSingleBox {
  value: string;
  setValue: (value: string) => void;
  index: number;
  autoFocus?: boolean;
  nextFocus(currentIndex: number): void;
  prevFocus(currentIndex: number): void;
  onEnterPressed(): void;
}


const OtpInputSingleBox = forwardRef<HTMLInputElement, IOtpSingleBox>(
  (props, ref) => {
    const isMobile = useMediaQuery((theme: Theme) => theme.breakpoints.down('sm'));
    return (
      <TextField
        InputProps={{ className: isMobile ? styles.otpInputBox_res : styles.otpInputBox }}
        type={"number"}
        size="small"
        variant="outlined"
        label=""
        value={props.value}
        onChange={(e) => {
          const valueLength = e.target.value.length;
          if (valueLength > 0) {
            props.setValue(e.target.value[valueLength - 1]);
            props.nextFocus(props.index);
          } else {
            props.setValue("");
          }
        }}
        name="otp"
        inputRef={ref}
        autoFocus={props.autoFocus}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            props.onEnterPressed();
          } else if (event.key === "Backspace") {
            if (props.value === "") {
              // If backspace is pressed on an empty field, move to previous field
              props.prevFocus(props.index);
            } else {
              // If backspace is pressed on a field with content, clear it and move to previous field
              props.setValue("");
              props.prevFocus(props.index);
            }
          }
        }}
      />)
  }
);

interface IOtpInput {
  setOtp: (value: string) => void;
  onEnterPressed(): void;
}

export const OtpInput = (props: IOtpInput) => {
  const [box1, setBox1] = useState("");
  const [box2, setBox2] = useState("");
  const [box3, setBox3] = useState("");
  const [box4, setBox4] = useState("");
  const [box5, setBox5] = useState("");
  const [box6, setBox6] = useState("");
  const refs = [
    createRef<HTMLInputElement>(),
    createRef<HTMLInputElement>(),
    createRef<HTMLInputElement>(),
    createRef<HTMLInputElement>(),
    createRef<HTMLInputElement>(),
    createRef<HTMLInputElement>(),
  ];

  const otpValue = box1 + box2 + box3 + box4 + box5 + box6;
  const { setOtp, onEnterPressed } = props;
  useEffect(() => {
    setOtp(otpValue);
  }, [otpValue, setOtp]);

  const nextElementFocus = function (currentIndex: number) {
    if (currentIndex < refs.length - 1) {
      const node = refs[currentIndex + 1].current as HTMLInputElement;
      if (node) {
        node.focus();
      }
    }
  };

  const prevElementFocus = function (currentIndex: number) {
    if (currentIndex > 0) {
      const node = refs[currentIndex - 1].current as HTMLInputElement;
      if (node) {
        node.focus();
      }
    }
  };


  return (
    <div className={styles.otpInput} >
      <OtpInputSingleBox
        key={1}
        value={box1}
        setValue={setBox1}
        index={0}
        autoFocus={true}
        nextFocus={nextElementFocus}
        prevFocus={prevElementFocus}
        ref={refs[0]}
        onEnterPressed={onEnterPressed}
      />
      <OtpInputSingleBox
        key={2}
        value={box2}
        setValue={setBox2}
        index={1}
        nextFocus={nextElementFocus}
        prevFocus={prevElementFocus}
        ref={refs[1]}
        onEnterPressed={onEnterPressed}
      />
      <OtpInputSingleBox
        key={3}
        value={box3}
        setValue={setBox3}
        index={2}
        nextFocus={nextElementFocus}
        prevFocus={prevElementFocus}
        ref={refs[2]}
        onEnterPressed={onEnterPressed}
      />
      <OtpInputSingleBox
        key={4}
        value={box4}
        setValue={setBox4}
        index={3}
        nextFocus={nextElementFocus}
        prevFocus={prevElementFocus}
        ref={refs[3]}
        onEnterPressed={onEnterPressed}
      />
      <OtpInputSingleBox
        key={5}
        value={box5}
        setValue={setBox5}
        index={4}
        nextFocus={nextElementFocus}
        prevFocus={prevElementFocus}
        ref={refs[4]}
        onEnterPressed={onEnterPressed}
      />
      <OtpInputSingleBox
        key={6}
        value={box6}
        setValue={setBox6}
        index={5}
        nextFocus={nextElementFocus}
        prevFocus={prevElementFocus}
        ref={refs[5]}
        onEnterPressed={onEnterPressed}
      />
    </div>
  );
};
