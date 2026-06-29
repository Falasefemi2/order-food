import * as Context from "effect/Context";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as Schema from "effect/Schema";
import { HttpClientError } from "effect/unstable/http";
import * as HttpClient from "effect/unstable/http/HttpClient";
import * as HttpClientRequest from "effect/unstable/http/HttpClientRequest";
import * as HttpClientResponse from "effect/unstable/http/HttpClientResponse";
import { ApiError, AuthResponse, UserProfile } from "./auth-schema";
import { TokenService } from "./token-store";
import type { LoginParams, RegisterParams } from "./types";

export class AuthApi extends Context.Service<
	AuthApi,
	{
		readonly register: (
			params: RegisterParams,
		) => Effect.Effect<AuthResponse, ApiError>;
		readonly login: (
			params: LoginParams,
		) => Effect.Effect<AuthResponse, ApiError>;
		readonly refresh: () => Effect.Effect<AuthResponse, ApiError>;
		readonly logout: () => Effect.Effect<{ message: string }, ApiError>;
		readonly me: () => Effect.Effect<UserProfile, ApiError>;
		readonly uploadAvatar: (file: File) => Effect.Effect<UserProfile, ApiError>;
	}
>()("orderfood/lib/auth/auth-api/AuthApi") {
	static readonly layer = Layer.effect(
		AuthApi,
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
			const register = (
				params: RegisterParams,
			): Effect.Effect<AuthResponse, ApiError> =>
				Effect.gen(function* () {
					const response = yield* HttpClientRequest.post("/auth/register").pipe(
						HttpClientRequest.bodyJsonUnsafe(params),
						baseClient.execute,
						Effect.flatMap(HttpClientResponse.schemaBodyJson(AuthResponse)),
						Effect.mapError(mapError),
						Effect.scoped,
					);
					yield* tokenStore.setTokens({
						accessToken: response.accessToken,
						refreshToken: response.refreshToken,
					});
					return response;
				});
			const login = (
				params: LoginParams,
			): Effect.Effect<AuthResponse, ApiError> =>
				Effect.gen(function* () {
					const response = yield* HttpClientRequest.post("/auth/login").pipe(
						HttpClientRequest.bodyJsonUnsafe(params),
						baseClient.execute,
						Effect.flatMap(HttpClientResponse.schemaBodyJson(AuthResponse)),
						Effect.mapError(mapError),
						Effect.scoped,
					);
					yield* tokenStore.setTokens({
						accessToken: response.accessToken,
						refreshToken: response.refreshToken,
					});
					return response;
				});
			const refresh = (): Effect.Effect<AuthResponse, ApiError> =>
				Effect.gen(function* () {
					const refreshToken = yield* tokenStore.getRefreshToken;
					if (!refreshToken) {
						return yield* new ApiError({
							message: "No refresh token",
							status: 401,
						});
					}
					const response = yield* HttpClientRequest.post("/auth/refresh").pipe(
						HttpClientRequest.bodyJsonUnsafe({
							refreshToken,
						}),
						baseClient.execute,
						Effect.flatMap(HttpClientResponse.schemaBodyJson(AuthResponse)),
						Effect.mapError(mapError),
						Effect.scoped,
					);
					yield* tokenStore.setTokens({
						accessToken: response.accessToken,
						refreshToken: response.refreshToken,
					});
					return response;
				});
			const logout = (): Effect.Effect<{ message: string }, ApiError> =>
				Effect.gen(function* () {
					const client = yield* authClient();
					const response = yield* HttpClientRequest.post("/auth/logout").pipe(
						client.execute,
						Effect.flatMap(
							HttpClientResponse.schemaBodyJson(
								Schema.Struct({
									message: Schema.String,
								}),
							),
						),
						Effect.mapError(mapError),
						Effect.scoped,
					);
					yield* tokenStore.clearTokens;
					return response;
				});
			const me = (): Effect.Effect<UserProfile, ApiError> =>
				Effect.gen(function* () {
					const client = yield* authClient();
					return yield* HttpClientRequest.get("/auth/me").pipe(
						client.execute,
						Effect.flatMap(HttpClientResponse.schemaBodyJson(UserProfile)),
						Effect.mapError(mapError),
						Effect.scoped,
					);
				});
			const uploadAvatar = (file: File): Effect.Effect<UserProfile, ApiError> =>
				Effect.gen(function* () {
					const client = yield* authClient();
					const formData = new FormData();
					formData.append("file", file);
					return yield* HttpClientRequest.post("/auth/me/avatar").pipe(
						HttpClientRequest.bodyFormData(formData),
						client.execute,
						Effect.flatMap(HttpClientResponse.schemaBodyJson(UserProfile)),
						Effect.mapError(mapError),
						Effect.scoped,
					);
				});

			return { register, login, refresh, logout, me, uploadAvatar };
		}),
	).pipe(Layer.provide(TokenService.layer));
}
