"use client";

import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function ChatThread({ conversationId, initialMessages, currentUserId }) {
  const [messages, setMessages] = useState(initialMessages);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState("");
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const bottomRef = useRef(null);
  const [supabase] = useState(() => createClient());

  useEffect(() => {
    const channel = supabase
      .channel(`messages-${conversationId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages", filter: `conversation_id=eq.${conversationId}` },
        (payload) => {
          setMessages((prev) => (prev.some((m) => m.id === payload.new.id) ? prev : [...prev, payload.new]));
        },
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "messages", filter: `conversation_id=eq.${conversationId}` },
        (payload) => {
          setMessages((prev) => prev.map((m) => (m.id === payload.new.id ? payload.new : m)));
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId, supabase]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    const text = draft.trim();
    if (!text || sending) return;
    setSending(true);
    setDraft("");

    const { error } = await supabase
      .from("messages")
      .insert({ conversation_id: conversationId, sender_id: currentUserId, text });

    if (error) console.error(error);
    setSending(false);
  };

  const startEdit = (m) => {
    setConfirmDeleteId(null);
    setEditingId(m.id);
    setEditText(m.text);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditText("");
  };

  const saveEdit = async (id) => {
    const text = editText.trim();
    if (!text) return;
    const edited_at = new Date().toISOString();
    setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, text, edited_at } : m)));
    setEditingId(null);
    setEditText("");

    const { error } = await supabase.from("messages").update({ text, edited_at }).eq("id", id);
    if (error) console.error(error);
  };

  const deleteMessage = async (id) => {
    const deleted_at = new Date().toISOString();
    setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, text: "", deleted_at } : m)));
    setConfirmDeleteId(null);

    const { error } = await supabase.from("messages").update({ text: "", deleted_at }).eq("id", id);
    if (error) console.error(error);
  };

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <div className="flex-1 space-y-2 overflow-y-auto py-2">
        {messages.length === 0 && (
          <p className="py-10 text-center text-sm text-muted">Empezá la conversación.</p>
        )}
        {messages.map((m) => {
          const mine = m.sender_id === currentUserId;
          const isEditing = editingId === m.id;

          if (m.deleted_at) {
            return (
              <div key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                <div className="max-w-[75%] rounded-2xl border border-dashed border-line px-3.5 py-2 text-sm italic text-muted">
                  Se eliminó este mensaje
                </div>
              </div>
            );
          }

          return (
            <div key={m.id} className={`flex flex-col ${mine ? "items-end" : "items-start"}`}>
              {isEditing ? (
                <div className="w-full max-w-[75%]">
                  <textarea
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    className="w-full rounded-2xl border border-brand bg-paper px-3.5 py-2 text-sm focus:outline-none"
                    rows={2}
                    autoFocus
                  />
                  <div className="mt-1 flex justify-end gap-2">
                    <button onClick={cancelEdit} className="text-[11px] font-semibold text-muted hover:text-ink">
                      Cancelar
                    </button>
                    <button
                      onClick={() => saveEdit(m.id)}
                      disabled={!editText.trim()}
                      className="text-[11px] font-semibold text-brand hover:text-brand-dark disabled:opacity-50"
                    >
                      Guardar
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div
                    className={`max-w-[75%] rounded-2xl px-3.5 py-2 text-sm ${
                      mine ? "bg-brand text-white" : "border border-line bg-paper text-ink"
                    }`}
                  >
                    {m.text}
                    {m.edited_at && (
                      <span className={`ml-1.5 text-[10px] ${mine ? "text-white/70" : "text-muted"}`}>(editado)</span>
                    )}
                  </div>
                  {mine && (
                    <div className="mt-0.5 flex gap-2 px-1">
                      {confirmDeleteId === m.id ? (
                        <>
                          <span className="text-[11px] text-muted">¿Eliminar?</span>
                          <button
                            onClick={() => deleteMessage(m.id)}
                            className="text-[11px] font-semibold text-coral hover:opacity-80"
                          >
                            Sí
                          </button>
                          <button
                            onClick={() => setConfirmDeleteId(null)}
                            className="text-[11px] font-semibold text-muted hover:text-ink"
                          >
                            No
                          </button>
                        </>
                      ) : (
                        <>
                          <button onClick={() => startEdit(m)} className="text-[11px] text-muted hover:text-ink">
                            Editar
                          </button>
                          <button
                            onClick={() => setConfirmDeleteId(m.id)}
                            className="text-[11px] text-muted hover:text-coral"
                          >
                            Eliminar
                          </button>
                        </>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={handleSend} className="flex gap-2 border-t border-line pt-3">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Escribí un mensaje..."
          className="flex-1 rounded-lg border border-line bg-paper px-3 py-2 text-sm focus:border-brand focus:outline-none"
        />
        <button
          type="submit"
          disabled={sending || !draft.trim()}
          className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-dark disabled:opacity-60"
        >
          Enviar
        </button>
      </form>
    </div>
  );
}
