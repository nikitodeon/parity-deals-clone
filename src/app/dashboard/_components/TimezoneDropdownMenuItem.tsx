import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import Link from "next/link";

export function TimezoneDropdownMenuItem() {
  const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  return (
    <DropdownMenuItem asChild>
      <Link href={`/dashboard/analytics?timezone=${userTimezone}`}>
        {userTimezone}
      </Link>
    </DropdownMenuItem>
  );
}
