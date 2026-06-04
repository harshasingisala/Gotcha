import { useState } from "react";
import { api } from "../lib/api";
import { getDemoConversations, getStoredDemoAuth, saveDemoConversations } from "../lib/demoData";

export function useMessages() {
  const [conversations, setConversations] = useState([]);
  const [thread, setThread] = useState(null);
  const [loading, setLoading] = useState(false);
  async function loadConversations() {
    setLoading(true);
    try {
      const res = await api.get("/messages/conversations");
      if (!Array.isArray(res.data?.conversations)) throw new Error("Invalid conversations response.");
      setConversations(res.data.conversations);
    } catch (err) {
      if (getStoredDemoAuth()) setConversations(getDemoConversations());
      else throw err;
    } finally {
      setLoading(false);
    }
  }
  async function openConversation(conversation) {
    try {
      const res = await api.get(`/messages/${conversation.conversation_id}`);
      if (!Array.isArray(res.data?.messages)) throw new Error("Invalid thread response.");
      setThread({ ...res.data, me: conversation.last_message.sender_id === conversation.other_user?.id ? conversation.last_message.receiver_id : conversation.last_message.sender_id });
    } catch (err) {
      if (!getStoredDemoAuth()) throw err;
      setThread({ item: conversation.item, messages: conversation.messages || [conversation.last_message], me: getStoredDemoAuth().user.id });
    }
  }
  async function send(receiver_id, item_id, content) {
    try {
      const res = await api.post("/messages", { receiver_id, item_id, content });
      if (!res.data?.message) throw new Error("Invalid message response.");
      setThread((current) => current ? { ...current, messages: [...current.messages, res.data.message] } : current);
    } catch (err) {
      if (!getStoredDemoAuth()) throw err;
      const me = getStoredDemoAuth().user.id;
      const message = { id: `msg-${Date.now()}`, conversation_id: thread?.messages?.[0]?.conversation_id || "conv-demo", sender_id: me, receiver_id, item_id, content, created_at: new Date().toISOString() };
      setThread((current) => current ? { ...current, messages: [...current.messages, message] } : current);
      const conversations = getDemoConversations();
      const active = conversations.find((conversation) => conversation.conversation_id === message.conversation_id);
      const nextConversation = active ? { ...active, last_message: message, messages: [...(active.messages || []), message], unread_count: 0 } : {
        conversation_id: message.conversation_id,
        other_user: { id: receiver_id, full_name: "Campus Admin" },
        item: thread?.item || null,
        unread_count: 0,
        last_message: message,
        messages: [message]
      };
      const next = active
        ? conversations.map((conversation) => conversation.conversation_id === message.conversation_id ? nextConversation : conversation)
        : [nextConversation, ...conversations];
      saveDemoConversations(next);
      setConversations(next);
      return;
    }
  }
  return { conversations, thread, loading, loadConversations, openConversation, send };
}
