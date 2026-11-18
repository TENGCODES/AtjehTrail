import type { Metadata } from "next";
import { Onboarding } from "@/components/onboarding";

export const metadata: Metadata = {
  title: "Selamat datang",
};

export default function PengantarPage() {
  return <Onboarding />;
}
