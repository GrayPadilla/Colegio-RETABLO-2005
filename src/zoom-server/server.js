import express from "express";
import cors from "cors";
import axios from "axios";

const app = express();
app.use(cors());
app.use(express.json());

// CONFIGURA ESTO con tus claves Zoom:
const ZOOM_CLIENT_ID = "xxxxxxxxxxxxxxxxxxxxxx";
const ZOOM_CLIENT_SECRET = "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx";
const ZOOM_ACCOUNT_ID = "xxxxxxxxxxxxxxxxxxxxxx";

let accessToken = null;
let tokenExpiration = null;

async function refreshZoomToken() {
  const now = Date.now();

  if (accessToken && tokenExpiration && now < tokenExpiration - 60000) {
    return accessToken;
  }

  const token = Buffer.from(`${ZOOM_CLIENT_ID}:${ZOOM_CLIENT_SECRET}`).toString("base64");

  const response = await axios.post(
    `https://zoom.us/oauth/token?grant_type=account_credentials&account_id=${ZOOM_ACCOUNT_ID}`,
    {},
    {
      headers: {
        Authorization: `Basic ${token}`
      }
    }
  );

  accessToken = response.data.access_token;
  tokenExpiration = now + response.data.expires_in * 1000;

  console.log("🔐 Nuevo token Zoom generado");
  return accessToken;
}


// API — Crear reunión
app.post("/create-zoom", async (req, res) => {
  try {
    const token = await refreshZoomToken();

    const { asunto, fecha, hora } = req.body;

    const start_time = `${fecha}T${hora}:00`;

    const result = await axios.post(
      "https://api.zoom.us/v2/users/me/meetings",
      {
        topic: asunto,
        type: 2,
        start_time,
        duration: 60,
        timezone: "America/Lima",
        settings: {
          host_video: true,
          participant_video: true
        }
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      }
    );

    return res.json({
      success: true,
      meetingId: result.data.id,
      join_url: result.data.join_url,
      start_url: result.data.start_url
    });

  } catch (err) {
    console.log(err.response?.data || err);
    return res.status(500).send("Error creando Zoom");
  }
});

// API — Eliminar reunión Zoom
app.post("/delete-zoom", async (req, res) => {
  try {
    const { meetingId } = req.body;
    const token = await refreshZoomToken();

    console.log("🗑️ Eliminando reunión Zoom ID:", meetingId);

    await axios.delete(
      `https://api.zoom.us/v2/meetings/${meetingId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    return res.json({ success: true });

  } catch (err) {
    console.log(err.response?.data || err);
    return res.status(500).json({ success: false, error: "Error eliminando reunión Zoom" });
  }
});


// 🚀 iniciar server local
app.listen(3000, () => console.log("API Zoom running on http://localhost:3000"));
