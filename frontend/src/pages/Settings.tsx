import { useState, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiService } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { UserAvatar } from '@/components/UserAvatar';
import { 
  User, 
  Camera, 
  Settings as SettingsIcon, 
  Bell, 
  Shield, 
  Palette,
  Globe,
  Activity,
  Download,
  Trash2,
  Save,
  X
} from 'lucide-react';

export default function Settings() {
  const { user, userId } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  
  // Stato per le impostazioni
  const [settings, setSettings] = useState({
    notifications: {
      email: true,
      push: false,
      weeklyReport: true,
      achievements: true,
    },
    privacy: {
      profilePublic: false,
      showStats: true,
      showActivities: true,
    },
    display: {
      theme: 'system',
      units: 'metric',
      language: 'it',
    },
    sync: {
      autoSync: true,
      syncInterval: 'daily',
    }
  });

  // Mutation per aggiornare la foto profilo
  const updateProfileImageMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('profile_image', file);
      return await apiService.updateProfileImage(userId!, formData);
    },
    onSuccess: () => {
      toast({
        title: "Foto profilo aggiornata",
        description: "La tua foto profilo è stata aggiornata con successo.",
      });
      queryClient.invalidateQueries({ queryKey: ['user', userId] });
      setProfileImage(null);
      setPreviewUrl(null);
    },
    onError: (error) => {
      toast({
        title: "Errore",
        description: "Impossibile aggiornare la foto profilo. Riprova più tardi.",
        variant: "destructive",
      });
    }
  });

  // Mutation per aggiornare le impostazioni
  const updateSettingsMutation = useMutation({
    mutationFn: async (newSettings: typeof settings) => {
      return await apiService.updateUserSettings(userId!, newSettings);
    },
    onSuccess: () => {
      toast({
        title: "Impostazioni salvate",
        description: "Le tue impostazioni sono state salvate con successo.",
      });
    },
    onError: (error) => {
      toast({
        title: "Errore",
        description: "Impossibile salvare le impostazioni. Riprova più tardi.",
        variant: "destructive",
      });
    }
  });



  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validazione del file
      if (file.size > 5 * 1024 * 1024) { // 5MB
        toast({
          title: "File troppo grande",
          description: "La dimensione del file non può superare 5MB.",
          variant: "destructive",
        });
        return;
      }

      if (!file.type.startsWith('image/')) {
        toast({
          title: "Tipo di file non valido",
          description: "Seleziona solo file immagine (JPG, PNG, etc.).",
          variant: "destructive",
        });
        return;
      }

      setProfileImage(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleUploadImage = async () => {
    if (!profileImage) return;
    
    setIsUploading(true);
    try {
      await updateProfileImageMutation.mutateAsync(profileImage);
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveImage = () => {
    setProfileImage(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSettingChange = (category: keyof typeof settings, key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value
      }
    }));
  };

  const handleSaveSettings = () => {
    updateSettingsMutation.mutate(settings);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
          <SettingsIcon className="h-8 w-8" />
          Impostazioni
        </h1>
        <p className="text-muted-foreground">
          Gestisci il tuo profilo e le preferenze dell'applicazione
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Colonna principale */}
        <div className="lg:col-span-2 space-y-6">
          {/* Profilo */}
          <Card className="bg-gradient-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Profilo
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                             {/* Foto profilo */}
               <div className="flex items-center gap-6">
                 <div className="relative">
                   <UserAvatar user={user} size="xl" className="h-24 w-24" previewUrl={previewUrl} showBadge={true} />
                   {previewUrl && (
                     <Button
                       size="sm"
                       variant="destructive"
                       className="absolute -top-2 -right-2 h-6 w-6 p-0 rounded-full"
                       onClick={handleRemoveImage}
                     >
                       <X className="h-3 w-3" />
                     </Button>
                   )}
                 </div>
                 
                 <div className="space-y-3">
                   <div>
                     <Label htmlFor="profile-image" className="text-sm font-medium">
                       Foto profilo
                     </Label>
                     <p className="text-xs text-muted-foreground mb-2">
                       JPG, PNG fino a 5MB
                     </p>
                     <div className="flex gap-2">
                       <Button
                         variant="outline"
                         size="sm"
                         onClick={() => fileInputRef.current?.click()}
                         disabled={isUploading}
                       >
                         <Camera className="h-4 w-4 mr-2" />
                         Scegli immagine
                       </Button>
                       {profileImage && (
                         <Button
                           size="sm"
                           onClick={handleUploadImage}
                           disabled={isUploading}
                         >
                           {isUploading ? (
                             <>Caricamento...</>
                           ) : (
                             <>
                               <Save className="h-4 w-4 mr-2" />
                               Salva
                             </>
                           )}
                         </Button>
                       )}
                     </div>
                     <input
                       ref={fileInputRef}
                       id="profile-image"
                       type="file"
                       accept="image/*"
                       onChange={handleImageSelect}
                       className="hidden"
                     />
                   </div>
                   
                   {user?.strava_profile_url && (
                     <div className="pt-2 border-t">
                       <p className="text-xs text-muted-foreground mb-2">
                         Avatar Strava disponibile
                       </p>
                       <div className="flex items-center gap-2">
                         <UserAvatar user={user} size="sm" />
                         <span className="text-sm text-muted-foreground">
                           Usato come fallback se non hai caricato una foto
                         </span>
                       </div>
                       <Button
                         variant="outline"
                         size="sm"
                         onClick={() => refreshStravaAvatarMutation.mutate()}
                         disabled={refreshStravaAvatarMutation.isPending}
                         className="mt-2"
                       >
                         {refreshStravaAvatarMutation.isPending ? (
                           <>Aggiornamento...</>
                         ) : (
                           <>
                             <Activity className="h-4 w-4 mr-2" />
                             Aggiorna da Strava
                           </>
                         )}
                       </Button>
                     </div>
                   )}
                 </div>
               </div>

              <Separator />

              {/* Informazioni utente */}
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="first-name">Nome</Label>
                  <Input
                    id="first-name"
                    value={user?.first_name || ''}
                    disabled
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="last-name">Cognome</Label>
                  <Input
                    id="last-name"
                    value={user?.last_name || ''}
                    disabled
                    className="mt-1"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Badge variant="secondary">
                  <Activity className="h-3 w-3 mr-1" />
                  Connesso a Strava
                </Badge>
                <span className="text-sm text-muted-foreground">
                  ID: {user?.strava_id}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Notifiche */}
          <Card className="bg-gradient-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notifiche
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="email-notifications">Notifiche email</Label>
                  <p className="text-sm text-muted-foreground">
                    Ricevi aggiornamenti via email
                  </p>
                </div>
                <Switch
                  id="email-notifications"
                  checked={settings.notifications.email}
                  onCheckedChange={(checked) => 
                    handleSettingChange('notifications', 'email', checked)
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="push-notifications">Notifiche push</Label>
                  <p className="text-sm text-muted-foreground">
                    Notifiche in tempo reale
                  </p>
                </div>
                <Switch
                  id="push-notifications"
                  checked={settings.notifications.push}
                  onCheckedChange={(checked) => 
                    handleSettingChange('notifications', 'push', checked)
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="weekly-report">Report settimanale</Label>
                  <p className="text-sm text-muted-foreground">
                    Riepilogo settimanale delle attività
                  </p>
                </div>
                <Switch
                  id="weekly-report"
                  checked={settings.notifications.weeklyReport}
                  onCheckedChange={(checked) => 
                    handleSettingChange('notifications', 'weeklyReport', checked)
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="achievements">Notifiche risultati</Label>
                  <p className="text-sm text-muted-foreground">
                    Avvisi per nuovi record e obiettivi
                  </p>
                </div>
                <Switch
                  id="achievements"
                  checked={settings.notifications.achievements}
                  onCheckedChange={(checked) => 
                    handleSettingChange('notifications', 'achievements', checked)
                  }
                />
              </div>
            </CardContent>
          </Card>

          {/* Privacy */}
          <Card className="bg-gradient-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Privacy
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="public-profile">Profilo pubblico</Label>
                  <p className="text-sm text-muted-foreground">
                    Rendi il tuo profilo visibile ad altri utenti
                  </p>
                </div>
                <Switch
                  id="public-profile"
                  checked={settings.privacy.profilePublic}
                  onCheckedChange={(checked) => 
                    handleSettingChange('privacy', 'profilePublic', checked)
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="show-stats">Mostra statistiche</Label>
                  <p className="text-sm text-muted-foreground">
                    Condividi le tue statistiche generali
                  </p>
                </div>
                <Switch
                  id="show-stats"
                  checked={settings.privacy.showStats}
                  onCheckedChange={(checked) => 
                    handleSettingChange('privacy', 'showStats', checked)
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="show-activities">Mostra attività</Label>
                  <p className="text-sm text-muted-foreground">
                    Condividi le tue attività con altri
                  </p>
                </div>
                <Switch
                  id="show-activities"
                  checked={settings.privacy.showActivities}
                  onCheckedChange={(checked) => 
                    handleSettingChange('privacy', 'showActivities', checked)
                  }
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Colonna laterale */}
        <div className="space-y-6">
          {/* Display */}
          <Card className="bg-gradient-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                Visualizzazione
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="theme">Tema</Label>
                <Select
                  value={settings.display.theme}
                  onValueChange={(value) => 
                    handleSettingChange('display', 'theme', value)
                  }
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Chiaro</SelectItem>
                    <SelectItem value="dark">Scuro</SelectItem>
                    <SelectItem value="system">Sistema</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="units">Unità di misura</Label>
                <Select
                  value={settings.display.units}
                  onValueChange={(value) => 
                    handleSettingChange('display', 'units', value)
                  }
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="metric">Metrico (km, m)</SelectItem>
                    <SelectItem value="imperial">Imperiale (mi, ft)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="language">Lingua</Label>
                <Select
                  value={settings.display.language}
                  onValueChange={(value) => 
                    handleSettingChange('display', 'language', value)
                  }
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="it">Italiano</SelectItem>
                    <SelectItem value="en">English</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Sincronizzazione */}
          <Card className="bg-gradient-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Download className="h-5 w-5" />
                Sincronizzazione
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="auto-sync">Sincronizzazione automatica</Label>
                  <p className="text-sm text-muted-foreground">
                    Sincronizza automaticamente con Strava
                  </p>
                </div>
                <Switch
                  id="auto-sync"
                  checked={settings.sync.autoSync}
                  onCheckedChange={(checked) => 
                    handleSettingChange('sync', 'autoSync', checked)
                  }
                />
              </div>

              <div>
                <Label htmlFor="sync-interval">Frequenza sincronizzazione</Label>
                <Select
                  value={settings.sync.syncInterval}
                  onValueChange={(value) => 
                    handleSettingChange('sync', 'syncInterval', value)
                  }
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hourly">Ogni ora</SelectItem>
                    <SelectItem value="daily">Giornaliera</SelectItem>
                    <SelectItem value="weekly">Settimanale</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Azioni */}
          <Card className="bg-gradient-card">
            <CardHeader>
              <CardTitle>Azioni</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button 
                onClick={handleSaveSettings}
                disabled={updateSettingsMutation.isPending}
                className="w-full"
              >
                {updateSettingsMutation.isPending ? (
                  <>Salvataggio...</>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Salva impostazioni
                  </>
                )}
              </Button>
              
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => {
                  // Logica per esportare i dati
                  toast({
                    title: "Esportazione dati",
                    description: "Funzionalità in sviluppo...",
                  });
                }}
              >
                <Download className="h-4 w-4 mr-2" />
                Esporta dati
              </Button>
              
              <Button 
                variant="destructive" 
                className="w-full"
                onClick={() => {
                  // Logica per eliminare account
                  toast({
                    title: "Elimina account",
                    description: "Funzionalità in sviluppo...",
                    variant: "destructive",
                  });
                }}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Elimina account
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 