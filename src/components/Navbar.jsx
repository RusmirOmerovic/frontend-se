import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import { useEffect, useState } from "react";

// Navigationsleiste mit Login-Status und Profilinformationen
function Navbar() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);

  // Abonniert Auth-Änderungen und lädt ggf. das Profil
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
      if (user) loadProfile(user.id);
    });

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
        if (session?.user) {
          loadProfile(session.user.id);
        } else {
          setProfile(null);
        }
      }
    );

    return () => listener.subscription.unsubscribe();
  }, []);

  // Lädt Basisprofilinformationen eines Nutzers
  const loadProfile = async (uid) => {
    const { data } = await supabase
      .from("user_profiles")
      .select("vorname, nachname")
      .eq("id", uid)
      .single();
    if (data) setProfile(data);
  };

  // Meldet den Nutzer ab und leitet zur Login-Seite weiter
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
        {!user && (
          <Link to="/register" className="hover:text-blue-600">
            Registrieren
          </Link>
        )}

        {!user && (
          <Link to="/login" className="text-black hover:text-blue-600">
            Login
          </Link>
        )}
        {user && (
          <>
            <span className="text-gray-500 text-sm hidden sm:inline">
              👤 {profile ? `${profile.vorname} ${profile.nachname}` : user.email}
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
