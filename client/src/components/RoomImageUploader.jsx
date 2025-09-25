import React, { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { FaUpload, FaTimes, FaSpinner, FaStar, FaImages } from 'react-icons/fa';
import axios from 'axios';
import toast from 'react-hot-toast';
import RahalatekLoader from './RahalatekLoader';
import CustomButton from './CustomButton';

const RoomImageUploader = ({ 
  onImagesUploaded, 
  roomType,
  maxImages = 5,
  existingImages = [] 
}) => {
  const [uploading, setUploading] = useState(false);
  const [images, setImages] = useState(existingImages);

  // Update images when existingImages prop changes (for duplication functionality)
  useEffect(() => {
    setImages(existingImages);
  }, [existingImages]);

  const onDrop = useCallback(async (acceptedFiles) => {
    if (images.length + acceptedFiles.length > maxImages) {
      toast.error(`Maximum ${maxImages} images allowed for ${roomType}`, {
        duration: 4000,
        style: {
          background: '#f44336',
          color: '#fff',
          fontWeight: 'bold',
          fontSize: '16px',
          padding: '16px',
        },
        iconTheme: {
          primary: '#fff',
          secondary: '#f44336',
        },
      });
      return;
    }

    setUploading(true);
    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      
      acceptedFiles.forEach(file => {
        formData.append('images', file);
      });
      // Use room type as folder structure
      formData.append('folder', `rooms/${roomType.toLowerCase().replace(/\s+/g, '-')}`);

      const response = await axios.post('/api/images/upload-multiple', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`
        }
      });

      const newImages = response.data.images.map(img => ({
        ...img,
        altText: `${roomType} room`,
        isPrimary: images.length === 0 && img === response.data.images[0]
      }));

      const updatedImages = [...images, ...newImages];
      setImages(updatedImages);
      onImagesUploaded(updatedImages);
      
      toast.success(`${acceptedFiles.length} image(s) uploaded for ${roomType}`, {
        duration: 3000,
        style: {
          background: '#4CAF50',
          color: '#fff',
          fontWeight: 'bold',
          fontSize: '16px',
          padding: '16px',
        },
        iconTheme: {
          primary: '#fff',
          secondary: '#4CAF50',
        },
      });
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload room images', {
        duration: 4000,
        style: {
          background: '#f44336',
          color: '#fff',
          fontWeight: 'bold',
          fontSize: '16px',
          padding: '16px',
        },
        iconTheme: {
          primary: '#fff',
          secondary: '#f44336',
        },
      });
    } finally {
      setUploading(false);
    }
  }, [images, maxImages, roomType, onImagesUploaded]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp']
    },
    multiple: true,
    disabled: uploading
  });

  const removeImage = async (index, publicId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`/api/images/delete/${encodeURIComponent(publicId)}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const updatedImages = images.filter((_, i) => i !== index);
      setImages(updatedImages);
      onImagesUploaded(updatedImages);
      
      toast.success('Image removed successfully', {
        duration: 3000,
        style: {
          background: '#4CAF50',
          color: '#fff',
          fontWeight: 'bold',
          fontSize: '16px',
          padding: '16px',
        },
        iconTheme: {
          primary: '#fff',
          secondary: '#4CAF50',
        },
      });
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Failed to remove image', {
        duration: 4000,
        style: {
          background: '#f44336',
          color: '#fff',
          fontWeight: 'bold',
          fontSize: '16px',
          padding: '16px',
        },
        iconTheme: {
          primary: '#fff',
          secondary: '#f44336',
        },
      });
    }
  };

  const setPrimary = (index) => {
    const updatedImages = images.map((img, i) => ({
      ...img,
      isPrimary: i === index
    }));
    setImages(updatedImages);
    onImagesUploaded(updatedImages);
  };

  const updateAltText = (index, altText) => {
    const updatedImages = images.map((img, i) => 
      i === index ? { ...img, altText } : img
    );
    setImages(updatedImages);
    onImagesUploaded(updatedImages);
  };

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-all duration-200
          ${isDragActive 
            ? 'border-teal-500 bg-teal-50 dark:bg-teal-900/20' 
            : 'border-gray-300 dark:border-gray-600 hover:border-teal-400 dark:hover:border-teal-500'
          }
          ${uploading ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        <input {...getInputProps()} />
        {uploading ? (
          <div className="flex flex-col items-center space-y-2">
            <RahalatekLoader size="sm" />
            <div className="text-sm">
              <span className="font-medium text-gray-700 dark:text-gray-200">
                Uploading room images...
              </span>
              <p className="text-gray-500 dark:text-gray-400 mt-1">
                Processing images for {roomType}
              </p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center space-y-2">
            <FaImages className="w-8 h-8 text-gray-400" />
            <div className="text-sm">
              <span className="font-medium text-gray-700 dark:text-gray-200">
                {`Upload images for ${roomType}`}
              </span>
              <p className="text-gray-500 dark:text-gray-400 mt-1">
                {isDragActive ? 'Drop images here' : 'Drag & drop or click to select'}
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                PNG, JPG, WEBP up to 10MB each (max {maxImages} images)
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Image Grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {images.map((image, index) => (
            <div key={index} className="relative group">
              <div className="relative overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700">
                <img
                  src={image.url}
                  alt={image.altText || `${roomType} room ${index + 1}`}
                  className="w-full h-32 object-cover"
                />
                
                {/* Overlay */}
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200 flex items-center justify-center">
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex space-x-2">
                    <CustomButton
                      variant={image.isPrimary ? "yellow" : "white"}
                      size="sm"
                      shape="circular"
                      icon={FaStar}
                      onClick={() => setPrimary(index)}
                      title={image.isPrimary ? 'Primary image' : 'Set as primary'}
                    />
                    <CustomButton
                      variant="red"
                      size="sm"
                      shape="circular"
                      icon={FaTimes}
                      onClick={() => removeImage(index, image.publicId)}
                      title="Remove image"
                    />
                  </div>
                </div>

                {/* Primary badge */}
                {image.isPrimary && (
                  <div className="absolute top-2 left-2 bg-yellow-500 text-white text-xs px-2 py-1 rounded-full flex items-center space-x-1">
                    <FaStar className="w-2 h-2" />
                    <span>Primary</span>
                  </div>
                )}
              </div>

              {/* Alt text input */}
              <input
                type="text"
                placeholder="Image description..."
                value={image.altText || ''}
                onChange={(e) => updateAltText(index, e.target.value)}
                className="mt-2 w-full text-xs p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              />
            </div>
          ))}
        </div>
      )}

      {/* Images count */}
      {images.length > 0 && (
        <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
          {images.length} of {maxImages} images uploaded for {roomType}
        </p>
      )}
    </div>
  );
};

export default RoomImageUploader;
