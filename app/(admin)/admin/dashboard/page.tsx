"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as Effect from "effect/Effect";
import { Building2, Check, CircleDollarSign, Store, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { CustomerPageHeader } from "@/components/customer/customer-page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { AdminApi } from "@/lib/admin-api";
import { queryKeys } from "@/lib/queryKeys";
import { runApi } from "@/lib/runtime";

export default function AdminDashboardPage() {
	const queryClient = useQueryClient();
	const [busyIds, setBusyIds] = useState<string[]>([]);

	const {
		data: pendingRestaurants = [],
		isLoading: pendingRestaurantsLoading,
	} = useQuery({
		queryKey: queryKeys.admin.pendingRestaurants,
		queryFn: () =>
			runApi(
				Effect.gen(function* () {
					const admin = yield* AdminApi;
					return yield* admin.listPendingRestaurants();
				}),
			),
	});

	const { data: restaurants = [], isLoading: restaurantsLoading } = useQuery({
		queryKey: queryKeys.admin.allRestaurants,
		queryFn: () =>
			runApi(
				Effect.gen(function* () {
					const admin = yield* AdminApi;
					return yield* admin.listAllRestaurants();
				}),
			),
	});

	const { data: pendingDrivers = [], isLoading: pendingDriversLoading } =
		useQuery({
			queryKey: queryKeys.admin.pendingDrivers,
			queryFn: () =>
				runApi(
					Effect.gen(function* () {
						const admin = yield* AdminApi;
						return yield* admin.listPendingDrivers();
					}),
				),
		});

	const { data: users = [], isLoading: usersLoading } = useQuery({
		queryKey: queryKeys.admin.users,
		queryFn: () =>
			runApi(
				Effect.gen(function* () {
					const admin = yield* AdminApi;
					return yield* admin.listUsers();
				}),
			),
	});

	const loading =
		pendingRestaurantsLoading ||
		restaurantsLoading ||
		pendingDriversLoading ||
		usersLoading;

	const approveRestaurantMutation = useMutation({
		mutationFn: (id: string) =>
			runApi(
				Effect.gen(function* () {
					const admin = yield* AdminApi;
					return yield* admin.approveRestaurant(id);
				}),
			),
		onSuccess: () => {
			toast.success("Restaurant approved");
			queryClient.invalidateQueries({
				queryKey: queryKeys.admin.pendingRestaurants,
			});
			queryClient.invalidateQueries({
				queryKey: queryKeys.admin.allRestaurants,
			});
		},
		onError: () => {
			toast.error("Unable to approve restaurant");
		},
	});

	const rejectRestaurantMutation = useMutation({
		mutationFn: (id: string) =>
			runApi(
				Effect.gen(function* () {
					const admin = yield* AdminApi;
					return yield* admin.rejectRestaurant(id, "Rejected by admin");
				}),
			),
		onSuccess: () => {
			toast.success("Restaurant rejected");
			queryClient.invalidateQueries({
				queryKey: queryKeys.admin.pendingRestaurants,
			});
			queryClient.invalidateQueries({
				queryKey: queryKeys.admin.allRestaurants,
			});
		},
		onError: () => {
			toast.error("Unable to reject restaurant");
		},
	});

	const approveDriverMutation = useMutation({
		mutationFn: (id: string) =>
			runApi(
				Effect.gen(function* () {
					const admin = yield* AdminApi;
					return yield* admin.approveDriver(id);
				}),
			),
		onSuccess: () => {
			toast.success("Driver approved");
			queryClient.invalidateQueries({
				queryKey: queryKeys.admin.pendingDrivers,
			});
			queryClient.invalidateQueries({ queryKey: queryKeys.admin.users });
		},
		onError: () => {
			toast.error("Unable to approve driver");
		},
	});

	const rejectDriverMutation = useMutation({
		mutationFn: (id: string) =>
			runApi(
				Effect.gen(function* () {
					const admin = yield* AdminApi;
					return yield* admin.rejectDriver(id, "Rejected by admin");
				}),
			),
		onSuccess: () => {
			toast.success("Driver rejected");
			queryClient.invalidateQueries({
				queryKey: queryKeys.admin.pendingDrivers,
			});
		},
		onError: () => {
			toast.error("Unable to reject driver");
		},
	});

	const deactivateUserMutation = useMutation({
		mutationFn: (id: string) =>
			runApi(
				Effect.gen(function* () {
					const admin = yield* AdminApi;
					return yield* admin.deactivateUser(id);
				}),
			),
		onSuccess: () => {
			toast.success("User deactivated");
			queryClient.invalidateQueries({ queryKey: queryKeys.admin.users });
		},
		onError: () => {
			toast.error("Unable to deactivate user");
		},
	});

	const reactivateUserMutation = useMutation({
		mutationFn: (id: string) =>
			runApi(
				Effect.gen(function* () {
					const admin = yield* AdminApi;
					return yield* admin.reactivateUser(id);
				}),
			),
		onSuccess: () => {
			toast.success("User reactivated");
			queryClient.invalidateQueries({ queryKey: queryKeys.admin.users });
		},
		onError: () => {
			toast.error("Unable to reactivate user");
		},
	});

	const handleApproveRestaurant = async (id: string) => {
		setBusyIds((prev) => [...prev, `restaurant-${id}`]);
		try {
			await approveRestaurantMutation.mutateAsync(id);
		} catch {
		} finally {
			setBusyIds((prev) => prev.filter((item) => item !== `restaurant-${id}`));
		}
	};

	const handleRejectRestaurant = async (id: string) => {
		setBusyIds((prev) => [...prev, `restaurant-reject-${id}`]);
		try {
			await rejectRestaurantMutation.mutateAsync(id);
		} catch {
		} finally {
			setBusyIds((prev) =>
				prev.filter((item) => item !== `restaurant-reject-${id}`),
			);
		}
	};

	const handleApproveDriver = async (id: string) => {
		setBusyIds((prev) => [...prev, `driver-${id}`]);
		try {
			await approveDriverMutation.mutateAsync(id);
		} catch {
		} finally {
			setBusyIds((prev) => prev.filter((item) => item !== `driver-${id}`));
		}
	};

	const handleRejectDriver = async (id: string) => {
		setBusyIds((prev) => [...prev, `driver-reject-${id}`]);
		try {
			await rejectDriverMutation.mutateAsync(id);
		} catch {
		} finally {
			setBusyIds((prev) =>
				prev.filter((item) => item !== `driver-reject-${id}`),
			);
		}
	};

	const handleDeactivateUser = async (id: string) => {
		setBusyIds((prev) => [...prev, `user-${id}`]);
		try {
			await deactivateUserMutation.mutateAsync(id);
		} catch {
		} finally {
			setBusyIds((prev) => prev.filter((item) => item !== `user-${id}`));
		}
	};

	const handleReactivateUser = async (id: string) => {
		setBusyIds((prev) => [...prev, `user-reactivate-${id}`]);
		try {
			await reactivateUserMutation.mutateAsync(id);
		} catch {
		} finally {
			setBusyIds((prev) =>
				prev.filter((item) => item !== `user-reactivate-${id}`),
			);
		}
	};

	return (
		<div className="min-h-screen bg-gray-50">
			<CustomerPageHeader title="Admin dashboard" />

			<main className="mx-auto max-w-6xl px-4 py-6">
				<section className="rounded-3xl bg-linear-to-br from-brand to-brand-dark px-5 py-6 text-white shadow-lg">
					<div className="flex items-center justify-between gap-3">
						<div>
							<p className="text-xs uppercase tracking-[0.28em] text-white/60">
								Admin portal
							</p>
							<h1 className="mt-2 text-2xl font-bold">Operations dashboard</h1>
						</div>
						<Badge className="border-white/20 bg-white/10 text-white hover:bg-white/10">
							Administrator
						</Badge>
					</div>

					<div className="mt-5 grid gap-3 md:grid-cols-3">
						<div className="rounded-2xl bg-white/10 px-4 py-3">
							<p className="text-[10px] uppercase tracking-[0.28em] text-white/60">
								Pending restaurants
							</p>
							<p className="mt-2 text-sm font-semibold">
								{loading ? "—" : pendingRestaurants.length}
							</p>
						</div>

						<div className="rounded-2xl bg-white/10 px-4 py-3">
							<p className="text-[10px] uppercase tracking-[0.28em] text-white/60">
								Pending drivers
							</p>
							<p className="mt-2 text-sm font-semibold">
								{loading ? "—" : pendingDrivers.length}
							</p>
						</div>

						<div className="rounded-2xl bg-white/10 px-4 py-3">
							<p className="text-[10px] uppercase tracking-[0.28em] text-white/60">
								Total users
							</p>
							<p className="mt-2 text-sm font-semibold">
								{loading ? "—" : users.length}
							</p>
						</div>
					</div>
				</section>

				<div className="mt-6 grid gap-6 lg:grid-cols-2">
					<section className="rounded-3xl bg-white p-5 shadow-sm">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm font-semibold text-foreground">
									Pending restaurants
								</p>
								<p className="text-xs text-muted-foreground">
									Approve or reject new vendor restaurants.
								</p>
							</div>
							<Badge variant="outline">
								{pendingRestaurants.length} pending
							</Badge>
						</div>

						<div className="mt-4 space-y-3">
							{loading ? (
								Array.from({ length: 3 }).map((_, index) => (
									<div
										key={index}
										className="h-24 animate-pulse rounded-2xl bg-muted"
									/>
								))
							) : pendingRestaurants.length === 0 ? (
								<div className="rounded-2xl border border-dashed border-muted-foreground/20 px-4 py-8 text-center">
									<p className="text-sm font-semibold text-foreground">
										No pending restaurants
									</p>
								</div>
							) : (
								pendingRestaurants.map((restaurant) => (
									<Card key={restaurant.id} className="border-border/60">
										<CardContent className="p-4">
											<div className="flex items-center justify-between gap-3">
												<div>
													<p className="text-sm font-semibold text-foreground">
														{restaurant.name}
													</p>
													<p className="text-xs text-muted-foreground">
														{restaurant.ownerName} • {restaurant.city}
													</p>
												</div>
												<Badge variant="outline">
													{restaurant.approvalStatus}
												</Badge>
											</div>

											<div className="mt-3 flex gap-2">
												<Button
													size="sm"
													onClick={() =>
														void handleApproveRestaurant(restaurant.id)
													}
													disabled={busyIds.includes(
														`restaurant-${restaurant.id}`,
													)}
												>
													<Check size={14} />
													Approve
												</Button>

												<Button
													variant="outline"
													size="sm"
													onClick={() =>
														void handleRejectRestaurant(restaurant.id)
													}
													disabled={busyIds.includes(
														`restaurant-reject-${restaurant.id}`,
													)}
												>
													<X size={14} />
													Reject
												</Button>
											</div>
										</CardContent>
									</Card>
								))
							)}
						</div>
					</section>

					<section className="rounded-3xl bg-white p-5 shadow-sm">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm font-semibold text-foreground">
									Pending drivers
								</p>
								<p className="text-xs text-muted-foreground">
									Review driver verification submissions.
								</p>
							</div>
							<Badge variant="outline">{pendingDrivers.length} pending</Badge>
						</div>

						<div className="mt-4 space-y-3">
							{loading ? (
								Array.from({ length: 3 }).map((_, index) => (
									<div
										key={index}
										className="h-24 animate-pulse rounded-2xl bg-muted"
									/>
								))
							) : pendingDrivers.length === 0 ? (
								<div className="rounded-2xl border border-dashed border-muted-foreground/20 px-4 py-8 text-center">
									<p className="text-sm font-semibold text-foreground">
										No pending drivers
									</p>
								</div>
							) : (
								pendingDrivers.map((driver) => (
									<Card key={driver.id} className="border-border/60">
										<CardContent className="p-4">
											<div className="flex items-center justify-between gap-3">
												<div>
													<p className="text-sm font-semibold text-foreground">
														{driver.user.firstName} {driver.user.lastName}
													</p>
													<p className="text-xs text-muted-foreground">
														{driver.user.email} • {driver.vehicleType}
													</p>
												</div>
												<Badge variant="outline">{driver.approvalStatus}</Badge>
											</div>

											<div className="mt-3 flex gap-2">
												<Button
													size="sm"
													onClick={() => void handleApproveDriver(driver.id)}
													disabled={busyIds.includes(`driver-${driver.id}`)}
												>
													<Check size={14} />
													Approve
												</Button>

												<Button
													variant="outline"
													size="sm"
													onClick={() => void handleRejectDriver(driver.id)}
													disabled={busyIds.includes(
														`driver-reject-${driver.id}`,
													)}
												>
													<X size={14} />
													Reject
												</Button>
											</div>
										</CardContent>
									</Card>
								))
							)}
						</div>
					</section>
				</div>

				<Separator className="my-6" />

				<section className="rounded-3xl bg-white p-5 shadow-sm">
					<div className="flex items-center justify-between">
						<div>
							<p className="text-sm font-semibold text-foreground">
								Restaurants
							</p>
							<p className="text-xs text-muted-foreground">
								Overview of all listed restaurants.
							</p>
						</div>
						<Badge variant="outline">{restaurants.length} total</Badge>
					</div>

					<div className="mt-4 grid gap-3 md:grid-cols-2">
						{restaurants.map((restaurant) => (
							<Card key={restaurant.id} className="border-border/60">
								<CardContent className="p-4">
									<div className="flex items-start justify-between gap-3">
										<div>
											<p className="text-sm font-semibold text-foreground">
												{restaurant.name}
											</p>
											<p className="text-xs text-muted-foreground">
												{restaurant.ownerEmail}
											</p>
										</div>
										<Badge variant="outline">{restaurant.approvalStatus}</Badge>
									</div>

									<div className="mt-3 grid gap-2 text-xs text-muted-foreground">
										<div className="flex items-center gap-2">
											<Store size={14} />
											<span>{restaurant.city}</span>
										</div>
										<div className="flex items-center gap-2">
											<CircleDollarSign size={14} />
											<span>{restaurant.commissionRate}% commission</span>
										</div>
									</div>
								</CardContent>
							</Card>
						))}
					</div>
				</section>

				<Separator className="my-6" />

				<section className="rounded-3xl bg-white p-5 shadow-sm">
					<div className="flex items-center justify-between">
						<div>
							<p className="text-sm font-semibold text-foreground">Users</p>
							<p className="text-xs text-muted-foreground">
								Manage user activity and access.
							</p>
						</div>
						<Badge variant="outline">{users.length} users</Badge>
					</div>

					<div className="mt-4 space-y-3">
						{users.map((user) => (
							<Card key={user.id} className="border-border/60">
								<CardContent className="p-4">
									<div className="flex items-center justify-between gap-3">
										<div>
											<p className="text-sm font-semibold text-foreground">
												{user.firstName} {user.lastName}
											</p>
											<p className="text-xs text-muted-foreground">
												{user.email}
											</p>
										</div>
										<Badge variant="outline">{user.role}</Badge>
									</div>

									<div className="mt-3 flex items-center justify-between gap-3">
										<div className="flex items-center gap-2 text-xs text-muted-foreground">
											<Building2 size={14} />
											<span>{user.isActive ? "Active" : "Inactive"}</span>
										</div>

										{user.isActive ? (
											<Button
												size="sm"
												variant="outline"
												onClick={() => void handleDeactivateUser(user.id)}
												disabled={busyIds.includes(`user-${user.id}`)}
											>
												Deactivate
											</Button>
										) : (
											<Button
												size="sm"
												onClick={() => void handleReactivateUser(user.id)}
												disabled={busyIds.includes(
													`user-reactivate-${user.id}`,
												)}
											>
												Reactivate
											</Button>
										)}
									</div>
								</CardContent>
							</Card>
						))}
					</div>
				</section>
			</main>
		</div>
	);
}
