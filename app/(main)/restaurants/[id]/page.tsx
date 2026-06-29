import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { RestaurantDetailClient } from "@/components/restaurant-detail-client";
import type { PublicRestaurantDetail } from "@/lib/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000";

async function getRestaurant(
	id: string,
): Promise<PublicRestaurantDetail | null> {
	try {
		const res = await fetch(`${API_URL}/restaurants/${id}`, {
			next: { revalidate: 300 },
		});
		if (!res.ok) return null;
		return res.json();
	} catch {
		return null;
	}
}

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
	const { id } = await params;
	const restaurant = await getRestaurant(id);
	if (!restaurant) return { title: "Restaurant not found" };
	return {
		title: `${restaurant.name} — Chowdeck`,
		description:
			restaurant.description ?? `Order from ${restaurant.name} on Chowdeck`,
	};
}

export default async function RestaurantPage({ params }: Props) {
	const { id } = await params;
	const restaurant = await getRestaurant(id);
	if (!restaurant) notFound();
	return <RestaurantDetailClient restaurant={restaurant} />;
}
