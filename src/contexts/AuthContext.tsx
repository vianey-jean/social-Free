
import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

// Define the types for our context
interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  avatar?: string;
  location?: string;
  relationship?: string;
  lookingFor?: string;
  bio?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  setUser: (user: User) => void;
}

interface RegisterData {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: string;
  email: string;
  password: string;
}

// Create the context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Determine API URL based on environment
const API_URL = window.location.hostname === 'localhost' 
  ? "http://localhost:3001/api" 
  : "https://liberte-backend.herokuapp.com/api";

console.log('Using API URL:', API_URL);

// Configure axios defaults for credentials
axios.defaults.withCredentials = true;

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in by validating the session with the backend
    const checkAuthStatus = async () => {
      try {
        console.log("Checking auth status at:", `${API_URL}/auth/me`);
        const response = await axios.get(`${API_URL}/auth/me`, {
          withCredentials: true,
          timeout: 10000 // 10 second timeout
        });
        
        if (response.data && response.data.user) {
          console.log("User authenticated:", response.data.user);
          setUser({
            id: response.data.user._id,
            firstName: response.data.user.firstName,
            lastName: response.data.user.lastName,
            email: response.data.user.email,
            avatar: response.data.user.avatar,
            location: response.data.user.location,
            relationship: response.data.user.relationship,
            lookingFor: response.data.user.lookingFor,
            bio: response.data.user.bio
          });
        }
      } catch (error: any) {
        // User is not authenticated - this is expected if not logged in
        console.log("Authentication check failed:", error.message);
        if (error.response) {
          console.log("Server response:", error.response.data);
          console.log("Status code:", error.response.status);
        }
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  const login = async (email: string, password: string): Promise<void> => {
    try {
      setLoading(true);
      console.log("Attempting login at:", `${API_URL}/auth/login`);
      console.log("Login data:", { email, password });
      
      // Make sure email and password are strings
      const emailStr = String(email).trim();
      const passwordStr = String(password);
      
      if (!emailStr || !passwordStr) {
        throw new Error("Email et mot de passe requis");
      }
      
      const response = await axios.post(
        `${API_URL}/auth/login`,
        { email: emailStr, password: passwordStr },
        { 
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json'
          },
          timeout: 10000 // 10 second timeout
        }
      );
      
      console.log("Login successful:", response.data);
      
      // Set user data after successful login
      if (response.data.user) {
        setUser({
          id: response.data.user._id,
          firstName: response.data.user.firstName,
          lastName: response.data.user.lastName,
          email: response.data.user.email,
          avatar: response.data.user.avatar
        });
      } else {
        throw new Error("No user data returned from server");
      }
    } catch (error: any) {
      console.log("Login failed:", error.message);
      if (error.response) {
        console.log("Server response:", error.response.data);
        console.log("Status code:", error.response.status);
      }
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData: RegisterData): Promise<void> => {
    try {
      setLoading(true);
      console.log("Attempting registration at:", `${API_URL}/auth/register`);
      
      const response = await axios.post(
        `${API_URL}/auth/register`,
        userData,
        { 
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json'
          },
          timeout: 15000 // 15 second timeout for registration (which may take longer)
        }
      );
      
      console.log("Registration successful:", response.data);
      // Do not set user here to force redirect to login page after successful registration
    } catch (error: any) {
      console.log("Registration failed:", error.message);
      if (error.response) {
        console.log("Server response:", error.response.data);
      }
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await axios.post(
        `${API_URL}/auth/logout`, 
        {}, 
        { 
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json'
          },
          timeout: 5000 // 5 second timeout
        }
      );
      console.log("Logout successful");
      setUser(null);
    } catch (error) {
      console.error("Logout failed:", error);
      // Even if the logout request fails, clear the user on the client side
      setUser(null);
    }
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!user,
    setUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
