import React, { useState } from "react";
import { supabase } from "./supabaseClient";
import { Box, TextField, Button, MenuItem, Typography, Alert } from "@mui/material";

const AdminTab = () => {
  const [name, setName] = useState("");
  const [gender, setGender] = useState("male");
  const [imageUrl, setImageUrl] = useState(""); // Stores public URL
  const [msg, setMsg] = useState({ type: "", text: "" });
  const [uploading, setUploading] = useState(false);

  // Upload file to Supabase Storage
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    setMsg({ type: "", text: "" });

    try {
      const fileName = `${Date.now()}_${file.name}`;
      const { error } = await supabase.storage
        .from("candidates")
        .upload(fileName, file);

      if (error) {
        setMsg({ type: "error", text: error.message });
        setUploading(false);
        return;
      }

      // Get public URL for the uploaded file
      const { data: urlData, error: urlError } = supabase
        .storage
        .from("candidates")
        .getPublicUrl(fileName);

      if (urlError) {
        setMsg({ type: "error", text: urlError.message });
        setUploading(false);
        return;
      }

      setImageUrl(urlData.publicUrl); // <-- store public URL
      setMsg({ type: "success", text: "Image uploaded successfully!" });
    } catch (err) {
      setMsg({ type: "error", text: err.message });
    } finally {
      setUploading(false);
    }
  };

  // Add candidate to database
  const handleAdd = async () => {
    if (!name || !gender) {
      setMsg({ type: "error", text: "Please enter name and gender." });
      return;
    }

    try {
      const { data, error } = await supabase
        .from("candidates")
        .insert([{ name, gender, image_url: imageUrl }]);

      if (error) {
        setMsg({ type: "error", text: error.message });
        return;
      }

      setMsg({ type: "success", text: "Candidate added successfully!" });
      setName("");
      setGender("male");
      setImageUrl("");
    } catch (err) {
      setMsg({ type: "error", text: err.message });
    }
  };

  return (
    <Box sx={{ maxWidth: 500, mx: "auto" }}>
      <Typography variant="h6" mb={2}>Add Candidate</Typography>

      {msg.text && <Alert severity={msg.type} sx={{ mb: 2 }}>{msg.text}</Alert>}

      <TextField
        label="Name"
        fullWidth
        sx={{ mb: 2 }}
        value={name}
        onChange={(e) => setName(e.target.value)}
      />

      <TextField
        select
        label="Gender"
        fullWidth
        sx={{ mb: 2 }}
        value={gender}
        onChange={(e) => setGender(e.target.value)}
      >
        <MenuItem value="male">Male</MenuItem>
        <MenuItem value="female">Female</MenuItem>
      </TextField>

      {/* File Upload */}
      <input
        type="file"
        accept="image/*"
        onChange={handleFileUpload}
        style={{ marginBottom: "10px" }}
      />
      {uploading && <Typography>Uploading image...</Typography>}

      {/* Image Preview */}
      {imageUrl && (
        <Box sx={{ mt: 1, mb: 2 }}>
          <Typography variant="caption">Preview:</Typography>
          <img src={imageUrl} alt="Preview" style={{ width: 150, display: "block", marginTop: 5 }} />
        </Box>
      )}

      <Button
        variant="contained"
        fullWidth
        sx={{ mt: 2 }}
        onClick={handleAdd}
        disabled={uploading}
      >
        Add Candidate
      </Button>
    </Box>
  );
};

export default AdminTab;
