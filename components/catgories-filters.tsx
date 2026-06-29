"use client";

import { useState } from "react";

const categories = [
	{ id: "all", label: "All", emoji: "🍽" },
	{ id: "rice", label: "Rice", emoji: "🍚" },
	{ id: "chicken", label: "Chicken", emoji: "🍗" },
	{ id: "burger", label: "Burgers", emoji: "🍔" },
	{ id: "pizza", label: "Pizza", emoji: "🍕" },
	{ id: "suya", label: "Suya", emoji: "🍖" },
	{ id: "seafood", label: "Seafood", emoji: "🦞" },
	{ id: "soup", label: "Soups", emoji: "🍲" },
	{ id: "pastry", label: "Pastries", emoji: "🥐" },
	{ id: "drinks", label: "Drinks", emoji: "🥤" },
	{ id: "dessert", label: "Desserts", emoji: "🍦" },
];

export function CategoryFilter() {
	const [active, setActive] = useState("all");

	return (
		<div className="py-6">
			<div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
				{categories.map((cat) => (
					<button
						key={cat.id}
						onClick={() => setActive(cat.id)}
						className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium whitespace-nowrap transition-all shrink-0 ${
							active === cat.id
								? "bg-brand text-white shadow-md shadow-brand/30"
								: "bg-white text-gray-600 border border-gray-200 hover:border-brand hover:text-brand"
						}`}
					>
						<span>{cat.emoji}</span>
						<span>{cat.label}</span>
					</button>
				))}
			</div>
		</div>
	);
}
