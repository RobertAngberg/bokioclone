"use client";

import Link from "next/link";
import { useState } from "react";
import { useSession } from "next-auth/react";
import { LogoutButton } from "./start/LogoutButton";
import { usePathname } from "next/navigation";
import React from "react";

function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { data: session } = useSession();
  const pathname = usePathname();

  // console.log("📧 Email från client:", session?.user?.email);

  const closeMenu = () => {
    setIsOpen(false);
  };

  const linkClass = (path: string) =>
    `mb-6 transition-colors duration-300 hover:text-slate-400 md:mb-0 md:text-lg md:px-6 md:py-2 md:text-white md:font-bold ${
      pathname === path ? "bg-cyan-800/60 rounded-full" : ""
    }`;

  const renderMenuLinks = () => (
    <>
      <li onClick={closeMenu} className={linkClass("/")}>
        <Link href="/">Hem</Link>
      </li>
      <li onClick={closeMenu} className={linkClass("/bokfor")}>
        <Link href="/bokfor">Bokför</Link>
      </li>
      <li onClick={closeMenu} className={linkClass("/grundbok")}>
        <Link href="/grundbok">Grundbok</Link>
      </li>
      <li onClick={closeMenu} className={linkClass("/huvudbok")}>
        <Link href="/huvudbok">Huvudbok</Link>
      </li>
      <li onClick={closeMenu} className={linkClass("/faktura")}>
        <Link href="/faktura">Fakturor</Link>
      </li>
      {session?.user && (
        <li onClick={closeMenu} className="mb-6 md:mb-0 md:px-6">
          <LogoutButton />
        </li>
      )}
    </>
  );

  return (
    <div className="sticky top-0 z-50 flex items-center justify-end w-full h-20 px-4 bg-cyan-950 md:justify-center">
      {/* Mobile */}
      {isOpen && (
        <ul className="absolute right-0 w-full h-screen p-6 pr-10 text-4xl font-bold text-right text-white top-20 bg-cyan-950">
          {renderMenuLinks()}
        </ul>
      )}
      {/* Desktop */}
      <ul className="hidden md:flex md:static md:text-center md:justify-center md:w-auto md:h-auto">
        {renderMenuLinks()}
      </ul>
      {/* Hamburger */}
      <div onClick={() => setIsOpen(!isOpen)} className="z-50 md:hidden">
        <svg
          className="w-8 h-8 text-white cursor-pointer"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
        >
          <path
            className={`transition-all duration-300 ease-in-out ${isOpen ? "opacity-0" : ""}`}
            d="M4 6h16"
          />
          <path
            className={`transition-all duration-300 ease-in-out ${isOpen ? "opacity-0" : ""}`}
            d="M4 12h16"
          />
          <path
            className={`transition-all duration-300 ease-in-out ${isOpen ? "opacity-0" : ""}`}
            d="M4 18h16"
          />
          {isOpen && (
            <path className="transition-all duration-300 ease-in-out" d="M6 18L18 6M6 6l12 12" />
          )}
        </svg>
      </div>
      {/* Logout button on desktop (separate from menu) */}
      {session?.user && (
        <div className="hidden md:block md:ml-6">
          <LogoutButton />
        </div>
      )}
    </div>
  );
}

export { Navbar };
