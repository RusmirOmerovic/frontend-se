import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";

const Register = () => {
  const navigate = useNavigate(); // ✅ an den Anfang
  const [form, setForm] = useState({
    email: "",
    password: "",
    vorname: "",
    nachname: "",
    geburtsdatum: "",
    matrikelnummer: "",
  });

  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false); // ⬅️ damit triggerst du später navigation

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    const { data, error } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        emailRedirectTo: "https://frontend-se-cyan.vercel.app/verify",
        data: {
          vorname: form.vorname,
          nachname: form.nachname,
          geburtsdatum: form.geburtsdatum,
          matrikelnummer: form.matrikelnummer,
        },
      },
    });

    // useEffect(() => {
        // if (success) {
        //   navigate("/welcome");
        // }
        //}, [success, navigate]);


    if (error) {
      setError(error.message);
      return;
    }

    alert("Registrierung erfolgreich. Bitte bestätige deine E-Mail.");
    setSuccess(true); // für redirect

  };

  
  // JSX bleibt wie bei dir
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-6">
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
