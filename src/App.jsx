import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Navbar from "./components/Navbar";
import Dashboard from "./pages/Dashboard";
import Verify from "./pages/Verify";
import { useEffect, useState } from "react";
import { supabase } from "./supabaseClient";
import Register from "./pages/Register";
import ProjectDetail from "./pages/ProjectDetail";
import ProfileUpdate from "./pages/ProfileUpdate";
import { Navigate } from "react-router-dom";
import Welcome from "./pages/Welcome";


function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Nutzer direkt beim Start holen
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
    });

    // Listener für Login / Logout
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    // Aufräumen beim Verlassen der Komponente
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="p-4">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/project/:id" element={<ProjectDetail />} />
          <Route path="/profil" element={user ? <ProfileUpdate /> : <Navigate to="/login" />} />
          <Route path="/verify" element={<Verify />} />
          <Route path="/welcome" element={<Welcome />} />
          <Route
            path="/dashboard"
            element={
              user ? (
                <Dashboard />
              ) : (
                <p className="text-center mt-10 text-red-500">
                  🔒 Zugriff nur mit Login möglich! Bitte einloggen mit deinen Zugangsdaten. 
                </p>
              )
            }
          />
        </Routes>
      </div>
    </div>
  );
}

export default App;
