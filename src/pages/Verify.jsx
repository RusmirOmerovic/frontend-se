import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";

const Verify = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const confirmUser = async () => {
      const hashToken = new URLSearchParams(window.location.hash.slice(1)).get("confirmation_token");
      const queryToken = new URLSearchParams(window.location.search).get("confirmation_token");
      const token = hashToken || queryToken;

      if (!token) {
        alert("Kein Token gefunden.");
        return;
      }

      const { error: otpError } = await supabase.auth.verifyOtp({
        token,
        type: "signup", // WICHTIG
      });

      if (otpError) {
        alert("Bestätigung fehlgeschlagen: " + otpError.message);
        return;
      }

      const { data: sessionData } = await supabase.auth.getSession();
      const user = sessionData?.session?.user;

      if (!user) {
        alert("Benutzer konnte nach Verifizierung nicht geladen werden.");
        return;
      }

      const { vorname, nachname, geburtsdatum, matrikelnummer } = user.user_metadata;

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
        alert("Profil konnte nicht gespeichert werden: " + insertError.message);
        return;
      }

      sessionStorage.clear();

      alert("E-Mail bestätigt! Du wirst weitergeleitet...");
      navigate("/welcome"); // ✅
    };

    confirmUser();
  }, []); // ✅ KEINE navigate() Funktion in den dependencies

  return null;
};

export default Verify;
