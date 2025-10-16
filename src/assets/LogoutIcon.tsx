import React, { useContext } from "react";
import { HumsaferThemeContext } from "../contexts/HumsaferThemeContext";

function LogoutIconComponent() {
  const { primaryTextColor } = useContext(HumsaferThemeContext);
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={14.614}
      height={14}
      viewBox="0 0 14.614 14"
    >
      <defs>
        <style>
          {".logoutIconComponent__a{fill:" +
            primaryTextColor +
            ";stroke:" +
            primaryTextColor +
            ";stroke-width:.5px}"}
        </style>
      </defs>
      <path
        className="logoutIconComponent__a"
        d="M13.903 7.46h-8.9a.46.46 0 110-.92h8.9a.46.46 0 110 .92zm0 0"
      />
      <path
        className="logoutIconComponent__a"
        d="M7.461 9.914a.457.457 0 01-.325-.135L4.682 7.325a.46.46 0 010-.651L7.136 4.22a.46.46 0 01.651.651L5.658 7l2.129 2.129a.46.46 0 01-.326.785zm0 0"
      />
      <path
        className="logoutIconComponent__a"
        d="M7 13.75a6.75 6.75 0 116.282-9.219.46.46 0 11-.857.337 5.829 5.829 0 100 4.265.46.46 0 11.857.337A6.716 6.716 0 017 13.75zm0 0"
      />
    </svg>
  );
}
const LogoutIcon = React.memo(LogoutIconComponent);
export default LogoutIcon;
