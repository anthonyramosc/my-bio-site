import React, { useRef, useState } from "react";

interface ImageInputProps {
  value?: File | null;
  initialSrc?: string; // URL de imagen inicial
  onChange: (file: File | null) => void;
  placeholder?: string;
  name?: string;
  maxHeight?: number;
  square?: boolean;
}

const ImageInput: React.FC<ImageInputProps> = ({
  value,
  initialSrc,
  onChange,
  placeholder = "Haz clic para subir una imagen",
  name,
  maxHeight,
  square,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(initialSrc || null);

  React.useEffect(() => {
    if (value && value instanceof File) {
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result as string);
      reader.readAsDataURL(value);
    } else if (initialSrc) {
      setPreview(initialSrc);
    } else {
      setPreview(null);
    }
  }, [value, initialSrc]);

  const handleClick = () => {
    inputRef.current?.click();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    onChange(file);
  };

  const handleRemove = () => {
    onChange(null);
  };

  return (
    <div>
      <input
        type="file"
        name={name}
        accept="image/*"
        ref={inputRef}
        style={{ display: "none" }}
        onChange={handleChange}
      />
      {preview ? (
        <div
          style={{ maxHeight: maxHeight ? `${maxHeight}px` : undefined }}
          className={`relative group cursor-pointer overflow-hidden bg-white rounded-xl ${
            square ? "aspect-square" : ""
          }`}
          onClick={handleClick}
        >
          <img
            src={preview}
            alt="Preview"
            className="preview-image rounded-xl w-full h-full object-cover transition-all duration-300 group-hover:brightness-75 group-hover:scale-105"
          />
          {/* Overlay de hover */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-300 rounded-xl flex items-center justify-center">
            <span className="text-white opacity-0 text-3xl font-medium  group-hover:opacity-100 transition-opacity duration-300">
              +
            </span>
          </div>
        </div>
      ) : (
        <div
          className="upload-area border-2 border-dashed border-gray-300 rounded-xl p-8 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors duration-300"
          onClick={handleClick}
        >
          <span className="text-gray-500 hover:text-blue-600 transition-colors duration-300">
            {placeholder}
          </span>
        </div>
      )}
    </div>
  );
};

export default ImageInput;
