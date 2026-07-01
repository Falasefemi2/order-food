"use client";

import * as Effect from "effect/Effect";
import { Camera, Loader2, Pencil, Trash2 } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { CustomerPageHeader } from "@/components/customer/customer-page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Field, FieldGroup, FieldLabel, FieldSet } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
	type FlatMenuCategoryResponseType,
	type FlatMenuItemResponseType,
	RestaurantApi,
	type RestaurantResponseType,
} from "@/lib/restaurant-api";
import { runtime } from "@/lib/runtime";

const defaultCategoryForm = {
	name: "",
	description: "",
};

const defaultItemForm = {
	categoryId: "",
	name: "",
	description: "",
	price: "",
	isVegetarian: false,
	calories: "",
};

export default function VendorRestaurantMenuPage() {
	const [restaurant, setRestaurant] = useState<RestaurantResponseType | null>(
		null,
	);
	const [categories, setCategories] = useState<
		Array<FlatMenuCategoryResponseType>
	>([]);
	const [items, setItems] = useState<Array<FlatMenuItemResponseType>>([]);
	const [categoryForm, setCategoryForm] = useState(defaultCategoryForm);
	const [itemForm, setItemForm] = useState(defaultItemForm);
	const [loading, setLoading] = useState(true);
	const [creatingCategory, setCreatingCategory] = useState(false);
	const [creatingItem, setCreatingItem] = useState(false);
	const [editingCategoryId, setEditingCategoryId] = useState<string | null>(
		null,
	);
	const [editingItemId, setEditingItemId] = useState<string | null>(null);
	const [categoryEditForm, setCategoryEditForm] = useState(defaultCategoryForm);
	const [itemEditForms, setItemEditForms] = useState<
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
	const [uploadingItemImageFor, setUploadingItemImageFor] = useState<
		string | null
	>(null);
	const [deleteDialogState, setDeleteDialogState] = useState<{
		type: "category" | "item";
		id: string;
		name: string;
	} | null>(null);
	const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

	const loadMenuData = async (restaurantId: string) => {
		const [categoriesResult, itemsResult] = await Promise.all([
			runtime.runPromise(
				Effect.gen(function* () {
					const api = yield* RestaurantApi;
					return yield* api.listCategories(restaurantId);
				}),
			),
			runtime.runPromise(
				Effect.gen(function* () {
					const api = yield* RestaurantApi;
					return yield* api.listMenuItems(restaurantId);
				}),
			),
		]);

		setCategories(
			categoriesResult.data.filter((category) => category.isActive),
		);
		setItems(itemsResult.data.filter((item) => item.isAvailable));
	};

	useEffect(() => {
		const loadRestaurant = async () => {
			setLoading(true);
			try {
				const result = await runtime.runPromise(
					Effect.gen(function* () {
						const api = yield* RestaurantApi;
						return yield* api.getMyRestaurant();
					}),
				);

				setRestaurant(result);
				await loadMenuData(result.id);
			} catch {
				setRestaurant(null);
				setCategories([]);
				setItems([]);
			} finally {
				setLoading(false);
			}
		};

		loadRestaurant();
	}, []);

	const handleStartCategoryEdit = (category: FlatMenuCategoryResponseType) => {
		setEditingCategoryId(category.id);
		setCategoryEditForm({
			name: category.name,
			description: category.description ?? "",
		});
	};

	const handleSaveCategory = async () => {
		if (!restaurant || !editingCategoryId) return;

		const name = categoryEditForm.name.trim();
		if (!name) {
			toast.error("Category name is required");
			return;
		}

		try {
			await runtime.runPromise(
				Effect.gen(function* () {
					const api = yield* RestaurantApi;
					yield* api.updateCategory(restaurant.id, editingCategoryId, {
						name,
						description: categoryEditForm.description.trim() || undefined,
					});
				}),
			);

			setEditingCategoryId(null);
			setCategoryEditForm(defaultCategoryForm);
			await loadMenuData(restaurant.id);
			toast.success("Category updated");
		} catch {
			toast.error("Unable to update category");
		}
	};

	const handleDeleteCategory = (categoryId: string, name: string) => {
		setDeleteDialogState({ type: "category", id: categoryId, name });
	};

	const handleDeleteCategoryConfirmed = async () => {
		if (
			!restaurant ||
			!deleteDialogState ||
			deleteDialogState.type !== "category"
		)
			return;

		try {
			await runtime.runPromise(
				Effect.gen(function* () {
					const api = yield* RestaurantApi;
					yield* api.deleteCategory(restaurant.id, deleteDialogState.id);
				}),
			);

			setDeleteDialogState(null);
			await loadMenuData(restaurant.id);
			toast.success("Category deleted");
		} catch {
			toast.error("Unable to delete category");
		}
	};

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

		setCreatingCategory(true);
		try {
			await runtime.runPromise(
				Effect.gen(function* () {
					const api = yield* RestaurantApi;
					yield* api.createCategory(restaurant.id, {
						name,
						description: categoryForm.description.trim() || undefined,
					});
				}),
			);

			setCategoryForm(defaultCategoryForm);
			await loadMenuData(restaurant.id);
			toast.success("Category created");
		} catch {
			toast.error("Unable to create category");
		} finally {
			setCreatingCategory(false);
		}
	};

	const handleUploadItemImage = async (
		itemId: string,
		file: File | undefined,
	) => {
		if (!file || !restaurant) return;

		setUploadingItemImageFor(itemId);
		try {
			await runtime.runPromise(
				Effect.gen(function* () {
					const api = yield* RestaurantApi;
					yield* api.uploadMenuItemImage(restaurant.id, itemId, file);
				}),
			);

			await loadMenuData(restaurant.id);
			toast.success("Item image uploaded");
		} catch {
			toast.error("Unable to upload item image");
		} finally {
			setUploadingItemImageFor(null);
		}
	};

	const handleStartItemEdit = (item: FlatMenuItemResponseType) => {
		setEditingItemId(item.id);
		setItemEditForms((prev) => ({
			...prev,
			[item.id]: {
				name: item.name,
				description: item.description ?? "",
				price: item.price,
				isVegetarian: item.isVegetarian,
				calories: item.calories?.toString() ?? "",
			},
		}));
	};

	const handleSaveItem = async (itemId: string) => {
		if (!restaurant) return;

		const draft = itemEditForms[itemId];
		if (!draft) return;

		const name = draft.name.trim();
		const price = draft.price.trim();

		if (!name || !price) {
			toast.error("Item name and price are required");
			return;
		}

		try {
			await runtime.runPromise(
				Effect.gen(function* () {
					const api = yield* RestaurantApi;
					yield* api.updateMenuItem(restaurant.id, itemId, {
						name,
						description: draft.description.trim() || undefined,
						price,
						isAvailable: true,
						isVegetarian: draft.isVegetarian,
						calories: draft.calories ? Number(draft.calories) : undefined,
					});
				}),
			);

			setEditingItemId(null);
			await loadMenuData(restaurant.id);
			toast.success("Item updated");
		} catch {
			toast.error("Unable to update item");
		}
	};

	const handleDeleteItem = (itemId: string, name: string) => {
		setDeleteDialogState({ type: "item", id: itemId, name });
	};

	const handleDeleteItemConfirmed = async () => {
		if (!restaurant || !deleteDialogState || deleteDialogState.type !== "item")
			return;

		try {
			await runtime.runPromise(
				Effect.gen(function* () {
					const api = yield* RestaurantApi;
					yield* api.deleteMenuItem(restaurant.id, deleteDialogState.id);
				}),
			);

			setDeleteDialogState(null);
			await loadMenuData(restaurant.id);
			toast.success("Item deleted");
		} catch {
			toast.error("Unable to delete item");
		}
	};

	const handleCreateItem = async () => {
		if (!restaurant) {
			toast.error("Create your restaurant profile first");
			return;
		}

		const categoryId = itemForm.categoryId;
		const name = itemForm.name.trim();
		const price = itemForm.price.trim();

		if (!categoryId) {
			toast.error("Select a category first");
			return;
		}

		if (!name || !price) {
			toast.error("Item name and price are required");
			return;
		}

		setCreatingItem(true);
		try {
			await runtime.runPromise(
				Effect.gen(function* () {
					const api = yield* RestaurantApi;
					yield* api.createMenuItem(restaurant.id, categoryId, {
						name,
						description: itemForm.description.trim() || undefined,
						price,
						isVegetarian: itemForm.isVegetarian,
						calories: itemForm.calories ? Number(itemForm.calories) : undefined,
					});
				}),
			);

			setItemForm(defaultItemForm);
			await loadMenuData(restaurant.id);
			toast.success("Menu item created");
		} catch {
			toast.error("Unable to create menu item");
		} finally {
			setCreatingItem(false);
		}
	};

	return (
		<div className="min-h-screen bg-gray-50">
			<Dialog
				open={deleteDialogState !== null}
				onOpenChange={(open) => {
					if (!open) {
						setDeleteDialogState(null);
					}
				}}
			>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>
							Delete{" "}
							{deleteDialogState?.type === "item" ? "menu item" : "category"}?
						</DialogTitle>
						<DialogDescription>
							This action cannot be undone. {deleteDialogState?.name} will be
							removed from your restaurant menu.
						</DialogDescription>
					</DialogHeader>
					<DialogFooter>
						<Button
							variant="outline"
							onClick={() => setDeleteDialogState(null)}
						>
							Cancel
						</Button>
						<Button
							variant="destructive"
							onClick={() => {
								if (deleteDialogState?.type === "item") {
									void handleDeleteItemConfirmed();
								} else {
									void handleDeleteCategoryConfirmed();
								}
							}}
						>
							Delete
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			<CustomerPageHeader title="Menu management" />

			<main className="mx-auto max-w-5xl px-4 py-6">
				<Card className="border-border/60">
					<CardContent className="p-5">
						<div className="mb-5 flex items-center justify-between gap-3">
							<div>
								<p className="text-sm font-semibold text-foreground">
									Restaurant menu
								</p>
								<p className="text-xs text-muted-foreground">
									Create categories, add dishes, and set up customizations for
									each item.
								</p>
							</div>
							<Button asChild size="sm" variant="outline">
								<Link href="/vendor/restaurant">Back to restaurant</Link>
							</Button>
						</div>

						{loading ? (
							<div className="flex items-center justify-center rounded-2xl bg-muted/30 px-4 py-10">
								<Loader2 className="animate-spin text-brand" size={20} />
							</div>
						) : !restaurant ? (
							<div className="rounded-2xl border border-dashed border-brand/30 bg-brand/5 px-4 py-6 text-sm text-muted-foreground">
								Create your restaurant profile first, then come back here to
								build the menu.
							</div>
						) : (
							<div className="space-y-6">
								<div className="grid gap-4 lg:grid-cols-2">
									<div className="rounded-2xl bg-muted/40 p-4">
										<p className="text-sm font-semibold text-foreground">
											Add category
										</p>
										<FieldSet className="mt-3">
											<FieldGroup>
												<Field>
													<FieldLabel htmlFor="categoryName">
														Category name
													</FieldLabel>
													<Input
														id="categoryName"
														value={categoryForm.name}
														onChange={(e) =>
															setCategoryForm((prev) => ({
																...prev,
																name: e.target.value,
															}))
														}
														placeholder="Breakfast"
													/>
												</Field>
												<Field>
													<FieldLabel htmlFor="categoryDescription">
														Description
													</FieldLabel>
													<Input
														id="categoryDescription"
														value={categoryForm.description}
														onChange={(e) =>
															setCategoryForm((prev) => ({
																...prev,
																description: e.target.value,
															}))
														}
														placeholder="Morning favourites"
													/>
												</Field>
											</FieldGroup>
										</FieldSet>

										<div className="mt-3 flex justify-end">
											<Button
												onClick={handleCreateCategory}
												disabled={creatingCategory}
												className="gap-2"
											>
												{creatingCategory ? (
													<Loader2 size={16} className="animate-spin" />
												) : null}
												Add category
											</Button>
										</div>
									</div>

									<div className="rounded-2xl bg-muted/40 p-4">
										<p className="text-sm font-semibold text-foreground">
											Add menu item
										</p>
										<FieldSet className="mt-3">
											<FieldGroup>
												<Field>
													<FieldLabel htmlFor="itemCategory">
														Category
													</FieldLabel>
													<select
														id="itemCategory"
														value={itemForm.categoryId}
														onChange={(e) =>
															setItemForm((prev) => ({
																...prev,
																categoryId: e.target.value,
															}))
														}
														className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm"
													>
														<option value="">Select category</option>
														{categories.map((category) => (
															<option key={category.id} value={category.id}>
																{category.name}
															</option>
														))}
													</select>
												</Field>
												<Field>
													<FieldLabel htmlFor="itemName">Item name</FieldLabel>
													<Input
														id="itemName"
														value={itemForm.name}
														onChange={(e) =>
															setItemForm((prev) => ({
																...prev,
																name: e.target.value,
															}))
														}
														placeholder="Jollof rice"
													/>
												</Field>
												<Field>
													<FieldLabel htmlFor="itemPrice">Price</FieldLabel>
													<Input
														id="itemPrice"
														value={itemForm.price}
														onChange={(e) =>
															setItemForm((prev) => ({
																...prev,
																price: e.target.value,
															}))
														}
														placeholder="2500"
													/>
												</Field>
												<Field>
													<FieldLabel htmlFor="itemDescription">
														Description
													</FieldLabel>
													<Input
														id="itemDescription"
														value={itemForm.description}
														onChange={(e) =>
															setItemForm((prev) => ({
																...prev,
																description: e.target.value,
															}))
														}
														placeholder="Rich tomato rice with chicken"
													/>
												</Field>
												<div className="grid gap-3 sm:grid-cols-2">
													<Field>
														<FieldLabel htmlFor="itemCalories">
															Calories
														</FieldLabel>
														<Input
															id="itemCalories"
															type="number"
															value={itemForm.calories}
															onChange={(e) =>
																setItemForm((prev) => ({
																	...prev,
																	calories: e.target.value,
																}))
															}
															placeholder="450"
														/>
													</Field>
													<Field>
														<FieldLabel htmlFor="itemVegetarian">
															Vegetarian
														</FieldLabel>
														<label className="mt-2 flex items-center gap-2 rounded-xl border border-input bg-background px-3 py-2 text-sm">
															<input
																id="itemVegetarian"
																type="checkbox"
																checked={itemForm.isVegetarian}
																onChange={(e) =>
																	setItemForm((prev) => ({
																		...prev,
																		isVegetarian: e.target.checked,
																	}))
																}
															/>
															Vegetarian item
														</label>
													</Field>
												</div>
											</FieldGroup>
										</FieldSet>

										<div className="mt-3 flex justify-end">
											<Button
												onClick={handleCreateItem}
												disabled={creatingItem}
												className="gap-2"
											>
												{creatingItem ? (
													<Loader2 size={16} className="animate-spin" />
												) : null}
												Add item
											</Button>
										</div>
									</div>
								</div>

								<div className="space-y-3">
									{categories.map((category) => {
										const categoryItems = items.filter(
											(item) => item.categoryId === category.id,
										);

										return (
											<div
												key={category.id}
												className="rounded-2xl border border-border/60 p-4"
											>
												<div className="flex items-center justify-between gap-3">
													<div>
														{editingCategoryId === category.id ? (
															<div className="space-y-2">
																<Input
																	value={categoryEditForm.name}
																	onChange={(e) =>
																		setCategoryEditForm((prev) => ({
																			...prev,
																			name: e.target.value,
																		}))
																	}
																	placeholder="Category name"
																/>
																<Input
																	value={categoryEditForm.description}
																	onChange={(e) =>
																		setCategoryEditForm((prev) => ({
																			...prev,
																			description: e.target.value,
																		}))
																	}
																	placeholder="Description"
																/>
															</div>
														) : (
															<>
																<p className="text-sm font-semibold text-foreground">
																	{category.name}
																</p>
																<p className="text-xs text-muted-foreground">
																	{category.description ?? "No description"}
																</p>
															</>
														)}
													</div>
													<div className="flex items-center gap-2">
														{editingCategoryId === category.id ? (
															<>
																<Button
																	size="sm"
																	variant="outline"
																	onClick={handleSaveCategory}
																>
																	Save
																</Button>
																<Button
																	size="sm"
																	variant="ghost"
																	onClick={() => setEditingCategoryId(null)}
																>
																	Cancel
																</Button>
															</>
														) : (
															<>
																<Button
																	size="sm"
																	variant="outline"
																	onClick={() =>
																		handleStartCategoryEdit(category)
																	}
																	className="gap-2"
																>
																	<Pencil size={14} />
																	Edit
																</Button>
																<Button
																	size="sm"
																	variant="outline"
																	onClick={() =>
																		handleDeleteCategory(
																			category.id,
																			category.name,
																		)
																	}
																	className="gap-2 text-destructive"
																>
																	<Trash2 size={14} />
																	Delete
																</Button>
															</>
														)}
														<span className="rounded-full bg-muted px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.24em] text-muted-foreground">
															{categoryItems.length} items
														</span>
													</div>
												</div>

												<div className="mt-3 space-y-2">
													{categoryItems.map((item) => {
														const draft = itemEditForms[item.id];
														const isEditing = editingItemId === item.id;

														return (
															<div
																key={item.id}
																className="rounded-xl bg-muted/30 px-3 py-3"
															>
																<div className="flex items-start gap-3">
																	{item.imageUrl ? (
																		<img
																			src={item.imageUrl}
																			alt={item.name}
																			className="h-16 w-16 rounded-xl object-cover"
																		/>
																	) : (
																		<div className="flex h-16 w-16 items-center justify-center rounded-xl bg-background text-[10px] font-semibold uppercase tracking-[0.24em] text-muted-foreground">
																			No image
																		</div>
																	)}
																	<div className="min-w-0 flex-1">
																		{isEditing && draft ? (
																			<div className="space-y-2">
																				<Input
																					value={draft.name}
																					onChange={(e) =>
																						setItemEditForms((prev) => ({
																							...prev,
																							[item.id]: {
																								...draft,
																								name: e.target.value,
																							},
																						}))
																					}
																					placeholder="Item name"
																				/>
																				<Input
																					value={draft.price}
																					onChange={(e) =>
																						setItemEditForms((prev) => ({
																							...prev,
																							[item.id]: {
																								...draft,
																								price: e.target.value,
																							},
																						}))
																					}
																					placeholder="Price"
																				/>
																				<Input
																					value={draft.description}
																					onChange={(e) =>
																						setItemEditForms((prev) => ({
																							...prev,
																							[item.id]: {
																								...draft,
																								description: e.target.value,
																							},
																						}))
																					}
																					placeholder="Description"
																				/>
																			</div>
																		) : (
																			<>
																				<p className="text-sm font-semibold text-foreground">
																					{item.name}
																				</p>
																				<p className="text-xs text-muted-foreground">
																					{item.description ?? "No description"}
																				</p>
																			</>
																		)}
																	</div>
																	<div className="text-right">
																		{isEditing && draft ? (
																			<div className="flex flex-col items-end gap-2">
																				<label className="flex items-center gap-2 text-xs text-muted-foreground">
																					<input
																						type="checkbox"
																						checked={draft.isVegetarian}
																						onChange={(e) =>
																							setItemEditForms((prev) => ({
																								...prev,
																								[item.id]: {
																									...draft,
																									isVegetarian:
																										e.target.checked,
																								},
																							}))
																						}
																					/>
																					Vegetarian
																				</label>
																				<Input
																					type="number"
																					value={draft.calories}
																					onChange={(e) =>
																						setItemEditForms((prev) => ({
																							...prev,
																							[item.id]: {
																								...draft,
																								calories: e.target.value,
																							},
																						}))
																					}
																					className="w-24"
																				/>
																				<div className="flex gap-2">
																					<Button
																						size="sm"
																						variant="outline"
																						onClick={() =>
																							handleSaveItem(item.id)
																						}
																					>
																						Save
																					</Button>
																					<Button
																						size="sm"
																						variant="ghost"
																						onClick={() =>
																							setEditingItemId(null)
																						}
																					>
																						Cancel
																					</Button>
																				</div>
																			</div>
																		) : (
																			<>
																				<p className="text-sm font-semibold text-brand">
																					₦{item.price}
																				</p>
																				<div className="mt-2 flex items-center gap-2">
																					<Button
																						asChild
																						size="sm"
																						variant="outline"
																					>
																						<Link
																							href={`/vendor/restaurant/items/${item.id}/customizations`}
																						>
																							Customizations
																						</Link>
																					</Button>
																					<Button
																						type="button"
																						size="sm"
																						variant="outline"
																						onClick={() =>
																							fileInputRefs.current[
																								item.id
																							]?.click()
																						}
																						className="gap-2"
																					>
																						<Camera size={14} />
																						{uploadingItemImageFor === item.id
																							? "Uploading..."
																							: "Image"}
																					</Button>
																					<Button
																						size="sm"
																						variant="outline"
																						onClick={() =>
																							handleStartItemEdit(item)
																						}
																						className="gap-2"
																					>
																						<Pencil size={14} />
																						Edit
																					</Button>
																					<Button
																						size="sm"
																						variant="outline"
																						onClick={() =>
																							handleDeleteItem(
																								item.id,
																								item.name,
																							)
																						}
																						className="gap-2 text-destructive"
																					>
																						<Trash2 size={14} />
																						Delete
																					</Button>
																				</div>
																			</>
																		)}
																	</div>
																</div>
																<input
																	type="file"
																	accept="image/*"
																	ref={(node) => {
																		fileInputRefs.current[item.id] = node;
																	}}
																	className="hidden"
																	onChange={(event) => {
																		void handleUploadItemImage(
																			item.id,
																			event.target.files?.[0],
																		);
																		event.target.value = "";
																	}}
																/>
															</div>
														);
													})}
												</div>
											</div>
										);
									})}
								</div>
							</div>
						)}
					</CardContent>
				</Card>
			</main>
		</div>
	);
}
