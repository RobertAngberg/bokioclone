"use client";

import { useEffect, useRef, useState } from "react";

export default function AnimeradFlik({
  title,
  icon,
  children,
}: {
  title: string;
  icon: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState("0px");

  const toggle = () => {
    if (!open && contentRef.current) {
      setHeight(contentRef.current.scrollHeight + "px");
      setOpen(true);
    } else {
      setHeight(contentRef.current?.scrollHeight + "px");
      requestAnimationFrame(() => setHeight("0px"));
      setOpen(false);
    }
  };

  useEffect(() => {
    if (open) {
      const timeout = setTimeout(() => setHeight("auto"), 300);
      return () => clearTimeout(timeout);
    }
  }, [open]);

  return (
    <div className="border border-slate-700 rounded-lg overflow-hidden">
      <button
        onClick={toggle}
        className="w-full px-4 py-3 text-lg font-semibold flex justify-between bg-slate-900 hover:bg-slate-800 transition"
      >
        <span>
          {icon} {title}
        </span>
        <span className={`transition-transform ${open ? "rotate-90" : ""}`}>▼</span>
      </button>
      <div ref={contentRef} style={{ height, transition: "height 300ms ease", overflow: "hidden" }}>
        <div className="p-4 bg-slate-900">{children}</div>
      </div>
    </div>
  );
}
