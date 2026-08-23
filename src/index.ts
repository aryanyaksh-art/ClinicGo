import express from "express";
import cors from "cors";
import { config } from "./config.js";
import { clinicsRouter } from "./routes/clinics.js";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => res.json({ ok: true }));
app.use("/clinics", clinicsRouter);

app.listen(config.port, () => {
  console.log(`ClinicGo API listening on http://localhost:${config.port}`);
});
