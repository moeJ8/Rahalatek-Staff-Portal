import React, { useState, useEffect } from 'react';
import { Table } from 'flowbite-react';
import { FaPlus, FaEdit, FaTrash, FaEye, FaEyeSlash, FaSave, FaTimes, FaImages, FaPalette } from 'react-icons/fa';
import CustomButton from '../CustomButton';
import TextInput from '../TextInput';
import CustomSelect from '../Select';
import CustomCheckbox from '../CustomCheckbox';
import RahalatekLoader from '../RahalatekLoader';
import DeleteConfirmationModal from '../DeleteConfirmationModal';
import ImageUploader from '../ImageUploader';
import CustomTable from '../CustomTable';
import CustomModal from '../CustomModal';
import toast from 'react-hot-toast';

const AboutHeroManagement = () => {
  const [heroes, setHeroes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [editingHero, setEditingHero] = useState(null);
  const [heroToDelete, setHeroToDelete] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    description: '',
    images: [],
    textPosition: 'center',
    textColor: 'light',
    isActive: true
  });

  // Fetch heroes
  const fetchHeroes = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch('/api/about-hero', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch about heroes');
      }

      const data = await response.json();
      setHeroes(data);
      setError('');
    } catch (err) {
      console.error('Error fetching heroes:', err);
      setError('Failed to load about heroes');
      setHeroes([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHeroes();
  }, []);

  // Reset form
  const resetForm = () => {
    setFormData({
      title: '',
      subtitle: '',
      description: '',
      images: [],
      textPosition: 'center',
      textColor: 'light',
      isActive: true
    });
    setEditingHero(null);
  };

  // Open modal for creating/editing
  const openModal = (hero = null) => {
    if (hero) {
      setEditingHero(hero);
      setFormData({
        title: hero.title,
        subtitle: hero.subtitle || '',
        description: hero.description || '',
        images: hero.image ? [hero.image] : [],
        textPosition: hero.textPosition,
        textColor: hero.textColor,
        isActive: hero.isActive
      });
    } else {
      resetForm();
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
      // Validation
      if (!formData.title.trim()) {
        toast.error('Title is required');
        setSubmitting(false);
        return;
      }

      if (formData.images.length === 0) {
        toast.error('Please upload an image');
        setSubmitting(false);
        return;
      }

      const token = localStorage.getItem('token');
      const url = editingHero 
        ? `/api/about-hero/${editingHero._id}`
        : '/api/about-hero';
      
      const method = editingHero ? 'PUT' : 'POST';

      const requestBody = {
        title: formData.title.trim(),
        subtitle: formData.subtitle.trim(),
        description: formData.description.trim(),
        image: formData.images[0],
        textPosition: formData.textPosition,
        textColor: formData.textColor,
        isActive: formData.isActive
      };

      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to save about hero');
      }

      const data = await response.json();
      
      toast.success(data.message || `About hero ${editingHero ? 'updated' : 'created'} successfully`);
      
      // Refresh heroes list
      await fetchHeroes();
      
      // Close modal and reset form
      closeModal();
    } catch (err) {
      console.error('Error saving about hero:', err);
      toast.error(err.message || 'Failed to save about hero');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle delete
  const handleDelete = async () => {
    if (!heroToDelete) return;

    setDeleting(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/about-hero/${heroToDelete._id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete about hero');
      }

      const data = await response.json();
      toast.success(data.message || 'About hero deleted successfully');
      
      // Refresh heroes list
      await fetchHeroes();
      
      // Close delete modal
      setDeleteModalOpen(false);
      setHeroToDelete(null);
    } catch (err) {
      console.error('Error deleting about hero:', err);
      toast.error(err.message || 'Failed to delete about hero');
    } finally {
      setDeleting(false);
    }
  };

  // Toggle active status
  const toggleActiveStatus = async (hero) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/about-hero/${hero._id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ isActive: !hero.isActive })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update status');
      }

      const data = await response.json();
      toast.success(data.message || 'Status updated successfully');
      
      // Refresh heroes list
      await fetchHeroes();
    } catch (err) {
      console.error('Error toggling status:', err);
      toast.error(err.message || 'Failed to update status');
    }
  };

  // Handle image upload
  const handleImagesUploaded = (uploadedImages) => {
    setFormData(prev => ({
      ...prev,
      images: uploadedImages
    }));
  };

  // Table headers and render function
  const headers = ['Image', 'Title', 'Position', 'Text Color', 'Status', 'Actions'];

  const renderRow = (hero) => (
    <>
      <Table.Cell className="px-4 py-3">
        <img
          src={hero.image?.url}
          alt={hero.image?.altText || hero.title}
          className="w-20 h-12 object-cover rounded"
        />
      </Table.Cell>
      <Table.Cell className="px-4 py-3">
        <div>
          <div className="font-medium text-gray-900 dark:text-white">{hero.title}</div>
          {hero.subtitle && (
            <div className="text-sm text-gray-500 dark:text-gray-400">{hero.subtitle}</div>
          )}
        </div>
      </Table.Cell>
      <Table.Cell className="px-4 py-3">
        <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
          {hero.textPosition}
        </span>
      </Table.Cell>
      <Table.Cell className="px-4 py-3">
        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
          hero.textColor === 'light' 
            ? 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
            : 'bg-gray-800 text-white dark:bg-gray-300 dark:text-gray-900'
        }`}>
          {hero.textColor}
        </span>
      </Table.Cell>
      <Table.Cell className="px-4 py-3">
        <button
          onClick={() => toggleActiveStatus(hero)}
          className={`inline-flex items-center gap-2 px-3 py-1 text-xs font-medium rounded-full transition-colors ${
            hero.isActive
              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300 hover:bg-green-200 dark:hover:bg-green-800'
              : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
          }`}
        >
          {hero.isActive ? <FaEye /> : <FaEyeSlash />}
          {hero.isActive ? 'Active' : 'Inactive'}
        </button>
      </Table.Cell>
      <Table.Cell className="px-4 py-3">
        <div className="flex items-center gap-2">
          <CustomButton
            onClick={() => openModal(hero)}
            variant="blue"
            size="sm"
          >
            <FaEdit className="mr-1" />
            Edit
          </CustomButton>
          <CustomButton
            onClick={() => {
              setHeroToDelete(hero);
              setDeleteModalOpen(true);
            }}
            variant="red"
            size="sm"
          >
            <FaTrash className="mr-1" />
            Delete
          </CustomButton>
        </div>
      </Table.Cell>
    </>
  );

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
              <span>Add New Hero</span>
            </div>
          </CustomButton>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-red-800 dark:text-red-300">{error}</p>
        </div>
      )}

      {/* Heroes Table */}
        {heroes.length === 0 ? (
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm p-12 text-center">
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              No about heroes created yet. Click "Add New Hero" to get started.
            </p>
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden lg:block">
              <CustomTable
                data={heroes}
                headers={headers}
                renderRow={renderRow}
                emptyMessage="No about heroes found"
              />
            </div>

            {/* Mobile/Tablet Cards View */}
            <div className="lg:hidden grid grid-cols-1 md:grid-cols-2 gap-4">
              {heroes.map((hero, index) => (
                <div
                  key={hero._id}
                  className="bg-white dark:bg-slate-900 rounded-lg p-4 border border-gray-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-all duration-300"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="space-y-3">
                    {/* Image and Title */}
                    <div className="flex gap-3">
                      <img
                        src={hero.image?.url}
                        alt={hero.image?.altText || hero.title}
                        className="w-24 h-16 object-cover rounded flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-gray-900 dark:text-white text-sm truncate">
                          {hero.title}
                        </h3>
                        {hero.subtitle && (
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                            {hero.subtitle}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Badges */}
                    <div className="flex flex-wrap gap-2">
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                        {hero.textPosition}
                      </span>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        hero.textColor === 'light' 
                          ? 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                          : 'bg-gray-800 text-white dark:bg-gray-300 dark:text-gray-900'
                      }`}>
                        {hero.textColor}
                      </span>
                      <button
                        onClick={() => toggleActiveStatus(hero)}
                        className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full transition-colors ${
                          hero.isActive
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                            : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                        }`}
                      >
                        {hero.isActive ? <FaEye className="w-3 h-3" /> : <FaEyeSlash className="w-3 h-3" />}
                        {hero.isActive ? 'Active' : 'Inactive'}
                      </button>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 pt-3 border-t border-gray-200 dark:border-slate-700">
                      <CustomButton
                        onClick={() => openModal(hero)}
                        variant="blue"
                        size="sm"
                        className="flex-1"
                      >
                        <FaEdit className="mr-1" />
                        Edit
                      </CustomButton>
                      <CustomButton
                        onClick={() => {
                          setHeroToDelete(hero);
                          setDeleteModalOpen(true);
                        }}
                        variant="red"
                        size="sm"
                        className="flex-1"
                      >
                        <FaTrash className="mr-1" />
                        Delete
                      </CustomButton>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

      {/* Create/Edit Modal */}
      <CustomModal
        isOpen={modalOpen}
        onClose={closeModal}
        title={editingHero ? 'Edit About Hero' : 'Create About Hero'}
        maxWidth="md:max-w-5xl"
      >
        <div className="p-6">
            {/* Form Section */}
            <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <TextInput
              label="Title *"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Enter hero title"
              required
              maxLength={100}
            />

            {/* Subtitle */}
            <TextInput
              label="Subtitle"
              value={formData.subtitle}
              onChange={(e) => setFormData(prev => ({ ...prev, subtitle: e.target.value }))}
              placeholder="Enter hero subtitle (optional)"
              maxLength={200}
            />

            {/* Description */}
            <TextInput
              label="Description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Enter hero description (optional)"
              maxLength={500}
              as="textarea"
              rows={4}
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {formData.description.length}/500 characters
            </p>

            {/* Image Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Hero Image * (Recommended: 1920x1080px or larger)
              </label>
              <ImageUploader
                existingImages={formData.images}
                onImagesUploaded={handleImagesUploaded}
                maxImages={1}
                folder="about-hero"
              />
            </div>

            {/* Text Position */}
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

            {/* Text Color */}
            <CustomSelect
              label="Text Color"
              value={formData.textColor}
              onChange={(value) => setFormData(prev => ({ ...prev, textColor: value }))}
              options={[
                { value: 'light', label: 'Light (White)' },
                { value: 'dark', label: 'Dark (Black)' }
              ]}
            />

            {/* Active Status */}
            <div>
              <CustomCheckbox
                label="Set as Active Hero"
                checked={formData.isActive}
                onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 ml-6">
                Only one hero can be active at a time. Activating this will deactivate all other heroes.
              </p>
            </div>
          </form>

           {/* Live Preview Section */}
           <div className="mt-4 md:mt-6 space-y-2 md:space-y-3 border-t dark:border-gray-700 pt-3 md:pt-4">
             <div className="flex items-center justify-between mb-1 md:mb-2">
               <h3 className="text-sm md:text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-1 md:gap-2">
                 <FaEye className="text-blue-500 dark:text-teal-400 w-3 h-3 md:w-4 md:h-4" />
                 <span className="hidden sm:inline">Live Preview</span>
                 <span className="sm:hidden">Preview</span>
               </h3>
             </div>
             
             {/* Container with scale transform for true miniature preview */}
             <div className="relative w-full aspect-[4/3] sm:aspect-[16/9] md:aspect-[21/9] overflow-hidden rounded md:rounded-lg border border-blue-200 dark:border-teal-600 md:border-2 shadow md:shadow-lg bg-gray-900">
              <div className="absolute inset-0" style={{ transform: 'scale(0.65)', transformOrigin: 'center center', width: '154%', height: '154%', left: '-27%', top: '-27%' }}>
                {/* Background Image */}
                {formData.images.length > 0 ? (
                  <img
                    src={formData.images[0].url}
                    alt={formData.title || 'Preview'}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-gray-300 to-gray-400 dark:from-gray-700 dark:to-gray-800 flex items-center justify-center">
                    <div className="text-center text-gray-600 dark:text-gray-400">
                      <FaImages className="w-32 h-32 mx-auto mb-4 opacity-50" />
                      <p className="text-2xl font-medium">Upload an image to see preview</p>
                    </div>
                  </div>
                )}

                {/* Overlay */}
                <div className="absolute inset-0 bg-black/40"></div>

                {/* Content - Exact match to AboutHeroSection */}
                <div className={`absolute inset-0 flex flex-col justify-center ${
                  formData.textPosition === 'left' ? 'items-start' :
                  formData.textPosition === 'right' ? 'items-end' :
                  'items-center'
                } p-4 sm:p-6 md:p-10 lg:p-20`}>
                  <div className={`max-w-4xl ${formData.textColor === 'dark' ? 'text-gray-900' : 'text-white'} z-10 ${
                    formData.textPosition === 'left' ? 'text-left' :
                    formData.textPosition === 'right' ? 'text-right' :
                    'text-center'
                  }`}>
                    {/* Title - Slightly smaller on mobile */}
                    <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold mb-2 sm:mb-3 md:mb-4 lg:mb-6 leading-tight">
                      {formData.title || 'Your Hero Title'}
                    </h1>

                    {/* Subtitle - Slightly smaller on mobile */}
                    {(formData.subtitle || !formData.title) && (
                      <h2 className="text-base sm:text-xl md:text-2xl lg:text-3xl font-medium mb-3 sm:mb-4 md:mb-6 opacity-90">
                        {formData.subtitle || 'Your hero subtitle here'}
                      </h2>
                    )}

                    {/* Description - Slightly smaller on mobile */}
                    {(formData.description || !formData.title) && (
                      <p className={`text-sm sm:text-lg md:text-xl lg:text-2xl opacity-80 leading-relaxed ${
                        formData.textPosition === 'center' ? 'mx-auto max-w-2xl' :
                        formData.textPosition === 'right' ? 'ml-auto max-w-2xl' :
                        'max-w-2xl'
                      }`}>
                        {formData.description || 'Your hero description will appear here. This is a preview of how your content will look on the About Us page.'}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Preview Info */}
            <div className="grid grid-cols-2 gap-1.5 md:gap-2">
              <div className="bg-blue-50 dark:bg-slate-800 p-1.5 md:p-2 rounded border border-blue-200 dark:border-slate-600 text-center">
                <span className="text-[10px] md:text-xs text-gray-600 dark:text-gray-400 block">Position</span>
                <span className="text-xs md:text-sm text-gray-900 dark:text-white font-semibold capitalize">{formData.textPosition}</span>
              </div>
              <div className="bg-purple-50 dark:bg-slate-800 p-1.5 md:p-2 rounded border border-purple-200 dark:border-slate-600 text-center">
                <span className="text-[10px] md:text-xs text-gray-600 dark:text-gray-400 block">Color</span>
                <span className="text-xs md:text-sm text-gray-900 dark:text-white font-semibold capitalize">{formData.textColor}</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t dark:border-gray-700 mt-4">
            <CustomButton
              type="button"
              onClick={closeModal}
              variant="gray"
              disabled={submitting}
            >
              <FaTimes className="mr-2" />
              Cancel
            </CustomButton>
            <CustomButton
              onClick={handleSubmit}
              variant="rippleBlueToTeal"
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <RahalatekLoader size="sm" className="mr-2" />
                  Saving...
                </>
              ) : (
                <>
                  <FaSave className="mr-2" />
                  {editingHero ? 'Update Hero' : 'Create Hero'}
                </>
              )}
            </CustomButton>
            </div>
          </div>
      </CustomModal>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        show={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setHeroToDelete(null);
        }}
        onConfirm={handleDelete}
        itemType="About Hero"
        itemName={heroToDelete?.title || ''}
        isLoading={deleting}
      />
    </div>
  );
};

export default AboutHeroManagement;

