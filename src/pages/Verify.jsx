import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";

const Verify = () => {
  const navigate = useNavigate();
  const [info, setInfo] = useState("Bestätigung läuft...");

  useEffect(() => {
    const confirmUser = async () => {
      const { data, error } = await supabase.auth.getSessionFromUrl({
        storeSession: true,
      });

      if (error || !data.session) {
        setInfo("Keine gültige Session gefunden.");
        return;
      }

      const user = data.session.user;

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
        console.error("Profil konnte nicht gespeichert werden:", insertError);
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
