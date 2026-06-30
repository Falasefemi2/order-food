import * as Schema from "effect/Schema";

export const AuthResponse = Schema.Struct({
	accessToken: Schema.String,
	refreshToken: Schema.String,
	userId: Schema.String,
});
export type AuthResponse = typeof AuthResponse.Type;

export const UserProfile = Schema.Struct({
	id: Schema.String,
	email: Schema.String,
	firstName: Schema.String,
	lastName: Schema.String,
	role: Schema.String,
	walletBalance: Schema.String,
	avatarUrl: Schema.NullOr(Schema.String),
	createdAt: Schema.String,
});

export type UserProfile = typeof UserProfile.Type;

export class ApiError extends Schema.TaggedErrorClass<ApiError>()("ApiError", {
	message: Schema.String,
	status: Schema.Number,
}) {}

export const PublicRestaurant = Schema.Struct({
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
export type PublicRestaurant = typeof PublicRestaurant.Type;

export const CustomizationOption = Schema.Struct({
	id: Schema.String,
	name: Schema.String,
	price: Schema.String,
	isAvailable: Schema.Boolean,
});

export const CustomizationGroup = Schema.Struct({
	id: Schema.String,
	name: Schema.String,
	minSelectable: Schema.Number,
	maxSelectable: Schema.Number,
	isRequired: Schema.Boolean,
	options: Schema.Array(CustomizationOption),
});

export const MenuItem = Schema.Struct({
	id: Schema.String,
	name: Schema.String,
	description: Schema.NullOr(Schema.String),
	price: Schema.String,
	imageUrl: Schema.NullOr(Schema.String),
	isAvailable: Schema.Boolean,
	isVegetarian: Schema.Boolean,
	calories: Schema.NullOr(Schema.Number),
	customizationGroups: Schema.Array(CustomizationGroup),
});

export const MenuCategory = Schema.Struct({
	id: Schema.String,
	name: Schema.String,
	description: Schema.NullOr(Schema.String),
	sortOrder: Schema.Number,
	items: Schema.Array(MenuItem),
});

export const PublicRestaurantDetail = Schema.Struct({
	...PublicRestaurant.fields,
	categories: Schema.Array(MenuCategory),
});
export type PublicRestaurantDetail = typeof PublicRestaurantDetail.Type;

export const Address = Schema.Struct({
	id: Schema.String,
	userId: Schema.String,
	label: Schema.String,
	addressLine1: Schema.String,
	addressLine2: Schema.NullOr(Schema.String),
	city: Schema.String,
	state: Schema.String,
	country: Schema.String,
	postalCode: Schema.NullOr(Schema.String),
	latitude: Schema.String,
	longitude: Schema.String,
	isDefault: Schema.Boolean,
	createdAt: Schema.String,
	updatedAt: Schema.String,
});
export type Address = typeof Address.Type;

export const OrderSummary = Schema.Struct({
	id: Schema.String,
	restaurantId: Schema.String,
	restaurantName: Schema.String,
	status: Schema.String,
	totalPrice: Schema.String,
	paymentStatus: Schema.String,
	paymentMethod: Schema.String,
	itemCount: Schema.Number,
	placedAt: Schema.NullOr(Schema.String),
	deliveredAt: Schema.NullOr(Schema.String),
	createdAt: Schema.String,
});
export type OrderSummary = typeof OrderSummary.Type;
