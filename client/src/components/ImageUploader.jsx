import React, { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { FaUpload, FaTimes, FaSpinner, FaStar } from 'react-icons/fa';
import axios from 'axios';
import toast from 'react-hot-toast';
import RahalatekLoader from './RahalatekLoader';
import CustomButton from './CustomButton';

const ImageUploader = ({ 
  onImagesUploaded, 
  folder, 
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
      toast.error(`Maximum ${maxImages} images allowed`, {
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
      formData.append('folder', folder);

      const response = await axios.post('/api/images/upload-multiple', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`
        }
      });

      const newImages = response.data.images.map(img => ({
        ...img,
        altText: '',
        isPrimary: images.length === 0 && img === response.data.images[0]
      }));

      const updatedImages = [...images, ...newImages];
      setImages(updatedImages);
      onImagesUploaded(updatedImages);
      
      toast.success(`${acceptedFiles.length} image(s) uploaded successfully`, {
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
      toast.error('Failed to upload images', {
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
  }, [images, maxImages, folder, onImagesUploaded]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp']
    },
    maxFiles: maxImages - images.length,
    disabled: uploading || images.length >= maxImages
  });

  const removeImage = async (index) => {
    const imageToRemove = images[index];
    try {
      const token = localStorage.getItem('token');
      // Encode the publicId for URL safety
      const encodedPublicId = encodeURIComponent(imageToRemove.publicId);
      
      await axios.delete(`/api/images/delete/${encodedPublicId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
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

  const setPrimaryImage = (index) => {
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
      {images.length < maxImages && (
        <div
          {...getRootProps()}
          className={`
            border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-all duration-200
            ${isDragActive 
              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
              : 'border-gray-300 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500'
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
                  Uploading images...
                </span>
                <p className="text-gray-500 dark:text-gray-400 mt-1">
                  Please wait while we process your files
                </p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center space-y-2">
              <FaUpload className="w-8 h-8 text-gray-400" />
              <div className="text-sm">
                <span className="font-medium text-gray-700 dark:text-gray-200">
                  {isDragActive ? 'Drop images here' : 'Drag & drop images'}
                </span>
                <p className="text-gray-500 dark:text-gray-400 mt-1">
                  {isDragActive ? 'Release to upload' : `or click to select files (${images.length}/${maxImages})`}
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                  PNG, JPG, WebP up to 10MB each (max {maxImages} images)
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Image Preview Grid */}
      {images.length > 0 && (
        <div className="space-y-4">
          <h4 className="text-sm font-medium text-gray-900 dark:text-white">
            Uploaded Images ({images.length}/{maxImages})
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {images.map((image, index) => (
              <div
                key={image.publicId}
                className={`border-2 rounded-lg overflow-hidden ${
                  image.isPrimary ? 'border-blue-500' : 'border-gray-200 dark:border-gray-600'
                }`}
              >
                {/* Image Display */}
                <div className="relative group">
                  <img
                    src={image.url}
                    alt={image.altText || `Image ${index + 1}`}
                    className="w-full h-32 object-cover"
                  />
                  
                  {/* Primary Badge */}
                  {image.isPrimary && (
                    <div className="absolute top-2 left-2 bg-blue-500 text-white px-2 py-1 rounded text-xs font-medium flex items-center space-x-1">
                      <FaStar className="w-3 h-3" />
                      <span>Primary</span>
                    </div>
                  )}
                  
                  {/* Overlay Controls */}
                  <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-2">
                    <CustomButton
                      variant={image.isPrimary ? "yellow" : "white"}
                      size="sm"
                      shape="circular"
                      icon={FaStar}
                      onClick={() => setPrimaryImage(index)}
                      title={image.isPrimary ? 'Primary image' : 'Set as primary'}
                    />
                    <CustomButton
                      variant="red"
                      size="sm"
                      shape="circular"
                      icon={FaTimes}
                      onClick={() => removeImage(index)}
                      title="Remove image"
                    />
                  </div>
                </div>
                
                {/* Alt Text Input */}
                <div className="p-3">
                  <input
                    type="text"
                    placeholder="Add image description..."
                    value={image.altText || ''}
                    onChange={(e) => updateAltText(index, e.target.value)}
                    className="w-full text-sm border border-gray-300 dark:border-gray-600 rounded px-2 py-1 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageUploader;
