"use client";

import {
	CircleCheck,
	Clock,
	CreditCard,
	Headset,
	Motorbike,
	ShieldCheck,
	TrendingUp,
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
	{ value: "5,000+", label: "Active riders" },
	{ value: "₦80k+", label: "Avg. monthly earnings" },
	{ value: "3 cities", label: "And growing" },
	{ value: "Daily", label: "Payouts" },
];

const benefits = [
	{
		icon: Clock,
		title: "Your schedule",
		desc: "Log in and out whenever you want. No minimum hours, no penalties.",
	},
	{
		icon: CreditCard,
		title: "Daily payouts",
		desc: "Withdraw your earnings every day directly to your bank account.",
	},
	{
		icon: TrendingUp,
		title: "Earn more with bonuses",
		desc: "Peak-hour bonuses, referral rewards, and weekly incentive challenges.",
	},
	{
		icon: Headset,
		title: "24/7 rider support",
		desc: "A dedicated team ready to help when you need it, any hour.",
	},
	{
		icon: ShieldCheck,
		title: "Insurance coverage",
		desc: "Basic accident coverage while you're on active deliveries.",
	},
	{
		icon: TrendingUp,
		title: "Grow with us",
		desc: "Top riders unlock higher tiers, better zones, and priority order access.",
	},
];

const steps = [
	{
		n: "1",
		title: "Create your rider account",
		desc: "Sign up below with your basic info. Takes under two minutes.",
	},
	{
		n: "2",
		title: "Submit your documents",
		desc: "Upload your government ID, vehicle papers, and a clear profile photo. Our team reviews within 24 hours.",
	},
	{
		n: "3",
		title: "Start accepting orders",
		desc: "Once approved, download the rider app, go online, and start earning.",
	},
];

const requirements = [
	"A motorcycle or bicycle in good working condition",
	"Valid government-issued ID (NIN, voter's card, or passport)",
	"Vehicle registration and insurance documents",
	"A smartphone (Android 8.0+ or iOS 13+)",
	"A bank account for payouts",
	"At least 18 years old",
];

const faqs = [
	{
		q: "How much can I earn per delivery?",
		a: "Earnings per delivery depend on distance and order size, typically ₦400–₦1,200 per trip. Peak hours and bonuses can significantly increase this.",
	},
	{
		q: "Can I ride part-time?",
		a: "Yes. There are no minimum hour requirements. You can go online and offline whenever you like — many of our riders combine this with other jobs.",
	},
	{
		q: "How long does verification take?",
		a: "Document review typically takes 24–48 hours on business days. You'll receive a notification in the app once your account is approved.",
	},
	{
		q: "Which cities are available?",
		a: "We currently operate in Lagos, Abuja, and Ibadan, with more cities coming soon. Register your interest even if your city isn't listed yet.",
	},
	{
		q: "When do I get paid?",
		a: "Earnings are credited to your in-app wallet in real time. You can withdraw to your bank account daily with no minimum withdrawal amount.",
	},
];

export default function RidersPage() {
	return (
		<div className="min-h-screen">
			<section className="relative overflow-hidden py-20 px-4 text-center bg-gradient-to-br from-brand to-brand-dark text-white">
				{/* Background circles */}
				<div className="absolute inset-0 opacity-10 pointer-events-none">
					<div className="absolute -top-10 -right-10 size-72 rounded-full bg-white" />
					<div className="absolute -bottom-20 -left-10 size-96 rounded-full bg-white" />
				</div>

				{/* Everything else stays relative */}
				<div className="relative">
					<Badge className="mb-4 bg-white/20 backdrop-blur-sm text-white border-transparent hover:bg-white/20">
						Chowdeck Riders
					</Badge>

					<h1 className="text-4xl md:text-6xl font-bold text-white leading-tight mb-5">
						Ride. Earn. <span className="text-yellow-300">Own your time.</span>
					</h1>

					<p className="text-white/80 text-base md:text-lg max-w-md mx-auto mb-8 leading-relaxed">
						Join our growing fleet of delivery riders and earn money on your
						schedule — with your own bike or car.
					</p>

					<div className="flex items-center justify-center gap-3 flex-wrap">
						<Button
							asChild
							className="bg-white text-brand hover:bg-white/90 gap-2 font-semibold"
						>
							<a href="#join">
								<Motorbike size={16} />
								Start riding
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
							<Motorbike size={56} className="text-white" />
						</div>
					</div>
					<div className="mt-12 pt-8  flex flex-wrap justify-center gap-8 md:gap-16">
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
				<p className="text-xs font-semibold tracking-widest text-green-600 uppercase mb-2">
					Why ride with us
				</p>
				<h2 className="text-2xl md:text-3xl font-bold text-foreground mb-3">
					Built for riders, not just deliveries
				</h2>
				<p className="text-muted-foreground text-sm mb-10 max-w-md">
					We give you the tools, flexibility, and support to earn on your terms.
				</p>

				<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
					{benefits.map((b) => (
						<div
							key={b.title}
							className="rounded-xl border border-border bg-card p-5"
						>
							<div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center mb-3">
								<b.icon size={18} className="text-green-600" />
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
				<p className="text-xs font-semibold tracking-widest text-green-600 uppercase mb-2">
					Getting started
				</p>
				<h2 className="text-2xl md:text-3xl font-bold text-foreground mb-8">
					On the road in 3 steps
				</h2>

				<div className="divide-y divide-border">
					{steps.map((s) => (
						<div key={s.n} className="flex gap-5 py-5">
							<div className="w-8 h-8 rounded-full bg-green-600 text-white flex items-center justify-center text-sm font-semibold shrink-0 mt-0.5">
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
				<p className="text-xs font-semibold tracking-widest text-green-600 uppercase mb-2">
					Requirements
				</p>
				<h2 className="text-2xl md:text-3xl font-bold text-foreground mb-8">
					What you need to ride
				</h2>

				<div className="flex flex-col gap-3">
					{requirements.map((r) => (
						<div
							key={r}
							className="flex items-center gap-3 text-sm text-foreground"
						>
							<CircleCheck size={16} className="text-green-600 shrink-0" />
							{r}
						</div>
					))}
				</div>
			</section>

			<Separator />

			<section className="max-w-4xl mx-auto px-4 py-16">
				<p className="text-xs font-semibold tracking-widest text-green-600 uppercase mb-2">
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
						Join the fleet
					</p>
					<h2 className="text-2xl md:text-3xl font-bold text-white mb-3">
						Ready to start riding?
					</h2>
					<p className="text-white/70 text-sm mb-8 max-w-sm mx-auto leading-relaxed">
						Create your account or sign in to continue your application.
					</p>
					<div className="flex items-center justify-center gap-3 flex-wrap">
						<Button
							asChild
							className="bg-white text-brand hover:bg-white/90 font-semibold"
						>
							<Link href="/register?role=driver">Create rider account</Link>
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
