"use client";

import * as Effect from "effect/Effect";
import { Package2, ReceiptText } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { CustomerPageHeader } from "@/components/customer/customer-page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { OrderApi, type OrderSummaryResponseType } from "@/lib/order-api";
import { runtime } from "@/lib/runtime";

export default function CustomerOrdersPage() {
	const [orders, setOrders] = useState<readonly OrderSummaryResponseType[]>([]);
	const [loading, setLoading] = useState(true);
	const [cancellingOrderIds, setCancellingOrderIds] = useState<string[]>([]);

	const loadOrders = () => {
		setLoading(true);

		void runtime
			.runPromise(
				Effect.gen(function* () {
					const api = yield* OrderApi;
					return yield* api.listMyOrders();
				}),
			)
			.then((result) => setOrders(result.orders))
			.catch(() => setOrders([]))
			.finally(() => setLoading(false));
	};

	useEffect(() => {
		loadOrders();
	}, []);

	const handleCancelOrder = (orderId: string) => {
		setCancellingOrderIds((prev) => [...prev, orderId]);

		void runtime
			.runPromise(
				Effect.gen(function* () {
					const api = yield* OrderApi;
					return yield* api.cancelOrder(
						orderId,
						"Customer requested cancellation",
					);
				}),
			)
			.then(() => {
				toast.success("Order cancelled successfully");
				loadOrders();
			})
			.catch(() => {
				toast.error("Unable to cancel your order right now.");
			})
			.finally(() => {
				setCancellingOrderIds((prev) => prev.filter((id) => id !== orderId));
			});
	};

	return (
		<div className="min-h-screen bg-gray-50">
			<CustomerPageHeader title="My orders" />
			<div className="mx-auto max-w-4xl px-4 py-6">
				<div className="mb-4">
					<h1 className="text-2xl font-bold text-foreground">My orders</h1>
					<p className="text-sm text-muted-foreground">
						Track recent deliveries and pickup orders.
					</p>
				</div>

				{loading ? (
					<div className="space-y-3">
						{[1, 2, 3].map((i) => (
							<div
								key={i}
								className="h-28 rounded-2xl bg-muted animate-pulse"
							/>
						))}
					</div>
				) : orders.length === 0 ? (
					<Card className="border-border/60">
						<CardContent className="flex flex-col items-center py-16 text-center">
							<div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-muted">
								<ReceiptText className="h-6 w-6 text-muted-foreground/60" />
							</div>
							<p className="font-semibold text-foreground">No orders yet</p>
							<p className="mt-1 text-sm text-muted-foreground">
								Your placed orders will appear here.
							</p>
						</CardContent>
					</Card>
				) : (
					<div className="space-y-3">
						{orders.map((order) => (
							<Card key={order.id} className="border-border/60">
								<CardContent className="p-4">
									<div className="flex items-start justify-between gap-3">
										<div className="min-w-0">
											<div className="flex items-center gap-2">
												<Package2 className="h-4 w-4 text-muted-foreground" />
												<span className="font-semibold text-foreground">
													{order.restaurantName}
												</span>
											</div>
											<p className="mt-1 text-xs text-muted-foreground">
												{order.itemCount} items • {order.paymentMethod}
											</p>
										</div>
										<Badge variant="outline" className="shrink-0">
											{order.status}
										</Badge>
									</div>

									<div className="mt-3 flex items-center justify-between gap-3">
										<span className="text-sm text-muted-foreground">Total</span>
										<div className="flex items-center gap-2">
											<span className="font-semibold text-foreground">
												₦{Number(order.totalPrice).toLocaleString()}
											</span>
											{!["delivered", "cancelled", "completed"].includes(
												order.status.toLowerCase(),
											) && (
												<Button
													variant="outline"
													size="sm"
													className="h-8 px-3 text-xs"
													disabled={cancellingOrderIds.includes(order.id)}
													onClick={() => handleCancelOrder(order.id)}
												>
													{cancellingOrderIds.includes(order.id)
														? "Cancelling..."
														: "Cancel"}
												</Button>
											)}
										</div>
									</div>
								</CardContent>
							</Card>
						))}
					</div>
				)}
			</div>
		</div>
	);
}
