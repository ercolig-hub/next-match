
"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CldUploadWidget } from "next-cloudinary";

export default function ProfilePage() {
  const router = useRouter();

  const [age, setAge] = useState("");
  const [city, setCity] = useState("");
  const [bio, setBio] = useState("");
  const [image, setImage] = useState("");

  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function loadProfile() {
      const response = await fetch("/api/profile");

      if (!response.ok) {
        setLoading(false);
        return;
      }

      const profile = await response.json();

      if (profile) {
        setAge(profile.age?.toString() ?? "");
        setCity(profile.city ?? "");
        setBio(profile.bio ?? "");
        setImage(profile.user?.image ?? "");
      }

      setLoading(false);
    }

    loadProfile();
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    setMessage("");

    const response = await fetch("/api/profile", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        age: Number(age),
        city,
        bio,
        image,
      }),
    });

    if (!response.ok) {
      setMessage("Errore durante il salvataggio");
      return;
    }

    router.push("/dashboard/discover");
    router.refresh();
  }

  if (loading) {
    return (
      <main className="p-10">
        <p>Caricamento profilo...</p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-xl p-10">
      <h1 className="text-3xl font-bold">
        Il mio profilo
      </h1>

      <form
        onSubmit={handleSubmit}
        className="mt-8 space-y-5"
      >
        {/* FOTO PROFILO */}
        <div>
          <label className="mb-3 block font-medium">
            Foto profilo
          </label>

          {image && (
            <img
              src={image}
              alt="Foto profilo"
              className="mb-4 h-32 w-32 rounded-full object-cover"
            />
          )}

          <CldUploadWidget
            uploadPreset="next-match"
            onSuccess={(result) => {
              if (
                typeof result.info === "object" &&
                result.info !== null &&
                "secure_url" in result.info
              ) {
                setImage(result.info.secure_url as string);
              }
            }}
          >
            {({ open }) => {
              return (
                <button
                  type="button"
                  onClick={() => open()}
                  className="rounded border px-4 py-2"
                >
                  📷 {image ? "Cambia foto" : "Carica foto"}
                </button>
              );
            }}
          </CldUploadWidget>
        </div>

        {/* ETÀ */}
        <div>
          <label className="mb-1 block">
            Età
          </label>

          <input
            type="number"
            value={age}
            onChange={(e) => setAge(e.target.value)}
            className="w-full rounded border p-2"
            required
          />
        </div>

        {/* CITTÀ */}
        <div>
          <label className="mb-1 block">
            Città
          </label>

          <input
            type="text"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="w-full rounded border p-2"
            required
          />
        </div>

        {/* BIO */}
        <div>
          <label className="mb-1 block">
            Bio
          </label>

          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            className="w-full rounded border p-2"
            rows={5}
          />
        </div>

        <button
          type="submit"
          className="w-full rounded bg-black px-5 py-2 text-white"
        >
          Salva profilo
        </button>

        {message && (
          <p className="text-red-600">
            {message}
          </p>
        )}
      </form>
    </main>
  );
}

