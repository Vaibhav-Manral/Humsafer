import React, { useContext } from "react";
import styles from "./SideBar.module.css";
import classNames from "classnames";
import { HumsaferThemeContext } from "../../contexts/HumsaferThemeContext";
import { IPage } from "../../models/Page"
import SidebarNav from "../sidebarNav/SidebarNav";
import DensityMediumIcon from '@mui/icons-material/DensityMedium';
import MenuOpenIcon from '@mui/icons-material/MenuOpen';
import Link from '@mui/material/Link';
import { Drawer, useMediaQuery, Theme, createTheme, ThemeProvider } from '@mui/material';

interface IProps {
  pages: IPage[];
  collapsed: boolean;
  setCollapsed: (shouldCollapse: boolean) => void,
  drawerOpen: boolean,
  setDrawerOpen: (open: boolean) => void
}

const SideBar: React.FC<IProps> = (props) => {
  
  const theme = createTheme({
    components: {
      MuiPaper: {
        styleOverrides: {
          root: {
            width: props.drawerOpen ? "215px" : "0" 
          },
        },
      },
    },
  });

  
  const { logo } = useContext(HumsaferThemeContext);
  const isMobile = useMediaQuery((theme: Theme) => theme.breakpoints.down('sm'));
  return (
    <ThemeProvider theme={theme}>
      <Drawer className={styles.header}
        variant={isMobile ? 'temporary' : 'permanent'}
        open={isMobile ? props.drawerOpen : true}
        onClose={() => props.setDrawerOpen(!props.drawerOpen)}
      >
        <div className={classNames(styles.root, props.collapsed ? styles.collapsed : '')} style={{ backgroundColor: "#FFF" }}>
          <div className={styles.header}>
            {props.collapsed ? <span onClick={() => props.setCollapsed(!props.collapsed)} className={styles.toggleBtn}><DensityMediumIcon /></span>
              : <>
                <Link href="/">
                  <img src={logo} alt={"logo"} className={styles.img} />
                </Link>
                {!isMobile ? <span onClick={() => props.setCollapsed(!props.collapsed)} className={styles.toggleBtn}><MenuOpenIcon /></span> : " "}
              </>
            }
          </div>
          <span className={classNames(props.collapsed ? styles.line : '')}></span>
          <SidebarNav pages={props.pages} collapsed={props.collapsed} setDrawer={props.setDrawerOpen} />
        </div>
      </Drawer>
    </ThemeProvider>
  );
};

export default SideBar;

