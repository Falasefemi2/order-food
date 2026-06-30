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
