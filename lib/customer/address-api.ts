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
import { ApiError } from "../types";

export const AddressResponse = Schema.Struct({
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

export type AddressResponseType = Schema.Schema.Type<typeof AddressResponse>;

export const CreateAddressPayload = Schema.Struct({
	label: Schema.optional(Schema.String),
	addressLine1: Schema.String,
	addressLine2: Schema.optional(Schema.String),
	city: Schema.String,
	state: Schema.String,
	country: Schema.optional(Schema.String),
	postalCode: Schema.optional(Schema.String),
	latitude: Schema.String,
	longitude: Schema.String,
	isDefault: Schema.optional(Schema.Boolean),
});

export type CreateAddressPayloadType = Schema.Schema.Type<
	typeof CreateAddressPayload
>;

export const UpdateAddressPayload = Schema.Struct({
	label: Schema.optional(Schema.String),
	addressLine1: Schema.optional(Schema.String),
	addressLine2: Schema.optional(Schema.String),
	city: Schema.optional(Schema.String),
	state: Schema.optional(Schema.String),
	postalCode: Schema.optional(Schema.String),
	latitude: Schema.optional(Schema.String),
	longitude: Schema.optional(Schema.String),
	isDefault: Schema.optional(Schema.Boolean),
});

export type UpdateAddressPayloadType = Schema.Schema.Type<
	typeof UpdateAddressPayload
>;

export class AddressApi extends Context.Service<
	AddressApi,
	{
		readonly list: () => Effect.Effect<
			readonly AddressResponseType[],
			ApiError
		>;
		readonly get: (id: string) => Effect.Effect<AddressResponseType, ApiError>;
		readonly create: (
			payload: CreateAddressPayloadType,
		) => Effect.Effect<AddressResponseType, ApiError>;
		readonly update: (
			id: string,
			payload: UpdateAddressPayloadType,
		) => Effect.Effect<AddressResponseType, ApiError>;
		readonly remove: (
			id: string,
		) => Effect.Effect<{ message: string }, ApiError>;
		readonly setDefault: (
			id: string,
		) => Effect.Effect<AddressResponseType, ApiError>;
	}
>()("orderfood/lib/api/address-api/AddressApi") {
	static readonly layer = Layer.effect(
		AddressApi,
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
					} satisfies { message: string; status: number });
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

			const list = (): Effect.Effect<
				readonly AddressResponseType[],
				ApiError
			> =>
				Effect.gen(function* () {
					const client = yield* authClient();
					return yield* HttpClientRequest.get("/addresses").pipe(
						client.execute,
						Effect.flatMap(
							HttpClientResponse.schemaBodyJson(Schema.Array(AddressResponse)),
						),
						Effect.mapError(mapError),
						Effect.scoped,
					);
				});

			const get = (id: string): Effect.Effect<AddressResponseType, ApiError> =>
				Effect.gen(function* () {
					const client = yield* authClient();
					return yield* HttpClientRequest.get(`/addresses/${id}`).pipe(
						client.execute,
						Effect.flatMap(HttpClientResponse.schemaBodyJson(AddressResponse)),
						Effect.mapError(mapError),
						Effect.scoped,
					);
				});

			const create = (
				payload: CreateAddressPayloadType,
			): Effect.Effect<AddressResponseType, ApiError> =>
				Effect.gen(function* () {
					const client = yield* authClient();
					return yield* HttpClientRequest.post("/addresses").pipe(
						HttpClientRequest.bodyJsonUnsafe(payload),
						client.execute,
						Effect.flatMap(HttpClientResponse.schemaBodyJson(AddressResponse)),
						Effect.mapError(mapError),
						Effect.scoped,
					);
				});

			const update = (
				id: string,
				payload: UpdateAddressPayloadType,
			): Effect.Effect<AddressResponseType, ApiError> =>
				Effect.gen(function* () {
					const client = yield* authClient();
					return yield* HttpClientRequest.patch(`/addresses/${id}`).pipe(
						HttpClientRequest.bodyJsonUnsafe(payload),
						client.execute,
						Effect.flatMap(HttpClientResponse.schemaBodyJson(AddressResponse)),
						Effect.mapError(mapError),
						Effect.scoped,
					);
				});

			const remove = (
				id: string,
			): Effect.Effect<{ message: string }, ApiError> =>
				Effect.gen(function* () {
					const client = yield* authClient();
					return yield* HttpClientRequest.delete(`/addresses/${id}`).pipe(
						client.execute,
						Effect.flatMap(
							HttpClientResponse.schemaBodyJson(
								Schema.Struct({ message: Schema.String }),
							),
						),
						Effect.mapError(mapError),
						Effect.scoped,
					);
				});

			const setDefault = (
				id: string,
			): Effect.Effect<AddressResponseType, ApiError> =>
				Effect.gen(function* () {
					const client = yield* authClient();
					return yield* HttpClientRequest.post(`/addresses/${id}/default`).pipe(
						client.execute,
						Effect.flatMap(HttpClientResponse.schemaBodyJson(AddressResponse)),
						Effect.mapError(mapError),
						Effect.scoped,
					);
				});

			return { list, get, create, update, remove, setDefault };
		}),
	).pipe(Layer.provide(TokenService.layer));
}
