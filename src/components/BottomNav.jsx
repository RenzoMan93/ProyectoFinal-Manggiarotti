import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getConversationsWithUnread } from "@/lib/unread";
import { initials } from "@/lib/format";

export default async function BottomNav() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const [conversations, { data: profile }] = await Promise.all([
    getConversationsWithUnread(supabase, user.id),
    supabase.from("profiles").select("name").eq("id", user.id).single(),
  ]);
  const unreadCount = conversations.filter((c) => c.unread).length;

  return (
    <nav className="fixed inset-x-0 bottom-0 z-20 flex items-center border-t border-line bg-paper px-1 pb-[calc(env(safe-area-inset-bottom)+8px)] pt-2.5 sm:hidden">
      <NavItem href="/" icon={<HomeIcon />} />
      <NavItem href="/favoritos" icon={<HeartIcon />} />
      <NavItem href="/publicar" icon={<PlusIcon />} highlight />
      <NavItem href="/mensajes" icon={<ChatIcon />} badge={unreadCount} />
      <Link href="/cuenta" className="flex flex-1 items-center justify-center py-1.5">
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-brand text-[10px] font-bold text-white">
          {initials(profile?.name)}
        </span>
      </Link>
    </nav>
  );
}

function NavItem({ href, icon, badge, highlight }) {
  return (
    <Link href={href} className="relative flex flex-1 items-center justify-center py-1.5">
      <span
        className={`relative flex h-9 w-9 items-center justify-center rounded-full ${
          highlight ? "bg-coral text-white" : "text-ink"
        }`}
      >
        {icon}
        {badge > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-coral px-1 text-[9px] font-bold text-white">
            {badge}
          </span>
        )}
      </span>
    </Link>
  );
}

function HomeIcon() {
  return (
    <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3 11l9-7 9 7" />
      <path d="M5 10v10h14V10" />
    </svg>
  );
}
function HeartIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M20.8 4.6a5.5 5.5 0 00-7.8 0L12 5.6l-1-1a5.5 5.5 0 00-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 000-7.8z" />
    </svg>
  );
}
function PlusIcon() {
  return (
    <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}
function ChatIcon() {
  return (
    <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
    </svg>
  );
}
