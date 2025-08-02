import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
// Formular zur Bearbeitung des Nutzerprofils
const ProfileEditor = ({ user }) => {
  const [form, setForm] = useState({
    vorname: "",
    nachname: "",
    geburtsdatum: "",
    matrikelnummer: "",
    passwort: "",
    passwortBestätigen: "",
  });
// Initialisiere das Formular mit den aktuellen Nutzerdaten
  useEffect(() => {
    const fetchProfile = async () => {
      const { data } = await supabase
        .from("user_profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (data) setForm(data);
    };

    fetchProfile();
  }, [user]);
// Handle Änderungen im Formular
  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

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
      alert("Fehler beim Speichern");
    } else {
      alert("Profil aktualisiert");
    }
// Passwortänderung
    if (form.passwort && form.passwort === form.passwortBestätigen) {
      await updatePassword(form.passwort);
    } else if (form.passwort || form.passwortBestätigen) {
      alert("Passwörter stimmen nicht überein");
    }
  };
// Funktion zum Aktualisieren des Passworts 
    const updatePassword = async (newPassword) => {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

    if (error) {
    console.error("Fehler beim Ändern des Passworts:", error.message);
    } else {
        alert("Passwort erfolgreich geändert.");
    }
  };

// Formular zur Bearbeitung des Profils


  return (
    <form onSubmit={handleSubmit} className="bg-white p-4 rounded shadow mt-4">
      <h2 className="text-lg font-semibold mb-2">🛠️ Profil bearbeiten</h2>
      <div className="space-y-2">
        {["vorname", "nachname", "geburtsdatum", "matrikelnummer", "passwort"].map(
          (field) => (
            <input
              key={field}
              name={field}
              value={form[field]}
              onChange={handleChange}
              type={field === "geburtsdatum" ? "date" : "text"}
              placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
              className="w-full p-2 border rounded"
            />
          )
        )}
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
