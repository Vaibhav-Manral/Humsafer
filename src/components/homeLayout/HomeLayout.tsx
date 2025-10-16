import React, { ReactNode, useContext, useState } from "react";
import styles from "./HomeLayout.module.css";
import { IPage } from "../../models/Page";
import SideBar from "../sideBar/SideBar";
import classNames from "classnames";
import { IconButton, useMediaQuery, Theme } from '@mui/material';
import DensityMediumIcon from '@mui/icons-material/DensityMedium';
import Link from '@mui/material/Link';
import { HumsaferThemeContext } from "../../contexts/HumsaferThemeContext";

interface IProps {
    children: ReactNode;
    pages: IPage[];
    username: string;
}

const HomeLayout: React.FC<IProps> = (props) => {
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
                        <Link href="/">
                            <img src={smallLogo} alt={"logo"} className={styles.img} />
                        </Link>
                    </div>
                )}
                {props.children}
            </div>
        </div>)
};

export default HomeLayout;
