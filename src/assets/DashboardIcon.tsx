import React, { useContext } from "react";
import { HumsaferThemeContext } from "../contexts/HumsaferThemeContext";

function DashboardIconComponent() {
    const { primaryTextColor } = useContext(HumsaferThemeContext);
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width={15.5}
            height={15.5}
            viewBox="0 0 15.5 15.5"
        >
            <defs>
                <style>
                    {".dashboardIconComponent__a{fill:none;stroke:" +
                        primaryTextColor +
                        ";stroke-linecap:round;stroke-linejoin:round;stroke-width:1.5px}"}
                </style>
            </defs>
            <path
                className="dashboardIconComponent__a"
                d="M.75.75h5v5h-5zM8.75.75h6v5h-6zM8.75 8.75h6v6h-6zM.75 8.75h5v6h-5z"
            />
        </svg>
    );
}

const DashboardIcon = React.memo(DashboardIconComponent);
export default DashboardIcon;
