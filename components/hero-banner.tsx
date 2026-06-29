import { MapPin, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function HeroBanner() {
	return (
		<section className="relative overflow-hidden bg-linear-to-br from-brand to-brand-dark text-white">
			{/* Background pattern */}
			<div className="absolute inset-0 opacity-10">
				<div className="absolute -top-10 -right-10 size-72 rounded-full bg-white" />
				<div className="absolute -bottom-20 -left-10 size-96 rounded-full bg-white" />
			</div>

			<div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-16 md:py-24">
				<div className="max-w-2xl">
					{/* Badge */}
					<Badge className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-4 text-sm font-medium mb-6">
						<span className="size-2 rounded-full bg-yellow-400 animate-pulse" />
						Free delivery on your first order
					</Badge>

					<h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-4">
						Delicious food,{" "}
						<span className="text-yellow-300">delivered fast</span>
					</h1>

					<p className="text-lg text-white/80 mb-8 max-w-md">
						Order from hundreds of restaurants in Lagos and get it delivered to
						your door in minutes.
					</p>

					{/* Search box */}
					<div className="bg-white rounded-2xl p-2 flex flex-col sm:flex-row items-center gap-2 shadow-xl max-w-xl">
						{/* Location */}
						<Button
							variant="ghost"
							className="text-gray-700 hover:bg-gray-100 justify-start"
						>
							<MapPin
								size={18}
								className="text-brand shrink-0"
								data-icon="inline-start"
							/>
							<span className="text-sm truncate">Lagos, Nigeria</span>
							<span className="text-gray-400 text-xs ml-auto">▾</span>
						</Button>

						{/* Search input */}
						<div className="flex-1 flex items-center gap-2 px-4 py-3">
							<Search size={18} className="text-gray-400 shrink-0" />
							<Input
								type="text"
								placeholder="Search for restaurants or dishes..."
								className="flex-1 text-sm text-gray-700 placeholder:text-gray-400 outline-none bg-transparent border-0"
							/>
						</div>

						<Button className="bg-brand hover:bg-brand-dark text-white font-semibold px-6 py-3 rounded-xl text-sm shrink-0">
							<Search size={18} data-icon="inline-start" />
							Search
						</Button>
					</div>

					{/* Trust signals */}
					<div className="flex flex-wrap gap-6 mt-8 text-sm text-white/70">
						<div className="flex items-center gap-1.5">
							<span className="text-yellow-300 font-bold">★</span>
							<span>4.8 rated app</span>
						</div>
						<div className="flex items-center gap-1.5">
							<span>🍔</span>
							<span>500+ restaurants</span>
						</div>
						<div className="flex items-center gap-1.5">
							<span>⚡</span>
							<span>30 min delivery</span>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}
