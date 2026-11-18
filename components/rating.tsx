import { Icon } from "./icon";

export function Rating({
  value,
  count,
  size = "sm",
}: {
  value: number;
  count?: number;
  size?: "sm" | "md";
}) {
  const stars = Math.round(value);
  return (
    <span className="inline-flex items-center gap-1">
      <span className="flex items-center text-secondary">
        {Array.from({ length: 5 }).map((_, index) => (
          <Icon
            key={index}
            name="star"
            fill={index < stars}
            className={size === "md" ? "text-[18px]" : "text-[13px]"}
          />
        ))}
      </span>
      <span className={`font-bold text-on-surface ${size === "md" ? "text-sm" : "text-xs"}`}>
        {value.toFixed(1)}
      </span>
      {typeof count === "number" && (
        <span className="text-[11px] text-on-surface-variant">({count.toLocaleString("id-ID")})</span>
      )}
    </span>
  );
}
