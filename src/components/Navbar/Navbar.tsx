import React from 'react'
import styles from './Navbar.module.css'
import { Button, Typography, IconButton } from '@mui/material';
import DensityMediumIcon from '@mui/icons-material/DensityMedium';
import MenuOpenIcon from '@mui/icons-material/MenuOpen';

const Navbar: React.FC<IProps> = (props) => {
    const { title, onLoginClick, collapsed, onToggleSidebar } = props;
    return (
        <div className={styles.navbar}>
            <div className={styles.leftSection}>
                <IconButton 
                    className={styles.sidebarToggle}
                    size="small"
                    onClick={onToggleSidebar}
                    color="inherit"
                >
                    {collapsed ? <DensityMediumIcon fontSize="small" /> : <MenuOpenIcon fontSize="small" />}
                </IconButton>
                <Typography variant="h6" className={styles.title} sx={{ fontSize: { xs: "16px", sm: "18px", md: "20px", lg: "24px" }, fontWeight: 600 }}>{title}</Typography>
            </div>
            <div>
                
            </div>
        </div>
    )
}

export default Navbar

interface IProps {
    title: string;
    onLoginClick: () => void;
    collapsed?: boolean;
    onToggleSidebar?: () => void;
}