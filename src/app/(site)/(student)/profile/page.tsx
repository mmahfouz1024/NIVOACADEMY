import type { Metadata } from "next";
import { requireUser } from "@/lib/auth";
import { ProfileForm, PasswordForm } from "@/components/ProfileForms";

export const metadata: Metadata = { title: "حسابي" };

export default async function ProfilePage() {
  const user = await requireUser("/profile");
  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <section className="card p-6">
        <h2 className="mb-5 text-xl">بياناتي</h2>
        <ProfileForm name={user.name} phone={user.phone ?? ""} email={user.email} />
      </section>
      <section className="card p-6">
        <h2 className="mb-5 text-xl">تغيير كلمة المرور</h2>
        <PasswordForm />
      </section>
    </div>
  );
}
