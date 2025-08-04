import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";

// Formular-Komponente zum Bearbeiten der Profildaten eines Nutzers
const ProfileEditor = ({ user }) => {
  const [form, setForm] = useState({
    vorname: "",
    nachname: "",
    geburtsdatum: "",
    matrikelnummer: "",
  });

  // Lädt vorhandene Profilwerte und füllt das Formular
  useEffect(() => {
    const fetchProfile = async () => {
      const { data, error } = await supabase
        .from("user_profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (error) {
        console.error("Fehler beim Laden des Profils:", error.message);
      } else if (data) {
        setForm(data);
      }
    };

    fetchProfile();
  }, [user]);

  // Aktualisiert den Formularzustand bei Eingaben
  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  // Speichert Änderungen in der user_profiles-Tabelle
  const handleSubmit = async (e) => {
    e.preventDefault();

    const { error } = await supabase
      .from("user_profiles")
      .update({
        vorname: form.vorname,
        nachname: form.nachname,
        geburtsdatum: form.geburtsdatum,
        matrikelnummer: form.matrikelnummer,
      })
      .eq("id", user.id);

    if (error) {
      alert("❌ Fehler beim Speichern");
    } else {
      alert("✅ Profil erfolgreich aktualisiert");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-4 rounded shadow mt-4">
      <h2 className="text-lg font-semibold mb-2">🛠️ Profil bearbeiten</h2>
      <div className="space-y-2">
        <input
          name="vorname"
          value={form.vorname}
          onChange={handleChange}
          type="text"
          placeholder="Vorname"
          className="w-full p-2 border rounded"
        />
        <input
          name="nachname"
          value={form.nachname}
          onChange={handleChange}
          type="text"
          placeholder="Nachname"
          className="w-full p-2 border rounded"
        />
        <input
          name="geburtsdatum"
          value={form.geburtsdatum}
          onChange={handleChange}
          type="date"
          placeholder="Geburtsdatum"
          className="w-full p-2 border rounded"
        />
        <input
          name="matrikelnummer"
          value={form.matrikelnummer}
          onChange={handleChange}
          type="text"
          placeholder="Matrikelnummer"
          className="w-full p-2 border rounded"
        />

        <button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded w-full"
        >
          Speichern
        </button>
      </div>
    </form>
  );
};

export default ProfileEditor;
