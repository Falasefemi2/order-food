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

export const DriverProfileResponse = Schema.Struct({
	id: Schema.String,
	userId: Schema.String,
	vehicleType: Schema.Literals(["bicycle", "motorbike", "car"]),
	vehiclePlateNumber: Schema.NullOr(Schema.String),
	vehicleColor: Schema.NullOr(Schema.String),
	vehicleModel: Schema.NullOr(Schema.String),
	licenseNumber: Schema.NullOr(Schema.String),
	licenseImageUrl: Schema.NullOr(Schema.String),
	vehicleImageUrl: Schema.NullOr(Schema.String),
	nationalIdImageUrl: Schema.NullOr(Schema.String),
	approvalStatus: Schema.String,
	rejectionReason: Schema.NullOr(Schema.String),
	status: Schema.String,
	currentLatitude: Schema.NullOr(Schema.String),
	currentLongitude: Schema.NullOr(Schema.String),
	lastLocationUpdate: Schema.NullOr(Schema.String),
	ratingAvg: Schema.String,
	ratingCount: Schema.Number,
	totalDeliveries: Schema.Number,
	createdAt: Schema.String,
	updatedAt: Schema.String,
});

export const DeliveryRequestResponse = Schema.Struct({
	id: Schema.String,
	orderId: Schema.String,
	driverId: Schema.String,
	status: Schema.Literals(["pending", "accepted", "declined", "expired"]),
	expiresAt: Schema.String,
	respondedAt: Schema.NullOr(Schema.String),
	createdAt: Schema.String,
});

export type DriverProfileResponseType = Schema.Schema.Type<
	typeof DriverProfileResponse
>;
export type DeliveryRequestResponseType = Schema.Schema.Type<
	typeof DeliveryRequestResponse
>;

export type VehicleType = "bicycle" | "motorbike" | "car";
export type DriverStatus = "offline" | "online_idle";

export type CreateDriverProfilePayload = {
	vehicleType: VehicleType;
	vehiclePlateNumber?: string;
	vehicleColor?: string;
	vehicleModel?: string;
	licenseNumber?: string;
};

export type UpdateDriverProfilePayload = {
	vehiclePlateNumber?: string;
	vehicleColor?: string;
	vehicleModel?: string;
	licenseNumber?: string;
};

export class DriverApi extends Context.Service<
	DriverApi,
	{
		readonly createProfile: (
			payload: CreateDriverProfilePayload,
		) => Effect.Effect<DriverProfileResponseType, ApiError>;

		readonly getMyProfile: () => Effect.Effect<
			DriverProfileResponseType,
			ApiError
		>;

		readonly updateMyProfile: (
			payload: UpdateDriverProfilePayload,
		) => Effect.Effect<DriverProfileResponseType, ApiError>;

		readonly uploadLicenseImage: (
			file: File,
		) => Effect.Effect<DriverProfileResponseType, ApiError>;

		readonly uploadVehicleImage: (
			file: File,
		) => Effect.Effect<DriverProfileResponseType, ApiError>;

		readonly uploadNationalIdImage: (
			file: File,
		) => Effect.Effect<DriverProfileResponseType, ApiError>;

		readonly updateStatus: (
			status: DriverStatus,
		) => Effect.Effect<DriverProfileResponseType, ApiError>;

		readonly updateLocation: (
			latitude: string,
			longitude: string,
		) => Effect.Effect<{ message: string }, ApiError>;

		readonly getMyPendingRequest: () => Effect.Effect<
			DeliveryRequestResponseType | null,
			ApiError
		>;

		readonly acceptDeliveryRequest: (
			id: string,
		) => Effect.Effect<DeliveryRequestResponseType, ApiError>;

		readonly declineDeliveryRequest: (
			id: string,
		) => Effect.Effect<DeliveryRequestResponseType, ApiError>;
	}
>()("orderfood/lib/api/driver-api/DriverApi") {
	static readonly layer = Layer.effect(
		DriverApi,
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

			const uploadFile = (
				url: string,
				file: File,
			): Effect.Effect<DriverProfileResponseType, ApiError, never> =>
				Effect.gen(function* () {
					const client = yield* authClient();
					const formData = new FormData();
					formData.append("file", file);
					return yield* HttpClientRequest.post(url).pipe(
						HttpClientRequest.bodyFormData(formData),
						client.execute,
						Effect.flatMap(
							HttpClientResponse.schemaBodyJson(DriverProfileResponse),
						),
						Effect.mapError(mapError),
						Effect.scoped,
					);
				}) as Effect.Effect<DriverProfileResponseType, ApiError, never>;

			return {
				createProfile: (payload) =>
					post("/drivers/me", payload, DriverProfileResponse),

				getMyProfile: () => get("/drivers/me", DriverProfileResponse),

				updateMyProfile: (payload) =>
					patch("/drivers/me", payload, DriverProfileResponse),

				uploadLicenseImage: (file) =>
					uploadFile("/drivers/me/license-image", file),

				uploadVehicleImage: (file) =>
					uploadFile("/drivers/me/vehicle-image", file),

				uploadNationalIdImage: (file) =>
					uploadFile("/drivers/me/national-id-image", file),

				updateStatus: (status) =>
					patch("/drivers/me/status", { status }, DriverProfileResponse),

				updateLocation: (latitude, longitude) =>
					post(
						"/drivers/me/location",
						{ latitude, longitude },
						Schema.Struct({ message: Schema.String }),
					),

				getMyPendingRequest: () =>
					get("/drivers/me/request", Schema.NullOr(DeliveryRequestResponse)),

				acceptDeliveryRequest: (id) =>
					post(`/drivers/requests/${id}/accept`, {}, DeliveryRequestResponse),

				declineDeliveryRequest: (id) =>
					post(`/drivers/requests/${id}/decline`, {}, DeliveryRequestResponse),
			};
		}),
	).pipe(Layer.provide(TokenService.layer));
}
