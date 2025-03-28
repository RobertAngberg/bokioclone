"use client";

import React, { useEffect, useState } from "react";
import ContentHeader from "./ContentHeader";
import ContentText from "./ContentText";
import ContentImage from "./ContentImage";
import ContentTwoColumns from "./ContentTwoColumns";
import ContentThreeColumns from "./ContentThreeColumns";

type ContentKind = "header" | "text" | "image" | "twoColumns" | "threeColumns" | "headerImage";

type ContentBlock = {
  kind: ContentKind;
  text?: string;
  imageUrl?: string;
  columns?: string[];
};

interface SectionInsideProps {
  content?: ContentBlock;
  handleAddContent: (kind: ContentKind, text?: string, imageUrl?: string) => void;
  isAddingContentType: ContentKind | null;
  handleUpdateContent: (content: ContentBlock) => void;
}

function SectionInside({
  content,
  handleAddContent,
  isAddingContentType,
  handleUpdateContent,
}: SectionInsideProps) {
  const [columns, setColumns] = useState<{ text: string; isEditing: boolean }[]>([]);

  useEffect(() => {
    if (content?.kind === "threeColumns" && content.columns) {
      setColumns(content.columns.map((text) => ({ text, isEditing: false })));
    }
  }, [content]);

  const handleColumnClick = (index: number) => {
    const updated = [...columns];
    updated[index].isEditing = true;
    setColumns(updated);
  };

  const handleTextChange = (index: number, value: string) => {
    const updated = [...columns];
    updated[index].text = value;
    setColumns(updated);
  };

  const handleSave = () => {
    if (content) {
      handleUpdateContent({
        ...content,
        columns: columns.map((c) => c.text),
      });
    }
    setColumns(columns.map((c) => ({ ...c, isEditing: false })));
  };

  return (
    <>
      {/* Edit three column layout */}
      {content?.kind === "threeColumns" && columns.length > 0 && (
        <div className="flex flex-col">
          <div className="flex space-x-4">
            {columns.map((col, i) => (
              <div
                key={i}
                className="w-1/3 p-4 cursor-pointer"
                onClick={() => handleColumnClick(i)}
              >
                {col.isEditing ? (
                  <textarea
                    className="w-full h-32 p-2"
                    value={col.text}
                    onChange={(e) => handleTextChange(i, e.target.value)}
                    autoFocus
                  />
                ) : (
                  <p className={col.text ? "" : "text-gray-400 italic"}>
                    {col.text || "Klicka för att lägga till text..."}
                  </p>
                )}
              </div>
            ))}
          </div>
          {columns.some((c) => c.isEditing) && (
            <div className="w-full flex justify-center mt-4">
              <button
                className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600"
                onClick={handleSave}
              >
                Spara
              </button>
            </div>
          )}
        </div>
      )}

      {/* Display saved content */}
      {content?.kind === "header" && (
        <h1 className="text-4xl font-bold mt-4 text-slate-600">{content.text}</h1>
      )}

      {content?.kind === "text" && <p className="text-slate-600">{content.text}</p>}

      {content?.kind === "image" && content.imageUrl && (
        <img
          src={content.imageUrl}
          alt="Cropped"
          className="max-h-[500px] object-contain"
          style={{ maxWidth: "100%", width: "auto", height: "auto" }}
        />
      )}

      {content?.kind === "twoColumns" && content.columns && (
        <div className="flex space-x-4">
          {content.columns.map((text, i) => (
            <div key={i} className="w-1/2 p-4">
              <p>{text}</p>
            </div>
          ))}
        </div>
      )}

      {content?.kind === "headerImage" && (
        <ContentImage onImageCrop={(url) => handleAddContent("headerImage", undefined, url)} />
      )}

      {/* Add new content */}
      {isAddingContentType === "header" && (
        <ContentHeader
          handleAddContent={(type, value) => handleAddContent(type as ContentKind, value)}
        />
      )}
      {isAddingContentType === "text" && (
        <ContentText
          handleAddContent={(type, value) => handleAddContent(type as ContentKind, value)}
        />
      )}
      {isAddingContentType === "image" && (
        <ContentImage onImageCrop={(url) => handleAddContent("image", undefined, url)} />
      )}
      {isAddingContentType === "twoColumns" && (
        <ContentTwoColumns
          handleAddContent={(type, arg1, arg2, columnsData) =>
            handleAddContent(type as ContentKind, arg1, arg2)
          }
        />
      )}
      {isAddingContentType === "threeColumns" && (
        <ContentThreeColumns
          handleAddContent={(type, arg1, arg2, columnsData) =>
            handleAddContent(type as ContentKind, arg1, arg2)
          }
        />
      )}
    </>
  );
}

export default SectionInside;
