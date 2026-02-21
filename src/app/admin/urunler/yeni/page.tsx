"use client";

import { useState, useRef } from "react";
import {
	ScanBarcode,
	Search,
	CheckCircle2,
	AlertTriangle,
	ExternalLink,
	Loader2,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ProductForm } from "@/components/admin/products/product-form";
import Link from "next/link";

interface FoundProduct {
	id: number;
	name: string;
	barcode: string | null;
}

type ScanState =
	| { status: "idle" }
	| { status: "loading" }
	| { status: "found"; product: FoundProduct }
	| { status: "not_found"; barcode: string };

export default function NewProductPage() {
	const [input, setInput] = useState("");
	const [scan, setScan] = useState<ScanState>({ status: "idle" });
	const [prefillBarcode, setPrefillBarcode] = useState<string | undefined>();
	const inputRef = useRef<HTMLInputElement>(null);

	const handleScan = async () => {
		const code = input.trim();
		if (!code) return;

		setScan({ status: "loading" });
		setInput("");

		try {
			const res = await fetch(`/api/products/barcode/${encodeURIComponent(code)}`);
			if (res.status === 404) {
				setScan({ status: "not_found", barcode: code });
				setPrefillBarcode(code);
			} else if (res.ok) {
				const data = await res.json();
				setScan({ status: "found", product: data.data });
				setPrefillBarcode(undefined);
			} else {
				setScan({ status: "idle" });
			}
		} catch {
			setScan({ status: "idle" });
		}

		setTimeout(() => inputRef.current?.focus(), 100);
	};

	return (
		<div className="space-y-6">
			<div>
				<h1 className="text-2xl font-bold">Yeni Ürün</h1>
				<p className="text-muted-foreground text-sm mt-1">
					Önce barkod okutabilir ya da direkt formu doldurabilirsiniz
				</p>
			</div>

			{/* Barkod Tarama */}
			<Card className="border-dashed">
				<CardContent className="pt-5 pb-4">
					<div className="flex items-center gap-3 mb-3">
						<ScanBarcode className="h-5 w-5 text-primary shrink-0" />
						<span className="font-medium text-sm">Barkod ile Ön Doldurma</span>
						<span className="text-xs text-muted-foreground">
							— barkod okutulursa form alanı otomatik dolar
						</span>
					</div>
					<div className="flex gap-2 max-w-md">
						<Input
							ref={inputRef}
							placeholder="Barkod numarasını girin veya okutun..."
							value={input}
							onChange={(e) => setInput(e.target.value)}
							onKeyDown={(e) => e.key === "Enter" && handleScan()}
							className="font-mono"
						/>
						<Button
							type="button"
							variant="outline"
							onClick={handleScan}
							disabled={!input.trim() || scan.status === "loading"}
						>
							{scan.status === "loading" ? (
								<Loader2 className="h-4 w-4 animate-spin" />
							) : (
								<Search className="h-4 w-4" />
							)}
						</Button>
					</div>

					{/* Ürün bulundu — bu barkod zaten kayıtlı */}
					{scan.status === "found" && (
						<div className="mt-3 flex items-center gap-2 text-sm text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-950/40 border border-green-200 dark:border-green-900 rounded-lg px-3 py-2">
							<CheckCircle2 className="h-4 w-4 shrink-0" />
							<span>
								<strong>{scan.product.name}</strong> bu barkoda zaten kayıtlı.
							</span>
							<Link
								href={`/admin/urunler/${scan.product.id}`}
								className="ml-auto flex items-center gap-1 font-medium underline underline-offset-2 hover:opacity-80 transition-opacity"
							>
								Ürüne Git
								<ExternalLink className="h-3 w-3" />
							</Link>
						</div>
					)}

					{/* Barkod bulunamadı — forma aktarıldı */}
					{scan.status === "not_found" && (
						<div className="mt-3 flex items-center gap-2 text-sm text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 rounded-lg px-3 py-2">
							<AlertTriangle className="h-4 w-4 shrink-0" />
							<span>
								<code className="font-mono font-semibold">{prefillBarcode}</code> barkoduna ait ürün bulunamadı — barkod alanı forma aktarıldı.
							</span>
						</div>
					)}
				</CardContent>
			</Card>

			{/* Ürün Formu */}
			<ProductForm initialBarcode={prefillBarcode} />
		</div>
	);
}
