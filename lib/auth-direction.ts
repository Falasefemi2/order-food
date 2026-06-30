import * as Effect from "effect/Effect";
import type { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { AuthApi } from "./auth/auth-api";
import { runtime } from "./runtime";

export const redirectByRole = (role: string, router: AppRouterInstance) => {
	switch (role) {
		case "vendor":
			return router.push("/vendor/dashboard");
		case "driver":
			return router.push("/driver/dashboard");
		case "customer":
			return router.push("/customer/dashboard");
		case "admin":
			return router.push("/admin/dashboard");
		default:
			return router.push("/home");
	}
};

export const loginAndRedirect = async (
	params: { email: string; password: string },
	router: AppRouterInstance,
) => {
	await runtime
		.runPromise(
			Effect.gen(function* () {
				const auth = yield* AuthApi;
				yield* auth.login(params);
				const profile = yield* auth.me();
				return profile.role;
			}),
		)
		.then((role) => redirectByRole(role, router))
		.catch((err) => {
			console.error("raw error:", JSON.stringify(err, null, 2));
			throw err;
		});
};

export const registerAndRedirect = async (
	params: {
		firstName: string;
		lastName: string;
		email: string;
		password: string;
		phoneNumber?: string;
		role?: "customer" | "vendor" | "driver";
	},
	router: AppRouterInstance,
) => {
	await runtime
		.runPromise(
			Effect.gen(function* () {
				const auth = yield* AuthApi;
				yield* auth.register(params);
				const profile = yield* auth.me();
				return profile.role;
			}),
		)
		.then((role) => redirectByRole(role, router));
};

export const logoutAndRedirect = async (router: AppRouterInstance) => {
	await runtime.runPromise(
		Effect.gen(function* () {
			const auth = yield* AuthApi;
			yield* auth.logout();
		}),
	);
	router.push("/login");
};
