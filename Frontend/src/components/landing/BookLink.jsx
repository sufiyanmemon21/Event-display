import { Link } from "react-router-dom";
import useAuth from "@/hooks/useAuth";

export default function BookLink({ eventId, expo = false, children, className = "", ...props }) {
  const user = useAuth();
  const destination = eventId
    ? expo
      ? `/expo-booking?expo=${encodeURIComponent(eventId)}`
      : `/book?event=${encodeURIComponent(eventId)}`
    : "/book";
  return (
    <Link
      {...props}
      className={`action-button ${className}`}
      to={user ? destination : "/login"}
      state={user ? undefined : { from: destination }}
    >
      {children}
    </Link>
  );
}
