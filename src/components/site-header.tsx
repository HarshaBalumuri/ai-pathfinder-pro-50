import { Link } from "@tanstack/react-router";
import { Compass, Moon, Sun } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useTheme } from "@/context/theme";

export function SiteHeader() {
  const { theme, toggle } = useTheme();

  return (
    <header className="sticky top-0 z-50 w-full">
      <div className="glass mx-auto mt-3 flex max-w-6xl items-center justify-between gap-3 rounded-2xl px-4 py-3 sm:px-6">
        <Link to="/" className="flex items-center gap-2">
          <span className="hero-gradient flex size-9 items-center justify-center rounded-xl text-primary-foreground shadow-lg">
            <Compass className="size-5" />
          </span>
          <span className="font-display text-base font-bold tracking-tight sm:text-lg">
            PathwayAI
          </span>
        </Link>

        <nav className="hidden items-center gap-6 text-sm font-medium text-muted-foreground md:flex">
          <a href="/#features" className="transition-colors hover:text-foreground">
            Features
          </a>
          <a href="/#how-it-works" className="transition-colors hover:text-foreground">
            How it works
          </a>
          <Link to="/admin" className="transition-colors hover:text-foreground">
            Admin
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            aria-label="Toggle dark mode"
            onClick={toggle}
            className="rounded-xl"
          >
            {theme === "dark" ? <Sun className="size-4" /> : <Moon className="size-4" />}
          </Button>
          <Button asChild className="rounded-xl">
            <Link to="/assessment">Start Assessment</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
