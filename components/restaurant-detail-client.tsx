"use client";

import { ChevronLeft, Clock, Info, Leaf, MapPin, Star } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
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
import type { PublicRestaurantDetail } from "@/lib/types";

interface RestaurantDetailClientProps {
	restaurant: PublicRestaurantDetail;
	basePath?: string;
}

type MenuItem = PublicRestaurantDetail["categories"][0]["items"][0];

export function RestaurantDetailClient({
	restaurant,
	basePath = "/restaurants",
}: RestaurantDetailClientProps) {
	const router = useRouter();
	const [activeCategory, setActiveCategory] = useState(
		restaurant.categories[0]?.id ?? "",
	);
	const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
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

	const rating = parseFloat(restaurant.ratingAvg);
	const hasRating = restaurant.ratingCount > 0;

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

			<MenuItemSheet
				item={selectedItem}
				onClose={() => setSelectedItem(null)}
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
}: {
	item: MenuItem | null;
	onClose: () => void;
}) {
	if (!item) return null;

	const price = parseFloat(item.price);

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
								.map((opt) => (
									<div
										key={opt.id}
										className="flex items-center justify-between px-3.5 py-3 rounded-xl border border-border bg-white text-sm"
									>
										<span className="text-foreground">{opt.name}</span>
										{parseFloat(opt.price) > 0 && (
											<span className="text-muted-foreground font-medium">
												+₦{parseFloat(opt.price).toLocaleString()}
											</span>
										)}
									</div>
								))}
						</div>
					</div>
				))}
		</div>
	);

	const [isMobile, setIsMobile] = useState(false);

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
