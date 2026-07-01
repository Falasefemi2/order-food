"use client";

import * as Effect from "effect/Effect";
import {
	Bell,
	ChevronRight,
	Clock,
	MapPin,
	Package,
	ShoppingBag,
	Star,
	UtensilsCrossed,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { CustomerPageHeader } from "@/components/customer/customer-page-header";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { AuthApi } from "@/lib/auth/auth-api";
import { AddressApi } from "@/lib/customer/address-api";
import { OrderApi, type OrderSummaryResponseType } from "@/lib/order-api";
import { runtime } from "@/lib/runtime";

interface UserProfile {
	id: string;
	email: string;
	firstName: string;
	lastName: string;
	role: string;
	walletBalance: string;
	avatarUrl: string | null;
	createdAt: string;
}

const quickActions = [
	{
		href: "/customer/orders",
		icon: Package,
		label: "My orders",
		desc: "Track & reorder",
		color: "bg-orange-50 text-orange-600",
	},
	{
		href: "/customer/addresses",
		icon: MapPin,
		label: "Addresses",
		desc: "Delivery locations",
		color: "bg-blue-50 text-blue-600",
	},
	{
		href: "/customer/profile",
		icon: Star,
		label: "Profile",
		desc: "Edit your info",
		color: "bg-purple-50 text-purple-600",
	},
	{
		href: "/customer/restaurants",
		icon: UtensilsCrossed,
		label: "Order food",
		desc: "Browse restaurants",
		color: "bg-brand/10 text-brand",
	},
];

export default function CustomerDashboard() {
	const [user, setUser] = useState<UserProfile | null>(null);
	const [recentOrders, setRecentOrders] = useState<
		readonly OrderSummaryResponseType[]
	>([]);
	const [loading, setLoading] = useState(true);
	const [ordersLoading, setOrdersLoading] = useState(true);

	useEffect(() => {
		runtime
			.runPromise(
				Effect.gen(function* () {
					const auth = yield* AuthApi;
					return yield* auth.me();
				}),
			)
			.then(setUser)
			.catch(console.error)
			.finally(() => setLoading(false));
	}, []);

	useEffect(() => {
		setOrdersLoading(true);
		runtime
			.runPromise(
				Effect.gen(function* () {
					const api = yield* OrderApi;
					return yield* api.listMyOrders();
				}),
			)
			.then((response) => setRecentOrders(response.orders.slice(0, 3)))
			.catch(() => setRecentOrders([]))
			.finally(() => setOrdersLoading(false));
	}, []);

	const initials = user
		? `${user.firstName[0]}${user.lastName[0]}`.toUpperCase()
		: "??";

	const greeting = () => {
		const h = new Date().getHours();
		if (h < 12) return "Good morning";
		if (h < 17) return "Good afternoon";
		return "Good evening";
	};

	return (
		<div className="min-h-screen bg-gray-50">
			<CustomerPageHeader title="Dashboard" />
			<div className="bg-linear-to-br from-brand to-brand-dark sticky top-0 z-20">
				<div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
					<div className="flex items-center gap-3">
						<Link href="/customer/profile">
							<Avatar className="w-10 h-10 border-2 border-white/30">
								<AvatarImage src={user?.avatarUrl ?? undefined} />
								<AvatarFallback className="bg-white/20 text-white font-semibold text-sm">
									{loading ? "…" : initials}
								</AvatarFallback>
							</Avatar>
						</Link>
						<div>
							<p className="text-white/70 text-xs">{greeting()}</p>
							{loading ? (
								<div className="h-4 w-24 bg-white/20 rounded animate-pulse mt-0.5" />
							) : (
								<p className="text-white font-semibold text-sm leading-tight">
									{user?.firstName} {user?.lastName}
								</p>
							)}
						</div>
					</div>

					<Link href="/customer/orders" className="relative">
						<div className="w-9 h-9 rounded-full bg-white/15 flex items-center justify-center">
							<Bell size={18} className="text-white" />
						</div>
						<span className="absolute top-0 right-0 w-2.5 h-2.5 bg-yellow-400 rounded-full border-2 border-brand" />
					</Link>
				</div>

				<div className="max-w-2xl mx-auto px-4 pb-5">
					<div className="bg-white/10 backdrop-blur-sm rounded-2xl px-4 py-3 flex items-center justify-between">
						<div>
							<p className="text-white/60 text-xs">Wallet balance</p>
							{loading ? (
								<div className="h-6 w-20 bg-white/20 rounded animate-pulse mt-1" />
							) : (
								<p className="text-white text-xl font-bold">
									₦
									{parseFloat(user?.walletBalance ?? "0").toLocaleString(
										"en-NG",
										{ minimumFractionDigits: 2 },
									)}
								</p>
							)}
						</div>
						<Button
							asChild
							size="sm"
							className="bg-white text-brand hover:bg-white/90 font-semibold text-xs"
						>
							<Link href="/customer/wallet">Top up</Link>
						</Button>
					</div>
				</div>
			</div>

			<div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
				<div className="grid grid-cols-2 gap-3">
					{quickActions.map((a) => (
						<Link key={a.href} href={a.href}>
							<Card className="border-border/60 hover:shadow-md transition-shadow cursor-pointer">
								<CardContent className="p-4 flex items-center gap-3">
									<div
										className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${a.color}`}
									>
										<a.icon size={18} />
									</div>
									<div className="min-w-0">
										<p className="font-semibold text-foreground text-sm leading-tight">
											{a.label}
										</p>
										<p className="text-xs text-muted-foreground mt-0.5">
											{a.desc}
										</p>
									</div>
								</CardContent>
							</Card>
						</Link>
					))}
				</div>

				<Separator />

				<div>
					<div className="flex items-center justify-between mb-4">
						<h2 className="font-bold text-foreground">Recent orders</h2>
						<Link
							href="/customer/orders"
							className="text-xs text-brand font-medium hover:underline flex items-center gap-0.5"
						>
							See all <ChevronRight size={13} />
						</Link>
					</div>

					{ordersLoading ? (
						<div className="space-y-3">
							{[1, 2, 3].map((i) => (
								<div
									key={i}
									className="h-16 bg-muted rounded-xl animate-pulse"
								/>
							))}
						</div>
					) : recentOrders.length === 0 ? (
						<Card className="border-border/60">
							<CardContent className="py-12 flex flex-col items-center text-center">
								<div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center mb-3">
									<ShoppingBag size={24} className="text-muted-foreground/50" />
								</div>
								<p className="font-semibold text-foreground text-sm mb-1">
									No orders yet
								</p>
								<p className="text-xs text-muted-foreground mb-5 max-w-xs">
									Your order history will show up here once you place your first
									order.
								</p>
								<Button asChild size="sm" className="gap-1.5">
									<Link href="/customer/restaurants">
										<UtensilsCrossed size={14} />
										Browse restaurants
									</Link>
								</Button>
							</CardContent>
						</Card>
					) : (
						<div className="space-y-2">
							{recentOrders.map((order) => (
								<Card key={order.id} className="border-border/60">
									<CardContent className="p-3.5">
										<div className="flex items-center justify-between gap-3">
											<div className="min-w-0">
												<p className="text-sm font-semibold text-foreground truncate">
													{order.restaurantName}
												</p>
												<p className="text-xs text-muted-foreground">
													{order.itemCount} items • {order.paymentMethod}
												</p>
											</div>
											<Badge variant="outline" className="shrink-0">
												{order.status}
											</Badge>
										</div>
										<div className="mt-2 flex items-center justify-between">
											<span className="text-xs text-muted-foreground">
												Total
											</span>
											<span className="text-sm font-semibold text-foreground">
												₦{Number(order.totalPrice).toLocaleString()}
											</span>
										</div>
									</CardContent>
								</Card>
							))}
						</div>
					)}
				</div>

				<Separator />

				<div>
					<div className="flex items-center justify-between mb-4">
						<h2 className="font-bold text-foreground">Delivery addresses</h2>
						<Link
							href="/customer/addresses"
							className="text-xs text-brand font-medium hover:underline flex items-center gap-0.5"
						>
							Manage <ChevronRight size={13} />
						</Link>
					</div>

					<AddressPreview />
				</div>

				{!loading && !user?.avatarUrl && (
					<>
						<Separator />
						<Card className="border-brand/20 bg-brand/5">
							<CardContent className="p-4 flex items-center gap-4">
								<div className="w-10 h-10 rounded-full bg-brand/10 flex items-center justify-center shrink-0">
									<Clock size={18} className="text-brand" />
								</div>
								<div className="flex-1 min-w-0">
									<p className="font-semibold text-sm text-foreground">
										Complete your profile
									</p>
									<p className="text-xs text-muted-foreground mt-0.5">
										Add a photo to personalise your account.
									</p>
								</div>
								<Button
									asChild
									size="sm"
									variant="outline"
									className="shrink-0"
								>
									<Link href="/customer/profile">Set up</Link>
								</Button>
							</CardContent>
						</Card>
					</>
				)}
			</div>
		</div>
	);
}

function AddressPreview() {
	const [addresses, setAddresses] = useState<
		{ id: string; label: string; addressLine1: string; isDefault: boolean }[]
	>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		runtime
			.runPromise(
				Effect.gen(function* () {
					const api = yield* AddressApi;
					return yield* api.list();
				}),
			)
			.then((list) => setAddresses(list.slice(0, 2)))
			.catch(() => setAddresses([]))
			.finally(() => setLoading(false));
	}, []);

	if (loading) {
		return (
			<div className="space-y-2">
				{[1, 2].map((i) => (
					<div key={i} className="h-16 bg-muted rounded-xl animate-pulse" />
				))}
			</div>
		);
	}

	if (addresses.length === 0) {
		return (
			<Card className="border-border/60">
				<CardContent className="py-8 flex flex-col items-center text-center">
					<MapPin size={28} className="text-muted-foreground/40 mb-2" />
					<p className="text-sm font-medium text-foreground mb-1">
						No addresses saved
					</p>
					<p className="text-xs text-muted-foreground mb-4">
						Add a delivery address to speed up checkout.
					</p>
					<Button asChild size="sm" variant="outline">
						<Link href="/customer/addresses">Add address</Link>
					</Button>
				</CardContent>
			</Card>
		);
	}

	return (
		<div className="space-y-2">
			{addresses.map((a) => (
				<Link key={a.id} href="/customer/addresses">
					<Card className="border-border/60 hover:shadow-sm transition-shadow cursor-pointer">
						<CardContent className="p-3.5 flex items-center gap-3">
							<div
								className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
									a.isDefault
										? "bg-brand text-white"
										: "bg-muted text-muted-foreground"
								}`}
							>
								<MapPin size={14} />
							</div>
							<div className="flex-1 min-w-0">
								<p className="text-sm font-medium text-foreground truncate">
									{a.label || "Home"}
								</p>
								<p className="text-xs text-muted-foreground truncate">
									{a.addressLine1}
								</p>
							</div>
							{a.isDefault && (
								<Badge
									variant="outline"
									className="text-xs text-brand border-brand/30 shrink-0"
								>
									Default
								</Badge>
							)}
						</CardContent>
					</Card>
				</Link>
			))}
		</div>
	);
}
