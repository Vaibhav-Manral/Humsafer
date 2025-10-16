import React, { ReactNode, useContext, useState } from "react";
import styles from "./HomeLayout.module.css";
import { IPage } from "../../models/Page";
import SideBar from "../sideBar/SideBar";
import classNames from "classnames";
import { IconButton, useMediaQuery, Theme } from '@mui/material';
import DensityMediumIcon from '@mui/icons-material/DensityMedium';
import { HumsaferThemeContext } from "../../contexts/HumsaferThemeContext";
import Navbar from "../Navbar/Navbar";
import { Link } from "react-router-dom";

interface IProps {
    children: ReactNode;
    pages: IPage[];
    username: string;
}

const HomeLayout: React.FC<IProps> = (props) => {
    const {pages} = props;
    const page = pages.find((page) => page.href === window.location.pathname);
    const title = page?.title || "Humsafer";
    const [collapsed, setCollapsed] = useState(false);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const isMobile = useMediaQuery((theme: Theme) => theme.breakpoints.down('sm'));
    const { smallLogo } = useContext(HumsaferThemeContext);

    return (
        <div className={styles.root}>
            <SideBar pages={props.pages} collapsed={collapsed} setCollapsed={setCollapsed} drawerOpen={drawerOpen} setDrawerOpen={setDrawerOpen} />
            <div className={classNames(isMobile ? styles.content_res : styles.content, collapsed ? styles.collapsed : '')}>
                {isMobile && (
                    <div className={styles.header_responsive}>
                        <IconButton className={styles.header_button} edge="start" color="inherit" onClick={() => setDrawerOpen(!drawerOpen)} >
                            <DensityMediumIcon />
                        </IconButton>
                        <Link to="/">
                            <img src={smallLogo} alt={"logo"} className={styles.img} />
                        </Link>
                    </div>
                )}
                <Navbar
                    title={title}
                    onLoginClick={() => {}}
                    collapsed={collapsed}
                    onToggleSidebar={() => setCollapsed(!collapsed)}
                />
                {props.children}
            </div>
        </div>)
};

export default HomeLayout;
