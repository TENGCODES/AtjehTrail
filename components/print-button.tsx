"use client";

import { Icon } from "./icon";

export function PrintButton({ label = "Simpan e-voucher" }: { label?: string }) {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="inline-flex items-center justify-center gap-2 rounded-lg border border-outline-variant/50 bg-white px-4 py-2.5 text-xs font-bold text-primary transition-colors hover:border-primary hover:bg-surface-container-low"
    >
      <Icon name="download" className="text-[16px]" />
      {label}
    </button>
  );
}
