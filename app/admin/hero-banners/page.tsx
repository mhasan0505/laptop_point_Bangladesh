import { redirect } from "next/navigation";

export default function HeroBannersPage() {
  redirect("/admin/banners?placement=home.hero");
}
