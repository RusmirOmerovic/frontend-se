import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import { updatePassword } from "../utils/updatePassword";

// Formular-Komponente zum Bearbeiten der Profildaten eines Nutzers
const ProfileEditor = ({ user }) => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    vorname: "",
    nachname: "",
    geburtsdatum: "",
    matrikelnummer: "",
    passwort: "",
    passwortBestätigen: "",
  });

  // Lädt vorhandene Profilwerte und füllt das Formular
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

  // Aktualisiert den Formularzustand bei Eingaben
  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  // Speichert Profiländerungen und optional das Passwort
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

    if (form.passwort && form.passwort === form.passwortBestätigen) {
      await updatePassword(form.passwort, navigate);
    } else if (form.passwort || form.passwortBestätigen) {
      alert("Passwörter stimmen nicht überein");
    }
  };

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
