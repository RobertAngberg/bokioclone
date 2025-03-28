import React, { useState, useRef } from "react";
import ReactCrop, { Crop, PixelCrop } from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import Image from 'next/image'; // Import Next.js Image component
import placeholderHero from "./placeholderHero.jpg"; // Static placeholder image

function HeaderImage() {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [croppedImageUrl, setCroppedImageUrl] = useState<string | null>(null);
  const [crop, setCrop] = useState<Crop>({
    unit: "px",
    width: 0,
    height: 450,
    x: 0,
    y: 0,
  });
  const [completedCrop, setCompletedCrop] = useState<PixelCrop | null>(null);
  const [isSaved, setIsSaved] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [uploadText, setUploadText] = useState("Stadens bästa kakor");
  const [isHovered, setIsHovered] = useState(false);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      const reader = new FileReader();

      reader.onloadend = () => {
        setImageUrl(reader.result as string); 
        setCroppedImageUrl(null); 
        setIsSaved(false); 
        setCrop((prevCrop) => ({
          ...prevCrop,
          width: 0, 
        }));
      };

      reader.readAsDataURL(file);
    }
  };

  const handleImageLoaded = (image: HTMLImageElement) => {
    imageRef.current = image;

    const imageWidth = image.width;
    const imageHeight = image.height;

    const newCrop: Crop = {
      unit: "px",
      width: imageWidth,
      height: Math.min(450, imageHeight), 
      x: 0,
      y: 0,
    };

    setCrop(newCrop);
    setCompletedCrop({
      unit: "px",
      width: newCrop.width,
      height: newCrop.height,
      x: newCrop.x,
      y: newCrop.y,
    });
  };

  const getCroppedImage = () => {
    if (!completedCrop || !imageRef.current) {
      return;
    }

    const canvas = document.createElement("canvas");
    const scaleX = imageRef.current.naturalWidth / imageRef.current.width;
    const scaleY = imageRef.current.naturalHeight / imageRef.current.height;

    canvas.width = completedCrop.width! * scaleX;
    canvas.height = completedCrop.height! * scaleY;

    const ctx = canvas.getContext("2d");

    if (ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height); 
      ctx.drawImage(
        imageRef.current,
        completedCrop.x! * scaleX,
        completedCrop.y! * scaleY,
        completedCrop.width! * scaleX,
        completedCrop.height! * scaleY,
        0,
        0,
        canvas.width,
        canvas.height
      );

      canvas.toBlob(
        (blob) => {
          if (blob) {
            const croppedUrl = URL.createObjectURL(blob);
            setCroppedImageUrl(croppedUrl); 
            setIsSaved(true);
            setUploadText("Stadens bästa kakor");
          }
        },
        "image/png",
        1
      );
    }
  };

  const triggerFileUpload = () => {
    setImageUrl(null);
    setCroppedImageUrl(null);
    setIsSaved(false);
    fileInputRef.current?.click();
  };

  const handleTextClick = () => {
    setIsEditing(true); 
    setUploadText(""); 
  };

  const handleTextChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setUploadText(event.target.value);
  };

  const handleTextSave = () => {
    if (uploadText.trim() === "") {
      setUploadText("Stadens bästa kakor");
    }
    setIsEditing(false);
    setIsSaved(true);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      handleTextSave();
    }
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  return (
    <div className="relative -mx-6">
      {imageUrl && !croppedImageUrl ? (
        <>
          <div className="text-gray-500 text-center mt-6 pt-4">
            <p>Rekommenderad bredd är minst 1200 pixlar.</p>
            <p>Bildens höjd kommer att beskäras till 450 pixlar.</p>
          </div>
          <ReactCrop
            crop={crop}
            onChange={(newCrop) => setCrop(newCrop)}
            onComplete={(c) => setCompletedCrop(c)}
            keepSelection={true}
            style={{ width: "100%", marginTop: "20px" }}
          >
            {/* Dynamically uploaded image uses <img> */}
            <img
              src={imageUrl}
              alt="Header"
              ref={imageRef}
              onLoad={(e) => handleImageLoaded(e.currentTarget)}
              className="w-full h-auto object-cover"
            />
          </ReactCrop>
          {!isSaved && (
            <div className="flex justify-center mt-4">
              <button
                className="bg-blue-500 text-white px-4 py-2 rounded mr-2"
                onClick={getCroppedImage}
              >
                Spara beskuren bild
              </button>
              <button
                className="bg-gray-500 text-white px-4 py-2 rounded"
                onClick={triggerFileUpload}
              >
                Byt bild
              </button>
            </div>
          )}
        </>
      ) : (
        <>
          <div
            className={`w-full h-auto flex justify-center items-center relative transition duration-300 ${
              isHovered ? "bg-white bg-opacity-50" : ""
            }`}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            {/* Show placeholder or cropped image */}
            {croppedImageUrl ? (
              // Cropped image uses <img> because it's dynamically created
              <img
                src={croppedImageUrl}
                alt="Cropped Image"
                className="w-full h-auto object-cover"
              />
            ) : (
              // Use Next.js Image for placeholder
              <Image
                src={placeholderHero}
                alt="Placeholder"
                layout="responsive"
                width={1200}
                height={450}
                className="cursor-pointer"
              />
            )}

            <label className="absolute cursor-pointer w-full h-full flex flex-col justify-center items-center">
              {isEditing ? (
                <>
                  <input
                    type="text"
                    value={uploadText}
                    onChange={handleTextChange}
                    onBlur={handleTextSave}
                    onKeyDown={handleKeyDown}
                    placeholder=""
                    className="text-white text-5xl font-bold text-center bg-transparent border-none focus:outline-none"
                    style={{ textShadow: "2px 2px 6px rgba(0, 0, 0, 1)", letterSpacing: "0.05em" }} 
                  />
                  <button
                    className="mt-2 bg-blue-500 text-white px-4 py-2 rounded"
                    onClick={handleTextSave}
                  >
                    Spara text
                  </button>
                </>
              ) : (
                <span
                  className="text-white text-6xl font-bold hover:text-gray-300 transition duration-300"
                  onClick={handleTextClick}
                  style={{ textShadow: "2px 2px 6px rgba(0, 0, 0, 1)", letterSpacing: "0.05em" }}
                >
                  {uploadText}
                </span>
              )}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageUpload}
                ref={fileInputRef}
              />
            </label>
          </div>
        </>
      )}
    </div>
  );
}

export default HeaderImage;
