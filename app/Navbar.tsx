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

  const linkClass = (path: string) =>
    `relative inline-block px-6 py-2 md:text-lg font-semibold text-white transition-colors duration-300 ease-in-out
     rounded-full ${pathname === path ? "bg-cyan-800/60" : "hover:bg-cyan-700/30"}`;

  const renderMenuLinks = () => (
    <>
      <li
        onClick={() => {
          setSelectedPath("/");
          closeMenu();
        }}
        className={linkClass("/")}
      >
        <Link href="/">Hem</Link>
      </li>
      <li
        onClick={() => {
          setSelectedPath("/bokfor");
          closeMenu();
        }}
        className={linkClass("/bokfor")}
      >
        <Link href="/bokfor">Bokför</Link>
      </li>
      <li
        onClick={() => {
          setSelectedPath("/grundbok");
          closeMenu();
        }}
        className={linkClass("/grundbok")}
      >
        <Link href="/grundbok">Grundbok</Link>
      </li>
      <li
        onClick={() => {
          setSelectedPath("/huvudbok");
          closeMenu();
        }}
        className={linkClass("/huvudbok")}
      >
        <Link href="/huvudbok">Huvudbok</Link>
      </li>
      <li
        onClick={() => {
          setSelectedPath("/faktura");
          closeMenu();
        }}
        className={linkClass("/faktura")}
      >
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
      {/* Mobile menu */}
      {isOpen && (
        <ul className="absolute right-0 w-full h-screen p-6 pr-10 text-4xl font-bold text-right text-white top-20 bg-cyan-950">
          {renderMenuLinks()}
        </ul>
      )}

      {/* Desktop menu */}
      <ul className="hidden md:flex md:space-x-4 md:items-center">{renderMenuLinks()}</ul>

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
