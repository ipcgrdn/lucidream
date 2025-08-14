"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { getUserBackgrounds, UserBackground } from "@/lib/dream_backgrounds";
import {
  createCustomCharacter,
  CustomCharacterFormData,
} from "@/lib/custom_character";
import Image from "next/image";

interface CreateCharacterModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
}

// Default VRM models available
const DEFAULT_VRM_MODELS = [
  {
    id: "reina",
    name: "Reina",
    path: "/models/reina.vrm",
    preview: "/preview/reina.png",
  },
  {
    id: "sia",
    name: "Sia",
    path: "/models/sia.vrm",
    preview: "/preview/sia.png",
  },
  {
    id: "jessica",
    name: "Jessica",
    path: "/models/jessica.vrm",
    preview: "/preview/jessica.png",
  },
  {
    id: "hiyori",
    name: "Hiyori",
    path: "/models/hiyori.vrm",
    preview: "/preview/hiyori.png",
  },
  // {
  //   id: "ren",
  //   name: "Ren",
  //   path: "/models/ren.vrm",
  //   preview: "/preview/ren.png",
  // },
];

// Default background images available
const DEFAULT_BACKGROUNDS = [
  { id: "reina1", name: "Reina 1", path: "/background/reina.png" },
  { id: "reina2", name: "Reina 2", path: "/background/reina2.png" },
  { id: "sia1", name: "Sia 1", path: "/background/sia.png" },
  { id: "sia2", name: "Sia 2", path: "/background/sia2.png" },
  { id: "jessica1", name: "Jessica 1", path: "/background/jessica.png" },
  { id: "jessica2", name: "Jessica 2", path: "/background/jessica2.png" },
  { id: "hiyori1", name: "Hiyori 1", path: "/background/hiyori.png" },
  { id: "hiyori2", name: "Hiyori 2", path: "/background/hiyori2.png" },
  // { id: "ren1", name: "Ren 1", path: "/background/ren.png" },
  // { id: "ren2", name: "Ren 2", path: "/background/ren2.png" },
];

interface CharacterForm {
  name: string;
  description: string;
  personality: string;
  traits: string[];
  systemPrompt: string;
  previewImage: File | null;
  // VRM selection
  selectedDefaultVrm: string | null;
  vrmModel: File | null;
  // Background selection
  selectedDefaultBackground: string | null;
  selectedUserBackground: string | null;
  backgroundImage: File | null;
}

export default function CreateCharacterModal({
  isOpen,
  onClose,
  userId,
}: CreateCharacterModalProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [form, setForm] = useState<CharacterForm>({
    name: "",
    description: "",
    personality: "",
    traits: [],
    systemPrompt: "",
    previewImage: null,
    selectedDefaultVrm: null,
    vrmModel: null,
    selectedDefaultBackground: null,
    selectedUserBackground: null,
    backgroundImage: null,
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [newTrait, setNewTrait] = useState("");
  const [userBackgrounds, setUserBackgrounds] = useState<UserBackground[]>([]);
  const [loadingBackgrounds, setLoadingBackgrounds] = useState(false);

  // Load user backgrounds when modal opens
  useEffect(() => {
    if (isOpen && userId) {
      loadUserBackgrounds();
    }
  }, [isOpen, userId]);

  const loadUserBackgrounds = async () => {
    setLoadingBackgrounds(true);
    try {
      const backgrounds = await getUserBackgrounds();
      setUserBackgrounds(backgrounds);
    } catch (error) {
      console.error("Failed to load user backgrounds:", error);
    } finally {
      setLoadingBackgrounds(false);
    }
  };

  const totalSteps = 6;

  const handleInputChange = (
    field: keyof CharacterForm,
    value: string | File | null | string[]
  ) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleAddTrait = () => {
    if (newTrait.trim() && !form.traits.includes(newTrait.trim())) {
      handleInputChange("traits", [...form.traits, newTrait.trim()]);
      setNewTrait("");
    }
  };

  const handleRemoveTrait = (trait: string) => {
    handleInputChange(
      "traits",
      form.traits.filter((t) => t !== trait)
    );
  };

  const handleFileUpload = (field: keyof CharacterForm, file: File) => {
    handleInputChange(field, file);
  };

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleGenerate = async () => {
    setIsGenerating(true);

    try {
      // Validate required data
      if (!form.previewImage) {
        throw new Error("Preview image is required");
      }

      if (!form.selectedDefaultVrm && !form.vrmModel) {
        throw new Error("VRM model selection is required");
      }

      if (
        !form.selectedDefaultBackground &&
        !form.selectedUserBackground &&
        !form.backgroundImage
      ) {
        throw new Error("Background image selection is required");
      }

      // 사용자가 작성한 시스템 프롬프트를 AI로 강화 (필수)
      const response = await fetch("/api/customprompt", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: form.name,
          description: form.description,
          personality: form.personality,
          traits: form.traits,
          systemPrompt: form.systemPrompt,
        }),
      });

      if (!response.ok) {
        throw new Error("캐릭터 프롬프트 생성에 실패했습니다");
      }

      const data = await response.json();
      if (!data.success || !data.systemPrompt) {
        throw new Error("캐릭터 프롬프트 생성에 실패했습니다");
      }

      const enhancedSystemPrompt = data.systemPrompt;

      // Prepare form data for submission with enhanced system prompt
      const formData: CustomCharacterFormData = {
        name: form.name,
        description: form.description,
        personality: form.personality,
        traits: form.traits,
        systemPrompt: enhancedSystemPrompt, // 강화된 프롬프트 사용
        previewImage: form.previewImage,
        selectedDefaultVrm: form.selectedDefaultVrm,
        vrmModel: form.vrmModel,
        selectedDefaultBackground: form.selectedDefaultBackground,
        selectedUserBackground: form.selectedUserBackground,
        backgroundImage: form.backgroundImage,
      };

      // Create the character
      const result = await createCustomCharacter(formData, userId);

      if (!result) {
        throw new Error("Failed to create custom character");
      }

      // Reset form and close modal
      resetForm();
      onClose();
      window.location.reload();
    } catch (error) {
      console.error("Error creating character:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const resetForm = () => {
    setCurrentStep(1);
    setForm({
      name: "",
      description: "",
      personality: "",
      traits: [],
      systemPrompt: "",
      previewImage: null,
      selectedDefaultVrm: null,
      vrmModel: null,
      selectedDefaultBackground: null,
      selectedUserBackground: null,
      backgroundImage: null,
    });
    setNewTrait("");
    setIsGenerating(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const isStepValid = (step: number) => {
    switch (step) {
      case 1:
        return (
          form.name.trim().length > 0 && form.description.trim().length > 0
        );
      case 2:
        return form.personality.trim().length > 0 && form.traits.length > 0;
      case 3:
        return form.systemPrompt.trim().length > 0;
      case 4:
        return form.previewImage !== null;
      case 5:
        return form.selectedDefaultVrm !== null || form.vrmModel !== null;
      case 6:
        return (
          form.selectedDefaultBackground !== null ||
          form.selectedUserBackground !== null ||
          form.backgroundImage !== null
        );
      default:
        return false;
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-white text-sm font-medium mb-2">
                Character Name
              </label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                placeholder="Enter your character's name"
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/60 focus:outline-none focus:border-white/40"
                maxLength={30}
              />
            </div>
            <div>
              <label className="block text-white text-sm font-medium mb-2">
                Description
              </label>
              <textarea
                value={form.description}
                onChange={(e) =>
                  handleInputChange("description", e.target.value)
                }
                placeholder="Describe your character in one sentence"
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/60 focus:outline-none focus:border-white/40 resize-none"
                rows={3}
                maxLength={100}
              />
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-white text-sm font-medium mb-2">
                Personality
              </label>
              <textarea
                value={form.personality}
                onChange={(e) =>
                  handleInputChange("personality", e.target.value)
                }
                placeholder="Describe your character's personality and traits in detail"
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/60 focus:outline-none focus:border-white/40 resize-none"
                rows={4}
                maxLength={300}
              />
            </div>
            <div>
              <label className="block text-white text-sm font-medium mb-2">
                Character Traits (minimum 1)
              </label>
              <div className="flex space-x-2 mb-2">
                <input
                  type="text"
                  value={newTrait}
                  onChange={(e) => setNewTrait(e.target.value)}
                  placeholder="Enter traits (e.g., friendly, energetic)"
                  className="flex-1 px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/60 focus:outline-none focus:border-white/40"
                  maxLength={20}
                  onKeyDown={(e) => e.key === "Enter" && handleAddTrait()}
                />
                <button
                  onClick={handleAddTrait}
                  className="px-4 py-2 bg-white/20 text-white rounded-xl hover:bg-white/30 transition-colors"
                >
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {form.traits.map((trait, index) => (
                  <div
                    key={index}
                    className="bg-blue-500/20 text-blue-300 px-3 py-1 rounded-full text-sm flex items-center space-x-2"
                  >
                    <span>{trait}</span>
                    <button
                      onClick={() => handleRemoveTrait(trait)}
                      className="text-blue-300 hover:text-red-300 transition-colors"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-white text-sm font-medium mb-2">
                Details (Background, Story, Speech Pattern)
              </label>
              <textarea
                value={form.systemPrompt}
                onChange={(e) =>
                  handleInputChange("systemPrompt", e.target.value)
                }
                placeholder="Describe your character's speech pattern, behavior, and backstory in detail..."
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/60 focus:outline-none focus:border-white/40 resize-none"
                rows={8}
                maxLength={2000}
              />
              <div className="text-white/40 text-xs mt-1">
                Example: &lt;You are a bright and energetic character. You speak in
                a friendly tone and...&gt;
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-white text-sm font-medium mb-2">
                Preview Image
              </label>
              <div className="border-2 border-dashed border-white/20 rounded-xl p-6 text-center">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    e.target.files?.[0] &&
                    handleFileUpload("previewImage", e.target.files[0])
                  }
                  className="hidden"
                  id="preview-image"
                />
                <label htmlFor="preview-image" className="cursor-pointer">
                  {form.previewImage ? (
                    <Image
                      src={URL.createObjectURL(form.previewImage)}
                      alt="Preview"
                      width={128}
                      height={128}
                      className=" mx-auto object-cover rounded-lg border border-white/20"
                    />
                  ) : (
                    <div className="text-white/60">
                      <svg
                        className="w-12 h-12 mx-auto mb-4 text-white/40"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                        />
                      </svg>
                      Upload character preview image
                    </div>
                  )}
                </label>
              </div>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            {/* Upload Custom VRM */}
            <div className="mb-6">
              <h3 className="text-white/80 text-sm font-medium mb-3">
                Upload new VRM
              </h3>
              <div className="border-2 border-dashed border-white/20 rounded-xl p-4 text-center">
                <input
                  type="file"
                  accept=".vrm"
                  onChange={(e) => {
                    if (e.target.files?.[0]) {
                      handleFileUpload("vrmModel", e.target.files[0]);
                      handleInputChange("selectedDefaultVrm", null);
                    }
                  }}
                  className="hidden"
                  id="vrm-model"
                />
                <label htmlFor="vrm-model" className="cursor-pointer">
                  {form.vrmModel ? (
                    <div className="text-green-400">{form.vrmModel.name} ✓</div>
                  ) : (
                    <div className="text-white/60">
                      <svg
                        className="w-8 h-8 mx-auto mb-2 text-white/40"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                        />
                      </svg>
                      Upload your own VRM file
                    </div>
                  )}
                </label>
              </div>
            </div>

            {/* Default VRM Models */}
            <div>
              <h3 className="text-white/80 text-sm font-medium mb-3">
                Default VRM
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {DEFAULT_VRM_MODELS.map((model) => (
                  <div
                    key={model.id}
                    onClick={() => {
                      handleInputChange("selectedDefaultVrm", model.id);
                      handleInputChange("vrmModel", null);
                    }}
                    className={`cursor-pointer border-2 rounded-xl p-1 transition-all ${
                      form.selectedDefaultVrm === model.id
                        ? "border-blue-400 bg-blue-400/10"
                        : "border-white/20 hover:border-white/40"
                    }`}
                  >
                    <Image
                      src={model.preview}
                      alt={model.name}
                      width={128}
                      height={128}
                      className="object-cover w-full h-40 rounded-lg"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 6:
        return (
          <div className="space-y-6">
            {/* Upload New Background */}
            <div className="mb-6">
              <h3 className="text-white/80 text-sm font-medium mb-3">
                Upload New Background
              </h3>
              <div className="border-2 border-dashed border-white/20 rounded-xl p-4 text-center">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    if (e.target.files?.[0]) {
                      handleFileUpload("backgroundImage", e.target.files[0]);
                      handleInputChange("selectedDefaultBackground", null);
                      handleInputChange("selectedUserBackground", null);
                    }
                  }}
                  className="hidden"
                  id="background-image"
                />
                <label htmlFor="background-image" className="cursor-pointer">
                  {form.backgroundImage ? (
                    <Image
                      src={URL.createObjectURL(form.backgroundImage)}
                      alt="Background Preview"
                      width={128}
                      height={96}
                      className="mx-auto object-cover rounded-lg border border-white/20"
                    />
                  ) : (
                    <div className="text-white/60">
                      <svg
                        className="w-8 h-8 mx-auto mb-2 text-white/40"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                        />
                      </svg>
                      Upload new background image
                    </div>
                  )}
                </label>
              </div>
            </div>

            {/* User Uploaded Backgrounds */}
            {userBackgrounds.length > 0 && (
              <div className="mb-6">
                <h3 className="text-white/80 text-sm font-medium mb-3">
                  Your Backgrounds
                </h3>
                {loadingBackgrounds ? (
                  <div className="text-white/60 text-sm">Loading...</div>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    {userBackgrounds.map((bg) => (
                      <div
                        key={bg.id}
                        onClick={() => {
                          handleInputChange("selectedUserBackground", bg.id);
                          handleInputChange("selectedDefaultBackground", null);
                          handleInputChange("backgroundImage", null);
                        }}
                        className={`cursor-pointer border-2 rounded-lg overflow-hidden transition-all ${
                          form.selectedUserBackground === bg.id
                            ? "border-blue-400"
                            : "border-white/20 hover:border-white/40"
                        }`}
                      >
                        <Image
                          src={bg.public_url}
                          alt="User background"
                          width={128}
                          height={128}
                          className="object-cover w-full h-40"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Default Backgrounds */}
            <div>
              <h3 className="text-white/80 text-sm font-medium mb-3">
                Default Backgrounds
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {DEFAULT_BACKGROUNDS.map((bg) => (
                  <div
                    key={bg.id}
                    onClick={() => {
                      handleInputChange("selectedDefaultBackground", bg.id);
                      handleInputChange("selectedUserBackground", null);
                      handleInputChange("backgroundImage", null);
                    }}
                    className={`cursor-pointer border-2 rounded-lg overflow-hidden transition-all ${
                      form.selectedDefaultBackground === bg.id
                        ? "border-blue-400"
                        : "border-white/20 hover:border-white/40"
                    }`}
                  >
                    <Image
                      src={bg.path}
                      alt={bg.name}
                      width={128}
                      height={128}
                      className="object-cover w-full h-40"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  if (!isOpen) return null;

  const modalContent = (
    <div
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl shadow-lg p-6 max-w-lg w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl font-semibold text-white">
              Create Custom Character
            </h2>
            <p className="text-white/60 text-sm mt-1">
              Step {currentStep} / {totalSteps}
            </p>
          </div>
          <button
            onClick={handleClose}
            className="text-white/60 hover:text-white transition-colors"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-white/10 rounded-full h-1 mb-6">
          <div
            className="bg-gradient-to-r from-gray-500 to-white h-1 rounded-full transition-all duration-300"
            style={{ width: `${(currentStep / totalSteps) * 100}%` }}
          />
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[50vh] mb-6">
          {renderStepContent()}
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center">
          <button
            onClick={handleBack}
            disabled={currentStep === 1}
            className="px-4 py-2 text-white/60 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Previous
          </button>

          <div className="flex space-x-2">
            {currentStep < totalSteps ? (
              <button
                onClick={handleNext}
                disabled={!isStepValid(currentStep)}
                className="px-6 py-2 bg-white/20 text-white rounded-xl hover:bg-white/30 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-all duration-200 backdrop-blur-sm border border-white/30"
              >
                Next
              </button>
            ) : (
              <button
                onClick={handleGenerate}
                disabled={!isStepValid(currentStep) || isGenerating}
                className="px-6 py-2 bg-white/20 text-white rounded-xl hover:bg-white/30 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-all duration-200 backdrop-blur-sm border border-white/30"
              >
                {isGenerating ? (
                  <div className="flex items-center space-x-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="none"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                  </div>
                ) : (
                  "Create"
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
