import { ActionForm } from "@/components/ActionForm";
import { SubmitButton } from "@/components/SubmitButton";
import { saveCourseAction } from "@/app/actions/admin";
import { LEVELS, MODES } from "@/lib/constants";

type Course = {
  id: string; slug: string; title: string; subtitle: string; description: string; outcomes: string;
  categoryId: string; level: string; mode: string; price: number; oldPrice: number | null;
  thumbnail: string | null; instructorName: string; instructorBio: string; durationHours: number;
  published: boolean; featured: boolean;
};

export function CourseForm({ course, categories }: { course?: Course; categories: { id: string; name: string }[] }) {
  return (
    <ActionForm action={saveCourseAction} className="space-y-6">
      {course && <input type="hidden" name="id" value={course.id} />}

      <div className="grid gap-4 md:grid-cols-2">
        <div className="md:col-span-2">
          <label className="label" htmlFor="title">عنوان الكورس *</label>
          <input id="title" name="title" required defaultValue={course?.title} className="input" />
        </div>
        <div className="md:col-span-2">
          <label className="label" htmlFor="subtitle">عنوان فرعي</label>
          <input id="subtitle" name="subtitle" defaultValue={course?.subtitle} className="input" />
        </div>
        <div>
          <label className="label" htmlFor="categoryId">التصنيف *</label>
          <select id="categoryId" name="categoryId" required defaultValue={course?.categoryId ?? ""} className="input">
            <option value="" disabled>اختر...</option>
            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <div>
          <label className="label" htmlFor="slug">الرابط (slug)</label>
          <input id="slug" name="slug" defaultValue={course?.slug} dir="ltr" className="input text-end" placeholder="يتولد تلقائيًا من العنوان" />
        </div>
        <div>
          <label className="label" htmlFor="level">المستوى</label>
          <select id="level" name="level" defaultValue={course?.level ?? "BEGINNER"} className="input">
            {Object.entries(LEVELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
        </div>
        <div>
          <label className="label" htmlFor="mode">نوع الكورس</label>
          <select id="mode" name="mode" defaultValue={course?.mode ?? "RECORDED"} className="input">
            {Object.entries(MODES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
        </div>
        <div>
          <label className="label" htmlFor="price">السعر (ج.م) *</label>
          <input id="price" name="price" type="number" min={0} required defaultValue={course?.price ?? 0} className="input" />
          <p className="hint">اكتب 0 لجعل الكورس مجانيًا.</p>
        </div>
        <div>
          <label className="label" htmlFor="oldPrice">السعر قبل الخصم (اختياري)</label>
          <input id="oldPrice" name="oldPrice" type="number" min={0} defaultValue={course?.oldPrice ?? ""} className="input" />
        </div>
        <div>
          <label className="label" htmlFor="durationHours">المدة (ساعات)</label>
          <input id="durationHours" name="durationHours" type="number" min={0} defaultValue={course?.durationHours ?? 0} className="input" />
        </div>
        <div>
          <label className="label" htmlFor="thumbnail">رابط صورة الغلاف (اختياري)</label>
          <input id="thumbnail" name="thumbnail" defaultValue={course?.thumbnail ?? ""} dir="ltr" className="input text-end" placeholder="https://..." />
          <p className="hint">اتركه فارغًا لاستخدام غلاف تلقائي بألوان الأكاديمية.</p>
        </div>
        <div>
          <label className="label" htmlFor="instructorName">اسم المدرب</label>
          <input id="instructorName" name="instructorName" defaultValue={course?.instructorName} className="input" />
        </div>
        <div>
          <label className="label" htmlFor="instructorBio">نبذة عن المدرب</label>
          <input id="instructorBio" name="instructorBio" defaultValue={course?.instructorBio} className="input" />
        </div>
        <div className="md:col-span-2">
          <label className="label" htmlFor="description">وصف الكورس</label>
          <textarea id="description" name="description" rows={5} defaultValue={course?.description} className="input" />
        </div>
        <div className="md:col-span-2">
          <label className="label" htmlFor="outcomes">ماذا سيتعلم الطالب؟ (كل نقطة في سطر)</label>
          <textarea id="outcomes" name="outcomes" rows={4} defaultValue={course?.outcomes} className="input" />
        </div>
      </div>

      <div className="flex flex-wrap gap-6">
        <label className="inline-flex cursor-pointer items-center gap-2 font-bold text-navy-900">
          <input type="checkbox" name="published" defaultChecked={course?.published ?? false} className="h-5 w-5 accent-[#0A2A6B]" />
          منشور (ظاهر للطلاب)
        </label>
        <label className="inline-flex cursor-pointer items-center gap-2 font-bold text-navy-900">
          <input type="checkbox" name="featured" defaultChecked={course?.featured ?? false} className="h-5 w-5 accent-[#0A2A6B]" />
          مميز (يظهر في الرئيسية)
        </label>
      </div>

      <SubmitButton className="btn-gold btn-lg">{course ? "حفظ التعديلات" : "إنشاء الكورس"}</SubmitButton>
    </ActionForm>
  );
}
