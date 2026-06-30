"use client";

import * as Effect from "effect/Effect";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { CustomerPageHeader } from "@/components/customer/customer-page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Field, FieldGroup, FieldLabel, FieldSet } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
	type FlatCustomizationGroupResponseType,
	type FlatCustomizationOptionResponseType,
	type FlatMenuItemResponseType,
	RestaurantApi,
	type RestaurantResponseType,
} from "@/lib/restaurant-api";
import { runtime } from "@/lib/runtime";

const defaultGroupForm = {
	name: "",
	minSelectable: 1,
	maxSelectable: 1,
	isRequired: false,
};

const defaultOptionForm = {
	name: "",
	price: "",
	isAvailable: true,
};

export default function VendorItemCustomizationsPage() {
	const params = useParams<{ itemId: string }>();
	const itemId = params.itemId;

	const [restaurant, setRestaurant] = useState<RestaurantResponseType | null>(
		null,
	);
	const [item, setItem] = useState<FlatMenuItemResponseType | null>(null);
	const [groups, setGroups] = useState<
		ReadonlyArray<FlatCustomizationGroupResponseType>
	>([]);
	const [optionsByGroup, setOptionsByGroup] = useState<
		Record<string, ReadonlyArray<FlatCustomizationOptionResponseType>>
	>({});
	const [groupForm, setGroupForm] = useState(defaultGroupForm);
	const [optionForm, setOptionForm] = useState<
		Record<string, typeof defaultOptionForm>
	>({});
	const [loading, setLoading] = useState(true);
	const [creatingGroup, setCreatingGroup] = useState(false);
	const [creatingOption, setCreatingOption] = useState<Record<string, boolean>>(
		{},
	);

	const loadDetails = async () => {
		const restaurantResult = await runtime.runPromise(
			Effect.gen(function* () {
				const api = yield* RestaurantApi;
				return yield* api.getMyRestaurant();
			}),
		);

		const itemResult = await runtime.runPromise(
			Effect.gen(function* () {
				const api = yield* RestaurantApi;
				return yield* api.getMenuItem(restaurantResult.id, itemId);
			}),
		);

		const groupsResult = await runtime.runPromise(
			Effect.gen(function* () {
				const api = yield* RestaurantApi;
				return yield* api.listCustomizationGroups(restaurantResult.id, itemId);
			}),
		);

		const nestedOptions: Record<
			string,
			Array<FlatCustomizationOptionResponseType>
		> = {};

		for (const group of [...groupsResult.data]) {
			const optionsResult = await runtime.runPromise(
				Effect.gen(function* () {
					const api = yield* RestaurantApi;
					return yield* api.listCustomizationOptions(
						restaurantResult.id,
						itemId,
						group.id,
					);
				}),
			);

			nestedOptions[group.id] = [...optionsResult.data];
		}

		setRestaurant(restaurantResult);
		setItem(itemResult);
		setGroups([...groupsResult.data]);
		setOptionsByGroup(nestedOptions);
	};

	useEffect(() => {
		const run = async () => {
			setLoading(true);
			try {
				await loadDetails();
			} catch {
				toast.error("Unable to load item customizations");
			} finally {
				setLoading(false);
			}
		};

		run();
	}, [itemId]);

	const handleCreateGroup = async () => {
		if (!restaurant || !item) {
			toast.error("Load the restaurant and item first");
			return;
		}

		const name = groupForm.name.trim();
		if (!name) {
			toast.error("Group name is required");
			return;
		}

		setCreatingGroup(true);
		try {
			await runtime.runPromise(
				Effect.gen(function* () {
					const api = yield* RestaurantApi;
					yield* api.createCustomizationGroup(restaurant.id, item.id, {
						name,
						minSelectable: Number(groupForm.minSelectable),
						maxSelectable: Number(groupForm.maxSelectable),
						isRequired: groupForm.isRequired,
					});
				}),
			);

			setGroupForm(defaultGroupForm);
			await loadDetails();
			toast.success("Customization group created");
		} catch {
			toast.error("Unable to create customization group");
		} finally {
			setCreatingGroup(false);
		}
	};

	const handleCreateOption = async (groupId: string) => {
		if (!restaurant || !item) {
			toast.error("Load the restaurant and item first");
			return;
		}

		const draft = optionForm[groupId] ?? defaultOptionForm;
		const name = draft.name.trim();
		const price = draft.price.trim();

		if (!name || !price) {
			toast.error("Option name and price are required");
			return;
		}

		setCreatingOption((prev) => ({ ...prev, [groupId]: true }));
		try {
			await runtime.runPromise(
				Effect.gen(function* () {
					const api = yield* RestaurantApi;
					yield* api.createCustomizationOption(
						restaurant.id,
						item.id,
						groupId,
						{
							name,
							price,
							isAvailable: draft.isAvailable,
						},
					);
				}),
			);

			setOptionForm((prev) => ({ ...prev, [groupId]: defaultOptionForm }));
			await loadDetails();
			toast.success("Customization option added");
		} catch {
			toast.error("Unable to create customization option");
		} finally {
			setCreatingOption((prev) => ({ ...prev, [groupId]: false }));
		}
	};

	return (
		<div className="min-h-screen bg-gray-50">
			<CustomerPageHeader title="Item customizations" />

			<main className="mx-auto max-w-4xl px-4 py-6">
				<Card className="border-border/60">
					<CardContent className="p-5">
						<div className="mb-5 flex items-center justify-between gap-3">
							<div>
								<p className="text-sm font-semibold text-foreground">
									{item ? `Customize ${item.name}` : "Customize item"}
								</p>
								<p className="text-xs text-muted-foreground">
									Add selection groups and customer options for this menu item.
								</p>
							</div>
							<Button asChild size="sm" variant="outline">
								<Link href="/vendor/restaurant/menu">Back to menu</Link>
							</Button>
						</div>

						{loading ? (
							<div className="flex items-center justify-center rounded-2xl bg-muted/30 px-4 py-10">
								<Loader2 className="animate-spin text-brand" size={20} />
							</div>
						) : (
							<div className="space-y-5">
								<div className="rounded-2xl bg-muted/40 p-4">
									<p className="text-sm font-semibold text-foreground">
										Add customization group
									</p>
									<FieldSet className="mt-3">
										<FieldGroup>
											<Field>
												<FieldLabel htmlFor="groupName">Group name</FieldLabel>
												<Input
													id="groupName"
													value={groupForm.name}
													onChange={(e) =>
														setGroupForm((prev) => ({
															...prev,
															name: e.target.value,
														}))
													}
													placeholder="Choose sauce"
												/>
											</Field>
											<div className="grid gap-3 sm:grid-cols-3">
												<Field>
													<FieldLabel htmlFor="minSelectable">Min</FieldLabel>
													<Input
														id="minSelectable"
														type="number"
														min="0"
														value={groupForm.minSelectable}
														onChange={(e) =>
															setGroupForm((prev) => ({
																...prev,
																minSelectable: Number(e.target.value),
															}))
														}
													/>
												</Field>
												<Field>
													<FieldLabel htmlFor="maxSelectable">Max</FieldLabel>
													<Input
														id="maxSelectable"
														type="number"
														min="0"
														value={groupForm.maxSelectable}
														onChange={(e) =>
															setGroupForm((prev) => ({
																...prev,
																maxSelectable: Number(e.target.value),
															}))
														}
													/>
												</Field>
												<Field>
													<FieldLabel htmlFor="isRequired">Required</FieldLabel>
													<label className="mt-2 flex items-center gap-2 rounded-xl border border-input bg-background px-3 py-2 text-sm">
														<input
															id="isRequired"
															type="checkbox"
															checked={groupForm.isRequired}
															onChange={(e) =>
																setGroupForm((prev) => ({
																	...prev,
																	isRequired: e.target.checked,
																}))
															}
														/>
														Required
													</label>
												</Field>
											</div>
										</FieldGroup>
									</FieldSet>

									<div className="mt-3 flex justify-end">
										<Button
											onClick={handleCreateGroup}
											disabled={creatingGroup}
											className="gap-2"
										>
											{creatingGroup ? (
												<Loader2 size={16} className="animate-spin" />
											) : null}
											Add group
										</Button>
									</div>
								</div>

								{groups.map((group) => {
									const options = optionsByGroup[group.id] ?? [];
									const draft = optionForm[group.id] ?? defaultOptionForm;

									return (
										<div
											key={group.id}
											className="rounded-2xl border border-border/60 p-4"
										>
											<div className="flex items-center justify-between gap-3">
												<div>
													<p className="text-sm font-semibold text-foreground">
														{group.name}
													</p>
													<p className="text-xs text-muted-foreground">
														Min {group.minSelectable} • Max{" "}
														{group.maxSelectable} •{" "}
														{group.isRequired ? "Required" : "Optional"}
													</p>
												</div>
												<span className="rounded-full bg-muted px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.24em] text-muted-foreground">
													{options.length} options
												</span>
											</div>

											<div className="mt-3 space-y-2">
												{options.map((option) => (
													<div
														key={option.id}
														className="rounded-xl bg-muted/30 px-3 py-2"
													>
														<div className="flex items-center justify-between gap-2">
															<span className="text-sm font-medium text-foreground">
																{option.name}
															</span>
															<span className="text-sm font-semibold text-brand">
																₦{option.price}
															</span>
														</div>
													</div>
												))}
											</div>

											<div className="mt-4 grid gap-3 sm:grid-cols-2">
												<Field>
													<FieldLabel htmlFor={`optionName-${group.id}`}>
														Option name
													</FieldLabel>
													<Input
														id={`optionName-${group.id}`}
														value={draft.name}
														onChange={(e) =>
															setOptionForm((prev) => ({
																...prev,
																[group.id]: { ...draft, name: e.target.value },
															}))
														}
														placeholder="Spicy sauce"
													/>
												</Field>
												<Field>
													<FieldLabel htmlFor={`optionPrice-${group.id}`}>
														Price
													</FieldLabel>
													<Input
														id={`optionPrice-${group.id}`}
														value={draft.price}
														onChange={(e) =>
															setOptionForm((prev) => ({
																...prev,
																[group.id]: { ...draft, price: e.target.value },
															}))
														}
														placeholder="300"
													/>
												</Field>
											</div>

											<div className="mt-3 flex items-center justify-between gap-3">
												<label className="flex items-center gap-2 text-sm text-muted-foreground">
													<input
														type="checkbox"
														checked={draft.isAvailable}
														onChange={(e) =>
															setOptionForm((prev) => ({
																...prev,
																[group.id]: {
																	...draft,
																	isAvailable: e.target.checked,
																},
															}))
														}
													/>
													Available
												</label>

												<Button
													type="button"
													onClick={() => handleCreateOption(group.id)}
													disabled={creatingOption[group.id]}
													className="gap-2"
												>
													{creatingOption[group.id] ? (
														<Loader2 size={16} className="animate-spin" />
													) : null}
													Add option
												</Button>
											</div>
										</div>
									);
								})}
							</div>
						)}
					</CardContent>
				</Card>
			</main>
		</div>
	);
}
