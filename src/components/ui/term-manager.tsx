import React, { useState, useMemo } from "react";
import { Term, SchemeType } from "@/types/entities";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Modal } from "@/components/ui/modal";
import { Plus, Edit2, Trash2, ChevronDown } from "lucide-react";

interface TermManagerProps {
  courseId: string;
  schemeType: SchemeType;
  terms: Term[];
  onAddTerm: (term: { type: SchemeType; value: number; label: string }) => void;
  onUpdateTerm: (id: string, data: { value?: number; label?: string }) => void;
  onDeleteTerm: (id: string) => void;
  onSelectTerm: (term: Term | null) => void;
  selectedTermId?: string;
  isLoading?: boolean;
}

export const TermManager: React.FC<TermManagerProps> = ({
  courseId,
  schemeType,
  terms,
  onAddTerm,
  onUpdateTerm,
  onDeleteTerm,
  onSelectTerm,
  selectedTermId,
  isLoading = false,
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingTermId, setEditingTermId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    value: 1,
    label: "",
  });

  const isSemesterScheme = schemeType === "SEMESTER";
  const maxTerms = isSemesterScheme ? 8 : 4;
  const termLabel = isSemesterScheme ? "Semester" : "Year";

  const availableValues = useMemo(() => {
    const usedValues = terms.map((t) => t.value);
    return Array.from({ length: maxTerms }, (_, i) => i + 1).filter(
      (v) => !usedValues.includes(v)
    );
  }, [terms, maxTerms]);

  const handleAddTerm = () => {
    if (formData.value) {
      const label = formData.label || `${termLabel} ${formData.value}`;
      onAddTerm({
        type: schemeType,
        value: formData.value,
        label,
      });
      setShowAddModal(false);
      setFormData({ value: 1, label: "" });
    }
  };

  const handleUpdateTerm = (id: string) => {
    onUpdateTerm(id, {
      value: formData.value,
      label: formData.label || `${termLabel} ${formData.value}`,
    });
    setEditingTermId(null);
    setFormData({ value: 1, label: "" });
  };

  const sortedTerms = [...terms].sort((a, b) => a.value - b.value);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Manage {termLabel}s</h3>
        {availableValues.length > 0 && (
          <Button
            onClick={() => setShowAddModal(true)}
            variant="primary"
            size="sm"
            className="gap-2"
          >
            <Plus size={16} />
            Add {termLabel}
          </Button>
        )}
      </div>

      {sortedTerms.length === 0 ? (
        <Card className="p-6 text-center text-gray-500">
          <p>No {termLabel.toLowerCase()}s yet</p>
        </Card>
      ) : (
        <div className="grid gap-2">
          {sortedTerms.map((term) => (
            <div
              key={term.id}
              onClick={() => onSelectTerm(term)}
              className={`
                flex items-center justify-between p-4 rounded-lg border-2 cursor-pointer
                transition-colors
                ${
                  selectedTermId === term.id
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 bg-white hover:border-gray-300"
                }
              `}
            >
              <div className="flex-1">
                <p className="font-medium">{term.label}</p>
                <p className="text-sm text-gray-500">Value: {term.value}</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setEditingTermId(term.id);
                    setFormData({ value: term.value, label: term.label });
                  }}
                  className="p-2 text-gray-600 hover:bg-gray-100 rounded"
                  title="Edit"
                >
                  <Edit2 size={16} />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (
                      window.confirm(
                        `Delete ${term.label}? Associated subjects will also be deleted.`
                      )
                    ) {
                      onDeleteTerm(term.id);
                    }
                  }}
                  className="p-2 text-red-600 hover:bg-red-50 rounded"
                  title="Delete"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Term Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => {
          setShowAddModal(false);
          setFormData({ value: 1, label: "" });
        }}
        title={`Add New ${termLabel}`}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {termLabel} Number *
            </label>
            <select
              value={formData.value}
              onChange={(e) =>
                setFormData({ ...formData, value: parseInt(e.target.value) })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500"
            >
              {availableValues.map((v) => (
                <option key={v} value={v}>
                  {termLabel} {v}
                </option>
              ))}
            </select>
            {availableValues.length === 0 && (
              <p className="text-sm text-red-500 mt-1">
                All {termLabel.toLowerCase()}s already created (max: {maxTerms})
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Label (optional)
            </label>
            <input
              type="text"
              value={formData.label}
              onChange={(e) =>
                setFormData({ ...formData, label: e.target.value })
              }
              placeholder={`e.g., ${termLabel} ${formData.value}`}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500"
            />
          </div>

          <div className="flex gap-2 justify-end pt-4">
            <Button
              onClick={() => {
                setShowAddModal(false);
                setFormData({ value: 1, label: "" });
              }}
              variant="outline"
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddTerm}
              variant="primary"
              disabled={availableValues.length === 0 || isLoading}
            >
              {isLoading ? "Adding..." : "Add"}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Edit Term Modal */}
      <Modal
        isOpen={editingTermId !== null}
        onClose={() => {
          setEditingTermId(null);
          setFormData({ value: 1, label: "" });
        }}
        title={`Edit ${termLabel}`}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {termLabel} Number *
            </label>
            <input
              type="number"
              min="1"
              max={maxTerms}
              value={formData.value}
              onChange={(e) =>
                setFormData({ ...formData, value: parseInt(e.target.value) })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Label (optional)
            </label>
            <input
              type="text"
              value={formData.label}
              onChange={(e) =>
                setFormData({ ...formData, label: e.target.value })
              }
              placeholder={`e.g., ${termLabel} ${formData.value}`}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500"
            />
          </div>

          <div className="flex gap-2 justify-end pt-4">
            <Button
              onClick={() => {
                setEditingTermId(null);
                setFormData({ value: 1, label: "" });
              }}
              variant="outline"
            >
              Cancel
            </Button>
            <Button
              onClick={() => editingTermId && handleUpdateTerm(editingTermId)}
              variant="primary"
              disabled={isLoading}
            >
              {isLoading ? "Updating..." : "Update"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
