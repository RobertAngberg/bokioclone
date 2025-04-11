type ZoomControlsProps = {
  zoomLevel: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
};

export default function ZoomControls({ zoomLevel, onZoomIn, onZoomOut }: ZoomControlsProps) {
  return (
    <div className="flex items-center gap-2 mt-4">
      <button
        type="button"
        onClick={onZoomOut}
        className="px-3 py-1 text-sm bg-gray-200 rounded hover:bg-gray-300"
      >
        –
      </button>
      <span className="text-white text-sm">{zoomLevel.toFixed(1)}x</span>
      <button
        type="button"
        onClick={onZoomIn}
        className="px-3 py-1 text-sm bg-gray-200 rounded hover:bg-gray-300"
      >
        +
      </button>
    </div>
  );
}
