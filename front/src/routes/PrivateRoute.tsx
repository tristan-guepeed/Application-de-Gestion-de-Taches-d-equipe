import { Navigate } from "react-router-dom";
import { useAuthContext } from "../context/auth";
import type { JSX } from "@emotion/react/jsx-dev-runtime";

export default function PrivateRoute({ children }: { children: JSX.Element }) {
  const { accessToken } = useAuthContext();
  return accessToken ? children : <Navigate to="/login" replace />;
}
    