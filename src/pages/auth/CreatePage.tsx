import React, { useState, ChangeEvent, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';

const categories = ['Web Design', 'App Development', 'Graphics', 'Illustration', 'Photography'];

interface FormDataType {
  title: string;
  description: string;
  category: string;
  thumbnailUrl: string;
  imageUrls: string[];
  preview: string;
  source: string;
}

interface ErrorsType {
  title?: string;
  category?: string;
  thumbnailUrl?: string;
  preview?: string;
  source?: string;
}

interface UserType {
  id: string;
  name: string;
  token: string;
  profileImage: string;
}

const CreatePage: React.FC = () => {
  const navigate = useNavigate();
  const user: UserType | null = JSON.parse(localStorage.getItem('user') || 'null');
  const token = localStorage.getItem('token');

  const [formData, setFormData] = useState<FormDataType>({
    title: '',
    description: '',
    category: categories[0],
    thumbnailUrl: '',
    imageUrls: [],
    preview: '',
    source: '',
  });

  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [errors, setErrors] = useState<ErrorsType>({});
  const [loading, setLoading] = useState<boolean>(false);

  const validate = () => {
    const newErrors: ErrorsType = {};
    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!formData.category.trim()) newErrors.category = 'Category is required';
    if (!thumbnailFile) newErrors.thumbnailUrl = 'Thumbnail is required';
    if (!formData.preview.trim()) newErrors.preview = 'Preview link is required';
    if (!formData.source.trim()) newErrors.source = 'Source link is required';
    return newErrors;
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleThumbnailChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setThumbnailFile(file);
    setThumbnailPreview(URL.createObjectURL(file));
  };

  const handleImagesChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setImageFiles(files);
    setImagePreviews(files.map((file) => URL.createObjectURL(file)));
  };

  const uploadToCloudinary = async (file: File): Promise<string> => {
    const data = new FormData();
    data.append('file', file);
    data.append('upload_preset', import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET);

    const res = await fetch(`https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/upload`, {
      method: 'POST',
      body: data,
    });

    if (!res.ok) throw new Error('Failed to upload image');
    const result = await res.json();
    return result.secure_url;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const validationErrors = validate();
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    if (!token) {
      toast.error('Unauthorized: Please log in again');
      return;
    }

    setLoading(true);
    toast.loading('Creating portfolio...');

    console.log('Token being sent:', token); 
    console.log('Payload:', {
      ...formData,
      thumbnailUrl: 'uploading...',
      imageUrls: 'uploading...',
      creatorId: user?.id,
      creator: {
        name: user?.name || '',
        avatar: user?.profileImage || '',
      },
    });

    try {
      const uploadedThumbnailUrl = await uploadToCloudinary(thumbnailFile as File);
      const uploadedImageUrls = await Promise.all(
        imageFiles.map((file) => uploadToCloudinary(file))
      );

      const payload = {
        ...formData,
        thumbnailUrl: uploadedThumbnailUrl,
        imageUrls: uploadedImageUrls,
        creatorId: user?.id,
        creator: {
          name: user?.name || '',
          avatar: user?.profileImage || '',
        },
      };

      const res = await fetch(`${import.meta.env.VITE_BASE_URL}/api/portfolios`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok) {
        console.log(data)
        toast.dismiss();
        toast.success('Portfolio created!');
        setTimeout(() => navigate('/'), 1000);
      } else {
        throw new Error(data.message || 'Failed to create portfolio');
      }
    } catch (err: any) {
      toast.dismiss();
      toast.error(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white rounded-xl shadow-md mt-6">
      <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">Create New Portfolio</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Title */}
        <div>
          <label className="font-semibold block mb-1">Title</label>
          <input
            name="title"
            value={formData.title}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring focus:border-blue-500"
            placeholder="Project title"
          />
          {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
        </div>

        {/* Description */}
        <div>
          <label className="font-semibold block mb-1">Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring focus:border-blue-500"
            rows={4}
            placeholder="Project description"
          />
        </div>

        {/* Category */}
        <div>
          <label className="font-semibold block mb-1">Category</label>
          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring focus:border-blue-500"
          >
            {categories.map((cat, idx) => (
              <option key={idx} value={cat}>{cat}</option>
            ))}
          </select>
          {errors.category && <p className="text-red-500 text-sm mt-1">{errors.category}</p>}
        </div>

        {/* Thumbnail */}
        <div>
          <label className="font-semibold block mb-1">Thumbnail Image</label>
          <input type="file" accept="image/*" onChange={handleThumbnailChange} />
          {thumbnailPreview && (
            <img src={thumbnailPreview} alt="Thumbnail" className="mt-3 w-40 h-24 object-cover rounded shadow-md" />
          )}
          {errors.thumbnailUrl && <p className="text-red-500 text-sm mt-1">{errors.thumbnailUrl}</p>}
        </div>

        {/* Portfolio Images */}
        {/* <div>
          <label className="font-semibold block mb-1">Portfolio Images</label>
          <input type="file" accept="image/*" multiple onChange={handleImagesChange} />
          {imagePreviews.length > 0 && (
            <div className="flex flex-wrap gap-3 mt-3">
              {imagePreviews.map((src, idx) => (
                <img key={idx} src={src} alt={`img-${idx}`} className="w-24 h-20 object-cover rounded shadow" />
              ))}
            </div>
          )}
        </div> */}

        {/* Preview Link */}
        <div>
          <label className="font-semibold block mb-1">Preview Link</label>
          <input
            name="preview"
            value={formData.preview}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring focus:border-blue-500"
            placeholder="Enter live preview URL (e.g., https://example.com)"
          />
          {errors.preview && <p className="text-red-500 text-sm mt-1">{errors.preview}</p>}
        </div>

        {/* Source Link */}
        <div>
          <label className="font-semibold block mb-1">Source Link</label>
          <input
            name="source"
            value={formData.source}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring focus:border-blue-500"
            placeholder="Enter GitHub repo URL (e.g., https://github.com/username/repo)"
          />
          {errors.source && <p className="text-red-500 text-sm mt-1">{errors.source}</p>}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white w-full py-2 px-4 rounded hover:bg-blue-700 transition disabled:opacity-60"
        >
          {loading ? 'Submitting...' : 'Create Portfolio'}
        </button>
      </form>
    </div>
  );
};

export default CreatePage;