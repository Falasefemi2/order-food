"use client";

import { MapPin, Menu, Search, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

export function Navbar() {
	const [mobileOpen, setMobileOpen] = useState(false);
	const pathname = usePathname();
	type NavLink = {
		label: string;
		href: string;
	};

	const navLinks: NavLink[] = [
		{ label: "Drivers", href: "/riders" },
		{ label: "Restaurants", href: "/restaurants" },
		{ label: "Vendors", href: "/vendors" },
	];
	return (
		<header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center gap-4">
				<Link href="/" className="flex items-center gap-2 shrink-0">
					<span className="font-bold text-2xl text-gray-900">
						Order<span className="text-brand">&</span>Eat
					</span>
				</Link>
				<Button className="bg-brand hover:bg-brand-dark">
					<MapPin size={15} className="text-brand" />
					<span className="font-medium">Lagos,Nigeria</span>
					<span className="text-white">▾</span>
				</Button>
				<div className="flex-1 max-w-md hidden md:flex items-center gap-2 bg-gray-100 rounded-full px-4 py-2">
					<Search size={16} className="text-gray-400 shrink-0" />
					<Input type="text" placeholder="Search restaurants, dishes..." />
				</div>
				<nav className="hidden md:flex items-center gap-1 ml-2">
					{navLinks.map((link) => (
						<Link
							key={link.href}
							href={link.href}
							className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
								pathname === link.href
									? "text-brand bg-brand-light"
									: "text-gray-600 hover:text-brand hover:bg-brand-light"
							}`}
						>
							{link.label}
						</Link>
					))}
				</nav>
				<div className="ml-auto flex items-center gap-2">
					<div className="hidden md:flex items-center gap-2">
						<Link
							href="/login"
							className="text-sm font-medium text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors"
						>
							Log in
						</Link>
						<Link
							href="/register"
							className="text-sm font-medium text-white bg-brand px-4 py-2 rounded-lg hover:bg-brand-dark transition-colors"
						>
							Sign up
						</Link>
					</div>

					{/* Mobile menu toggle */}
					<Button
						className="md:hidden p-2 rounded-lg hover:bg-gray-100"
						onClick={() => setMobileOpen(!mobileOpen)}
					>
						{mobileOpen ? <X size={20} /> : <Menu size={20} />}
					</Button>
				</div>
			</div>
			{mobileOpen && (
				<div className="md:hidden border-t border-gray-100 bg-white px-4 py-3 flex flex-col gap-2">
					<div className="flex items-center gap-2 bg-gray-100 rounded-full px-4 py-2 mb-1">
						<Search size={16} className="text-gray-400" />
						<Input type="text" placeholder="Search restaurants..." />
					</div>
					{navLinks.map((link) => (
						<Link
							key={link.href}
							href={link.href}
							onClick={() => setMobileOpen(false)}
							className="px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-brand-light hover:text-brand"
						>
							{link.label}
						</Link>
					))}

					<div className="flex gap-2 mt-2 pt-2 border-t border-gray-100">
						<Link
							href="/login"
							className="flex-1 text-center text-sm font-medium text-gray-700 px-4 py-2 border border-gray-200 rounded-lg"
						>
							Log in
						</Link>
						<Link
							href="/register"
							className="flex-1 text-center text-sm font-medium text-white bg-brand px-4 py-2 rounded-lg"
						>
							Sign up
						</Link>
					</div>
				</div>
			)}
		</header>
	);
}
