"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as Effect from "effect/Effect";
import { Camera, Loader2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { CustomerPageHeader } from "@/components/customer/customer-page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
	Field,
	FieldDescription,
	FieldGroup,
	FieldLabel,
	FieldSet,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { queryKeys } from "@/lib/queryKeys";
import { RestaurantApi } from "@/lib/restaurant-api";
import { runApi } from "@/lib/runtime";

const defaultForm = {
	name: "",
	description: "",
	phoneNumber: "",
	email: "",
	addressLine: "",
	city: "",
	state: "",
	country: "Nigeria",
	latitude: "6.5244",
	longitude: "3.3792",
	openingTime: "09:00",
	closingTime: "21:00",
	estimatedPrepTime: 30,
};

const defaultCategoryForm = {
	name: "",
	description: "",
};

export default function VendorRestaurantPage() {
	const queryClient = useQueryClient();
	const [form, setForm] = useState(defaultForm);
	const [categoryForm, setCategoryForm] = useState(defaultCategoryForm);
	const [itemDrafts, setItemDrafts] = useState<
		Record<
			string,
			{
				name: string;
				description: string;
				price: string;
				isVegetarian: boolean;
				calories: string;
			}
		>
	>({});

	const logoInputRef = useRef<HTMLInputElement | null>(null);
	const bannerInputRef = useRef<HTMLInputElement | null>(null);

	const { data: restaurant, isLoading: restaurantLoading } = useQuery({
		queryKey: queryKeys.restaurant.myRestaurant,
		queryFn: () =>
			runApi(
				Effect.gen(function* () {
					const api = yield* RestaurantApi;
					return yield* api.getMyRestaurant();
				}),
			),
	});

	const restaurantId = restaurant?.id;

	const { data: menuCategories = [], isLoading: categoriesLoading } = useQuery({
		queryKey: queryKeys.restaurant.categories(restaurantId ?? ""),
		queryFn: () =>
			runApi(
				Effect.gen(function* () {
					const api = yield* RestaurantApi;
					return yield* api.listCategories(restaurantId!);
				}),
			).then((res) => res.data),
		enabled: !!restaurantId,
	});

	const { data: menuItems = [], isLoading: itemsLoading } = useQuery({
		queryKey: queryKeys.restaurant.menuItems(restaurantId ?? ""),
		queryFn: () =>
			runApi(
				Effect.gen(function* () {
					const api = yield* RestaurantApi;
					return yield* api.listMenuItems(restaurantId!);
				}),
			).then((res) => res.data),
		enabled: !!restaurantId,
	});

	const loading = restaurantLoading || categoriesLoading || itemsLoading;

	useEffect(() => {
		if (restaurant) {
			setForm({
				name: restaurant.name,
				description: restaurant.description ?? "",
				phoneNumber: restaurant.phoneNumber,
				email: restaurant.email,
				addressLine: restaurant.addressLine,
				city: restaurant.city,
				state: restaurant.state,
				country: restaurant.country ?? "Nigeria",
				latitude: restaurant.latitude,
				longitude: restaurant.longitude,
				openingTime: restaurant.openingTime,
				closingTime: restaurant.closingTime,
				estimatedPrepTime: restaurant.estimatedPrepTime,
			});
		}
	}, [restaurant]);

	const patch =
		(key: keyof typeof form) =>
		(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
			const value = e.target.value;
			setForm((prev) => ({
				...prev,
				[key]:
					key === "estimatedPrepTime"
						? Number.parseInt(value || "0", 10)
						: value,
			}));
		};

	const patchCategory =
		(key: keyof typeof categoryForm) =>
		(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
			setCategoryForm((prev) => ({
				...prev,
				[key]: e.target.value,
			}));
		};

	const patchItemDraft =
		(categoryId: string, key: keyof (typeof itemDrafts)[string]) =>
		(e: React.ChangeEvent<HTMLInputElement>) => {
			const value = key === "isVegetarian" ? e.target.checked : e.target.value;

			setItemDrafts((prev) => ({
				...prev,
				[categoryId]: {
					...prev[categoryId],
					[key]: value,
				},
			}));
		};

	const uploadLogoMutation = useMutation({
		mutationFn: (file: File) =>
			runApi(
				Effect.gen(function* () {
					const api = yield* RestaurantApi;
					return yield* api.uploadRestaurantLogo(restaurant!.id, file);
				}),
			),
		onSuccess: (result) => {
			queryClient.setQueryData(
				queryKeys.restaurant.myRestaurant,
				(prev: any) => (prev ? { ...prev, logoUrl: result.url } : prev),
			);
			toast.success("Restaurant logo uploaded");
		},
		onError: () => {
			toast.error("Unable to upload restaurant logo");
		},
	});

	const handleUploadLogo = async (
		event: React.ChangeEvent<HTMLInputElement>,
	) => {
		const file = event.target.files?.[0];
		if (!file || !restaurant) return;

		uploadLogoMutation.mutate(file);
		event.target.value = "";
	};

	const uploadingLogo = uploadLogoMutation.isPending;

	const uploadBannerMutation = useMutation({
		mutationFn: (file: File) =>
			runApi(
				Effect.gen(function* () {
					const api = yield* RestaurantApi;
					return yield* api.uploadRestaurantBanner(restaurant!.id, file);
				}),
			),
		onSuccess: (result) => {
			queryClient.setQueryData(
				queryKeys.restaurant.myRestaurant,
				(prev: any) => (prev ? { ...prev, bannerUrl: result.url } : prev),
			);
			toast.success("Restaurant banner uploaded");
		},
		onError: () => {
			toast.error("Unable to upload restaurant banner");
		},
	});

	const handleUploadBanner = async (
		event: React.ChangeEvent<HTMLInputElement>,
	) => {
		const file = event.target.files?.[0];
		if (!file || !restaurant) return;

		uploadBannerMutation.mutate(file);
		event.target.value = "";
	};

	const uploadingBanner = uploadBannerMutation.isPending;

	const createCategoryMutation = useMutation({
		mutationFn: (payload: { name: string; description?: string }) =>
			runApi(
				Effect.gen(function* () {
					const api = yield* RestaurantApi;
					return yield* api.createCategory(restaurant!.id, payload);
				}),
			),
		onSuccess: () => {
			setCategoryForm(defaultCategoryForm);
			queryClient.invalidateQueries({
				queryKey: queryKeys.restaurant.categories(restaurant!.id),
			});
			toast.success("Menu category created");
		},
		onError: () => {
			toast.error("Unable to create menu category");
		},
	});

	const handleCreateCategory = async () => {
		if (!restaurant) {
			toast.error("Create your restaurant profile first");
			return;
		}

		const name = categoryForm.name.trim();
		if (!name) {
			toast.error("Category name is required");
			return;
		}

		createCategoryMutation.mutate({
			name,
			description: categoryForm.description.trim() || undefined,
		});
	};

	const creatingCategory = createCategoryMutation.isPending;

	const createMenuItemMutation = useMutation({
		mutationFn: ({ categoryId, data }: { categoryId: string; data: any }) =>
			runApi(
				Effect.gen(function* () {
					const api = yield* RestaurantApi;
					return yield* api.createMenuItem(restaurant!.id, categoryId, data);
				}),
			),
		onSuccess: (_, variables) => {
			setItemDrafts((prev) => ({
				...prev,
				[variables.categoryId]: {
					name: "",
					description: "",
					price: "",
					isVegetarian: false,
					calories: "",
				},
			}));
			queryClient.invalidateQueries({
				queryKey: queryKeys.restaurant.menuItems(restaurant!.id),
			});
			toast.success("Menu item added");
		},
		onError: () => {
			toast.error("Unable to add menu item");
		},
	});

	const handleCreateItem = async (categoryId: string) => {
		if (!restaurant) {
			toast.error("Create your restaurant profile first");
			return;
		}

		const draft = itemDrafts[categoryId] ?? {
			name: "",
			description: "",
			price: "",
			isVegetarian: false,
			calories: "",
		};

		const name = draft.name.trim();
		const price = draft.price.trim();

		if (!name || !price) {
			toast.error("Item name and price are required");
			return;
		}

		createMenuItemMutation.mutate({
			categoryId,
			data: {
				name,
				description: draft.description.trim() || undefined,
				price,
				isVegetarian: draft.isVegetarian,
				calories: draft.calories
					? Number.parseFloat(draft.calories)
					: undefined,
			},
		});
	};

	const saveRestaurantMutation = useMutation({
		mutationFn: (payload: any) =>
			runApi(
				Effect.gen(function* () {
					const api = yield* RestaurantApi;
					return restaurant
						? yield* api.update(restaurant.id, payload)
						: yield* api.create(payload);
				}),
			),
		onSuccess: (result) => {
			queryClient.setQueryData(queryKeys.restaurant.myRestaurant, result);
			queryClient.invalidateQueries({
				queryKey: queryKeys.restaurant.categories(result.id),
			});
			queryClient.invalidateQueries({
				queryKey: queryKeys.restaurant.menuItems(result.id),
			});
			toast.success(restaurant ? "Restaurant updated" : "Restaurant created");
		},
		onError: () => {
			toast.error("Unable to save restaurant details");
		},
	});

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		const payload = {
			name: form.name.trim(),
			description: form.description.trim() || undefined,
			phoneNumber: form.phoneNumber.trim(),
			email: form.email.trim(),
			addressLine: form.addressLine.trim(),
			city: form.city.trim(),
			state: form.state.trim(),
			country: form.country.trim() || undefined,
			latitude: form.latitude.trim(),
			longitude: form.longitude.trim(),
			openingTime: form.openingTime,
			closingTime: form.closingTime,
			estimatedPrepTime: Number(form.estimatedPrepTime),
		};

		saveRestaurantMutation.mutate(payload);
	};

	const saving = saveRestaurantMutation.isPending;

	return (
		<div className="min-h-screen bg-gray-50">
			<CustomerPageHeader title="Restaurant setup" />

			<main className="mx-auto max-w-3xl px-4 py-6">
				<Card className="border-border/60">
					<CardContent className="p-5">
						<div className="mb-5">
							<p className="text-sm font-semibold text-foreground">
								{restaurant ? "Edit your restaurant" : "Create your restaurant"}
							</p>
							<p className="text-xs text-muted-foreground">
								{restaurant
									? "Update the details customers see on the app"
									: "Add the details customers will use to find and order from you"}
							</p>
						</div>

						{restaurant ? (
							<div className="mb-5 overflow-hidden rounded-2xl border border-border/60">
								<div className="relative h-40 w-full bg-muted">
									{restaurant.bannerUrl ? (
										<img
											src={restaurant.bannerUrl}
											alt="Restaurant banner"
											className="h-full w-full object-cover"
										/>
									) : (
										<div className="flex h-full w-full items-center justify-center bg-linear-to-br from-brand/20 to-brand/5 text-xs text-muted-foreground">
											No banner uploaded
										</div>
									)}
									<div className="absolute bottom-3 right-3">
										<Button
											type="button"
											size="sm"
											variant="secondary"
											className="gap-2"
											onClick={() => bannerInputRef.current?.click()}
											disabled={uploadingBanner}
										>
											<Camera size={14} />
											{uploadingBanner ? "Uploading..." : "Banner"}
										</Button>
									</div>
								</div>

								<div className="flex items-center gap-4 px-4 py-4">
									<div className="relative h-16 w-16 overflow-hidden rounded-2xl border border-border bg-white">
										{restaurant.logoUrl ? (
											<img
												src={restaurant.logoUrl}
												alt="Restaurant logo"
												className="h-full w-full object-cover"
											/>
										) : (
											<div className="flex h-full w-full items-center justify-center bg-muted text-xs font-semibold text-muted-foreground">
												Logo
											</div>
										)}
									</div>
									<div className="flex-1">
										<p className="text-sm font-semibold text-foreground">
											{restaurant.name}
										</p>
										<p className="text-xs text-muted-foreground">
											Restaurant profile preview
										</p>
									</div>
									<Button
										type="button"
										size="sm"
										variant="outline"
										className="gap-2"
										onClick={() => logoInputRef.current?.click()}
										disabled={uploadingLogo}
									>
										<Camera size={14} />
										{uploadingLogo ? "Uploading..." : "Logo"}
									</Button>
								</div>
							</div>
						) : null}

						<input
							type="file"
							accept="image/*"
							ref={logoInputRef}
							className="hidden"
							onChange={handleUploadLogo}
						/>
						<input
							type="file"
							accept="image/*"
							ref={bannerInputRef}
							className="hidden"
							onChange={handleUploadBanner}
						/>

						<form onSubmit={handleSubmit} className="space-y-4">
							<FieldSet>
								<FieldGroup>
									<Field>
										<FieldLabel htmlFor="name">Restaurant name</FieldLabel>
										<Input
											id="name"
											required
											value={form.name}
											onChange={patch("name")}
											placeholder="The Spice Room"
										/>
									</Field>

									<Field>
										<FieldLabel htmlFor="description">Description</FieldLabel>
										<textarea
											id="description"
											rows={4}
											value={form.description}
											onChange={patch("description")}
											placeholder="Tell customers what makes your restaurant special"
											className="min-h-28 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring"
										/>
									</Field>

									<div className="grid gap-3 sm:grid-cols-2">
										<Field>
											<FieldLabel htmlFor="phoneNumber">
												Phone number
											</FieldLabel>
											<Input
												id="phoneNumber"
												required
												value={form.phoneNumber}
												onChange={patch("phoneNumber")}
												placeholder="+234 800 000 0000"
											/>
										</Field>
										<Field>
											<FieldLabel htmlFor="email">Email</FieldLabel>
											<Input
												id="email"
												type="email"
												required
												value={form.email}
												onChange={patch("email")}
												placeholder="support@restaurant.com"
											/>
										</Field>
									</div>

									<div className="grid gap-3 sm:grid-cols-2">
										<Field>
											<FieldLabel htmlFor="openingTime">
												Opening time
											</FieldLabel>
											<Input
												id="openingTime"
												type="time"
												required
												value={form.openingTime}
												onChange={patch("openingTime")}
											/>
										</Field>
										<Field>
											<FieldLabel htmlFor="closingTime">
												Closing time
											</FieldLabel>
											<Input
												id="closingTime"
												type="time"
												required
												value={form.closingTime}
												onChange={patch("closingTime")}
											/>
										</Field>
									</div>

									<Field>
										<FieldLabel htmlFor="addressLine">Address</FieldLabel>
										<Input
											id="addressLine"
											required
											value={form.addressLine}
											onChange={patch("addressLine")}
											placeholder="12, Victor Jones Road"
										/>
									</Field>

									<div className="grid gap-3 sm:grid-cols-3">
										<Field>
											<FieldLabel htmlFor="city">City</FieldLabel>
											<Input
												id="city"
												required
												value={form.city}
												onChange={patch("city")}
												placeholder="Lagos"
											/>
										</Field>
										<Field>
											<FieldLabel htmlFor="state">State</FieldLabel>
											<Input
												id="state"
												required
												value={form.state}
												onChange={patch("state")}
												placeholder="Lagos State"
											/>
										</Field>
										<Field>
											<FieldLabel htmlFor="country">Country</FieldLabel>
											<Input
												id="country"
												value={form.country}
												onChange={patch("country")}
												placeholder="Nigeria"
											/>
										</Field>
									</div>

									<div className="grid gap-3 sm:grid-cols-3">
										<Field>
											<FieldLabel htmlFor="latitude">Latitude</FieldLabel>
											<Input
												id="latitude"
												required
												value={form.latitude}
												onChange={patch("latitude")}
											/>
										</Field>
										<Field>
											<FieldLabel htmlFor="longitude">Longitude</FieldLabel>
											<Input
												id="longitude"
												required
												value={form.longitude}
												onChange={patch("longitude")}
											/>
										</Field>
										<Field>
											<FieldLabel htmlFor="estimatedPrepTime">
												Prep time (mins)
											</FieldLabel>
											<Input
												id="estimatedPrepTime"
												type="number"
												min="0"
												value={form.estimatedPrepTime}
												onChange={patch("estimatedPrepTime")}
											/>
										</Field>
									</div>

									<FieldDescription>
										Your restaurant will be reviewed before it goes live.
									</FieldDescription>

									<div className="flex justify-end pt-2">
										<Button type="submit" disabled={saving} className="gap-2">
											{saving ? (
												<Loader2 size={16} className="animate-spin" />
											) : null}
											{restaurant ? "Save changes" : "Create restaurant"}
										</Button>
									</div>
								</FieldGroup>
							</FieldSet>
						</form>

						{restaurant ? null : null}
					</CardContent>
				</Card>
			</main>
		</div>
	);
}
