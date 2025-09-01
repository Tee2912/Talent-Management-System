import React from "react";
import { Box } from "@mui/material";
import EnhancedPersonalityEvaluation from "../components/personality/EnhancedPersonalityEvaluation";

function PersonalityEvaluation() {
  return (
    <Box sx={{ minHeight: "100vh", py: 3 }}>
      <EnhancedPersonalityEvaluation />
    </Box>
  );
}

export default PersonalityEvaluation;
