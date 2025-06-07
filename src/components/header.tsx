
import Link from 'next/link';
import { ThemeToggle } from "./theme-toggle";
import { ListChecks, CalendarDays, SettingsIcon } from "lucide-react";

export function Header() {
  return (
    <header className="py-6 mb-8 border-b">
      <div className="container mx-auto flex justify-between items-center max-w-3xl px-4">
        <Link href="/" className="flex items-center gap-2">
          <ListChecks className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold font-headline">DailyFlow</h1>
        </Link>
        <div className="flex items-center gap-2">
          <Link href="/calendar" passHref>
            <Button variant="ghost" size="icon" aria-label="Open Calendar">
              <CalendarDays className="h-5 w-5" />
            </Button>
          </Link>
          <Link href="/settings" passHref>
            <Button variant="ghost" size="icon" aria-label="Open Settings">
              <SettingsIcon className="h-5 w-5" />
            </Button>
          </Link>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}

// Added Button import for ghost variant on links
import { Button } from "@/components/ui/button";
