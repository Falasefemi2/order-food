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
import { ApiError } from "@/lib/types";

export const AdminRestaurantResponse = Schema.Struct({
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
	commissionRate: Schema.String,
	ratingAvg: Schema.String,
	ratingCount: Schema.Number,
	ownerEmail: Schema.String,
	ownerName: Schema.String,
	createdAt: Schema.String,
	updatedAt: Schema.String,
});

export const AdminUserResponse = Schema.Struct({
	id: Schema.String,
	firstName: Schema.String,
	lastName: Schema.String,
	email: Schema.String,
	phoneNumber: Schema.NullOr(Schema.String),
	role: Schema.String,
	isActive: Schema.Boolean,
	walletBalance: Schema.String,
	createdAt: Schema.String,
});

export const PendingDriverResponse = Schema.Struct({
	id: Schema.String,
	userId: Schema.String,
	vehicleType: Schema.String,
	licenseNumber: Schema.NullOr(Schema.String),
	approvalStatus: Schema.String,
	createdAt: Schema.String,
	user: Schema.Struct({
		email: Schema.String,
		firstName: Schema.String,
		lastName: Schema.String,
	}),
});

const DeletedResponse = Schema.Struct({ message: Schema.String });

export type AdminRestaurantResponseType = Schema.Schema.Type<
	typeof AdminRestaurantResponse
>;
export type AdminUserResponseType = Schema.Schema.Type<
	typeof AdminUserResponse
>;
export type PendingDriverResponseType = Schema.Schema.Type<
	typeof PendingDriverResponse
>;

export class AdminApi extends Context.Service<
	AdminApi,
	{
		readonly listPendingRestaurants: () => Effect.Effect<
			readonly AdminRestaurantResponseType[],
			ApiError
		>;
		readonly listAllRestaurants: () => Effect.Effect<
			readonly AdminRestaurantResponseType[],
			ApiError
		>;
		readonly getRestaurantDetail: (
			id: string,
		) => Effect.Effect<AdminRestaurantResponseType, ApiError>;
		readonly approveRestaurant: (
			id: string,
		) => Effect.Effect<AdminRestaurantResponseType, ApiError>;
		readonly rejectRestaurant: (
			id: string,
			reason: string,
		) => Effect.Effect<AdminRestaurantResponseType, ApiError>;
		readonly suspendRestaurant: (
			id: string,
			reason: string,
		) => Effect.Effect<AdminRestaurantResponseType, ApiError>;
		readonly updateCommissionRate: (
			id: string,
			commissionRate: string,
		) => Effect.Effect<AdminRestaurantResponseType, ApiError>;

		readonly listUsers: () => Effect.Effect<
			readonly AdminUserResponseType[],
			ApiError
		>;
		readonly deactivateUser: (
			id: string,
		) => Effect.Effect<{ message: string }, ApiError>;
		readonly reactivateUser: (
			id: string,
		) => Effect.Effect<{ message: string }, ApiError>;

		readonly listPendingDrivers: () => Effect.Effect<
			readonly PendingDriverResponseType[],
			ApiError
		>;
		readonly approveDriver: (
			id: string,
		) => Effect.Effect<{ message: string }, ApiError>;
		readonly rejectDriver: (
			id: string,
			reason: string,
		) => Effect.Effect<{ message: string }, ApiError>;
	}
>()("orderfood/lib/api/admin-api/AdminApi") {
	static readonly layer = Layer.effect(
		AdminApi,
		Effect.gen(function* () {
			const tokenStore = yield* TokenService;
			const BASE_URL =
				process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000";

			const baseClient = (yield* HttpClient.HttpClient).pipe(
				HttpClient.mapRequest(HttpClientRequest.prependUrl(BASE_URL)),
			);

			const mapError = (cause: unknown): ApiError => {
				if (cause instanceof HttpClientError.StatusCodeError) {
					return new ApiError(
						{
							message: cause.message,
							status: cause.response.status,
						},
						{},
					);
				}
				return new ApiError({ message: String(cause), status: 500 }, {});
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

			const get = <A>(
				url: string,
				schema: Schema.Schema<A>,
			): Effect.Effect<A, ApiError, never> =>
				Effect.gen(function* () {
					const client = yield* authClient();
					return yield* HttpClientRequest.get(url).pipe(
						client.execute,
						Effect.flatMap(HttpClientResponse.schemaBodyJson(schema)),
						Effect.mapError(mapError),
						Effect.scoped,
					);
				}) as Effect.Effect<A, ApiError, never>;

			const post = <A>(
				url: string,
				body: unknown,
				schema: Schema.Schema<A>,
			): Effect.Effect<A, ApiError, never> =>
				Effect.gen(function* () {
					const client = yield* authClient();
					return yield* HttpClientRequest.post(url).pipe(
						HttpClientRequest.bodyJsonUnsafe(body),
						client.execute,
						Effect.flatMap(HttpClientResponse.schemaBodyJson(schema)),
						Effect.mapError(mapError),
						Effect.scoped,
					);
				}) as Effect.Effect<A, ApiError, never>;

			const patch = <A>(
				url: string,
				body: unknown,
				schema: Schema.Schema<A>,
			): Effect.Effect<A, ApiError, never> =>
				Effect.gen(function* () {
					const client = yield* authClient();
					return yield* HttpClientRequest.patch(url).pipe(
						HttpClientRequest.bodyJsonUnsafe(body),
						client.execute,
						Effect.flatMap(HttpClientResponse.schemaBodyJson(schema)),
						Effect.mapError(mapError),
						Effect.scoped,
					);
				}) as Effect.Effect<A, ApiError, never>;

			return {
				listPendingRestaurants: () =>
					get(
						"/admin/restaurants/pending",
						Schema.Array(AdminRestaurantResponse),
					),

				listAllRestaurants: () =>
					get("/admin/restaurants", Schema.Array(AdminRestaurantResponse)),

				getRestaurantDetail: (id) =>
					get(`/admin/restaurants/${id}`, AdminRestaurantResponse),

				approveRestaurant: (id) =>
					post(`/admin/restaurants/${id}/approve`, {}, AdminRestaurantResponse),

				rejectRestaurant: (id, reason) =>
					post(
						`/admin/restaurants/${id}/reject`,
						{ reason },
						AdminRestaurantResponse,
					),

				suspendRestaurant: (id, reason) =>
					post(
						`/admin/restaurants/${id}/suspend`,
						{ reason },
						AdminRestaurantResponse,
					),

				updateCommissionRate: (id, commissionRate) =>
					patch(
						`/admin/restaurants/${id}/commission`,
						{ commissionRate },
						AdminRestaurantResponse,
					),

				listUsers: () => get("/admin/users", Schema.Array(AdminUserResponse)),

				deactivateUser: (id) =>
					post(`/admin/users/${id}/deactivate`, {}, DeletedResponse),

				reactivateUser: (id) =>
					post(`/admin/users/${id}/reactivate`, {}, DeletedResponse),

				listPendingDrivers: () =>
					get("/admin/drivers/pending", Schema.Array(PendingDriverResponse)),

				approveDriver: (id) =>
					post(`/admin/drivers/${id}/approve`, {}, DeletedResponse),

				rejectDriver: (id, reason) =>
					post(`/admin/drivers/${id}/reject`, { reason }, DeletedResponse),
			};
		}),
	).pipe(Layer.provide(TokenService.layer));
}
