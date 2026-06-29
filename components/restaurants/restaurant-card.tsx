import { Clock, Star, Zap } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

interface RestaurantCardProps {
	id: string;
	name: string;
	description: string | null;
	logoUrl: string | null;
	bannerUrl: string | null;
	city: string;
	ratingAvg: string;
	ratingCount: number;
	estimatedPrepTime: number;
	isOpen: boolean;
	deliveryFee?: string;
}

export function RestaurantCard({
	id,
	name,
	description,
	logoUrl,
	bannerUrl,
	ratingAvg,
	ratingCount,
	estimatedPrepTime,
	isOpen,
	deliveryFee = "₦500",
}: RestaurantCardProps) {
	return (
		<Link href={`/restaurants/${id}`} className="block group">
			<Card className="overflow-hidden border-border/60 transition-shadow duration-200 hover:shadow-md rounded-2xl py-0">
				{/* Banner */}
				<div className="relative h-44 bg-muted overflow-hidden">
					{bannerUrl ? (
						<img
							src={bannerUrl}
							alt={name}
							className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
						/>
					) : (
						<div className="absolute inset-0 bg-linear-to-br from-primary/10 to-primary/20 flex items-center justify-center">
							<span className="text-5xl">🍽</span>
						</div>
					)}

					<Badge
						variant={isOpen ? "default" : "secondary"}
						className={`absolute top-3 left-3 text-xs font-semibold ${
							isOpen
								? "bg-white text-primary hover:bg-white"
								: "bg-gray-800/80 text-white hover:bg-gray-800/80"
						}`}
					>
						{isOpen ? "● Open" : "Closed"}
					</Badge>

					{logoUrl && (
						<div className="absolute bottom-3 right-3 w-12 h-12 rounded-xl border-2 border-background shadow-md overflow-hidden bg-background">
							<img
								src={logoUrl}
								alt=""
								className="w-full h-full object-cover"
							/>
						</div>
					)}
				</div>

				{/* Info */}
				<CardContent className="p-4">
					<h3 className="font-bold text-foreground text-base leading-tight line-clamp-1">
						{name}
					</h3>
					{description && (
						<p className="text-sm text-muted-foreground mt-1 line-clamp-1">
							{description}
						</p>
					)}

					{/* Meta row */}
					<div className="flex items-center gap-2 mt-3 text-sm text-muted-foreground">
						<div className="flex items-center gap-1">
							<Star size={13} className="text-yellow-400 fill-yellow-400" />
							<span className="font-semibold text-foreground">
								{parseFloat(ratingAvg).toFixed(1)}
							</span>
							{ratingCount > 0 && (
								<span className="text-muted-foreground/70">
									({ratingCount})
								</span>
							)}
						</div>

						<Separator orientation="vertical" className="h-3" />

						<div className="flex items-center gap-1">
							<Clock size={13} />
							<span>
								{estimatedPrepTime}–{estimatedPrepTime + 10} min
							</span>
						</div>

						<Separator orientation="vertical" className="h-3" />

						<div className="flex items-center gap-1">
							<Zap size={13} className="text-primary" />
							<span>{deliveryFee} delivery</span>
						</div>
					</div>
				</CardContent>
			</Card>
		</Link>
	);
}
