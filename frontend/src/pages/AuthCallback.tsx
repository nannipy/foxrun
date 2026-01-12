import { useEffect, useState, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const AuthCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { handleStravaCallback } = useAuth();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const [errorDetails, setErrorDetails] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [codeUsed, setCodeUsed] = useState(false);
  const [successReceived, setSuccessReceived] = useState(false);
  const authStarted = useRef(false);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get("code");

    if (!code) {
      setStatus("error");
      setMessage("Codice di autorizzazione mancante.");
      setLoading(false);
      return;
    }

    if (codeUsed || successReceived || authStarted.current) {
      console.log('Code già usato, successo già ricevuto, o autenticazione già avviata, non ripeto la chiamata');
      return;
    }

    authStarted.current = true;

    let didFinish = false;
    // Timeout di sicurezza
    const timeout = setTimeout(() => {
      if (!didFinish) {
        setStatus("error");
        setMessage("Timeout durante la connessione a Strava. Riprova.");
        setLoading(false);
      }
    }, 10000); // 10 secondi

    const authenticate = async () => {
      try {
        setMessage("Stiamo collegando il tuo account Strava...");
        setErrorDetails(null);
        setCodeUsed(true);
        console.log('Chiamo handleStravaCallback con code:', code);
        const result = await handleStravaCallback(code);
        console.log('Risposta di successo dal backend:', result);
        setSuccessReceived(true);
        didFinish = true;
        clearTimeout(timeout);
        setStatus("success");
        setMessage("Account collegato con successo! Reindirizzamento...");
        setLoading(false);
        setTimeout(() => navigate("/"), 2000);
      } catch (error: any) {
        didFinish = true;
        clearTimeout(timeout);
        console.error("Auth error:", error);
        let errorMsg = error?.message || "";
        console.log('Messaggio di errore completo:', errorMsg);

        if (errorMsg.includes("Authorization code already used")) {
          // Mostra loading per 3 secondi, poi successo per 1 secondo, poi redirect
          setStatus("loading");
          setMessage("Codice già utilizzato, controllo lo stato...");
          setTimeout(() => {
            setStatus("success");
            setMessage("Codice già utilizzato, accesso effettuato! Reindirizzamento...");
            setSuccessReceived(true);
            setTimeout(() => navigate("/"), 1000);
          }, 3000);
          return;
        } else if (errorMsg.includes("AuthorizationCode") && errorMsg.includes("invalid")) {
          setStatus("error");
          setMessage("Il codice di autorizzazione Strava non è valido o è già stato usato. Per favore, effettua nuovamente il login.");
        } else {
          setStatus("error");
          setMessage("Errore durante la connessione. Riprova.");
        }
        setErrorDetails(errorMsg);
        setLoading(false);
      }
    };

    authenticate();
    return () => clearTimeout(timeout);
  }, [searchParams, navigate]);

  const getIcon = () => {
    switch (status) {
      case 'loading':
        return <Loader2 className="h-8 w-8 animate-spin text-blue-600" />;
      case 'success':
        return <CheckCircle className="h-8 w-8 text-green-600" />;
      case 'error':
        return <XCircle className="h-8 w-8 text-red-600" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <Card className="w-full max-w-md bg-gradient-card shadow-glow border-0">
          <CardHeader className="text-center">
            <div className="mx-auto mb-6">
              <div className="relative">
                <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center shadow-glow">
                  <Loader2 className="h-8 w-8 animate-spin text-white" />
                </div>
                <div className="absolute -inset-2 bg-gradient-primary/20 rounded-full animate-pulse"></div>
              </div>
            </div>
            <CardTitle className="text-xl font-semibold text-foreground">
              Connessione in corso...
            </CardTitle>
            <CardDescription className="text-base">
              Stiamo collegando il tuo account Strava
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center pb-8">
            <div className="space-y-4">
              <div className="flex justify-center space-x-2">
                <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
              <p className="text-sm text-muted-foreground">
                Attendere prego, questo potrebbe richiedere alcuni secondi
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4">
            {getIcon()}
          </div>
          <CardTitle>Autenticazione Strava</CardTitle>
          <CardDescription>
            {message}
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          {status === 'loading' && (
            <div>
              <p className="text-sm text-muted-foreground mb-2">
                Attendere prego, stiamo autenticando con Strava...
              </p>
              <div className="flex justify-center">
                <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
              </div>
            </div>
          )}
          {status === 'error' && (
            <div>
              <button
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                onClick={() => window.location.reload()}
              >
                Riprova
              </button>
              {errorDetails && (
                <div className="mt-2 text-xs text-red-400">
                  Dettagli: {errorDetails}
                </div>
              )}
            </div>
          )}
          {status === 'success' && (
            <div>
              <button
                className="mt-4 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
                onClick={() => navigate('/')}
              >
                Vai alla home
              </button>
              <div className="mt-2 text-xs text-green-600">
                Verrai reindirizzato automaticamente...
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AuthCallback;