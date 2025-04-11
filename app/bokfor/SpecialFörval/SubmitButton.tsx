"use client";

import { useFormStatus } from "react-dom";

export default function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className={`flex items-center justify-center gap-2 w-full px-4 py-6 font-bold text-white rounded ${
        pending ? "bg-gray-400 cursor-not-allowed" : "bg-cyan-600 hover:bg-cyan-700"
      }`}
    >
      {pending && (
        <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
      )}
      {pending ? "Bokför..." : "Bokför"}
    </button>
  );
}
