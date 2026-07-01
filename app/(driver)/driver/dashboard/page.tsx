"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as Effect from "effect/Effect";
import {
	Bike,
	Camera,
	Clock3,
	FileCheck,
	Loader2,
	MapPin,
	ShieldCheck,
	UserRound,
} from "lucide-react";
import { useRef } from "react";
import { toast } from "sonner";
import { CustomerPageHeader } from "@/components/customer/customer-page-header";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { AuthApi } from "@/lib/auth/auth-api";
import { DriverApi } from "@/lib/driver-api";
import { queryKeys } from "@/lib/queryKeys";
import { runApi } from "@/lib/runtime";

const quickActions = [
	{
		href: "#pending-request",
		icon: Clock3,
		label: "Pending request",
		desc: "Review delivery invitations",
		color: "bg-orange-50 text-orange-600",
	},
	{
		href: "#status-panel",
		icon: ShieldCheck,
		label: "Availability",
		desc: "Switch online or offline",
		color: "bg-blue-50 text-blue-600",
	},
	{
		href: "#profile-overview",
		icon: UserRound,
		label: "Profile",
		desc: "Check your driver details",
		color: "bg-purple-50 text-purple-600",
	},
];

export default function DriverDashboard() {
	const queryClient = useQueryClient();
	const avatarInputRef = useRef<HTMLInputElement | null>(null);
	const licenseInputRef = useRef<HTMLInputElement | null>(null);
	const vehicleInputRef = useRef<HTMLInputElement | null>(null);
	const nationalIdInputRef = useRef<HTMLInputElement | null>(null);

	const { data: user, isLoading: userLoading } = useQuery({
		queryKey: queryKeys.user.me,
		queryFn: () =>
			runApi(
				Effect.gen(function* () {
					const auth = yield* AuthApi;
					return yield* auth.me();
				}),
			),
	});

	const { data: driverProfile, isLoading: driverProfileLoading } = useQuery({
		queryKey: queryKeys.driver.profile,
		queryFn: () =>
			runApi(
				Effect.gen(function* () {
					const driver = yield* DriverApi;
					return yield* driver.getMyProfile();
				}),
			),
	});

	const { data: pendingRequest, isLoading: pendingRequestLoading } = useQuery({
		queryKey: queryKeys.driver.pendingRequest,
		queryFn: () =>
			runApi(
				Effect.gen(function* () {
					const driver = yield* DriverApi;
					return yield* driver.getMyPendingRequest();
				}),
			),
	});

	const loading = userLoading || driverProfileLoading || pendingRequestLoading;

	const updateStatusMutation = useMutation({
		mutationFn: (nextStatus: "online_idle" | "offline") =>
			runApi(
				Effect.gen(function* () {
					const driver = yield* DriverApi;
					return yield* driver.updateStatus(nextStatus);
				}),
			),
		onSuccess: (_, nextStatus) => {
			toast.success(
				nextStatus === "online_idle"
					? "You are now online for deliveries"
					: "You are now offline",
			);
			queryClient.invalidateQueries({ queryKey: queryKeys.driver.profile });
		},
		onError: () => {
			toast.error("Unable to update delivery status right now.");
		},
	});

	const handleToggleAvailability = async () => {
		if (!driverProfile) {
			return;
		}

		const nextStatus =
			driverProfile.status === "online_idle" ? "offline" : "online_idle";

		updateStatusMutation.mutate(nextStatus);
	};

	const statusUpdating = updateStatusMutation.isPending;

	const avatarMutation = useMutation({
		mutationFn: (file: File) =>
			runApi(
				Effect.gen(function* () {
					const auth = yield* AuthApi;
					return yield* auth.uploadAvatar(file);
				}),
			),
		onSuccess: () => {
			toast.success("Avatar updated successfully");
			queryClient.invalidateQueries({ queryKey: queryKeys.user.me });
		},
		onError: () => {
			toast.error("Failed to upload avatar");
		},
	});

	const handleAvatarChange = async (
		event: React.ChangeEvent<HTMLInputElement>,
	) => {
		const file = event.target.files?.[0];
		if (!file) {
			return;
		}

		avatarMutation.mutate(file);
		event.target.value = "";
	};

	const uploadingAvatar = avatarMutation.isPending;

	const uploadDocumentMutation = useMutation({
		mutationFn: ({
			kind,
			file,
		}: {
			kind: "license" | "vehicle" | "nationalId";
			file: File;
		}) =>
			runApi(
				Effect.gen(function* () {
					const driver = yield* DriverApi;

					if (kind === "license") {
						return yield* driver.uploadLicenseImage(file);
					}

					if (kind === "vehicle") {
						return yield* driver.uploadVehicleImage(file);
					}

					return yield* driver.uploadNationalIdImage(file);
				}),
			),
		onSuccess: () => {
			toast.success("Document uploaded successfully");
			queryClient.invalidateQueries({ queryKey: queryKeys.driver.profile });
		},
		onError: () => {
			toast.error("Unable to upload this document right now.");
		},
	});

	const handleUploadDocument = async (
		kind: "license" | "vehicle" | "nationalId",
		file: File,
	) => {
		uploadDocumentMutation.mutate({ kind, file });
	};

	const handleDocumentInputChange = (
		kind: "license" | "vehicle" | "nationalId",
	) => {
		return async (event: React.ChangeEvent<HTMLInputElement>) => {
			const file = event.target.files?.[0];
			if (!file) {
				return;
			}

			await handleUploadDocument(kind, file);
			event.target.value = "";
		};
	};

	const uploadingDocument = uploadDocumentMutation.isPending
		? (uploadDocumentMutation.variables?.kind ?? null)
		: null;

	const acceptRequestMutation = useMutation({
		mutationFn: (requestId: string) =>
			runApi(
				Effect.gen(function* () {
					const driver = yield* DriverApi;
					return yield* driver.acceptDeliveryRequest(requestId);
				}),
			),
		onSuccess: () => {
			toast.success("Delivery request accepted");
			queryClient.invalidateQueries({ queryKey: queryKeys.driver.profile });
			queryClient.invalidateQueries({
				queryKey: queryKeys.driver.pendingRequest,
			});
		},
		onError: () => {
			toast.error("Unable to accept this delivery request right now.");
		},
	});

	const handleAcceptRequest = async () => {
		if (!pendingRequest) {
			return;
		}

		acceptRequestMutation.mutate(pendingRequest.id);
	};

	const declineRequestMutation = useMutation({
		mutationFn: (requestId: string) =>
			runApi(
				Effect.gen(function* () {
					const driver = yield* DriverApi;
					return yield* driver.declineDeliveryRequest(requestId);
				}),
			),
		onSuccess: () => {
			toast.success("Delivery request declined");
			queryClient.invalidateQueries({
				queryKey: queryKeys.driver.pendingRequest,
			});
		},
		onError: () => {
			toast.error("Unable to decline this delivery request right now.");
		},
	});

	const handleDeclineRequest = async () => {
		if (!pendingRequest) {
			return;
		}

		declineRequestMutation.mutate(pendingRequest.id);
	};

	const requestUpdating =
		acceptRequestMutation.isPending || declineRequestMutation.isPending;

	const initials = user
		? `${user.firstName[0]}${user.lastName[0]}`.toUpperCase()
		: "DR";

	const formatTimestamp = (value: string | null | undefined) => {
		if (!value) {
			return "—";
		}

		return new Intl.DateTimeFormat("en-NG", {
			month: "short",
			day: "numeric",
			hour: "numeric",
			minute: "2-digit",
		}).format(new Date(value));
	};

	const statusLabel =
		driverProfile?.status === "online_idle" ? "Online" : "Offline";
	const approvalLabel = driverProfile?.approvalStatus ?? "Pending review";

	return (
		<div className="min-h-screen bg-gray-50">
			<CustomerPageHeader title="Driver dashboard" />

			<main className="mx-auto max-w-4xl px-4 py-6">
				<section className="rounded-3xl bg-linear-to-br from-brand to-brand-dark px-5 py-6 text-white shadow-lg">
					<div className="flex items-start justify-between gap-4">
						<div className="flex items-center gap-3">
							<div className="relative">
								<Avatar className="h-14 w-14 border-2 border-white/25">
									<AvatarImage src={user?.avatarUrl ?? undefined} />
									<AvatarFallback className="bg-white/20 text-base font-semibold text-white">
										{loading ? "…" : initials}
									</AvatarFallback>
								</Avatar>

								<Button
									variant="ghost"
									size="icon"
									onClick={() => avatarInputRef.current?.click()}
									disabled={uploadingAvatar}
									className="absolute -bottom-1 -right-1 h-7 w-7 rounded-full border border-white/20 bg-white text-brand shadow-sm"
									aria-label="Change avatar"
								>
									{uploadingAvatar ? (
										<Loader2 size={12} className="animate-spin" />
									) : (
										<Camera size={12} />
									)}
								</Button>

								<input
									type="file"
									accept="image/*"
									ref={avatarInputRef}
									className="hidden"
									onChange={handleAvatarChange}
								/>
							</div>

							<div>
								<p className="text-xs uppercase tracking-[0.32em] text-white/60">
									Driver portal
								</p>
								<h1 className="mt-2 text-2xl font-bold">
									{loading
										? "Loading..."
										: `${user?.firstName ?? "Driver"} ${user?.lastName ?? ""}`.trim()}
								</h1>
							</div>
						</div>

						<Badge className="border-white/20 bg-white/10 text-white hover:bg-white/10">
							{approvalLabel}
						</Badge>
					</div>
				</section>

				<div className="mt-6 grid gap-3 md:grid-cols-3">
					<div className="rounded-2xl bg-white px-4 py-3 shadow-sm">
						<p className="text-[10px] uppercase tracking-[0.28em] text-muted-foreground">
							Vehicle
						</p>
						<p className="mt-2 text-sm font-semibold text-foreground">
							{driverProfile?.vehicleType ?? "Not set"}
						</p>
					</div>

					<div className="rounded-2xl bg-white px-4 py-3 shadow-sm">
						<p className="text-[10px] uppercase tracking-[0.28em] text-muted-foreground">
							Status
						</p>
						<p className="mt-2 text-sm font-semibold text-foreground">
							{statusLabel}
						</p>
					</div>

					<div className="rounded-2xl bg-white px-4 py-3 shadow-sm">
						<p className="text-[10px] uppercase tracking-[0.28em] text-muted-foreground">
							Rating
						</p>
						<p className="mt-2 text-sm font-semibold text-foreground">
							{driverProfile?.ratingAvg ?? "0.0"}
						</p>
					</div>
				</div>

				<div className="mt-6 grid gap-3 md:grid-cols-3">
					{quickActions.map((action) => {
						const Icon = action.icon;

						return (
							<a key={action.href} href={action.href}>
								<Card className="border-border/60 transition-shadow hover:shadow-md">
									<CardContent className="flex items-center gap-3 p-4">
										<div
											className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${action.color}`}
										>
											<Icon size={20} />
										</div>
										<div className="min-w-0">
											<p className="text-sm font-semibold text-foreground">
												{action.label}
											</p>
											<p className="mt-1 text-xs text-muted-foreground">
												{action.desc}
											</p>
										</div>
									</CardContent>
								</Card>
							</a>
						);
					})}
				</div>

				<Separator className="my-6" />

				<section
					id="status-panel"
					className="rounded-3xl bg-white p-5 shadow-sm"
				>
					<div className="flex items-center justify-between gap-3">
						<div>
							<p className="text-sm font-semibold text-foreground">
								Availability
							</p>
							<p className="text-xs text-muted-foreground">
								{statusLabel === "Online"
									? "Ready to receive delivery requests"
									: "Currently unavailable for deliveries"}
							</p>
						</div>

						<Button
							onClick={handleToggleAvailability}
							disabled={statusUpdating || loading}
							className={
								statusLabel === "Online"
									? "bg-red-500 hover:bg-red-600"
									: "bg-brand hover:bg-brand/90"
							}
						>
							{statusUpdating
								? "Updating..."
								: statusLabel === "Online"
									? "Go offline"
									: "Go online"}
						</Button>
					</div>
				</section>

				<section
					id="pending-request"
					className="mt-6 rounded-3xl bg-white p-5 shadow-sm"
				>
					<div className="flex items-center justify-between gap-3">
						<div>
							<p className="text-sm font-semibold text-foreground">
								Pending delivery request
							</p>
							<p className="text-xs text-muted-foreground">
								Latest pickup from your dispatch queue
							</p>
						</div>
						<Badge variant="outline">{pendingRequest ? "New" : "None"}</Badge>
					</div>

					{pendingRequest ? (
						<div className="mt-4 rounded-2xl bg-muted/50 p-4">
							<div className="flex items-center gap-3">
								<div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand/10 text-brand">
									<Bike size={20} />
								</div>
								<div>
									<p className="text-sm font-semibold text-foreground">
										Order {pendingRequest.orderId}
									</p>
									<p className="text-xs text-muted-foreground">
										Expires {formatTimestamp(pendingRequest.expiresAt)}
									</p>
								</div>
							</div>

							<div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
								<MapPin size={14} />
								<span>Request status: {pendingRequest.status}</span>
							</div>

							<div className="mt-4 flex gap-2">
								<Button
									onClick={handleAcceptRequest}
									disabled={requestUpdating}
								>
									{requestUpdating ? "Processing..." : "Accept"}
								</Button>
								<Button
									variant="outline"
									onClick={handleDeclineRequest}
									disabled={requestUpdating}
								>
									Decline
								</Button>
							</div>
						</div>
					) : (
						<div className="mt-4 rounded-2xl border border-dashed border-muted-foreground/25 px-4 py-8 text-center">
							<p className="text-sm font-semibold text-foreground">
								No pending delivery requests
							</p>
							<p className="mt-1 text-xs text-muted-foreground">
								You’ll see a new request here when one is assigned.
							</p>
						</div>
					)}
				</section>

				<section
					id="profile-overview"
					className="mt-6 rounded-3xl bg-white p-5 shadow-sm"
				>
					<div>
						<p className="text-sm font-semibold text-foreground">
							Driver profile overview
						</p>
						<p className="text-xs text-muted-foreground">
							Keep your driver details and supporting documents up to date.
						</p>
					</div>

					<div className="mt-4 grid gap-3 md:grid-cols-2">
						<div className="rounded-2xl bg-muted/50 px-4 py-3">
							<p className="text-[10px] uppercase tracking-[0.28em] text-muted-foreground">
								License number
							</p>
							<p className="mt-2 text-sm font-semibold text-foreground">
								{driverProfile?.licenseNumber ?? "Not provided"}
							</p>
						</div>

						<div className="rounded-2xl bg-muted/50 px-4 py-3">
							<p className="text-[10px] uppercase tracking-[0.28em] text-muted-foreground">
								Vehicle plate
							</p>
							<p className="mt-2 text-sm font-semibold text-foreground">
								{driverProfile?.vehiclePlateNumber ?? "Not provided"}
							</p>
						</div>

						<div className="rounded-2xl bg-muted/50 px-4 py-3">
							<p className="text-[10px] uppercase tracking-[0.28em] text-muted-foreground">
								Vehicle model
							</p>
							<p className="mt-2 text-sm font-semibold text-foreground">
								{driverProfile?.vehicleModel ?? "Not provided"}
							</p>
						</div>

						<div className="rounded-2xl bg-muted/50 px-4 py-3">
							<p className="text-[10px] uppercase tracking-[0.28em] text-muted-foreground">
								Last seen
							</p>
							<p className="mt-2 text-sm font-semibold text-foreground">
								{formatTimestamp(driverProfile?.lastLocationUpdate)}
							</p>
						</div>
					</div>

					<div className="mt-4 grid gap-3 md:grid-cols-3">
						{[
							{
								key: "license" as const,
								label: "License",
								imageUrl: driverProfile?.licenseImageUrl,
								reference: licenseInputRef,
								onChange: handleDocumentInputChange("license"),
							},
							{
								key: "vehicle" as const,
								label: "Vehicle",
								imageUrl: driverProfile?.vehicleImageUrl,
								reference: vehicleInputRef,
								onChange: handleDocumentInputChange("vehicle"),
							},
							{
								key: "nationalId" as const,
								label: "National ID",
								imageUrl: driverProfile?.nationalIdImageUrl,
								reference: nationalIdInputRef,
								onChange: handleDocumentInputChange("nationalId"),
							},
						].map((item) => (
							<div
								key={item.key}
								className="rounded-2xl border border-border/60 p-3"
							>
								<div className="flex items-center justify-between gap-2">
									<p className="text-sm font-semibold text-foreground">
										{item.label}
									</p>
									<Button
										variant="outline"
										size="sm"
										onClick={() => item.reference.current?.click()}
										disabled={uploadingDocument === item.key}
										className="gap-2"
									>
										{uploadingDocument === item.key ? (
											<Loader2 size={14} className="animate-spin" />
										) : (
											<Camera size={14} />
										)}
										{uploadingDocument === item.key ? "Uploading..." : "Upload"}
									</Button>
								</div>

								<input
									type="file"
									accept="image/*"
									ref={item.reference}
									className="hidden"
									onChange={item.onChange}
								/>

								<div className="mt-3 overflow-hidden rounded-xl border border-border/40 bg-muted/30">
									<div className="relative aspect-4/3">
										{item.imageUrl ? (
											<img
												src={item.imageUrl}
												alt={`${item.label} document`}
												className="h-full w-full object-cover"
											/>
										) : (
											<div className="flex h-full w-full items-center justify-center bg-muted/50">
												<FileCheck
													size={24}
													className="text-muted-foreground"
												/>
											</div>
										)}
									</div>
								</div>
							</div>
						))}
					</div>
				</section>
			</main>
		</div>
	);
}
