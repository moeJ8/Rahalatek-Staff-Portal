import React, { useState, useEffect } from 'react';
import { Card, Table, Modal, Alert, Spinner } from 'flowbite-react';
import CustomModal from '../CustomModal';
import { FaPlus, FaEdit, FaTrash, FaEye, FaEyeSlash, FaArrowUp, FaArrowDown, FaSave, FaTimes, FaImages, FaPalette, FaCog } from 'react-icons/fa';
import CustomButton from '../CustomButton';
import TextInput from '../TextInput';
import CustomSelect from '../Select';
import CustomCheckbox from '../CustomCheckbox';
import RahalatekLoader from '../RahalatekLoader';
import DeleteConfirmationModal from '../DeleteConfirmationModal';
import ImageUploader from '../ImageUploader';
import CustomTable from '../CustomTable';
import ModalScrollbar from '../ModalScrollbar';
import toast from 'react-hot-toast';

// Carousel Management Component
const CarouselManagement = () => {
  const [slides, setSlides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [editingSlide, setEditingSlide] = useState(null);
  const [slideToDelete, setSlideToDelete] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    description: '',
    images: [],
    button: {
      text: '',
      link: '',
      variant: 'blueToTeal',
      openInNewTab: false
    },
    textPosition: 'center',
    textColor: 'light',
    isActive: true,
    order: 0
  });

  // Button variant options
  const buttonVariants = [
    { value: 'blueToTeal', label: 'Blue to Teal Gradient' },
    { value: 'greenToBlue', label: 'Green to Blue Gradient' },
    { value: 'purpleToPink', label: 'Purple to Pink Gradient' },
    { value: 'pinkToOrange', label: 'Pink to Orange Gradient' },
    { value: 'rippleWhiteToTeal', label: 'Ripple: White to Teal' },
    { value: 'rippleBlackToBlue', label: 'Ripple: Black to Blue' },
    { value: 'rippleGrayToGreen', label: 'Ripple: Gray to Green' },
    { value: 'rippleGrayToBlue', label: 'Ripple: Gray to Blue' },
    { value: 'rippleTealToBlue', label: 'Ripple: Teal to Blue' },
    { value: 'ripplePurpleToRed', label: 'Ripple: Purple to Red' },
    { value: 'rippleBlueToTeal', label: 'Ripple: Blue to Teal' }
  ];

  // Fetch slides
  const fetchSlides = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch('/api/carousel', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch carousel slides');
      }

      const data = await response.json();
      setSlides(data);
      setError('');
    } catch (err) {
      console.error('Error fetching slides:', err);
      setError('Failed to load carousel slides');
      setSlides([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSlides();
  }, []);

  // Reset form
  const resetForm = () => {
    setFormData({
      title: '',
      subtitle: '',
      description: '',
      images: [],
      button: {
        text: '',
        link: '',
        variant: 'blueToTeal',
        openInNewTab: false
      },
      textPosition: 'center',
      textColor: 'light',
      isActive: true,
      order: 0
    });
    setEditingSlide(null);
  };

  // Open modal for creating/editing
  const openModal = (slide = null) => {
    if (slide) {
      setEditingSlide(slide);
      setFormData({
        title: slide.title,
        subtitle: slide.subtitle || '',
        description: slide.description || '',
        images: slide.image ? [slide.image] : [],
        button: slide.button || {
          text: '',
          link: '',
          variant: 'blueToTeal',
          openInNewTab: false
        },
        textPosition: slide.textPosition,
        textColor: slide.textColor,
        isActive: slide.isActive,
        order: slide.order
      });
    } else {
      resetForm();
      setFormData(prev => ({ ...prev, order: slides.length }));
    }
    setModalOpen(true);
  };

  // Close modal
  const closeModal = () => {
    setModalOpen(false);
    resetForm();
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const token = localStorage.getItem('token');
      
      // Validate required fields
      if (!formData.title.trim()) {
        throw new Error('Title is required');
      }
      
      if (formData.images.length === 0) {
        throw new Error('At least one image is required');
      }

      if (!formData.button.text.trim()) {
        throw new Error('Button text is required');
      }

      if (!formData.button.link.trim()) {
        throw new Error('Button link is required');
      }

      // Prepare data for submission
      const submitData = {
        title: formData.title,
        subtitle: formData.subtitle,
        description: formData.description,
        image: formData.images[0], // Use first image
        button: formData.button,
        textPosition: formData.textPosition,
        textColor: formData.textColor,
        isActive: formData.isActive,
        order: formData.order
      };

      const url = editingSlide 
        ? `/api/carousel/${editingSlide._id}` 
        : '/api/carousel';
      
      const method = editingSlide ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(submitData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to save slide');
      }

      toast.success(
        editingSlide 
          ? 'Carousel slide updated successfully!' 
          : 'Carousel slide created successfully!',
        {
          duration: 3000,
          style: {
            background: '#4CAF50',
            color: '#fff',
            fontWeight: 'bold',
          }
        }
      );

      closeModal();
      fetchSlides();
    } catch (err) {
      console.error('Error saving slide:', err);
      toast.error(err.message || 'Failed to save carousel slide', {
        duration: 4000,
        style: {
          background: '#f44336',
          color: '#fff',
          fontWeight: 'bold',
        }
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Handle delete
  const handleDelete = async () => {
    if (!slideToDelete) return;

    setDeleting(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/carousel/${slideToDelete._id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete slide');
      }

      toast.success('Carousel slide deleted successfully!', {
        duration: 3000,
        style: {
          background: '#4CAF50',
          color: '#fff',
          fontWeight: 'bold',
        }
      });

      setDeleteModalOpen(false);
      setSlideToDelete(null);
      fetchSlides();
    } catch (err) {
      console.error('Error deleting slide:', err);
      toast.error('Failed to delete carousel slide', {
        duration: 4000,
        style: {
          background: '#f44336',
          color: '#fff',
          fontWeight: 'bold',
        }
      });
    } finally {
      setDeleting(false);
    }
  };

  // Toggle slide status
  const toggleSlideStatus = async (slide) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/carousel/${slide._id}/status`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ isActive: !slide.isActive })
      });

      if (!response.ok) {
        throw new Error('Failed to update slide status');
      }

      toast.success(
        `Slide ${!slide.isActive ? 'activated' : 'deactivated'} successfully!`,
        {
          duration: 3000,
          style: {
            background: '#4CAF50',
            color: '#fff',
            fontWeight: 'bold',
          }
        }
      );

      fetchSlides();
    } catch (err) {
      console.error('Error updating slide status:', err);
      toast.error('Failed to update slide status', {
        duration: 4000,
        style: {
          background: '#f44336',
          color: '#fff',
          fontWeight: 'bold',
        }
      });
    }
  };

  // Handle images uploaded
  const handleImagesUploaded = (uploadedImages) => {
    setFormData(prev => ({
      ...prev,
      images: uploadedImages
    }));
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <RahalatekLoader size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          {/* Header text removed as requested */}
        </div>
         <CustomButton
            onClick={() => openModal()}
            variant="blueToTeal"
            size="md"
          >
            <div className="flex items-center gap-2">
              <FaPlus className="w-3 h-3" />
              <span>Create Slide</span>
            </div>
          </CustomButton>
      </div>

      {error && (
        <Alert color="failure">
          <span>{error}</span>
        </Alert>
      )}

      {/* Slides Table */}
      <CustomTable
        headers={[
          'Preview',
          'Content', 
          'Button',
          'Status',
          'Order',
          'Created',
          'Actions'
        ]}
        data={slides}
        emptyMessage="No carousel slides found. Create your first slide to get started."
        emptyIcon={FaImages}
        renderRow={(slide) => (
          <>
            <Table.Cell>
              <img
                src={slide.image.url}
                alt={slide.title}
                className="w-20 h-12 object-cover rounded border"
              />
            </Table.Cell>
            <Table.Cell>
              <div className="max-w-xs">
                <div className="font-medium text-gray-900 dark:text-white text-sm">
                  {slide.title}
                </div>
                {slide.subtitle && (
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {slide.subtitle}
                  </div>
                )}
                <div className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                  Text: {slide.textPosition} / {slide.textColor}
                </div>
              </div>
            </Table.Cell>
            <Table.Cell>
              <div className="text-sm">
                <div className="font-medium text-gray-900 dark:text-white">
                  {slide.button?.text}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {slide.button?.variant}
                </div>
              </div>
            </Table.Cell>
            <Table.Cell>
              <button
                onClick={() => toggleSlideStatus(slide)}
                className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium transition-colors ${
                  slide.isActive
                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                    : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                }`}
              >
                {slide.isActive ? <FaEye className="w-3 h-3 mr-1" /> : <FaEyeSlash className="w-3 h-3 mr-1" />}
                {slide.isActive ? 'Active' : 'Inactive'}
              </button>
            </Table.Cell>
            <Table.Cell>
              <span className="font-mono text-sm">{slide.order}</span>
            </Table.Cell>
            <Table.Cell>
              <div className="text-sm">
                <div className="text-gray-900 dark:text-white">
                  {new Date(slide.createdAt).toLocaleDateString()}
                </div>
                <div className="text-gray-500 dark:text-gray-400">
                  by {slide.createdBy?.username}
                </div>
              </div>
            </Table.Cell>
            <Table.Cell>
              <div className="flex items-center gap-2">
                <CustomButton
                  onClick={() => openModal(slide)}
                  variant="purple"
                  size="xs"
                  icon={FaEdit}
                />
                <CustomButton
                  onClick={() => {
                    setSlideToDelete(slide);
                    setDeleteModalOpen(true);
                  }}
                  variant="red"
                  size="xs"
                  icon={FaTrash}
                />
              </div>
            </Table.Cell>
          </>
        )}
      />

      {/* Create/Edit Modal */}
      <CustomModal
        isOpen={modalOpen}
        onClose={closeModal}
        title={editingSlide ? 'Edit Carousel Slide' : 'Create Carousel Slide'}
        subtitle="Configure the carousel slide content and display settings"
        maxWidth="md:max-w-4xl"
        className="carousel-slide-modal"
      >
        <ModalScrollbar maxHeight="480px">
          <div className="space-y-6 pb-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Content Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <TextInput
                  label="Title *"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Enter slide title"
                  required
                />
                <TextInput
                  label="Subtitle"
                  value={formData.subtitle}
                  onChange={(e) => setFormData(prev => ({ ...prev, subtitle: e.target.value }))}
                  placeholder="Enter slide subtitle (optional)"
                />
              </div>

              <TextInput
                label="Description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Enter slide description (optional)"
                isTextarea
                rows={3}
              />

              {/* Image Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Background Image *
                </label>
                <ImageUploader
                  onImagesUploaded={handleImagesUploaded}
                  folder="carousel"
                  maxImages={1}
                  existingImages={formData.images}
                />
              </div>

              {/* Button Configuration */}
              <div className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 dark:text-white mb-4">Button Configuration</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <TextInput
                    label="Button Text *"
                    value={formData.button.text}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      button: { ...prev.button, text: e.target.value }
                    }))}
                    placeholder="Enter button text"
                    required
                  />
                  
                  <TextInput
                    label="Button Link *"
                    value={formData.button.link}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      button: { ...prev.button, link: e.target.value }
                    }))}
                    placeholder="https://example.com or /page"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <CustomSelect
                    label="Button Variant"
                    value={formData.button.variant}
                    onChange={(value) => setFormData(prev => ({
                      ...prev,
                      button: { ...prev.button, variant: value }
                    }))}
                    options={buttonVariants}
                  />

                  <div className="flex items-end">
                    <CustomCheckbox
                      id="open-new-tab"
                      label="Open link in new tab"
                      checked={formData.button.openInNewTab}
                      onChange={(checked) => setFormData(prev => ({
                        ...prev,
                        button: { ...prev.button, openInNewTab: checked }
                      }))}
                    />
                  </div>
                </div>
              </div>

              {/* Display Settings */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <CustomSelect
                  label="Text Position"
                  value={formData.textPosition}
                  onChange={(value) => setFormData(prev => ({ ...prev, textPosition: value }))}
                  options={[
                    { value: 'left', label: 'Left' },
                    { value: 'center', label: 'Center' },
                    { value: 'right', label: 'Right' }
                  ]}
                />

                <CustomSelect
                  label="Text Color"
                  value={formData.textColor}
                  onChange={(value) => setFormData(prev => ({ ...prev, textColor: value }))}
                  options={[
                    { value: 'light', label: 'Light' },
                    { value: 'dark', label: 'Dark' }
                  ]}
                />

                <TextInput
                  label="Order"
                  type="number"
                  value={formData.order}
                  onChange={(e) => setFormData(prev => ({ ...prev, order: parseInt(e.target.value) || 0 }))}
                  min="0"
                />
              </div>

              {/* Status */}
              <div>
                <CustomCheckbox
                  id="is-active"
                  label="Active (visible on homepage)"
                  checked={formData.isActive}
                  onChange={(checked) => setFormData(prev => ({ ...prev, isActive: checked }))}
                />
              </div>

              {/* Footer with Buttons */}
              <div className="border-t border-gray-200 dark:border-gray-600 pt-6 mt-6">
                <div className="flex justify-end gap-3">
                  <CustomButton
                    onClick={closeModal}
                    variant="gray"
                    disabled={submitting}
                  >
                    Cancel
                  </CustomButton>
                  <CustomButton
                    onClick={handleSubmit}
                    variant="teal"
                    loading={submitting}
                  >
                    {editingSlide ? 'Update Slide' : 'Create Slide'}
                  </CustomButton>
                </div>
              </div>
            </form>
          </div>
        </ModalScrollbar>
      </CustomModal>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        show={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setSlideToDelete(null);
        }}
        onConfirm={handleDelete}
        isLoading={deleting}
        itemType="carousel slide"
        itemName={slideToDelete?.title || 'this slide'}
      />
    </div>
  );
};

// Main UI Management Component with Tabs
export default function UIManagement() {
  const [activeTab, setActiveTab] = useState('carousel');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          UI Management
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Manage user interface elements and content display
        </p>
      </div>

      {/* Custom Tabs Navigation - Only Carousel Tab */}
      <div className="flex justify-center mb-6">
        <div className="flex border-b border-gray-200 dark:border-slate-700 bg-gray-50/80 dark:bg-slate-800/60 backdrop-blur-sm rounded-t-lg overflow-hidden shadow-sm w-full sm:w-auto">
          <div className="flex gap-0 w-full">
            <button
              onClick={() => setActiveTab('carousel')}
              className={`flex-1 px-4 sm:px-6 py-3 text-sm font-medium transition-colors duration-200 flex items-center justify-center gap-2 ${
                activeTab === 'carousel'
                  ? 'bg-white/90 dark:bg-slate-900/80 backdrop-blur-md text-blue-600 dark:text-teal-400 border-b-2 border-blue-500 dark:border-teal-500 shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-100/70 dark:hover:bg-slate-700/50 hover:backdrop-blur-sm'
              }`}
            >
              <FaImages className="w-4 h-4" />
              <span>Carousel</span>
            </button>
          </div>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'carousel' && (
        <div>
          <CarouselManagement />
        </div>
      )}
    </div>
  );
}
