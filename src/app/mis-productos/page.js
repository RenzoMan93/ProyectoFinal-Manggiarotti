import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import ProductCard from "@/components/ProductCard";

const SECTIONS = [
  { status: "disponible", label: "Disponibles" },
  { status: "vendido", label: "Vendidos" },
  { status: "pausado", label: "Ocultos" },
];

export default async function MyProductsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/ingresar");

  const { data: products } = await supabase
    .from("products")
    .select("*")
    .eq("seller_id", user.id)
    .order("created_at", { ascending: false });

  const byStatus = (status) => (products || []).filter((p) => p.status === status);

  return (
    <div>
      <h1 className="mb-6 font-serif text-2xl font-semibold text-ink">Mis publicaciones</h1>

      {!products || products.length === 0 ? (
        <p className="py-10 text-center text-sm text-muted">Todavía no publicaste ningún artículo.</p>
      ) : (
        SECTIONS.map((section) => {
          const items = byStatus(section.status);
          if (items.length === 0) return null;
          return (
            <div key={section.status} className="mb-7">
              <h3 className="mb-3 text-sm font-bold text-ink">
                {section.label} <span className="font-normal text-muted">({items.length})</span>
              </h3>
              <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-3 md:grid-cols-4">
                {items.map((p) => (
                  <ProductCard key={p.id} product={p} isFavorite={false} loggedIn={Boolean(user)} />
                ))}
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}
