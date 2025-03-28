// Define the AddSectionsMenuProps interface
interface AddSectionsMenuProps {
  addMenuClick: (
    sectionType: "header" | "text" | "image" | "twoColumns" | "threeColumns" | "headerImage"
  ) => void;
}

function AddSectionsMenu({ addMenuClick }: AddSectionsMenuProps) {
  return (
    <div className="absolute mt-2 transform -translate-x-1/2 left-1/2 top-full">
      <div className="flex p-2 mt-3 space-x-2 bg-gray-600 rounded-lg">
        <button
          className="px-4 py-2 text-white transition-colors duration-300 bg-gray-600 rounded hover:bg-gray-500"
          onClick={() => addMenuClick("header")}
        >
          Rubrik
        </button>
        <button
          className="px-4 py-2 text-white transition-colors duration-300 bg-gray-600 rounded hover:bg-gray-500"
          onClick={() => addMenuClick("text")}
        >
          Text
        </button>
        <button
          className="px-4 py-2 text-white transition-colors duration-300 bg-gray-600 rounded hover:bg-gray-500"
          onClick={() => addMenuClick("image")}
        >
          Bild
        </button>
        <button
          className="px-4 py-2 text-white transition-colors duration-300 bg-gray-600 rounded hover:bg-gray-500"
          onClick={() => addMenuClick("twoColumns")}
        >
          Två kolumner
        </button>
        <button
          className="px-4 py-2 text-white transition-colors duration-300 bg-gray-600 rounded hover:bg-gray-500"
          onClick={() => addMenuClick("threeColumns")}
        >
          Tre kolumner
        </button>
      </div>
    </div>
  );
}

export default AddSectionsMenu;
