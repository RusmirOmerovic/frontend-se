import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";

const Verify = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const confirmUser = async () => {
      const hashParams = new URLSearchParams(window.location.hash.slice(1));
      const access_token = hashParams.get("access_token");

      if (!access_token) {
        alert("Kein Token gefunden.");
        return;
      }

      const { error: sessionError } = await supabase.auth.setSession({
        access_token,
        refresh_token: hashParams.get("refresh_token"),
      });

      if (sessionError) {
        alert("Session konnte nicht gesetzt werden: " + sessionError.message);
        return;
      }

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();


      if (userError || !user) {
        alert("Benutzerdaten konnten nicht geladen werden.");
        return;
      }

      //const { vorname, nachname, geburtsdatum, matrikelnummer } = user.user_metadata;

      const { error: insertError } = await supabase.from("user_profiles").insert([
        {
          id: user.id,
          vorname: user.vorname,
          nachname: user.nachname,
          geburtsdatum: user.geburtsdatum,
          matrikelnummer: user.matrikelnummer,
          email: user.email,
        },
      ]);

      if (insertError) {
       alert("Profil konnte nicht gespeichert werden.");
        return;
      }

      sessionStorage.clear();
      alert("E-Mail bestätigt! Du wirst weitergeleitet...");
      navigate("/welcome"); // ✅
    };

    confirmUser();
  }, [navigate]); // ✅ KEINE navigate() Funktion in den dependencies

  return null;
};

export default Verify;
