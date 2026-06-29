import { ManagedRuntime, Layer } from "effect";
import { FetchHttpClient } from "effect/unstable/http";
import { TokenService } from "./auth/token-store";
import { AuthApi } from "./auth/auth-api";

const BaseLayer = Layer.mergeAll(TokenService.layer, FetchHttpClient.layer);

const AppLayer = Layer.mergeAll(AuthApi.layer).pipe(Layer.provide(BaseLayer));

export const runtime = ManagedRuntime.make(AppLayer);
