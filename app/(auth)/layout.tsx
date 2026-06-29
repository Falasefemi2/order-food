import Link from "next/link";

export default function AuthLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<div className="min-h-screen bg-gray-50 flex flex-col">
			{/* Simple auth navbar */}
			<header className="h-14 flex items-center px-6 border-b border-gray-200 bg-white">
				<Link href="/" className="flex items-center gap-2 shrink-0">
					<span className="font-bold text-2xl text-gray-900">
						Order<span className="text-brand">&</span>Eat
					</span>
				</Link>
			</header>

			{/* Centered content */}
			<div className="flex-1 flex items-center justify-center p-4">
				<div className="w-full max-w-md">{children}</div>
			</div>
		</div>
	);
}
