import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const Landing = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-900 to-purple-700">
      {/* Header */}
      <header className="container mx-auto px-4 py-6 flex justify-between items-center">
        <h1 className="text-3xl font-bold text-white">UniqueWager</h1>
        <Link to="/auth">
          <Button variant="outline" className="bg-white hover:bg-gray-100">
            Login / Register
          </Button>
        </Link>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <h2 className="text-5xl font-bold text-white mb-6">
          Unique Word Betting Platform
        </h2>
        <p className="text-xl text-gray-200 mb-12 max-w-2xl mx-auto">
          Place bets on unique words and win big! Join our community of word enthusiasts and experience a new way of betting.
        </p>
        <Link to="/auth">
          <Button size="lg" className="bg-white text-purple-900 hover:bg-gray-100">
            Get Started Now
          </Button>
        </Link>
      </section>

      {/* Features */}
      <section className="container mx-auto px-4 py-20 grid md:grid-cols-3 gap-8">
        <div className="bg-white/10 p-6 rounded-lg text-white">
          <h3 className="text-xl font-bold mb-4">Secure Platform</h3>
          <p>Your security is our top priority. Enjoy safe betting with our advanced security measures.</p>
        </div>
        <div className="bg-white/10 p-6 rounded-lg text-white">
          <h3 className="text-xl font-bold mb-4">Fair Gaming</h3>
          <p>Experience transparent and fair betting with our provably fair system.</p>
        </div>
        <div className="bg-white/10 p-6 rounded-lg text-white">
          <h3 className="text-xl font-bold mb-4">Instant Payouts</h3>
          <p>Quick and hassle-free withdrawals. Get your winnings instantly.</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-8 text-center text-white/60">
        <p>© 2024 UniqueWager. All rights reserved.</p>
        <p className="mt-2 text-sm">Please bet responsibly.</p>
      </footer>
    </div>
  );
};

export default Landing;