import { Navigate } from "react-router-dom";

export default function Otp() {
  return (
    <Navigate
      to="/dashboard/forget-password"
      replace
    />
  );
}