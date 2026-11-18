import { Icon } from "./icon";

export function LencanaTerverifikasi({ compact = false }: { compact?: boolean }) {
  return (
    <span className="inline-flex items-center gap-1 rounded border border-verified/50 bg-white/90 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-verified backdrop-blur-sm">
      <Icon name="verified" className="text-[14px]" />
      {compact ? "Verifikasi" : "Terverifikasi"}
    </span>
  );
}

export function LencanaPermata() {
  return (
    <span className="inline-flex items-center gap-1 rounded bg-primary-container px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-secondary-container shadow-sm">
      <Icon name="diamond" className="text-[14px]" />
      Permata Tersembunyi
    </span>
  );
}

export function Chip({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded bg-surface-container px-2 py-0.5 text-[11px] font-semibold text-on-surface-variant">
      {children}
    </span>
  );
}

export function StatusPesanan({ status }: { status: string }) {
  const cls =
    status === "Terkonfirmasi"
      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
      : status === "Selesai"
        ? "bg-primary-container text-white border-primary-container"
        : status === "Dibatalkan"
          ? "bg-error-container text-on-error-container border-red-200"
          : "bg-amber-50 text-amber-800 border-amber-200";
  return (
    <span className={`inline-flex items-center gap-1 rounded border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${cls}`}>
      {status}
    </span>
  );
}
