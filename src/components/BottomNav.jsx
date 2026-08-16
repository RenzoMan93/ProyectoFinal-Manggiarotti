import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getConversationsWithUnread } from "@/lib/unread";

export default async function BottomNav() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const conversations = await getConversationsWithUnread(supabase, user.id);
  const unreadCount = conversations.filter((c) => c.unread).length;

  return (
    <nav className="fixed inset-x-0 bottom-0 z-20 flex border-t border-line bg-paper px-1 pb-[calc(env(safe-area-inset-bottom)+6px)] pt-2 sm:hidden">
      <NavItem href="/" icon={<HomeIcon />} label="Inicio" />
      <NavItem href="/favoritos" icon={<HeartIcon />} label="Favoritos" />
      <NavItem href="/publicar" icon={<PlusIcon />} label="Publicar" highlight />
      <NavItem href="/mensajes" icon={<ChatIcon />} label="Mensajes" badge={unreadCount} />
      <NavItem href="/verificar" icon={<UserIcon />} label="Perfil" />
    </nav>
  );
}

function NavItem({ href, icon, label, badge, highlight }) {
  return (
    <Link
      href={href}
      className="relative flex flex-1 flex-col items-center gap-1 py-1 text-[9.5px] font-bold text-muted"
    >
      <span
        className={`relative flex h-8 w-8 items-center justify-center rounded-full ${
          highlight ? "bg-coral text-white" : "text-ink"
        }`}
      >
        {icon}
        {badge > 0 && (
          <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-coral px-1 text-[9px] font-bold text-white">
            {badge}
          </span>
        )}
      </span>
      <span className={highlight ? "text-coral" : ""}>{label}</span>
    </Link>
  );
}

function HomeIcon() {
  return (
    <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3 11l9-7 9 7" />
      <path d="M5 10v10h14V10" />
    </svg>
  );
}
function HeartIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M20.8 4.6a5.5 5.5 0 00-7.8 0L12 5.6l-1-1a5.5 5.5 0 00-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 000-7.8z" />
    </svg>
  );
}
function PlusIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}
function ChatIcon() {
  return (
    <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
    </svg>
  );
}
function UserIcon() {
  return (
    <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21v-1a8 8 0 0116 0v1" />
    </svg>
  );
}
