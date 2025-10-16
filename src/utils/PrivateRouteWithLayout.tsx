import { Navigate } from "react-router-dom";
import HomeLayout from "../components/homeLayout/HomeLayout";
import { getPagesForCapabilites } from "../models/Page";
import { Auth } from "./Auth";
import { displayNameForPortalUser } from "./DisplayUtils";

interface IProps {
  path: string;
  element: JSX.Element;
}

function PrivateRouteWithLayout(props: IProps) {
  const userSettings = Auth.getInstance().getUserSettings();
  if (!userSettings) {
    return <Navigate to="/login" />;
  }

  const pages = getPagesForCapabilites(userSettings.capabilities);
  const isRouteAllowed = pages.find((page) => (page.href === props.path) || (page.children?.find((childPage) => childPage.href === props.path)));
  if (!isRouteAllowed) {
    // if route is not allowed navigate to first allowed route
    return <Navigate to={pages[0].href} />;
  }

  return (
    <HomeLayout pages={pages} username={displayNameForPortalUser(userSettings)}>
      {props.element}
    </HomeLayout>
  );
};

export default PrivateRouteWithLayout;
