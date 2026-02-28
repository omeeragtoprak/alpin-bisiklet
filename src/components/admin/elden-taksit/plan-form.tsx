"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { Loader2, Search, Barcode, X, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { PhoneInput } from "@/components/ui/phone-input";
import { Textarea } from "@/components/ui/textarea";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import {
	createEldenTaksitSchema,
	type CreateEldenTaksitInput,
} from "@/lib/validations";

// ─────────────────────────────────────────────────────────────
// Tipler
// ─────────────────────────────────────────────────────────────

interface UserResult {
	id: string;
	name: string | null;
	email: string;
	phone: string | null;
}

interface ProductResult {
	id: number;
	name: string;
	price: number;
	sku: string | null;
	barcode: string | null;
}

// ─────────────────────────────────────────────────────────────
// Kullanıcı Arama Combobox
// ─────────────────────────────────────────────────────────────

interface UserSearchComboboxProps {
	value: string;
	onSelect: (user: UserResult | null) => void;
}

function UserSearchCombobox({ value, onSelect }: UserSearchComboboxProps) {
	const [query, setQuery] = useState("");
	const [results, setResults] = useState<UserResult[]>([]);
	const [loading, setLoading] = useState(false);
	const [open, setOpen] = useState(false);
	const [selected, setSelected] = useState<UserResult | null>(null);
	const containerRef = useRef<HTMLDivElement>(null);
	const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

	// Dışarı tıklayınca kapat
	useEffect(() => {
		function handleClickOutside(e: MouseEvent) {
			if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
				setOpen(false);
			}
		}
		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, []);

	const search = useCallback((q: string) => {
		if (debounceRef.current) clearTimeout(debounceRef.current);
		if (!q.trim()) {
			setResults([]);
			setOpen(false);
			return;
		}
		debounceRef.current = setTimeout(async () => {
			setLoading(true);
			try {
				const res = await fetch(
					`/api/admin/users?search=${encodeURIComponent(q)}&limit=15`,
				);
				const data = await res.json();
				setResults(data.data || []);
				setOpen(true);
			} catch {
				/* ignore */
			} finally {
				setLoading(false);
			}
		}, 300);
	}, []);

	const handleSelect = (user: UserResult) => {
		setSelected(user);
		setQuery(user.name || user.email);
		setOpen(false);
		onSelect(user);
	};

	const handleClear = () => {
		setSelected(null);
		setQuery("");
		setResults([]);
		setOpen(false);
		onSelect(null);
	};

	return (
		<div ref={containerRef} className="relative">
			<div className="relative">
				<Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
				<Input
					placeholder="İsim, e-posta veya telefon ara..."
					value={query}
					onChange={(e) => {
						setQuery(e.target.value);
						if (selected) {
							setSelected(null);
							onSelect(null);
						}
						search(e.target.value);
					}}
					onFocus={() => {
						if (results.length > 0) setOpen(true);
					}}
					className="pl-9 pr-8"
				/>
				{(query || selected) && (
					<button
						type="button"
						onClick={handleClear}
						className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
					>
						<X className="h-3.5 w-3.5" />
					</button>
				)}
				{loading && (
					<Loader2 className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 animate-spin text-muted-foreground" />
				)}
			</div>

			{/* Seçili kullanıcı göstergesi */}
			{selected && (
				<div className="mt-1.5 flex items-center gap-2 rounded-md bg-primary/10 px-2.5 py-1.5 text-xs text-primary">
					<User className="h-3 w-3 shrink-0" />
					<span className="font-medium">{selected.name || selected.email}</span>
					<span className="text-muted-foreground">{selected.email}</span>
				</div>
			)}

			{/* Dropdown */}
			{open && results.length > 0 && (
				<div className="absolute z-50 mt-1 w-full rounded-md border bg-popover shadow-md">
					<ul className="max-h-56 overflow-y-auto py-1">
						{results.map((u) => (
							<li key={u.id}>
								<button
									type="button"
									onMouseDown={(e) => {
										e.preventDefault();
										handleSelect(u);
									}}
									className="flex w-full flex-col px-3 py-2 text-left hover:bg-accent hover:text-accent-foreground transition-colors"
								>
									<span className="text-sm font-medium">{u.name || "—"}</span>
									<span className="text-xs text-muted-foreground">
										{u.email}
										{u.phone ? ` · ${u.phone}` : ""}
									</span>
								</button>
							</li>
						))}
					</ul>
				</div>
			)}

			{open && !loading && results.length === 0 && query.trim() && (
				<div className="absolute z-50 mt-1 w-full rounded-md border bg-popover shadow-md px-3 py-2 text-sm text-muted-foreground">
					Kullanıcı bulunamadı
				</div>
			)}
		</div>
	);
}

// ─────────────────────────────────────────────────────────────
// Ürün Arama Combobox (isim + barkod)
// ─────────────────────────────────────────────────────────────

interface ProductSearchComboboxProps {
	value: number | null;
	onSelect: (product: ProductResult | null) => void;
}

function ProductSearchCombobox({ value, onSelect }: ProductSearchComboboxProps) {
	const [query, setQuery] = useState("");
	const [barcodeInput, setBarcodeInput] = useState("");
	const [results, setResults] = useState<ProductResult[]>([]);
	const [loading, setLoading] = useState(false);
	const [barcodeLoading, setBarcodeLoading] = useState(false);
	const [open, setOpen] = useState(false);
	const [selected, setSelected] = useState<ProductResult | null>(null);
	const containerRef = useRef<HTMLDivElement>(null);
	const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

	useEffect(() => {
		function handleClickOutside(e: MouseEvent) {
			if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
				setOpen(false);
			}
		}
		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, []);

	const searchByName = useCallback((q: string) => {
		if (debounceRef.current) clearTimeout(debounceRef.current);
		if (!q.trim()) {
			setResults([]);
			setOpen(false);
			return;
		}
		debounceRef.current = setTimeout(async () => {
			setLoading(true);
			try {
				const res = await fetch(
					`/api/products?search=${encodeURIComponent(q)}&limit=20&isActive=true`,
				);
				const data = await res.json();
				setResults(data.data || []);
				setOpen(true);
			} catch {
				/* ignore */
			} finally {
				setLoading(false);
			}
		}, 300);
	}, []);

	const searchByBarcode = async (code: string) => {
		if (!code.trim()) return;
		setBarcodeLoading(true);
		try {
			const res = await fetch(`/api/products/barcode/${encodeURIComponent(code.trim())}`);
			if (!res.ok) {
				toast({ title: "Barkod bulunamadı", variant: "destructive" });
				return;
			}
			const data = await res.json();
			const p = data.data;
			const product: ProductResult = {
				id: p.id,
				name: p.name,
				price: p.price,
				sku: p.sku,
				barcode: p.barcode,
			};
			setSelected(product);
			setQuery(product.name);
			setBarcodeInput("");
			setOpen(false);
			onSelect(product);
			toast({ title: `Ürün bulundu: ${product.name}` });
		} catch {
			toast({ title: "Barkod okunamadı", variant: "destructive" });
		} finally {
			setBarcodeLoading(false);
		}
	};

	const handleSelect = (product: ProductResult) => {
		setSelected(product);
		setQuery(product.name);
		setOpen(false);
		onSelect(product);
	};

	const handleClear = () => {
		setSelected(null);
		setQuery("");
		setResults([]);
		setOpen(false);
		onSelect(null);
	};

	return (
		<div ref={containerRef} className="relative space-y-2">
			{/* İsim araması */}
			<div className="relative">
				<Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
				<Input
					placeholder="Ürün adıyla ara..."
					value={query}
					onChange={(e) => {
						setQuery(e.target.value);
						if (selected) {
							setSelected(null);
							onSelect(null);
						}
						searchByName(e.target.value);
					}}
					onFocus={() => {
						if (results.length > 0) setOpen(true);
					}}
					className="pl-9 pr-8"
				/>
				{(query || selected) && (
					<button
						type="button"
						onClick={handleClear}
						className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
					>
						<X className="h-3.5 w-3.5" />
					</button>
				)}
				{loading && (
					<Loader2 className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 animate-spin text-muted-foreground" />
				)}
			</div>

			{/* Barkod okutma */}
			<div className="relative">
				<Barcode className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
				<Input
					placeholder="Barkod okut veya gir, Enter'a bas..."
					value={barcodeInput}
					onChange={(e) => setBarcodeInput(e.target.value)}
					onKeyDown={(e) => {
						if (e.key === "Enter") {
							e.preventDefault();
							searchByBarcode(barcodeInput);
						}
					}}
					className="pl-9 pr-8 text-sm"
				/>
				{barcodeLoading && (
					<Loader2 className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 animate-spin text-muted-foreground" />
				)}
			</div>

			{/* Seçili ürün göstergesi */}
			{selected && (
				<div className="flex items-center gap-2 rounded-md bg-primary/10 px-2.5 py-1.5 text-xs text-primary">
					<span className="font-medium flex-1">{selected.name}</span>
					{selected.sku && (
						<span className="text-muted-foreground font-mono">{selected.sku}</span>
					)}
				</div>
			)}

			{/* Dropdown */}
			{open && results.length > 0 && (
				<div className="absolute z-50 w-full rounded-md border bg-popover shadow-md">
					<ul className="max-h-56 overflow-y-auto py-1">
						{results.map((p) => (
							<li key={p.id}>
								<button
									type="button"
									onMouseDown={(e) => {
										e.preventDefault();
										handleSelect(p);
									}}
									className="flex w-full items-center justify-between gap-3 px-3 py-2 text-left hover:bg-accent hover:text-accent-foreground transition-colors"
								>
									<span className="text-sm font-medium flex-1 min-w-0 truncate">
										{p.name}
									</span>
									<span className="text-xs text-muted-foreground shrink-0">
										{p.price.toLocaleString("tr-TR")} ₺
									</span>
								</button>
							</li>
						))}
					</ul>
				</div>
			)}

			{open && !loading && results.length === 0 && query.trim() && (
				<div className="absolute z-50 w-full rounded-md border bg-popover shadow-md px-3 py-2 text-sm text-muted-foreground">
					Ürün bulunamadı
				</div>
			)}
		</div>
	);
}

// ─────────────────────────────────────────────────────────────
// Ana Form
// ─────────────────────────────────────────────────────────────

export function EldenTaksitPlanForm() {
	const router = useRouter();
	const [loading, setLoading] = useState(false);

	const form = useForm<CreateEldenTaksitInput>({
		resolver: zodResolver(createEldenTaksitSchema),
		defaultValues: {
			customerName: "",
			customerPhone: "",
			customerEmail: "",
			userId: "",
			productId: null,
			productNote: "",
			totalAmount: 0,
			installmentCount: 6,
			installmentAmount: 0,
			startDate: new Date().toISOString().split("T")[0],
			notes: "",
		},
	});

	const totalAmount = form.watch("totalAmount");
	const installmentCount = form.watch("installmentCount");

	// Aylık taksit otomatik hesaplama
	useEffect(() => {
		if (totalAmount > 0 && installmentCount > 0) {
			const amount = Math.round((totalAmount / installmentCount) * 100) / 100;
			form.setValue("installmentAmount", amount);
		}
	}, [totalAmount, installmentCount, form]);

	// Kullanıcı seçilince bilgileri doldur
	const handleUserSelect = (user: UserResult | null) => {
		if (!user) {
			form.setValue("userId", "");
			return;
		}
		form.setValue("userId", user.id);
		if (user.name) form.setValue("customerName", user.name);
		if (user.email) form.setValue("customerEmail", user.email);
		if (user.phone) form.setValue("customerPhone", user.phone);
	};

	// Ürün seçilince productId ayarla
	const handleProductSelect = (product: ProductResult | null) => {
		form.setValue("productId", product ? product.id : null);
	};

	const onSubmit = async (data: CreateEldenTaksitInput) => {
		try {
			setLoading(true);
			const res = await fetch("/api/elden-taksit", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					...data,
					userId: data.userId || undefined,
					customerEmail: data.customerEmail || undefined,
					productId: data.productId || undefined,
				}),
			});
			if (!res.ok) {
				const err = await res.json();
				throw new Error(err.error || "Oluşturulamadı");
			}
			const result = await res.json();
			toast({ title: "Taksit planı oluşturuldu" });
			router.push(`/admin/elden-taksit/${result.data.id}`);
		} catch (error) {
			console.error(error);
			toast({
				title: error instanceof Error ? error.message : "Bir hata oluştu",
				variant: "destructive",
			});
		} finally {
			setLoading(false);
		}
	};

	const installmentOptions = [2, 3, 4, 5, 6, 8, 9, 10, 12, 18, 24, 36];

	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
				<div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
					{/* Müşteri Bilgileri */}
					<Card>
						<CardHeader>
							<CardTitle className="text-base">Müşteri Bilgileri</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4">
							{/* Sistemdeki kullanıcı — arama combobox */}
							<div className="space-y-1.5 relative">
								<label className="text-sm font-medium leading-none">
									Sistemdeki Kullanıcı{" "}
									<span className="font-normal text-muted-foreground">(Opsiyonel)</span>
								</label>
								<UserSearchCombobox
									value={form.watch("userId") || ""}
									onSelect={handleUserSelect}
								/>
								<p className="text-xs text-muted-foreground">
									Seçilince ad, telefon ve e-posta otomatik dolar.
								</p>
							</div>

							<div className="border-t pt-2" />

							<FormField
								control={form.control}
								name="customerName"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Ad Soyad *</FormLabel>
										<FormControl>
											<Input placeholder="Ahmet Yılmaz" {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="customerPhone"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Telefon *</FormLabel>
										<FormControl>
											<PhoneInput
												value={field.value}
												onChange={field.onChange}
												onBlur={field.onBlur}
												name={field.name}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="customerEmail"
								render={({ field }) => (
									<FormItem>
										<FormLabel>E-posta</FormLabel>
										<FormControl>
											<Input
												type="email"
												placeholder="ornek@mail.com"
												{...field}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
						</CardContent>
					</Card>

					{/* Ürün Bilgisi */}
					<Card>
						<CardHeader>
							<CardTitle className="text-base">Ürün Bilgisi</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4">
							<div className="space-y-1.5 relative">
								<label className="text-sm font-medium leading-none">
									Ürün{" "}
									<span className="font-normal text-muted-foreground">(Opsiyonel)</span>
								</label>
								<ProductSearchCombobox
									value={form.watch("productId") ?? null}
									onSelect={handleProductSelect}
								/>
							</div>

							<FormField
								control={form.control}
								name="productNote"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Ürün / İşlem Notu</FormLabel>
										<FormControl>
											<Textarea
												placeholder="Ürün modeli, rengi, servis notu..."
												rows={6}
												{...field}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
						</CardContent>
					</Card>

					{/* Taksit Planı */}
					<Card>
						<CardHeader>
							<CardTitle className="text-base">Taksit Planı</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4">
							<FormField
								control={form.control}
								name="totalAmount"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Toplam Tutar (₺) *</FormLabel>
										<FormControl>
											<Input
												type="number"
												min={0}
												step={0.01}
												placeholder="0.00"
												{...field}
												onChange={(e) => field.onChange(Number(e.target.value))}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="installmentCount"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Taksit Sayısı *</FormLabel>
										<Select
											value={String(field.value)}
											onValueChange={(v) => field.onChange(Number(v))}
										>
											<FormControl>
												<SelectTrigger>
													<SelectValue />
												</SelectTrigger>
											</FormControl>
											<SelectContent>
												{installmentOptions.map((n) => (
													<SelectItem key={n} value={String(n)}>
														{n} ay
													</SelectItem>
												))}
											</SelectContent>
										</Select>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="installmentAmount"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Aylık Taksit (₺)</FormLabel>
										<FormControl>
											<Input
												type="number"
												step={0.01}
												className="bg-muted font-medium"
												{...field}
												onChange={(e) => field.onChange(Number(e.target.value))}
											/>
										</FormControl>
										<p className="text-xs text-muted-foreground">
											Otomatik hesaplanır, gerekirse düzenleyebilirsiniz.
										</p>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="startDate"
								render={({ field }) => (
									<FormItem>
										<FormLabel>İlk Vade Tarihi *</FormLabel>
										<FormControl>
											<Input type="date" {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="notes"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Genel Notlar</FormLabel>
										<FormControl>
											<Textarea
												placeholder="Anlaşma detayları, özel notlar..."
												rows={3}
												{...field}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
						</CardContent>
					</Card>
				</div>

				<div className="flex justify-end gap-3">
					<Button
						type="button"
						variant="outline"
						onClick={() => router.back()}
						disabled={loading}
					>
						İptal
					</Button>
					<Button type="submit" disabled={loading}>
						{loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
						Planı Oluştur
					</Button>
				</div>
			</form>
		</Form>
	);
}
