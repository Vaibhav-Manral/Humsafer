import React, { useState, useEffect, useContext } from "react";
import { Navigate } from "react-router-dom";
import { Auth } from "../../utils/Auth";
import { CompanyDataContext } from "../../contexts/CompanyDataContext";

const Logout: React.FC = () => {
  const [isLoggedIn, setLoggedIn] = useState(true);
  const { clearCompanySelection } = useContext(CompanyDataContext);
  useEffect(() => {
    Auth.getInstance().logout();
    clearCompanySelection();
    setLoggedIn(false);
  }, [clearCompanySelection]);
  return isLoggedIn ? <div></div> : <Navigate to="/login" />;
};

export default Logout;
