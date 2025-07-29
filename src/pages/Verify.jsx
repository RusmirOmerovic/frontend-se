import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";

const Verify = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const confirmUser = async () => {
      // 1. Token aus der URL lesen (nur aus dem Hash!)
      const token = new URLSearchParams(window.location.hash.slice(1)).get("confirmation_token");

      if (!token) {
        alert("Kein Token gefunden.");
        return;
      }

      // 2. Token bei Supabase verifizieren
      const { error: otpError } = await supabase.auth.verifyOtp({
        token,
        type: "email",
      });

      if (otpError) {
        alert("Bestätigung fehlgeschlagen: " + otpError.message);
        return;
      }

      // 3. Aktuelle Session abrufen
      const { data: sessionData } = await supabase.auth.getSession();
      const session = sessionData?.session;
      const user = session?.user;

      if (!user) {
        alert("Benutzer konnte nach Verifizierung nicht geladen werden.");
        return;
      }

      const { id, email, user_metadata } = user;
      const { vorname, nachname, geburtsdatum, matrikelnummer } = user_metadata;

      // 4. Profil in DB einfügen
      const { error: insertError } = await supabase.from("user_profiles").insert([
        {
          id,
          email,
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

      // 5. sessionStorage löschen & Weiterleitung
      sessionStorage.clear();
      alert("Deine E-Mail wurde bestätigt. Du kannst dich jetzt einloggen.");
      navigate("/login");
    };

    confirmUser();
  }, [navigate]); // ❗ ACHTUNG: hier `navigate` selbst, NICHT `navigate("/welcome")`

  return null; // Kein sichtbares Element
};

export default Verify;
