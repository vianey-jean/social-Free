
import { useState, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import axios from "axios";
import { MessageCircle } from "lucide-react";
import { Link } from "react-router-dom";

interface User {
  id: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  isOnline: boolean;
  isFriend: boolean;
}

const API_URL = "http://localhost:3001/api";

const OnlineUsersList = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get(`${API_URL}/users`, {
          withCredentials: true
        });
        setUsers(response.data);
      } catch (error) {
        console.error("Failed to fetch users:", error);
        // For demo purposes, let's show mock data
        setUsers([
          { id: "1", firstName: "John", lastName: "Doe", isOnline: true, isFriend: true },
          { id: "2", firstName: "Jane", lastName: "Smith", isOnline: true, isFriend: true },
          { id: "3", firstName: "Alice", lastName: "Johnson", isOnline: false, isFriend: true },
          { id: "4", firstName: "Bob", lastName: "Brown", isOnline: false, isFriend: true },
          { id: "5", firstName: "Charlie", lastName: "Wilson", isOnline: true, isFriend: false },
          { id: "6", firstName: "Diana", lastName: "Parker", isOnline: false, isFriend: false },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const sortedUsers = [...users].sort((a, b) => {
    // First sort by online status
    if (a.isOnline && !b.isOnline) return -1;
    if (!a.isOnline && b.isOnline) return 1;
    
    // Then by friend status
    if (a.isFriend && !b.isFriend) return -1;
    if (!a.isFriend && b.isFriend) return 1;
    
    // Finally by name
    return `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`);
  });

  const friendsList = sortedUsers.filter(user => user.isFriend);
  const allUsers = sortedUsers;

  return (
    <div className="w-64 h-screen border-r bg-white p-4">
      <h2 className="text-lg font-semibold mb-4">Personnes</h2>
      
      <Tabs defaultValue="friends">
        <TabsList className="w-full mb-4">
          <TabsTrigger value="friends" className="flex-1">Amis</TabsTrigger>
          <TabsTrigger value="all" className="flex-1">Tous</TabsTrigger>
        </TabsList>
        
        <TabsContent value="friends" className="mt-0">
          <ScrollArea className="h-[calc(100vh-160px)]">
            {loading ? (
              <div className="flex justify-center p-4">Chargement...</div>
            ) : friendsList.length > 0 ? (
              <div className="space-y-2">
                {friendsList.map((user) => (
                  <div key={user.id} className="flex items-center justify-between p-2 rounded-md hover:bg-gray-100">
                    <Link to={`/profile/${user.id}`} className="flex items-center gap-2 flex-1">
                      <div className="relative">
                        <Avatar>
                          <AvatarImage src={user.avatar} />
                          <AvatarFallback>{getInitials(user.firstName, user.lastName)}</AvatarFallback>
                        </Avatar>
                        <span className={`absolute -bottom-0.5 -right-0.5 ${user.isOnline ? 'online-status' : 'offline-status'}`}></span>
                      </div>
                      <span className="text-sm truncate">{user.firstName} {user.lastName}</span>
                    </Link>
                    {user.isOnline && user.isFriend && (
                      <button className="text-liberte-primary p-1 rounded hover:bg-gray-200">
                        <MessageCircle size={18} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center p-4 text-gray-500">Aucun ami trouvé</div>
            )}
          </ScrollArea>
        </TabsContent>
        
        <TabsContent value="all" className="mt-0">
          <ScrollArea className="h-[calc(100vh-160px)]">
            {loading ? (
              <div className="flex justify-center p-4">Chargement...</div>
            ) : allUsers.length > 0 ? (
              <div className="space-y-2">
                {allUsers.map((user) => (
                  <div key={user.id} className="flex items-center justify-between p-2 rounded-md hover:bg-gray-100">
                    <Link to={`/profile/${user.id}`} className="flex items-center gap-2 flex-1">
                      <div className="relative">
                        <Avatar>
                          <AvatarImage src={user.avatar} />
                          <AvatarFallback>{getInitials(user.firstName, user.lastName)}</AvatarFallback>
                        </Avatar>
                        <span className={`absolute -bottom-0.5 -right-0.5 ${user.isOnline ? 'online-status' : 'offline-status'}`}></span>
                      </div>
                      <span className="text-sm truncate">{user.firstName} {user.lastName}</span>
                    </Link>
                    {user.isOnline && user.isFriend && (
                      <button className="text-liberte-primary p-1 rounded hover:bg-gray-200">
                        <MessageCircle size={18} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center p-4 text-gray-500">Aucun utilisateur trouvé</div>
            )}
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default OnlineUsersList;
