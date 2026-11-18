"use client";

import { useState } from "react";
import { Icon } from "./icon";

export function StarInput({
  name,
  label,
  defaultValue = 5,
}: {
  name: string;
  label: string;
  defaultValue?: number;
}) {
  const [value, setValue] = useState(defaultValue);
  return (
    <div>
      <p className="text-xs font-bold text-on-surface-variant">{label}</p>
      <input type="hidden" name={name} value={value} />
      <div className="mt-1.5 flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => setValue(star)}
            aria-label={`${star} bintang`}
            aria-pressed={value === star}
            className="rounded p-0.5 text-secondary transition-transform hover:scale-110"
          >
            <Icon name="star" fill={star <= value} className="text-[30px]" />
          </button>
        ))}
        <span className="ml-1 text-sm font-bold text-primary">{value}/5</span>
      </div>
    </div>
  );
}
