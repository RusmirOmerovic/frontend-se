import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";

const Verify = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const confirmUser = async () => {
      const token = new URLSearchParams(window.location.hash.slice(1)).get("confirmation_token");

      if (!token) {
        alert("Kein Token gefunden.");
        return;
      }

      const { error: verifyError } = await supabase.auth.verifyOtp({
        token,
        type: "signup", // ← wichtig: kein "email", sondern "signup"
      });

      if (verifyError) {
        alert("Verifizierung fehlgeschlagen: " + verifyError.message);
        return;
      }

      const { data: { user }, error: userError } = await supabase.auth.getUser();

      if (userError || !user) {
        alert("Benutzerdaten konnten nicht geladen werden.");
        return;
      }

      const { vorname, nachname, geburtsdatum, matrikelnummer } = user.user_metadata;

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
