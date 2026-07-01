"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
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
import { useState } from "react";
import { toast } from "sonner";
import { CustomerPageHeader } from "@/components/customer/customer-page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { AuthApi } from "@/lib/auth/auth-api";
import { OrderApi } from "@/lib/order-api";
import { queryKeys } from "@/lib/queryKeys";
import { RestaurantApi } from "@/lib/restaurant-api";
import { runApi } from "@/lib/runtime";

export default function VendorDashboardPage() {
	const queryClient = useQueryClient();
	const [processingOrderIds, setProcessingOrderIds] = useState<string[]>([]);

	const { data: user, isLoading: userLoading } = useQuery({
		queryKey: queryKeys.user.me,
		queryFn: () =>
			runApi(
				Effect.gen(function* () {
					const auth = yield* AuthApi;
					return yield* auth.me();
				}),
			),
	});

	const { data: restaurant, isLoading: restaurantLoading } = useQuery({
		queryKey: queryKeys.restaurant.myRestaurant,
		queryFn: () =>
			runApi(
				Effect.gen(function* () {
					const restaurantApi = yield* RestaurantApi;
					return yield* restaurantApi.getMyRestaurant();
				}),
			).catch(() => null),
	});

	const restaurantId = restaurant?.id;

	const { data: orders = [], isLoading: ordersLoading } = useQuery({
		queryKey: queryKeys.orders.restaurantOrders(restaurantId ?? ""),
		queryFn: () =>
			runApi(
				Effect.gen(function* () {
					const api = yield* OrderApi;
					return yield* api.listRestaurantOrders(restaurantId!);
				}),
			),
		enabled: !!restaurantId,
	});

	const loading = userLoading || restaurantLoading;

	const acceptOrderMutation = useMutation({
		mutationFn: (orderId: string) =>
			runApi(
				Effect.gen(function* () {
					const api = yield* OrderApi;
					return yield* api.acceptOrder(orderId, restaurantId!);
				}),
			),
		onSuccess: () => {
			toast.success("Order accepted");
			queryClient.invalidateQueries({
				queryKey: queryKeys.orders.restaurantOrders(restaurantId!),
			});
		},
		onError: () => {
			toast.error("Unable to accept this order right now.");
		},
	});

	const rejectOrderMutation = useMutation({
		mutationFn: (orderId: string) =>
			runApi(
				Effect.gen(function* () {
					const api = yield* OrderApi;
					return yield* api.rejectOrder(
						orderId,
						restaurantId!,
						"Vendor rejected the order",
					);
				}),
			),
		onSuccess: () => {
			toast.success("Order rejected");
			queryClient.invalidateQueries({
				queryKey: queryKeys.orders.restaurantOrders(restaurantId!),
			});
		},
		onError: () => {
			toast.error("Unable to reject this order right now.");
		},
	});

	const markPreparingMutation = useMutation({
		mutationFn: (orderId: string) =>
			runApi(
				Effect.gen(function* () {
					const api = yield* OrderApi;
					return yield* api.markPreparing(orderId, restaurantId!);
				}),
			),
		onSuccess: () => {
			toast.success("Order marked as preparing");
			queryClient.invalidateQueries({
				queryKey: queryKeys.orders.restaurantOrders(restaurantId!),
			});
		},
		onError: () => {
			toast.error("Unable to update the order status right now.");
		},
	});

	const markReadyForPickupMutation = useMutation({
		mutationFn: (orderId: string) =>
			runApi(
				Effect.gen(function* () {
					const api = yield* OrderApi;
					return yield* api.markReadyForPickup(orderId, restaurantId!);
				}),
			),
		onSuccess: () => {
			toast.success("Order marked as ready for pickup");
			queryClient.invalidateQueries({
				queryKey: queryKeys.orders.restaurantOrders(restaurantId!),
			});
		},
		onError: () => {
			toast.error("Unable to update the order status right now.");
		},
	});

	const handleAcceptOrder = async (orderId: string) => {
		if (!restaurantId) return;
		setProcessingOrderIds((prev) => [...prev, orderId]);
		try {
			await acceptOrderMutation.mutateAsync(orderId);
		} catch {
		} finally {
			setProcessingOrderIds((prev) => prev.filter((id) => id !== orderId));
		}
	};

	const handleRejectOrder = async (orderId: string) => {
		if (!restaurantId) return;
		setProcessingOrderIds((prev) => [...prev, orderId]);
		try {
			await rejectOrderMutation.mutateAsync(orderId);
		} catch {
		} finally {
			setProcessingOrderIds((prev) => prev.filter((id) => id !== orderId));
		}
	};

	const handleMarkPreparing = async (orderId: string) => {
		if (!restaurantId) return;
		setProcessingOrderIds((prev) => [...prev, orderId]);
		try {
			await markPreparingMutation.mutateAsync(orderId);
		} catch {
		} finally {
			setProcessingOrderIds((prev) => prev.filter((id) => id !== orderId));
		}
	};

	const handleMarkReadyForPickup = async (orderId: string) => {
		if (!restaurantId) return;
		setProcessingOrderIds((prev) => [...prev, orderId]);
		try {
			await markReadyForPickupMutation.mutateAsync(orderId);
		} catch {
		} finally {
			setProcessingOrderIds((prev) => prev.filter((id) => id !== orderId));
		}
	};

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

				<Card className="mt-6 border-border/60">
					<CardContent className="p-5">
						<div className="flex items-center justify-between gap-3">
							<div>
								<p className="text-sm font-semibold text-foreground">
									Orders queue
								</p>
								<p className="text-xs text-muted-foreground">
									{restaurant
										? "Incoming orders for your restaurant"
										: "Set up a restaurant to see incoming orders"}
								</p>
							</div>
							{restaurant ? (
								<Button
									variant="outline"
									size="sm"
									onClick={() => loadOrders(restaurant.id)}
									disabled={ordersLoading}
								>
									Refresh
								</Button>
							) : null}
						</div>

						{!restaurant ? (
							<div className="mt-4 rounded-2xl border border-dashed border-brand/30 bg-brand/5 px-4 py-5 text-sm text-muted-foreground">
								Create your restaurant listing to start receiving orders.
							</div>
						) : ordersLoading ? (
							<div className="mt-4 space-y-3">
								{[1, 2].map((i) => (
									<div
										key={i}
										className="h-20 animate-pulse rounded-2xl bg-muted"
									/>
								))}
							</div>
						) : orders.length === 0 ? (
							<div className="mt-4 rounded-2xl bg-muted/50 px-4 py-5 text-sm text-muted-foreground">
								No orders yet.
							</div>
						) : (
							<div className="mt-4 space-y-3">
								{orders.map((order) => (
									<div
										key={order.id}
										className="rounded-2xl border border-border/60 bg-muted/20 p-4"
									>
										<div className="flex items-start justify-between gap-3">
											<div>
												<p className="text-sm font-semibold text-foreground">
													Order #{order.id.slice(0, 8)}
												</p>
												<p className="text-xs text-muted-foreground">
													{order.itemCount} items • {order.paymentMethod}
												</p>
											</div>
											<Badge variant="outline" className="shrink-0">
												{order.status}
											</Badge>
										</div>

										<div className="mt-3 flex items-center justify-between gap-3">
											<span className="text-sm font-semibold text-foreground">
												₦{Number(order.totalPrice).toLocaleString()}
											</span>
											<div className="flex flex-wrap justify-end gap-2">
												{["pending", "placed"].includes(
													order.status.toLowerCase(),
												) ? (
													<>
														<Button
															size="sm"
															onClick={() => handleAcceptOrder(order.id)}
															disabled={processingOrderIds.includes(order.id)}
														>
															Accept
														</Button>
														<Button
															variant="outline"
															size="sm"
															onClick={() => handleRejectOrder(order.id)}
															disabled={processingOrderIds.includes(order.id)}
														>
															Reject
														</Button>
													</>
												) : null}

												{order.status.toLowerCase() === "accepted" ? (
													<Button
														size="sm"
														onClick={() => handleMarkPreparing(order.id)}
														disabled={processingOrderIds.includes(order.id)}
													>
														Mark preparing
													</Button>
												) : null}

												{order.status.toLowerCase() === "preparing" ? (
													<Button
														size="sm"
														onClick={() => handleMarkReadyForPickup(order.id)}
														disabled={processingOrderIds.includes(order.id)}
													>
														Mark ready for pickup
													</Button>
												) : null}
											</div>
										</div>
									</div>
								))}
							</div>
						)}
					</CardContent>
				</Card>
			</main>
		</div>
	);
}
