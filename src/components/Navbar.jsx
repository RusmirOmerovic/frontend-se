import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import { useEffect, useState } from "react";

function Navbar() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
    });

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
      }
    );

    return () => listener.subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  return (
    <nav className="bg-white shadow-md px-6 py-4 flex justify-between items-center">
      <h1 className="text-xl font-bold text-blue-600">📘 MyApp</h1>
      <div className="space-x-4">
        <Link to="/profil" className="text-blue-600 underline">
        Profil bearbeiten
        </Link>

        <Link to="/" className="hover:text-blue-600">
          Start
        </Link>
        
        <Link to="/dashboard" className="hover:text-purple-600">
          Dashboard
        </Link>
        <Link to="/register" className="hover:text-blue-600">
          Registrieren
        </Link>

        {!user && (
          <Link to="/login" className="text-black hover:text-blue-600">
            Login
          </Link>
        )}
        {user && (
          <>
            <span className="text-gray-500 text-sm hidden sm:inline">
              👤 {user.email}
            </span>
            <button
              onClick={handleLogout}
              className="text-red-600 hover:underline"
            >
              Logout
            </button>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
