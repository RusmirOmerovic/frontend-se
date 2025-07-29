import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";

const Verify = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const confirmUser = async () => {
      const tokenFromHash = new URLSearchParams(window.location.hash.slice(1)).get("confirmation_token");
      const tokenFromQuery = new URLSearchParams(window.location.search).get("confirmation_token");
      const token = tokenFromHash || tokenFromQuery;

      if (!token) {
        alert("Kein Token gefunden.");
        return;
      }

      // Bestätige den Token (E-Mail-Verifizierung)
      const { error: otpError } = await supabase.auth.verifyOtp({
        token,
        type: "signup",
      });

      if (otpError) {
        alert("Bestätigung fehlgeschlagen: " + otpError.message);
        return;
      }

      // Hole aktuelle Session und User
      const { data: sessionData } = await supabase.auth.getSession();
      const session = sessionData?.session;
      const user = session?.user;

      if (!user) {
        alert("Benutzer konnte nach Verifizierung nicht geladen werden.");
        return;
      }

      const { vorname, nachname, geburtsdatum, matrikelnummer } = user.user_metadata;

      // Profil einfügen
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
        alert("Profil konnte nicht gespeichert werden: " + insertError.message);
        return;
      }

      // SessionStorage löschen
      sessionStorage.clear();

      alert("Deine E-Mail wurde bestätigt. Du kannst dich jetzt einloggen.");
      //navigate("/login");
    };

    confirmUser();
  }, [navigate("/welcome")]);
return null; // Kein JSX, da nur Logik
};

export default Verify;
