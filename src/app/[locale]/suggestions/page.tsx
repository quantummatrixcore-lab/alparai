import { redirect } from "next/navigation";

export async function generateMetadata() {
  return { title: "Community Ideas" };
}

export default async function SuggestionsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  redirect(`/${locale}/dilemmas`);
}
