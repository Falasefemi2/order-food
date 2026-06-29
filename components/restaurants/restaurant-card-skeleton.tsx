import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function RestaurantCardSkeleton() {
	return (
		<Card className="overflow-hidden rounded-2xl border-border/60">
			<Skeleton className="h-44 w-full rounded-none" />
			<CardContent className="p-4 space-y-3">
				<Skeleton className="h-4 w-3/4" />
				<Skeleton className="h-3 w-1/2" />
				<div className="flex gap-3">
					<Skeleton className="h-3 w-16" />
					<Skeleton className="h-3 w-16" />
					<Skeleton className="h-3 w-20" />
				</div>
			</CardContent>
		</Card>
	);
}
