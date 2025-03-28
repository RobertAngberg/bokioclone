import { useState } from "react";
import Image from "next/image";
import placeholderLogo from "./placeholderLogo.jpg";

function Logo() {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();

      reader.onloadend = () => {
        setUploadedImage(reader.result as string); // Save the uploaded image
      };

      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="flex items-center">
      {/* Render user-uploaded image or placeholder */}
      {uploadedImage ? (
        // For dynamically uploaded images (base64), use regular <img> with styles to constrain size
        <img
          src={uploadedImage}
          alt="Uploaded Logo"
          style={{ maxWidth: "300px", maxHeight: "100px", objectFit: "contain" }}
          className="cursor-pointer"
          onClick={() => document.getElementById("logo-upload")?.click()}
        />
      ) : (
        // For static placeholder, use Next.js <Image /> with layout="intrinsic" for optimization
        <Image
          src={placeholderLogo}
          alt="Placeholder Logo"
          width={300}
          height={120}
          className="cursor-pointer object-contain"
          onClick={() => document.getElementById("logo-upload")?.click()}
        />
      )}

      {/* Hidden input for uploading new logo */}
      <input
        id="logo-upload"
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleImageUpload}
      />
    </div>
  );
}

export { Logo };
