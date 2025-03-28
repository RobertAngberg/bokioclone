interface AddButtonProps {
  onClick: () => void;
}

function AddButton({ onClick }: AddButtonProps) {
  return (
    <div className="absolute inset-0 flex items-center justify-center py-12">
      <div
        className="flex items-center justify-center w-16 h-16 text-3xl leading-none text-white transition-all duration-500 transform bg-gray-300 rounded-full opacity-50 cursor-pointer hover:bg-gray-600 hover:opacity-100 hover:scale-110 hover:shadow-2xl"
        onClick={onClick}
      >
        +
      </div>
    </div>
  );
}

export default AddButton;
