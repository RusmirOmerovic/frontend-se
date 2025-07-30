import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";

const Verify = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const confirmUser = async () => {
      const tokenFromHash = new URLSearchParams(window.location.hash.slice(1)).get("confirmation_token");
      const tokenFromQuery = new URLSearchParams(window.location.search).get("confirmation_token");
      const token = tokenFromQuery || tokenFromHash;

      if (!token) {
        alert("Kein Token gefunden.");
        return;
      }

      // Email-Verifizierung durchführen
      const { data: verifyData, error: otpError } = await supabase.auth.verifyOtp({
        token,
        type: "signup",
      });

      if (otpError) {
        alert("Verifizierung fehlgeschlagen: " + otpError.message);
        return;
      }

      const user = verifyData?.user;

      if (!user) {
        alert("Kein Benutzer nach Verifizierung verfügbar.");
        return;
      }

      const { vorname, nachname, geburtsdatum, matrikelnummer } = user.user_metadata;

      const { error: insertError } = await supabase.from("user_profiles").insert([
        {
          id: user.id,
          vorname,
          nachname,
          geburtsdatum,
          matrikelnummer,
          email: user.email,
        },
      ]);

      if (insertError) {
        alert("Fehler beim Speichern des Profils: " + insertError.message);
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
