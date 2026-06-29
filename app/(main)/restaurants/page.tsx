import { Suspense } from "react";
import { RestaurantCard } from "@/components/restaurants/restaurant-card";
import { RestaurantCardSkeleton } from "@/components/restaurants/restaurant-card-skeleton";
import {
	Pagination,
	PaginationContent,
	PaginationEllipsis,
	PaginationItem,
	PaginationLink,
	PaginationNext,
	PaginationPrevious,
} from "@/components/ui/pagination";

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

interface RestaurantsResponse {
	data: Restaurant[];
	total: number;
	page: number;
	limit: number;
	totalPages: number;
	hasNext: boolean;
	hasPrev: boolean;
}

async function getRestaurants(page: number): Promise<RestaurantsResponse> {
	try {
		const res = await fetch(
			`${API_URL}/restaurants?page=${page}&limit=12&isOpen=true`,
			{ next: { revalidate: 120 } },
		);
		if (!res.ok)
			return {
				data: [],
				total: 0,
				page: 1,
				limit: 12,
				totalPages: 0,
				hasNext: false,
				hasPrev: false,
			};
		return res.json();
	} catch {
		return {
			data: [],
			total: 0,
			page: 1,
			limit: 12,
			totalPages: 0,
			hasNext: false,
			hasPrev: false,
		};
	}
}

async function RestaurantGrid({ page }: { page: number }) {
	const {
		data: restaurants,
		totalPages,
		hasNext,
		hasPrev,
	} = await getRestaurants(page);

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
		<div className="space-y-8">
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

			{totalPages > 1 && (
				<Pagination>
					<PaginationContent>
						<PaginationItem>
							<PaginationPrevious
								href={hasPrev ? `?page=${page - 1}` : undefined}
								aria-disabled={!hasPrev}
								className={!hasPrev ? "pointer-events-none opacity-50" : ""}
							/>
						</PaginationItem>

						{Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => {
							const isNearCurrent =
								p === 1 || p === totalPages || Math.abs(p - page) <= 1;

							if (!isNearCurrent) {
								// Only render one ellipsis per gap
								const prevVisible =
									p - 1 === 1 ||
									p - 1 === totalPages ||
									Math.abs(p - 1 - page) <= 1;
								if (prevVisible) {
									return (
										<PaginationItem key={`ellipsis-${p}`}>
											<PaginationEllipsis />
										</PaginationItem>
									);
								}
								return null;
							}

							return (
								<PaginationItem key={p}>
									<PaginationLink href={`?page=${p}`} isActive={p === page}>
										{p}
									</PaginationLink>
								</PaginationItem>
							);
						})}

						<PaginationItem>
							<PaginationNext
								href={hasNext ? `?page=${page + 1}` : undefined}
								aria-disabled={!hasNext}
								className={!hasNext ? "pointer-events-none opacity-50" : ""}
							/>
						</PaginationItem>
					</PaginationContent>
				</Pagination>
			)}
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

export default async function RestaurantsPage({
	searchParams,
}: {
	searchParams: Promise<{ page?: string }>;
}) {
	const { page: pageParam } = await searchParams;
	const page = Math.max(1, parseInt(pageParam ?? "1", 10) || 1);

	return (
		<div className="min-h-screen bg-gray-50">
			<main>
				<div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
					<div className="flex items-center justify-between mb-6">
						<div>
							<h2 className="text-2xl font-bold text-gray-900">
								Restaurants near you
							</h2>
							<p className="text-sm text-gray-500 mt-0.5">
								Delivering to Lagos, Nigeria
							</p>
						</div>
					</div>

					<Suspense key={page} fallback={<RestaurantGridSkeleton />}>
						<RestaurantGrid page={page} />
					</Suspense>

					<div className="h-16" />
				</div>
			</main>
		</div>
	);
}
