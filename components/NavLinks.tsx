"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/", label: "Roadmap" },
  { href: "/resources", label: "Resources" },
  { href: "/weak-topics", label: "Weak Topics" },
];

export default function NavLinks() {
  const pathname = usePathname();

  return (
    <nav className="flex gap-5 text-[11px] uppercase tracking-[0.18em]">
      {LINKS.map(({ href, label }) => {
        const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className={`flex items-center gap-1.5 transition-colors hover:text-ink ${
              active ? "text-cyan" : "text-dim"
            }`}
          >
            <span
              className={active ? "text-cyan" : "text-faint"}
              style={active ? { textShadow: "var(--glow-cyan)" } : undefined}
            >
              {active ? "▸" : "·"}
            </span>
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
