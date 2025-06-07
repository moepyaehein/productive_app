import { ThemeToggle } from "./theme-toggle";
import { ListChecks } from "lucide-react";

export function Header() {
  return (
    <header className="py-6 mb-8 border-b">
      <div className="container mx-auto flex justify-between items-center max-w-3xl px-4">
        <div className="flex items-center gap-2">
          <ListChecks className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold font-headline">DailyFlow</h1>
        </div>
        <ThemeToggle />
      </div>
    </header>
  );
}
