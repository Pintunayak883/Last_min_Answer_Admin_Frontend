import React, { useState } from "react";
import { Course, Term, Subject } from "@/types/entities";
import {
  useGetCoursesByUniversityQuery,
  useGetTermsBySessionQuery,
  useGetSubjectsByTermQuery,
  useCreateTermMutation,
  useUpdateTermMutation,
  useDeleteTermMutation,
  useCreateSubjectMutation,
  useDeleteSubjectMutation,
} from "@/store/admin-api";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { TermManager } from "@/components/ui/term-manager";
import { SubjectForm } from "@/components/ui/subject-form";
import { Plus, Trash2 } from "lucide-react";
import toast from "react-hot-toast";

interface CourseManagementViewProps {
  universityId: string;
  courseId: string;
}

export const CourseManagementView: React.FC<CourseManagementViewProps> = ({
  universityId,
  courseId,
}) => {
  const [selectedTermId, setSelectedTermId] = useState<string | null>(null);
  const [showSubjectForm, setShowSubjectForm] = useState(false);

  // Queries
  const { data: courses, isLoading: isLoadingCourses } =
    useGetCoursesByUniversityQuery(universityId);
  const { data: terms, isLoading: isLoadingTerms } =
    useGetTermsBySessionQuery(courseId);
  const { data: subjects, isLoading: isLoadingSubjects } =
    useGetSubjectsByTermQuery(selectedTermId || "");

  // Mutations
  const [createTerm, { isLoading: isCreatingTerm }] = useCreateTermMutation();
  const [updateTerm, { isLoading: isUpdatingTerm }] = useUpdateTermMutation();
  const [deleteTerm, { isLoading: isDeletingTerm }] = useDeleteTermMutation();
  const [createSubject, { isLoading: isCreatingSubject }] =
    useCreateSubjectMutation();
  const [deleteSubject] = useDeleteSubjectMutation();

  const currentCourse = courses?.find((c) => c.id === courseId);
  const selectedTerm = terms?.find((t) => t.id === selectedTermId);

  const handleAddTerm = async (data: {
    type: "SEMESTER" | "YEAR";
    value: number;
    label: string;
  }) => {
    try {
      await createTerm({
        courseId,
        type: data.type,
        value: data.value,
        label: data.label,
      }).unwrap();
      toast.success(`${data.label} created successfully`);
    } catch (error: any) {
      toast.error(error.data?.message || "Failed to create term");
    }
  };

  const handleUpdateTerm = async (
    termId: string,
    data: { value?: number; label?: string }
  ) => {
    try {
      await updateTerm({ id: termId, ...data }).unwrap();
      toast.success("Term updated successfully");
    } catch (error: any) {
      toast.error(error.data?.message || "Failed to update term");
    }
  };

  const handleDeleteTerm = async (termId: string) => {
    try {
      await deleteTerm(termId).unwrap();
      if (selectedTermId === termId) {
        setSelectedTermId(null);
      }
      toast.success("Term deleted successfully");
    } catch (error: any) {
      toast.error(error.data?.message || "Failed to delete term");
    }
  };

  const handleAddSubject = async (data: {
    name: string;
    code?: string;
    termId: string;
  }) => {
    try {
      await createSubject(data).unwrap();
      toast.success("Subject created successfully");
      setShowSubjectForm(false);
    } catch (error: any) {
      toast.error(error.data?.message || "Failed to create subject");
    }
  };

  const handleDeleteSubject = async (subjectId: string) => {
    if (window.confirm("Are you sure you want to delete this subject?")) {
      try {
        await deleteSubject(subjectId).unwrap();
        toast.success("Subject deleted successfully");
      } catch (error: any) {
        toast.error(error.data?.message || "Failed to delete subject");
      }
    }
  };

  if (!currentCourse) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Course not found</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Course Header */}
      <div className="border-b pb-4">
        <h2 className="text-2xl font-bold">{currentCourse.name}</h2>
        <p className="text-gray-600 mt-1">
          Scheme:{" "}
          {currentCourse.schemeType === "SEMESTER"
            ? "Semester-based (1–8)"
            : "Year-based (1–4)"}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Term Manager */}
        <div className="lg:col-span-1">
          {isLoadingTerms ? (
            <p className="text-gray-500">Loading terms...</p>
          ) : (
            <TermManager
              courseId={courseId}
              schemeType={currentCourse.schemeType || "SEMESTER"}
              terms={terms || []}
              onAddTerm={handleAddTerm}
              onUpdateTerm={handleUpdateTerm}
              onDeleteTerm={handleDeleteTerm}
              onSelectTerm={(term) => setSelectedTermId(term?.id || null)}
              selectedTermId={selectedTermId || undefined}
              isLoading={isCreatingTerm || isUpdatingTerm || isDeletingTerm}
            />
          )}
        </div>

        {/* Right: Subjects List */}
        <div className="lg:col-span-2">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">
                {selectedTerm
                  ? `Subjects in ${selectedTerm.label}`
                  : "Select a term"}
              </h3>
              {selectedTerm && (
                <Button
                  onClick={() => setShowSubjectForm(true)}
                  variant="primary"
                  size="sm"
                  className="gap-2"
                >
                  <Plus size={16} />
                  Add Subject
                </Button>
              )}
            </div>

            {!selectedTerm ? (
              <Card className="p-6 text-center text-gray-500">
                <p>
                  Please select a{" "}
                  {currentCourse.schemeType === "SEMESTER"
                    ? "semester"
                    : "year"}{" "}
                  to view subjects
                </p>
              </Card>
            ) : isLoadingSubjects ? (
              <p className="text-gray-500">Loading subjects...</p>
            ) : subjects && subjects.length > 0 ? (
              <div className="space-y-2">
                {subjects.map((subject) => (
                  <div
                    key={subject.id}
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex-1">
                      <p className="font-medium">{subject.name}</p>
                      {subject.code && (
                        <p className="text-sm text-gray-500">
                          Code: {subject.code}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => handleDeleteSubject(subject.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded"
                      title="Delete"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <Card className="p-6 text-center text-gray-500">
                <p>No subjects yet</p>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Subject Form Modal */}
      <SubjectForm
        isOpen={showSubjectForm}
        onClose={() => setShowSubjectForm(false)}
        onSubmit={handleAddSubject}
        selectedTerm={selectedTerm || null}
        isLoading={isCreatingSubject}
      />
    </div>
  );
};
