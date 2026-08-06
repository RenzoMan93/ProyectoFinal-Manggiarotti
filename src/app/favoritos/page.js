import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import ProductCard from "@/components/ProductCard";

export default async function FavoritesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/ingresar");

  const { data: favs } = await supabase
    .from("favorites")
    .select("product_id, products(*)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const products = (favs || []).map((f) => f.products).filter(Boolean);

  return (
    <div>
      <h1 className="mb-5 text-2xl font-bold text-gray-900">Tus favoritos</h1>

      {products.length === 0 ? (
        <p className="py-10 text-center text-sm text-gray-400">Todavía no guardaste ningún artículo.</p>
      ) : (
        <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-3 md:grid-cols-4">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} isFavorite loggedIn />
          ))}
        </div>
      )}
    </div>
  );
}
