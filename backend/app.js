require('dotenv').config()
const express = require('express');
const app = express();
const cors = require('cors');
const { GoogleGenerativeAI } = require("@google/generative-ai");

app.use(cors());
app.use(express.json());

const apiKey = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);

const model = genAI.getGenerativeModel({
  model: "gemini-1.5-flash",
});

const generationConfig = {
  temperature: 1,
  topP: 0.95,
  topK: 64,
  maxOutputTokens: 8192,
  responseMimeType: "application/json",
};

async function suggestTask(taskHistory) {
  const chatSession = model.startChat({
    generationConfig,
    history: [
      {
        role: "user",
        parts: [{ text: "You are an AI that suggests tasks based on the user's previous task history\n" }],
      },
      {
        role: "model",
        parts: [{ text: "Understood. I'm ready to suggest tasks based on the user's history." }],
      },
    ],
  });

  const result = await chatSession.sendMessage(`Here are the tasks I've completed: ${taskHistory}. Can you suggest three new task in an object tasks?`);
  return result.response.text();
}

app.post("/suggest-task", async (req, res) => {
  try {
    const { taskHistory } = req.body;
    if (!taskHistory) {
      return res.status(400).json({ error: "Task history is required" });
    }
    const suggestion = await suggestTask(taskHistory);
    
    res.json({ suggestion });
  } catch (error) {
    console.error("Error suggesting task:", error);
    res.status(500).json({ error: "An error occurred while suggesting a task" });
  }
});

app.get("/", (req, res) => {
  res.send("hello");
  console.log('Server is running');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});