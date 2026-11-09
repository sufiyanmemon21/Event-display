import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
export default function PasswordField({
  id = "password",
  label = "Password",
  newPassword = false,
}) {
  const [visible, setVisible] = useState(false);
  return (
    <div className="grid min-w-0 gap-1">
      <label htmlFor={id}>{label}</label>
      <div
        className="celebration-auth-password relative [&_input]:pe-[50px] [&_button]:absolute [&_button]:inset-[0_0_0_auto]
          [&_button]:grid [&_button]:w-[44px] [&_button]:place-items-center [&_button]:rounded-[0_7px_7px_0]
          [&_button]:text-[var(--account-copy)] [&_button:hover]:text-[var(--account-accent-hover)]"
      >
        <input
          id={id}
          name={id}
          type={visible ? "text" : "password"}
          required
          minLength={newPassword ? 8 : undefined}
          maxLength={72}
          autoComplete={newPassword ? "new-password" : "current-password"}
        />
        <button
          type="button"
          aria-label={(visible ? "Hide " : "Show ") + label.toLowerCase()}
          aria-pressed={visible}
          onClick={() => setVisible(!visible)}
        >
          {visible ? <EyeOff size={19} /> : <Eye size={19} />}
        </button>
      </div>
    </div>
  );
}
