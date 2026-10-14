import { redirect } from "next/navigation";

export default function SpecialOffersPage() {
  redirect("/admin/banners?placement=home.special-offers");
}
