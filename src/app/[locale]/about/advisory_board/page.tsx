import { redirect } from "next/navigation";

export default async function AdvisoryBoardUnderscoreRedirect({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  redirect(`/${locale}/about/advisory-board`);
}
