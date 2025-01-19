import { useAuth } from "@/components/AuthProvider";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

const Index = () => {
  const { user } = useAuth();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Welcome to UniqueWager</h1>
        <p className="text-xl text-gray-600 mb-4">
          Logged in as: {user?.email}
        </p>
        <Button onClick={handleSignOut} variant="outline">
          Sign Out
        </Button>
      </div>
    </div>
  );
};

export default Index;