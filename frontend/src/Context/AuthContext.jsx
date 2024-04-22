// AuthContextProvider.js
import React, { createContext, useReducer, useContext, useEffect } from "react";
import { Navigate } from "react-router-dom";

export const AuthContext = createContext();

export const authReducer = (state, action) => {
  switch (action.type) {
    case "LOGIN":
      return { user: action.payload };
    case "LOGOUT":
      return { user: null };
    default:
      return state;
  }
};

export const AuthContextProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, {
    user: JSON.parse(localStorage.getItem("user")) || null,
  });

  useEffect(() => {
    const handleStorageChange = () => {
      const user = JSON.parse(localStorage.getItem("user"));
      if (user !== state.user) {
        dispatch({ type: user ? "LOGIN" : "LOGOUT", payload: user });
      }
    };
    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [state.user]);

  useEffect(() => {
    localStorage.setItem("user", JSON.stringify(state.user));
    console.log("AuthContext state:", state); // Logging state management
  }, [state]);

  const redirectToLogin = () => <Navigate to="/login" replace />;

  return (
    <AuthContext.Provider value={{ ...state, dispatch, redirectToLogin }}>
      {children}
    </AuthContext.Provider>
  );
};
