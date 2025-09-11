import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuthContext } from "../context/auth";

interface PrivateRouteProps {
  children: ReactNode;
}

export default function PrivateRoute({ children }: PrivateRouteProps) {
  const { accessToken } = useAuthContext();
  return accessToken ? <>{children}</> : <Navigate to="/login" replace />;
}
