import * as Context from "effect/Context";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as Schema from "effect/Schema";
import {
	HttpClient,
	HttpClientError,
	HttpClientRequest,
	HttpClientResponse,
} from "effect/unstable/http";
import { TokenService } from "@/lib/auth/token-store";
import { ApiError } from "./types";

export const RestaurantResponse = Schema.Struct({
	id: Schema.String,
	ownerId: Schema.String,
	name: Schema.String,
	description: Schema.NullOr(Schema.String),
	logoUrl: Schema.NullOr(Schema.String),
	bannerUrl: Schema.NullOr(Schema.String),
	phoneNumber: Schema.String,
	email: Schema.String,
	addressLine: Schema.String,
	city: Schema.String,
	state: Schema.String,
	country: Schema.String,
	approvalStatus: Schema.String,
	latitude: Schema.String,
	longitude: Schema.String,
	isOpen: Schema.Boolean,
	openingTime: Schema.String,
	closingTime: Schema.String,
	estimatedPrepTime: Schema.Number,
	ratingAvg: Schema.String,
	ratingCount: Schema.Number,
	createdAt: Schema.String,
	updatedAt: Schema.String,
});
export type RestaurantResponseType = Schema.Schema.Type<
	typeof RestaurantResponse
>;

export const PublicRestaurantResponse = Schema.Struct({
	id: Schema.String,
	name: Schema.String,
	description: Schema.NullOr(Schema.String),
	logoUrl: Schema.NullOr(Schema.String),
	bannerUrl: Schema.NullOr(Schema.String),
	city: Schema.String,
	state: Schema.String,
	latitude: Schema.String,
	longitude: Schema.String,
	isOpen: Schema.Boolean,
	openingTime: Schema.String,
	closingTime: Schema.String,
	estimatedPrepTime: Schema.Number,
	ratingAvg: Schema.String,
	ratingCount: Schema.Number,
});
export type PublicRestaurantResponseType = Schema.Schema.Type<
	typeof PublicRestaurantResponse
>;

export const PublicRestaurantDetailResponse = Schema.Struct({
	...PublicRestaurantResponse.fields,
	categories: Schema.Array(
		Schema.Struct({
			id: Schema.String,
			name: Schema.String,
			description: Schema.NullOr(Schema.String),
			sortOrder: Schema.Number,
			items: Schema.Array(
				Schema.Struct({
					id: Schema.String,
					name: Schema.String,
					description: Schema.NullOr(Schema.String),
					price: Schema.String,
					imageUrl: Schema.NullOr(Schema.String),
					isAvailable: Schema.Boolean,
					isVegetarian: Schema.Boolean,
					calories: Schema.NullOr(Schema.Number),
					customizationGroups: Schema.Array(
						Schema.Struct({
							id: Schema.String,
							name: Schema.String,
							minSelectable: Schema.Number,
							maxSelectable: Schema.Number,
							isRequired: Schema.Boolean,
							options: Schema.Array(
								Schema.Struct({
									id: Schema.String,
									name: Schema.String,
									price: Schema.String,
									isAvailable: Schema.Boolean,
								}),
							),
						}),
					),
				}),
			),
		}),
	),
});
export type PublicRestaurantDetailResponseType = Schema.Schema.Type<
	typeof PublicRestaurantDetailResponse
>;

export const PaginatedRestaurantResponse = Schema.Struct({
	data: Schema.Array(PublicRestaurantResponse),
	total: Schema.Number,
	page: Schema.Number,
	limit: Schema.Number,
	totalPages: Schema.Number,
	hasNext: Schema.Boolean,
	hasPrev: Schema.Boolean,
});
export type PaginatedRestaurantResponseType = Schema.Schema.Type<
	typeof PaginatedRestaurantResponse
>;

export const FlatMenuCategoryResponse = Schema.Struct({
	id: Schema.String,
	restaurantId: Schema.String,
	name: Schema.String,
	description: Schema.NullOr(Schema.String),
	sortOrder: Schema.Number,
	isActive: Schema.Boolean,
	createdAt: Schema.String,
	updatedAt: Schema.String,
});
export type FlatMenuCategoryResponseType = Schema.Schema.Type<
	typeof FlatMenuCategoryResponse
>;

export const FlatMenuItemResponse = Schema.Struct({
	id: Schema.String,
	categoryId: Schema.String,
	restaurantId: Schema.String,
	name: Schema.String,
	description: Schema.NullOr(Schema.String),
	price: Schema.String,
	imageUrl: Schema.NullOr(Schema.String),
	isAvailable: Schema.Boolean,
	isVegetarian: Schema.Boolean,
	calories: Schema.NullOr(Schema.Number),
	createdAt: Schema.String,
	updatedAt: Schema.String,
});
export type FlatMenuItemResponseType = Schema.Schema.Type<
	typeof FlatMenuItemResponse
>;

export const FlatCustomizationGroupResponse = Schema.Struct({
	id: Schema.String,
	menuItemId: Schema.String,
	name: Schema.String,
	minSelectable: Schema.Number,
	maxSelectable: Schema.Number,
	isRequired: Schema.Boolean,
	createdAt: Schema.String,
	updatedAt: Schema.String,
});
export type FlatCustomizationGroupResponseType = Schema.Schema.Type<
	typeof FlatCustomizationGroupResponse
>;

export const FlatCustomizationOptionResponse = Schema.Struct({
	id: Schema.String,
	groupId: Schema.String,
	name: Schema.String,
	price: Schema.String,
	isAvailable: Schema.Boolean,
	createdAt: Schema.String,
	updatedAt: Schema.String,
});
export type FlatCustomizationOptionResponseType = Schema.Schema.Type<
	typeof FlatCustomizationOptionResponse
>;

export const PaginatedMenuCategoryResponse = Schema.Struct({
	data: Schema.Array(FlatMenuCategoryResponse),
	total: Schema.Number,
	page: Schema.Number,
	limit: Schema.Number,
	totalPages: Schema.Number,
	hasNext: Schema.Boolean,
	hasPrev: Schema.Boolean,
});
export type PaginatedMenuCategoryResponseType = Schema.Schema.Type<
	typeof PaginatedMenuCategoryResponse
>;

export const PaginatedMenuItemResponse = Schema.Struct({
	data: Schema.Array(FlatMenuItemResponse),
	total: Schema.Number,
	page: Schema.Number,
	limit: Schema.Number,
	totalPages: Schema.Number,
	hasNext: Schema.Boolean,
	hasPrev: Schema.Boolean,
});
export type PaginatedMenuItemResponseType = Schema.Schema.Type<
	typeof PaginatedMenuItemResponse
>;

export const PaginatedCustomizationGroupResponse = Schema.Struct({
	data: Schema.Array(FlatCustomizationGroupResponse),
	total: Schema.Number,
	page: Schema.Number,
	limit: Schema.Number,
	totalPages: Schema.Number,
	hasNext: Schema.Boolean,
	hasPrev: Schema.Boolean,
});
export type PaginatedCustomizationGroupResponseType = Schema.Schema.Type<
	typeof PaginatedCustomizationGroupResponse
>;

export const PaginatedCustomizationOptionResponse = Schema.Struct({
	data: Schema.Array(FlatCustomizationOptionResponse),
	total: Schema.Number,
	page: Schema.Number,
	limit: Schema.Number,
	totalPages: Schema.Number,
	hasNext: Schema.Boolean,
	hasPrev: Schema.Boolean,
});
export type PaginatedCustomizationOptionResponseType = Schema.Schema.Type<
	typeof PaginatedCustomizationOptionResponse
>;

export const UploadResponse = Schema.Struct({
	url: Schema.String,
});
export type UploadResponseType = Schema.Schema.Type<typeof UploadResponse>;

export const DeletedResponse = Schema.Struct({ message: Schema.String });
export type DeletedResponseType = Schema.Schema.Type<typeof DeletedResponse>;

export const CreateRestaurantPayload = Schema.Struct({
	name: Schema.String,
	description: Schema.optional(Schema.String),
	phoneNumber: Schema.String,
	email: Schema.String,
	addressLine: Schema.String,
	city: Schema.String,
	state: Schema.String,
	country: Schema.optional(Schema.String),
	latitude: Schema.String,
	longitude: Schema.String,
	openingTime: Schema.String,
	closingTime: Schema.String,
	estimatedPrepTime: Schema.optional(Schema.Number),
});
export type CreateRestaurantPayloadType = Schema.Schema.Type<
	typeof CreateRestaurantPayload
>;

export const UpdateRestaurantPayload = Schema.Struct({
	name: Schema.optional(Schema.String),
	description: Schema.optional(Schema.String),
	phoneNumber: Schema.optional(Schema.String),
	email: Schema.optional(Schema.String),
	addressLine: Schema.optional(Schema.String),
	city: Schema.optional(Schema.String),
	state: Schema.optional(Schema.String),
	openingTime: Schema.optional(Schema.String),
	closingTime: Schema.optional(Schema.String),
	estimatedPrepTime: Schema.optional(Schema.Number),
	isOpen: Schema.optional(Schema.Boolean),
});
export type UpdateRestaurantPayloadType = Schema.Schema.Type<
	typeof UpdateRestaurantPayload
>;

export const CreateCategoryPayload = Schema.Struct({
	name: Schema.String,
	description: Schema.optional(Schema.String),
	sortOrder: Schema.optional(Schema.Number),
});
export type CreateCategoryPayloadType = Schema.Schema.Type<
	typeof CreateCategoryPayload
>;

export const UpdateCategoryPayload = Schema.Struct({
	name: Schema.optional(Schema.String),
	description: Schema.optional(Schema.String),
	sortOrder: Schema.optional(Schema.Number),
	isActive: Schema.optional(Schema.Boolean),
});
export type UpdateCategoryPayloadType = Schema.Schema.Type<
	typeof UpdateCategoryPayload
>;

export const CreateMenuItemPayload = Schema.Struct({
	name: Schema.String,
	description: Schema.optional(Schema.String),
	price: Schema.String,
	isVegetarian: Schema.optional(Schema.Boolean),
	calories: Schema.optional(Schema.Number),
});
export type CreateMenuItemPayloadType = Schema.Schema.Type<
	typeof CreateMenuItemPayload
>;

export const UpdateMenuItemPayload = Schema.Struct({
	name: Schema.optional(Schema.String),
	description: Schema.optional(Schema.String),
	price: Schema.optional(Schema.String),
	isAvailable: Schema.optional(Schema.Boolean),
	isVegetarian: Schema.optional(Schema.Boolean),
	calories: Schema.optional(Schema.Number),
});
export type UpdateMenuItemPayloadType = Schema.Schema.Type<
	typeof UpdateMenuItemPayload
>;

export const CreateCustomizationGroupPayload = Schema.Struct({
	name: Schema.String,
	minSelectable: Schema.optional(Schema.Number),
	maxSelectable: Schema.optional(Schema.Number),
	isRequired: Schema.optional(Schema.Boolean),
});
export type CreateCustomizationGroupPayloadType = Schema.Schema.Type<
	typeof CreateCustomizationGroupPayload
>;

export const UpdateCustomizationGroupPayload = Schema.Struct({
	name: Schema.optional(Schema.String),
	minSelectable: Schema.optional(Schema.Number),
	maxSelectable: Schema.optional(Schema.Number),
	isRequired: Schema.optional(Schema.Boolean),
});
export type UpdateCustomizationGroupPayloadType = Schema.Schema.Type<
	typeof UpdateCustomizationGroupPayload
>;

export const CreateCustomizationOptionPayload = Schema.Struct({
	name: Schema.String,
	price: Schema.optional(Schema.String),
	isAvailable: Schema.optional(Schema.Boolean),
});
export type CreateCustomizationOptionPayloadType = Schema.Schema.Type<
	typeof CreateCustomizationOptionPayload
>;

export const UpdateCustomizationOptionPayload = Schema.Struct({
	name: Schema.optional(Schema.String),
	price: Schema.optional(Schema.String),
	isAvailable: Schema.optional(Schema.Boolean),
});
export type UpdateCustomizationOptionPayloadType = Schema.Schema.Type<
	typeof UpdateCustomizationOptionPayload
>;

export class RestaurantApi extends Context.Service<
	RestaurantApi,
	{
		readonly list: (params?: {
			page?: number;
			limit?: number;
			city?: string;
			isOpen?: boolean;
		}) => Effect.Effect<PaginatedRestaurantResponseType, ApiError>;
		readonly get: (
			id: string,
		) => Effect.Effect<PublicRestaurantDetailResponseType, ApiError>;
		readonly create: (
			payload: CreateRestaurantPayloadType,
		) => Effect.Effect<RestaurantResponseType, ApiError>;
		readonly getMyRestaurant: () => Effect.Effect<
			RestaurantResponseType,
			ApiError
		>;
		readonly uploadRestaurantLogo: (
			restaurantId: string,
			file: File,
		) => Effect.Effect<UploadResponseType, ApiError>;
		readonly uploadRestaurantBanner: (
			restaurantId: string,
			file: File,
		) => Effect.Effect<UploadResponseType, ApiError>;
		readonly update: (
			id: string,
			payload: UpdateRestaurantPayloadType,
		) => Effect.Effect<RestaurantResponseType, ApiError>;
		readonly listCategories: (
			restaurantId: string,
			page?: number,
			limit?: number,
		) => Effect.Effect<PaginatedMenuCategoryResponseType, ApiError>;
		readonly getCategory: (
			restaurantId: string,
			categoryId: string,
		) => Effect.Effect<FlatMenuCategoryResponseType, ApiError>;
		readonly createCategory: (
			restaurantId: string,
			payload: CreateCategoryPayloadType,
		) => Effect.Effect<FlatMenuCategoryResponseType, ApiError>;
		readonly updateCategory: (
			restaurantId: string,
			categoryId: string,
			payload: UpdateCategoryPayloadType,
		) => Effect.Effect<FlatMenuCategoryResponseType, ApiError>;
		readonly deleteCategory: (
			restaurantId: string,
			categoryId: string,
		) => Effect.Effect<DeletedResponseType, ApiError>;
		readonly listMenuItems: (
			restaurantId: string,
			params?: { page?: number; limit?: number; categoryId?: string },
		) => Effect.Effect<PaginatedMenuItemResponseType, ApiError>;
		readonly getMenuItem: (
			restaurantId: string,
			itemId: string,
		) => Effect.Effect<FlatMenuItemResponseType, ApiError>;
		readonly createMenuItem: (
			restaurantId: string,
			categoryId: string,
			payload: CreateMenuItemPayloadType,
		) => Effect.Effect<FlatMenuItemResponseType, ApiError>;
		readonly uploadMenuItemImage: (
			restaurantId: string,
			itemId: string,
			file: File,
		) => Effect.Effect<UploadResponseType, ApiError>;
		readonly updateMenuItem: (
			restaurantId: string,
			itemId: string,
			payload: UpdateMenuItemPayloadType,
		) => Effect.Effect<FlatMenuItemResponseType, ApiError>;
		readonly deleteMenuItem: (
			restaurantId: string,
			itemId: string,
		) => Effect.Effect<DeletedResponseType, ApiError>;
		readonly listCustomizationGroups: (
			restaurantId: string,
			itemId: string,
			page?: number,
			limit?: number,
		) => Effect.Effect<PaginatedCustomizationGroupResponseType, ApiError>;
		readonly getCustomizationGroup: (
			restaurantId: string,
			itemId: string,
			groupId: string,
		) => Effect.Effect<FlatCustomizationGroupResponseType, ApiError>;
		readonly createCustomizationGroup: (
			restaurantId: string,
			itemId: string,
			payload: CreateCustomizationGroupPayloadType,
		) => Effect.Effect<FlatCustomizationGroupResponseType, ApiError>;
		readonly updateCustomizationGroup: (
			restaurantId: string,
			itemId: string,
			groupId: string,
			payload: UpdateCustomizationGroupPayloadType,
		) => Effect.Effect<FlatCustomizationGroupResponseType, ApiError>;
		readonly deleteCustomizationGroup: (
			restaurantId: string,
			itemId: string,
			groupId: string,
		) => Effect.Effect<DeletedResponseType, ApiError>;
		readonly listCustomizationOptions: (
			restaurantId: string,
			itemId: string,
			groupId: string,
			page?: number,
			limit?: number,
		) => Effect.Effect<PaginatedCustomizationOptionResponseType, ApiError>;
		readonly getCustomizationOption: (
			restaurantId: string,
			itemId: string,
			groupId: string,
			optionId: string,
		) => Effect.Effect<FlatCustomizationOptionResponseType, ApiError>;
		readonly createCustomizationOption: (
			restaurantId: string,
			itemId: string,
			groupId: string,
			payload: CreateCustomizationOptionPayloadType,
		) => Effect.Effect<FlatCustomizationOptionResponseType, ApiError>;
		readonly updateCustomizationOption: (
			restaurantId: string,
			itemId: string,
			groupId: string,
			optionId: string,
			payload: UpdateCustomizationOptionPayloadType,
		) => Effect.Effect<FlatCustomizationOptionResponseType, ApiError>;
		readonly deleteCustomizationOption: (
			restaurantId: string,
			itemId: string,
			groupId: string,
			optionId: string,
		) => Effect.Effect<DeletedResponseType, ApiError>;
	}
>()("orderfood/lib/api/restaurant-api/RestaurantApi") {
	static readonly layer = Layer.effect(
		RestaurantApi,
		Effect.gen(function* () {
			const tokenStore = yield* TokenService;
			const BASE_URL =
				process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000";

			const baseClient = (yield* HttpClient.HttpClient).pipe(
				HttpClient.mapRequest(HttpClientRequest.prependUrl(BASE_URL)),
			);

			const mapError = (cause: unknown): ApiError => {
				if (cause instanceof HttpClientError.StatusCodeError) {
					return new ApiError({
						message: cause.message,
						status: cause.response.status,
					});
				}
				return new ApiError({ message: String(cause), status: 500 });
			};

			const authClient = () =>
				Effect.gen(function* () {
					const token = yield* tokenStore.getAccessToken;
					return baseClient.pipe(
						HttpClient.mapRequest(
							token
								? HttpClientRequest.setHeader(
										"Authorization",
										`Bearer ${token}`,
									)
								: (req) => req,
						),
					);
				});

			const setQuery = (params?: {
				page?: number;
				limit?: number;
				city?: string;
				isOpen?: boolean;
				categoryId?: string;
			}) =>
				HttpClientRequest.setUrlParams({
					...(params?.page !== undefined ? { page: String(params.page) } : {}),
					...(params?.limit !== undefined
						? { limit: String(params.limit) }
						: {}),
					...(params?.city ? { city: params.city } : {}),
					...(params?.isOpen !== undefined
						? { isOpen: String(params.isOpen) }
						: {}),
					...(params?.categoryId ? { categoryId: params.categoryId } : {}),
				});

			const list = (params?: {
				page?: number;
				limit?: number;
				city?: string;
				isOpen?: boolean;
			}): Effect.Effect<PaginatedRestaurantResponseType, ApiError> =>
				Effect.gen(function* () {
					const client = yield* authClient();
					return yield* HttpClientRequest.get("/restaurants").pipe(
						setQuery(params),
						client.execute,
						Effect.flatMap(
							HttpClientResponse.schemaBodyJson(PaginatedRestaurantResponse),
						),
						Effect.mapError(mapError),
						Effect.scoped,
					);
				});

			const get = (
				id: string,
			): Effect.Effect<PublicRestaurantDetailResponseType, ApiError> =>
				Effect.gen(function* () {
					const client = yield* authClient();
					return yield* HttpClientRequest.get(`/restaurants/${id}`).pipe(
						client.execute,
						Effect.flatMap(
							HttpClientResponse.schemaBodyJson(PublicRestaurantDetailResponse),
						),
						Effect.mapError(mapError),
						Effect.scoped,
					);
				});

			const create = (
				payload: CreateRestaurantPayloadType,
			): Effect.Effect<RestaurantResponseType, ApiError> =>
				Effect.gen(function* () {
					const client = yield* authClient();
					return yield* HttpClientRequest.post("/restaurants").pipe(
						HttpClientRequest.bodyJsonUnsafe(payload),
						client.execute,
						Effect.flatMap(
							HttpClientResponse.schemaBodyJson(RestaurantResponse),
						),
						Effect.mapError(mapError),
						Effect.scoped,
					);
				});

			const getMyRestaurant = (): Effect.Effect<
				RestaurantResponseType,
				ApiError
			> =>
				Effect.gen(function* () {
					const client = yield* authClient();
					return yield* HttpClientRequest.get("/restaurants/me").pipe(
						client.execute,
						Effect.flatMap(
							HttpClientResponse.schemaBodyJson(RestaurantResponse),
						),
						Effect.mapError(mapError),
						Effect.scoped,
					);
				});

			const uploadRestaurantLogo = (
				restaurantId: string,
				file: File,
			): Effect.Effect<UploadResponseType, ApiError> =>
				Effect.gen(function* () {
					const client = yield* authClient();
					const formData = new FormData();
					formData.append("file", file);

					return yield* HttpClientRequest.post(
						`/restaurants/${restaurantId}/logo`,
					).pipe(
						HttpClientRequest.bodyFormData(formData),
						client.execute,
						Effect.flatMap(HttpClientResponse.schemaBodyJson(UploadResponse)),
						Effect.mapError(mapError),
						Effect.scoped,
					);
				});

			const uploadRestaurantBanner = (
				restaurantId: string,
				file: File,
			): Effect.Effect<UploadResponseType, ApiError> =>
				Effect.gen(function* () {
					const client = yield* authClient();
					const formData = new FormData();
					formData.append("file", file);

					return yield* HttpClientRequest.post(
						`/restaurants/${restaurantId}/banner`,
					).pipe(
						HttpClientRequest.bodyFormData(formData),
						client.execute,
						Effect.flatMap(HttpClientResponse.schemaBodyJson(UploadResponse)),
						Effect.mapError(mapError),
						Effect.scoped,
					);
				});

			const update = (
				id: string,
				payload: UpdateRestaurantPayloadType,
			): Effect.Effect<RestaurantResponseType, ApiError> =>
				Effect.gen(function* () {
					const client = yield* authClient();
					return yield* HttpClientRequest.patch(`/restaurants/${id}`).pipe(
						HttpClientRequest.bodyJsonUnsafe(payload),
						client.execute,
						Effect.flatMap(
							HttpClientResponse.schemaBodyJson(RestaurantResponse),
						),
						Effect.mapError(mapError),
						Effect.scoped,
					);
				});

			const listCategories = (
				restaurantId: string,
				page?: number,
				limit?: number,
			): Effect.Effect<PaginatedMenuCategoryResponseType, ApiError> =>
				Effect.gen(function* () {
					const client = yield* authClient();
					return yield* HttpClientRequest.get(
						`/restaurants/${restaurantId}/categories`,
					).pipe(
						setQuery({ page, limit }),
						client.execute,
						Effect.flatMap(
							HttpClientResponse.schemaBodyJson(PaginatedMenuCategoryResponse),
						),
						Effect.mapError(mapError),
						Effect.scoped,
					);
				});

			const getCategory = (
				restaurantId: string,
				categoryId: string,
			): Effect.Effect<FlatMenuCategoryResponseType, ApiError> =>
				Effect.gen(function* () {
					const client = yield* authClient();
					return yield* HttpClientRequest.get(
						`/restaurants/${restaurantId}/categories/${categoryId}`,
					).pipe(
						client.execute,
						Effect.flatMap(
							HttpClientResponse.schemaBodyJson(FlatMenuCategoryResponse),
						),
						Effect.mapError(mapError),
						Effect.scoped,
					);
				});

			const createCategory = (
				restaurantId: string,
				payload: CreateCategoryPayloadType,
			): Effect.Effect<FlatMenuCategoryResponseType, ApiError> =>
				Effect.gen(function* () {
					const client = yield* authClient();
					return yield* HttpClientRequest.post(
						`/restaurants/${restaurantId}/categories`,
					).pipe(
						HttpClientRequest.bodyJsonUnsafe(payload),
						client.execute,
						Effect.flatMap(
							HttpClientResponse.schemaBodyJson(FlatMenuCategoryResponse),
						),
						Effect.mapError(mapError),
						Effect.scoped,
					);
				});

			const updateCategory = (
				restaurantId: string,
				categoryId: string,
				payload: UpdateCategoryPayloadType,
			): Effect.Effect<FlatMenuCategoryResponseType, ApiError> =>
				Effect.gen(function* () {
					const client = yield* authClient();
					return yield* HttpClientRequest.patch(
						`/restaurants/${restaurantId}/categories/${categoryId}`,
					).pipe(
						HttpClientRequest.bodyJsonUnsafe(payload),
						client.execute,
						Effect.flatMap(
							HttpClientResponse.schemaBodyJson(FlatMenuCategoryResponse),
						),
						Effect.mapError(mapError),
						Effect.scoped,
					);
				});

			const deleteCategory = (
				restaurantId: string,
				categoryId: string,
			): Effect.Effect<DeletedResponseType, ApiError> =>
				Effect.gen(function* () {
					const client = yield* authClient();
					yield* HttpClientRequest.delete(
						`/restaurants/${restaurantId}/categories/${categoryId}`,
					).pipe(
						client.execute,
						Effect.map(() => ({ message: "Deleted" })),
						Effect.mapError(mapError),
						Effect.scoped,
					);

					return { message: "Deleted" };
				});

			const listMenuItems = (
				restaurantId: string,
				params?: { page?: number; limit?: number; categoryId?: string },
			): Effect.Effect<PaginatedMenuItemResponseType, ApiError> =>
				Effect.gen(function* () {
					const client = yield* authClient();
					return yield* HttpClientRequest.get(
						`/restaurants/${restaurantId}/items`,
					).pipe(
						setQuery(params),
						client.execute,
						Effect.flatMap(
							HttpClientResponse.schemaBodyJson(PaginatedMenuItemResponse),
						),
						Effect.mapError(mapError),
						Effect.scoped,
					);
				});

			const getMenuItem = (
				restaurantId: string,
				itemId: string,
			): Effect.Effect<FlatMenuItemResponseType, ApiError> =>
				Effect.gen(function* () {
					const client = yield* authClient();
					return yield* HttpClientRequest.get(
						`/restaurants/${restaurantId}/items/${itemId}`,
					).pipe(
						client.execute,
						Effect.flatMap(
							HttpClientResponse.schemaBodyJson(FlatMenuItemResponse),
						),
						Effect.mapError(mapError),
						Effect.scoped,
					);
				});

			const createMenuItem = (
				restaurantId: string,
				categoryId: string,
				payload: CreateMenuItemPayloadType,
			): Effect.Effect<FlatMenuItemResponseType, ApiError> =>
				Effect.gen(function* () {
					const client = yield* authClient();
					return yield* HttpClientRequest.post(
						`/restaurants/${restaurantId}/categories/${categoryId}/items`,
					).pipe(
						HttpClientRequest.bodyJsonUnsafe(payload),
						client.execute,
						Effect.flatMap(
							HttpClientResponse.schemaBodyJson(FlatMenuItemResponse),
						),
						Effect.mapError(mapError),
						Effect.scoped,
					);
				});

			const uploadMenuItemImage = (
				restaurantId: string,
				itemId: string,
				file: File,
			): Effect.Effect<UploadResponseType, ApiError> =>
				Effect.gen(function* () {
					const client = yield* authClient();
					const formData = new FormData();
					formData.append("file", file);

					return yield* HttpClientRequest.post(
						`/restaurants/${restaurantId}/items/${itemId}/image`,
					).pipe(
						HttpClientRequest.bodyFormData(formData),
						client.execute,
						Effect.flatMap(HttpClientResponse.schemaBodyJson(UploadResponse)),
						Effect.mapError(mapError),
						Effect.scoped,
					);
				});

			const updateMenuItem = (
				restaurantId: string,
				itemId: string,
				payload: UpdateMenuItemPayloadType,
			): Effect.Effect<FlatMenuItemResponseType, ApiError> =>
				Effect.gen(function* () {
					const client = yield* authClient();
					return yield* HttpClientRequest.patch(
						`/restaurants/${restaurantId}/items/${itemId}`,
					).pipe(
						HttpClientRequest.bodyJsonUnsafe(payload),
						client.execute,
						Effect.flatMap(
							HttpClientResponse.schemaBodyJson(FlatMenuItemResponse),
						),
						Effect.mapError(mapError),
						Effect.scoped,
					);
				});

			const deleteMenuItem = (
				restaurantId: string,
				itemId: string,
			): Effect.Effect<DeletedResponseType, ApiError> =>
				Effect.gen(function* () {
					const client = yield* authClient();
					yield* HttpClientRequest.delete(
						`/restaurants/${restaurantId}/items/${itemId}`,
					).pipe(
						client.execute,
						Effect.map(() => ({ message: "Deleted" })),
						Effect.mapError(mapError),
						Effect.scoped,
					);

					return { message: "Deleted" };
				});

			const listCustomizationGroups = (
				restaurantId: string,
				itemId: string,
				page?: number,
				limit?: number,
			): Effect.Effect<PaginatedCustomizationGroupResponseType, ApiError> =>
				Effect.gen(function* () {
					const client = yield* authClient();
					return yield* HttpClientRequest.get(
						`/restaurants/${restaurantId}/items/${itemId}/groups`,
					).pipe(
						setQuery({ page, limit }),
						client.execute,
						Effect.flatMap(
							HttpClientResponse.schemaBodyJson(
								PaginatedCustomizationGroupResponse,
							),
						),
						Effect.mapError(mapError),
						Effect.scoped,
					);
				});

			const getCustomizationGroup = (
				restaurantId: string,
				itemId: string,
				groupId: string,
			): Effect.Effect<FlatCustomizationGroupResponseType, ApiError> =>
				Effect.gen(function* () {
					const client = yield* authClient();
					return yield* HttpClientRequest.get(
						`/restaurants/${restaurantId}/items/${itemId}/groups/${groupId}`,
					).pipe(
						client.execute,
						Effect.flatMap(
							HttpClientResponse.schemaBodyJson(FlatCustomizationGroupResponse),
						),
						Effect.mapError(mapError),
						Effect.scoped,
					);
				});

			const createCustomizationGroup = (
				restaurantId: string,
				itemId: string,
				payload: CreateCustomizationGroupPayloadType,
			): Effect.Effect<FlatCustomizationGroupResponseType, ApiError> =>
				Effect.gen(function* () {
					const client = yield* authClient();
					return yield* HttpClientRequest.post(
						`/restaurants/${restaurantId}/items/${itemId}/groups`,
					).pipe(
						HttpClientRequest.bodyJsonUnsafe(payload),
						client.execute,
						Effect.flatMap(
							HttpClientResponse.schemaBodyJson(FlatCustomizationGroupResponse),
						),
						Effect.mapError(mapError),
						Effect.scoped,
					);
				});

			const updateCustomizationGroup = (
				restaurantId: string,
				itemId: string,
				groupId: string,
				payload: UpdateCustomizationGroupPayloadType,
			): Effect.Effect<FlatCustomizationGroupResponseType, ApiError> =>
				Effect.gen(function* () {
					const client = yield* authClient();
					return yield* HttpClientRequest.patch(
						`/restaurants/${restaurantId}/items/${itemId}/groups/${groupId}`,
					).pipe(
						HttpClientRequest.bodyJsonUnsafe(payload),
						client.execute,
						Effect.flatMap(
							HttpClientResponse.schemaBodyJson(FlatCustomizationGroupResponse),
						),
						Effect.mapError(mapError),
						Effect.scoped,
					);
				});

			const deleteCustomizationGroup = (
				restaurantId: string,
				itemId: string,
				groupId: string,
			): Effect.Effect<DeletedResponseType, ApiError> =>
				Effect.gen(function* () {
					const client = yield* authClient();
					return yield* HttpClientRequest.delete(
						`/restaurants/${restaurantId}/items/${itemId}/groups/${groupId}`,
					).pipe(
						client.execute,
						Effect.flatMap(HttpClientResponse.schemaBodyJson(DeletedResponse)),
						Effect.mapError(mapError),
						Effect.scoped,
					);
				});

			const listCustomizationOptions = (
				restaurantId: string,
				itemId: string,
				groupId: string,
				page?: number,
				limit?: number,
			): Effect.Effect<PaginatedCustomizationOptionResponseType, ApiError> =>
				Effect.gen(function* () {
					const client = yield* authClient();
					return yield* HttpClientRequest.get(
						`/restaurants/${restaurantId}/items/${itemId}/groups/${groupId}/options`,
					).pipe(
						setQuery({ page, limit }),
						client.execute,
						Effect.flatMap(
							HttpClientResponse.schemaBodyJson(
								PaginatedCustomizationOptionResponse,
							),
						),
						Effect.mapError(mapError),
						Effect.scoped,
					);
				});

			const getCustomizationOption = (
				restaurantId: string,
				itemId: string,
				groupId: string,
				optionId: string,
			): Effect.Effect<FlatCustomizationOptionResponseType, ApiError> =>
				Effect.gen(function* () {
					const client = yield* authClient();
					return yield* HttpClientRequest.get(
						`/restaurants/${restaurantId}/items/${itemId}/groups/${groupId}/options/${optionId}`,
					).pipe(
						client.execute,
						Effect.flatMap(
							HttpClientResponse.schemaBodyJson(
								FlatCustomizationOptionResponse,
							),
						),
						Effect.mapError(mapError),
						Effect.scoped,
					);
				});

			const createCustomizationOption = (
				restaurantId: string,
				itemId: string,
				groupId: string,
				payload: CreateCustomizationOptionPayloadType,
			): Effect.Effect<FlatCustomizationOptionResponseType, ApiError> =>
				Effect.gen(function* () {
					const client = yield* authClient();
					return yield* HttpClientRequest.post(
						`/restaurants/${restaurantId}/items/${itemId}/groups/${groupId}/options`,
					).pipe(
						HttpClientRequest.bodyJsonUnsafe(payload),
						client.execute,
						Effect.flatMap(
							HttpClientResponse.schemaBodyJson(
								FlatCustomizationOptionResponse,
							),
						),
						Effect.mapError(mapError),
						Effect.scoped,
					);
				});

			const updateCustomizationOption = (
				restaurantId: string,
				itemId: string,
				groupId: string,
				optionId: string,
				payload: UpdateCustomizationOptionPayloadType,
			): Effect.Effect<FlatCustomizationOptionResponseType, ApiError> =>
				Effect.gen(function* () {
					const client = yield* authClient();
					return yield* HttpClientRequest.patch(
						`/restaurants/${restaurantId}/items/${itemId}/groups/${groupId}/options/${optionId}`,
					).pipe(
						HttpClientRequest.bodyJsonUnsafe(payload),
						client.execute,
						Effect.flatMap(
							HttpClientResponse.schemaBodyJson(
								FlatCustomizationOptionResponse,
							),
						),
						Effect.mapError(mapError),
						Effect.scoped,
					);
				});

			const deleteCustomizationOption = (
				restaurantId: string,
				itemId: string,
				groupId: string,
				optionId: string,
			): Effect.Effect<DeletedResponseType, ApiError> =>
				Effect.gen(function* () {
					const client = yield* authClient();
					return yield* HttpClientRequest.delete(
						`/restaurants/${restaurantId}/items/${itemId}/groups/${groupId}/options/${optionId}`,
					).pipe(
						client.execute,
						Effect.flatMap(HttpClientResponse.schemaBodyJson(DeletedResponse)),
						Effect.mapError(mapError),
						Effect.scoped,
					);
				});

			return {
				list,
				get,
				create,
				getMyRestaurant,
				uploadRestaurantLogo,
				uploadRestaurantBanner,
				update,
				listCategories,
				getCategory,
				createCategory,
				updateCategory,
				deleteCategory,
				listMenuItems,
				getMenuItem,
				createMenuItem,
				uploadMenuItemImage,
				updateMenuItem,
				deleteMenuItem,
				listCustomizationGroups,
				getCustomizationGroup,
				createCustomizationGroup,
				updateCustomizationGroup,
				deleteCustomizationGroup,
				listCustomizationOptions,
				getCustomizationOption,
				createCustomizationOption,
				updateCustomizationOption,
				deleteCustomizationOption,
			};
		}),
	).pipe(Layer.provide(TokenService.layer));
}
