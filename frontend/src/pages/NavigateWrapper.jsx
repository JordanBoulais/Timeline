import { useNavigate, useLocation } from "react-router-dom";
import React from "react";

export function NavigateWrapper(Component) {
  return function Wrapper(props) {
    const navigate = useNavigate();
    const location = useLocation();
    return <Component {...props} navigate={navigate} location={location} />;
  };
}