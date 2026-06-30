"use client";

import * as Effect from "effect/Effect";
import { ArrowLeft, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { AuthApi } from "@/lib/auth/auth-api";
import { runtime } from "@/lib/runtime";

interface CustomerPageHeaderProps {
	title?: string;
}

export function CustomerPageHeader({ title }: CustomerPageHeaderProps) {
	const router = useRouter();

	const handleLogout = async () => {
		try {
			await runtime.runPromise(
				Effect.gen(function* () {
					const auth = yield* AuthApi;
					yield* auth.logout();
				}),
			);
			router.push("/login");
		} catch {
			toast.error("Failed to logout");
		}
	};

	return (
		<div className="sticky top-0 z-40 border-b border-border/60 bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/80">
			<div className="mx-auto flex max-w-2xl items-center gap-3 px-4 py-3">
				<Button
					variant="ghost"
					size="icon"
					onClick={() => router.back()}
					className="h-9 w-9 rounded-full"
					aria-label="Go back"
				>
					<ArrowLeft size={18} />
				</Button>

				<div className="min-w-0 flex-1">
					{title ? (
						<p className="truncate text-sm font-semibold text-foreground">
							{title}
						</p>
					) : null}
				</div>

				<Button
					variant="ghost"
					size="icon"
					onClick={handleLogout}
					className="h-9 w-9 rounded-full"
					aria-label="Logout"
				>
					<LogOut size={18} />
				</Button>
			</div>
		</div>
	);
}
