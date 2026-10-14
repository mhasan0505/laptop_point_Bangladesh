import { redirect } from "next/navigation";

export default function HotDealPage() {
  redirect("/admin/banners?placement=home.flash-deal");
}
