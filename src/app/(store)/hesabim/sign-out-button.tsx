"use client";

import { signOut } from "@/lib/auth-client";
import { useRouter } from "next/navigation";

export function SignOutButton() {
	const router = useRouter();

	const handleSignOut = async () => {
		await signOut();
		router.push("/giris");
	};

	return (
		<button
			type="button"
			onClick={handleSignOut}
			className="w-full text-left px-4 py-2.5 rounded-lg text-destructive hover:bg-destructive/10 transition-colors"
		>
			Çıkış Yap
		</button>
	);
}
