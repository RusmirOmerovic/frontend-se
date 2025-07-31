import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "../supabaseClient";

const Verify = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState("verifying"); // verifying, success, error
  const [message, setMessage] = useState("E-Mail wird bestätigt...");

  useEffect(() => {
    const handleEmailConfirmation = async () => {
      try {
        // 1. Token-basierte Bestätigung aus URL-Parametern
        const token = searchParams.get('token');
        const type = searchParams.get('type');

        if (!token || type !== 'signup') {
          throw new Error('Ungültiger oder fehlender Bestätigungslink');
        }

        // 2. Email mit Token bestätigen
        const { data: sessionData, error: sessionError } = await supabase.auth.verifyOtp({
          token_hash: token,
          type: 'signup'
        });

        if (sessionError) {
          throw sessionError;
        }

        if (!sessionData.user) {
          throw new Error('Benutzer konnte nicht bestätigt werden');
        }

        console.log("User confirmed:", sessionData.user);

        // 3. Gespeicherte Registrierungsdaten abrufen
        const pendingDataString = localStorage.getItem('pendingUserData');
        if (!pendingDataString) {
          throw new Error('Keine Registrierungsdaten gefunden. Bitte registriere dich erneut.');
        }

        const pendingData = JSON.parse(pendingDataString);
        console.log("Pending user data:", pendingData);

        // 4. User-Profil in user_profiles Tabelle erstellen
        const profileData = {
          id: sessionData.user.id,
          email: sessionData.user.email,
          vorname: pendingData.vorname,
          nachname: pendingData.nachname,
          geburtsdatum: pendingData.geburtsdatum,
          matrikelnummer: pendingData.matrikelnummer,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };

        const { data: profileResult, error: profileError } = await supabase
          .from('user_profiles')
          .insert(profileData)
          .select();

        if (profileError) {
          console.error("Profile creation error:", profileError);
          throw new Error(`Profil konnte nicht erstellt werden: ${profileError.message}`);
        }

        console.log("Profile created successfully:", profileResult);

        // 5. Aufräumen und Success anzeigen
        localStorage.removeItem('pendingUserData');
        setStatus("success");
        setMessage("E-Mail erfolgreich bestätigt! Du wirst in 3 Sekunden zur Anmeldung weitergeleitet...");

        // 6. Automatische Weiterleitung nach 3 Sekunden
        setTimeout(() => {
          navigate('/login');
        }, 3000);

      } catch (error) {
        console.error("Verification error:", error);
        setStatus("error");
        setMessage(error.message || "Ein Fehler ist bei der Bestätigung aufgetreten.");
        
        // Cleanup bei Fehler
        localStorage.removeItem('pendingUserData');
      }
    };

    handleEmailConfirmation();
  }, [searchParams, navigate]);

  const handleManualRedirect = () => {
    if (status === "success") {
      navigate('/login');
    } else {
      navigate('/register');
    }
  };

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
          {status === "verifying" && "E-Mail Bestätigung"}
          {status === "success" && "Bestätigung Erfolgreich!"}
          {status === "error" && "Bestätigung Fehlgeschlagen"}
        </h2>

        <p className={`mb-6 ${status === "error" ? "text-red-600" : "text-gray-600"}`}>
          {message}
        </p>

        {(status === "success" || status === "error") && (
          <button
            onClick={handleManualRedirect}
            className={`w-full py-2 px-4 rounded text-white transition-colors ${
              status === "success"
                ? "bg-green-600 hover:bg-green-700"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {status === "success" ? "Zur Anmeldung" : "Zurück zur Registrierung"}
          </button>
        )}
      </div>
    </div>
  );
};

export default Verify;