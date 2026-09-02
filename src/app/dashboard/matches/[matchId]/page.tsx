"use client";

import { useEffect, useRef, useState } from "react";
import { authClient } from "@/lib/auth-client";

type Message = {
  id: string;
  content: string;
  createdAt: string;
  user: {
    id: string;
    name: string | null;
    image: string | null;
  };
};

type OtherUser = {
  id: string;
  name: string | null;
  image: string | null;
};

export default function MatchChatPage({
  params,
}: {
  params: Promise<{ matchId: string }>;
}) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [content, setContent] = useState("");
  const [matchId, setMatchId] = useState("");
  const [otherUser, setOtherUser] = useState<OtherUser | null>(null);
  const [loading, setLoading] = useState(true);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: session } = authClient.useSession();

  useEffect(() => {
    async function loadChat() {
      try {
        const { matchId } = await params;

        setMatchId(matchId);

        // Recupera l'altro utente del Match
        const matchResponse = await fetch(
          `/api/matches/${matchId}`
        );

        if (matchResponse.ok) {
          const userData = await matchResponse.json();
          setOtherUser(userData);
        }

        // Recupera i messaggi
        const messagesResponse = await fetch(
          `/api/matches/${matchId}/messages`
        );

        const messagesData = await messagesResponse.json();

        if (!messagesResponse.ok) {
          console.error("Errore API:", messagesData);
          setMessages([]);
          return;
        }

        if (Array.isArray(messagesData)) {
          setMessages(messagesData);
        } else {
          console.error(
            "La risposta non è un array:",
            messagesData
          );
          setMessages([]);
        }
      } catch (error) {
        console.error("Errore nel caricamento:", error);
        setMessages([]);
      } finally {
        setLoading(false);
      }
    }

    loadChat();
  }, [params]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages]);

  async function sendMessage() {
    if (!content.trim() || !matchId) {
      return;
    }

    try {
      const response = await fetch(
        `/api/matches/${matchId}/messages`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            content,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        console.error("Errore nell'invio:", data);
        return;
      }

      setMessages((current) => [...current, data]);
      setContent("");
    } catch (error) {
      console.error("Errore:", error);
    }
  }

  return (
    <main className="mx-auto flex h-[calc(100vh-80px)] max-w-2xl flex-col">
      {/* HEADER */}
      <div className="flex items-center gap-3 border-b bg-white p-4 shadow-sm">
        {otherUser?.image ? (
          <img
            src={otherUser.image}
            alt={otherUser.name ?? "Profilo"}
            className="h-11 w-11 rounded-full object-cover"
          />
        ) : (
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gray-200 text-xl">
            👤
          </div>
        )}

        <div>
          <h1 className="font-bold">
            {otherUser?.name ?? "Utente"}
          </h1>

          <p className="text-xs text-gray-500">
            Match
          </p>
        </div>
      </div>

      {/* MESSAGGI */}
      <div className="flex-1 overflow-y-auto bg-gray-100 p-4">
        {loading ? (
          <p className="text-center text-gray-500">
            Caricamento...
          </p>
        ) : messages.length === 0 ? (
          <p className="mt-10 text-center text-gray-500">
            Nessun messaggio.
            <br />
            Inizia la conversazione!
          </p>
        ) : (
          <div className="space-y-2">
            {messages.map((message) => {
              const isMine =
                message.user?.id === session?.user?.id;

              return (
                <div
                  key={message.id}
                  className={`flex ${
                    isMine
                      ? "justify-end"
                      : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[75%] rounded-2xl px-4 py-2 shadow-sm ${
                      isMine
                        ? "rounded-br-md bg-sky-200 text-gray-900"
                        : "rounded-bl-md bg-white text-gray-900"
                    }`}
                  >
                    {!isMine && (
                      <p className="mb-1 text-xs font-bold text-sky-600">
                        {message.user?.name ?? "Utente"}
                      </p>
                    )}

                    <p className="break-words">
                      {message.content}
                    </p>

                    <p
                      className={`mt-1 text-right text-[10px] ${
                        isMine
                          ? "text-sky-700"
                          : "text-gray-400"
                      }`}
                    >
                      {new Date(
                        message.createdAt
                      ).toLocaleTimeString("it-IT", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
              );
            })}

            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* INPUT */}
      <div className="border-t bg-white p-3">
        <div className="flex gap-2">
          <input
            type="text"
            value={content}
            onChange={(event) =>
              setContent(event.target.value)
            }
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                sendMessage();
              }
            }}
            placeholder="Scrivi un messaggio..."
            className="flex-1 rounded-full border px-4 py-3 outline-none focus:border-sky-500"
          />

          <button
            onClick={sendMessage}
            disabled={!content.trim()}
            className="rounded-full bg-sky-500 px-5 py-3 text-white disabled:opacity-50"
          >
            ➤
          </button>
        </div>
      </div>
    </main>
  );
}