import { Children, isValidElement } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
function optionsFrom(children) {
  return Children.toArray(children).flatMap(child => {
    if (!isValidElement(child)) return [];
    if (child.type === "option") return [child.props];
    return optionsFrom(child.props.children);
  });
}
export default function WorkspaceSelect({
  children,
  value,
  defaultValue,
  onChange,
  id,
  name,
  required,
  disabled,
  className,
  ...props
}) {
  const options = optionsFrom(children);
  const placeholder = options.find(option => option.value === "")?.children;
  return <Select defaultValue={defaultValue} value={value == null ? undefined : String(value)} onValueChange={next => onChange?.({
    target: {
      value: next === "__empty__" ? "" : next,
      name
    }
  })} name={name} required={required} disabled={disabled}><SelectTrigger id={id} className={`h-10 w-full min-w-0 bg-card ${className || ""}`} {...props}><SelectValue placeholder={placeholder} /></SelectTrigger><SelectContent position="popper">{options.map((option, index) => <SelectItem key={`${option.value}-${index}`} value={option.value === "" ? "__empty__" : String(option.value ?? option.children)} disabled={option.disabled}>{option.children}</SelectItem>)}</SelectContent></Select>;
}
