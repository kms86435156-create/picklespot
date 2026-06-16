import { redirect } from "next/navigation";
import { getTournaments } from "@/lib/db";

export default async function InviteRedirectPage({ searchParams }: { searchParams: { code?: string } }) {
  const code = searchParams.code;
  if (!code) {
    redirect("/tournaments");
  }

  // Find a tournament with this invite code. Since getTournaments currently filters by visibility,
  // we might need to fetch all to find the invite code, or we can just fetch all manually if we pass no visibility.
  const allTournaments = await getTournaments({}); // Empty filter
  const found = allTournaments.find(t => t.inviteCode === code);

  if (found) {
    redirect(`/tournaments/${found.id}`);
  } else {
    // If not found, redirect with an error message in URL
    redirect("/tournaments?error=invalid_code");
  }
}
