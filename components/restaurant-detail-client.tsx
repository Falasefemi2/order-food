"use client";

import * as Effect from "effect/Effect";
import {
	ChevronLeft,
	Clock,
	Info,
	Leaf,
	MapPin,
	ShoppingBag,
	Star,
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
	Sheet,
	SheetContent,
	SheetHeader,
	SheetTitle,
} from "@/components/ui/sheet";
import {
	AddressApi,
	type AddressResponseType,
} from "@/lib/customer/address-api";
import { OrderApi, type PlaceOrderPayload } from "@/lib/order-api";
import { runtime } from "@/lib/runtime";
import type { PublicRestaurantDetail } from "@/lib/types";

interface RestaurantDetailClientProps {
	restaurant: PublicRestaurantDetail;
	basePath?: string;
}

type MenuItem = PublicRestaurantDetail["categories"][0]["items"][0];

type CartItem = {
	menuItemId: string;
	name: string;
	quantity: number;
	unitPrice: number;
	selectedOptionIds: string[];
	imageUrl?: string | null;
};

export function RestaurantDetailClient({
	restaurant,
	basePath = "/restaurants",
}: RestaurantDetailClientProps) {
	const router = useRouter();
	const [activeCategory, setActiveCategory] = useState(
		restaurant.categories[0]?.id ?? "",
	);
	const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
	const [cartItems, setCartItems] = useState<CartItem[]>([]);
	const [checkoutOpen, setCheckoutOpen] = useState(false);
	const [addresses, setAddresses] = useState<readonly AddressResponseType[]>(
		[],
	);
	const [selectedAddressId, setSelectedAddressId] = useState("");
	const [paymentMethod, setPaymentMethod] =
		useState<PlaceOrderPayload["paymentMethod"]>("cash_on_delivery");
	const [deliveryNotes, setDeliveryNotes] = useState("");
	const [isPlacingOrder, setIsPlacingOrder] = useState(false);
	const [isScrolled, setIsScrolled] = useState(false);
	const categoryRefs = useRef<Record<string, HTMLElement | null>>({});
	const observerRef = useRef<IntersectionObserver | null>(null);

	useEffect(() => {
		const onScroll = () => setIsScrolled(window.scrollY > 240);
		window.addEventListener("scroll", onScroll, { passive: true });
		return () => window.removeEventListener("scroll", onScroll);
	}, []);

	useEffect(() => {
		observerRef.current?.disconnect();
		observerRef.current = new IntersectionObserver(
			(entries) => {
				for (const entry of entries) {
					if (entry.isIntersecting) setActiveCategory(entry.target.id);
				}
			},
			{ rootMargin: "-30% 0px -60% 0px" },
		);
		Object.values(categoryRefs.current).forEach((el) => {
			if (el) observerRef.current?.observe(el);
		});
		return () => observerRef.current?.disconnect();
	}, [restaurant.categories]);

	const scrollToCategory = (categoryId: string) => {
		categoryRefs.current[categoryId]?.scrollIntoView({
			behavior: "smooth",
			block: "start",
		});
	};

	const nonEmptyCategories = restaurant.categories.filter(
		(c) => c.items.length > 0,
	);

	const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
	const cartSubtotal = cartItems.reduce(
		(sum, item) => sum + item.unitPrice * item.quantity,
		0,
	);

	const rating = parseFloat(restaurant.ratingAvg);
	const hasRating = restaurant.ratingCount > 0;

	const handleAddToCart = (
		item: MenuItem,
		quantity: number,
		selectedOptionIds: string[],
	) => {
		const unitPrice = parseFloat(item.price);
		setCartItems((prev) => {
			const existingIndex = prev.findIndex(
				(cartItem) =>
					cartItem.menuItemId === item.id &&
					JSON.stringify(cartItem.selectedOptionIds) ===
						JSON.stringify(selectedOptionIds),
			);

			if (existingIndex >= 0) {
				const nextItems = [...prev];
				nextItems[existingIndex] = {
					...nextItems[existingIndex],
					quantity: nextItems[existingIndex].quantity + quantity,
				};
				return nextItems;
			}

			return [
				...prev,
				{
					menuItemId: item.id,
					name: item.name,
					quantity,
					unitPrice,
					selectedOptionIds,
					imageUrl: item.imageUrl,
				},
			];
		});
		toast.success(`${quantity} × ${item.name} added to cart`);
	};

	const openCheckout = () => {
		runtime
			.runPromise(
				Effect.gen(function* () {
					const api = yield* AddressApi;
					return yield* api.list();
				}),
			)
			.then((result) => {
				setAddresses(result);
				const defaultAddress = result.find((address) => address.isDefault);
				setSelectedAddressId(defaultAddress?.id ?? result[0]?.id ?? "");
				setCheckoutOpen(true);
			})
			.catch(() => {
				setAddresses([]);
				setSelectedAddressId("");
				setCheckoutOpen(true);
			});
	};

	const handlePlaceOrder = async () => {
		if (cartItems.length === 0) {
			toast.error("Your cart is empty");
			return;
		}

		if (!selectedAddressId) {
			toast.error("Choose a delivery address first");
			return;
		}

		setIsPlacingOrder(true);

		try {
			await runtime.runPromise(
				Effect.gen(function* () {
					const api = yield* OrderApi;
					return yield* api.placeOrder({
						restaurantId: restaurant.id,
						addressId: selectedAddressId,
						items: cartItems.map((item) => ({
							menuItemId: item.menuItemId,
							quantity: item.quantity,
							selectedOptionIds: item.selectedOptionIds,
						})),
						paymentMethod,
						deliveryNotes: deliveryNotes || undefined,
					});
				}),
			);

			toast.success("Order placed successfully");
			setCartItems([]);
			setCheckoutOpen(false);
			router.push("/customer/orders");
		} catch {
			toast.error("Unable to place your order right now");
		} finally {
			setIsPlacingOrder(false);
		}
	};

	return (
		<div className="min-h-screen bg-gray-50">
			<div className="relative h-56 md:h-72 bg-muted overflow-hidden">
				{restaurant.bannerUrl ? (
					<Image
						src={restaurant.bannerUrl}
						alt={restaurant.name}
						fill
						className="object-cover"
					/>
				) : (
					<div className="absolute inset-0 bg-linear-to-br from-primary/20 to-primary/40 flex items-center justify-center">
						<span className="text-8xl opacity-20">🍽</span>
					</div>
				)}
				<div className="absolute inset-0 bg-linear-to-t from-black/60 via-black/10 to-transparent" />

				<Button
					variant="secondary"
					size="icon"
					onClick={() => router.push(basePath)}
					className="absolute top-4 left-4 rounded-full bg-white/90 backdrop-blur-sm shadow-md hover:bg-white"
				>
					<ChevronLeft size={18} />
				</Button>
			</div>

			<div className="max-w-5xl mx-auto px-4 sm:px-6">
				<Card className="relative z-10 -mt-8 mb-4 shadow-sm rounded-2xl border-border/60">
					<CardContent className="p-5 md:p-6">
						<div className="flex gap-4">
							{restaurant.logoUrl && (
								<div className="w-16 h-16 md:w-20 md:h-20 rounded-xl border border-border overflow-hidden shrink-0 shadow-sm">
									<img
										src={restaurant.logoUrl}
										alt=""
										className="w-full h-full object-cover"
									/>
								</div>
							)}

							<div className="flex-1 min-w-0">
								<div className="flex items-start justify-between gap-2">
									<h1 className="text-xl md:text-2xl font-bold text-foreground leading-tight">
										{restaurant.name}
									</h1>
									<Badge
										variant={restaurant.isOpen ? "default" : "secondary"}
										className={
											restaurant.isOpen
												? "bg-green-50 text-green-700 hover:bg-green-50 border-green-200 shrink-0"
												: "bg-red-50 text-red-600 hover:bg-red-50 border-red-200 shrink-0"
										}
									>
										{restaurant.isOpen ? "● Open" : "● Closed"}
									</Badge>
								</div>

								{restaurant.description && (
									<p className="text-sm text-muted-foreground mt-1 line-clamp-2">
										{restaurant.description}
									</p>
								)}

								<div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-3 text-sm text-muted-foreground">
									{hasRating ? (
										<div className="flex items-center gap-1">
											<Star
												size={13}
												className="text-yellow-400 fill-yellow-400"
											/>
											<span className="font-semibold text-foreground">
												{rating.toFixed(1)}
											</span>
											<span className="text-muted-foreground/70">
												({restaurant.ratingCount})
											</span>
										</div>
									) : (
										<div className="flex items-center gap-1">
											<Star
												size={13}
												className="text-muted-foreground/40 fill-muted-foreground/40"
											/>
											<span className="text-muted-foreground/70">New</span>
										</div>
									)}

									<Separator orientation="vertical" className="h-3 shrink-0" />

									<div className="flex items-center gap-1">
										<Clock size={13} />
										<span>
											{restaurant.estimatedPrepTime}–
											{restaurant.estimatedPrepTime + 10} min
										</span>
									</div>

									<Separator orientation="vertical" className="h-3 shrink-0" />

									<div className="flex items-center gap-1">
										<MapPin size={13} />
										<span>
											{restaurant.city}, {restaurant.state}
										</span>
									</div>

									<Separator orientation="vertical" className="h-3 shrink-0" />

									<span className="text-muted-foreground/70">
										{restaurant.openingTime} – {restaurant.closingTime}
									</span>
								</div>
							</div>
						</div>
					</CardContent>
				</Card>

				<ScrollArea className="w-full whitespace-nowrap">
					<div className="flex gap-1.5 py-3">
						{nonEmptyCategories.map((cat) => (
							<button
								key={cat.id}
								onClick={() => scrollToCategory(cat.id)}
								className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all shrink-0 ${
									activeCategory === cat.id
										? "bg-primary text-primary-foreground shadow-sm"
										: "bg-white text-muted-foreground border border-border hover:border-primary hover:text-primary"
								}`}
							>
								{cat.name}
							</button>
						))}
					</div>
					<ScrollBar orientation="horizontal" />
				</ScrollArea>

				<div className="pb-16 pt-2">
					{restaurant.categories.map((category) => (
						<section
							key={category.id}
							id={category.id}
							ref={(el) => {
								categoryRefs.current[category.id] = el;
							}}
							className="mb-8"
						>
							<div className="mb-4 pt-2">
								<h2 className="text-lg font-bold text-foreground">
									{category.name}
								</h2>
								{category.description && (
									<p className="text-sm text-muted-foreground mt-0.5">
										{category.description}
									</p>
								)}
							</div>

							{category.items.length === 0 ? (
								<p className="text-sm text-muted-foreground italic py-4">
									No items in this category yet.
								</p>
							) : (
								<div className="grid grid-cols-1 md:grid-cols-2 gap-3">
									{category.items.map((item) => (
										<MenuItemCard
											key={item.id}
											item={item}
											onSelect={() => setSelectedItem(item)}
										/>
									))}
								</div>
							)}
						</section>
					))}
				</div>
			</div>

			{cartCount > 0 && (
				<div className="fixed bottom-4 left-1/2 z-50 -translate-x-1/2 w-[calc(100%-2rem)] max-w-md px-4">
					<Button
						onClick={openCheckout}
						className="w-full h-14 rounded-2xl shadow-lg bg-primary text-primary-foreground hover:bg-primary/90"
					>
						<div className="flex items-center justify-between w-full px-1">
							<div className="flex items-center gap-2">
								<ShoppingBag size={16} />
								<span>Cart ({cartCount})</span>
							</div>
							<span>₦{cartSubtotal.toLocaleString()}</span>
						</div>
					</Button>
				</div>
			)}

			<Sheet open={checkoutOpen} onOpenChange={setCheckoutOpen}>
				<SheetContent side="bottom" className="rounded-t-3xl max-h-[92vh] p-0">
					<div className="flex flex-col max-h-[92vh]">
						<div className="px-4 pt-4 pb-3 border-b">
							<SheetHeader>
								<SheetTitle>Checkout</SheetTitle>
							</SheetHeader>
						</div>
						<div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
							<div className="space-y-3">
								{cartItems.map((item) => (
									<div
										key={`${item.menuItemId}-${item.selectedOptionIds.join("")}`}
										className="flex items-center gap-3 rounded-2xl bg-muted/50 p-3"
									>
										<div className="h-14 w-14 rounded-xl overflow-hidden bg-background shrink-0">
											{item.imageUrl ? (
												<img
													src={item.imageUrl}
													alt={item.name}
													className="h-full w-full object-cover"
												/>
											) : (
												<div className="flex h-full w-full items-center justify-center text-2xl">
													🍽
												</div>
											)}
										</div>
										<div className="min-w-0 flex-1">
											<p className="font-semibold text-sm truncate">
												{item.name}
											</p>
											<p className="text-xs text-muted-foreground">
												{item.quantity} × ₦{item.unitPrice.toLocaleString()}
											</p>
										</div>
										<span className="font-semibold text-sm">
											₦{(item.unitPrice * item.quantity).toLocaleString()}
										</span>
									</div>
								))}
							</div>

							<div className="space-y-2">
								<label className="text-sm font-medium">Delivery address</label>
								<select
									value={selectedAddressId}
									onChange={(e) => setSelectedAddressId(e.target.value)}
									className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm"
								>
									<option value="">Select address</option>
									{addresses.map((address) => (
										<option key={address.id} value={address.id}>
											{address.label} — {address.addressLine1}, {address.city}
										</option>
									))}
								</select>
								{addresses.length === 0 && (
									<div className="flex items-center justify-between rounded-xl border border-dashed border-border px-3 py-2">
										<span className="text-xs text-muted-foreground">
											Add an address first
										</span>
										<Button
											size="sm"
											variant="outline"
											onClick={() => router.push("/customer/addresses")}
										>
											Add address
										</Button>
									</div>
								)}
							</div>

							<div className="space-y-2">
								<label className="text-sm font-medium">Payment method</label>
								<div className="grid grid-cols-2 gap-2">
									{(
										[
											"cash_on_delivery",
											"card",
											"bank_transfer",
											"wallet",
										] as const
									).map((method) => (
										<button
											key={method}
											type="button"
											onClick={() => setPaymentMethod(method)}
											className={`rounded-xl border px-3 py-2 text-sm ${paymentMethod === method ? "border-primary bg-primary/5 text-primary" : "border-border bg-background"}`}
										>
											{method === "cash_on_delivery"
												? "Cash on delivery"
												: method === "card"
													? "Card"
													: method === "bank_transfer"
														? "Bank transfer"
														: "Wallet"}
										</button>
									))}
								</div>
							</div>

							<div className="space-y-2">
								<label className="text-sm font-medium">Delivery notes</label>
								<textarea
									value={deliveryNotes}
									onChange={(e) => setDeliveryNotes(e.target.value)}
									rows={3}
									placeholder="Door code, leave at gate, etc."
									className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm"
								/>
							</div>
						</div>

						<div className="border-t px-4 py-3">
							<div className="flex items-center justify-between text-sm mb-3">
								<span>Subtotal</span>
								<span>₦{cartSubtotal.toLocaleString()}</span>
							</div>
							<Button
								onClick={handlePlaceOrder}
								disabled={isPlacingOrder}
								className="w-full h-12 rounded-2xl"
							>
								{isPlacingOrder
									? "Placing order..."
									: `Place order • ₦${cartSubtotal.toLocaleString()}`}
							</Button>
						</div>
					</div>
				</SheetContent>
			</Sheet>

			<MenuItemSheet
				item={selectedItem}
				onClose={() => setSelectedItem(null)}
				onAddToCart={handleAddToCart}
			/>
		</div>
	);
}

interface MenuItemCardProps {
	item: MenuItem;
	onSelect: () => void;
}

function MenuItemCard({ item, onSelect }: MenuItemCardProps) {
	const price = parseFloat(item.price);
	const hasGroups = item.customizationGroups.length > 0;

	return (
		<Card
			onClick={item.isAvailable ? onSelect : undefined}
			className={`overflow-hidden border-border/60 transition-all group ${
				item.isAvailable
					? "hover:border-primary/30 hover:shadow-md cursor-pointer"
					: "opacity-50 cursor-not-allowed"
			}`}
		>
			<CardContent className="p-0">
				<div className="flex gap-3 p-3.5">
					<div className="flex-1 min-w-0">
						<div className="flex items-start gap-1.5">
							<span className="font-semibold text-foreground text-sm leading-tight flex-1">
								{item.name}
							</span>
							{item.isVegetarian && (
								<Leaf size={13} className="text-green-600 shrink-0 mt-0.5" />
							)}
						</div>

						{item.description && (
							<p className="text-xs text-muted-foreground mt-1 line-clamp-2">
								{item.description}
							</p>
						)}

						<div className="flex items-center gap-2 mt-2.5 flex-wrap">
							<span className="font-bold text-foreground text-sm">
								₦{price.toLocaleString()}
							</span>
							{item.calories && (
								<span className="text-xs text-muted-foreground">
									{item.calories} kcal
								</span>
							)}
							{hasGroups && (
								<Badge
									variant="outline"
									className="text-xs gap-0.5 text-primary border-primary/30 py-0"
								>
									<Info size={9} />
									Customizable
								</Badge>
							)}
							{!item.isAvailable && (
								<Badge variant="destructive" className="text-xs py-0">
									Unavailable
								</Badge>
							)}
						</div>
					</div>

					<div className="w-24 h-24 rounded-xl overflow-hidden bg-muted shrink-0">
						{item.imageUrl ? (
							<img
								src={item.imageUrl}
								alt={item.name}
								className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
							/>
						) : (
							<div className="w-full h-full flex items-center justify-center text-3xl">
								🍽
							</div>
						)}
					</div>
				</div>
			</CardContent>
		</Card>
	);
}

function MenuItemSheet({
	item,
	onClose,
	onAddToCart,
}: {
	item: MenuItem | null;
	onClose: () => void;
	onAddToCart?: (
		item: MenuItem,
		quantity: number,
		selectedOptionIds: string[],
	) => void;
}) {
	if (!item) return null;

	const price = parseFloat(item.price);
	const [quantity, setQuantity] = useState(1);
	const [selectedOptionIds, setSelectedOptionIds] = useState<string[]>([]);
	const [isMobile, setIsMobile] = useState(false);

	useEffect(() => {
		setQuantity(1);
		setSelectedOptionIds([]);
	}, [item]);

	const toggleOption = (optionId: string) => {
		setSelectedOptionIds((prev) => {
			if (prev.includes(optionId)) {
				return prev.filter((id) => id !== optionId);
			}
			return [...prev, optionId];
		});
	};

	const handleAdd = () => {
		const requiredGroups = item.customizationGroups.filter((g) => g.isRequired);
		for (const group of requiredGroups) {
			const hasSelection = group.options.some((option) =>
				selectedOptionIds.includes(option.id),
			);
			if (!hasSelection) {
				toast.error(`Please select an option for ${group.name}`);
				return;
			}
		}

		onAddToCart?.(item, quantity, selectedOptionIds);
		onClose();
	};

	const content = (
		<div className="space-y-5">
			{item.imageUrl && (
				<div className="w-full h-48 overflow-hidden rounded-xl">
					<img
						src={item.imageUrl}
						alt={item.name}
						className="w-full h-full object-cover"
					/>
				</div>
			)}

			<div>
				<div className="flex items-start justify-between gap-2">
					<h2 className="text-xl font-bold text-foreground">{item.name}</h2>
					{item.isVegetarian && (
						<Badge
							variant="outline"
							className="text-green-700 border-green-200 bg-green-50 shrink-0"
						>
							<Leaf size={11} className="mr-1" /> Veg
						</Badge>
					)}
				</div>
				{item.description && (
					<p className="text-sm text-muted-foreground mt-1">
						{item.description}
					</p>
				)}
				<div className="flex items-center gap-3 mt-2">
					<span className="text-lg font-bold text-primary">
						₦{price.toLocaleString()}
					</span>
					{item.calories && (
						<span className="text-xs text-muted-foreground">
							{item.calories} kcal
						</span>
					)}
				</div>
			</div>

			<div className="rounded-2xl bg-muted/40 p-3">
				<div className="flex items-center justify-between">
					<span className="text-sm font-medium">Quantity</span>
					<div className="flex items-center gap-2 rounded-xl border border-border bg-background px-1">
						<button
							type="button"
							onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
							className="h-8 w-8 rounded-lg text-lg"
						>
							−
						</button>
						<span className="min-w-6 text-center text-sm font-semibold">
							{quantity}
						</span>
						<button
							type="button"
							onClick={() => setQuantity((prev) => prev + 1)}
							className="h-8 w-8 rounded-lg text-lg"
						>
							+
						</button>
					</div>
				</div>
			</div>

			{item.customizationGroups
				.filter((g) => g.options.length > 0)
				.map((group) => (
					<div key={group.id}>
						<Separator className="mb-4" />
						<div className="flex items-center justify-between mb-2">
							<div>
								<p className="font-semibold text-sm text-foreground">
									{group.name}
								</p>
								<p className="text-xs text-muted-foreground">
									{group.isRequired ? "Required" : "Optional"} ·{" "}
									{group.maxSelectable === 1
										? "Choose 1"
										: `Up to ${group.maxSelectable}`}
								</p>
							</div>
							{group.isRequired && (
								<Badge
									variant="outline"
									className="text-xs text-orange-600 border-orange-200 bg-orange-50"
								>
									Required
								</Badge>
							)}
						</div>
						<div className="space-y-2">
							{group.options
								.filter((o) => o.isAvailable)
								.map((opt) => {
									const selected = selectedOptionIds.includes(opt.id);
									return (
										<button
											type="button"
											onClick={() => toggleOption(opt.id)}
											className={`flex w-full items-center justify-between rounded-xl border px-3.5 py-3 text-sm ${selected ? "border-primary bg-primary/5" : "border-border bg-white"}`}
										>
											<span className="text-foreground">{opt.name}</span>
											{parseFloat(opt.price) > 0 && (
												<span className="text-muted-foreground font-medium">
													+₦{parseFloat(opt.price).toLocaleString()}
												</span>
											)}
										</button>
									);
								})}
						</div>
					</div>
				))}

			<div className="pt-2">
				<Button onClick={handleAdd} className="w-full h-12 rounded-2xl">
					Add to cart • ₦{(price * quantity).toLocaleString()}
				</Button>
			</div>
		</div>
	);

	useEffect(() => {
		const mq = window.matchMedia("(max-width: 767px)");
		setIsMobile(mq.matches);
		const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
		mq.addEventListener("change", handler);
		return () => mq.removeEventListener("change", handler);
	}, []);

	return (
		<>
			<Sheet
				open={!!item && isMobile}
				onOpenChange={(open) => !open && onClose()}
			>
				<SheetContent
					side="bottom"
					className="md:hidden rounded-t-2xl max-h-[90vh] flex flex-col p-0 bg-white"
				>
					<div className="px-4 pt-3 pb-2 shrink-0">
						<SheetHeader>
							<SheetTitle className="sr-only">{item.name}</SheetTitle>
							<div className="w-10 h-1 bg-border rounded-full mx-auto" />
						</SheetHeader>
					</div>
					<div className="overflow-y-auto flex-1 px-4 pb-6">{content}</div>
				</SheetContent>
			</Sheet>
			<Dialog
				open={!!item && !isMobile}
				onOpenChange={(open) => !open && onClose()}
			>
				<DialogContent className="hidden md:flex flex-col sm:max-w-lg max-h-[85vh] p-0 overflow-hidden bg-white">
					<DialogHeader className="px-6 pt-6 pb-0 shrink-0">
						<DialogTitle className="sr-only">{item.name}</DialogTitle>
					</DialogHeader>
					<div className="overflow-y-auto flex-1 px-6 pb-6">{content}</div>
				</DialogContent>
			</Dialog>
		</>
	);
}
