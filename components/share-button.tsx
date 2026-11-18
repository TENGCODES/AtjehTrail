"use client";

import { useState } from "react";
import { Icon } from "./icon";

export function ShareButton() {
  const [status, setStatus] = useState<"idle" | "copied">("idle");

  async function bagikan() {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title: document.title, url });
        return;
      } catch {
        return;
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      setStatus("copied");
      window.setTimeout(() => setStatus("idle"), 2000);
    } catch {
      window.prompt("Salin tautan ini:", url);
    }
  }

  return (
    <button
      type="button"
      onClick={bagikan}
      className="inline-flex items-center gap-1.5 rounded-lg border border-outline-variant/50 bg-white px-3 py-2 text-xs font-bold text-on-surface-variant transition-colors hover:border-primary hover:text-primary"
    >
      <Icon name={status === "copied" ? "check" : "share"} className="text-[16px]" />
      {status === "copied" ? "Tautan disalin" : "Bagikan"}
    </button>
  );
}
