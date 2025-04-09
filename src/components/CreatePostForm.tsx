
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Image, X } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import axios from "axios";

const API_URL = "http://localhost:3001/api";

interface CreatePostFormProps {
  onPostCreated: () => void;
}

const CreatePostForm = ({ onPostCreated }: CreatePostFormProps) => {
  const { user } = useAuth();
  const [content, setContent] = useState("");
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviewUrls, setImagePreviewUrls] = useState<string[]>([]);
  const [isPrivate, setIsPrivate] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };
  
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      const newImages = [...images, ...filesArray].slice(0, 5); // Limit to 5 images
      setImages(newImages);
      
      // Create preview URLs for the images
      const newImagePreviewUrls = newImages.map(file => URL.createObjectURL(file));
      setImagePreviewUrls(newImagePreviewUrls);
    }
  };
  
  const removeImage = (index: number) => {
    const newImages = [...images];
    newImages.splice(index, 1);
    setImages(newImages);
    
    const newImagePreviewUrls = [...imagePreviewUrls];
    URL.revokeObjectURL(newImagePreviewUrls[index]);
    newImagePreviewUrls.splice(index, 1);
    setImagePreviewUrls(newImagePreviewUrls);
  };
  
  const handleSubmit = async () => {
    if (!content.trim() && images.length === 0) return;
    
    setIsLoading(true);
    
    try {
      const formData = new FormData();
      formData.append("content", content);
      formData.append("isPrivate", isPrivate.toString());
      
      images.forEach(image => {
        formData.append("images", image);
      });
      
      await axios.post(`${API_URL}/posts`, formData, {
        withCredentials: true,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      
      // Clear the form
      setContent("");
      setImages([]);
      setImagePreviewUrls([]);
      setIsPrivate(false);
      
      // Notify parent component
      onPostCreated();
    } catch (error) {
      console.error("Failed to create post:", error);
      // In a real app, you would show an error message here
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="bg-white rounded-lg shadow p-4 mb-6">
      <div className="flex items-start gap-3">
        <Avatar>
          <AvatarImage src={user?.avatar} />
          <AvatarFallback>
            {user ? getInitials(user.firstName, user.lastName) : "?"}
          </AvatarFallback>
        </Avatar>
        
        <div className="flex-1">
          <Textarea
            placeholder="Quoi de neuf?"
            className="min-h-24 mb-3 resize-none"
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
          
          {imagePreviewUrls.length > 0 && (
            <div className="grid grid-cols-2 gap-2 mb-3">
              {imagePreviewUrls.map((url, index) => (
                <div key={index} className="relative rounded-md overflow-hidden">
                  <img
                    src={url}
                    alt={`Preview ${index}`}
                    className="object-cover w-full h-32"
                  />
                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute top-1 right-1 h-6 w-6"
                    onClick={() => removeImage(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
          
          <Tabs defaultValue="public">
            <div className="flex items-center justify-between">
              <TabsList>
                <TabsTrigger
                  value="public"
                  onClick={() => setIsPrivate(false)}
                  className={!isPrivate ? "bg-liberte-primary text-white" : ""}
                >
                  Public
                </TabsTrigger>
                <TabsTrigger
                  value="private"
                  onClick={() => setIsPrivate(true)}
                  className={isPrivate ? "bg-liberte-primary text-white" : ""}
                >
                  Privé
                </TabsTrigger>
              </TabsList>
              
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={images.length >= 5}
                >
                  <Image className="h-4 w-4" />
                  Photo
                </Button>
                
                <Button
                  size="sm"
                  onClick={handleSubmit}
                  disabled={(!content.trim() && images.length === 0) || isLoading}
                >
                  {isLoading ? "Publication..." : "Publier"}
                </Button>
                
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageChange}
                  multiple
                  accept="image/*"
                  className="hidden"
                />
              </div>
            </div>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default CreatePostForm;
