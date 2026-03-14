import { useState } from 'react';
import { useProfile, AVATAR_OPTIONS } from '@/hooks/useProfile';
import { Plus, Trash2 } from 'lucide-react';
import type { ReactNode } from 'react';

interface AccountGateProps {
  children: ReactNode;
}

const AccountGate = ({ children }: AccountGateProps) => {
  const { profiles, activeProfile, selectProfile, createProfile, deleteProfile } = useProfile();
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState(AVATAR_OPTIONS[0].url);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  if (activeProfile) {
    return <>{children}</>;
  }

  const handleCreate = () => {
    if (newName.trim().length < 2) return;
    createProfile(newName, selectedAvatar);
    setNewName('');
    setCreating(false);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="text-center max-w-lg w-full">
        <h1 className="text-3xl sm:text-4xl font-display font-bold text-gradient-primary mb-2">AniStream</h1>
        <p className="text-muted-foreground text-sm mb-8">Chi sta guardando?</p>

        {!creating ? (
          <>
            <div className="flex flex-wrap justify-center gap-4 sm:gap-6 mb-8">
              {profiles.map((profile) => (
                <div key={profile.id} className="relative group">
                  <button
                    onClick={() => selectProfile(profile.id)}
                    className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-secondary/60 transition-all focus:outline-none focus:ring-2 focus:ring-primary/50"
                  >
                    <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden border-2 border-border hover:border-primary/50 transition-colors bg-secondary">
                      <img src={profile.avatar} alt={profile.name} className="w-full h-full object-cover" />
                    </div>
                    <span className="text-sm font-medium text-foreground max-w-[80px] truncate">{profile.name}</span>
                  </button>
                  <button
                    onClick={() => setConfirmDelete(profile.id)}
                    className="absolute -top-1 -right-1 opacity-0 group-hover:opacity-100 transition-opacity bg-destructive text-destructive-foreground rounded-full p-1"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              ))}

              {profiles.length < 6 && (
                <button
                  onClick={() => setCreating(true)}
                  className="flex flex-col items-center gap-2 p-3"
                >
                  <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl border-2 border-dashed border-border hover:border-primary/50 transition-colors flex items-center justify-center text-muted-foreground hover:text-primary">
                    <Plus size={28} />
                  </div>
                  <span className="text-sm font-medium text-muted-foreground">Aggiungi</span>
                </button>
              )}
            </div>

            {profiles.length === 0 && (
              <p className="text-muted-foreground text-xs">Crea un profilo per iniziare a guardare</p>
            )}
          </>
        ) : (
          <div className="gradient-card rounded-2xl border border-border p-6 sm:p-8 max-w-md mx-auto animate-fade-in">
            <h2 className="text-lg font-display font-bold text-foreground mb-4">Nuovo profilo</h2>

            <div className="mb-5">
              <label className="block text-xs font-medium text-muted-foreground mb-2">Scegli il tuo personaggio</label>
              <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 justify-center">
                {AVATAR_OPTIONS.map((char) => (
                  <button
                    key={char.name}
                    onClick={() => setSelectedAvatar(char.url)}
                    className={`relative rounded-xl overflow-hidden aspect-square transition-all ${
                      selectedAvatar === char.url
                        ? 'ring-2 ring-primary ring-offset-2 ring-offset-background scale-105'
                        : 'opacity-70 hover:opacity-100 border-2 border-transparent hover:border-border'
                    }`}
                    title={char.name}
                  >
                    <img src={char.url} alt={char.name} className="w-full h-full object-cover" />
                    {selectedAvatar === char.url && (
                      <div className="absolute bottom-0 left-0 right-0 bg-primary/90 text-primary-foreground text-[9px] font-medium py-0.5 text-center">
                        {char.name}
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-5">
              <label className="block text-xs font-medium text-muted-foreground mb-1.5">Nome</label>
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="w-full bg-secondary text-foreground px-4 py-2.5 rounded-lg border border-border focus:border-primary focus:outline-none text-sm"
                placeholder="Es. Marco, Papà, Mamma..."
                maxLength={20}
                autoFocus
                onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleCreate}
                disabled={newName.trim().length < 2}
                className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-2.5 rounded-lg transition-colors text-sm disabled:opacity-50"
              >
                Crea profilo
              </button>
              <button
                onClick={() => { setCreating(false); setNewName(''); }}
                className="px-4 py-2.5 bg-secondary hover:bg-secondary/80 text-secondary-foreground rounded-lg transition-colors text-sm"
              >
                Annulla
              </button>
            </div>
          </div>
        )}

        {confirmDelete && (
          <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center px-4" onClick={() => setConfirmDelete(null)}>
            <div className="bg-card border border-border rounded-2xl p-6 max-w-xs w-full shadow-2xl animate-fade-in" onClick={(e) => e.stopPropagation()}>
              <p className="text-sm text-foreground mb-4">Eliminare questo profilo?</p>
              <div className="flex gap-2">
                <button
                  onClick={() => { deleteProfile(confirmDelete); setConfirmDelete(null); }}
                  className="flex-1 bg-destructive text-destructive-foreground font-medium py-2 rounded-lg text-sm"
                >
                  Elimina
                </button>
                <button
                  onClick={() => setConfirmDelete(null)}
                  className="flex-1 bg-secondary text-secondary-foreground font-medium py-2 rounded-lg text-sm"
                >
                  Annulla
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AccountGate;
