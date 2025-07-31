import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";

const Verify = () => {
  const navigate = useNavigate();
  const [status, setStatus] = useState("verifying");
  const [message, setMessage] = useState("E-Mail wird bestätigt...");

  useEffect(() => {
    const confirmUser = async () => {
      try {
        console.log("=== VERIFICATION START ===");
        console.log("Current URL:", window.location.href);
        console.log("Hash:", window.location.hash);
        console.log("Search:", window.location.search);

        // 1. Token aus URL extrahieren (verschiedene Methoden)
        let token = null;
        let tokenSource = null;

        // Methode A: URL Search Params (moderne Supabase)
        const urlParams = new URLSearchParams(window.location.search);
        const possibleTokenNames = ['token', 'confirmation_token', 'access_token'];
        
        for (const tokenName of possibleTokenNames) {
          const foundToken = urlParams.get(tokenName);
          if (foundToken) {
            token = foundToken;
            tokenSource = `search-${tokenName}`;
            break;
          }
        }

        // Methode B: Hash Params (legacy Supabase)
        if (!token && window.location.hash) {
          const hashParams = new URLSearchParams(window.location.hash.slice(1));
          for (const tokenName of possibleTokenNames) {
            const foundToken = hashParams.get(tokenName);
            if (foundToken) {
              token = foundToken;
              tokenSource = `hash-${tokenName}`;
              break;
            }
          }
        }

        // Methode C: Direkter Hash (falls nötig)
        if (!token && window.location.hash && window.location.hash.length > 20) {
          token = window.location.hash.slice(1);
          tokenSource = 'direct-hash';
        }

        console.log("Found token:", token ? "YES" : "NO");
        console.log("Token source:", tokenSource);

        if (!token) {
          // Fallback: Prüfen ob User bereits eingeloggt ist
          const { data: sessionData } = await supabase.auth.getSession();
          if (sessionData.session?.user) {
            console.log("User already has session, proceeding...");
            token = "session-exists";
            tokenSource = "existing-session";
          } else {
            throw new Error("Kein Bestätigungstoken gefunden. Bitte verwende den Link aus deiner E-Mail.");
          }
        }

        // 2. Email-Bestätigung durchführen (nur wenn Token vorhanden)
        let user = null;
        
        if (tokenSource !== "existing-session") {
          // Verschiedene Verify-Methoden versuchen
          let verifySuccess = false;
          
          // Versuch 1: verifyOtp mit token_hash
          try {
            console.log("Trying verifyOtp with token_hash...");
            const { data, error } = await supabase.auth.verifyOtp({
              token_hash: token,
              type: "signup"
            });
            
            if (!error && data.user) {
              user = data.user;
              verifySuccess = true;
              console.log("verifyOtp token_hash successful");
            } else {
              console.log("verifyOtp token_hash failed:", error?.message);
            }
          } catch (err) {
            console.log("verifyOtp token_hash error:", err);
          }

          // Versuch 2: verifyOtp mit token (falls erste Methode fehlschlägt)
          if (!verifySuccess) {
            try {
              console.log("Trying verifyOtp with token...");
              const { data, error } = await supabase.auth.verifyOtp({
                token: token,
                type: "signup"
              });
              
              if (!error && data.user) {
                user = data.user;
                verifySuccess = true;
                console.log("verifyOtp token successful");
              } else {
                console.log("verifyOtp token failed:", error?.message);
              }
            } catch (err) {
              console.log("verifyOtp token error:", err);
            }
          }

          if (!verifySuccess) {
            throw new Error("E-Mail-Bestätigung fehlgeschlagen. Token ungültig oder abgelaufen.");
          }
        } else {
          // User bereits eingeloggt
          const { data: userData } = await supabase.auth.getUser();
          user = userData.user;
        }

        if (!user) {
          throw new Error("Benutzerdaten konnten nicht abgerufen werden.");
        }

        console.log("User verified:", user.id);
        console.log("User metadata:", user.user_metadata);

        // 3. Registrierungsdaten sammeln
        const metadata = user.user_metadata || {};
        let userData = {
          vorname: metadata.vorname,
          nachname: metadata.nachname,
          geburtsdatum: metadata.geburtsdatum,
          matrikelnummer: metadata.matrikelnummer
        };

        // Fallback: localStorage (falls metadata leer)
        const pendingDataString = localStorage.getItem('pendingUserData');
        if (pendingDataString && (!userData.vorname || !userData.nachname)) {
          const pendingData = JSON.parse(pendingDataString);
          userData = { ...userData, ...pendingData };
          console.log("Using localStorage fallback data");
        }

        console.log("Final user data:", userData);

        // 4. Datenvalidierung
        const requiredFields = ['vorname', 'nachname', 'geburtsdatum', 'matrikelnummer'];
        const missingFields = requiredFields.filter(field => !userData[field]);
        
        if (missingFields.length > 0) {
          throw new Error(`Fehlende Registrierungsdaten: ${missingFields.join(', ')}. Bitte registriere dich erneut.`);
        }

        // 5. Profil in Datenbank erstellen (ohne updated_at)
        const profileData = {
          id: user.id,
          email: user.email,
          vorname: userData.vorname,
          nachname: userData.nachname,
          geburtsdatum: userData.geburtsdatum,
          matrikelnummer: userData.matrikelnummer,
          created_at: new Date().toISOString()
          // updated_at entfernt - Spalte existiert nicht
        };

        console.log("Inserting profile data:", profileData);

        const { data: insertResult, error: insertError } = await supabase
          .from("user_profiles")
          .insert([profileData])
          .select();

        if (insertError) {
          console.error("Profile insert error:", insertError);
          throw new Error(`Profil-Erstellung fehlgeschlagen: ${insertError.message}`);
        }

        console.log("Profile created successfully:", insertResult);

        // 6. Erfolg!
        localStorage.removeItem('pendingUserData');
        setStatus("success");
        setMessage("E-Mail erfolgreich bestätigt! Profil wurde erstellt. Du wirst weitergeleitet...");

        setTimeout(() => {
          navigate("/welcome");
        }, 3000);

      } catch (error) {
        console.error("=== VERIFICATION ERROR ===");
        console.error("Error message:", error.message);
        console.error("Full error:", error);
        
        setStatus("error");
        setMessage(error.message || "Ein unerwarteter Fehler ist aufgetreten.");
        
        localStorage.removeItem('pendingUserData');
      }
    };

    confirmUser();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-6">
      <div className="bg-white p-8 rounded shadow w-full max-w-md text-center">
        <div className="mb-6">
          {status === "verifying" && (
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          )}
          
          {status === "success" && (
            <div className="text-green-600 mb-4">
              <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
            </div>
          )}
          
          {status === "error" && (
            <div className="text-red-600 mb-4">
              <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </div>
          )}
        </div>

        <h2 className="text-2xl font-bold mb-4">
          {status === "verifying" && "E-Mail wird bestätigt..."}
          {status === "success" && "Bestätigung Erfolgreich!"}
          {status === "error" && "Bestätigung Fehlgeschlagen"}
        </h2>

        <p className={`mb-6 ${status === "error" ? "text-red-600" : "text-gray-600"}`}>
          {message}
        </p>

        {(status === "success" || status === "error") && (
          <button
            onClick={() => navigate(status === "success" ? "/welcome" : "/register")}
            className={`w-full py-2 px-4 rounded text-white transition-colors ${
              status === "success"
                ? "bg-green-600 hover:bg-green-700"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {status === "success" ? "Weiter" : "Zurück zur Registrierung"}
          </button>
        )}
      </div>
    </div>
  );
};

export default Verify;