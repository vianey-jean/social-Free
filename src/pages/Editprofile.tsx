import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import axios from "axios";

const API_URL = window.location.hostname === 'localhost' 
  ? "http://localhost:3001/api" 
  : "https://liberte-backend.herokuapp.com/api";

interface ProfileData {
  firstName: string;
  lastName: string;
  location: string;
  relationship: string;
  lookingFor: string;
  bio: string;
  avatar?: string | File;
}

const EditProfile = () => {
  const { user, isAuthenticated, loading, setUser } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [profileData, setProfileData] = useState<ProfileData>({
    firstName: "",
    lastName: "",
    location: "",
    relationship: "",
    lookingFor: "",
    bio: ""
  });
  
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate("/login");
      return;
    }
    
    if (user) {
      setProfileData({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        location: user.location || "",
        relationship: user.relationship || "",
        lookingFor: user.lookingFor || "",
        bio: user.bio || ""
      });
      
      if (user.avatar) {
        setAvatarPreview(user.avatar);
      }
    }
  }, [isAuthenticated, loading, navigate, user]);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSelectChange = (name: string, value: string) => {
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      
      setProfileData(prev => ({
        ...prev,
        avatar: file
      }));
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isSubmitting) return;
    
    try {
      setIsSubmitting(true);
      
      const formData = new FormData();
      formData.append("firstName", profileData.firstName);
      formData.append("lastName", profileData.lastName);
      formData.append("location", profileData.location);
      formData.append("relationship", profileData.relationship);
      formData.append("lookingFor", profileData.lookingFor);
      formData.append("bio", profileData.bio);
      
      if (profileData.avatar instanceof File) {
        formData.append("avatar", profileData.avatar);
      }
      
      const response = await axios.patch(`${API_URL}/users/profile`, formData, {
        withCredentials: true,
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      if (response.data && response.data.user) {
        // Mettez à jour l'utilisateur dans le contexte après la modification
        setUser(response.data.user);
      }
      
      toast({
        title: "Profil mis à jour",
        description: "Vos informations ont été mises à jour avec succès.",
      });
      
      navigate("/profile/" + user?.id);
    } catch (error) {
      console.error("Failed to update profile:", error);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour votre profil.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-current border-e-transparent align-[-0.125em] text-liberte-primary"></div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      
      <div className="flex-1 p-6">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Modifier votre profil</CardTitle>
            </CardHeader>
            
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="flex justify-center mb-6">
                  <div className="relative">
                    <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-200">
                      {avatarPreview ? (
                        <img 
                          src={avatarPreview} 
                          alt="Avatar preview" 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-liberte-primary text-white text-4xl font-bold">
                          {profileData.firstName ? profileData.firstName.charAt(0) : "U"}
                        </div>
                      )}
                    </div>
                    
                    <Label 
                      htmlFor="avatar" 
                      className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-gray-100 border flex items-center justify-center cursor-pointer hover:bg-gray-200"
                    >
                      +
                    </Label>
                    <Input 
                      id="avatar" 
                      type="file" 
                      accept="image/*" 
                      className="hidden" 
                      onChange={handleAvatarChange} 
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">Prénom</Label>
                    <Input
                      id="firstName"
                      name="firstName"
                      value={profileData.firstName}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Nom</Label>
                    <Input
                      id="lastName"
                      name="lastName"
                      value={profileData.lastName}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="location">Lieu d'habitation</Label>
                  <Input
                    id="location"
                    name="location"
                    value={profileData.location}
                    onChange={handleInputChange}
                    placeholder="Ex: Paris, France"
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="relationship">Situation amoureuse</Label>
                    <Select 
                      value={profileData.relationship} 
                      onValueChange={(value) => handleSelectChange("relationship", value)}
                    >
                      <SelectTrigger id="relationship">
                        <SelectValue placeholder="Sélectionner" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="single">Célibataire</SelectItem>
                        <SelectItem value="relationship">En couple</SelectItem>
                        <SelectItem value="engaged">Fiancé(e)</SelectItem>
                        <SelectItem value="married">Marié(e)</SelectItem>
                        <SelectItem value="complicated">C'est compliqué</SelectItem>
                        <SelectItem value="open">Ne préfère pas dire</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="lookingFor">Ce que vous cherchez</Label>
                    <Select 
                      value={profileData.lookingFor} 
                      onValueChange={(value) => handleSelectChange("lookingFor", value)}
                    >
                      <SelectTrigger id="lookingFor">
                        <SelectValue placeholder="Sélectionner" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="friendship">Amitié</SelectItem>
                        <SelectItem value="dating">Rencontres</SelectItem>
                        <SelectItem value="relationship">Relation sérieuse</SelectItem>
                        <SelectItem value="networking">Réseau professionnel</SelectItem>
                        <SelectItem value="nothing">Rien de spécial</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="bio">Biographie</Label>
                  <Textarea
                    id="bio"
                    name="bio"
                    value={profileData.bio}
                    onChange={handleInputChange}
                    placeholder="Parlez un peu de vous..."
                    rows={4}
                  />
                </div>
                
                <div className="flex justify-end gap-2">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => navigate(`/profile/${user?.id}`)}
                  >
                    Annuler
                  </Button>
                  
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <span className="mr-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-solid border-current border-r-transparent align-[-0.125em]"></span>
                        Enregistrement...
                      </>
                    ) : "Enregistrer"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default EditProfile;
