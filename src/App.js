import React, { useState, useEffect } from "react";
import { supabase } from "./supabaseClient";
import { Box, Typography, Button, Tabs, Tab } from "@mui/material";
import Login from "./Login";
import VoteTab from "./VoteTab";
import AdminTab from "./AdminTab";
import TopTab from "./TopTab";
import VoteHistoryTab from "./VoteHistoryTab";

function App() {
  const [user, setUser] = useState(null);
  const [tab, setTab] = useState(0);

  useEffect(() => {
    const session = supabase.auth.getSession();
    session.then(res => setUser(res.data.session?.user || null));
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  if (!user) return <Login setUser={setUser} />;

  const isAdmin = user.email === "admin.alua@gmail.com";

  return (
    <Box sx={{ width: "100%" }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", p: 2, bgcolor: "primary.main", color: "#fff" }}>
        <Typography variant="h6">Voting App</Typography>
        <Button color="inherit" onClick={handleLogout}>Logout</Button>
      </Box>

      <Tabs value={tab} onChange={(e, val) => setTab(val)} centered>
        <Tab label="Vote" />
        <Tab label="Top Candidates" />
        {isAdmin && <Tab label="Admin" />}
        {isAdmin && <Tab label="Vote History" />}
      </Tabs>

      <Box sx={{ p: 3 }}>
        {tab === 0 && <VoteTab user={user} />}
        {tab === 1 && <TopTab />}
        {tab === 2 && isAdmin && <AdminTab />}
        {tab === 3 && isAdmin && <VoteHistoryTab />}
      </Box>
    </Box>
  );
}

export default App;
