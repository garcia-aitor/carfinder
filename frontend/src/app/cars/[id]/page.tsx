import { CarDetailClient } from "@/features/cars/car-detail-client";

interface CarDetailsPageProps {
  params: Promise<{ id: string }>;
}

export default async function CarDetailsPage({ params }: CarDetailsPageProps) {
  const { id } = await params;
  return <CarDetailClient id={id} />;
}
