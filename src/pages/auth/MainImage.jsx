import React, { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Upload, X } from 'lucide-react';

const MainImage = ({ onImageSelect, imagePreview, setImagePreview, imageError, setImageError }) => {
  const fileInputRef = useRef(null);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setImageError('');

    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setImageError('Please select a valid image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setImageError('Image size should be less than 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target.result);
    };
    reader.readAsDataURL(file);
    onImageSelect(file);
  };

  const removeImage = () => {
    setImagePreview(null);
    setImageError('');
    if (fileInputRef.current) fileInputRef.current.value = '';
    onImageSelect(null);
  };

  return (
    <div className="space-y-2">
      <Label htmlFor="profileImage">Profile Picture (Optional)</Label>
      <div className="flex flex-col items-center space-y-3">
        <div
          className="relative w-24 h-24  border-2 border-dashed border-gray-300 hover:border-gray-400 transition-colors cursor-pointer overflow-hidden"
          // onClick={() => fileInputRef.current?.click()}
        >
          {imagePreview ? (
            <>
              <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={removeImage}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
              >
                <X size={12} />
              </button>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-gray-400">
              <Upload size={16} className="mt-1" />
            </div>
          )}
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          className="hidden"
        />

        <div className="text-center">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            className="text-xs"
          >
            {imagePreview ? 'Change Photo' : 'Upload Photo'}
          </Button>
          <p className="text-xs text-gray-500 mt-1">Recommended: 200x200px, Max: 5MB</p>
          <p className="text-xs text-gray-400">JPG, PNG, GIF formats supported</p>
        </div>
      </div>

      {imageError && (
        <Alert variant="destructive" className="mt-2">
          <AlertDescription className="text-sm">{imageError}</AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default MainImage;
