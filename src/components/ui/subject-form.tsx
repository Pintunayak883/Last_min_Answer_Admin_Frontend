import React, { useState } from "react";
import { Term } from "@/types/entities";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";

interface SubjectFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { name: string; code?: string; termId: string }) => void;
  selectedTerm: Term | null;
  isLoading?: boolean;
}

export const SubjectForm: React.FC<SubjectFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  selectedTerm,
  isLoading = false,
}) => {
  const [formData, setFormData] = useState({
    name: "",
    code: "",
  });

  const handleSubmit = () => {
    if (!formData.name.trim() || !selectedTerm) {
      alert("Please enter a subject name and select a term");
      return;
    }

    onSubmit({
      name: formData.name,
      code: formData.code || undefined,
      termId: selectedTerm.id,
    });

    setFormData({ name: "", code: "" });
  };

  if (!selectedTerm) {
    return null;
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add Subject">
      <div className="space-y-4">
        <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
          <p className="text-sm text-gray-600">
            <span className="font-medium">Adding to:</span> {selectedTerm.label}
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Subject Name *
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g., Mathematics"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Subject Code
          </label>
          <input
            type="text"
            value={formData.code}
            onChange={(e) => setFormData({ ...formData, code: e.target.value })}
            placeholder="e.g., MATH101"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500"
          />
        </div>

        <div className="flex gap-2 justify-end pt-4">
          <Button onClick={onClose} variant="outline">
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            variant="primary"
            disabled={isLoading || !formData.name.trim()}
          >
            {isLoading ? "Creating..." : "Create Subject"}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
