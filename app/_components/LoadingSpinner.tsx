export default function LoadingSpinner() {
  return (
    <div className="flex justify-center items-center py-8">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500"></div>
      <span className="ml-3 text-white">Laddar...</span>
    </div>
  );
}
