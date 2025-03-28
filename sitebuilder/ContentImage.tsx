import React, { useState, useRef } from "react";
import ReactCrop, { Crop as ReactCropType, PixelCrop } from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";

type ExtendedCrop = ReactCropType & {
  aspect?: number;
};

type ContentImageProps = {
  onImageCrop: (croppedImageUrl: string) => void;
};

const ContentImage: React.FC<ContentImageProps> = ({ onImageCrop }) => {
  const [src, setSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState<ExtendedCrop | null>(null); // Initially null
  const [completedCrop, setCompletedCrop] = useState<PixelCrop | null>(null);
  const [scale, setScale] = useState(1); // State for scaling the image, starting at 1 (max size)
  const imageRef = useRef<HTMLImageElement | null>(null);

  const onSelectFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const reader = new FileReader();
      reader.addEventListener("load", () => setSrc(reader.result as string));
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const onImageLoad = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    const image = e.currentTarget;
    imageRef.current = image;

    // Set the crop area to the full image after loading
    setCrop({
      unit: "%", // Use percentage to make it responsive
      x: 0,
      y: 0,
      width: 100,
      height: 100,
      aspect: 16 / 9, // Keep the aspect ratio as set
    });
  };

  const onCropComplete = (crop: PixelCrop) => {
    setCompletedCrop(crop);
  };

  const onCropChange = (newCrop: ExtendedCrop) => {
    setCrop(newCrop);
  };

  const handleScaleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setScale(parseFloat(e.target.value));
  };

  const handleSave = () => {
    if (completedCrop && imageRef.current) {
      const croppedImageUrl = getCroppedImg(imageRef.current, completedCrop, scale);
      onImageCrop(croppedImageUrl);
    } else if (src && imageRef.current) {
      const scaledImageUrl = getScaledImage(imageRef.current, scale);
      onImageCrop(scaledImageUrl);
    }
  };

  const getCroppedImg = (image: HTMLImageElement, crop: PixelCrop, scale: number): string => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;

    // Calculate exact canvas dimensions based on crop and scale
    const scaledWidth = crop.width * scaleX * scale;
    const scaledHeight = crop.height * scaleY * scale;

    canvas.width = scaledWidth;
    canvas.height = scaledHeight;

    if (ctx) {
      ctx.drawImage(
        image,
        crop.x * scaleX,
        crop.y * scaleY,
        crop.width * scaleX,
        crop.height * scaleY,
        0,
        0,
        scaledWidth,
        scaledHeight
      );
    }

    return canvas.toDataURL("image/jpeg");
  };

  const getScaledImage = (image: HTMLImageElement, scale: number): string => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    // Calculate exact canvas dimensions based on scale
    const scaledWidth = image.naturalWidth * scale;
    const scaledHeight = image.naturalHeight * scale;

    canvas.width = scaledWidth;
    canvas.height = scaledHeight;

    if (ctx) {
      ctx.drawImage(
        image,
        0,
        0,
        image.naturalWidth,
        image.naturalHeight,
        0,
        0,
        scaledWidth,
        scaledHeight
      );
    }

    return canvas.toDataURL("image/jpeg");
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      {!src && ( // Only show the upload button if no image has been uploaded
        <label className="px-4 py-2 text-white transition-colors duration-300 rounded cursor-pointer bg-slate-700 hover:bg-slate-500">
          Välj fil
          <input
            type="file"
            accept="image/*"
            onChange={onSelectFile}
            className="hidden" // Hide the default file input
          />
        </label>
      )}
      {src && (
        <div>
          <ReactCrop
            crop={crop || undefined} // Use undefined to trigger ReactCrop to use its default
            onComplete={onCropComplete}
            onChange={onCropChange}
          >
            <img
              src={src}
              alt="Source"
              onLoad={onImageLoad}
              style={{ transform: `scale(${scale})`, transformOrigin: "top left" }} // Apply scale to the image visually
            />
          </ReactCrop>
          <div className="mt-2">
            <label className="block text-gray-700">Storlek:</label>
            <input
              type="range"
              min="0.5" // Allow scaling down to 50% of the original size
              max="1" // Maximum scale is 1 (100% of the original size)
              step="0.01"
              value={scale}
              onChange={handleScaleChange}
              className="w-full"
            />
          </div>
          <div className="flex justify-center mt-4">
            <button
              onClick={handleSave}
              className="px-4 py-2 text-white transition-colors duration-300 rounded cursor-pointer bg-slate-700 hover:bg-slate-500"
            >
              Spara bild
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContentImage;
