import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { formatPrice } from "@/lib/format";
import CheckoutForm from "@/components/CheckoutForm";

export default async function CheckoutPage({ params }) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/ingresar");

  const { data: product } = await supabase.from("products").select("*").eq("id", id).single();
  if (!product) notFound();

  if (product.seller_id === user.id) redirect(`/producto/${id}`);
  if (product.status !== "disponible") redirect(`/producto/${id}`);

  const { data: seller } = await supabase.from("profiles").select("name, phone").eq("id", product.seller_id).single();

  return (
    <div className="mx-auto max-w-md">
      <h1 className="mb-1 text-2xl font-bold text-gray-900">Coordinar compra</h1>
      <p className="mb-5 text-sm text-gray-500">
        {product.title} · <span className="font-semibold text-brand">{formatPrice(product.price)}</span>
      </p>
      <CheckoutForm product={product} seller={seller} />
    </div>
  );
}
