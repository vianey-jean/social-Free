
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Camera, X } from "lucide-react";
import axios from "axios";
import { useAuth } from "@/contexts/AuthContext";

const API_URL = window.location.hostname === 'localhost' 
  ? "http://localhost:3001/api" 
  : "https://liberte-backend.herokuapp.com/api";

interface CreatePostFormProps {
  onPostCreated: () => void;
}

const CreatePostForm = ({ onPostCreated }: CreatePostFormProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [content, setContent] = useState("");
  const [isPrivate, setIsPrivate] = useState(false);
  const [images, setImages] = useState<string[]>([]);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleAddImage = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newImages: string[] = [];
      const newFiles: File[] = [];
      
      for (let i = 0; i < e.target.files.length; i++) {
        const file = e.target.files[i];
        newFiles.push(file);
        
        // Create a preview URL
        const reader = new FileReader();
        reader.onload = (event) => {
          if (event.target && event.target.result) {
            newImages.push(event.target.result as string);
            if (newImages.length === newFiles.length) {
              setImages([...images, ...newImages]);
            }
          }
        };
        reader.readAsDataURL(file);
      }
      
      setImageFiles([...imageFiles, ...newFiles]);
    }
  };
  
  const handleRemoveImage = (index: number) => {
    const newImages = [...images];
    const newFiles = [...imageFiles];
    newImages.splice(index, 1);
    newFiles.splice(index, 1);
    setImages(newImages);
    setImageFiles(newFiles);
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!content.trim()) {
      toast({
        title: "Contenu requis",
        description: "Veuillez saisir du contenu pour votre publication.",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Create the post data
      const formData = new FormData();
      formData.append("content", content);
      formData.append("isPrivate", String(isPrivate));
      
      // Add image files if any
      imageFiles.forEach((file) => {
        formData.append("images", file);
      });
      
      console.log("Submitting post with images:", imageFiles.length);
      
      // Log formData contents for debugging
      for (const pair of formData.entries()) {
        console.log(`${pair[0]}: ${pair[1]}`);
      }
      
      // Send the post data to the server
      const response = await axios.post(`${API_URL}/posts`, formData, {
        withCredentials: true,
        headers: {
          "Content-Type": "multipart/form-data",
        },
        timeout: 30000 // 30 second timeout for larger uploads
      });
      
      console.log("Post created successfully:", response.data);
      
      toast({
        title: "Publication créée",
        description: "Votre publication a été créée avec succès.",
      });
      
      // Reset form
      setContent("");
      setIsPrivate(false);
      setImages([]);
      setImageFiles([]);
      
      // Notify parent component
      onPostCreated();
    } catch (error: any) {
      console.error("Failed to create post:", error);
      
      // More detailed error message
      let errorMessage = "Impossible de créer votre publication. Veuillez réessayer.";
      if (error.response) {
        console.error("Server response data:", error.response.data);
        console.error("Server response status:", error.response.status);
        if (error.response.data && error.response.data.message) {
          errorMessage = error.response.data.message;
        }
      }
      
      toast({
        title: "Échec de création",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (!user) {
    return null;
  }
  
  return (
    <div className="bg-white rounded-lg shadow p-4">
      <form onSubmit={handleSubmit}>
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200">
            {user.avatar ? (
              <img 
                src={user.avatar} 
                alt={`${user.firstName}'s avatar`}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-liberte-primary text-white font-bold">
                {user.firstName.charAt(0)}
              </div>
            )}
          </div>
          <div>
            <p className="font-semibold">{user.firstName} {user.lastName}</p>
          </div>
        </div>
        
        <Textarea
          placeholder="Quoi de neuf?"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={3}
          className="mb-4 resize-none"
        />
        
        {images.length > 0 && (
          <div className="mb-4 grid grid-cols-3 gap-2">
            {images.map((image, index) => (
              <div key={index} className="relative rounded-md overflow-hidden h-24">
                <img 
                  src={image} 
                  alt={`Upload ${index + 1}`}
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveImage(index)}
                  className="absolute top-1 right-1 bg-gray-800 bg-opacity-70 rounded-full p-1 text-white"
                >
                  <X size={16} />
                </button>
              </div>
            ))}
          </div>
        )}
        
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <input
              type="file"
              accept="image/*"
              multiple
              ref={fileInputRef}
              onChange={handleImageChange}
              className="hidden"
            />
            <Button
              type="button"
              onClick={handleAddImage}
              variant="outline"
              size="sm"
              className="text-liberte-primary"
            >
              <Camera size={18} className="mr-2" />
              Ajouter une photo
            </Button>
          </div>
          
          <div className="flex items-center space-x-2">
            <Switch
              id="private-post"
              checked={isPrivate}
              onCheckedChange={setIsPrivate}
            />
            <Label htmlFor="private-post">Publication privée</Label>
          </div>
        </div>
        
        <Button
          type="submit"
          className="w-full"
          disabled={isSubmitting || !content.trim()}
        >
          {isSubmitting ? "Publication en cours..." : "Publier"}
        </Button>
      </form>
    </div>
  );
};

export default CreatePostForm;
