import React, { useState, useRef, useEffect } from "react";
import AddButton from "./AddButton";
import SectionInside from "./SectionInside";
import AddSectionsMenu from "./AddSectionsMenu";
import HeroImage from "./HeroImage";

interface SectionProps {
  setSections: React.Dispatch<React.SetStateAction<number[]>>;
  sections: number[];
  sectionId: number;
  nextSectionId: number;
}

function Section({ setSections, sections, sectionId, nextSectionId }: SectionProps) {
  const [isAddingContentType, setIsAddingContentType] = useState<
    "header" | "text" | "image" | "twoColumns" | "threeColumns" | "headerImage" | null
  >(null);
  // Define the Content type
  interface Content {
    kind: "header" | "text" | "image" | "twoColumns" | "threeColumns" | "headerImage";
    text?: string;
    imageUrl?: string;
    columns?: number;
  }

  const [content, setContent] = useState<Content | null>(null);
  const [showOptions, setShowOptions] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  type HandleAddContent = (
    kind: "header" | "text" | "image" | "twoColumns" | "threeColumns" | "headerImage",
    text?: string,
    imageUrl?: string,
    columns?: number
  ) => void;

  const handleAddContent: HandleAddContent = (kind, text, imageUrl, columns) => {
    setContent({ kind, text, imageUrl, columns });
    setIsAddingContentType(null);
    setShowOptions(false);
    setSections([...sections, nextSectionId]); // Adds a new section with a unique ID
  };

  const handleUpdateContent = (updatedContent: Content) => {
    setContent(updatedContent);
  };

  const handlePlusClick = () => {
    setShowOptions(!showOptions);
  };

  // Klick utanför stänger menyn
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowOptions(false);
      }
    };

    if (showOptions) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    // Clean up event listener when component unmounts or when showOptions changes
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showOptions]);

  const addMenuClick = (
    type: "header" | "text" | "image" | "twoColumns" | "threeColumns" | "headerImage"
  ) => {
    setIsAddingContentType(type);
    setShowOptions(false); // Close the menu after a button has been selected
  };

  const isHeaderImage = isAddingContentType === "headerImage";

  return (
    // Om HeroImage, andvänd inte margin / padding
    <div className={isHeaderImage ? "" : "relative p-5 py-2 mb-4"}>
      {isHeaderImage && <HeroImage />}

      <SectionInside
        content={content}
        handleAddContent={handleAddContent}
        isAddingContentType={isAddingContentType}
        handleUpdateContent={handleUpdateContent}
      />

      {!content && !isAddingContentType && <AddButton onClick={handlePlusClick} />}

      {showOptions && (
        <div ref={menuRef}>
          <AddSectionsMenu addMenuClick={addMenuClick} />
        </div>
      )}
    </div>
  );
}

export default Section;
