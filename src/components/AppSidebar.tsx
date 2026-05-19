import { Link, useRouterState } from "@tanstack/react-router";
import { Scale, FileText, BarChart3, Shield, Plus } from "lucide-react";

interface NavItem {
  to: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  show: boolean;
}

export function AppSidebar() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const onCase = pathname.startsWith("/case");

  const items: NavItem[] = [
    { to: "/", label: "Compliance Queue", icon: Scale, show: true },
    { to: "/new-case", label: "New Case", icon: Plus, show: true },
    { to: pathname, label: "Case Report", icon: FileText, show: onCase },
    { to: "/admin", label: "Admin Panel", icon: BarChart3, show: true },
  ].filter((i) => i.show);

  const isActive = (to: string) => {
    if (to === "/") return pathname === "/";
    return pathname.startsWith(to);
  };

  return (
    <aside className="w-64 shrink-0 bg-sidebar border-r border-sidebar-border flex flex-col h-screen sticky top-0">
      <div className="px-5 pt-6 pb-5 border-b border-sidebar-border">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-primary/15 border border-primary/30 flex items-center justify-center">
            <Shield className="w-5 h-5 text-primary" strokeWidth={2.4} />
          </div>
          <span className="text-2xl font-bold tracking-tight text-primary">ARIA</span>
        </div>
        <p className="mt-2 text-xs text-muted-foreground">KYC Compliance Platform</p>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {items.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.to) && !(item.label === "Case Report" && !onCase);
          return (
            <Link
              key={item.label}
              to={item.to}
              className={[
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium",
                active
                  ? "bg-primary/10 text-primary border border-primary/40"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent border border-transparent",
              ].join(" ")}
            >
              <Icon className="w-4 h-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="px-4 py-4 border-t border-sidebar-border">
        <div className="flex items-center gap-2">
          <span className="live-dot" />
          <span className="text-xs font-semibold text-foreground">Vertex AI — Live</span>
        </div>
        <p className="mt-1 text-[11px] text-muted-foreground pl-4">
          Gemini 2.5 Pro · us-west1
        </p>
      </div>
    </aside>
  );
}
