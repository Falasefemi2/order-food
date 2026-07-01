import { Layer, ManagedRuntime } from "effect";
import { FetchHttpClient } from "effect/unstable/http";
import { AuthApi } from "./auth/auth-api";
import { TokenService } from "./auth/token-store";
import { AddressApi } from "./customer/address-api";
import { OrderApi } from "./order-api";
import { RestaurantApi } from "./restaurant-api";

const BaseLayer = Layer.mergeAll(TokenService.layer, FetchHttpClient.layer);

const AppLayer = Layer.mergeAll(
	AuthApi.layer,
	AddressApi.layer,
	RestaurantApi.layer,
	OrderApi.layer,
).pipe(Layer.provide(BaseLayer));

export const runtime = ManagedRuntime.make(AppLayer);
