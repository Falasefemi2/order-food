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

const OrderItemCustomizationResponse = Schema.Struct({
	id: Schema.String,
	orderItemId: Schema.String,
	customizationOptionId: Schema.NullOr(Schema.String),
	optionName: Schema.String,
	price: Schema.String,
});

const OrderItemResponse = Schema.Struct({
	id: Schema.String,
	orderId: Schema.String,
	menuItemId: Schema.NullOr(Schema.String),
	itemName: Schema.String,
	quantity: Schema.Number,
	unitPrice: Schema.String,
	totalPrice: Schema.String,
	customizations: Schema.Array(OrderItemCustomizationResponse),
});

export const OrderResponse = Schema.Struct({
	id: Schema.String,
	customerId: Schema.String,
	restaurantId: Schema.String,
	driverId: Schema.NullOr(Schema.String),
	status: Schema.String,
	subtotal: Schema.String,
	deliveryFee: Schema.String,
	serviceFee: Schema.String,
	discountAmount: Schema.String,
	driverTip: Schema.String,
	totalPrice: Schema.String,
	couponId: Schema.NullOr(Schema.String),
	deliveryAddressId: Schema.NullOr(Schema.String),
	deliveryAddressLine: Schema.String,
	deliveryCity: Schema.String,
	deliveryLatitude: Schema.String,
	deliveryLongitude: Schema.String,
	deliveryNotes: Schema.NullOr(Schema.String),
	paymentStatus: Schema.String,
	paymentMethod: Schema.String,
	cancellationReason: Schema.NullOr(Schema.String),
	cancellationSource: Schema.NullOr(Schema.String),
	placedAt: Schema.NullOr(Schema.String),
	acceptedAt: Schema.NullOr(Schema.String),
	preparedAt: Schema.NullOr(Schema.String),
	pickedUpAt: Schema.NullOr(Schema.String),
	deliveredAt: Schema.NullOr(Schema.String),
	cancelledAt: Schema.NullOr(Schema.String),
	createdAt: Schema.String,
	updatedAt: Schema.String,
	items: Schema.Array(OrderItemResponse),
});

export const OrderSummaryResponse = Schema.Struct({
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

const PaginatedOrdersResponse = Schema.Struct({
	orders: Schema.Array(OrderSummaryResponse),
	total: Schema.Number,
});

export type OrderResponseType = Schema.Schema.Type<typeof OrderResponse>;
export type OrderSummaryResponseType = Schema.Schema.Type<
	typeof OrderSummaryResponse
>;
export type PaginatedOrdersResponseType = Schema.Schema.Type<
	typeof PaginatedOrdersResponse
>;

export type PlaceOrderPayload = {
	restaurantId: string;
	addressId: string;
	items: {
		menuItemId: string;
		quantity: number;
		selectedOptionIds?: string[];
	}[];
	couponCode?: string;
	paymentMethod: "card" | "bank_transfer" | "wallet" | "cash_on_delivery";
	driverTip?: string;
	deliveryNotes?: string;
};

export class OrderApi extends Context.Service<
	OrderApi,
	{
		// Customer
		readonly placeOrder: (
			payload: PlaceOrderPayload,
		) => Effect.Effect<OrderResponseType, ApiError>;
		readonly listMyOrders: () => Effect.Effect<
			PaginatedOrdersResponseType,
			ApiError
		>;
		readonly getOrder: (
			id: string,
		) => Effect.Effect<OrderResponseType, ApiError>;
		readonly cancelOrder: (
			id: string,
			reason: string,
		) => Effect.Effect<OrderResponseType, ApiError>;

		// Vendor
		readonly listRestaurantOrders: (
			restaurantId: string,
		) => Effect.Effect<readonly OrderSummaryResponseType[], ApiError>;
		readonly acceptOrder: (
			id: string,
			restaurantId: string,
		) => Effect.Effect<OrderResponseType, ApiError>;
		readonly rejectOrder: (
			id: string,
			restaurantId: string,
			reason: string,
		) => Effect.Effect<OrderResponseType, ApiError>;
		readonly markPreparing: (
			id: string,
			restaurantId: string,
		) => Effect.Effect<OrderResponseType, ApiError>;
		readonly markReadyForPickup: (
			id: string,
			restaurantId: string,
		) => Effect.Effect<OrderResponseType, ApiError>;

		// Driver
		readonly markPickedUp: (
			id: string,
		) => Effect.Effect<OrderResponseType, ApiError>;
		readonly markDelivered: (
			id: string,
		) => Effect.Effect<OrderResponseType, ApiError>;
	}
>()("orderfood/lib/api/order-api/OrderApi") {
	static readonly layer = Layer.effect(
		OrderApi,
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
					) as Effect.Effect<A, ApiError, never>;
				}) as Effect.Effect<A, ApiError, never>;

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
					) as Effect.Effect<A, ApiError, never>;
				}) as Effect.Effect<A, ApiError, never>;

			return {
				placeOrder: (payload) => post("/orders", payload, OrderResponse),

				listMyOrders: () => get("/orders", PaginatedOrdersResponse),

				getOrder: (id) => get(`/orders/${id}`, OrderResponse),

				cancelOrder: (id, reason) =>
					post(`/orders/${id}/cancel`, { reason }, OrderResponse),

				listRestaurantOrders: (restaurantId) =>
					get(
						`/restaurants/${restaurantId}/orders`,
						Schema.Array(OrderSummaryResponse),
					),

				acceptOrder: (id, restaurantId) =>
					post(`/orders/${id}/accept`, { restaurantId }, OrderResponse),

				rejectOrder: (id, restaurantId, reason) =>
					post(`/orders/${id}/reject`, { restaurantId, reason }, OrderResponse),

				markPreparing: (id, restaurantId) =>
					post(`/orders/${id}/preparing`, { restaurantId }, OrderResponse),

				markReadyForPickup: (id, restaurantId) =>
					post(`/orders/${id}/ready`, { restaurantId }, OrderResponse),

				markPickedUp: (id) =>
					post(`/orders/${id}/picked-up`, {}, OrderResponse),

				markDelivered: (id) =>
					post(`/orders/${id}/delivered`, {}, OrderResponse),
			};
		}),
	).pipe(Layer.provide(TokenService.layer));
}
