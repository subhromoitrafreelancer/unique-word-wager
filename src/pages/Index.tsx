import { useAuth } from "@/components/AuthProvider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

const Index = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [answer, setAnswer] = useState("");
  const queryClient = useQueryClient();

  // Fetch active game
  const { data: activeGame, isLoading: gameLoading } = useQuery({
    queryKey: ["activeGame"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("games")
        .select("*")
        .eq("status", "active")
        .maybeSingle();

      if (error) throw error;
      return data;
    },
  });

  // Fetch user's entries for the active game
  const { data: userEntries, isLoading: entriesLoading } = useQuery({
    queryKey: ["userEntries", activeGame?.id],
    queryFn: async () => {
      if (!activeGame?.id) return null;
      const { data, error } = await supabase
        .from("entries")
        .select("*")
        .eq("game_id", activeGame.id)
        .eq("user_id", user?.id);

      if (error) throw error;
      return data;
    },
    enabled: !!activeGame?.id && !!user?.id,
  });

  // Submit answer mutation
  const submitAnswer = useMutation({
    mutationFn: async () => {
      if (!activeGame?.id || !user?.id || !answer.trim()) {
        throw new Error("Missing required fields");
      }

      const { error } = await supabase.from("entries").insert({
        game_id: activeGame.id,
        user_id: user.id,
        answer: answer.trim(),
      });

      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "Answer submitted successfully!",
        description: "Your answer has been recorded.",
      });
      setAnswer("");
      queryClient.invalidateQueries({ queryKey: ["userEntries"] });
    },
    onError: (error) => {
      toast({
        title: "Error submitting answer",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  if (gameLoading || entriesLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-lg">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8 bg-background">
      <div className="max-w-2xl mx-auto space-y-8">
        <div className="flex justify-between items-center">
          <h1 className="text-4xl font-bold">UniqueWager</h1>
          <div className="space-x-4">
            <span className="text-muted-foreground">
              {user?.email}
            </span>
            <Button onClick={handleSignOut} variant="outline">
              Sign Out
            </Button>
          </div>
        </div>

        {activeGame ? (
          <div className="space-y-6">
            <div className="rounded-lg border p-6 bg-card">
              <h2 className="text-2xl font-semibold mb-4">Current Game</h2>
              <p className="text-lg mb-4">{activeGame.question}</p>
              <p className="text-muted-foreground mb-2">
                Prize Pool: ${activeGame.prize_pool}
              </p>
            </div>

            <div className="rounded-lg border p-6 bg-card">
              <h3 className="text-xl font-semibold mb-4">Submit Your Answer</h3>
              <div className="flex gap-4">
                <Input
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  placeholder="Enter your unique answer..."
                  className="flex-1"
                />
                <Button
                  onClick={() => submitAnswer.mutate()}
                  disabled={!answer.trim() || submitAnswer.isPending}
                >
                  Submit
                </Button>
              </div>
            </div>

            {userEntries && userEntries.length > 0 && (
              <div className="rounded-lg border p-6 bg-card">
                <h3 className="text-xl font-semibold mb-4">Your Entries</h3>
                <div className="space-y-2">
                  {userEntries.map((entry) => (
                    <div
                      key={entry.id}
                      className="p-4 rounded-md bg-muted flex justify-between items-center"
                    >
                      <span>{entry.answer}</span>
                      <span className="text-sm">
                        {entry.is_unique === true && "✨ Unique"}
                        {entry.is_unique === false && "Not Unique"}
                        {entry.is_unique === null && "Pending"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <Alert>
            <AlertTitle>No Active Game</AlertTitle>
            <AlertDescription>
              There is currently no active game. Please check back later for the next game.
            </AlertDescription>
          </Alert>
        )}
      </div>
    </div>
  );
};

export default Index;