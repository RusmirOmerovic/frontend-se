import { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";

const ProfileUpdate = () => {
  const [profile, setProfile] = useState({
    vorname: "",
    nachname: "",
    geburtsdatum: "",
    matrikelnummer: "",
  });

  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: user } = await supabase.auth.getUser();
      const { data, error } = await supabase
        .from("user_profiles")
        .select("*")
        .eq("id", user.user.id)
        .single();

      if (!error && data) setProfile(data);
      setLoading(false);
    };

    fetchProfile();
  }, []);

  const handleChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { error } = await supabase
      .from("user_profiles")
      .update(profile)
      .eq("id", (await supabase.auth.getUser()).data.user.id);

    setMessage(error ? "Fehler beim Speichern." : "Profil erfolgreich gespeichert.");
  };

  if (loading) return <p>Lade...</p>;

  return (
    <form onSubmit={handleSubmit} className="p-4 bg-white rounded shadow max-w-xl mx-auto mt-10">
      <h2 className="text-xl font-bold mb-4">Profil bearbeiten</h2>

      {["vorname", "nachname", "geburtsdatum", "matrikelnummer"].map((field) => (
        <input
          key={field}
          name={field}
          type={field === "geburtsdatum" ? "date" : "text"}
          value={profile[field] || ""}
          onChange={handleChange}
          placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
          className="w-full p-2 border mb-3 rounded"
        />
      ))}

      <button
        type="submit"
        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded"
      >
        Speichern
      </button>

      {message && <p className="mt-3 text-green-600">{message}</p>}
    </form>
  );
};

export default ProfileUpdate;
