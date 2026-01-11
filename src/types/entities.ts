export type SchemeType = "SEMESTER" | "YEAR";

export interface University {
  id: string;
  name: string;
  code?: string | null;
  _count?: {
    courses: number;
  };
  courses?: Course[];
}

export interface Course {
  id: string;
  name: string;
  code?: string | null;
  universityId: string;
  schemeType?: SchemeType;
  university?: University;
  terms?: Term[];
  _count?: {
    terms: number;
  };
}

export interface Term {
  id: string;
  courseId: string;
  type: SchemeType;
  value: number;
  label: string;
  course?: Course;
  subjects?: Subject[];
}

export interface Subject {
  id: string;
  name: string;
  code?: string | null;
  termId: string;
  term?: Term;
  syllabus?: Syllabus | null;
  questionPapers?: QuestionPaper[];
  notes?: Notes[];
  _count?: {
    syllabus: number;
    questionPapers: number;
    notes: number;
  };
}

export interface Syllabus {
  id: string;
  subjectId: string;
  filePath: string;
  year?: number | null;
}

export interface QuestionPaper {
  id: string;
  subjectId: string;
  filePath: string;
  year?: number | null;
  month?: string | null;
}

export interface Notes {
  id: string;
  subjectId: string;
  filePath: string;
  unit?: number | null;
  title?: string | null;
}

export interface AdminProfile {
  id: string;
  name: string;
  email: string;
  isVerified?: boolean;
  createdAt?: string;
}
