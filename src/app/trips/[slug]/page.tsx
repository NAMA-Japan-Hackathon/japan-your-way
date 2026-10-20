import { TripDetail } from "@/components/discovery";
import { trips } from "@/lib/planner";
export function generateStaticParams() {
  return trips.map((t) => ({ slug: t.slug }));
}
export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <TripDetail slug={slug} />;
}
