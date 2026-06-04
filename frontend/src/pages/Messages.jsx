import React, { useCallback, useEffect } from "react";
import ChatWindow from "../components/ChatWindow";
import ConversationList from "../components/ConversationList";
import StudentPageHeader from "../components/StudentPageHeader";
import { useMessages } from "../hooks/useMessages";
import { useSocket } from "../hooks/useSocket";

export default function Messages() {
  const { conversations, thread, loadConversations, openConversation, send } = useMessages();
  const onMessage = useCallback(() => loadConversations(), [loadConversations]);
  useSocket(onMessage);
  useEffect(() => { loadConversations(); }, []);
  const active = conversations.find((conversation) => conversation.conversation_id === thread?.messages?.[0]?.conversation_id);

  return (
    <section className="space-y-5">
      <StudentPageHeader icon="chat" title="Messages" description="Coordinate pickup safely with finders, owners, and campus staff without exposing personal contact details." />
      <div className="overflow-hidden rounded-xl border border-surface-strong bg-white shadow-lift md:flex md:min-h-[70vh]">
        <ConversationList conversations={conversations} activeId={active?.conversation_id} onSelect={openConversation} />
        <ChatWindow thread={thread} onSend={(content) => active && send(active.other_user.id, active.item?.id, content)} />
      </div>
    </section>
  );
}
