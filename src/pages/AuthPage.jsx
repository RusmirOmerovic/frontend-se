import { useState } from "react";
import { supabase } from "../supabaseClient";
import { useNavigate } from "react-router-dom";

// Seite für Login und Registrierung über ein gemeinsames Formular
const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Reicht die Eingaben an Supabase weiter und behandelt Login oder Registrierung
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    const { error } = isLogin
      ? await supabase.auth.signInWithPassword({ email, password })
      : await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/dashboard`,
          },
        });

    if (error) {
      setError(error.message);
    } else {
      if (isLogin) {
        navigate("/dashboard");
      } else {
        alert("Bitte bestätige deine E-Mail zur Aktivierung.");
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-6">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded shadow w-full max-w-md"
      >
        <h2 className="text-2xl font-bold mb-4">
          {isLogin ? "Login" : "Registrieren"}
        </h2>

        {error && <p className="text-red-500 mb-3">{error}</p>}

        <input
          type="email"
          placeholder="E-Mail"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full p-2 border mb-3 rounded"
        />

        <input
          type="password"
          placeholder="Passwort"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="w-full p-2 border mb-3 rounded"
        />

        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded"
        >
          {isLogin ? "Einloggen" : "Registrieren"}
        </button>

        <p className="mt-4 text-center">
          {isLogin ? "Noch kein Account?" : "Schon registriert?"}{" "}
          <button
            type="button"
            className="text-blue-600 underline"
            onClick={() => setIsLogin(!isLogin)}
          >
            {isLogin ? "Registrieren" : "Login"}
          </button>
        </p>
      </form>
    </div>
  );
};

export default AuthPage;
