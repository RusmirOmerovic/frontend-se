import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";

const Register = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    email: "",
    password: "",
    vorname: "",
    nachname: "",
    geburtsdatum: "",
    matrikelnummer: "",
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // 1. Nutzerdaten temporär speichern für die Verify-Komponente
      localStorage.setItem('pendingUserData', JSON.stringify({
        vorname: form.vorname,
        nachname: form.nachname,
        geburtsdatum: form.geburtsdatum,
        matrikelnummer: form.matrikelnummer,
      }));

      // 2. User bei Supabase Auth registrieren
      const { data, error } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
        options: {
          data: {
            vorname: form.vorname,
            nachname: form.nachname,
            geburtsdatum: form.geburtsdatum,
            matrikelnummer: form.matrikelnummer,
          },
          emailRedirectTo: `${window.location.origin}/verify`, // Dynamisch basierend auf aktueller Domain
        },
      });

      console.log("Supabase signUp data:", data);
      console.log("Supabase signUp error:", error);

      if (error) {
        setError(error.message);
        localStorage.removeItem('pendingUserData'); // Aufräumen bei Fehler
        return;
      }

      if (data.user) {
        alert("Registrierung erfolgreich! Bitte bestätige deine E-Mail über den Link in deinem Postfach.");
        // Nicht direkt navigieren - User muss erst Email bestätigen
        setForm({
          email: "",
          password: "",
          vorname: "",
          nachname: "",
          geburtsdatum: "",
          matrikelnummer: "",
        });
        navigate("/");
      }
    } catch (err) {
      console.error("Registration error:", err);
      setError("Ein unerwarteter Fehler ist aufgetreten. Bitte versuche es erneut.");
      localStorage.removeItem('pendingUserData');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-6">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded shadow w-full max-w-lg">
        <h2 className="text-2xl font-bold mb-4">Registrieren mit Profil</h2>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

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
            disabled={loading}
            className="w-full p-2 border mb-3 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        ))}

        <button 
          type="submit" 
          disabled={loading}
          className="w-full bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white py-2 px-4 rounded transition-colors"
        >
          {loading ? "Registriere..." : "Registrieren"}
        </button>

        <p className="mt-4 text-sm text-gray-600 text-center">
          Nach der Registrierung erhältst du eine E-Mail zur Bestätigung.
        </p>
      </form>
    </div>
  );
};

export default Register;