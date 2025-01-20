import { useAuth } from "@/components/AuthProvider";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export const GameHistory = () => {
  const { user } = useAuth();

  const { data: gameHistory, isLoading } = useQuery({
    queryKey: ["gameHistory", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("entries")
        .select(`
          *,
          games:game_id (
            question,
            prize_pool,
            status,
            common_answers
          )
        `)
        .eq("user_id", user?.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  if (isLoading) {
    return (
      <div className="mt-8 text-center">
        <p>Loading game history...</p>
      </div>
    );
  }

  if (!gameHistory || gameHistory.length === 0) {
    return (
      <Alert className="mt-8">
        <AlertTitle>No Game History</AlertTitle>
        <AlertDescription>
          You haven't participated in any games yet. Join an active game to start playing!
        </AlertDescription>
      </Alert>
    );
  }

  const calculateWinnings = (entry: any) => {
    if (entry.games.status !== "completed") return "Pending";
    if (!entry.is_unique) return "$0";
    const totalUniqueAnswers = entry.games.common_answers.length;
    if (totalUniqueAnswers === 0) return "$0";
    const prizePerWinner = entry.games.prize_pool / totalUniqueAnswers;
    return `$${prizePerWinner.toFixed(2)}`;
  };

  return (
    <div className="mt-8 space-y-4">
      <h2 className="text-2xl font-semibold">Your Game History</h2>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Question</TableHead>
            <TableHead>Your Answer</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Uniqueness</TableHead>
            <TableHead>Winnings</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {gameHistory.map((entry) => (
            <TableRow key={entry.id}>
              <TableCell className="font-medium">{entry.games.question}</TableCell>
              <TableCell>{entry.answer}</TableCell>
              <TableCell>{entry.games.status}</TableCell>
              <TableCell>
                {entry.is_unique === null
                  ? "Pending"
                  : entry.is_unique
                  ? "✨ Unique"
                  : "Not Unique"}
              </TableCell>
              <TableCell>{calculateWinnings(entry)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};