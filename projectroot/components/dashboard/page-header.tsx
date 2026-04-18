import { Badge } from "@/components/ui/badge";
import { LogoutButton } from "@/components/auth/logout-button";

interface PageHeaderProps {
  eyebrow: string;
  title: string;
  description: string;
  demoMode?: boolean;
}

export function PageHeader({
  eyebrow,
  title,
  description,
  demoMode
}: PageHeaderProps) {
  return (
    <div className="flex flex-col gap-4 rounded-[2rem] border border-white/60 bg-white/70 p-6 backdrop-blur lg:flex-row lg:items-end lg:justify-between">
      <div className="max-w-2xl">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-teal-800">
          {eyebrow}
        </p>
        <h1 className="mt-3 font-serif text-4xl text-slate-900">{title}</h1>
        <p className="mt-3 text-sm leading-7 text-slate-600">{description}</p>
      </div>
      <div className="flex items-center gap-4">
        {demoMode ? (
          <Badge className="h-fit self-start" variant="warning">
            Showing demo data until Supabase is connected
          </Badge>
        ) : null}
        <LogoutButton />
      </div>
    </div>
  );
}
