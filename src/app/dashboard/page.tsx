import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

export default async function DashboardPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/login");
  }

  return (
    <main className="p-10">
      <h1 className="text-3xl font-bold">
        Dashboard
      </h1>

      <div className="mt-6 rounded-lg border p-6">
        <p>
          Benvenuto{" "}
          <strong>{session.user.name}</strong>
        </p>

        <p className="mt-2 text-gray-500">
          {session.user.email}
        </p>
      </div>
    </main>
  );
}