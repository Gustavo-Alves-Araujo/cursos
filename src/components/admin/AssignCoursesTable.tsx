"use client";

import { useMockData } from "@/hooks/useMockData";
import { Checkbox } from "@/components/ui/checkbox";

export function AssignCoursesTable() {
  const { students, courses, assignCourse } = useMockData();

  return (
    <div className="overflow-auto rounded-2xl border border-white/10">
      <table className="w-full min-w-[720px] text-left">
        <thead>
          <tr className="bg-zinc-900/60">
            <th className="p-3">Aluno</th>
            {courses.map((c) => (
              <th key={c.id} className="p-3 text-sm font-medium">{c.title}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {students.map((s) => (
            <tr key={s.id} className="odd:bg-white/5">
              <td className="p-3 text-sm font-medium">{s.name}</td>
              {courses.map((c) => {
                const checked = s.ownedCourseIds.includes(c.id);
                return (
                  <td key={c.id} className="p-3">
                    <Checkbox
                      aria-label={`Atribuir ${c.title} para ${s.name}`}
                      checked={checked}
                      onCheckedChange={(val) => assignCourse(s.id, c.id, Boolean(val))}
                    />
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}


