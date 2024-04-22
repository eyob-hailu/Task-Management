import React, { useState } from "react";
import { useLogin } from "../Hook/useLogin";
import { IconButton, InputAdornment, TextField, Button } from "@mui/material"; // Import Material UI components
import { Visibility, VisibilityOff } from "@mui/icons-material"; // Import eye icons from Material UI

const Login = () => {
  const [email, setEmail] = useState("@gmail.com");
  const [password, setPassword] = useState("abcABC1!");
  const { login, error, isLoading } = useLogin();

  const [showPassword, setShowPassword] = useState(false);

  const handleTogglePassword = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    await login(email, password);
  };

  return (
    <form className="login" onSubmit={handleSubmit}>
      <h3>Log In</h3>

      <TextField
        type="email"
        label="Email address"
        variant="outlined"
        onChange={(e) => setEmail(e.target.value)}
        autoComplete="username"
        value={email}
        fullWidth
        margin="normal"
      />

      <TextField
        type={showPassword ? "text" : "password"}
        label="Password"
        variant="outlined"
        onChange={(e) => setPassword(e.target.value)}
        value={password}
        autoComplete="current-password"
        fullWidth
        margin="normal"
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              {/* IconButton to toggle password visibility */}
              <IconButton onClick={handleTogglePassword} edge="end">
                {showPassword ? <VisibilityOff /> : <Visibility />}
              </IconButton>
            </InputAdornment>
          ),
        }}
      />

      <Button type="submit" variant="contained" disabled={isLoading}>
        Log in
      </Button>
      {error && <div className="error">{error}</div>}
    </form>
  );
};

export default Login;
