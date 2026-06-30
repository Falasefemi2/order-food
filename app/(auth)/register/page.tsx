"use client";

import { Eye, EyeOff, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
	Field,
	FieldDescription,
	FieldGroup,
	FieldLabel,
	FieldSet,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { registerAndRedirect } from "@/lib/auth-direction";

type Role = "customer" | "vendor" | "driver";

const roles: { id: Role; label: string; emoji: string; desc: string }[] = [
	{
		id: "customer",
		label: "Customer",
		emoji: "🛒",
		desc: "Order food from restaurants",
	},
	{
		id: "vendor",
		label: "Restaurant Owner",
		emoji: "🍽",
		desc: "List and manage your restaurant",
	},
	{
		id: "driver",
		label: "Delivery Driver",
		emoji: "🛵",
		desc: "Earn by delivering orders",
	},
];

export default function RegisterPage() {
	const router = useRouter();
	const [form, setForm] = useState({
		firstName: "",
		lastName: "",
		email: "",
		phoneNumber: "",
		password: "",
		confirmPassword: "",
	});
	const [role, setRole] = useState<Role>("customer");
	const [showPw, setShowPw] = useState(false);
	const [showConfirm, setShowConfirm] = useState(false);
	const [loading, setLoading] = useState(false);
	const [step, setStep] = useState<1 | 2>(1);

	const patch =
		(key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
			setForm((prev) => ({ ...prev, [key]: e.target.value }));

	const handleNext = (e: React.FormEvent) => {
		e.preventDefault();
		if (form.password.length < 8) {
			toast.error("Password too short", {
				description: "Password must be at least 8 characters.",
			});
			return;
		}
		if (form.password !== form.confirmPassword) {
			toast.error("Passwords don't match", {
				description: "Please make sure both passwords are the same.",
			});
			return;
		}
		setStep(2);
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);
		try {
			await registerAndRedirect(
				{
					firstName: form.firstName,
					lastName: form.lastName,
					email: form.email,
					password: form.password,
					phoneNumber: form.phoneNumber || undefined,
					role,
				},
				router,
			);
			toast.success("Account created!", {
				description: "Welcome to Chowdeck.",
			});
		} catch (err: any) {
			const msg = err?.message ?? String(err);
			if (msg.includes("already")) {
				toast.error("Email already in use", {
					description: "An account with this email already exists.",
				});
			} else {
				toast.error("Registration failed", {
					description: "Please try again.",
				});
			}
			setStep(1);
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
			{/* Header */}
			<div className="text-center mb-6">
				<h1 className="text-2xl font-bold text-gray-900">
					Create your account
				</h1>
				<p className="text-muted-foreground text-sm mt-1.5">
					Join thousands ordering on Order&Eat
				</p>
			</div>

			{/* Step indicator */}
			<div className="flex items-center gap-2 mb-7">
				{([1, 2] as const).map((s) => (
					<div key={s} className="flex items-center gap-2 flex-1">
						<div
							className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-colors ${
								step >= s
									? "bg-primary text-primary-foreground"
									: "bg-muted text-muted-foreground"
							}`}
						>
							{s}
						</div>
						<span
							className={`text-xs font-medium hidden sm:block transition-colors ${
								step >= s ? "text-primary" : "text-muted-foreground"
							}`}
						>
							{s === 1 ? "Your details" : "Choose role"}
						</span>
						{s < 2 && (
							<div
								className={`flex-1 h-px transition-colors ${step > s ? "bg-primary" : "bg-border"}`}
							/>
						)}
					</div>
				))}
			</div>

			{/* Step 1 — Personal info */}
			{step === 1 && (
				<form onSubmit={handleNext}>
					<FieldSet className="w-full">
						<FieldGroup>
							{/* Name row */}
							<div className="grid grid-cols-2 gap-3">
								<Field>
									<FieldLabel htmlFor="firstName">First name</FieldLabel>
									<Input
										id="firstName"
										type="text"
										required
										placeholder="Emeka"
										value={form.firstName}
										onChange={patch("firstName")}
									/>
								</Field>
								<Field>
									<FieldLabel htmlFor="lastName">Last name</FieldLabel>
									<Input
										id="lastName"
										type="text"
										required
										placeholder="Obi"
										value={form.lastName}
										onChange={patch("lastName")}
									/>
								</Field>
							</div>

							<Field>
								<FieldLabel htmlFor="email">Email address</FieldLabel>
								<Input
									id="email"
									type="email"
									required
									autoComplete="email"
									placeholder="you@example.com"
									value={form.email}
									onChange={patch("email")}
								/>
							</Field>

							<Field>
								<FieldLabel htmlFor="phone">
									Phone number{" "}
									<span className="text-muted-foreground font-normal">
										(optional)
									</span>
								</FieldLabel>
								<Input
									id="phone"
									type="tel"
									placeholder="+234 800 000 0000"
									value={form.phoneNumber}
									onChange={patch("phoneNumber")}
								/>
							</Field>

							<Field>
								<FieldLabel htmlFor="password">Password</FieldLabel>
								<FieldDescription>
									Must be at least 8 characters.
								</FieldDescription>
								<div className="relative">
									<Input
										id="password"
										type={showPw ? "text" : "password"}
										required
										minLength={8}
										placeholder="Min. 8 characters"
										value={form.password}
										onChange={patch("password")}
										className="pr-11"
									/>
									<button
										type="button"
										onClick={() => setShowPw(!showPw)}
										className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
									>
										{showPw ? <EyeOff size={18} /> : <Eye size={18} />}
									</button>
								</div>
							</Field>

							<Field>
								<FieldLabel htmlFor="confirmPassword">
									Confirm password
								</FieldLabel>
								<div className="relative">
									<Input
										id="confirmPassword"
										type={showConfirm ? "text" : "password"}
										required
										placeholder="Repeat password"
										value={form.confirmPassword}
										onChange={patch("confirmPassword")}
										className="pr-11"
									/>
									<button
										type="button"
										onClick={() => setShowConfirm(!showConfirm)}
										className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
									>
										{showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
									</button>
								</div>
							</Field>
						</FieldGroup>
					</FieldSet>

					<Button type="submit" className="w-full mt-6">
						Continue →
					</Button>
				</form>
			)}

			{/* Step 2 — Role selection */}
			{step === 2 && (
				<form onSubmit={handleSubmit} className="space-y-4">
					<p className="text-sm text-muted-foreground -mt-1">
						How will you use Chowdeck?
					</p>

					<div className="space-y-3">
						{roles.map((r) => (
							<button
								key={r.id}
								type="button"
								onClick={() => setRole(r.id)}
								className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all text-left ${
									role === r.id
										? "border-primary bg-primary/5"
										: "border-border hover:border-border/80 bg-white"
								}`}
							>
								<span className="text-3xl">{r.emoji}</span>
								<div className="flex-1">
									<p
										className={`font-semibold text-sm ${role === r.id ? "text-primary" : "text-foreground"}`}
									>
										{r.label}
									</p>
									<p className="text-xs text-muted-foreground mt-0.5">
										{r.desc}
									</p>
								</div>
								<div
									className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
										role === r.id ? "border-primary" : "border-border"
									}`}
								>
									{role === r.id && (
										<div className="w-2.5 h-2.5 rounded-full bg-primary" />
									)}
								</div>
							</button>
						))}
					</div>

					<div className="flex gap-3 pt-1">
						<Button
							type="button"
							variant="outline"
							onClick={() => setStep(1)}
							className="flex-1"
						>
							← Back
						</Button>
						<Button type="submit" disabled={loading} className="flex-1">
							{loading && <Loader2 size={16} className="animate-spin" />}
							{loading ? "Creating account..." : "Create account"}
						</Button>
					</div>
				</form>
			)}

			<p className="text-center text-sm text-muted-foreground mt-6">
				Already have an account?{" "}
				<Link
					href="/login"
					className="font-semibold text-primary hover:underline"
				>
					Sign in
				</Link>
			</p>
		</div>
	);
}
