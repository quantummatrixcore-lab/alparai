import { redirect } from "next/navigation";

export default async function PressRedirectPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  redirect(`/${locale}/press-kit`);
}
