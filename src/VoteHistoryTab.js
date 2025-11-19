import React, { useEffect, useState } from "react";
import { supabase } from "./supabaseClient";
import { Box, Typography, List, ListItem, Divider, Avatar } from "@mui/material";

const VoteHistoryTab = () => {
  const [votes, setVotes] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchVotes = async () => {
    setLoading(true);

    try {
      const { data: votesData, error } = await supabase
        .from("votes")
        .select("id, user_email, candidate_id, inserted_at")
        .order("inserted_at", { ascending: false });

      if (error) {
        console.log("Error fetching votes:", error);
        setLoading(false);
        return;
      }

      // Attach candidate info
      const enrichedVotes = await Promise.all(
        votesData.map(async (v) => {
          const { data: candidate } = await supabase
            .from("candidates")
            .select("name, image_url")
            .eq("id", v.candidate_id)
            .single();

          return {
            ...v,
            candidateName: candidate?.name || "Unknown Candidate",
            candidateImage: candidate?.image_url || "",
          };
        })
      );

      setVotes(enrichedVotes);
      setLoading(false);
    } catch (err) {
      console.log("VoteHistory error:", err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVotes();
  }, []);

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h6" sx={{ mb: 2 }}>Vote History</Typography>

      <List sx={{ width: "100%", maxWidth: 600, bgcolor: "#fdfdff", borderRadius: 2, boxShadow: 1 }}>
        {loading && <Typography sx={{ p: 2 }}>Loading votes...</Typography>}

        {!loading && votes.length === 0 && (
          <Typography sx={{ p: 2 }}>No votes found.</Typography>
        )}

        {!loading && votes.map((v, i) => (
          <React.Fragment key={v.id}>
            <ListItem>
              <Avatar src={v.candidateImage} alt={v.candidateName} sx={{ mr: 2 }} />
              <Box>
                <Typography variant="subtitle2">
                  {v.user_email} → {v.candidateName}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {new Date(v.inserted_at).toLocaleString()}
                </Typography>
              </Box>
            </ListItem>
            {i < votes.length - 1 && <Divider />}
          </React.Fragment>
        ))}
      </List>
    </Box>
  );
};

export default VoteHistoryTab;
