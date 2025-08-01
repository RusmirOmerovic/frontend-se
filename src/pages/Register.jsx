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
  const [confirmationMsg, setConfirmationMsg] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setConfirmationMsg("");

    const { error } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        data: {
          vorname: form.vorname,
          nachname: form.nachname,
          geburtsdatum: form.geburtsdatum,
          matrikelnummer: form.matrikelnummer,
        },
        emailRedirectTo: `${window.location.origin}/verify`,
      },
    });

    if (error) {
      setError(error.message);
      return;
    }

    setConfirmationMsg(
      "Bitte bestätige deine E-Mail über den zugeschickten Link. Danach wird dein Profil aktiviert."
    );
    setForm({
      email: "",
      password: "",
      vorname: "",
      nachname: "",
      geburtsdatum: "",
      matrikelnummer: "",
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-6">
      {confirmationMsg && (
        <p className="text-green-600 mb-3 text-center w-full max-w-lg">{confirmationMsg}</p>
      )}
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded shadow w-full max-w-lg">
        <h2 className="text-2xl font-bold mb-4">Registrieren mit Profil</h2>
        {error && <p className="text-red-500 mb-3">{error}</p>}

        {["vorname", "nachname", "geburtsdatum", "matrikelnummer", "email", "password"].map((field) => (
          <input
            key={field}
            name={field}
            type={field === "password" ? "password" : field === "geburtsdatum" ? "date" : "text"}
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

        <button type="submit" className="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded">
          Registrieren
        </button>
      </form>
    </div>
  );
};

export default Register;
