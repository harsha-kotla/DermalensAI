import React, { useRef, useState } from 'react';
import { Upload, Image as ImageIcon, X } from 'lucide-react';

interface ImageUploadProps {
  onImageSelect: (file: File) => void;
  disabled?: boolean;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({ onImageSelect, disabled = false }) => {
  const [preview, setPreview] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file (JPG, JPEG, or PNG)');
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    onImageSelect(file);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleClear = () => {
    setPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="w-full">
      {!preview ? (
        <div
          className={`
            relative border-2 border-dashed rounded-xl p-12 text-center cursor-pointer
            transition-all duration-300 transform
            ${dragActive
              ? 'border-primary-500 bg-gradient-to-br from-primary-50 to-blue-50 scale-[1.02] shadow-lg'
              : 'border-gray-300 hover:border-primary-400 hover:bg-gradient-to-br hover:from-gray-50 hover:to-blue-50 hover:scale-[1.01]'
            }
            ${disabled ? 'opacity-50 cursor-not-allowed' : 'shadow-sm hover:shadow-md'}
          `}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => !disabled && fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            accept="image/jpeg,image/jpg,image/png"
            onChange={handleChange}
            disabled={disabled}
          />
          
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <div className="absolute inset-0 bg-primary-200 rounded-full opacity-20 animate-ping"></div>
              <div className="relative p-4 bg-gradient-to-br from-primary-100 to-primary-200 rounded-full shadow-md">
                <Upload className={`w-8 h-8 text-primary-600 ${dragActive ? 'animate-bounce' : ''}`} />
              </div>
            </div>
            <div>
              <p className="text-lg font-bold text-gray-700 mb-1">
                📸 Upload skin lesion image
              </p>
              <p className="text-sm text-gray-600 mb-1">
                Drag and drop or click to browse
              </p>
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-gray-100 rounded-full mt-2">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                <p className="text-xs text-gray-600">
                  JPG, JPEG, PNG (max 10MB)
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="relative animate-in fade-in slide-in-from-top duration-500">
          <div className="relative rounded-xl overflow-hidden border-2 border-primary-200 shadow-lg group">
            <img
              src={preview}
              alt="Preview"
              className="w-full h-auto max-h-96 object-contain bg-gradient-to-br from-gray-50 to-gray-100"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <button
              onClick={handleClear}
              className="absolute top-3 right-3 p-2.5 bg-white/90 backdrop-blur-sm rounded-full shadow-xl hover:bg-red-50 hover:scale-110 transition-all duration-200 border-2 border-gray-200 hover:border-red-300 group z-10"
              disabled={disabled}
              title="Remove image"
            >
              <X className="w-5 h-5 text-gray-600 group-hover:text-red-600 transition-colors" />
            </button>
          </div>
          <div className="mt-3 flex items-center justify-between p-3 bg-green-50 border-2 border-green-200 rounded-lg">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-green-100 rounded-full">
                <ImageIcon className="w-4 h-4 text-green-600" />
              </div>
              <span className="text-sm font-semibold text-green-800">Image uploaded successfully</span>
            </div>
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageUpload;

