import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "../supabaseClient";

const Verify = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState("verifying");
  const [message, setMessage] = useState("E-Mail wird bestätigt...");
  const [debugInfo, setDebugInfo] = useState({});

  useEffect(() => {
    const confirmUser = async () => {
      try {
        // DEBUGGING: Alle URL-Informationen sammeln
        const currentUrl = window.location.href;
        const searchParamsAll = Object.fromEntries(searchParams.entries());
        const hashParams = new URLSearchParams(window.location.hash.slice(1));
        const hashParamsAll = Object.fromEntries(hashParams.entries());
        
        const debug = {
          fullUrl: currentUrl,
          pathname: window.location.pathname,
          search: window.location.search,
          hash: window.location.hash,
          searchParams: searchParamsAll,
          hashParams: hashParamsAll
        };
        
        setDebugInfo(debug);
        console.log("=== DEBUGGING URL INFORMATION ===");
        console.log("Full URL:", currentUrl);
        console.log("Search params:", searchParamsAll);
        console.log("Hash params:", hashParamsAll);
        console.log("Raw hash:", window.location.hash);
        console.log("Raw search:", window.location.search);

        // 1. Token aus verschiedenen Quellen versuchen zu extrahieren
        let token = null;
        let tokenSource = null;

        // Methode 1: Query-Parameter (moderne Supabase)
        const possibleTokenNames = ['token', 'confirmation_token', 'access_token', 'refresh_token'];
        
        for (const tokenName of possibleTokenNames) {
          const queryToken = searchParams.get(tokenName);
          if (queryToken) {
            token = queryToken;
            tokenSource = `query-${tokenName}`;
            break;
          }
        }

        // Methode 2: Hash-Parameter (legacy Supabase)
        if (!token) {
          for (const tokenName of possibleTokenNames) {
            const hashToken = hashParams.get(tokenName);
            if (hashToken) {
              token = hashToken;
              tokenSource = `hash-${tokenName}`;
              break;
            }
          }
        }

        // Methode 3: Direkter Hash-Wert (sehr legacy)
        if (!token && window.location.hash) {
          const hashValue = window.location.hash.slice(1);
          if (hashValue && hashValue.length > 20) { // Token sind normalerweise länger
            token = hashValue;
            tokenSource = 'direct-hash';
          }
        }

        console.log("Found token:", token);
        console.log("Token source:", tokenSource);

        if (!token) {
          setStatus("debug");
          throw new Error(`Kein Token gefunden. Debug-Info verfügbar.`);
        }

        // 2. Verschiedene Verifizierungsmethoden versuchen
        let verifyData = null;
        let verifyError = null;

        // Methode A: verifyOtp mit token_hash
        try {
          console.log("Trying verifyOtp with token_hash...");
          const result = await supabase.auth.verifyOtp({
            token_hash: token,
            type: "signup"
          });
          verifyData = result.data;
          verifyError = result.error;
          console.log("verifyOtp token_hash result:", { data: verifyData, error: verifyError });
        } catch (err) {
          console.log("verifyOtp token_hash failed:", err);
        }

        // Methode B: verifyOtp mit token (falls token_hash fehlschlägt)
        if (verifyError || !verifyData?.user) {
          try {
            console.log("Trying verifyOtp with token...");
            const result = await supabase.auth.verifyOtp({
              token: token,
              type: "signup"
            });
            verifyData = result.data;
            verifyError = result.error;
            console.log("verifyOtp token result:", { data: verifyData, error: verifyError });
          } catch (err) {
            console.log("verifyOtp token failed:", err);
          }
        }

        // Methode C: getSession (falls Token bereits in Session ist)
        if (verifyError || !verifyData?.user) {
          try {
            console.log("Trying getSession...");
            const result = await supabase.auth.getSession();
            if (result.data.session?.user) {
              verifyData = { user: result.data.session.user, session: result.data.session };
              verifyError = null;
              console.log("getSession result:", verifyData);
            }
          } catch (err) {
            console.log("getSession failed:", err);
          }
        }

        if (verifyError) {
          console.error("Verify error:", verifyError);
          throw new Error(`Verifizierung fehlgeschlagen: ${verifyError.message}`);
        }

        if (!verifyData?.user) {
          throw new Error("Keine Benutzerdaten nach Verifizierung erhalten.");
        }

        console.log("Verification successful:", verifyData);

        // 3. User-Daten verarbeiten
        const user = verifyData.user;
        console.log("User object:", user);
        console.log("User metadata:", user.user_metadata);

        // 4. Registrierungsdaten zusammenstellen
        const metadata = user.user_metadata || {};
        let userData = {
          vorname: metadata.vorname,
          nachname: metadata.nachname,
          geburtsdatum: metadata.geburtsdatum,
          matrikelnummer: metadata.matrikelnummer
        };

        // Fallback: localStorage
        const pendingDataString = localStorage.getItem('pendingUserData');
        if (pendingDataString && (!userData.vorname || !userData.nachname)) {
          const pendingData = JSON.parse(pendingDataString);
          userData = { ...userData, ...pendingData };
          console.log("Using localStorage fallback:", userData);
        }

        console.log("Final user data:", userData);

        // 5. Validierung
        if (!userData.vorname || !userData.nachname || !userData.geburtsdatum || !userData.matrikelnummer) {
          throw new Error(`Unvollständige Daten: ${JSON.stringify(userData)}`);
        }

        // 6. Profil erstellen
        const profileData = {
          id: user.id,
          email: user.email,
          vorname: userData.vorname,
          nachname: userData.nachname,
          geburtsdatum: userData.geburtsdatum,
          matrikelnummer: userData.matrikelnummer,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };

        console.log("Inserting profile:", profileData);

        const { data: insertData, error: insertError } = await supabase
          .from("user_profiles")
          .insert([profileData])
          .select();

        if (insertError) {
          console.error("Insert error:", insertError);
          throw new Error(`Profil-Erstellung fehlgeschlagen: ${insertError.message}`);
        }

        console.log("Profile created:", insertData);

        // 7. Success
        localStorage.removeItem('pendingUserData');
        setStatus("success");
        setMessage("E-Mail erfolgreich bestätigt! Du wirst weitergeleitet...");

        setTimeout(() => {
          navigate("/welcome");
        }, 3000);

      } catch (error) {
        console.error("=== CONFIRMATION ERROR ===");
        console.error("Error:", error);
        console.error("Debug info:", debugInfo);
        
        setStatus("error");
        setMessage(error.message || "Ein Fehler ist aufgetreten.");
        localStorage.removeItem('pendingUserData');
      }
    };

    confirmUser();
  }, [navigate, searchParams]);

  // Debug-Ansicht
  if (status === "debug") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 p-6">
        <div className="bg-white p-8 rounded shadow w-full max-w-2xl">
          <h2 className="text-2xl font-bold mb-4 text-red-600">Debug-Informationen</h2>
          <div className="bg-gray-100 p-4 rounded mb-4 text-sm">
            <h3 className="font-bold mb-2">URL-Informationen:</h3>
            <pre className="whitespace-pre-wrap">{JSON.stringify(debugInfo, null, 2)}</pre>
          </div>
          <p className="text-gray-600 mb-4">
            Bitte kopieren Sie diese Informationen und die URL aus der E-Mail.
          </p>
          <button
            onClick={() => navigate("/register")}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded"
          >
            Zurück zur Registrierung
          </button>
        </div>
      </div>
    );
  }

  // Standard UI für andere Status
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