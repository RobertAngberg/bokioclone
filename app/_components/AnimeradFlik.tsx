"use client";

import { useEffect, useRef, useState } from "react";

export default function AnimeradFlik({
  title,
  icon,
  children,
  forceOpen = false,
}: {
  title: string;
  icon: string;
  children: React.ReactNode;
  forceOpen?: boolean;
}) {
  const [open, setOpen] = useState(forceOpen);
  const contentRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState(forceOpen ? "auto" : "0px");

  // Om forceOpen ändras, öppna men låt användaren stänga själv
  useEffect(() => {
    if (forceOpen) {
      setOpen(true);
      setHeight("auto");
    }
  }, [forceOpen]);

  const toggle = () => {
    if (!open && contentRef.current) {
      setHeight(contentRef.current.scrollHeight + "px");
      setOpen(true);
    } else if (open && contentRef.current) {
      // Sätt höjd till aktuell höjd, sen till 0px för att trigga transition
      setHeight(contentRef.current.scrollHeight + "px");
      requestAnimationFrame(() => setHeight("0px"));
      setOpen(false);
    }
  };

  // När man öppnar: sätt height till auto efter transition
  useEffect(() => {
    if (open && contentRef.current) {
      setHeight(contentRef.current.scrollHeight + "px");
      const timeout = setTimeout(() => setHeight("auto"), 300);
      return () => clearTimeout(timeout);
    }
    // När man stänger: inget att göra, height sätts till 0px i toggle
  }, [open]);

  // Om innehållet ändras när fliken är öppen, justera höjden
  useEffect(() => {
    if (open && contentRef.current) {
      setHeight(contentRef.current.scrollHeight + "px");
      const timeout = setTimeout(() => setHeight("auto"), 300);
      return () => clearTimeout(timeout);
    }
  }, [children, open]);

  return (
    <div className="border border-slate-700 rounded-lg overflow-hidden mb-4">
      <button
        onClick={toggle}
        className="w-full px-4 py-3 text-lg font-semibold flex justify-between bg-slate-900 hover:bg-slate-800 transition"
        type="button"
        tabIndex={0}
        style={{ cursor: "pointer", opacity: forceOpen ? 0.95 : 1 }}
      >
        <span>
          {icon} {title}
        </span>
        <span className={`transition-transform duration-300 ${open ? "rotate-90" : ""}`}>▼</span>
      </button>
      <div
        ref={contentRef}
        style={{
          height: height,
          transition: "height 300ms cubic-bezier(0.4, 0, 0.2, 1)",
          overflow: "hidden",
        }}
      >
        <div className="p-4 bg-slate-900">{children}</div>
      </div>
    </div>
  );
}
