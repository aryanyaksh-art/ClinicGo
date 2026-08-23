import { Router } from "express";
import { supabase } from "../db/supabase.js";

export const clinicsRouter = Router();

// GET /clinics - all clinics with their latest known status
clinicsRouter.get("/", async (_req, res) => {
  const { data, error } = await supabase
    .from("clinics")
    .select("*, clinic_latest_status(*)")
    .order("name");

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// GET /clinics/open - clinics currently believed to be accepting walk-ins
clinicsRouter.get("/open", async (_req, res) => {
  const { data, error } = await supabase
    .from("clinics")
    .select("*, clinic_latest_status!inner(*)")
    .eq("clinic_latest_status.accepting_walk_ins", true)
    .order("name");

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// GET /clinics/:id - one clinic plus its recent status history
clinicsRouter.get("/:id", async (req, res) => {
  const { id } = req.params;

  const { data: clinic, error: clinicError } = await supabase
    .from("clinics")
    .select("*")
    .eq("id", id)
    .single();

  if (clinicError) return res.status(404).json({ error: "Clinic not found" });

  const { data: history, error: historyError } = await supabase
    .from("clinic_status_checks")
    .select("*")
    .eq("clinic_id", id)
    .order("checked_at", { ascending: false })
    .limit(20);

  if (historyError) return res.status(500).json({ error: historyError.message });

  res.json({ ...clinic, status_history: history });
});
