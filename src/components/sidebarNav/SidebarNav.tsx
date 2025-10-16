import React, { useContext, useEffect, useState } from "react";
import styles from "./SidebarNav.module.css";
import { List, ListItem, Button, ButtonProps } from "@mui/material";
import classNames from "classnames";
import { LinkProps, Link, useLocation, matchPath } from "react-router-dom";
import { HumsaferThemeContext } from "../../contexts/HumsaferThemeContext";
import { IPage } from "../../models/Page"
import Tooltip from '@mui/material/Tooltip';

interface IProps {
    pages: IPage[];
    collapsed: boolean;
    setDrawer: (open: boolean) => void;
}

interface IButtonProps {
    buttonPath: string;
    backgroundColor: string;
}

function doesMatch(page: IPage, currentPath: string) {
    const match = matchPath(page.href, currentPath);
    let doesMatch = false;
    if (match) {
        const ignoreParams = page.ignoreParams;
        const matchParams = Object.values(match.params);
        if (matchParams.length === 0) {
            doesMatch = true;
        } else if (!ignoreParams || ignoreParams.length === 0) {
            doesMatch = true;
        } else {
            let shouldIgnore = false;
            ignoreParams.forEach((param) => {
                if (matchParams.includes(param)) {
                    shouldIgnore = true;
                }
            });

            doesMatch = !shouldIgnore;
        }
    }

    return doesMatch;
}

function getSelectedPageIndex(pages: IPage[], currentPath: string) {
    let index = 0;
    pages.forEach((page) => {
        if (doesMatch(page, currentPath)) {
            index = pages.indexOf(page);
        } else if (page.children) {
            page.children.forEach((childPage) => {
                if (doesMatch(childPage, currentPath)) {
                    index = pages.indexOf(page);
                }
            });
        }
    });

    return index;
}

const LinkButton: React.FC<ButtonProps & LinkProps & IButtonProps> = (
    props
) => {
    const { buttonPath, backgroundColor, ...rest } = props;
    return (
        <Button
            className={styles.button}
            style={{ backgroundColor: backgroundColor }}
            component={Link}
            {...(rest as any)}
        />
    );
};

const SidebarNav: React.FC<IProps> = (props) => {
    const { primaryTextColor, selectedColor, primaryBgColor } = useContext(
        HumsaferThemeContext
    );

    let location = useLocation();

    const currentPath = location.pathname;
    const [selectedIndex, setSelectedIndex] = useState(getSelectedPageIndex(props.pages, currentPath));

    useEffect(() => {
        setSelectedIndex(getSelectedPageIndex(props.pages, location.pathname));
    }, [location, props.pages]);

    return (
        <div className={classNames(styles.root, styles.nav)}>
            <List classes={{ root: styles.list }}>
                {props.pages
                    .map((page, index) => {
                        if (page.hideFromSidebar) {
                            return <></>;
                        }
                        let selectedButtonStyle = false;
                        const buttonPath = page.href;
                        if (currentPath === "/" || buttonPath === "/") {
                            selectedButtonStyle = currentPath === buttonPath;
                        } else if (selectedIndex === index) {
                            selectedButtonStyle = true;
                        }
                        const Icon = page.icon as React.ElementType;
                        return (
                            <ListItem disableGutters key={page.title} className={styles.item}>
                                <LinkButton
                                    buttonPath={buttonPath}
                                    backgroundColor={selectedButtonStyle ? primaryBgColor : ""}
                                    onClick={() => props.setDrawer(!props.setDrawer)}
                                    to={page.href}>
                                    {props.collapsed && (<Tooltip title={<span className={styles.largeTooltip}>{page.title}</span>} arrow placement="left-end">
                                        <span className={styles.icon} style={{
                                            color: selectedButtonStyle
                                                ? selectedColor
                                                : primaryTextColor,
                                        }
                                        }>{<Icon />}</span>
                                    </Tooltip>)}
                                    {!props.collapsed && (
                                        <>
                                            <span
                                                className={styles.icon}
                                                style={{
                                                    color: selectedButtonStyle
                                                        ? selectedColor
                                                        : primaryTextColor,
                                                }}
                                            >
                                                <Icon />
                                            </span>
                                            <div className={styles.title}
                                                style={{
                                                    color: selectedButtonStyle
                                                        ? selectedColor
                                                        : primaryTextColor,
                                                }}
                                            >
                                                {page.title}
                                            </div>
                                        </>
                                    )}
                                </LinkButton>
                            </ListItem>
                        );
                    })}
            </List>
        </div>
    );
};

export default SidebarNav;
