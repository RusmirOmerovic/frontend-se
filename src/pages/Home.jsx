// pages/Home.jsx
import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";

const Home = () => {
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (user) {
        const { data } = await supabase
          .from("user_profiles")
          .select("vorname, nachname")
          .eq("id", user.id)
          .single();
        if (data) setProfile(data);
      }
    });
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">
        Willkommen bei MyApp!
      </h1>
      {profile && (
        <p className="mt-1 text-gray-600">
          Hallo, {profile.vorname} {profile.nachname}!
        </p>
      )}
      <p className="mt-2">
        Dies ist die Startseite der Software-Engineering Plattform für Tutoren und Studenten. Du kannst dich einloggen oder registrieren.
      </p>
      <img src="/myAppPic.jpg" alt="Logo" className="mt-4 rounded shadow-lg h-auto w-auto" />

    </div>
  );
};
export default Home;
