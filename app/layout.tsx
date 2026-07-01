import { Geist, Geist_Mono, Lora } from "next/font/google";

import "./globals.css";
import type { Metadata } from "next";
import { Toaster } from "@/components/ui/sonner";
import { cn } from "@/lib/utils";
import { Providers } from "./providers";

const lora = Lora({ subsets: ["latin"], variable: "--font-serif" });

const fontSans = Geist({
	subsets: ["latin"],
	variable: "--font-sans",
});

const fontMono = Geist_Mono({
	subsets: ["latin"],
	variable: "--font-mono",
});

export const metadata: Metadata = {
	title: "Foodie",
	description:
		"Discover local restaurants, browse menus, order your favorite meals, and enjoy fast, reliable food delivery.",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html
			lang="en"
			suppressHydrationWarning
			className={cn(
				"antialiased",
				fontSans.variable,
				fontMono.variable,
				"font-serif",
				lora.variable,
			)}
		>
			<body>
				<Providers>
					<main>{children}</main>
				</Providers>
				<Toaster />
			</body>
		</html>
	);
}
