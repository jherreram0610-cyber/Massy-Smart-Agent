import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { Sidebar } from "@/components/panel/Sidebar";
import { Topbar } from "@/components/panel/Topbar";

export default async function PanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: "var(--bg)" }}>
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Topbar
          userName={session.user.name ?? "Usuario"}
          userRole={(session.user as { role: string }).role ?? "advisor"}
        />
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
