import { Suspense } from "react";
import { CategoryFilter } from "@/components/catgories-filters";
import { HeroBanner } from "@/components/hero-banner";
import { PromoBanners } from "@/components/promo-banner";
import { RestaurantCard } from "@/components/restaurants/restaurant-card";
import { RestaurantCardSkeleton } from "@/components/restaurants/restaurant-card-skeleton";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000";

interface Restaurant {
	id: string;
	name: string;
	description: string | null;
	logoUrl: string | null;
	bannerUrl: string | null;
	city: string;
	state: string;
	latitude: string;
	longitude: string;
	isOpen: boolean;
	openingTime: string;
	closingTime: string;
	estimatedPrepTime: number;
	ratingAvg: string;
	ratingCount: number;
}

async function getRestaurants(): Promise<Restaurant[]> {
	try {
		const res = await fetch(`${API_URL}/restaurants?page=1&limit=12`, {
			next: { revalidate: 120 },
		});
		if (!res.ok) return [];
		const data = await res.json();
		return Array.isArray(data) ? data : (data.data ?? data.restaurants ?? []);
	} catch (error) {
		console.error("Error fetching restaurants:", error);
		return [];
	}
}

async function RestaurantGrid() {
	const restaurants = await getRestaurants();

	if (restaurants.length === 0) {
		return (
			<div className="text-center py-16">
				<p className="text-5xl mb-4">🍽</p>
				<h3 className="text-lg font-semibold text-gray-800 mb-2">
					No restaurants available yet
				</h3>
				<p className="text-gray-500 text-sm">
					Check back soon — more restaurants are joining every day.
				</p>
			</div>
		);
	}

	return (
		<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
			{restaurants.map((r) => (
				<RestaurantCard
					key={r.id}
					id={r.id}
					name={r.name}
					description={r.description}
					logoUrl={r.logoUrl}
					bannerUrl={r.bannerUrl}
					city={r.city}
					ratingAvg={r.ratingAvg}
					ratingCount={r.ratingCount}
					estimatedPrepTime={r.estimatedPrepTime}
					isOpen={r.isOpen}
				/>
			))}
		</div>
	);
}

function RestaurantGridSkeleton() {
	return (
		<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
			{Array.from({ length: 8 }).map((_, i) => (
				<RestaurantCardSkeleton key={i} />
			))}
		</div>
	);
}

export default function Page() {
	return (
		<div className="min-h-screen bg-gray-50">
			<main>
				<HeroBanner />
				<div className="max-w-7xl mx-auto px-4 sm:px-6">
					<PromoBanners />
					<CategoryFilter />
					<div className="flex items-center justify-between mb-5">
						<div>
							<h2 className="text-2xl font-bold text-gray-900">
								Restaurants near you
							</h2>
							<p className="text-sm text-gray-500 mt-0.5">
								Delivering to Lagos, Nigeria
							</p>
						</div>
						<button className="text-sm font-medium text-brand hover:underline">
							See all →
						</button>
					</div>
					<Suspense fallback={<RestaurantGridSkeleton />}>
						<RestaurantGrid />
					</Suspense>
					<div className="h-16" />
				</div>
			</main>
		</div>
	);
}
