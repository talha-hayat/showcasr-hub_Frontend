// components/ui/Modal.tsx
import React from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  imageUrl: string;
  onClose: () => void;
}

export default function Modal({ imageUrl, onClose }: ModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75">
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-white hover:text-red-500"
      >
        <X size={32} />
      </button>
      <img
        src={imageUrl}
        alt="Full preview"
        className="max-h-[90vh] max-w-[90vw] object-contain rounded-md"
      />
    </div>
  );
}
