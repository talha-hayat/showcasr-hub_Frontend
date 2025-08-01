// src/pages/UpdatePortfolio.tsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { X, Trash2, Pencil } from 'lucide-react';
import { toast } from 'react-hot-toast';
import Modal from '@/components/ui/Modal'; // Add this file
import ProgressBar from '@/components/ui/ProgressBar'; // Add this file

const categories = ['Web Development', 'UI/UX', 'Mobile App', 'Data Science', 'Other'];

export default function UpdatePortfolio() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    thumbnailUrl: '',
    imageUrls: [''],
  });

  const [initialData, setInitialData] = useState<any>({});
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [imageFiles, setImageFiles] = useState<(File | null)[]>([]);
  const [thumbnailPreview, setThumbnailPreview] = useState('');
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [isChanged, setIsChanged] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [fullscreenImage, setFullscreenImage] = useState<string | null>(null);

  // Load portfolio on mount
  useEffect(() => {
    const fetchPortfolio = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_BASE_URL}/api/portfolios/${id}`);
        const { data: portfolio } = await res.json();

        setFormData({
          title: portfolio.title,
          description: portfolio.description,
          category: portfolio.category,
          thumbnailUrl: portfolio.thumbnailUrl,
          imageUrls: portfolio.imageUrls || [],
        });

        setThumbnailPreview(portfolio.thumbnailUrl);
        setImagePreviews(portfolio.imageUrls || []);
        setInitialData(portfolio);
      } catch (err) {
        toast.error('Failed to fetch portfolio.');
      }
    };

    fetchPortfolio();
  }, [id]);

  const uploadToCloudinary = async (file: File) => {
    setIsUploading(true);
    const form = new FormData();
    form.append('file', file);
    form.append('upload_preset', import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET);

    const res = await fetch(`https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/image/upload`, {
      method: 'POST',
      body: form,
    });

    const data = await res.json();
    setIsUploading(false);
    return data.secure_url;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setIsChanged(true);
  };

  const handleThumbnailSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setThumbnailFile(file);
      setThumbnailPreview(URL.createObjectURL(file));
      setIsChanged(true);
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const file = e.target.files?.[0];
    if (file) {
      const updatedFiles = [...imageFiles];
      updatedFiles[index] = file;
      setImageFiles(updatedFiles);

      const updatedPreviews = [...imagePreviews];
      updatedPreviews[index] = URL.createObjectURL(file);
      setImagePreviews(updatedPreviews);
      setIsChanged(true);
    }
  };

  const handleImageDelete = (index: number) => {
    const updatedUrls = [...formData.imageUrls];
    const updatedPreviews = [...imagePreviews];
    const updatedFiles = [...imageFiles];

    updatedUrls.splice(index, 1);
    updatedPreviews.splice(index, 1);
    updatedFiles.splice(index, 1);

    setFormData({ ...formData, imageUrls: updatedUrls });
    setImagePreviews(updatedPreviews);
    setImageFiles(updatedFiles);
    setIsChanged(true);
  };

  const handleUpdate = async () => {
    
    try {
      const token = localStorage.getItem('token');
      
      setIsUploading(true);

      const updatedThumbnailUrl = thumbnailFile
        ? await uploadToCloudinary(thumbnailFile)
        : formData.thumbnailUrl;

      const updatedImageUrls = await Promise.all(
        formData.imageUrls.map(async (url, index) =>
          imageFiles[index] ? await uploadToCloudinary(imageFiles[index]!) : url
        )
      );
      console.log(updatedImageUrls)

      const res = await fetch(`${import.meta.env.VITE_BASE_URL}/api/portfolios/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...formData,
          thumbnailUrl: updatedThumbnailUrl,
          imageUrls: updatedImageUrls,
        }),
      });
      if (!res.ok) throw new Error('Update failed.');
      toast.success('Portfolio updated');
      navigate('/profile');
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-lg shadow-xl p-6 relative">
        <button
          onClick={() => navigate('/profile')}
          className="absolute top-4 right-4 text-gray-500 hover:text-red-600"
        >
          <X />
        </button>

        <h2 className="text-2xl font-bold text-center mb-6">Update Portfolio</h2>

        {isUploading && <ProgressBar value={progress} />}

        {/* Thumbnail */}
        <div className="mb-6">
          <p className="font-semibold mb-2">Thumbnail Image</p>
          <div className="relative group w-full">
            <img
              src={thumbnailPreview}
              onClick={() => setFullscreenImage(thumbnailPreview)}
              className="w-full max-h-64 rounded-md object-contain border cursor-pointer"
              alt="Thumbnail"
            />
            <label className="absolute top-2 right-2 p-2 bg-white rounded-full shadow hover:bg-gray-100 cursor-pointer">
              <Pencil size={16} />
              <input
                type="file"
                accept="image/*"
                onChange={handleThumbnailSelect}
                className="hidden"
              />
            </label>
          </div>
        </div>

        {/* Project Images */}
        <div className="mb-6">
          <p className="font-semibold mb-2">Project Images</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {imagePreviews.map((img, idx) => (
              <div key={idx} className="relative group border rounded-md overflow-hidden">
                <img
                  src={img}
                  onClick={() => setFullscreenImage(img)}
                  className="w-full max-h-48 object-cover cursor-pointer"
                  alt={`Project image ${idx + 1}`}
                />
                <button
                  onClick={() => handleImageDelete(idx)}
                  className="absolute top-2 right-2 p-1 bg-red-600 hover:bg-red-700 text-white rounded-full"
                >
                  <Trash2 size={16} />
                </button>
                <label className="absolute bottom-2 right-2 p-1 bg-white hover:bg-gray-200 rounded-full cursor-pointer">
                  <Pencil size={16} />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageSelect(e, idx)}
                    className="hidden"
                  />
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Form Fields */}
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-600 mb-1 block">Project Title</label>
            <Input name="title" value={formData.title} onChange={handleChange} />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-600 mb-1 block">Description</label>
            <Textarea name="description" value={formData.description} onChange={handleChange} />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-600 mb-1 block">Category</label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full border rounded-md px-3 py-2"
            >
              <option value="">Select Category</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
        </div>

        <Button
          disabled={!isChanged || isUploading}
          onClick={handleUpdate}
          className="mt-6 w-full bg-blue-600 hover:bg-blue-700 text-white"
        >
          Save Changes
        </Button>
      </div>

      {/* Fullscreen Image Modal */}
      {fullscreenImage && (
        <div
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center"
          onClick={() => setFullscreenImage(null)}
        >
          <img src={fullscreenImage} alt="Fullscreen" className="max-w-full max-h-full rounded-lg shadow-2xl" />
        </div>
      )}
    </div>
  );
}
