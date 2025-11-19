import React, { useState } from "react";
import { supabase } from "./supabaseClient";
import { Box, TextField, Button, Typography, Alert } from "@mui/material";

const Login = ({ setUser }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState({ type: "", text: "" });

  const handleRegister = async () => {
    setMsg({ type: "", text: "" });
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) setMsg({ type: "error", text: error.message });
    else setMsg({ type: "success", text: "Check your email for verification!" });
  };

  const handleLogin = async () => {
    setMsg({ type: "", text: "" });
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setMsg({ type: "error", text: error.message });
    else setUser(data.user);
  };

  return (
    <Box sx={{ maxWidth: 400, mx: "auto", mt: 10, p: 3, boxShadow: 3, borderRadius: 2 }}>
      <Typography variant="h5" mb={2}>Login / Register</Typography>
      {msg.text && <Alert severity={msg.type} sx={{ mb: 2 }}>{msg.text}</Alert>}
      <TextField label="Email" fullWidth sx={{ mb: 2 }} value={email} onChange={e => setEmail(e.target.value)} />
      <TextField label="Password" type="password" fullWidth sx={{ mb: 2 }} value={password} onChange={e => setPassword(e.target.value)} />
      <Button variant="contained" fullWidth onClick={handleLogin} sx={{ mb: 1 }}>Login</Button>
      <Button variant="outlined" fullWidth onClick={handleRegister}>Register</Button>
    </Box>
  );
};

export default Login;
