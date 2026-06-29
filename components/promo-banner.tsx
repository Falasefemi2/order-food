import Link from "next/link";

const promos = [
	{
		id: 1,
		title: "Free delivery",
		subtitle: "On your first 3 orders",
		cta: "Order now",
		href: "/restaurants",
		bg: "from-orange-500 to-orange-600",
		emoji: "🛵",
	},
	{
		id: 2,
		title: "New restaurants",
		subtitle: "Just joined Chowdeck",
		cta: "Explore",
		href: "/restaurants?filter=new",
		bg: "from-purple-500 to-purple-700",
		emoji: "✨",
	},
];

export function PromoBanners() {
	return (
		<div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-4">
			{promos.map((promo) => (
				<Link key={promo.id} href={promo.href}>
					<div
						className={`relative overflow-hidden rounded-2xl bg-linear-to-r ${promo.bg} text-white p-6 h-32 flex items-center justify-between card-hover transition-transform hover:scale-105 cursor-pointer`}
					>
						<div>
							<p className="font-bold text-xl leading-tight">{promo.title}</p>
							<p className="text-white/80 text-sm mt-1">{promo.subtitle}</p>
							<span className="inline-block mt-3 text-xs font-semibold bg-white/20 rounded-full px-3 py-1">
								{promo.cta} →
							</span>
						</div>
						<span className="text-6xl opacity-90">{promo.emoji}</span>

						{/* Decorative circle */}
						<div className="absolute -right-6 -top-6 w-32 h-32 rounded-full bg-white/10" />
					</div>
				</Link>
			))}
		</div>
	);
}
