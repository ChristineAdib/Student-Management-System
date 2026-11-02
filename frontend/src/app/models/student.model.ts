export interface Student {
  id: number;
  fullName: string;
  email: string;
  phoneNumber?: string | null;
  department: string;
  enrollmentDate?: string | null;
  createdAt: string;
  updatedAt?: string | null;
}

export interface CreateStudentRequest {
  fullName: string;
  email: string;
  phoneNumber?: string | null;
  department: string;
  enrollmentDate?: string | null;
}

export interface UpdateStudentRequest {
  fullName: string;
  email: string;
  phoneNumber?: string | null;
  department: string;
  enrollmentDate?: string | null;
}

export interface DepartmentDistribution {
  department: string;
  count: number;
}

export interface StudentStats {
  totalStudents: number;
  totalDepartments: number;
  departments: DepartmentDistribution[];
  recentStudents: Student[];
}
