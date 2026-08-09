export async function isAdmin(supabase, user) {
  if (!user) return false;
  const { data } = await supabase.from("profiles").select("is_admin").eq("id", user.id).single();
  return Boolean(data?.is_admin);
}
