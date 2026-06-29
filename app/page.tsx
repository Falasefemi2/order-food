import { CategoryFilter } from "@/components/catgories-filters";
import { HeroBanner } from "@/components/hero-banner";
import { Navbar } from "@/components/navbar";
import { PromoBanners } from "@/components/promo-banner";

export default function Page() {
	return (
		<div className="min-h-screen bg-gray-50">
			<Navbar />
			<main>
				<HeroBanner />
				<div className="max-w-7xl mx-auto px-4 sm:px-6">
					<PromoBanners />
					<CategoryFilter />
				</div>
			</main>
		</div>
	);
}
