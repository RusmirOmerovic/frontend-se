import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";

const Verify = () => {
  const navigate = useNavigate();
  const [info, setInfo] = useState("Bestätigung läuft...");

  useEffect(() => {
    const confirmUser = async () => {
      const code = new URLSearchParams(window.location.search).get("code");

      if (code) {
        const { error: exchangeError } =
          await supabase.auth.exchangeCodeForSession(code);
        if (exchangeError) {
          alert(
            "Fehler beim Austausch des Verifizierungscodes: " +
              exchangeError.message
          );
          return;
        }
      }

      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError || !session) {
        alert("Keine gültige Session gefunden.");
        return;
      }

      const user = session.user;

      const { vorname, nachname, geburtsdatum, matrikelnummer } =
        user.user_metadata || {};

      const { error: insertProfileError } = await supabase
        .from("user_profiles")
        .insert([
          {
            id: user.id,
            email: user.email,
            vorname,
            nachname,
            geburtsdatum,
            matrikelnummer,
          },
        ]);

      const role = user.email?.includes("@web.de") ? "tutor" : "student";
      const { error: insertRoleError } = await supabase
        .from("user_roles")
        .insert([{ user_id: user.id, role }]);

      if (insertProfileError || insertRoleError) {
        alert(
          "Profil oder Rolle konnten nicht gespeichert werden: " +
            (insertProfileError || insertRoleError).message
        );
        return;
      }

      sessionStorage.clear();
      setInfo("E-Mail bestätigt! Weiterleitung...");
      setTimeout(() => navigate("/welcome"), 1000);
    };

    confirmUser();
  }, [navigate]);

  return <p className="p-6 text-center">{info}</p>;
};

export default Verify;
