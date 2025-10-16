import SearchIcon from "@mui/icons-material/Search";
import GradingIcon from "@mui/icons-material/Grading";
import GroupIcon from "@mui/icons-material/Group";
import CreditCardIcon from "@mui/icons-material/CreditCard";
import SummarizeIcon from "@mui/icons-material/Summarize";
import HandshakeIcon from "@mui/icons-material/Handshake";
import GridViewIcon from "@mui/icons-material/GridView";
import LogoutIcon from "@mui/icons-material/Logout";
import ApartmentIcon from "@mui/icons-material/Apartment";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import PeopleOutlineIcon from "@mui/icons-material/PeopleOutline";
import ShowChartIcon from "@mui/icons-material/ShowChart";
import { Capability } from "./User";

export interface IPage {
  icon?: React.ElementType;
  title?: string;
  href: string;
  ignoreParams?: string[];
  children?: IPage[];
  capabilities: Capability[];
  hideFromSidebar?: boolean;
}

export const allPages: IPage[] = [
  {
    icon: GridViewIcon,
    title: "Dashboard",
    href: "/",
    capabilities: [Capability.ALL],
  },
  {
    icon: SearchIcon,
    title: "Support",
    href: "/support",
    capabilities: [Capability.ALL, Capability.DRIVER_SUPPORT],
  },
  {
    icon: GradingIcon,
    title: "Review DL",
    href: "/driving-license",
    capabilities: [Capability.ALL, Capability.REVIEW_DRIVER_LICENSE],
  },
  {
    icon: CreditCardIcon,
    title: "Biradaree Info",
    href: "/biradaree-info",
    capabilities: [Capability.ALL, Capability.DRIVER_BIRADAREE_SEARCH],
    hideFromSidebar: true,
  },
  {
    icon: SummarizeIcon,
    title: "Internal Reports",
    href: "/internal-reports",
    capabilities: [Capability.ALL, Capability.REPORTS],
  },
  {
    icon: HandshakeIcon,
    title: "B2b",
    href: "/partnerships",
    capabilities: [Capability.ALL, Capability.REPORTS],
    hideFromSidebar: true,
  },
  {
    icon: PeopleOutlineIcon,
    title: "Internal Users",
    href: "/user-management",
    capabilities: [Capability.ALL, Capability.USER_MANAGEMENT],
  },
  {
    icon: ApartmentIcon,
    title: "Company",
    href: "/companies",
    capabilities: [Capability.ALL],
  },
  {
    icon: AddCircleOutlineIcon,
    title: "Create Shipments",
    href: "/shipments/create",
    capabilities: [
      Capability.ALL,
      Capability.ALL_DMS_FEATURES,
      Capability.ADD_SHIPMENT,
    ],
  },
  {
    icon: AddCircleOutlineIcon,
    title: "Shipment Handling",
    href: "/handle-shipments",
    capabilities: [Capability.ALL],
  },
  {
    icon: LocalShippingIcon,
    title: "Shipments List",
    href: "/shipments",
    capabilities: [
      Capability.ALL,
      Capability.ALL_DMS_FEATURES,
      Capability.VIEW_SHIPMENTS,
    ],
    children: [
      {
        href: "/shipments/:shipmentId",
        ignoreParams: ["create"], // create is handled separately
        capabilities: [], // children pages do not need any capabilites to be viewed
      },
    ],
  },
  {
    icon: SummarizeIcon,
    title: "Shipment Reports",
    href: "/shipment-reports",
    capabilities: [
      Capability.ALL,
      Capability.REPORTS,
      Capability.ALL_DMS_FEATURES,
      Capability.VIEW_SHIPMENTS,
    ],
  },
  {
    icon: ShowChartIcon,
    title: "Analyse",
    href: "/analyse",
    capabilities: [Capability.ALL, Capability.ALL_DMS_FEATURES],
    children: [
      {
        title: "Driver Report",
        href: "/driver-reports/:driverId",
        capabilities: [Capability.ALL],
      },
    ],
  },
  {
    icon: GroupIcon,
    title: "Users",
    href: "/users",
    capabilities: [
      Capability.ALL,
      Capability.ALL_DMS_FEATURES,
      Capability.MANAGE_COMPANY_USERS,
    ],
  },
  {
    icon: LogoutIcon,
    title: "Logout",
    href: "/logout",
    capabilities: [], // empty means everyone should have access
  },
];

export function getPagesForCapabilites(capabilities: Capability[]) {
  return allPages.filter(
    (page) =>
      page.capabilities.length === 0 ||
      page.capabilities.some((capability) => capabilities.includes(capability))
  );
}
