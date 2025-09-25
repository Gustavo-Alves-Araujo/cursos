"use client";

import { Sidebar } from "@/components/Sidebar";
import { AdminCourseForm } from "@/components/admin/AdminCourseForm";
import { useMockData } from "@/hooks/useMockData";

export default function NewCoursePage() {
  const { addCourse } = useMockData();
  return (
    <div className="relative">
      <Sidebar />
      <main className="space-y-6 p-6">
        <h1 className="text-2xl font-semibold">Novo Curso</h1>
        <AdminCourseForm onSubmit={(data) => {
          addCourse({ ...data });
          alert("Curso criado (mock). Substitua por chamada de API futuramente.");
        }} />
      </main>
    </div>
  );
}


