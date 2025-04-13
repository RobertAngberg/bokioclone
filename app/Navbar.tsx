"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { LogoutButton } from "./start/LogoutButton";
import { usePathname } from "next/navigation";
import React from "react";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { data: session } = useSession();
  const pathname = usePathname();
  const [selectedPath, setSelectedPath] = useState(pathname);

  useEffect(() => {
    setSelectedPath(pathname);
  }, [pathname]);

  const closeMenu = () => setIsOpen(false);

  const handleClick = (path: string) => {
    setSelectedPath(path);
    closeMenu();
  };

  const linkClass = (path: string) =>
    `relative inline-flex items-center gap-1 px-5 py-1.5 md:text-xl font-semibold text-white 
     transition-transform duration-75 ease-in-out rounded-full
     ${pathname === path ? "bg-cyan-800/60" : "hover:bg-cyan-700/30"} 
     active:scale-95`;

  const renderMenuLinks = () => (
    <>
      <li>
        <Link href="/" onClick={() => handleClick("/")} className={linkClass("/")}>
          Hem
        </Link>
      </li>
      <li>
        <Link
          href="/bokfor"
          onClick={() => handleClick("/bokfor")}
          className={linkClass("/bokfor")}
        >
          Bokför
        </Link>
      </li>
      <li>
        <Link
          href="/grundbok"
          onClick={() => handleClick("/grundbok")}
          className={linkClass("/grundbok")}
        >
          Grundbok
        </Link>
      </li>
      <li>
        <Link
          href="/huvudbok"
          onClick={() => handleClick("/huvudbok")}
          className={linkClass("/huvudbok")}
        >
          Huvudbok
        </Link>
      </li>
      <li>
        <Link
          href="/faktura"
          onClick={() => handleClick("/faktura")}
          className={linkClass("/faktura")}
        >
          Fakturor
        </Link>
      </li>
      {session?.user && (
        <li className="mb-3 md:mb-0 md:px-6">
          <LogoutButton />
        </li>
      )}
    </>
  );

  return (
    <div className="sticky top-0 z-50 flex items-center justify-end w-full h-20 px-4 bg-cyan-950 md:justify-center">
      {/* Mobile menu */}
      {isOpen && (
        <ul className="absolute right-0 w-full h-screen p-6 pr-10 text-4xl font-bold text-right text-white top-20 bg-cyan-950 space-y-6">
          {renderMenuLinks()}
        </ul>
      )}

      {/* Desktop menu */}
      <ul className="hidden md:flex md:space-x-3 md:items-center">{renderMenuLinks()}</ul>

      {/* Hamburger icon */}
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

      {/* Logout button desktop */}
      {session?.user && (
        <div className="hidden md:block md:ml-6">
          <LogoutButton />
        </div>
      )}
    </div>
  );
}
