// src/pages/Welcome.jsx
import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";

// Begrüßungsseite nach erfolgreicher Registrierung
const Welcome = () => {
  const [profile, setProfile] = useState(null);

  // Holt die Profilinformationen des aktuellen Nutzers
  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data, error } = await supabase
          .from("user_profiles")
          .select("vorname, nachname")
          .eq("id", user.id)
          .single();

        if (!error) {
          setProfile(data);
        }
      }
    };

    fetchData();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-6">
      <div className="bg-white p-8 rounded shadow w-full max-w-lg text-center">
        {profile ? (
          <>
            <h1 className="text-3xl font-bold mb-4">
              Willkommen, {profile.vorname} {profile.nachname}!
            </h1>
            <p className="text-lg">
              Du hast dich erfolgreich registriert. Viel Spaß mit der Plattform für Software Engineering!
            </p>
          </>
        ) : (
          <p className="text-gray-600">Lade deine Profildaten...</p>
        )}
      </div>
    </div>
  );
};

export default Welcome;
