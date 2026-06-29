import {
	BarChart3,
	CircleCheck,
	HandCoins,
	LayoutDashboard,
	Megaphone,
	ShoppingBag,
	Store,
	Truck,
	Users,
} from "lucide-react";
import Link from "next/link";
import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

const stats = [
	{ value: "500+", label: "Active vendors" },
	{ value: "3 cities", label: "And growing" },
	{ value: "₦0", label: "Setup fee" },
	{ value: "Daily", label: "Payouts" },
];

const benefits = [
	{
		icon: Users,
		title: "Reach more customers",
		desc: "Get in front of thousands of hungry customers actively ordering on the platform every day.",
	},
	{
		icon: LayoutDashboard,
		title: "Powerful dashboard",
		desc: "Manage your menu, track orders in real time, and view sales analytics — all in one place.",
	},
	{
		icon: Truck,
		title: "We handle delivery",
		desc: "Our verified rider fleet handles every delivery so you can focus entirely on your food.",
	},
	{
		icon: HandCoins,
		title: "Daily payouts",
		desc: "Earnings from completed orders are paid out to your bank account every day.",
	},
	{
		icon: BarChart3,
		title: "Sales insights",
		desc: "Understand your best-selling items, peak hours, and customer trends to grow smarter.",
	},
	{
		icon: Megaphone,
		title: "Built-in marketing",
		desc: "Run promotions, discounts, and featured listings to drive more orders without extra tools.",
	},
];

const steps = [
	{
		n: "1",
		title: "Create your vendor account",
		desc: "Sign up with your restaurant or business details. Takes under five minutes.",
	},
	{
		n: "2",
		title: "Set up your menu",
		desc: "Add your items, prices, photos, and customization options through the vendor dashboard.",
	},
	{
		n: "3",
		title: "Go live and start selling",
		desc: "Once approved, your restaurant goes live on the platform and customers can start ordering.",
	},
];

const requirements = [
	"A registered business or food vendor operating in a supported city",
	"Valid means of identification for the business owner",
	"A bank account for receiving daily payouts",
	"High-quality food photos (we can help if needed)",
	"A menu with at least 5 items ready to go live",
	"A smartphone to manage orders via our vendor app",
];

const faqs = [
	{
		q: "How much does it cost to list my restaurant?",
		a: "Listing is completely free. We charge a small commission per completed order — no upfront fees, no monthly charges.",
	},
	{
		q: "How do I receive payments?",
		a: "Earnings from completed orders are credited to your vendor wallet daily and can be transferred to your bank account at any time.",
	},
	{
		q: "Can I manage multiple branches?",
		a: "Yes. You can manage multiple locations under a single vendor account, each with its own menu and order management.",
	},
	{
		q: "How long does approval take?",
		a: "Most applications are reviewed within 24–48 hours. You'll receive an email notification once your account goes live.",
	},
	{
		q: "What cities are currently supported?",
		a: "We currently operate in Lagos, Abuja, and Ibadan, with more cities being added. You can register your interest for unsupported cities.",
	},
	{
		q: "Do I need a physical restaurant?",
		a: "Not necessarily. Cloud kitchens, home kitchens with valid food handler certifications, and ghost brands are all welcome.",
	},
];

export default function VendorsPage() {
	return (
		<div className="min-h-screen">
			<section className="relative overflow-hidden bg-gradient-to-br from-brand to-brand-dark py-20 px-4 text-center text-white">
				<div className="absolute inset-0 opacity-10 pointer-events-none">
					<div className="absolute -top-10 -right-10 size-72 rounded-full bg-white" />
					<div className="absolute -bottom-20 -left-10 size-96 rounded-full bg-white" />
				</div>

				<div className="relative">
					<Badge className="mb-4 bg-white/20 backdrop-blur-sm text-white border-transparent hover:bg-white/20">
						Chowdeck Vendors
					</Badge>

					<h1 className="text-4xl md:text-6xl font-bold text-white leading-tight mb-5">
						Sell More. <span className="text-yellow-300">Grow More.</span>
					</h1>

					<p className="text-white/80 text-base md:text-lg max-w-lg mx-auto mb-8 leading-relaxed">
						Join thousands of restaurants, supermarkets, and pharmacies reaching
						millions of customers daily on Chowdeck.
					</p>

					<div className="flex items-center justify-center gap-3 flex-wrap">
						<Button
							asChild
							className="bg-white text-brand hover:bg-white/90 gap-2 font-semibold"
						>
							<a href="#join">
								<Store size={16} />
								List your restaurant
							</a>
						</Button>
						<Button
							variant="outline"
							asChild
							className="border-white/20 text-white bg-transparent hover:bg-white/10 hover:text-white"
						>
							<a href="#how-it-works">How it works</a>
						</Button>
					</div>

					<div className="mt-14 flex justify-center">
						<div className="w-28 h-28 rounded-full bg-white/10 border border-white/20 flex items-center justify-center">
							<ShoppingBag size={56} className="text-white" />
						</div>
					</div>

					<div className="mt-12 pt-8 border-t border-white/20 flex flex-wrap justify-center gap-8 md:gap-16">
						{stats.map((s) => (
							<div key={s.label} className="text-center">
								<p className="text-2xl font-bold text-white">{s.value}</p>
								<p className="text-xs text-white/60 mt-0.5">{s.label}</p>
							</div>
						))}
					</div>
				</div>
			</section>

			<section className="max-w-4xl mx-auto px-4 py-16">
				<p className="text-xs font-semibold tracking-widest text-brand uppercase mb-2">
					Why partner with us
				</p>
				<h2 className="text-2xl md:text-3xl font-bold text-foreground mb-3">
					Everything you need to grow
				</h2>
				<p className="text-muted-foreground text-sm mb-10 max-w-md">
					We handle logistics, payments, and customer reach so you can focus on
					making great food.
				</p>

				<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
					{benefits.map((b) => (
						<div
							key={b.title}
							className="rounded-xl border border-border bg-card p-5"
						>
							<div className="w-10 h-10 rounded-lg bg-brand/10 flex items-center justify-center mb-3">
								<b.icon size={18} className="text-brand" />
							</div>
							<p className="font-semibold text-sm text-foreground mb-1">
								{b.title}
							</p>
							<p className="text-xs text-muted-foreground leading-relaxed">
								{b.desc}
							</p>
						</div>
					))}
				</div>
			</section>

			<Separator />

			<section
				id="how-it-works"
				className="max-w-4xl mx-auto px-4 py-16 scroll-mt-8"
			>
				<p className="text-xs font-semibold tracking-widest text-brand uppercase mb-2">
					Getting started
				</p>
				<h2 className="text-2xl md:text-3xl font-bold text-foreground mb-8">
					Live on the platform in 3 steps
				</h2>

				<div className="divide-y divide-border">
					{steps.map((s) => (
						<div key={s.n} className="flex gap-5 py-5">
							<div className="w-8 h-8 rounded-full bg-brand text-white flex items-center justify-center text-sm font-semibold shrink-0 mt-0.5">
								{s.n}
							</div>
							<div>
								<p className="font-semibold text-foreground text-sm mb-1">
									{s.title}
								</p>
								<p className="text-sm text-muted-foreground leading-relaxed">
									{s.desc}
								</p>
							</div>
						</div>
					))}
				</div>
			</section>

			<Separator />

			<section className="max-w-4xl mx-auto px-4 py-16">
				<p className="text-xs font-semibold tracking-widest text-brand uppercase mb-2">
					Requirements
				</p>
				<h2 className="text-2xl md:text-3xl font-bold text-foreground mb-8">
					What you need to get started
				</h2>

				<div className="flex flex-col gap-3">
					{requirements.map((r) => (
						<div
							key={r}
							className="flex items-center gap-3 text-sm text-foreground"
						>
							<CircleCheck size={16} className="text-brand shrink-0" />
							{r}
						</div>
					))}
				</div>
			</section>

			<Separator />

			<section className="max-w-4xl mx-auto px-4 py-16">
				<p className="text-xs font-semibold tracking-widest text-brand uppercase mb-2">
					Questions
				</p>
				<h2 className="text-2xl md:text-3xl font-bold text-foreground mb-8">
					Frequently asked
				</h2>

				<Accordion type="single" collapsible className="w-full">
					{faqs.map((f, i) => (
						<AccordionItem key={i} value={`faq-${i}`}>
							<AccordionTrigger className="text-sm font-medium text-left">
								{f.q}
							</AccordionTrigger>
							<AccordionContent className="text-sm text-muted-foreground leading-relaxed">
								{f.a}
							</AccordionContent>
						</AccordionItem>
					))}
				</Accordion>
			</section>

			<section
				id="join"
				className="relative overflow-hidden bg-gradient-to-br from-brand to-brand-dark py-20 px-4 text-center scroll-mt-8"
			>
				<div className="absolute inset-0 opacity-10 pointer-events-none">
					<div className="absolute -top-10 -right-10 size-72 rounded-full bg-white" />
					<div className="absolute -bottom-20 -left-10 size-96 rounded-full bg-white" />
				</div>

				<div className="relative">
					<p className="text-xs font-semibold tracking-widest text-white/60 uppercase mb-3">
						Partner with us
					</p>
					<h2 className="text-2xl md:text-3xl font-bold text-white mb-3">
						Ready to start selling?
					</h2>
					<p className="text-white/70 text-sm mb-8 max-w-sm mx-auto leading-relaxed">
						Create your vendor account or sign in to manage your restaurant.
					</p>
					<div className="flex items-center justify-center gap-3 flex-wrap">
						<Button
							asChild
							className="bg-white text-brand hover:bg-white/90 font-semibold"
						>
							<Link href="/register?role=vendor">List your restaurant</Link>
						</Button>
						<Button
							asChild
							variant="outline"
							className="border-white/20 text-white bg-transparent hover:bg-white/10 hover:text-white"
						>
							<Link href="/login">Sign in</Link>
						</Button>
					</div>
				</div>
			</section>
		</div>
	);
}
