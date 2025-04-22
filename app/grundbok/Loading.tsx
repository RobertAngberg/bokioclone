"use client";

import React from "react";

interface Props {
  isLoading: boolean;
  children: React.ReactNode;
  minHeight?: string;
}

export default function Loading({
  isLoading,
  children,
  minHeight = "16rem", // default: h-64
}: Props) {
  return (
    <div className="fade-in-wrapper" style={{ minHeight }}>
      {isLoading ? (
        <div className="flex items-center justify-center h-full">
          <div className="w-16 h-16 border-t-4 border-cyan-400 rounded-full animate-spin" />
        </div>
      ) : (
        <div className="fade-in">{children}</div>
      )}

      <style jsx>{`
        .fade-in {
          animation: fadeIn 0.4s ease-in-out;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(5px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
