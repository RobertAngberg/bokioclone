"use client";
import { useState, useRef, useEffect } from "react";
import Link from "next/link";

const linkTexts = {
  home: "Hem",
  prices: "Priser",
  contact: "Kontakt",
};

type LinkKey = keyof typeof linkTexts;

function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [editableLink, setEditableLink] = useState<LinkKey | null>(null);
  const [linkTexts, setLinkTexts] = useState({
    home: "Hem",
    prices: "Priser",
    contact: "Kontakt",
  });
  const [inputValue, setInputValue] = useState<string>("");
  const inputRef = useRef<HTMLInputElement | null>(null);
  const longPressTimeout = useRef<NodeJS.Timeout | null>(null); // Ref to track long press

  const closeMenu = () => {
    setIsOpen(false);
  };

  const handleLongPressStart = (linkKey: LinkKey) => {
    // Start long press timer
    longPressTimeout.current = setTimeout(() => {
      setEditableLink(linkKey);
      setInputValue(linkTexts[linkKey]);
    }, 500); // 500ms for long press
  };

  const handleLongPressEnd = () => {
    // Clear the timer if mouse is released before long press is complete
    if (longPressTimeout.current) {
      clearTimeout(longPressTimeout.current);
    }
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(event.target.value);
  };

  const handleInputKeyPress = (event: React.KeyboardEvent<HTMLInputElement>, linkKey: LinkKey) => {
    if (event.key === "Enter") {
      saveInput(linkKey);
    }
  };

  const saveInput = useCallback(
    (linkKey: LinkKey) => {
      if (inputValue.trim() === "") {
        setInputValue(linkTexts[linkKey]); // Restore the original text if empty
      } else {
        setLinkTexts((prev) => ({
          ...prev,
          [linkKey]: inputValue.trim(),
        }));
      }
      setEditableLink(null); // Exit edit mode
    },
    [inputValue, linkTexts]
  );

  // Detect click outside the input to save changes
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (inputRef.current && editableLink && !inputRef.current.contains(event.target as Node)) {
        saveInput(editableLink); // Save text if clicking outside
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [editableLink, inputValue, saveInput]);

  const renderMenuLinks = () => (
    <>
      {/* Länk, Hem */}
      <li
        className="flex items-center space-x-2 hover:text-slate-400"
        onMouseDown={() => handleLongPressStart("home")}
        onMouseUp={handleLongPressEnd}
        // Touch = mobil
        onTouchStart={() => handleLongPressStart("home")}
        onTouchEnd={handleLongPressEnd}
      >
        {editableLink === "home" ? (
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={(e) => handleInputKeyPress(e, "home")}
            className="px-2 bg-transparent border-b border-gray-300 w-36"
            autoFocus
          />
        ) : (
          <Link href="/sitebuilder/placeholder">{linkTexts.home}</Link>
        )}
      </li>

      {/* Länk, Priser */}
      <li
        className="flex items-center space-x-2 hover:text-slate-400"
        onMouseDown={() => handleLongPressStart("prices")}
        onMouseUp={handleLongPressEnd}
        // Touch = mobil
        onTouchStart={() => handleLongPressStart("prices")}
        onTouchEnd={handleLongPressEnd}
      >
        {editableLink === "prices" ? (
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={(e) => handleInputKeyPress(e, "prices")}
            className="px-2 bg-transparent border-b border-gray-300 w-36"
            autoFocus
          />
        ) : (
          <Link href="/sitebuilder/placeholder">{linkTexts.prices}</Link>
        )}
      </li>

      {/* Länk, Kontakt */}
      <li
        className="flex items-center space-x-2 hover:text-slate-400"
        onMouseDown={() => handleLongPressStart("contact")}
        onMouseUp={handleLongPressEnd}
        // Touch = mobil
        onTouchStart={() => handleLongPressStart("contact")}
        onTouchEnd={handleLongPressEnd}
      >
        {editableLink === "contact" ? (
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={(e) => handleInputKeyPress(e, "contact")}
            className="px-2 bg-transparent border-b border-gray-300 w-36"
            autoFocus
          />
        ) : (
          <Link href="/sitebuilder/placeholder">{linkTexts.contact}</Link>
        )}
      </li>
    </>
  );

  return (
    <div className="sticky top-0 flex items-center justify-end w-full h-20 bg-white md:justify-end md:pl-0">
      {/* Mobile */}
      {isOpen && (
        <ul className="absolute right-0 w-full h-screen p-8 pr-12 space-y-8 text-4xl font-bold leading-tight tracking-wide text-right transition-colors duration-300 bg-white top-20 text-slate-600">
          {renderMenuLinks()}
        </ul>
      )}
      {/* Desktop */}
      <ul className="hidden px-4 font-bold tracking-wider transition-colors duration-300 md:flex md:static md:text-right md:justify-end md:w-auto md:h-auto md:mr-4 md:space-x-6 text-slate-600 md:text-xl md:leading-loose">
        {renderMenuLinks()}
      </ul>
      {/* Hamburger */}
      <div onClick={() => setIsOpen(!isOpen)} className="z-50 md:hidden">
        <svg
          className="w-8 h-8 cursor-pointer text-slate-600"
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
    </div>
  );

  function useCallback<T extends (...args: any[]) => any>(callback: T, dependencies: any[]): T {
    const ref = useRef(callback);

    useEffect(() => {
      ref.current = callback;
    }, [callback, ...dependencies]);

    return useRef(((...args: Parameters<T>) => ref.current(...args)) as T).current;
  }
}

export { Navbar };
function useCallback(
  arg0: (linkKey: LinkKey) => void,
  arg1: (string | { home: string; prices: string; contact: string })[]
) {
  throw new Error("Function not implemented.");
}
