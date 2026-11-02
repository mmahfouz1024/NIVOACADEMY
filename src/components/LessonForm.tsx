import { ActionForm } from "./ActionForm";
import { SubmitButton } from "./SubmitButton";
import { saveLessonAction } from "@/app/actions/admin";

type Lesson = {
  id: string; section: string; title: string; description: string; videoUrl: string;
  durationMin: number; order: number; isFree: boolean;
};

export function LessonForm({ courseId, lesson }: { courseId: string; lesson?: Lesson }) {
  return (
    <ActionForm action={saveLessonAction} className="space-y-4">
      <input type="hidden" name="courseId" value={courseId} />
      {lesson && <input type="hidden" name="id" value={lesson.id} />}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="md:col-span-2">
          <label className="label">عنوان الدرس *</label>
          <input name="title" required defaultValue={lesson?.title} className="input" />
        </div>
        <div>
          <label className="label">القسم / الوحدة</label>
          <input name="section" defaultValue={lesson?.section} className="input" placeholder="مثال: الأساسيات" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">المدة (دقيقة)</label>
            <input name="durationMin" type="number" min={0} defaultValue={lesson?.durationMin ?? 0} className="input" />
          </div>
          <div>
            <label className="label">الترتيب</label>
            <input name="order" type="number" min={0} defaultValue={lesson?.order ?? ""} className="input" placeholder="تلقائي" />
          </div>
        </div>
        <div className="md:col-span-2">
          <label className="label">رابط الفيديو</label>
          <input name="videoUrl" defaultValue={lesson?.videoUrl} dir="ltr" className="input text-end" placeholder="YouTube / Vimeo / Bunny embed / mp4 ..." />
          <p className="hint">يدعم يوتيوب (غير مدرج)، Vimeo، Bunny Stream، روابط mp4 المباشرة، أو أي رابط تضمين https.</p>
        </div>
        <div className="md:col-span-2">
          <label className="label">وصف / ملاحظات الدرس</label>
          <textarea name="description" rows={3} defaultValue={lesson?.description} className="input" />
        </div>
      </div>
      <label className="inline-flex cursor-pointer items-center gap-2 text-sm font-bold text-navy-900">
        <input type="checkbox" name="isFree" defaultChecked={lesson?.isFree} className="h-5 w-5 accent-[#0A2A6B]" />
        معاينة مجانية (متاح لغير المشتركين)
      </label>
      <div><SubmitButton className="btn-navy">{lesson ? "حفظ الدرس" : "إضافة الدرس"}</SubmitButton></div>
    </ActionForm>
  );
}
