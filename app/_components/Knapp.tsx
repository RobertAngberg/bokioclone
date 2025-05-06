type KnappProps = {
  text: string;
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
};

export default function Knapp({ text, onClick, type = "button", disabled = false }: KnappProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`h-10 px-4 rounded transition text-white ${
        disabled ? "bg-cyan-700/40 cursor-not-allowed" : "bg-cyan-700 hover:bg-cyan-800"
      }`}
    >
      {text}
    </button>
  );
}
