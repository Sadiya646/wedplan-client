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
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

interface UserDropdownProps {
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
    role?: "customer" | "vendor" | "admin" | string;
  };
}

export default function UserDropdown({ user }: UserDropdownProps) {
  const router = useRouter();

  const getDashboardRoute = () => {
    if (user.role === "admin") return "/dashboard/admin";
    if (user.role === "vendor") return "/dashboard/vendor";
    return "/dashboard/customer";
  };

  const getProfileSettingsRoute = () => {
    if (user.role === "vendor") return "/dashboard/vendor/profile";
    if (user.role === "admin") return "/dashboard/admin";
    return "/dashboard/customer/profile";
  };

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
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "WP";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center gap-2.5 rounded-full border border-[#E6DCD2] bg-white/80 py-1 pl-1.5 pr-3 transition hover:border-[#C59B47] focus:outline-none">
        <Avatar className="h-8 w-8 border border-[#C59B47]/40">
          <AvatarImage src={user.image || ""} alt={user.name || "User"} />
          <AvatarFallback className="bg-[#5E1929] text-xs font-medium text-[#FAF7F2]">
            {initials}
          </AvatarFallback>
        </Avatar>
        <div className="hidden text-left sm:block">
          <p className="max-w-[120px] truncate text-sm font-medium text-[#1F1A1D]">
            {user.name || "Member"}
          </p>
        </div>
        <ChevronDown className="h-4 w-4 text-[#6B5E62]" />
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="w-56 border-[#E6DCD2] bg-[#FAF7F2] text-[#1F1A1D] shadow-lg"
      >
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-semibold leading-none text-[#1F1A1D]">
              {user.name}
            </p>
            <p className="truncate text-xs text-[#6B5E62]">{user.email}</p>
            {user.role && (
              <span className="mt-1 inline-block w-fit rounded-full bg-[#F2E2E4] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-[#5E1929]">
                {user.role}
              </span>
            )}
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator className="bg-[#E6DCD2]" />

        <DropdownMenuItem
          onClick={() => router.push(getDashboardRoute())}
          className="cursor-pointer focus:bg-[#F2E2E4]/60"
        >
          <LayoutDashboard className="mr-2 h-4 w-4 text-[#5E1929]" />
          <span>Dashboard</span>
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={() => router.push(getProfileSettingsRoute())}
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