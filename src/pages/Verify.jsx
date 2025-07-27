// pages/Verify.jsx
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";

const Verify = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const confirmUser = async () => {
      const hash = window.location.hash;
      const token = new URLSearchParams(hash).get("confirmation_token");

      if (token) {
        const { error } = await supabase.auth.verifyOtp({
          token,
          type: "signup",
        });

        if (!error) {
          alert("Deine E-Mail wurde bestätigt! Du kannst dich jetzt einloggen.");
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
