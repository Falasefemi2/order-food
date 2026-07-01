import { Layer, ManagedRuntime } from "effect";
import type * as Effect from "effect/Effect";
import { FetchHttpClient } from "effect/unstable/http";
import { AdminApi } from "./admin-api";
import { AuthApi } from "./auth/auth-api";
import { TokenService } from "./auth/token-store";
import { AddressApi } from "./customer/address-api";
import { DriverApi } from "./driver-api";
import { OrderApi } from "./order-api";
import { RestaurantApi } from "./restaurant-api";

const BaseLayer = Layer.mergeAll(TokenService.layer, FetchHttpClient.layer);

const AppLayer = Layer.mergeAll(
	AuthApi.layer,
	AddressApi.layer,
	RestaurantApi.layer,
	OrderApi.layer,
	DriverApi.layer,
	AdminApi.layer,
).pipe(Layer.provide(BaseLayer));

export const runtime = ManagedRuntime.make(AppLayer);

export const runApi = <A, E, R>(effect: Effect.Effect<A, E, R>): Promise<A> =>
	runtime.runPromise(effect);
