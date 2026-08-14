import { notFound } from "next/navigation";
import ContentGuidePageClient from "@/components/ContentGuidePageClient";
import { isValidGuideServiceId } from "@/lib/content-guides";

interface PageProps {
  params: Promise<{ serviceId: string }>;
}

export default async function ContentGuidePage({ params }: PageProps) {
  const { serviceId } = await params;
  if (!isValidGuideServiceId(serviceId)) notFound();
  return <ContentGuidePageClient serviceId={serviceId} />;
}
