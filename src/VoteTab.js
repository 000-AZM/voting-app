import React, { useState, useEffect } from "react";
import { supabase } from "./supabaseClient";
import {
  Box,
  Typography,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Button,
  Alert,
} from "@mui/material";

const VoteTab = ({ user }) => {
  const [candidates, setCandidates] = useState([]);
  const [userVote, setUserVote] = useState(null);
  const [msg, setMsg] = useState("");

  const fetchCandidates = async () => {
    // Fetch all candidates
    const { data: candidatesData, error } = await supabase
      .from("candidates")
      .select("*")
      .order("id", { ascending: true });

    if (error) console.log(error);
    else setCandidates(candidatesData);

    // Fetch user's vote by email
    const { data: voteData } = await supabase
      .from("votes")
      .select("candidate_id")
      .eq("user_email", user.email)
      .single();

    if (voteData) setUserVote(voteData.candidate_id);
  };

  useEffect(() => {
    fetchCandidates();
  }, []);

  const handleVote = async (candidateId) => {
    try {
      // Check existing vote
      const { data: existingVote } = await supabase
        .from("votes")
        .select("id, candidate_id")
        .eq("user_email", user.email)
        .single();

      if (existingVote && existingVote.candidate_id !== candidateId) {
        if (!window.confirm("You already voted. Change your vote?")) return;

        // Update vote
        await supabase
          .from("votes")
          .update({
            candidate_id: candidateId,
            inserted_at: new Date().toISOString(),
            user_email: user.email
          })
          .eq("user_email", user.email);

        // Update candidate vote counts
        const { data: oldCandidate } = await supabase
          .from("candidates")
          .select("votes_count")
          .eq("id", existingVote.candidate_id)
          .single();

        if (oldCandidate) {
          await supabase
            .from("candidates")
            .update({ votes_count: oldCandidate.votes_count - 1 })
            .eq("id", existingVote.candidate_id);
        }

        const { data: newCandidate } = await supabase
          .from("candidates")
          .select("votes_count")
          .eq("id", candidateId)
          .single();

        if (newCandidate) {
          await supabase
            .from("candidates")
            .update({ votes_count: newCandidate.votes_count + 1 })
            .eq("id", candidateId);
        }

        setUserVote(candidateId);
        setMsg("Vote updated!");
        fetchCandidates();
      } else if (!existingVote) {
        // Insert new vote
        await supabase
          .from("votes")
          .insert([{
            candidate_id: candidateId,
            user_email: user.email,
            inserted_at: new Date().toISOString()
          }]);

        // Increment candidate votes
        const { data: newCandidate } = await supabase
          .from("candidates")
          .select("votes_count")
          .eq("id", candidateId)
          .single();

        if (newCandidate) {
          await supabase
            .from("candidates")
            .update({ votes_count: newCandidate.votes_count + 1 })
            .eq("id", candidateId);
        }

        setUserVote(candidateId);
        setMsg("Vote submitted!");
        fetchCandidates();
      }
    } catch (err) {
      console.log("Vote error:", err);
      setMsg("Error submitting vote.");
    }
  };

  return (
    <Box>
      {msg && <Alert severity="success" sx={{ mb: 2 }}>{msg}</Alert>}

      <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
        {candidates.map((c) => (
          <Card key={c.id} sx={{ width: 220, boxShadow: 3 }}>
            {c.image_url ? (
              <CardMedia component="img" height="140" image={c.image_url} alt={c.name} />
            ) : (
              <Box sx={{ height: 140, bgcolor: "#eee", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Typography variant="caption">No Image</Typography>
              </Box>
            )}

            <CardContent>
              <Typography variant="h6" noWrap>{c.name}</Typography>
              <Typography variant="body2">Votes: {c.votes_count}</Typography>
              <Typography variant="body2">Gender: {c.gender}</Typography>
            </CardContent>

            <CardActions>
              <Button
                variant={userVote === c.id ? "contained" : "outlined"}
                color="primary"
                fullWidth
                onClick={() => handleVote(c.id)}
              >
                {userVote === c.id ? "Voted" : "Vote"}
              </Button>
            </CardActions>
          </Card>
        ))}
      </Box>
    </Box>
  );
};

export default VoteTab;
