"use client";

import { useEffect, useState } from "react";
import { Moon, Sun, Gauge } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";

const themes = [
  { value: "light", label: "Light", Icon: Sun },
  { value: "dark", label: "Dark", Icon: Moon },
  { value: "sti", label: "STI", Icon: Gauge },
] as const;

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const active = themes.find((t) => t.value === theme) ?? themes[0];
  const ActiveIcon = active!.Icon;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild className="my-auto">
        <Button variant="ghost" size="icon" aria-label="Toggle theme">
          {mounted && <ActiveIcon className="my-auto h-4 w-4" />}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {themes.map(({ value, label, Icon }) => (
          <DropdownMenuItem
            key={value}
            onClick={() => setTheme(value)}
            className={theme === value ? "bg-accent" : ""}
          >
            <Icon className="h-4 w-4" />
            {label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
