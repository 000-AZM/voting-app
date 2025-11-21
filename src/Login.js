import React, { useState } from "react";
import { supabase } from "./supabaseClient";
import { getDeviceId } from "./deviceHelper";
import { Box, TextField, Button, Typography, Alert } from "@mui/material";

const Login = ({ setUser }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState({ type: "", text: "" });

 const handleRegister = async () => {
  const deviceId = getDeviceId();

  // Check if device already has registered an account
  const { data: exists, error: searchError } = await supabase
    .from("user_devices")
    .select("*")
    .eq("device_id", deviceId)
    .single();

  if (exists) {
    alert("This device already created an account.");
    return;
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { device_id: deviceId },
    },
  });

  if (error) {
    alert(error.message);
    return;
  }

  // Store device to registered table
  await supabase.from("user_devices").insert([{ device_id: deviceId, user_id: data.user.id }]);

  alert("Registration successful! Please login.");
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
      <Button class="glow-btn" variant="contained" fullWidth onClick={handleLogin} sx={{ mb: 1 }}>Login</Button>
      <Button class="glow-btn" variant="outlined" fullWidth onClick={handleRegister}>Register</Button>
    </Box>
  );
};

<style>
.glow-btn {
  padding: 12px 24px;
  background: #6200ea;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: 0.4s;
}
.glow-btn:hover {
  box-shadow: 0 0 15px #6200ea, 0 0 35px #6200ea;
}
</style>
export default Login;
