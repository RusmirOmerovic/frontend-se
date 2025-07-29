// pages/Verify.jsx
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



      if (token) {
        const { error } = await supabase.auth.verifyOtp({
          token,
          type: "signup",
        });

        if (!error) {
          const { data: { user } } = await supabase.auth.getUser(); // aktueller User

          const vorname = sessionStorage.getItem("vorname");
          const nachname = sessionStorage.getItem("nachname");
          const geburtsdatum = sessionStorage.getItem("geburtsdatum");
          const matrikelnummer = sessionStorage.getItem("matrikelnummer");

          if (user && user.id) {
            await supabase.from("user_profiles").update({
              vorname,
              nachname,
              geburtsdatum,
              matrikelnummer,
            }).eq("id", user.id);
          }

          // optional: sessionStorage löschen
          sessionStorage.clear();

          alert("Deine E-Mail wurde bestätigt. Du kannst dich jetzt einloggen.");
          navigate("/login");
        } else {
          alert("Bestätigung fehlgeschlagen: " + error.message);
        }


      }
    };

    confirmUser();
  }, [navigate]);

  return <p className="text-center mt-10">Bitte warten... E-Mail wird bestätigt...</p>;
};

export default Verify;
