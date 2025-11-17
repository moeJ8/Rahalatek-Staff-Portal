import React, { useState, useEffect } from "react";
import { Card, Table, Modal, Alert, Spinner, Label } from "flowbite-react";
import CustomModal from "../CustomModal";
import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaEye,
  FaEyeSlash,
  FaArrowUp,
  FaArrowDown,
  FaSave,
  FaTimes,
  FaImages,
  FaPalette,
  FaCog,
  FaInfoCircle,
  FaChevronLeft,
  FaChevronRight,
} from "react-icons/fa";
import { HiChevronDown, HiChevronUp } from "react-icons/hi";
import CustomButton from "../CustomButton";
import TextInput from "../TextInput";
import CustomSelect from "../Select";
import CustomCheckbox from "../CustomCheckbox";
import RahalatekLoader from "../RahalatekLoader";
import DeleteConfirmationModal from "../DeleteConfirmationModal";
import ImageUploader from "../ImageUploader";
import CustomTable from "../CustomTable";
import AboutHeroManagement from "./AboutHeroManagement";
import YoutubeShortsManagement from "./YoutubeShortsManagement";
import ReviewsManagement from "./ReviewsManagement";
import toast from "react-hot-toast";
import { FaYoutube, FaStar } from "react-icons/fa";

// Carousel Management Component
const CarouselManagement = () => {
  const [slides, setSlides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [editingSlide, setEditingSlide] = useState(null);
  const [slideToDelete, setSlideToDelete] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    subtitle: "",
    description: "",
    images: [],
    button: {
      text: "",
      link: "",
      variant: "blueToTeal",
      openInNewTab: false,
    },
    textPosition: "center",
    textColor: "light",
    isActive: true,
    order: 0,
    translations: {
      title: { ar: "", fr: "" },
      subtitle: { ar: "", fr: "" },
      description: { ar: "", fr: "" },
      buttonText: { ar: "", fr: "" },
      textPosition: { ar: "", fr: "" },
    },
  });

  // Translation collapse state
  const [translationCollapse, setTranslationCollapse] = useState({
    title: false,
    subtitle: false,
    description: false,
    buttonText: false,
  });

  // Preview language state
  const [previewLang, setPreviewLang] = useState("en");

  // Text position editing language state
  const [textPosLang, setTextPosLang] = useState("en");

  // Button variant options
  const buttonVariants = [
    { value: "blueToTeal", label: "Blue to Teal Gradient" },
    { value: "greenToBlue", label: "Green to Blue Gradient" },
    { value: "purpleToPink", label: "Purple to Pink Gradient" },
    { value: "pinkToOrange", label: "Pink to Orange Gradient" },
    { value: "rippleWhiteToTeal", label: "Ripple: White to Teal" },
    { value: "rippleBlackToBlue", label: "Ripple: Black to Blue" },
    { value: "rippleGrayToGreen", label: "Ripple: Gray to Green" },
    { value: "rippleGrayToBlue", label: "Ripple: Gray to Blue" },
    { value: "rippleTealToBlue", label: "Ripple: Teal to Blue" },
    { value: "ripplePurpleToRed", label: "Ripple: Purple to Red" },
    { value: "rippleBlueToTeal", label: "Ripple: Blue to Teal" },
    { value: "rippleBlueToYellowTeal", label: "Ripple: Blue to Yellow" },
  ];

  // Fetch slides
  const fetchSlides = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const response = await fetch("/api/carousel", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch carousel slides");
      }

      const data = await response.json();
      setSlides(data);
      setError("");
    } catch (err) {
      console.error("Error fetching slides:", err);
      setError("Failed to load carousel slides");
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
      title: "",
      subtitle: "",
      description: "",
      images: [],
      button: {
        text: "",
        link: "",
        variant: "blueToTeal",
        openInNewTab: false,
      },
      textPosition: "center",
      textColor: "light",
      isActive: true,
      order: 0,
      translations: {
        title: { ar: "", fr: "" },
        subtitle: { ar: "", fr: "" },
        description: { ar: "", fr: "" },
        buttonText: { ar: "", fr: "" },
        textPosition: { ar: "", fr: "" },
      },
    });
    setEditingSlide(null);
    setTranslationCollapse({
      title: false,
      subtitle: false,
      description: false,
      buttonText: false,
    });
  };

  // Open modal for creating/editing
  const openModal = (slide = null) => {
    if (slide) {
      setEditingSlide(slide);
      setFormData({
        title: slide.title,
        subtitle: slide.subtitle || "",
        description: slide.description || "",
        images: slide.image ? [slide.image] : [],
        button: slide.button || {
          text: "",
          link: "",
          variant: "blueToTeal",
          openInNewTab: false,
        },
        textPosition: slide.textPosition,
        textColor: slide.textColor,
        isActive: slide.isActive,
        order: slide.order,
        translations: slide.translations || {
          title: { ar: "", fr: "" },
          subtitle: { ar: "", fr: "" },
          description: { ar: "", fr: "" },
          buttonText: { ar: "", fr: "" },
          textPosition: { ar: "", fr: "" },
        },
      });
    } else {
      resetForm();
      setFormData((prev) => ({ ...prev, order: slides.length }));
    }
    setModalOpen(true);
  };

  // Close modal
  const closeModal = () => {
    setModalOpen(false);
    resetForm();
    setPreviewLang("en"); // Reset preview language
  };

  // Get translated text for preview
  const getPreviewText = (field) => {
    // For button text, we need to access it from button object
    if (field === "buttonText") {
      if (previewLang === "en") {
        return formData.button.text || "";
      }

      const translation = formData.translations?.buttonText?.[previewLang];
      if (translation && translation.trim() !== "") {
        return translation;
      }

      return formData.button.text || ""; // Fallback to English
    }

    // For other fields
    if (previewLang === "en") {
      return formData[field] || "";
    }

    // Check if translation exists and is not empty
    const translation = formData.translations?.[field]?.[previewLang];
    if (translation && translation.trim() !== "") {
      return translation;
    }

    // Fallback to English
    return formData[field] || "";
  };

  // Get text position for preview (language-specific)
  const getPreviewTextPosition = () => {
    if (previewLang === "en") {
      return formData.textPosition;
    }

    const translation = formData.translations?.textPosition?.[previewLang];
    if (translation && translation.trim() !== "") {
      return translation;
    }

    return formData.textPosition; // Fallback to English position
  };

  // Language options for preview
  const previewLanguages = [
    { code: "en", name: "English", flag: "🇬🇧" },
    { code: "ar", name: "العربية", flag: "🇸🇦" },
    { code: "fr", name: "Français", flag: "🇫🇷" },
  ];

  // Get next language for preview
  const nextPreviewLang = () => {
    const currentIndex = previewLanguages.findIndex(
      (lang) => lang.code === previewLang
    );
    const nextIndex = (currentIndex + 1) % previewLanguages.length;
    setPreviewLang(previewLanguages[nextIndex].code);
  };

  // Get previous language for preview
  const prevPreviewLang = () => {
    const currentIndex = previewLanguages.findIndex(
      (lang) => lang.code === previewLang
    );
    const prevIndex =
      (currentIndex - 1 + previewLanguages.length) % previewLanguages.length;
    setPreviewLang(previewLanguages[prevIndex].code);
  };

  // Get current language info
  const currentLangInfo = previewLanguages.find(
    (lang) => lang.code === previewLang
  );

  // Get text position language info
  const textPosLangInfo = previewLanguages.find(
    (lang) => lang.code === textPosLang
  );

  // Navigate text position language
  const nextTextPosLang = () => {
    const currentIndex = previewLanguages.findIndex(
      (lang) => lang.code === textPosLang
    );
    const nextIndex = (currentIndex + 1) % previewLanguages.length;
    setTextPosLang(previewLanguages[nextIndex].code);
  };

  const prevTextPosLang = () => {
    const currentIndex = previewLanguages.findIndex(
      (lang) => lang.code === textPosLang
    );
    const prevIndex =
      (currentIndex - 1 + previewLanguages.length) % previewLanguages.length;
    setTextPosLang(previewLanguages[prevIndex].code);
  };

  // Get current text position value for the editing language
  const getCurrentTextPosition = () => {
    if (textPosLang === "en") {
      return formData.textPosition;
    }

    const translation = formData.translations?.textPosition?.[textPosLang];
    if (translation && translation.trim() !== "") {
      return translation;
    }

    return ""; // Empty for non-English if not set (shows it will use English)
  };

  // Set text position for current editing language
  const setCurrentTextPosition = (value) => {
    if (textPosLang === "en") {
      setFormData((prev) => ({ ...prev, textPosition: value }));
    } else {
      setFormData((prev) => ({
        ...prev,
        translations: {
          ...prev.translations,
          textPosition: {
            ...prev.translations.textPosition,
            [textPosLang]: value,
          },
        },
      }));
    }
  };

  // Toggle translation collapse
  const toggleTranslationCollapse = (section) => {
    setTranslationCollapse((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  // Handle translation change
  const handleTranslationChange = (field, language, value) => {
    setFormData({
      ...formData,
      translations: {
        ...formData.translations,
        [field]: {
          ...formData.translations[field],
          [language]: value,
        },
      },
    });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const token = localStorage.getItem("token");

      // Validate required fields
      if (!formData.title.trim()) {
        throw new Error("Title is required");
      }

      if (formData.images.length === 0) {
        throw new Error("At least one image is required");
      }

      if (!formData.button.text.trim()) {
        throw new Error("Button text is required");
      }

      if (!formData.button.link.trim()) {
        throw new Error("Button link is required");
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
        order: formData.order,
        translations: formData.translations,
      };

      const url = editingSlide
        ? `/api/carousel/${editingSlide._id}`
        : "/api/carousel";

      const method = editingSlide ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(submitData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to save slide");
      }

      toast.success(
        editingSlide
          ? "Carousel slide updated successfully!"
          : "Carousel slide created successfully!",
        {
          duration: 3000,
          style: {
            background: "#4CAF50",
            color: "#fff",
            fontWeight: "bold",
          },
        }
      );

      closeModal();
      fetchSlides();
    } catch (err) {
      console.error("Error saving slide:", err);
      toast.error(err.message || "Failed to save carousel slide", {
        duration: 4000,
        style: {
          background: "#f44336",
          color: "#fff",
          fontWeight: "bold",
        },
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
      const token = localStorage.getItem("token");
      const response = await fetch(`/api/carousel/${slideToDelete._id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to delete slide");
      }

      toast.success("Carousel slide deleted successfully!", {
        duration: 3000,
        style: {
          background: "#4CAF50",
          color: "#fff",
          fontWeight: "bold",
        },
      });

      setDeleteModalOpen(false);
      setSlideToDelete(null);
      fetchSlides();
    } catch (err) {
      console.error("Error deleting slide:", err);
      toast.error("Failed to delete carousel slide", {
        duration: 4000,
        style: {
          background: "#f44336",
          color: "#fff",
          fontWeight: "bold",
        },
      });
    } finally {
      setDeleting(false);
    }
  };

  // Toggle slide status
  const toggleSlideStatus = async (slide) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`/api/carousel/${slide._id}/status`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ isActive: !slide.isActive }),
      });

      if (!response.ok) {
        throw new Error("Failed to update slide status");
      }

      toast.success(
        `Slide ${!slide.isActive ? "activated" : "deactivated"} successfully!`,
        {
          duration: 3000,
          style: {
            background: "#4CAF50",
            color: "#fff",
            fontWeight: "bold",
          },
        }
      );

      fetchSlides();
    } catch (err) {
      console.error("Error updating slide status:", err);
      toast.error("Failed to update slide status", {
        duration: 4000,
        style: {
          background: "#f44336",
          color: "#fff",
          fontWeight: "bold",
        },
      });
    }
  };

  // Handle images uploaded
  const handleImagesUploaded = (uploadedImages) => {
    setFormData((prev) => ({
      ...prev,
      images: uploadedImages,
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
        <div>{/* Header text removed as requested */}</div>
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

      {slides.length === 0 ? (
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm p-12 text-center">
          <FaImages className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <p className="text-gray-500 dark:text-gray-400">
            No carousel slides found. Create your first slide to get started.
          </p>
        </div>
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="hidden lg:block">
            <CustomTable
              headers={[
                "Preview",
                "Content",
                "Button",
                "Status",
                "Order",
                "Created",
                "Actions",
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
                          ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                          : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
                      }`}
                    >
                      {slide.isActive ? (
                        <FaEye className="w-3 h-3 mr-1" />
                      ) : (
                        <FaEyeSlash className="w-3 h-3 mr-1" />
                      )}
                      {slide.isActive ? "Active" : "Inactive"}
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
          </div>

          {/* Mobile/Tablet Cards View */}
          <div className="lg:hidden grid grid-cols-1 md:grid-cols-2 gap-4">
            {slides.map((slide, index) => (
              <div
                key={slide._id}
                className="bg-white dark:bg-slate-900 rounded-lg p-4 border border-gray-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-all duration-300"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="space-y-3">
                  {/* Image and Title */}
                  <div className="flex gap-3">
                    <img
                      src={slide.image.url}
                      alt={slide.title}
                      className="w-24 h-16 object-cover rounded flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-900 dark:text-white text-sm truncate">
                        {slide.title}
                      </h3>
                      {slide.subtitle && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                          {slide.subtitle}
                        </p>
                      )}
                      <div className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                        Text: {slide.textPosition} / {slide.textColor}
                      </div>
                    </div>
                  </div>

                  {/* Button Info and Badges */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => toggleSlideStatus(slide)}
                          className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full transition-colors ${
                            slide.isActive
                              ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                              : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
                          }`}
                        >
                          {slide.isActive ? (
                            <FaEye className="w-3 h-3" />
                          ) : (
                            <FaEyeSlash className="w-3 h-3" />
                          )}
                          {slide.isActive ? "Active" : "Inactive"}
                        </button>
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300">
                          Order: {slide.order}
                        </span>
                      </div>
                    </div>

                    <div className="text-xs text-gray-600 dark:text-gray-400">
                      <span className="font-medium">Button:</span>{" "}
                      {slide.button?.text}
                    </div>
                  </div>

                  {/* Meta Info */}
                  <div className="text-xs text-gray-500 dark:text-gray-400 pb-2 border-b border-gray-200 dark:border-slate-700">
                    Created {new Date(slide.createdAt).toLocaleDateString()} by{" "}
                    {slide.createdBy?.username}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <CustomButton
                      onClick={() => openModal(slide)}
                      variant="purple"
                      size="sm"
                      className="flex-1"
                    >
                      <FaEdit className="mr-1" />
                      Edit
                    </CustomButton>
                    <CustomButton
                      onClick={() => {
                        setSlideToDelete(slide);
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
        title={editingSlide ? "Edit Carousel Slide" : "Create Carousel Slide"}
        subtitle="Configure the carousel slide content and display settings"
        maxWidth="md:max-w-5xl"
        className="carousel-slide-modal"
      >
        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Content Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <Label htmlFor="slideTitle" value="Title *" />
                  <button
                    type="button"
                    onClick={() => toggleTranslationCollapse("title")}
                    className="text-sm text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                  >
                    Translations
                    {translationCollapse.title ? (
                      <HiChevronUp />
                    ) : (
                      <HiChevronDown />
                    )}
                  </button>
                </div>
                <TextInput
                  id="slideTitle"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, title: e.target.value }))
                  }
                  placeholder="Enter slide title"
                  required
                />
                {translationCollapse.title && (
                  <div className="mt-2 space-y-2 p-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-slate-900">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      Note: The field above is in English. Add translations
                      below. Leave empty to use English as fallback.
                    </p>
                    <TextInput
                      label="Arabic Translation (Optional)"
                      placeholder="Leave empty to use English"
                      value={formData.translations.title.ar}
                      onChange={(e) =>
                        handleTranslationChange("title", "ar", e.target.value)
                      }
                    />
                    <TextInput
                      label="French Translation (Optional)"
                      placeholder="Leave empty to use English"
                      value={formData.translations.title.fr}
                      onChange={(e) =>
                        handleTranslationChange("title", "fr", e.target.value)
                      }
                    />
                  </div>
                )}
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between">
                  <Label htmlFor="slideSubtitle" value="Subtitle" />
                  <button
                    type="button"
                    onClick={() => toggleTranslationCollapse("subtitle")}
                    className="text-sm text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                  >
                    Translations
                    {translationCollapse.subtitle ? (
                      <HiChevronUp />
                    ) : (
                      <HiChevronDown />
                    )}
                  </button>
                </div>
                <TextInput
                  id="slideSubtitle"
                  value={formData.subtitle}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      subtitle: e.target.value,
                    }))
                  }
                  placeholder="Enter slide subtitle (optional)"
                />
                {translationCollapse.subtitle && (
                  <div className="mt-2 space-y-2 p-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-slate-900">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      Note: The field above is in English. Add translations
                      below. Leave empty to use English as fallback.
                    </p>
                    <TextInput
                      label="Arabic Translation (Optional)"
                      placeholder="Leave empty to use English"
                      value={formData.translations.subtitle.ar}
                      onChange={(e) =>
                        handleTranslationChange(
                          "subtitle",
                          "ar",
                          e.target.value
                        )
                      }
                    />
                    <TextInput
                      label="French Translation (Optional)"
                      placeholder="Leave empty to use English"
                      value={formData.translations.subtitle.fr}
                      onChange={(e) =>
                        handleTranslationChange(
                          "subtitle",
                          "fr",
                          e.target.value
                        )
                      }
                    />
                  </div>
                )}
              </div>
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between">
                <Label htmlFor="slideDescription" value="Description" />
                <button
                  type="button"
                  onClick={() => toggleTranslationCollapse("description")}
                  className="text-sm text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                >
                  Translations
                  {translationCollapse.description ? (
                    <HiChevronUp />
                  ) : (
                    <HiChevronDown />
                  )}
                </button>
              </div>
              <TextInput
                id="slideDescription"
                value={formData.description}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                placeholder="Enter slide description (optional)"
                maxLength={500}
                as="textarea"
                rows={3}
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {formData.description.length}/500 characters
              </p>
              {translationCollapse.description && (
                <div className="mt-2 space-y-2 p-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-slate-900">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    Note: The field above is in English. Add translations below.
                    Leave empty to use English as fallback.
                  </p>
                  <TextInput
                    as="textarea"
                    rows={3}
                    label="Arabic Translation (Optional)"
                    placeholder="Leave empty to use English"
                    value={formData.translations.description.ar}
                    onChange={(e) =>
                      handleTranslationChange(
                        "description",
                        "ar",
                        e.target.value
                      )
                    }
                    maxLength={500}
                  />
                  <TextInput
                    as="textarea"
                    rows={3}
                    label="French Translation (Optional)"
                    placeholder="Leave empty to use English"
                    value={formData.translations.description.fr}
                    onChange={(e) =>
                      handleTranslationChange(
                        "description",
                        "fr",
                        e.target.value
                      )
                    }
                    maxLength={500}
                  />
                </div>
              )}
            </div>

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
              <h4 className="font-medium text-gray-900 dark:text-white mb-4">
                Button Configuration
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <Label htmlFor="buttonText" value="Button Text *" />
                    <button
                      type="button"
                      onClick={() => toggleTranslationCollapse("buttonText")}
                      className="text-sm text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                    >
                      Translations
                      {translationCollapse.buttonText ? (
                        <HiChevronUp />
                      ) : (
                        <HiChevronDown />
                      )}
                    </button>
                  </div>
                  <TextInput
                    id="buttonText"
                    value={formData.button.text}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        button: { ...prev.button, text: e.target.value },
                      }))
                    }
                    placeholder="Enter button text"
                    required
                  />
                  {translationCollapse.buttonText && (
                    <div className="mt-2 space-y-2 p-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-slate-900">
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        Note: The field above is in English. Add translations
                        below. Leave empty to use English as fallback.
                      </p>
                      <TextInput
                        label="Arabic Translation (Optional)"
                        placeholder="Leave empty to use English"
                        value={formData.translations.buttonText.ar}
                        onChange={(e) =>
                          handleTranslationChange(
                            "buttonText",
                            "ar",
                            e.target.value
                          )
                        }
                      />
                      <TextInput
                        label="French Translation (Optional)"
                        placeholder="Leave empty to use English"
                        value={formData.translations.buttonText.fr}
                        onChange={(e) =>
                          handleTranslationChange(
                            "buttonText",
                            "fr",
                            e.target.value
                          )
                        }
                      />
                    </div>
                  )}
                </div>

                <TextInput
                  label="Button Link *"
                  value={formData.button.link}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      button: { ...prev.button, link: e.target.value },
                    }))
                  }
                  placeholder="https://example.com or /page"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <CustomSelect
                  label="Button Variant"
                  value={formData.button.variant}
                  onChange={(value) =>
                    setFormData((prev) => ({
                      ...prev,
                      button: { ...prev.button, variant: value },
                    }))
                  }
                  options={buttonVariants}
                />

                <div className="flex items-end">
                  <CustomCheckbox
                    id="open-new-tab"
                    label="Open link in new tab"
                    checked={formData.button.openInNewTab}
                    onChange={(checked) =>
                      setFormData((prev) => ({
                        ...prev,
                        button: { ...prev.button, openInNewTab: checked },
                      }))
                    }
                  />
                </div>
              </div>
            </div>

            {/* Display Settings Header with Language Selector */}
            <div className="flex items-center justify-end mb-2">
              {/* Language Navigation for Text Position */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={prevTextPosLang}
                  className="p-1.5 md:p-2 rounded-lg bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-700 dark:text-gray-300 transition-colors"
                  title="Previous language"
                >
                  <FaChevronLeft className="w-3 h-3 md:w-4 md:h-4" />
                </button>

                <div className="px-3 md:px-4 py-1.5 md:py-2 bg-blue-50 dark:bg-slate-800 rounded-lg border border-blue-200 dark:border-slate-600">
                  <span className="text-xs md:text-sm font-medium text-gray-900 dark:text-white">
                    {textPosLangInfo?.name}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={nextTextPosLang}
                  className="p-1.5 md:p-2 rounded-lg bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-700 dark:text-gray-300 transition-colors"
                  title="Next language"
                >
                  <FaChevronRight className="w-3 h-3 md:w-4 md:h-4" />
                </button>
              </div>
            </div>

            {/* Display Settings */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Text Position */}
              <div>
                <CustomSelect
                  label="Text Position"
                  value={getCurrentTextPosition()}
                  onChange={(value) => setCurrentTextPosition(value)}
                  options={[
                    { value: "left", label: "Left" },
                    { value: "center", label: "Center" },
                    { value: "right", label: "Right" },
                  ]}
                />

                {/* Show fallback info for non-English */}
                {textPosLang !== "en" && !getCurrentTextPosition() && (
                  <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-1">
                    Using English position: {formData.textPosition}
                  </p>
                )}
              </div>

              <CustomSelect
                label="Text Color"
                value={formData.textColor}
                onChange={(value) =>
                  setFormData((prev) => ({ ...prev, textColor: value }))
                }
                options={[
                  { value: "light", label: "Light" },
                  { value: "dark", label: "Dark" },
                ]}
              />

              <TextInput
                label="Order"
                type="number"
                value={formData.order}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    order: parseInt(e.target.value) || 0,
                  }))
                }
                min="0"
              />
            </div>

            {/* Status */}
            <div>
              <CustomCheckbox
                id="is-active"
                label="Active (visible on homepage)"
                checked={formData.isActive}
                onChange={(checked) =>
                  setFormData((prev) => ({ ...prev, isActive: checked }))
                }
              />
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

              {/* Language Navigation */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={prevPreviewLang}
                  className="p-1.5 md:p-2 rounded-lg bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-700 dark:text-gray-300 transition-all hover:scale-105"
                  title="Previous language"
                >
                  <FaChevronLeft className="w-3 h-3 md:w-4 md:h-4" />
                </button>

                <div className="px-3 md:px-4 py-1.5 md:py-2 bg-blue-50 dark:bg-slate-800 rounded-lg border border-blue-200 dark:border-slate-600">
                  <span className="text-xs md:text-sm font-medium text-gray-900 dark:text-white">
                    {currentLangInfo?.name}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={nextPreviewLang}
                  className="p-1.5 md:p-2 rounded-lg bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-700 dark:text-gray-300 transition-all hover:scale-105"
                  title="Next language"
                >
                  <FaChevronRight className="w-3 h-3 md:w-4 md:h-4" />
                </button>
              </div>
            </div>

            {/* Fallback info */}
            {previewLang !== "en" && (
              <div className="flex items-center gap-2 px-3 py-2 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800/50 rounded-lg">
                <FaInfoCircle className="w-3 h-3 text-yellow-600 dark:text-yellow-400 flex-shrink-0" />
                <p className="text-xs text-yellow-700 dark:text-yellow-300">
                  Empty translations will automatically fall back to English
                  content
                </p>
              </div>
            )}

            {/* Container with scale transform for true miniature preview */}
            <div className="relative w-full aspect-[4/3] sm:aspect-[16/9] md:aspect-[21/9] overflow-hidden rounded md:rounded-lg border border-blue-200 dark:border-teal-600 md:border-2 shadow md:shadow-lg bg-gray-900">
              <div
                className="absolute inset-0"
                style={{
                  transform: "scale(0.65)",
                  transformOrigin: "center center",
                  width: "154%",
                  height: "154%",
                  left: "-27%",
                  top: "-27%",
                }}
              >
                {/* Background Image */}
                {formData.images.length > 0 ? (
                  <img
                    src={formData.images[0].url}
                    alt={formData.title || "Preview"}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-gray-300 to-gray-400 dark:from-gray-700 dark:to-gray-800 flex items-center justify-center">
                    <div className="text-center text-gray-600 dark:text-gray-400">
                      <FaImages className="w-32 h-32 mx-auto mb-4 opacity-50" />
                      <p className="text-2xl font-medium">
                        Upload an image to see preview
                      </p>
                    </div>
                  </div>
                )}

                {/* Overlay */}
                <div className="absolute inset-0 bg-black/40"></div>

                {/* Content - Exact match to HeroCarousel */}
                <div
                  className={`absolute inset-0 flex items-center ${
                    getPreviewTextPosition() === "left"
                      ? "justify-start"
                      : getPreviewTextPosition() === "right"
                      ? "justify-end"
                      : "justify-center"
                  } p-4 sm:p-6 md:p-10 lg:p-20`}
                >
                  <div
                    className={`max-w-4xl ${
                      formData.textColor === "dark"
                        ? "text-gray-900"
                        : "text-white"
                    } z-10 ${
                      getPreviewTextPosition() === "left"
                        ? "text-left"
                        : getPreviewTextPosition() === "right"
                        ? "text-right"
                        : "text-center"
                    }`}
                  >
                    {/* Title - Slightly smaller on mobile */}
                    <h1 className="text-xl sm:text-3xl md:text-4xl lg:text-6xl xl:text-7xl font-bold mb-2 sm:mb-3 md:mb-4 lg:mb-6 leading-tight">
                      {getPreviewText("title") || "Your Slide Title"}
                    </h1>

                    {/* Subtitle - Slightly smaller on mobile */}
                    {(getPreviewText("subtitle") || !formData.title) && (
                      <h2 className="text-sm sm:text-lg md:text-xl lg:text-3xl font-medium mb-3 sm:mb-4 md:mb-6 lg:mb-8 opacity-90">
                        {getPreviewText("subtitle") ||
                          "Your slide subtitle here"}
                      </h2>
                    )}

                    {/* Description - Slightly smaller on mobile */}
                    {(getPreviewText("description") || !formData.title) && (
                      <p
                        className={`text-xs sm:text-base md:text-lg lg:text-xl mb-4 sm:mb-6 md:mb-8 lg:mb-10 opacity-80 leading-relaxed ${
                          getPreviewTextPosition() === "center"
                            ? "mx-auto max-w-2xl"
                            : getPreviewTextPosition() === "right"
                            ? "ml-auto max-w-2xl"
                            : "max-w-2xl"
                        }`}
                      >
                        {getPreviewText("description") ||
                          "Your slide description will appear here. This is a preview of how your content will look on the homepage carousel."}
                      </p>
                    )}

                    {/* Button Preview - Exact match */}
                    {(formData.button.text || !formData.title) && (
                      <div
                        className={`flex ${
                          getPreviewTextPosition() === "left"
                            ? "justify-start"
                            : getPreviewTextPosition() === "right"
                            ? "justify-end"
                            : "justify-center"
                        }`}
                      >
                        <CustomButton
                          variant={formData.button.variant || "blueToTeal"}
                          size="lg"
                          className="pointer-events-none shadow-2xl px-4 py-2 sm:px-6 sm:py-2.5 md:px-8 md:py-3 text-sm sm:text-base"
                        >
                          {getPreviewText("buttonText") || "Button Text"}
                        </CustomButton>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Preview Info */}
            <div className="grid grid-cols-2 gap-1.5 md:gap-2">
              <div className="bg-blue-50 dark:bg-slate-800 p-1.5 md:p-2 rounded border border-blue-200 dark:border-slate-600 text-center">
                <span className="text-[10px] md:text-xs text-gray-600 dark:text-gray-400 block">
                  Position ({currentLangInfo?.name})
                </span>
                <span className="text-xs md:text-sm text-gray-900 dark:text-white font-semibold capitalize">
                  {getPreviewTextPosition()}
                </span>
              </div>
              <div className="bg-purple-50 dark:bg-slate-800 p-1.5 md:p-2 rounded border border-purple-200 dark:border-slate-600 text-center">
                <span className="text-[10px] md:text-xs text-gray-600 dark:text-gray-400 block">
                  Color
                </span>
                <span className="text-xs md:text-sm text-gray-900 dark:text-white font-semibold capitalize">
                  {formData.textColor}
                </span>
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
              loading={submitting}
            >
              {!submitting && <FaSave className="mr-2" />}
              {editingSlide ? "Update Slide" : "Create Slide"}
            </CustomButton>
          </div>
        </div>
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
        itemName={slideToDelete?.title || "this slide"}
      />
    </div>
  );
};

// Main UI Management Component with Tabs
export default function UIManagement() {
  const [activeTab, setActiveTab] = useState("carousel");

  // Get user information
  const authUser = JSON.parse(localStorage.getItem("user") || "{}");
  const _isPublisher = authUser.isPublisher || false;

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

      {/* Custom Tabs Navigation */}
      <div className="flex justify-center mb-6">
        <div className="flex border-b border-gray-200 dark:border-slate-700 bg-gray-50/80 dark:bg-slate-800/60 backdrop-blur-sm rounded-t-lg overflow-hidden shadow-sm w-full sm:w-auto">
          <div className="flex gap-0 w-full">
            <button
              onClick={() => setActiveTab("carousel")}
              className={`flex-1 px-2 sm:px-4 md:px-6 py-2 sm:py-3 text-xs sm:text-sm font-medium transition-colors duration-200 flex items-center justify-center gap-1 sm:gap-2 ${
                activeTab === "carousel"
                  ? "bg-white/90 dark:bg-slate-900/80 backdrop-blur-md text-blue-600 dark:text-teal-400 border-b-2 border-blue-500 dark:border-teal-500 shadow-sm"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-100/70 dark:hover:bg-slate-700/50 hover:backdrop-blur-sm"
              }`}
            >
              <FaImages className="w-3 h-3 sm:w-4 sm:h-4" />
              <span>Carousel</span>
            </button>
            <button
              onClick={() => setActiveTab("about")}
              className={`flex-1 px-2 sm:px-4 md:px-6 py-2 sm:py-3 text-xs sm:text-sm font-medium transition-colors duration-200 flex items-center justify-center gap-1 sm:gap-2 ${
                activeTab === "about"
                  ? "bg-white/90 dark:bg-slate-900/80 backdrop-blur-md text-blue-600 dark:text-teal-400 border-b-2 border-blue-500 dark:border-teal-500 shadow-sm"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-100/70 dark:hover:bg-slate-700/50 hover:backdrop-blur-sm"
              }`}
            >
              <FaInfoCircle className="w-3 h-3 sm:w-4 sm:h-4" />
              <span>About</span>
            </button>
            <button
              onClick={() => setActiveTab("youtube")}
              className={`flex-1 px-2 sm:px-4 md:px-6 py-2 sm:py-3 text-xs sm:text-sm font-medium transition-colors duration-200 flex items-center justify-center gap-1 sm:gap-2 ${
                activeTab === "youtube"
                  ? "bg-white/90 dark:bg-slate-900/80 backdrop-blur-md text-blue-600 dark:text-teal-400 border-b-2 border-blue-500 dark:border-teal-500 shadow-sm"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-100/70 dark:hover:bg-slate-700/50 hover:backdrop-blur-sm"
              }`}
            >
              <FaYoutube className="w-3 h-3 sm:w-4 sm:h-4" />
              <span>Shorts</span>
            </button>
            <button
              onClick={() => setActiveTab("reviews")}
              className={`flex-1 px-2 sm:px-4 md:px-6 py-2 sm:py-3 text-xs sm:text-sm font-medium transition-colors duration-200 flex items-center justify-center gap-1 sm:gap-2 ${
                activeTab === "reviews"
                  ? "bg-white/90 dark:bg-slate-900/80 backdrop-blur-md text-blue-600 dark:text-teal-400 border-b-2 border-blue-500 dark:border-teal-500 shadow-sm"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-100/70 dark:hover:bg-slate-700/50 hover:backdrop-blur-sm"
              }`}
            >
              <FaStar className="w-3 h-3 sm:w-4 sm:h-4" />
              <span>Reviews</span>
            </button>
          </div>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === "carousel" && (
        <div>
          <CarouselManagement />
        </div>
      )}

      {activeTab === "about" && (
        <div>
          <AboutHeroManagement />
        </div>
      )}

      {activeTab === "youtube" && (
        <div>
          <YoutubeShortsManagement />
        </div>
      )}

      {activeTab === "reviews" && (
        <div>
          <ReviewsManagement />
        </div>
      )}
    </div>
  );
}
