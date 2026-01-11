import React, { useState } from "react";
import { Course, SchemeType } from "@/types/entities";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Card } from "@/components/ui/card";

interface CourseFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    name: string;
    code?: string;
    universityId: string;
    schemeType: SchemeType;
  }) => void;
  universityId: string;
  isLoading?: boolean;
  initialData?: Partial<Course>;
}

export const CourseForm: React.FC<CourseFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  universityId,
  isLoading = false,
  initialData,
}) => {
  const [formData, setFormData] = useState({
    name: initialData?.name || "",
    code: initialData?.code || "",
    schemeType: (initialData?.schemeType || "SEMESTER") as SchemeType,
  });

  const handleSubmit = () => {
    if (!formData.name.trim()) {
      alert("Please enter a course name");
      return;
    }

    onSubmit({
      name: formData.name,
      code: formData.code || undefined,
      universityId,
      schemeType: formData.schemeType,
    });

    setFormData({
      name: "",
      code: "",
      schemeType: "SEMESTER",
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add Course">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Course Name *
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g., Bachelor of Science"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Course Code
          </label>
          <input
            type="text"
            value={formData.code}
            onChange={(e) => setFormData({ ...formData, code: e.target.value })}
            placeholder="e.g., B.SC"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Course Structure *
          </label>
          <div className="space-y-2">
            {["SEMESTER", "YEAR"].map((scheme) => (
              <label key={scheme} className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  name="schemeType"
                  value={scheme}
                  checked={formData.schemeType === scheme}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      schemeType: e.target.value as SchemeType,
                    })
                  }
                  className="mr-3"
                />
                <span className="text-gray-700">
                  {scheme === "SEMESTER"
                    ? "Semester-based (1–8)"
                    : "Year-based (1–4)"}
                </span>
              </label>
            ))}
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Choose how subjects are organized in this course.
          </p>
        </div>

        <div className="flex gap-2 justify-end pt-4">
          <Button onClick={onClose} variant="outline">
            Cancel
          </Button>
          <Button onClick={handleSubmit} variant="primary" disabled={isLoading}>
            {isLoading ? "Creating..." : "Create Course"}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
