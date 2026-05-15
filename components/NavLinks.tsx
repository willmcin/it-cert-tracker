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
    <nav className="flex gap-6 text-sm text-gray-400">
      {LINKS.map(({ href, label }) => {
        const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className={`transition-colors hover:text-white ${active ? "text-white font-medium" : ""}`}
          >
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
