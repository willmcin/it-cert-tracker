"use client";

import { useEffect, useState } from "react";

export default function StatusBar() {
  const [clock, setClock] = useState("--:--:--");

  useEffect(() => {
    const tick = () =>
      setClock(new Date().toLocaleTimeString("en-GB", { hour12: false }));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="hidden sm:flex items-center gap-5 text-dim">
      <span>
        LINK <b className="text-go font-medium">● NOMINAL</b>
      </span>
      <span className="hidden md:inline">
        OPERATOR <b className="text-ink font-medium">WILL.M</b>
      </span>
      <span className="text-cyan font-medium tracking-[0.12em] tabular-nums">{clock}</span>
    </div>
  );
}
