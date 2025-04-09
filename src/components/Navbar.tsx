
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Bell, Search, LogOut, User, Settings } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import axios from "axios";

interface SearchResult {
  id: string;
  firstName: string;
  lastName: string;
  avatar?: string;
}

const API_URL = "http://localhost:3001/api";

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const navigate = useNavigate();

  // Handle search input changes
  useEffect(() => {
    const fetchSearchResults = async () => {
      if (searchTerm.length < 3) {
        setSearchResults([]);
        setShowResults(false);
        return;
      }

      try {
        const response = await axios.get(`${API_URL}/users/search?term=${searchTerm}`);
        setSearchResults(response.data);
        setShowResults(true);
      } catch (error) {
        console.error("Search failed:", error);
        // For demo purposes, let's show mock results
        setSearchResults([
          { id: "1", firstName: "John", lastName: "Doe" },
          { id: "2", firstName: "Jane", lastName: "Smith" },
          { id: "3", firstName: "Alice", lastName: "Johnson" }
        ]);
        setShowResults(true);
      }
    };

    const timer = setTimeout(() => {
      if (searchTerm.length >= 3) {
        fetchSearchResults();
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Fetch unread notifications (just for demo)
  useEffect(() => {
    if (isAuthenticated) {
      // In a real app, you'd fetch this from your API
      setUnreadNotifications(3);
    }
  }, [isAuthenticated]);

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  return (
    <div className="border-b bg-white">
      <div className="flex h-16 items-center px-4 container mx-auto">
        <Link to={isAuthenticated ? "/home" : "/"} className="flex items-center mr-4">
          <h1 className="text-xl font-bold text-liberte-primary">Liberté</h1>
        </Link>
        
        <div className="relative ml-4 flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Rechercher des personnes..."
              className="w-full pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onBlur={() => setTimeout(() => setShowResults(false), 200)}
              onFocus={() => searchTerm.length >= 3 && setShowResults(true)}
            />
          </div>
          
          {showResults && (
            <div className="absolute top-full mt-1 w-full rounded-md border bg-white shadow-lg z-50">
              {searchResults.length > 0 ? (
                <div className="p-2">
                  {searchResults.map((result) => (
                    <Link
                      key={result.id}
                      to={`/profile/${result.id}`}
                      className="flex items-center gap-2 rounded-md p-2 hover:bg-gray-100"
                    >
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={result.avatar} />
                        <AvatarFallback>{getInitials(result.firstName, result.lastName)}</AvatarFallback>
                      </Avatar>
                      <div>{`${result.firstName} ${result.lastName}`}</div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="p-4 text-center text-sm text-muted-foreground">No results found</div>
              )}
            </div>
          )}
        </div>
        
        <div className="ml-auto flex items-center gap-4">
          {isAuthenticated ? (
            <>
              <div className="relative">
                <Button variant="ghost" size="icon" className="relative">
                  <Bell className="h-5 w-5" />
                  {unreadNotifications > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-liberte-error text-xs text-white">
                      {unreadNotifications}
                    </span>
                  )}
                </Button>
              </div>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user?.avatar} alt={user?.firstName} />
                      <AvatarFallback>
                        {user ? getInitials(user.firstName, user.lastName) : "?"}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <div className="flex flex-col space-y-1 p-2">
                    <p className="text-sm font-medium">{user?.firstName} {user?.lastName}</p>
                    <p className="text-xs text-muted-foreground">{user?.email}</p>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to={`/profile/${user?.id}`} className="cursor-pointer flex w-full items-center">
                      <User className="mr-2 h-4 w-4" />
                      Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/settings" className="cursor-pointer flex w-full items-center">
                      <Settings className="mr-2 h-4 w-4" />
                      Settings
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="cursor-pointer flex w-full items-center" onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <Button asChild>
              <Link to="/login">Connexion</Link>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Navbar;
