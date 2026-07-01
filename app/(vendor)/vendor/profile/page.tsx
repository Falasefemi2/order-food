"use client";

import * as Effect from "effect/Effect";
import { Camera, Loader2, ShieldCheck } from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { CustomerPageHeader } from "@/components/customer/customer-page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AuthApi } from "@/lib/auth/auth-api";
import type { UserProfile } from "@/lib/auth/auth-schema";
import { runtime } from "@/lib/runtime";

export default function VendorProfilePage() {
	const [profile, setProfile] = useState<UserProfile | null>(null);
	const [loading, setLoading] = useState(true);
	const [uploading, setUploading] = useState(false);
	const fileInputRef = useRef<HTMLInputElement | null>(null);

	const loadProfile = async () => {
		setLoading(true);
		try {
			const result = await runtime.runPromise(
				Effect.gen(function* () {
					const auth = yield* AuthApi;
					return yield* auth.me();
				}),
			);
			setProfile(result);
		} catch {
			toast.error("Unable to load profile");
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		loadProfile();
	}, []);

	const handleAvatarChange = async (
		event: React.ChangeEvent<HTMLInputElement>,
	) => {
		const file = event.target.files?.[0];
		if (!file) return;

		setUploading(true);
		try {
			const updated = await runtime.runPromise(
				Effect.gen(function* () {
					const auth = yield* AuthApi;
					return yield* auth.uploadAvatar(file);
				}),
			);
			setProfile(updated);
			toast.success("Avatar updated successfully");
		} catch {
			toast.error("Failed to upload avatar");
		} finally {
			setUploading(false);
			event.target.value = "";
		}
	};

	return (
		<div className="min-h-screen bg-gray-50">
			<CustomerPageHeader title="Vendor profile" />

			<main className="mx-auto max-w-2xl px-4 py-6">
				<Card className="overflow-hidden border-border/60">
					<CardContent className="p-0">
						<div className="bg-linear-to-br from-brand to-brand-dark px-4 py-6 text-white">
							<div className="flex items-center gap-4">
								<div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl border border-white/20 bg-white/10">
									{profile?.avatarUrl ? (
										<Image
											src={profile.avatarUrl}
											alt="Profile picture"
											fill
											className="object-cover"
										/>
									) : (
										<div className="flex h-full w-full items-center justify-center text-2xl font-bold">
											{profile
												? `${profile.firstName[0]}${profile.lastName[0]}`.toUpperCase()
												: "?"}
										</div>
									)}
								</div>

								<div className="min-w-0 flex-1">
									<p className="text-xs uppercase tracking-[0.28em] text-white/60">
										Vendor profile
									</p>
									<h1 className="text-xl font-bold">
										{loading
											? "Loading..."
											: `${profile?.firstName ?? ""} ${profile?.lastName ?? ""}`.trim()}
									</h1>
									<p className="text-sm text-white/70">{profile?.email}</p>
								</div>
							</div>
						</div>

						<div className="px-4 py-4">
							<div className="flex items-center justify-between">
								<div>
									<p className="text-sm font-semibold text-foreground">
										Personal info
									</p>
									<p className="text-xs text-muted-foreground">
										Manage your vendor details
									</p>
								</div>

								<Button
									variant="outline"
									size="sm"
									onClick={() => fileInputRef.current?.click()}
									disabled={uploading}
									className="gap-2"
								>
									{uploading ? (
										<Loader2 size={14} className="animate-spin" />
									) : (
										<Camera size={14} />
									)}
									{uploading ? "Uploading..." : "Change photo"}
								</Button>
							</div>

							<input
								type="file"
								accept="image/*"
								ref={fileInputRef}
								className="hidden"
								onChange={handleAvatarChange}
							/>

							<div className="mt-4 space-y-3">
								<div className="rounded-2xl bg-muted/50 px-4 py-3">
									<p className="text-xs text-muted-foreground">Full name</p>
									<p className="text-sm font-semibold text-foreground">
										{profile ? `${profile.firstName} ${profile.lastName}` : "—"}
									</p>
								</div>
								<div className="rounded-2xl bg-muted/50 px-4 py-3">
									<p className="text-xs text-muted-foreground">Email</p>
									<p className="text-sm font-semibold text-foreground">
										{profile?.email ?? "—"}
									</p>
								</div>
								<div className="rounded-2xl bg-muted/50 px-4 py-3">
									<p className="text-xs text-muted-foreground">
										Wallet balance
									</p>
									<p className="text-sm font-semibold text-foreground">
										₦
										{Number.parseFloat(
											profile?.walletBalance ?? "0",
										).toLocaleString("en-NG", { minimumFractionDigits: 2 })}
									</p>
								</div>
								<div className="rounded-2xl bg-muted/50 px-4 py-3">
									<p className="text-xs text-muted-foreground">Member since</p>
									<p className="text-sm font-semibold text-foreground">
										{profile?.createdAt
											? new Date(profile.createdAt).toLocaleDateString(
													"en-NG",
													{ year: "numeric", month: "long", day: "numeric" },
												)
											: "—"}
									</p>
								</div>
							</div>

							<div className="mt-4 rounded-2xl border border-green-200 bg-green-50 px-4 py-3">
								<div className="flex items-center gap-2">
									<ShieldCheck size={16} className="text-green-700" />
									<span className="text-sm font-semibold text-green-800">
										Verified account
									</span>
								</div>
								<p className="mt-1 text-xs text-green-700">
									Your vendor profile is secure and ready for restaurant
									management.
								</p>
							</div>
						</div>
					</CardContent>
				</Card>
			</main>
		</div>
	);
}
