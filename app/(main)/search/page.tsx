import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

interface SearchPageProps {
  searchParams: Promise<{
    search?: string;
    q?: string;
    query?: string;
    [key: string]: string | undefined;
  }>;
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = await searchParams;
  const searchTerm = params.search || params.q || params.query || "";

  if (searchTerm) {
    redirect(`/shop?search=${encodeURIComponent(searchTerm)}`);
  }

  redirect("/shop");
}
