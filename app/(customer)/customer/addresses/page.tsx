"use client";

import * as Effect from "effect/Effect";
import {
	CheckCircle2,
	Loader2,
	MapPin,
	Pencil,
	Plus,
	Star,
	Trash2,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { CustomerPageHeader } from "@/components/customer/customer-page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Field, FieldGroup, FieldLabel, FieldSet } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
	AddressApi,
	type AddressResponseType,
	type CreateAddressPayloadType,
	type UpdateAddressPayloadType,
} from "@/lib/customer/address-api";
import { runtime } from "@/lib/runtime";

type Modal =
	| { type: "add" }
	| { type: "edit"; address: AddressResponseType }
	| { type: "delete"; address: AddressResponseType }
	| null;

type AddressForm = {
	label: string;
	addressLine1: string;
	addressLine2: string;
	city: string;
	state: string;
	country: string;
	postalCode: string;
	latitude: string;
	longitude: string;
	isDefault: boolean;
};

const emptyForm: AddressForm = {
	label: "",
	addressLine1: "",
	addressLine2: "",
	city: "",
	state: "",
	country: "Nigeria",
	postalCode: "",
	latitude: "",
	longitude: "",
	isDefault: false,
};

export default function AddressesPage() {
	const [addresses, setAddresses] = useState<readonly AddressResponseType[]>(
		[],
	);
	const [loading, setLoading] = useState(true);
	const [modal, setModal] = useState<Modal>(null);

	const load = () =>
		runtime
			.runPromise(
				Effect.gen(function* () {
					const api = yield* AddressApi;
					return yield* api.list();
				}),
			)
			.then(setAddresses)
			.catch(() => setAddresses([]))
			.finally(() => setLoading(false));

	useEffect(() => {
		load();
	}, []);

	const handleSetDefault = (id: string) =>
		runtime
			.runPromise(
				Effect.gen(function* () {
					const api = yield* AddressApi;
					return yield* api.setDefault(id);
				}),
			)
			.then(() => {
				setAddresses((prev) =>
					prev.map((a) => ({ ...a, isDefault: a.id === id })),
				);
				toast.success("Default address updated");
			})
			.catch(() => toast.error("Failed to update default address"));

	const closeModal = () => setModal(null);
	const refresh = () => {
		load();
		closeModal();
	};

	return (
		<div className="min-h-screen bg-gray-50">
			<CustomerPageHeader title="Addresses" />
			<div className="max-w-xl mx-auto space-y-6 py-6 px-4">
				{/* Header */}
				<div className="flex items-center justify-between">
					<div>
						<h1 className="text-2xl font-bold text-foreground">Addresses</h1>
						<p className="text-sm text-muted-foreground mt-0.5">
							Manage your delivery locations
						</p>
					</div>
					<Button
						onClick={() => setModal({ type: "add" })}
						size="sm"
						className="gap-1.5"
					>
						<Plus size={15} />
						Add address
					</Button>
				</div>

				<Separator />

				{loading ? (
					<div className="space-y-3">
						{[1, 2, 3].map((i) => (
							<div
								key={i}
								className="h-24 bg-muted rounded-2xl animate-pulse"
							/>
						))}
					</div>
				) : addresses.length === 0 ? (
					<Card className="border-border/60">
						<CardContent className="py-16 flex flex-col items-center text-center">
							<div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center mb-3">
								<MapPin size={24} className="text-muted-foreground/40" />
							</div>
							<p className="font-semibold text-foreground mb-1">
								No addresses saved
							</p>
							<p className="text-sm text-muted-foreground mb-5">
								Add a delivery address to get started
							</p>
							<Button
								onClick={() => setModal({ type: "add" })}
								className="gap-2"
							>
								<Plus size={15} />
								Add first address
							</Button>
						</CardContent>
					</Card>
				) : (
					<div className="space-y-3">
						{addresses.map((addr) => (
							<Card
								key={addr.id}
								className={`transition-all border ${
									addr.isDefault
										? "border-brand/40 shadow-sm shadow-brand/10"
										: "border-border/60"
								}`}
							>
								<CardContent className="p-4">
									<div className="flex items-start gap-3">
										<div
											className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
												addr.isDefault
													? "bg-brand text-white"
													: "bg-muted text-muted-foreground"
											}`}
										>
											<MapPin size={15} />
										</div>

										<div className="flex-1 min-w-0">
											<div className="flex items-center gap-2 flex-wrap">
												<p className="font-semibold text-foreground text-sm">
													{addr.label || "Home"}
												</p>
												{addr.isDefault && (
													<Badge
														variant="outline"
														className="text-xs text-brand border-brand/30 py-0"
													>
														Default
													</Badge>
												)}
											</div>
											<p className="text-sm text-muted-foreground mt-0.5">
												{addr.addressLine1}
											</p>
											{addr.addressLine2 && (
												<p className="text-xs text-muted-foreground/70">
													{addr.addressLine2}
												</p>
											)}
											<p className="text-xs text-muted-foreground/70 mt-0.5">
												{addr.city}, {addr.state}, {addr.country}
											</p>
										</div>

										<div className="flex items-center gap-0.5 shrink-0">
											{!addr.isDefault && (
												<button
													onClick={() => handleSetDefault(addr.id)}
													title="Set as default"
													className="p-1.5 rounded-lg text-muted-foreground hover:text-yellow-500 hover:bg-yellow-50 transition-colors"
												>
													<Star size={14} />
												</button>
											)}
											<button
												onClick={() =>
													setModal({ type: "edit", address: addr })
												}
												className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
											>
												<Pencil size={14} />
											</button>
											<button
												onClick={() =>
													setModal({ type: "delete", address: addr })
												}
												className="p-1.5 rounded-lg text-muted-foreground hover:text-red-500 hover:bg-red-50 transition-colors"
											>
												<Trash2 size={14} />
											</button>
										</div>
									</div>
								</CardContent>
							</Card>
						))}
					</div>
				)}

				<AddressDialog
					open={modal?.type === "add" || modal?.type === "edit"}
					address={modal?.type === "edit" ? modal.address : undefined}
					onClose={closeModal}
					onRefresh={refresh}
				/>

				<DeleteDialog
					open={modal?.type === "delete"}
					address={modal?.type === "delete" ? modal.address : undefined}
					onClose={closeModal}
					onRefresh={refresh}
				/>
			</div>
		</div>
	);
}

function AddressDialog({
	open,
	address,
	onClose,
	onRefresh,
}: {
	open: boolean;
	address?: AddressResponseType;
	onClose: () => void;
	onRefresh: () => void;
}) {
	const [form, setForm] = useState<AddressForm>(emptyForm);
	const [loading, setLoading] = useState(false);

	useEffect(() => {
		if (open) {
			setForm(
				address
					? {
							label: address.label,
							addressLine1: address.addressLine1,
							addressLine2: address.addressLine2 ?? "",
							city: address.city,
							state: address.state,
							country: address.country,
							postalCode: address.postalCode ?? "",
							latitude: address.latitude,
							longitude: address.longitude,
							isDefault: address.isDefault,
						}
					: emptyForm,
			);
		}
	}, [open, address]);

	const patch =
		(key: keyof AddressForm) => (e: React.ChangeEvent<HTMLInputElement>) =>
			setForm((prev) => ({ ...prev, [key]: e.target.value }));

	const validate = (): string | null => {
		if (!form.addressLine1.trim() || !form.city.trim() || !form.state.trim())
			return "Address, city, and state are required.";
		const lat = parseFloat(form.latitude);
		const lng = parseFloat(form.longitude);
		if (isNaN(lat) || lat < -90 || lat > 90)
			return "Latitude must be between -90 and 90.";
		if (isNaN(lng) || lng < -180 || lng > 180)
			return "Longitude must be between -180 and 180.";
		return null;
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		const err = validate();
		if (err) {
			toast.error("Check your inputs", { description: err });
			return;
		}
		setLoading(true);
		try {
			await runtime.runPromise(
				Effect.gen(function* () {
					const api = yield* AddressApi;
					if (address) {
						const payload: UpdateAddressPayloadType = {
							label: form.label || undefined,
							addressLine1: form.addressLine1,
							addressLine2: form.addressLine2 || undefined,
							city: form.city,
							state: form.state,
							postalCode: form.postalCode || undefined,
							latitude: form.latitude || undefined,
							longitude: form.longitude || undefined,
							isDefault: form.isDefault,
						};
						yield* api.update(address.id, payload);
					} else {
						const payload: CreateAddressPayloadType = {
							label: form.label || undefined,
							addressLine1: form.addressLine1,
							addressLine2: form.addressLine2 || undefined,
							city: form.city,
							state: form.state,
							country: form.country || undefined,
							postalCode: form.postalCode || undefined,
							latitude: form.latitude,
							longitude: form.longitude,
							isDefault: form.isDefault,
						};
						yield* api.create(payload);
					}
				}),
			);
			toast.success(address ? "Address updated" : "Address added");
			onRefresh();
		} catch {
			toast.error("Failed to save address", {
				description: "Please try again.",
			});
		} finally {
			setLoading(false);
		}
	};

	return (
		<Dialog open={open} onOpenChange={(o) => !o && onClose()}>
			<DialogContent className="sm:max-w-md max-h-[90vh] flex flex-col p-0 overflow-hidden">
				<DialogHeader className="px-6 pt-6 pb-0">
					<DialogTitle>{address ? "Edit address" : "Add address"}</DialogTitle>
				</DialogHeader>

				<form
					onSubmit={handleSubmit}
					className="flex flex-col flex-1 overflow-hidden"
				>
					<div className="overflow-y-auto flex-1 px-6 py-4">
						<FieldSet className="w-full">
							<FieldGroup>
								<Field>
									<FieldLabel htmlFor="label">
										Label{" "}
										<span className="text-muted-foreground font-normal">
											(optional)
										</span>
									</FieldLabel>
									<Input
										id="label"
										placeholder="Home, Work, etc."
										value={form.label}
										onChange={patch("label")}
									/>
								</Field>

								<Field>
									<FieldLabel htmlFor="addressLine1">Address</FieldLabel>
									<Input
										id="addressLine1"
										required
										placeholder="12 Allen Avenue"
										value={form.addressLine1}
										onChange={patch("addressLine1")}
									/>
								</Field>

								<Field>
									<FieldLabel htmlFor="addressLine2">
										Address line 2{" "}
										<span className="text-muted-foreground font-normal">
											(optional)
										</span>
									</FieldLabel>
									<Input
										id="addressLine2"
										placeholder="Flat 3B"
										value={form.addressLine2}
										onChange={patch("addressLine2")}
									/>
								</Field>

								<div className="grid grid-cols-2 gap-3">
									<Field>
										<FieldLabel htmlFor="city">City</FieldLabel>
										<Input
											id="city"
											required
											placeholder="Lagos"
											value={form.city}
											onChange={patch("city")}
										/>
									</Field>
									<Field>
										<FieldLabel htmlFor="state">State</FieldLabel>
										<Input
											id="state"
											required
											placeholder="Lagos State"
											value={form.state}
											onChange={patch("state")}
										/>
									</Field>
								</div>

								<div className="grid grid-cols-2 gap-3">
									<Field>
										<FieldLabel htmlFor="country">Country</FieldLabel>
										<Input
											id="country"
											placeholder="Nigeria"
											value={form.country}
											onChange={patch("country")}
										/>
									</Field>
									<Field>
										<FieldLabel htmlFor="postalCode">Postal code</FieldLabel>
										<Input
											id="postalCode"
											placeholder="100001"
											value={form.postalCode}
											onChange={patch("postalCode")}
										/>
									</Field>
								</div>

								<div className="grid grid-cols-2 gap-3">
									<Field>
										<FieldLabel htmlFor="latitude">Latitude</FieldLabel>
										<Input
											id="latitude"
											placeholder="6.5244"
											value={form.latitude}
											onChange={patch("latitude")}
										/>
									</Field>
									<Field>
										<FieldLabel htmlFor="longitude">Longitude</FieldLabel>
										<Input
											id="longitude"
											placeholder="3.3792"
											value={form.longitude}
											onChange={patch("longitude")}
										/>
									</Field>
								</div>

								<button
									type="button"
									onClick={() =>
										setForm((p) => ({ ...p, isDefault: !p.isDefault }))
									}
									className={`flex items-center gap-3 w-full p-3.5 rounded-xl border-2 transition-all text-left ${
										form.isDefault
											? "border-brand bg-brand/5"
											: "border-border hover:border-border-strong"
									}`}
								>
									<div
										className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
											form.isDefault ? "border-brand bg-brand" : "border-border"
										}`}
									>
										{form.isDefault && (
											<CheckCircle2 size={12} className="text-white" />
										)}
									</div>
									<div>
										<p
											className={`text-sm font-medium ${form.isDefault ? "text-brand" : "text-foreground"}`}
										>
											Set as default address
										</p>
										<p className="text-xs text-muted-foreground">
											Used automatically at checkout
										</p>
									</div>
								</button>
							</FieldGroup>
						</FieldSet>
					</div>

					<div className="px-6 py-4 border-t border-border flex gap-3">
						<Button
							type="button"
							variant="outline"
							onClick={onClose}
							className="flex-1"
						>
							Cancel
						</Button>
						<Button type="submit" disabled={loading} className="flex-1">
							{loading && <Loader2 size={14} className="animate-spin" />}
							{loading ? "Saving..." : address ? "Save changes" : "Add address"}
						</Button>
					</div>
				</form>
			</DialogContent>
		</Dialog>
	);
}

function DeleteDialog({
	open,
	address,
	onClose,
	onRefresh,
}: {
	open: boolean;
	address?: AddressResponseType;
	onClose: () => void;
	onRefresh: () => void;
}) {
	const [loading, setLoading] = useState(false);

	if (!address) return null;

	const handleDelete = async () => {
		setLoading(true);
		try {
			await runtime.runPromise(
				Effect.gen(function* () {
					const api = yield* AddressApi;
					yield* api.remove(address.id);
				}),
			);
			toast.success("Address deleted");
			onRefresh();
		} catch {
			toast.error("Failed to delete", {
				description: "This may be your default address.",
			});
			setLoading(false);
		}
	};

	return (
		<Dialog open={open} onOpenChange={(o) => !o && onClose()}>
			<DialogContent className="sm:max-w-sm">
				<div className="flex items-center gap-3 mb-2">
					<div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center shrink-0">
						<Trash2 size={18} className="text-red-500" />
					</div>
					<DialogHeader>
						<DialogTitle>Delete address?</DialogTitle>
					</DialogHeader>
				</div>

				<p className="text-sm text-muted-foreground">
					Are you sure you want to delete{" "}
					<span className="font-medium text-foreground">
						"{address.label || address.addressLine1}"
					</span>
					? This cannot be undone.
				</p>

				<div className="flex gap-3 mt-2">
					<Button variant="outline" onClick={onClose} className="flex-1">
						Cancel
					</Button>
					<Button
						variant="destructive"
						onClick={handleDelete}
						disabled={loading}
						className="flex-1"
					>
						{loading && <Loader2 size={14} className="animate-spin" />}
						Delete
					</Button>
				</div>
			</DialogContent>
		</Dialog>
	);
}
