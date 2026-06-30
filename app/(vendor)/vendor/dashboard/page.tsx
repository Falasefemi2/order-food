"use client";

import * as Effect from "effect/Effect";
import {
	Building2,
	Clock3,
	MapPin,
	Store,
	UserRound,
	UtensilsCrossed,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { CustomerPageHeader } from "@/components/customer/customer-page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { AuthApi } from "@/lib/auth/auth-api";
import type { UserProfile } from "@/lib/auth/auth-schema";
import {
	RestaurantApi,
	type RestaurantResponseType,
} from "@/lib/restaurant-api";
import { runtime } from "@/lib/runtime";

export default function VendorDashboardPage() {
	const [user, setUser] = useState<UserProfile | null>(null);
	const [restaurant, setRestaurant] = useState<RestaurantResponseType | null>(
		null,
	);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const loadData = async () => {
			setLoading(true);
			try {
				const [profile, restaurantData] = await Promise.all([
					runtime.runPromise(
						Effect.gen(function* () {
							const auth = yield* AuthApi;
							return yield* auth.me();
						}),
					),
					runtime
						.runPromise(
							Effect.gen(function* () {
								const restaurantApi = yield* RestaurantApi;
								return yield* restaurantApi.getMyRestaurant();
							}),
						)
						.catch(() => null),
				]);

				setUser(profile);
				setRestaurant(restaurantData);
			} finally {
				setLoading(false);
			}
		};

		loadData();
	}, []);

	const quickActions = [
		{
			href: "/vendor/restaurant",
			icon: Store,
			label: restaurant ? "Manage restaurant" : "Create restaurant",
			desc: restaurant
				? "Update your restaurant details"
				: "Set up your restaurant listing",
			color: "bg-brand/10 text-brand",
		},
		{
			href: "/vendor/restaurant/menu",
			icon: UtensilsCrossed,
			label: "Menu management",
			desc: "Add dishes, categories, and item customizations",
			color: "bg-orange-50 text-orange-600",
		},
		{
			href: "/vendor/profile",
			icon: UserRound,
			label: "Profile",
			desc: "Update your vendor account",
			color: "bg-purple-50 text-purple-600",
		},
	];

	return (
		<div className="min-h-screen bg-gray-50">
			<CustomerPageHeader title="Vendor dashboard" />

			<main className="mx-auto max-w-4xl px-4 py-6">
				<section className="rounded-3xl bg-linear-to-br from-brand to-brand-dark px-5 py-6 text-white shadow-lg">
					<div className="flex items-start justify-between gap-4">
						<div>
							<p className="text-xs uppercase tracking-[0.32em] text-white/60">
								Vendor portal
							</p>
							<h1 className="mt-2 text-2xl font-bold">
								{loading
									? "Loading..."
									: `${user?.firstName ?? "Vendor"} ${user?.lastName ?? ""}`.trim()}
							</h1>
						</div>
						<Badge className="border-white/20 bg-white/10 text-white hover:bg-white/10">
							{restaurant?.approvalStatus ?? "Pending setup"}
						</Badge>
					</div>

					<div className="mt-5 grid gap-3 sm:grid-cols-3">
						<div className="rounded-2xl bg-white/10 px-4 py-3">
							<p className="text-[10px] uppercase tracking-[0.28em] text-white/60">
								Restaurant
							</p>
							<p className="mt-2 text-sm font-semibold">
								{restaurant?.name ?? "Not created yet"}
							</p>
						</div>
						<div className="rounded-2xl bg-white/10 px-4 py-3">
							<p className="text-[10px] uppercase tracking-[0.28em] text-white/60">
								Status
							</p>
							<p className="mt-2 text-sm font-semibold">
								{restaurant?.isOpen ? "Open" : "Closed"}
							</p>
						</div>
						<div className="rounded-2xl bg-white/10 px-4 py-3">
							<p className="text-[10px] uppercase tracking-[0.28em] text-white/60">
								City
							</p>
							<p className="mt-2 text-sm font-semibold">
								{restaurant?.city ?? "—"}
							</p>
						</div>
					</div>
				</section>

				<div className="mt-6 grid gap-3 md:grid-cols-2">
					{quickActions.map((action) => {
						const Icon = action.icon;

						return (
							<Link key={action.href} href={action.href}>
								<Card className="border-border/60 transition-shadow hover:shadow-md">
									<CardContent className="flex items-center gap-3 p-4">
										<div
											className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${action.color}`}
										>
											<Icon size={20} />
										</div>
										<div className="min-w-0">
											<p className="text-sm font-semibold text-foreground">
												{action.label}
											</p>
											<p className="mt-1 text-xs text-muted-foreground">
												{action.desc}
											</p>
										</div>
									</CardContent>
								</Card>
							</Link>
						);
					})}
				</div>

				<Separator className="my-6" />

				<Card className="border-border/60">
					<CardContent className="p-5">
						<div className="flex items-center justify-between gap-3">
							<div>
								<p className="text-sm font-semibold text-foreground">
									Restaurant overview
								</p>
								<p className="text-xs text-muted-foreground">
									{restaurant
										? "Your live restaurant listing"
										: "No restaurant created yet"}
								</p>
							</div>
							<Button asChild size="sm">
								<Link href="/vendor/restaurant">
									{restaurant ? "Edit restaurant" : "Set up restaurant"}
								</Link>
							</Button>
						</div>

						{restaurant ? (
							<div className="mt-4 grid gap-3 md:grid-cols-2">
								<div className="rounded-2xl bg-muted/50 px-4 py-3">
									<div className="flex items-center gap-2 text-xs text-muted-foreground">
										<Building2 size={14} />
										Business name
									</div>
									<p className="mt-2 text-sm font-semibold text-foreground">
										{restaurant.name}
									</p>
								</div>
								<div className="rounded-2xl bg-muted/50 px-4 py-3">
									<div className="flex items-center gap-2 text-xs text-muted-foreground">
										<Clock3 size={14} />
										Hours
									</div>
									<p className="mt-2 text-sm font-semibold text-foreground">
										{restaurant.openingTime} – {restaurant.closingTime}
									</p>
								</div>
								<div className="rounded-2xl bg-muted/50 px-4 py-3 md:col-span-2">
									<div className="flex items-center gap-2 text-xs text-muted-foreground">
										<MapPin size={14} />
										Address
									</div>
									<p className="mt-2 text-sm font-semibold text-foreground">
										{restaurant.addressLine}, {restaurant.city},{" "}
										{restaurant.state}
									</p>
								</div>
							</div>
						) : (
							<div className="mt-4 rounded-2xl border border-dashed border-brand/30 bg-brand/5 px-4 py-5 text-sm text-muted-foreground">
								Create your restaurant listing to start receiving orders and
								managing your menu.
							</div>
						)}
					</CardContent>
				</Card>
			</main>
		</div>
	);
}
