import { useState } from "react";
import { supabase } from "../supabaseClient"; // Stelle sicher, dass dein Supabase Client korrekt exportiert ist

export default function RegisterForm() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    vorname: "",
    nachname: "",
    geburtsdatum: "",
    matrikelnummer: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMsg("");

    // 1. Nutzer registrieren
    const { data: authData, error: signUpError } = await supabase.auth.signUp({
      email: formData.email,
      password: formData.password,
    });

    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
      return;
    }

    const userId = authData.user?.id;

    // 2. Profildaten einfügen
    const { error: insertError } = await supabase.from("user_profiles").insert([
      {
        id: userId, // wichtig wegen RLS!
        vorname: formData.vorname,
        nachname: formData.nachname,
        geburtsdatum: formData.geburtsdatum,
        matrikelnummer: formData.matrikelnummer,
      },
    ]);

    if (insertError) {
      setError(insertError.message);
    } else {
      setSuccessMsg("Registrierung erfolgreich! Bitte bestätige deine E-Mail.");
      setFormData({
        email: "",
        password: "",
        vorname: "",
        nachname: "",
        geburtsdatum: "",
        matrikelnummer: "",
      });
    }

    setLoading(false);
  };

  return (
    <form onSubmit={handleRegister} className="space-y-4 max-w-md mx-auto">
      <h2 className="text-xl font-bold">Registrierung</h2>

      {error && <div className="text-red-600">{error}</div>}
      {successMsg && <div className="text-green-600">{successMsg}</div>}

      <input
        type="text"
        name="vorname"
        placeholder="Vorname"
        value={formData.vorname}
        onChange={handleChange}
        required
      />
      <input
        type="text"
        name="nachname"
        placeholder="Nachname"
        value={formData.nachname}
        onChange={handleChange}
        required
      />
      <input
        type="date"
        name="geburtsdatum"
        placeholder="Geburtsdatum"
        value={formData.geburtsdatum}
        onChange={handleChange}
        required
      />
      <input
        type="text"
        name="matrikelnummer"
        placeholder="Matrikelnummer"
        value={formData.matrikelnummer}
        onChange={handleChange}
        required
      />
      <input
        type="email"
        name="email"
        placeholder="E-Mail"
        value={formData.email}
        onChange={handleChange}
        required
      />
      <input
        type="password"
        name="password"
        placeholder="Passwort"
        value={formData.password}
        onChange={handleChange}
        required
      />

      <button type="submit" disabled={loading}>
        {loading ? "Registriere..." : "Registrieren"}
      </button>
    </form>
  );
}
