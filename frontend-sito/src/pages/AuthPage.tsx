import { useState, useMemo } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Eye, EyeOff, LogIn, Mail, Lock, User, Calendar, Shield, Check, X, ChevronDown } from 'lucide-react';

const PASSWORD_RULES = [
  { label: "Almeno 8 caratteri", test: (p: string) => p.length >= 8 },
  { label: "Una lettera maiuscola", test: (p: string) => /[A-Z]/.test(p) },
  { label: "Un numero", test: (p: string) => /\d/.test(p) },
  { label: "Un simbolo (!@#$...)", test: (p: string) => /[^a-zA-Z0-9]/.test(p) },
];

function getPasswordStrength(password: string): { score: number; label: string; color: string } {
  const passed = PASSWORD_RULES.filter(r => r.test(password)).length;
  if (passed <= 1) return { score: 25, label: "Debole", color: "bg-destructive" };
  if (passed === 2) return { score: 50, label: "Discreta", color: "bg-yellow-500" };
  if (passed === 3) return { score: 75, label: "Buona", color: "bg-blue-500" };
  return { score: 100, label: "Forte", color: "bg-green-500" };
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isValidUsername(u: string): boolean {
  return /^[a-zA-Z0-9_]{3,20}$/.test(u);
}

const AuthPage = () => {
  const [searchParams] = useSearchParams();
  const [mode, setMode] = useState<'login' | 'register' | 'forgot'>(
    searchParams.get('mode') === 'register' ? 'register' : 'login'
  );
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [username, setUsername] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [birthday, setBirthday] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [privacyPublic, setPrivacyPublic] = useState(false);
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();

  const emailValid = email.length === 0 || isValidEmail(email);
  const usernameValid = username.length === 0 || isValidUsername(username);
  const passwordStrength = useMemo(() => getPasswordStrength(password), [password]);
  const passwordsMatch = confirmPassword.length === 0 || password === confirmPassword;

  const canRegister = isValidEmail(email) && isValidUsername(username) && passwordStrength.score >= 75 && password === confirmPassword && acceptTerms && birthday.length > 0;
  const canLogin = isValidEmail(email) && password.length >= 1;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    if (mode === 'forgot') {
      // Simulate password reset
      if (!isValidEmail(email)) { setError('Email non valida'); setLoading(false); return; }
      setSuccess('Se l\'email è registrata, riceverai un link per reimpostare la password.');
      setLoading(false);
      return;
    }

    if (mode === 'register') {
      if (!canRegister) { setError('Compila tutti i campi correttamente'); setLoading(false); return; }
      const { error } = await signUp(email, password, username.trim());
      if (error) { setError(error); } else {
        setSuccess('Registrazione completata! Controlla la tua email per confermare.');
      }
    } else {
      if (!canLogin) { setError('Inserisci email e password'); setLoading(false); return; }
      if (rememberMe) localStorage.setItem('anistream-remember', 'true');
      const { error } = await signIn(email, password);
      if (error) { setError(error); } else { navigate('/'); }
    }
    setLoading(false);
  };

  const handleSocialLogin = (provider: string) => {
    // Placeholder for social login
    setError(`Login con ${provider} sarà disponibile quando configurato sul server.`);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        <Link to="/" className="block text-center mb-6">
          <span className="text-3xl font-display font-bold text-gradient-primary">AniStream</span>
        </Link>

        <div className="gradient-card rounded-2xl border border-border p-6 sm:p-8">
          {/* Mode tabs */}
          {mode !== 'forgot' && (
            <div className="flex mb-6 bg-secondary rounded-lg p-1">
              <button onClick={() => { setMode('login'); setError(''); setSuccess(''); }} className={`flex-1 py-2 rounded-md text-sm font-medium transition-all ${mode === 'login' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}>
                Accedi
              </button>
              <button onClick={() => { setMode('register'); setError(''); setSuccess(''); }} className={`flex-1 py-2 rounded-md text-sm font-medium transition-all ${mode === 'register' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}>
                Registrati
              </button>
            </div>
          )}

          {mode === 'forgot' && (
            <div className="mb-6">
              <button onClick={() => setMode('login')} className="text-xs text-primary hover:underline mb-2">← Torna al login</button>
              <h2 className="text-lg font-display font-bold text-foreground">Recupera password</h2>
              <p className="text-xs text-muted-foreground mt-1">Inserisci la tua email per ricevere un link di reset.</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Username (register only) */}
            {mode === 'register' && (
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">Nome utente</label>
                <div className="relative">
                  <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input type="text" value={username} onChange={(e) => setUsername(e.target.value)}
                    className={`w-full bg-secondary text-foreground pl-9 pr-4 py-2.5 rounded-lg border focus:outline-none text-sm ${!usernameValid ? 'border-destructive' : 'border-border focus:border-primary'}`}
                    placeholder="3-20 caratteri alfanumerici" required maxLength={20} />
                </div>
                {username.length > 0 && !usernameValid && (
                  <p className="text-destructive text-[10px] mt-1">Solo lettere, numeri e _ (3-20 caratteri)</p>
                )}
              </div>
            )}

            {/* Email */}
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1.5">Email</label>
              <div className="relative">
                <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                  className={`w-full bg-secondary text-foreground pl-9 pr-4 py-2.5 rounded-lg border focus:outline-none text-sm ${email.length > 0 && !emailValid ? 'border-destructive' : 'border-border focus:border-primary'}`}
                  placeholder="la-tua@email.com" required />
              </div>
              {email.length > 0 && !emailValid && (
                <p className="text-destructive text-[10px] mt-1">Email non valida</p>
              )}
            </div>

            {/* Password */}
            {mode !== 'forgot' && (
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">Password</label>
                <div className="relative">
                  <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input type={showPw ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-secondary text-foreground pl-9 pr-10 py-2.5 rounded-lg border border-border focus:border-primary focus:outline-none text-sm"
                    placeholder="••••••••" required minLength={mode === 'register' ? 8 : 1} />
                  <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                    {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>

                {/* Password strength meter (register only) */}
                {mode === 'register' && password.length > 0 && (
                  <div className="mt-2 space-y-1.5">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-secondary rounded-full overflow-hidden">
                        <div className={`h-full ${passwordStrength.color} rounded-full transition-all`} style={{ width: `${passwordStrength.score}%` }} />
                      </div>
                      <span className="text-[10px] text-muted-foreground">{passwordStrength.label}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-1">
                      {PASSWORD_RULES.map((rule, i) => (
                        <div key={i} className={`flex items-center gap-1 text-[10px] ${rule.test(password) ? 'text-green-400' : 'text-muted-foreground'}`}>
                          {rule.test(password) ? <Check size={10} /> : <X size={10} />}
                          {rule.label}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Confirm Password (register only) */}
            {mode === 'register' && (
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">Conferma password</label>
                <div className="relative">
                  <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input type={showConfirmPw ? 'text' : 'password'} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                    className={`w-full bg-secondary text-foreground pl-9 pr-10 py-2.5 rounded-lg border focus:outline-none text-sm ${!passwordsMatch ? 'border-destructive' : 'border-border focus:border-primary'}`}
                    placeholder="••••••••" required />
                  <button type="button" onClick={() => setShowConfirmPw(!showConfirmPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                    {showConfirmPw ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
                {!passwordsMatch && <p className="text-destructive text-[10px] mt-1">Le password non corrispondono</p>}
              </div>
            )}

            {/* Birthday (register only) */}
            {mode === 'register' && (
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">Data di nascita</label>
                <div className="relative">
                  <Calendar size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input type="date" value={birthday} onChange={(e) => setBirthday(e.target.value)}
                    className="w-full bg-secondary text-foreground pl-9 pr-4 py-2.5 rounded-lg border border-border focus:border-primary focus:outline-none text-sm"
                    max={new Date().toISOString().split('T')[0]} required />
                </div>
                <p className="text-[10px] text-muted-foreground mt-1">Per il rating dei contenuti</p>
              </div>
            )}

            {/* Privacy option (register) */}
            {mode === 'register' && (
              <div className="flex items-center gap-2">
                <button type="button" onClick={() => setPrivacyPublic(!privacyPublic)}
                  className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 transition-colors ${privacyPublic ? 'bg-primary border-primary' : 'border-border'}`}>
                  {privacyPublic && <Check size={10} className="text-primary-foreground" />}
                </button>
                <span className="text-xs text-muted-foreground">Profilo pubblico (puoi cambiarlo dopo)</span>
              </div>
            )}

            {/* Terms (register) */}
            {mode === 'register' && (
              <div className="flex items-start gap-2">
                <button type="button" onClick={() => setAcceptTerms(!acceptTerms)}
                  className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors ${acceptTerms ? 'bg-primary border-primary' : 'border-border'}`}>
                  {acceptTerms && <Check size={10} className="text-primary-foreground" />}
                </button>
                <span className="text-xs text-muted-foreground">
                  Accetto i <button type="button" className="text-primary hover:underline">Termini e Condizioni</button> e la <button type="button" className="text-primary hover:underline">Privacy Policy</button>
                </span>
              </div>
            )}

            {/* Remember me / Forgot password (login) */}
            {mode === 'login' && (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <button type="button" onClick={() => setRememberMe(!rememberMe)}
                    className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 transition-colors ${rememberMe ? 'bg-primary border-primary' : 'border-border'}`}>
                    {rememberMe && <Check size={10} className="text-primary-foreground" />}
                  </button>
                  <span className="text-xs text-muted-foreground">Ricordami</span>
                </div>
                <button type="button" onClick={() => { setMode('forgot'); setError(''); setSuccess(''); }} className="text-xs text-primary hover:underline">
                  Password dimenticata?
                </button>
              </div>
            )}

            {error && <p className="text-destructive text-xs bg-destructive/10 rounded-lg px-3 py-2">{error}</p>}
            {success && <p className="text-green-400 text-xs bg-green-400/10 rounded-lg px-3 py-2">{success}</p>}

            <button type="submit" disabled={loading || (mode === 'register' && !canRegister) || (mode === 'login' && !canLogin)}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-2.5 rounded-lg transition-colors text-sm flex items-center justify-center gap-2 disabled:opacity-50">
              <LogIn size={16} />
              {loading ? 'Caricamento...' : mode === 'login' ? 'Accedi' : mode === 'register' ? 'Registrati' : 'Invia link'}
            </button>
          </form>

          {/* Social login (login mode) */}
          {mode === 'login' && (
            <div className="mt-6">
              <div className="relative mb-4">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border" /></div>
                <div className="relative flex justify-center"><span className="bg-card px-3 text-xs text-muted-foreground">oppure</span></div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button onClick={() => handleSocialLogin('Google')} className="flex items-center justify-center gap-2 bg-secondary hover:bg-secondary/80 text-foreground py-2.5 rounded-lg text-sm font-medium transition-colors border border-border">
                  <svg className="w-4 h-4" viewBox="0 0 24 24"><path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/><path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
                  Google
                </button>
                <button onClick={() => handleSocialLogin('Facebook')} className="flex items-center justify-center gap-2 bg-secondary hover:bg-secondary/80 text-foreground py-2.5 rounded-lg text-sm font-medium transition-colors border border-border">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                  Facebook
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
