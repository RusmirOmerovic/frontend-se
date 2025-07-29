import { useState } from "react";
import { supabase } from "../supabaseClient";

const Register = () => {
  const [form, setForm] = useState({
    email: "",
    password: "",
    vorname: "",
    nachname: "",
    geburtsdatum: "",
    matrikelnummer: "",
  });

  const [error, setError] = useState(null);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    sessionStorage.setItem("vorname", form.vorname);
    sessionStorage.setItem("nachname", form.nachname);
    sessionStorage.setItem("geburtsdatum", form.geburtsdatum);
    sessionStorage.setItem("matrikelnummer", form.matrikelnummer);
    sessionStorage.setItem("email", form.email);

    const { data, error } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        emailRedirectTo: "https://frontend-se-cyan.vercel.app/verify", // URL für die E-Mail-Bestätigung
        data: {
          vorname: form.vorname,
          nachname: form.nachname,
          geburtsdatum: form.geburtsdatum,
          matrikelnummer: form.matrikelnummer,
        },
      },
    });

    if (error) {
      setError(error.message);
    } else {
      const userId = data?.user?.id;

      // if (userId) {
      //   await supabase.from("user_profiles").insert([
      //     {
      //       id: userId,
      //       Vorname: form.vorname,
      //       Nachname: form.nachname,
      //       geburtsdatum: form.geburtsdatum,
      //       matrikelnummer: form.matrikelnummer,
      //     },
      //   ]);
      // }

      alert("Registrierung erfolgreich. Bitte bestätige deine E-Mail.");
      window.location.href = "/login";
    }

    // Falls erfolgreich, ergänze user_profiles manuell
    if (data?.user) {
      const { id } = data.user;

      const { error: insertError } = await supabase
        .from("user_profiles")
        .insert([
          {
            id, // <- identisch mit Supabase User UUID
            vorname,
            nachname,
            geburtsdatum,
            matrikelnummer,
            email,
          },
        ]);

      if (insertError) {
        console.error("Fehler beim Einfügen in user_profiles:", insertError.message);
      }
    }

  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-6">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded shadow w-full max-w-lg"
      >
        <h2 className="text-2xl font-bold mb-4">Registrieren mit Profil</h2>

        {error && <p className="text-red-500 mb-3">{error}</p>}

        {[
          "vorname",
          "nachname",
          "geburtsdatum",
          "matrikelnummer",
          "email",
          "password",
        ].map((field) => (
          <input
            key={field}
            name={field}
            type={
              field === "password"
                ? "password"
                : field === "geburtsdatum"
                ? "date"
                : "text"
            }
            placeholder={
              field.charAt(0).toUpperCase() +
              field
                .slice(1)
                .replace("geburtsdatum", "Geburtsdatum")
                .replace("matrikelnummer", "Matrikelnummer")
            }
            value={form[field]}
            onChange={handleChange}
            required
            className="w-full p-2 border mb-3 rounded"
          />
        ))}

        <button
          type="submit"
          className="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded"
        >
          Registrieren
        </button>
      </form>
    </div>
  );
};

export default Register;
