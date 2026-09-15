
"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function SupabaseTest() {
  const [message, setMessage] = useState("Nessun messaggio");

  useEffect(() => {
    console.log(
      "Supabase URL:",
      process.env.NEXT_PUBLIC_SUPABASE_URL
    );

    console.log(
      "Supabase key:",
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.slice(0, 15)
    );

    const channel = supabase
      .channel("test-channel")
      .on("broadcast", { event: "test-message" }, (payload) => {
        console.log("Ricevuto:", payload);
        setMessage(payload.payload.message);
      })
      .subscribe((status) => {
        console.log("Supabase channel status:", status);
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const sendMessage = async () => {
    const channel = supabase.channel("test-channel");

    const status = await channel.subscribe();

    console.log("Send channel status:", status);

    const result = await channel.send({
      type: "broadcast",
      event: "test-message",
      payload: {
        message: "Ciao da Supabase realtime!",
      },
    });

    console.log("Send result:", result);
  };

  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold">
        Supabase Realtime Test
      </h1>

      <p className="mt-4">
        {message}
      </p>

      <button
        onClick={sendMessage}
        className="mt-4 rounded bg-blue-500 px-4 py-2 text-white"
      >
        Invia messaggio
      </button>
    </main>
  );
}

