"use client";

import { useState, useRef } from "react";
import Papa from "papaparse";
import { useMutation } from "@tanstack/react-query";
import { motion, AnimatePresence } from "motion/react";
import {
  Upload,
  FileText,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Download,
  ArrowLeft,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/admin/page-header";
import { useToast } from "@/hooks/use-toast";
import type { ImportRow, ImportResult } from "@/app/api/products/import/route";

const REQUIRED_COLS = ["name", "price"] as const;
const OPTIONAL_COLS = [
  "description",
  "comparePrice",
  "stock",
  "sku",
  "barcode",
  "categorySlug",
  "brandSlug",
  "isActive",
  "isFeatured",
  "isNew",
] as const;

const EXAMPLE_CSV = [
  "name,price,comparePrice,stock,sku,barcode,categorySlug,brandSlug,isActive,isFeatured,isNew,description",
  "Merida Bisiklet Pro 500,15999,18999,10,SKU001,1234567890123,dagbiсikleti,merida,true,true,false,Profesyonel dağ bisikleti",
  "Kask Büyük L,899,,25,KSK-L,,aksesuar,met,true,false,false,",
].join("\n");

export default function ProductImportPage() {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [rows, setRows] = useState<ImportRow[]>([]);
  const [parseError, setParseError] = useState<string>("");
  const [fileName, setFileName] = useState<string>("");
  const [result, setResult] = useState<ImportResult | null>(null);

  const importMutation = useMutation({
    mutationFn: async (rows: ImportRow[]) => {
      const res = await fetch("/api/products/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rows }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "İçe aktarma başarısız");
      }
      return res.json();
    },
    onSuccess: (data) => {
      setResult(data.data);
      toast({
        title: `${data.data.success} ürün içe aktarıldı`,
        description: data.data.failed > 0 ? `${data.data.failed} ürün başarısız` : undefined,
      });
    },
    onError: (err: Error) => {
      toast({ title: err.message, variant: "destructive" });
    },
  });

  function handleFile(file: File) {
    if (!file.name.endsWith(".csv")) {
      setParseError("Lütfen .csv formatında dosya yükleyin");
      return;
    }
    setFileName(file.name);
    setParseError("");
    setResult(null);

    Papa.parse<Record<string, string>>(file, {
      header: true,
      skipEmptyLines: true,
      complete: (parsed) => {
        const headers = parsed.meta.fields ?? [];
        const missing = REQUIRED_COLS.filter((c) => !headers.includes(c));
        if (missing.length > 0) {
          setParseError(`Zorunlu sütunlar eksik: ${missing.join(", ")}`);
          setRows([]);
          return;
        }

        const mapped: ImportRow[] = parsed.data.map((r) => ({
          name: r.name ?? "",
          description: r.description || undefined,
          price: parseFloat(r.price) || 0,
          comparePrice: r.comparePrice ? parseFloat(r.comparePrice) : undefined,
          stock: parseInt(r.stock ?? "0", 10),
          sku: r.sku || undefined,
          barcode: r.barcode || undefined,
          categorySlug: r.categorySlug || undefined,
          brandSlug: r.brandSlug || undefined,
          isActive: r.isActive !== "false",
          isFeatured: r.isFeatured === "true",
          isNew: r.isNew === "true",
        }));

        setRows(mapped);
      },
      error: (err) => {
        setParseError(err.message);
        setRows([]);
      },
    });
  }

  function downloadExample() {
    const blob = new Blob([EXAMPLE_CSV], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "ornek-urun-sablonu.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  const canImport = rows.length > 0 && !parseError && !importMutation.isPending;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/admin/urunler">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <PageHeader title="Toplu Ürün Yükleme" description="CSV dosyası ile ürünleri içe aktarın" />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Sol: Yükleme */}
        <div className="lg:col-span-2 space-y-5">
          {/* Şablon indir */}
          <Card>
            <CardContent className="p-5 flex items-center justify-between">
              <div>
                <p className="font-medium">CSV Şablonu</p>
                <p className="text-sm text-muted-foreground">
                  Örnek şablonu indirip doldurun, sonra yükleyin.
                </p>
              </div>
              <Button variant="outline" size="sm" onClick={downloadExample}>
                <Download className="h-4 w-4 mr-2" />
                Şablonu İndir
              </Button>
            </CardContent>
          </Card>

          {/* Dosya yükleme alanı */}
          <Card>
            <CardContent className="p-6">
              <div
                className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-colors ${
                  rows.length > 0
                    ? "border-green-400 bg-green-50/50"
                    : "border-muted-foreground/20 hover:border-primary/40 hover:bg-muted/20"
                }`}
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  const file = e.dataTransfer.files[0];
                  if (file) handleFile(file);
                }}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFile(file);
                  }}
                />

                {rows.length > 0 ? (
                  <div className="flex flex-col items-center gap-2">
                    <CheckCircle2 className="h-10 w-10 text-green-500" />
                    <p className="font-semibold text-green-700">{fileName}</p>
                    <p className="text-sm text-green-600">{rows.length} ürün hazır</p>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="mt-2 text-muted-foreground"
                      onClick={(e) => {
                        e.stopPropagation();
                        setRows([]);
                        setFileName("");
                        setResult(null);
                        if (fileInputRef.current) fileInputRef.current.value = "";
                      }}
                    >
                      Dosyayı Kaldır
                    </Button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-3">
                    <Upload className="h-10 w-10 text-muted-foreground opacity-50" />
                    <div>
                      <p className="font-medium">CSV dosyasını buraya sürükleyin</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        veya tıklayarak seçin (.csv)
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {parseError && (
                <div className="mt-4 flex items-start gap-2 p-3 bg-destructive/10 text-destructive text-sm rounded-lg border border-destructive/20">
                  <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
                  {parseError}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Önizleme */}
          <AnimatePresence>
            {rows.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 12 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      Önizleme — İlk {Math.min(rows.length, 5)} satır
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead className="bg-muted/50">
                          <tr>
                            {["Ad", "Fiyat", "Stok", "Kategori", "Marka", "Aktif"].map((h) => (
                              <th key={h} className="px-4 py-2 text-left font-medium text-muted-foreground whitespace-nowrap">
                                {h}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y">
                          {rows.slice(0, 5).map((row, i) => (
                            <tr key={i} className="hover:bg-muted/20">
                              <td className="px-4 py-2 font-medium max-w-[200px] truncate">{row.name}</td>
                              <td className="px-4 py-2 whitespace-nowrap">{row.price.toLocaleString("tr-TR")} ₺</td>
                              <td className="px-4 py-2">{row.stock}</td>
                              <td className="px-4 py-2 text-muted-foreground">{row.categorySlug || "—"}</td>
                              <td className="px-4 py-2 text-muted-foreground">{row.brandSlug || "—"}</td>
                              <td className="px-4 py-2">
                                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                                  row.isActive !== false
                                    ? "bg-green-100 text-green-700"
                                    : "bg-muted text-muted-foreground"
                                }`}>
                                  {row.isActive !== false ? "Aktif" : "Pasif"}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      {rows.length > 5 && (
                        <p className="px-4 py-2 text-xs text-muted-foreground border-t">
                          +{rows.length - 5} satır daha
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Sonuç */}
          <AnimatePresence>
            {result && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
              >
                <Card className={result.failed === 0 ? "border-green-200 bg-green-50/50" : "border-orange-200"}>
                  <CardContent className="p-5 space-y-4">
                    <div className="flex items-center gap-3">
                      {result.failed === 0 ? (
                        <CheckCircle2 className="h-6 w-6 text-green-500 shrink-0" />
                      ) : (
                        <AlertTriangle className="h-6 w-6 text-orange-500 shrink-0" />
                      )}
                      <div>
                        <p className="font-semibold">
                          {result.success} ürün başarıyla içe aktarıldı
                          {result.failed > 0 && `, ${result.failed} başarısız`}
                        </p>
                      </div>
                    </div>

                    {result.errors.length > 0 && (
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-destructive">Hatalar:</p>
                        {result.errors.map((e, i) => (
                          <div key={i} className="flex items-start gap-2 text-sm text-destructive">
                            <XCircle className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                            <span>Satır {e.row} — <span className="font-medium">{e.name}</span>: {e.error}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {result.success > 0 && (
                      <Button variant="outline" size="sm" asChild>
                        <Link href="/admin/urunler">Ürün listesine git</Link>
                      </Button>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Import butonu */}
          <Button
            size="lg"
            className="w-full"
            disabled={!canImport}
            onClick={() => importMutation.mutate(rows)}
          >
            {importMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                İçe Aktarılıyor...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" />
                {rows.length > 0 ? `${rows.length} Ürünü İçe Aktar` : "İçe Aktar"}
              </>
            )}
          </Button>
        </div>

        {/* Sağ: Kılavuz */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">CSV Format Kılavuzu</CardTitle>
            </CardHeader>
            <CardContent className="p-5 space-y-4 text-sm">
              <div>
                <p className="font-semibold mb-2">Zorunlu Sütunlar</p>
                <div className="space-y-1">
                  {REQUIRED_COLS.map((c) => (
                    <div key={c} className="flex items-center gap-2">
                      <span className="font-mono text-xs bg-red-100 text-red-700 px-1.5 py-0.5 rounded">{c}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <p className="font-semibold mb-2">Opsiyonel Sütunlar</p>
                <div className="space-y-1">
                  {OPTIONAL_COLS.map((c) => (
                    <div key={c} className="flex items-center gap-2">
                      <span className="font-mono text-xs bg-muted px-1.5 py-0.5 rounded">{c}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t pt-3 space-y-2 text-muted-foreground text-xs">
                <p><strong className="text-foreground">categorySlug / brandSlug:</strong> Sistemdeki slug değerleriyle eşleşmeli.</p>
                <p><strong className="text-foreground">isActive / isFeatured / isNew:</strong> <code>true</code> veya <code>false</code> yazın.</p>
                <p><strong className="text-foreground">Fiyatlar:</strong> Nokta ile ondalık: <code>1999.90</code></p>
                <p><strong className="text-foreground">Limit:</strong> Tek seferde max 500 ürün.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
