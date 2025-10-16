import { Navigate, useLocation } from "react-router-dom";
import { Auth } from "./Auth";

interface IProps {
  element: (props: any) => JSX.Element;
}

function TokenBasedRoute(props: IProps) {
  const location = useLocation();

  const queryParams = new URLSearchParams(location.search);
  let sessionToken = queryParams.get("tk");
  if (sessionToken) {
    // A session is found, store it in the session storage. API calls will look 
    // for this session first.
    Auth.getInstance().setOverrideSessionToken(sessionToken);
  } else {
    sessionToken = Auth.getInstance().getOverrideSessionToken();
    if (!sessionToken) {
      // navigate to login if no user is logged in or no ongoing session is active
      if (!Auth.getInstance().isLoggedIn()) {
        return <Navigate to="/login" />;
      }
    }
  }

  const { element: Element } = props;

  return (
    <div
      style={{
        margin: 10
      }}
    >
      <Element />
    </div>
  );
};

export default TokenBasedRoute;
