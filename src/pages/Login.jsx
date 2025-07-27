import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
  e.preventDefault();
  setMessage(""); // Reset vorherige Meldung

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    if (
      error.message.includes("Email not confirmed") ||
      error.message.includes("Email ist noch nicht bestätigt") // optional deutsch
    ) {
      setMessage("Bitte bestätige zuerst deine E-Mail-Adresse über den Link in deinem Posteingang.");
    } else {
      setMessage(error.message);
    }
  } else {
    setMessage("Login erfolgreich. Weiterleitung...");
    setTimeout(() => {
      navigate("/dashboard");
    }, 1000);
  }
};


  return (
    <form
      onSubmit={handleLogin}
      className="max-w-md mx-auto mt-10 bg-white p-6 shadow rounded"
    >
      <h2 className="text-xl font-bold mb-4">Login</h2>

      <label className="block mb-2">
        E-Mail-Adresse:
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full mt-1 p-2 border rounded"
          required
        />
      </label>

      <label className="block mb-4">
        Passwort:
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full mt-1 p-2 border rounded"
          required
        />
      </label>

      <button
        type="submit"
        className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
      >
        Login
      </button>

      {message && <p className="mt-4 text-sm text-center">{message}</p>}
    </form>
  );
};

export default Login;
