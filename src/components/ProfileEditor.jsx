import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";

const ProfileEditor = ({ user }) => {
  const [form, setForm] = useState({
    Vorname: "",
    Nachname: "",
    geburtsdatum: "",
    matrikelnummer: "",
  });

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

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { error } = await supabase
      .from("user_profiles")
      .update({
        Vorname: form.Vorname,
        Nachname: form.Nachname,
        geburtsdatum: form.geburtsdatum,
        matrikelnummer: form.matrikelnummer,
      })
      .eq("id", user.id);

    if (error) {
      alert("Fehler beim Speichern");
    } else {
      alert("Profil aktualisiert");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-4 rounded shadow mt-4">
      <h2 className="text-lg font-semibold mb-2">🛠️ Profil bearbeiten</h2>
      <div className="space-y-2">
        {["Vorname", "Nachname", "geburtsdatum", "matrikelnummer"].map(
          (field) => (
            <input
              key={field}
              name={field}
              value={form[field]}
              onChange={handleChange}
              type={field === "geburtsdatum" ? "date" : "text"}
              placeholder={field}
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
