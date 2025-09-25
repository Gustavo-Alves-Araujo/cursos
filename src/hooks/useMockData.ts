"use client";

import { useMemo, useState, useCallback } from "react";
import { mockCourses, mockStudents, type Course, type Student } from "@/mocks/data";

export function useMockData() {
  const [courses, setCourses] = useState<Course[]>(mockCourses);
  const [students, setStudents] = useState<Student[]>(mockStudents);

  const myCourses = useMemo(() => courses.filter((c) => c.owned), [courses]);
  const notOwnedCourses = useMemo(() => courses.filter((c) => !c.owned), [courses]);

  const addCourse = useCallback((course: Omit<Course, "id">) => {
    const id = `c-${Math.random().toString(36).slice(2, 8)}`;
    const newCourse: Course = { id, ...course };
    setCourses((prev) => [newCourse, ...prev]);
    return newCourse;
  }, []);

  const assignCourse = useCallback((studentId: string, courseId: string, assigned: boolean) => {
    setStudents((prev) =>
      prev.map((s) =>
        s.id === studentId
          ? {
              ...s,
              ownedCourseIds: assigned
                ? Array.from(new Set([...s.ownedCourseIds, courseId]))
                : s.ownedCourseIds.filter((id) => id !== courseId),
            }
          : s
      )
    );
  }, []);

  return {
    courses,
    students,
    myCourses,
    notOwnedCourses,
    addCourse,
    assignCourse,
  };
}

// Hooks prontos para futura troca por APIs reais
export function useCourses() {
  const { courses, myCourses, notOwnedCourses } = useMockData();
  return { courses, myCourses, notOwnedCourses };
}

export function useMyCourses() {
  const { myCourses } = useMockData();
  return { myCourses };
}

export const adminApi = {
  addCourseFrontendOnly: (course: Omit<Course, "id">) => course,
  assignCoursePlaceholder: (studentId: string, courseId: string) => ({ studentId, courseId }),
};


