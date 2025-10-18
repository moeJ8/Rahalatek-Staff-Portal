import React, { useState, useEffect } from 'react';
import { Table } from 'flowbite-react';
import { FaPlus, FaEdit, FaTrash, FaEye, FaEyeSlash, FaSave, FaTimes, FaYoutube } from 'react-icons/fa';
import CustomButton from '../CustomButton';
import TextInput from '../TextInput';
import CustomCheckbox from '../CustomCheckbox';
import RahalatekLoader from '../RahalatekLoader';
import DeleteConfirmationModal from '../DeleteConfirmationModal';
import CustomTable from '../CustomTable';
import CustomModal from '../CustomModal';
import toast from 'react-hot-toast';

const YoutubeShortsManagement = () => {
  const [shorts, setShorts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [editingShort, setEditingShort] = useState(null);
  const [shortToDelete, setShortToDelete] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    youtubeUrl: '',
    order: 0,
    isActive: true
  });

  // Fetch shorts
  const fetchShorts = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch('/api/youtube-shorts', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch YouTube Shorts');
      }

      const data = await response.json();
      setShorts(data);
      setError('');
    } catch (err) {
      console.error('Error fetching shorts:', err);
      setError('Failed to load YouTube Shorts');
      setShorts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShorts();
  }, []);

  // Reset form
  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      youtubeUrl: '',
      order: 0,
      isActive: true
    });
    setEditingShort(null);
  };

  // Open modal for creating/editing
  const openModal = (short = null) => {
    if (short) {
      setEditingShort(short);
      setFormData({
        title: short.title,
        description: short.description || '',
        youtubeUrl: short.youtubeUrl,
        order: short.order,
        isActive: short.isActive
      });
    } else {
      resetForm();
      // Find the highest order number and add 1
      const maxOrder = shorts.length > 0 ? Math.max(...shorts.map(short => short.order)) : 0;
      setFormData(prev => ({ ...prev, order: maxOrder + 1 }));
    }
    setModalOpen(true);
  };

  // Close modal
  const closeModal = () => {
    setModalOpen(false);
    resetForm();
  };

  // Extract video ID for preview
  const extractVideoId = (url) => {
    if (!url) return '';
    const shortsMatch = url.match(/youtube\.com\/shorts\/([a-zA-Z0-9_-]+)/);
    const shortMatch = url.match(/youtu\.be\/([a-zA-Z0-9_-]+)/);
    const standardMatch = url.match(/youtube\.com\/watch\?v=([a-zA-Z0-9_-]+)/);
    
    if (shortsMatch) return shortsMatch[1];
    if (shortMatch) return shortMatch[1];
    if (standardMatch) return standardMatch[1];
    return '';
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      // Validation
      if (!formData.title.trim()) {
        toast.error('Title is required', {
          duration: 4000,
          style: {
            background: '#f44336',
            color: '#fff',
            fontWeight: '500'
          }
        });
        setSubmitting(false);
        return;
      }

      if (!formData.youtubeUrl.trim()) {
        toast.error('YouTube URL is required', {
          duration: 4000,
          style: {
            background: '#f44336',
            color: '#fff',
            fontWeight: '500'
          }
        });
        setSubmitting(false);
        return;
      }

      // Validate YouTube URL
      const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com\/shorts\/|youtu\.be\/)[a-zA-Z0-9_-]+/;
      if (!youtubeRegex.test(formData.youtubeUrl)) {
        toast.error('Please provide a valid YouTube Shorts URL', {
          duration: 4000,
          style: {
            background: '#f44336',
            color: '#fff',
            fontWeight: '500'
          }
        });
        setSubmitting(false);
        return;
      }

      const token = localStorage.getItem('token');
      const url = editingShort 
        ? `/api/youtube-shorts/${editingShort._id}`
        : '/api/youtube-shorts';
      
      const method = editingShort ? 'PUT' : 'POST';

      const requestBody = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        youtubeUrl: formData.youtubeUrl.trim(),
        order: formData.order,
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
        throw new Error(errorData.message || 'Failed to save YouTube Short');
      }

      await response.json();
      
      toast.success(
        editingShort 
          ? 'YouTube Short updated successfully!' 
          : 'YouTube Short created successfully!',
        {
          duration: 3000,
          style: {
            background: '#4CAF50',
            color: '#fff',
            fontWeight: '500'
          }
        }
      );
      
      // Refresh shorts list
      await fetchShorts();
      
      // Close modal and reset form
      closeModal();
    } catch (err) {
      console.error('Error saving short:', err);
      toast.error(err.message || 'Failed to save YouTube Short', {
        duration: 4000,
        style: {
          background: '#f44336',
          color: '#fff',
          fontWeight: '500'
        }
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Handle delete
  const handleDelete = async () => {
    if (!shortToDelete) return;

    setDeleting(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/youtube-shorts/${shortToDelete._id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete YouTube Short');
      }

      await response.json();
      toast.success('YouTube Short deleted successfully!', {
        duration: 3000,
        style: {
          background: '#4CAF50',
          color: '#fff',
          fontWeight: '500'
        }
      });
      
      // Refresh shorts list
      await fetchShorts();
      
      // Close delete modal
      setDeleteModalOpen(false);
      setShortToDelete(null);
    } catch (err) {
      console.error('Error deleting short:', err);
      toast.error('Failed to delete YouTube Short', {
        duration: 4000,
        style: {
          background: '#f44336',
          color: '#fff',
          fontWeight: '500'
        }
      });
    } finally {
      setDeleting(false);
    }
  };

  // Toggle active status
  const toggleActiveStatus = async (short) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/youtube-shorts/${short._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...short,
          isActive: !short.isActive
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update status');
      }

      await response.json();
      toast.success(
        `Short ${!short.isActive ? 'activated' : 'deactivated'} successfully!`,
        {
          duration: 3000,
          style: {
            background: '#4CAF50',
            color: '#fff',
            fontWeight: '500'
          }
        }
      );
      
      // Refresh shorts list
      await fetchShorts();
    } catch (err) {
      console.error('Error toggling status:', err);
      toast.error('Failed to update short status', {
        duration: 4000,
        style: {
          background: '#f44336',
          color: '#fff',
          fontWeight: '500'
        }
      });
    }
  };

  // Table headers and render function
  const headers = ['Preview', 'Title', 'Description', 'Order', 'Views', 'Status', 'Actions'];

  const renderRow = (short) => (
    <>
      <Table.Cell className="px-4 py-3">
        <img
          src={short.thumbnail}
          alt={short.title}
          className="w-20 h-36 object-cover rounded border"
          onError={(e) => {
            e.target.src = `https://img.youtube.com/vi/${short.videoId}/default.jpg`;
          }}
        />
      </Table.Cell>
      <Table.Cell className="px-4 py-3">
        <div className="font-medium text-gray-900 dark:text-white max-w-xs">
          {short.title}
        </div>
      </Table.Cell>
      <Table.Cell className="px-4 py-3">
        <div className="max-w-md text-gray-600 dark:text-gray-400 text-sm">
          {short.description || '-'}
        </div>
      </Table.Cell>
      <Table.Cell className="px-4 py-3">
        <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
          {short.order}
        </span>
      </Table.Cell>
      <Table.Cell className="px-4 py-3">
        <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
          {short.views}
        </span>
      </Table.Cell>
      <Table.Cell className="px-4 py-3">
        <button
          onClick={() => toggleActiveStatus(short)}
          className={`inline-flex items-center gap-2 px-3 py-1 text-xs font-medium rounded-full transition-colors ${
            short.isActive
              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300 hover:bg-green-200 dark:hover:bg-green-800'
              : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
          }`}
        >
          {short.isActive ? <FaEye /> : <FaEyeSlash />}
          {short.isActive ? 'Active' : 'Inactive'}
        </button>
      </Table.Cell>
      <Table.Cell className="px-4 py-3">
        <div className="flex items-center gap-2">
          <CustomButton
            onClick={() => openModal(short)}
            variant="purple"
            size="xs"
            icon={FaEdit}
          />
          <CustomButton
            onClick={() => {
              setShortToDelete(short);
              setDeleteModalOpen(true);
            }}
            variant="red"
            size="xs"
            icon={FaTrash}
          />
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
              <span>Add YouTube Short</span>
            </div>
          </CustomButton>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-red-800 dark:text-red-300">{error}</p>
        </div>
      )}

      {/* Shorts Table */}
      {shorts.length === 0 ? (
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm p-12 text-center">
          <FaYoutube className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            No YouTube Shorts added yet. Click "Add YouTube Short" to get started.
          </p>
        </div>
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="hidden lg:block">
            <CustomTable
              data={shorts}
              headers={headers}
              renderRow={renderRow}
              emptyMessage="No YouTube Shorts found"
              emptyIcon={FaYoutube}
            />
          </div>

          {/* Mobile/Tablet Cards View */}
          <div className="lg:hidden grid grid-cols-1 md:grid-cols-2 gap-4">
            {shorts.map((short, index) => (
              <div
                key={short._id}
                className="bg-white dark:bg-slate-900 rounded-lg p-4 border border-gray-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-all duration-300"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="space-y-3">
                  {/* Image and Title */}
                  <div className="flex gap-3">
                    <img
                      src={short.thumbnail}
                      alt={short.title}
                      className="w-24 h-36 object-cover rounded flex-shrink-0"
                      onError={(e) => {
                        e.target.src = `https://img.youtube.com/vi/${short.videoId}/default.jpg`;
                      }}
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-900 dark:text-white text-sm mb-2">
                        {short.title}
                      </h3>
                      {short.description && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-3">
                          {short.description}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Badges */}
                  <div className="flex flex-wrap gap-2">
                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                      Order: {short.order}
                    </span>
                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                      {short.views} views
                    </span>
                    <button
                      onClick={() => toggleActiveStatus(short)}
                      className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full transition-colors ${
                        short.isActive
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                          : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                      }`}
                    >
                      {short.isActive ? <FaEye className="w-3 h-3" /> : <FaEyeSlash className="w-3 h-3" />}
                      {short.isActive ? 'Active' : 'Inactive'}
                    </button>
                  </div>

                  {/* Meta Info */}
                  <div className="text-xs text-gray-500 dark:text-gray-400 pb-2 border-b border-gray-200 dark:border-slate-700">
                    Created by {short.createdBy?.username || 'Unknown'}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <CustomButton
                      onClick={() => openModal(short)}
                      variant="purple"
                      size="sm"
                      className="flex-1"
                    >
                      <FaEdit className="mr-1" />
                      Edit
                    </CustomButton>
                    <CustomButton
                      onClick={() => {
                        setShortToDelete(short);
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
        title={editingShort ? 'Edit YouTube Short' : 'Add YouTube Short'}
        maxWidth="md:max-w-3xl"
      >
        <div className="p-6">
          {/* Form Section */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <TextInput
              label="Title *"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Enter short title"
              required
              maxLength={100}
            />

            {/* YouTube URL */}
            <div>
              <TextInput
                label="YouTube URL *"
                value={formData.youtubeUrl}
                onChange={(e) => setFormData(prev => ({ ...prev, youtubeUrl: e.target.value }))}
                placeholder="https://youtube.com/shorts/..."
                required
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Paste the YouTube Shorts URL (e.g., https://youtube.com/shorts/VIDEO_ID)
              </p>
            </div>

            {/* Preview */}
            {formData.youtubeUrl && extractVideoId(formData.youtubeUrl) && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Preview
                </label>
                <img
                  src={`https://img.youtube.com/vi/${extractVideoId(formData.youtubeUrl)}/maxresdefault.jpg`}
                  alt="Preview"
                  className="w-full max-w-xs h-auto rounded-lg border border-gray-200 dark:border-gray-700"
                  onError={(e) => {
                    e.target.src = `https://img.youtube.com/vi/${extractVideoId(formData.youtubeUrl)}/default.jpg`;
                  }}
                />
              </div>
            )}

            {/* Description */}
            <TextInput
              label="Description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Enter short description (optional)"
              maxLength={300}
              as="textarea"
              rows={3}
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {formData.description.length}/300 characters
            </p>

            {/* Order */}
            <TextInput
              label="Display Order"
              type="number"
              value={formData.order}
              onChange={(e) => setFormData(prev => ({ ...prev, order: parseInt(e.target.value) || 0 }))}
              min="0"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Lower numbers appear first
            </p>

            {/* Active Status */}
            <div>
              <CustomCheckbox
                label="Active (Display on homepage)"
                checked={formData.isActive}
                onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
              />
            </div>
          </form>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t dark:border-gray-700 mt-6">
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
              loading={submitting}
            >
              {!submitting && <FaSave className="mr-2" />}
              {editingShort ? 'Update Short' : 'Add Short'}
            </CustomButton>
          </div>
        </div>
      </CustomModal>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        show={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setShortToDelete(null);
        }}
        onConfirm={handleDelete}
        itemType="YouTube Short"
        itemName={shortToDelete?.title || ''}
        isLoading={deleting}
      />
    </div>
  );
};

export default YoutubeShortsManagement;
