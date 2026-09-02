import { logOutAction } from "@/lib/actions/auth";
import type { User } from "@/lib/models";
import { Navbar1 } from "@/components/ui/navbar-1";

export function SiteNav({ user }: { user: User | null }) {
  return <Navbar1 user={user} logout={logOutAction} />;
}
