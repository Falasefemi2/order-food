import * as Context from "effect/Context";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as Ref from "effect/Ref";

export class TokenService extends Context.Service<
	TokenService,
	{
		readonly getAccessToken: Effect.Effect<string | null>;
		readonly getRefreshToken: Effect.Effect<string | null>;
		readonly setTokens: (tokens: {
			accessToken: string;
			refreshToken: string;
		}) => Effect.Effect<void>;
		readonly clearTokens: Effect.Effect<void>;
	}
>()("orderfood/lib/auth/token-store/TokenService") {
	static readonly layer = Layer.effect(
		TokenService,
		Effect.gen(function* () {
			const accessRef = yield* Ref.make<string | null>(
				typeof window !== "undefined"
					? localStorage.getItem("accessToken")
					: null,
			);
			const refreshRef = yield* Ref.make<string | null>(
				typeof window !== "undefined"
					? localStorage.getItem("refreshToken")
					: null,
			);
			return {
				getAccessToken: Ref.get(accessRef),
				getRefreshToken: Ref.get(refreshRef),
				setTokens: ({
					accessToken,
					refreshToken,
				}: {
					accessToken: string;
					refreshToken: string;
				}) =>
					Effect.gen(function* () {
						yield* Ref.set(accessRef, accessToken); // ← the actual token value
						yield* Ref.set(refreshRef, refreshToken); // ← the actual token value
						if (typeof window !== "undefined") {
							localStorage.setItem("accessToken", accessToken);
							localStorage.setItem("refreshToken", refreshToken);
							window.dispatchEvent(new Event("auth-change"));
						}
					}),
				clearTokens: Effect.gen(function* () {
					yield* Ref.set(accessRef, null);
					yield* Ref.set(refreshRef, null);
					if (typeof window !== "undefined") {
						localStorage.removeItem("accessToken");
						localStorage.removeItem("refreshToken");
						window.dispatchEvent(new Event("auth-change"));
					}
				}),
			};
		}),
	);
}
