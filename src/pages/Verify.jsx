import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";

const Verify = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const confirmUser = async () => {
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

      const { error: insertError } = await supabase.from("user_profiles").insert([
        {
          id: user.id,
          email: user.email,
          vorname,
          nachname,
          geburtsdatum,
          matrikelnummer,
        },
      ]);

      if (insertError) {
        alert("Profil konnte nicht gespeichert werden: " + insertError.message);
        return;
      }

      sessionStorage.clear();
      alert("E-Mail bestätigt! Du wirst weitergeleitet...");
      navigate("/welcome");
    };

    confirmUser();
  }, [navigate]);

  return null;
};

export default Verify;
