import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { apiService } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
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
  const { user, userId, logout } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState('');
  
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

  // Query per caricare le impostazioni dal server
  const { data: serverSettings, isLoading: settingsLoading } = useQuery({
    queryKey: ['settings', userId],
    queryFn: () => apiService.getUserSettings(userId!),
    enabled: !!userId,
  });

  // Aggiorna le impostazioni locali quando arrivano dal server
  useEffect(() => {
    if (serverSettings) {
      setSettings(serverSettings);
    }
  }, [serverSettings]);

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

  // Mutation per aggiornare l'avatar di Strava
  const refreshStravaAvatarMutation = useMutation({
    mutationFn: () => apiService.refreshStravaAvatar(userId!),
    onSuccess: () => {
      toast({
        title: "Avatar aggiornato",
        description: "L'avatar di Strava è stato aggiornato con successo.",
      });
      queryClient.invalidateQueries({ queryKey: ['user', userId] });
    },
    onError: () => {
      toast({
        title: "Errore",
        description: "Impossibile aggiornare l'avatar di Strava.",
        variant: "destructive",
      });
    },
  });

  // Mutation per esportare i dati
  const exportDataMutation = useMutation({
    mutationFn: () => apiService.exportUserData(userId!),
    onSuccess: (blob) => {
      // Crea un link per il download e lo attiva
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `foxrun-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast({
        title: "Esportazione completata",
        description: "I tuoi dati sono stati esportati con successo.",
      });
    },
    onError: () => {
      toast({
        title: "Errore",
        description: "Impossibile esportare i dati.",
        variant: "destructive",
      });
    },
  });

  // Mutation per eliminare l'account
  const deleteAccountMutation = useMutation({
    mutationFn: (confirmation: string) => apiService.deleteAccount(userId!, confirmation),
    onSuccess: () => {
      toast({
        title: "Account eliminato",
        description: "Il tuo account è stato eliminato con successo.",
      });
      // Logout e redirect alla home
      logout();
      navigate('/');
    },
    onError: () => {
      toast({
        title: "Errore",
        description: "Impossibile eliminare l'account.",
        variant: "destructive",
      });
    },
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

  const handleExportData = () => {
    exportDataMutation.mutate();
  };

  const handleDeleteAccount = () => {
    if (deleteConfirmation === 'DELETE') {
      deleteAccountMutation.mutate(deleteConfirmation);
      setShowDeleteDialog(false);
    }
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
                onClick={handleExportData}
                disabled={exportDataMutation.isPending}
              >
                {exportDataMutation.isPending ? (
                  <>Esportazione...</>
                ) : (
                  <>
                    <Download className="h-4 w-4 mr-2" />
                    Esporta dati
                  </>
                )}
              </Button>
              
              <Button 
                variant="destructive" 
                className="w-full"
                onClick={() => setShowDeleteDialog(true)}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Elimina account
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Dialog di conferma eliminazione account */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Sei assolutamente sicuro?</AlertDialogTitle>
            <AlertDialogDescription className="space-y-3">
              <p>Questa azione eliminerà permanentemente il tuo account e tutti i dati associati, inclusi:</p>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>Tutte le attività sincronizzate</li>
                <li>Le impostazioni e preferenze</li>
                <li>La foto profilo</li>
              </ul>
              <p className="font-semibold text-destructive">Questa azione non può essere annullata.</p>
              <div className="pt-4">
                <Label htmlFor="delete-confirm">Digita DELETE per confermare</Label>
                <Input
                  id="delete-confirm"
                  value={deleteConfirmation}
                  onChange={(e) => setDeleteConfirmation(e.target.value)}
                  placeholder="DELETE"
                  className="mt-2"
                />
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteConfirmation('')}>
              Annulla
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteAccount}
              disabled={deleteConfirmation !== 'DELETE' || deleteAccountMutation.isPending}
              className="bg-destructive hover:bg-destructive/90"
            >
              {deleteAccountMutation.isPending ? 'Eliminazione...' : 'Elimina account'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
} 