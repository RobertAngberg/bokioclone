import React from "react";

interface LogoUploadProps {
  handleFileUpload: (image: HTMLImageElement) => void;
}

function LogoUpload({ handleFileUpload }: LogoUploadProps) {
  const handleImageUploaded = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files ? event.target.files[0] : null;
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const uploadedImage = new Image();
        uploadedImage.src = e.target?.result as string;
        uploadedImage.onload = () => handleFileUpload(uploadedImage);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <>
      <input
        type="file"
        id="fileUpload"
        accept="image/png, image/jpeg"
        onChange={handleImageUploaded}
        style={{ display: "none" }}
      />
      <label
        htmlFor="fileUpload"
        className="bg-cyan-600 hover:bg-cyan-700 cursor-pointer text-white font-bold py-2 px-4 my-6 rounded"
      >
        Ladda upp logotyp
      </label>
    </>
  );
}

export { LogoUpload };
