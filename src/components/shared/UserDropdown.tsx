"use client";

import { useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Settings,
  LogOut,
  ChevronDown,
} from "lucide-react";
import { signOut } from "@/lib/auth-client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

interface UserDropdownProps {
  user?: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
    role?: "customer" | "vendor" | "admin" | string;
  } | null;
}

export default function UserDropdown({ user }: UserDropdownProps) {
  const router = useRouter();

  if (!user) return null;

  const role = user.role || "customer";
  const dashboardRoute = `/dashboard/${role}`;
  const profileSettingsRoute = `/dashboard/${role}/profile`;

  const handleLogout = async () => {
    try {
      await signOut({
        fetchOptions: {
          onSuccess: () => {
            toast.success("Signed out successfully");
            router.push("/");
            router.refresh();
          },
        },
      });
    } catch {
      toast.error("Failed to sign out. Please try again.");
    }
  };

  const initials = user.name
    ? user.name
        .trim()
        .split(/\s+/)
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "WP";

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger
        type="button"
        className="flex items-center gap-2.5 rounded-full border border-[#E6DCD2] bg-white/80 py-1 pl-1.5 pr-3 transition hover:border-[#C59B47] focus:outline-none"
      >
        <span className="flex items-center gap-2.5">
          <Avatar className="h-8 w-8 border border-[#C59B47]/40">
            <AvatarImage
              src={user.image || undefined}
              alt={user.name || "User"}
            />
            <AvatarFallback className="bg-[#5E1929] text-xs font-medium text-[#FAF7F2]">
              {initials}
            </AvatarFallback>
          </Avatar>
          <span className="hidden max-w-[120px] truncate text-sm font-medium text-[#1F1A1D] sm:inline-block">
            {user.name || "Member"}
          </span>
          <ChevronDown className="h-4 w-4 text-[#6B5E62]" />
        </span>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        sideOffset={8}
        className="z-50 w-56 border-[#E6DCD2] bg-[#FAF7F2] text-[#1F1A1D] shadow-lg"
      >
        <DropdownMenuGroup>
          <div className="px-2 py-1.5">
            <p className="text-sm font-semibold leading-none text-[#1F1A1D]">
              {user.name || "Member"}
            </p>
            <p className="mt-1 truncate text-xs text-[#6B5E62]">
              {user.email || ""}
            </p>
            <span className="mt-1.5 inline-block w-fit rounded-full bg-[#F2E2E4] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-[#5E1929]">
              {role}
            </span>
          </div>
        </DropdownMenuGroup>

        <DropdownMenuSeparator className="bg-[#E6DCD2]" />

        <DropdownMenuItem
          onClick={() => router.push(dashboardRoute)}
          className="cursor-pointer focus:bg-[#F2E2E4]/60"
        >
          <LayoutDashboard className="mr-2 h-4 w-4 text-[#5E1929]" />
          <span>Dashboard</span>
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={() => router.push(profileSettingsRoute)}
          className="cursor-pointer focus:bg-[#F2E2E4]/60"
        >
          <Settings className="mr-2 h-4 w-4 text-[#5E1929]" />
          <span>Profile Settings</span>
        </DropdownMenuItem>

        <DropdownMenuSeparator className="bg-[#E6DCD2]" />

        <DropdownMenuItem
          onClick={handleLogout}
          className="cursor-pointer text-red-700 focus:bg-red-50 focus:text-red-800"
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>Logout</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}