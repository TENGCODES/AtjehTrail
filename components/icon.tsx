import type { CSSProperties } from "react";

export function Icon({
  name,
  className = "",
  fill = false,
  style,
  label,
}: {
  name: string;
  className?: string;
  fill?: boolean;
  style?: CSSProperties;
  label?: string;
}) {
  return (
    <span
      aria-hidden={label ? undefined : true}
      aria-label={label}
      role={label ? "img" : undefined}
      className={`material-symbols-outlined ${fill ? "icon-fill" : ""} ${className}`}
      style={style}
    >
      {name}
    </span>
  );
}
