import "server-only";
import { db } from "./db";

export type EnrolledCourse = {
  enrollmentId: string;
  certificateCode: string | null;
  completedAt: Date | null;
  course: {
    id: string; slug: string; title: string; thumbnail: string | null;
    category: { name: string; icon: string }; instructorName: string;
  };
  total: number;
  done: number;
  percent: number;
  nextLessonId: string | null;
};

export async function getEnrolledCourses(userId: string): Promise<EnrolledCourse[]> {
  const enrollments = await db.enrollment.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: {
      course: {
        select: {
          id: true, slug: true, title: true, thumbnail: true, instructorName: true,
          category: { select: { name: true, icon: true } },
          lessons: { select: { id: true }, orderBy: { order: "asc" } },
        },
      },
    },
  });
  const progress = await db.lessonProgress.findMany({ where: { userId }, select: { lessonId: true } });
  const doneSet = new Set(progress.map((p) => p.lessonId));

  return enrollments.map((e) => {
    const ids = e.course.lessons.map((l) => l.id);
    const done = ids.filter((id) => doneSet.has(id)).length;
    const { lessons, ...course } = e.course;
    void lessons;
    return {
      enrollmentId: e.id,
      certificateCode: e.certificateCode,
      completedAt: e.completedAt,
      course,
      total: ids.length,
      done,
      percent: ids.length ? Math.round((done / ids.length) * 100) : 0,
      nextLessonId: ids.find((id) => !doneSet.has(id)) ?? null,
    };
  });
}
