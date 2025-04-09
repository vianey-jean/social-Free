// Importation de React et du hook useState
import React, { useState } from "react";

// Importation du contexte d'authentification
import { useAuth } from "@/contexts/AuthContext";

// Importation des composants d'onglets (Tabs)
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Importation des composants de carte (Card)
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

// Importation du composant de bouton
import { Button } from "@/components/ui/button";

// Importation du commutateur (Switch)
import { Switch } from "@/components/ui/switch";

// Importation du composant de label
import { Label } from "@/components/ui/label";

// Importation de l’icône de chargement
import { Loader2 } from "lucide-react";

// Importation du hook pour afficher des toasts (notifications)
import { useToast } from "@/hooks/use-toast";

const SettingsPage = () => {
  // Récupère l'utilisateur et le statut d'authentification via le contexte
  const { user, isAuthenticated } = useAuth();

  // Initialisation du hook pour afficher des notifications/toasts
  const { toast } = useToast();

  // État local pour les préférences de notification
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    messageNotifications: true,
    friendRequestNotifications: true
  });

  // État local pour les paramètres de confidentialité
  const [privacySettings, setPrivacySettings] = useState({
    profilePublic: true,
    showOnlineStatus: true,
    allowMessaging: true
  });

  // État indiquant si une sauvegarde est en cours
  const [isSaving, setIsSaving] = useState(false);

  // Si l'utilisateur n'est pas authentifié, on affiche un message
  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-lg">Veuillez vous connecter pour accéder aux paramètres.</p>
      </div>
    );
  }

  // Fonction de simulation de sauvegarde des notifications
  const handleSaveNotifications = async () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      toast({
        title: "Paramètres enregistrés",
        description: "Vos paramètres de notification ont été mis à jour",
      });
    }, 1000);
  };

  // Fonction de simulation de sauvegarde des paramètres de confidentialité
  const handleSavePrivacy = async () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      toast({
        title: "Paramètres enregistrés",
        description: "Vos paramètres de confidentialité ont été mis à jour",
      });
    }, 1000);
  };

  // Bascule une option de notification spécifique
  const handleToggleNotification = (key: keyof typeof notificationSettings) => {
    setNotificationSettings(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  // Bascule une option de confidentialité spécifique
  const handleTogglePrivacy = (key: keyof typeof privacySettings) => {
    setPrivacySettings(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  // Affichage de la page
  return (
    <div className="container mx-auto py-6 max-w-4xl">
      {/* Titre principal */}
      <h1 className="text-2xl font-bold mb-6">Paramètres</h1>
      
      {/* Composant d'onglets */}
      <Tabs defaultValue="account" className="w-full">
        {/* Liste des onglets */}
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="account">Compte</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="privacy">Confidentialité</TabsTrigger>
        </TabsList>
        
        {/* Onglet Compte */}
        <TabsContent value="account">
          <Card>
            <CardHeader>
              <CardTitle>Informations du compte</CardTitle>
              <CardDescription>
                Gérez les informations de votre compte et vos préférences.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Informations utilisateur */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Nom complet</Label>
                  <div className="text-lg font-medium mt-1">{user?.firstName} {user?.lastName}</div>
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <div className="text-lg font-medium mt-1">{user?.email}</div>
                </div>
              </div>
              
              {/* Lien vers la page de modification du profil */}
              <div className="mt-6">
                <Button asChild>
                  <a href="/edit-profile">Modifier mon profil</a>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Onglet Notifications */}
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Préférences de notification</CardTitle>
              <CardDescription>
                Configurez comment et quand vous souhaitez être notifié.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Switch pour chaque type de notification */}
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="email-notifications">Notifications par email</Label>
                  <p className="text-sm text-gray-500">Recevez les mises à jour et notifications par email.</p>
                </div>
                <Switch 
                  id="email-notifications" 
                  checked={notificationSettings.emailNotifications}
                  onCheckedChange={() => handleToggleNotification('emailNotifications')}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="message-notifications">Notifications de messages</Label>
                  <p className="text-sm text-gray-500">Soyez notifié quand vous recevez de nouveaux messages.</p>
                </div>
                <Switch 
                  id="message-notifications" 
                  checked={notificationSettings.messageNotifications}
                  onCheckedChange={() => handleToggleNotification('messageNotifications')}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="friend-request-notifications">Notifications de demande d'ami</Label>
                  <p className="text-sm text-gray-500">Soyez notifié des nouvelles demandes d'ami.</p>
                </div>
                <Switch 
                  id="friend-request-notifications" 
                  checked={notificationSettings.friendRequestNotifications}
                  onCheckedChange={() => handleToggleNotification('friendRequestNotifications')}
                />
              </div>
              
              {/* Bouton pour sauvegarder les préférences */}
              <div className="pt-4">
                <Button onClick={handleSaveNotifications} disabled={isSaving}>
                  {isSaving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Enregistrement...
                    </>
                  ) : (
                    "Enregistrer les préférences"
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Onglet Confidentialité */}
        <TabsContent value="privacy">
          <Card>
            <CardHeader>
              <CardTitle>Paramètres de confidentialité</CardTitle>
              <CardDescription>
                Gérez qui peut voir vos informations et comment interagir avec vous.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Switch pour chaque préférence de confidentialité */}
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="profile-public">Profil public</Label>
                  <p className="text-sm text-gray-500">Permettre aux utilisateurs non-amis de voir votre profil.</p>
                </div>
                <Switch 
                  id="profile-public" 
                  checked={privacySettings.profilePublic}
                  onCheckedChange={() => handleTogglePrivacy('profilePublic')}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="show-online">Afficher le statut en ligne</Label>
                  <p className="text-sm text-gray-500">Montrer aux autres quand vous êtes en ligne.</p>
                </div>
                <Switch 
                  id="show-online" 
                  checked={privacySettings.showOnlineStatus}
                  onCheckedChange={() => handleTogglePrivacy('showOnlineStatus')}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="allow-messaging">Autoriser les messages</Label>
                  <p className="text-sm text-gray-500">Autoriser les utilisateurs non-amis à vous envoyer des messages.</p>
                </div>
                <Switch 
                  id="allow-messaging" 
                  checked={privacySettings.allowMessaging}
                  onCheckedChange={() => handleTogglePrivacy('allowMessaging')}
                />
              </div>
              
              {/* Bouton pour sauvegarder les paramètres de confidentialité */}
              <div className="pt-4">
                <Button onClick={handleSavePrivacy} disabled={isSaving}>
                  {isSaving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Enregistrement...
                    </>
                  ) : (
                    "Enregistrer les paramètres"
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

// Exportation du composant SettingsPage
export default SettingsPage;
