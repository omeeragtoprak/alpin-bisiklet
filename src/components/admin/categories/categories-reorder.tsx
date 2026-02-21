"use client";

import { useState } from "react";
import {
	DndContext,
	closestCenter,
	KeyboardSensor,
	PointerSensor,
	useSensor,
	useSensors,
	DragEndEvent,
} from "@dnd-kit/core";
import {
	arrayMove,
	SortableContext,
	sortableKeyboardCoordinates,
	useSortable,
	verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";

interface Category {
	id: number;
	name: string;
	order: number;
	parent?: { id: number; name: string } | null;
	parentId?: number | null;
}

function SortableItem({ category }: { category: Category }) {
	const {
		attributes,
		listeners,
		setNodeRef,
		transform,
		transition,
		isDragging,
	} = useSortable({ id: category.id });

	const style = {
		transform: CSS.Transform.toString(transform),
		transition,
		opacity: isDragging ? 0.5 : 1,
	};

	return (
		<div
			ref={setNodeRef}
			style={style}
			className="flex items-center gap-3 rounded-md border bg-card px-3 py-2.5 text-sm"
		>
			<button
				{...attributes}
				{...listeners}
				className="cursor-grab touch-none text-muted-foreground hover:text-foreground"
				type="button"
			>
				<GripVertical className="h-4 w-4" />
			</button>
			<span className="flex-1">{category.name}</span>
			{category.parentId && category.parent && (
				<span className="text-xs text-muted-foreground">
					{category.parent.name} altında
				</span>
			)}
		</div>
	);
}

interface CategoriesReorderProps {
	categories: Category[];
	onClose: () => void;
}

export function CategoriesReorder({
	categories: initialCategories,
	onClose,
}: CategoriesReorderProps) {
	const [items, setItems] = useState<Category[]>(
		[...initialCategories].sort((a, b) => a.order - b.order)
	);
	const [saving, setSaving] = useState(false);
	const { toast } = useToast();
	const queryClient = useQueryClient();

	const sensors = useSensors(
		useSensor(PointerSensor),
		useSensor(KeyboardSensor, {
			coordinateGetter: sortableKeyboardCoordinates,
		})
	);

	function handleDragEnd(event: DragEndEvent) {
		const { active, over } = event;
		if (over && active.id !== over.id) {
			setItems((prev) => {
				const oldIndex = prev.findIndex((i) => i.id === active.id);
				const newIndex = prev.findIndex((i) => i.id === over.id);
				return arrayMove(prev, oldIndex, newIndex);
			});
		}
	}

	async function handleSave() {
		setSaving(true);
		try {
			const payload = items.map((item, index) => ({
				id: item.id,
				order: index,
			}));

			const res = await fetch("/api/categories/reorder", {
				method: "PATCH",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ items: payload }),
			});

			if (!res.ok) throw new Error("Sıralama kaydedilemedi");

			await queryClient.invalidateQueries({ queryKey: ["categories"] });
			toast({ title: "Sıralama kaydedildi" });
			onClose();
		} catch {
			toast({
				title: "Hata",
				description: "Sıralama kaydedilirken hata oluştu.",
				variant: "destructive",
			});
		} finally {
			setSaving(false);
		}
	}

	return (
		<div className="space-y-4">
			<p className="text-sm text-muted-foreground">
				Kategorileri sürükleyerek istediğiniz sıraya getirin.
			</p>

			<DndContext
				sensors={sensors}
				collisionDetection={closestCenter}
				onDragEnd={handleDragEnd}
			>
				<SortableContext
					items={items.map((i) => i.id)}
					strategy={verticalListSortingStrategy}
				>
					<div className="space-y-1.5 max-h-96 overflow-y-auto pr-1">
						{items.map((category) => (
							<SortableItem key={category.id} category={category} />
						))}
					</div>
				</SortableContext>
			</DndContext>

			<div className="flex justify-end gap-2 pt-2">
				<Button type="button" variant="outline" onClick={onClose} disabled={saving}>
					İptal
				</Button>
				<Button type="button" onClick={handleSave} disabled={saving}>
					{saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
					Kaydet
				</Button>
			</div>
		</div>
	);
}
