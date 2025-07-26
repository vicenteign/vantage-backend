'use client';

import { useState, useRef } from 'react';
import { PhotoIcon, XMarkIcon } from '@heroicons/react/24/outline';
import apiClient from '@/app/lib/api';
import { toast } from 'sonner';

interface ImageUploadProps {
  onImageUploaded: (imageUrl: string) => void;
  onImagesUploaded?: (imageUrls: string[]) => void;
  multiple?: boolean;
  maxImages?: number;
  endpoint: 'product-image' | 'service-image' | 'provider-logo';
  className?: string;
  label?: string;
}

export function ImageUpload({ 
  onImageUploaded, 
  onImagesUploaded, 
  multiple = false, 
  maxImages = 5,
  endpoint,
  className = '',
  label = 'Subir imagen'
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);

    try {
      const uploadPromises = Array.from(files).map(async (file) => {
        const formData = new FormData();
        formData.append('file', file);

        const response = await apiClient.post(`/upload/${endpoint}`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });

        return response.data.file_url;
      });

      const uploadedUrls = await Promise.all(uploadPromises);
      
      if (multiple) {
        const newImages = [...uploadedImages, ...uploadedUrls].slice(0, maxImages);
        setUploadedImages(newImages);
        onImagesUploaded?.(newImages);
      } else {
        setUploadedImages([uploadedUrls[0]]);
        onImageUploaded(uploadedUrls[0]);
      }

      toast.success('Imágenes subidas exitosamente');
    } catch (error: any) {
      toast.error('Error al subir imágenes', {
        description: error.response?.data?.message || 'No se pudieron subir las imágenes'
      });
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const removeImage = (index: number) => {
    const newImages = uploadedImages.filter((_, i) => i !== index);
    setUploadedImages(newImages);
    if (multiple) {
      onImagesUploaded?.(newImages);
    } else {
      onImageUploaded?.(newImages[0] || '');
    }
  };

  const canUploadMore = multiple ? uploadedImages.length < maxImages : uploadedImages.length === 0;

  return (
    <div className={`space-y-4 ${className}`}>
      <label className="block text-sm font-medium text-gray-700">
        {label}
      </label>

      {/* Área de subida */}
      {canUploadMore && (
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple={multiple}
            onChange={handleFileSelect}
            className="hidden"
            disabled={uploading}
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="flex flex-col items-center space-y-2 w-full"
          >
            <PhotoIcon className="h-12 w-12 text-gray-400" />
            <div>
              <p className="text-sm text-gray-600">
                {uploading ? 'Subiendo...' : 'Haz clic para seleccionar imágenes'}
              </p>
              <p className="text-xs text-gray-500">
                PNG, JPG, GIF hasta 10MB
              </p>
            </div>
          </button>
        </div>
      )}

      {/* Imágenes subidas */}
      {uploadedImages.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {uploadedImages.map((imageUrl, index) => (
            <div key={index} className="relative group">
              <img
                src={imageUrl}
                alt={`Imagen ${index + 1}`}
                className="w-full h-32 object-cover rounded-lg"
              />
              <button
                type="button"
                onClick={() => removeImage(index)}
                className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <XMarkIcon className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Información adicional */}
      {multiple && (
        <p className="text-xs text-gray-500">
          {uploadedImages.length} de {maxImages} imágenes subidas
        </p>
      )}
    </div>
  );
} 