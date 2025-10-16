import { useState } from "react";
import IconButton from "@mui/material/IconButton";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import { IShipment, ShipmentPriority } from "../../models/ShipmentsView";
import styles from "./ShipmentsList.module.css";
import { Loading } from "../../components/loading/Loading";

interface IActionMenuProps {
    shipment: IShipment;
    handlePrioritised: (shipment: IShipment) => void;
    handleCopyShareLink: (shipment: IShipment) => void;
    isPrioritized: boolean;
    isCopyShareLink: boolean;
}

export default function ActionMenu(props: IActionMenuProps) {
    const { shipment, handleCopyShareLink, handlePrioritised, isPrioritized, isCopyShareLink } = props;
    const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
    const open = Boolean(anchorEl);

    const handleClick = (event: React.MouseEvent<HTMLElement>) => {
        event.stopPropagation();
        setAnchorEl(event.currentTarget);
    };

    const handleClose = (event: React.MouseEvent<HTMLElement>) => {
        event.stopPropagation();
        setAnchorEl(null);
    };

    const handlePrioritize = (event: React.MouseEvent<HTMLElement>) => {
        event.stopPropagation()
        handlePrioritised(shipment);
    };

    const handleCopy = (event: React.MouseEvent<HTMLElement>) => {
        event.stopPropagation()
        handleCopyShareLink(shipment);
    };

    return (
        <div>
            <IconButton
                aria-label="more"
                id={`shipment_table-menu-${shipment.id}`}
                aria-controls={open ? "long-menu" : undefined}
                aria-expanded={open ? "true" : undefined}
                aria-haspopup="true"
                onClick={handleClick}
                className={open ? styles.shipment_details_active : ""}       >
                <MoreHorizIcon />
            </IconButton>
            <Menu
                id="long-menu"
                className={styles.shipment_details_menu_ul}
                MenuListProps={{
                    "aria-labelledby": `shipment_table-menu-${shipment.id}`
                }}
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
            >
                <MenuItem onClick={handlePrioritize} className={styles.shipment_details_menu_li}>
                    <VerifiedUserIcon className={shipment.priority === ShipmentPriority.DEFAULT ? "" : styles.shipment_details_app_status_exist} />
                    {!isPrioritized ? <span>{shipment.priority === ShipmentPriority.DEFAULT ? "Prioritise" : "Prioritised"}</span> : <Loading isLoading={true} text="" />}

                </MenuItem>
                <MenuItem onClick={handleCopy} className={styles.shipment_details_menu_li}><ContentCopyIcon /> {!isCopyShareLink ? "Share link" : <Loading isLoading={true} text="" />}</MenuItem>
            </Menu>
        </div>
    );
}
