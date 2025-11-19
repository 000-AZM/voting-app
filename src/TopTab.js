import React, { useEffect, useState } from "react";
import { supabase } from "./supabaseClient";
import { Box, Typography, List, ListItem, Divider, Avatar } from "@mui/material";

const TopTab = () => {
  const [topCandidates, setTopCandidates] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchTopCandidates = async () => {
    setLoading(true);

    try {
      // Fetch candidates ordered by votes_count descending
      const { data, error } = await supabase
        .from("candidates")
        .select("id, name, gender, votes_count, image_url")
        .order("votes_count", { ascending: false });

      if (error) {
        console.log("Error fetching top candidates:", error);
        setLoading(false);
        return;
      }

      setTopCandidates(data);
      setLoading(false);
    } catch (err) {
      console.log("Unexpected error:", err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTopCandidates();
  }, []);

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h6" sx={{ mb: 2 }}>
        Top Candidates
      </Typography>

      {loading && <Typography>Loading...</Typography>}

      {!loading && topCandidates.length === 0 && (
        <Typography>No candidates found.</Typography>
      )}

      <List sx={{ width: "100%", maxWidth: 600, bgcolor: "#fdfdff", borderRadius: 2, boxShadow: 1 }}>
        {!loading && topCandidates.map((c, i) => (
          <React.Fragment key={c.id}>
            <ListItem>
              <Avatar
                src={c.image_url || ""}
                alt={c.name}
                sx={{ mr: 2 }}
              />
              <Box>
                <Typography variant="subtitle1">
                  {i + 1}. {c.name} ({c.gender})
                </Typography>
                <Typography variant="body2">Votes: {c.votes_count}</Typography>
              </Box>
            </ListItem>
            {i < topCandidates.length - 1 && <Divider />}
          </React.Fragment>
        ))}
      </List>
    </Box>
  );
};

export default TopTab;
