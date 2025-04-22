type KnappProps = {
  onClick?: () => void;
  text: string;
};

export default function Knapp({ onClick, text }: KnappProps) {
  return (
    <button
      onClick={onClick}
      className="h-10 px-4 bg-cyan-700 rounded hover:bg-cyan-800 text-white transition"
    >
      {text}
    </button>
  );
}
