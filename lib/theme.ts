import type { Cert } from "@/data/certs";

/** Mission-control accent color per vendor (CSS color value, used for --accent). */
export const VENDOR_ACCENT: Record<Cert["vendor"], string> = {
  CompTIA: "var(--color-amber)",
  Cisco: "var(--color-cyan)",
  AWS: "var(--color-violet)",
};

/** Tailwind text-color utility per vendor, for inline labels. */
export const VENDOR_TEXT: Record<Cert["vendor"], string> = {
  CompTIA: "text-amber",
  Cisco: "text-cyan",
  AWS: "text-violet",
};
