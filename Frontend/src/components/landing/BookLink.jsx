import { Link } from "react-router-dom";
import useAuth from "@/hooks/useAuth";

export default function BookLink({ eventId, children, ...props }) {
  const user = useAuth();
  const destination = eventId
    ? `/book?event=${encodeURIComponent(eventId)}`
    : "/book";
  return (
    <Link
      {...props}
      to={user ? destination : "/login"}
      state={user ? undefined : { from: destination }}
    >
      {children}
    </Link>
  );
}
