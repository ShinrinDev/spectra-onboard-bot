require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const axios = require("axios");

const app = express();
const port = 3000;

app.use(bodyParser.json());
app.use(cors());

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_API_URL = "https://api.openai.com/v1/chat/completions";

const questions = [
  "What is your company name?",
  "What industry are you in?",
  "What is your core offer?",
  "What is your ticket size?",
  "What is your current monthly revenue?",
  "What is your goal monthly revenue in 12 months?",
  "What technologies do your clients use (e.g., Shopify)?",
  "Any keywords you'd be looking for on your ideal client's website?",
  "What market/industry/niche do you work with?",
  "Are there any adjacent markets?",
  "What geography is your ideal clients based?",
  "What is the ideal company headcount of your ideal clients?",
  "What is the title of the avatar you target (e.g., CEO, CFO, CMO)?",
  "What are some problems your ideal clients have that you can solve?",
  "Link to your most recent case study and results achieved.",
  "Link to a landing page with a headline, VSL, and booking button.",
  "Link to your booking page (e.g., Calendly).",
  "Link to your thank you page and video.",
];

const userSessions = {};

// Generate response using OpenAI
const generateResponse = async (context, question) => {
  const prompt = `
You are a conversational onboarding assistant helping a user onboard to a platform. Make the interaction feel personalized and friendly. Below is the conversation history. Ask the next question or respond appropriately:
${context}
Next Question: ${question}
  `;

  try {
    const response = await axios.post(
      OPENAI_API_URL,
      {
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "You are a conversational onboarding assistant.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        max_tokens: 200,
        temperature: 0.7,
      },
      {
        headers: {
          Authorization: `Bearer ${OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    return response.data.choices[0].message.content.trim();
  } catch (error) {
    console.error("Error generating response:", error);
    throw new Error("Failed to generate response from OpenAI");
  }
};

// Format context as conversation history
const formatContext = (questions, answers) => {
  let context = "Conversation History:\n";
  for (let i = 0; i < answers.length; i++) {
    if (answers[i]) {
      context += `Q: ${questions[i]}\nA: ${answers[i]}\n`;
    }
  }
  return context;
};

// Chat endpoint
app.post("/chat", async (req, res) => {
  const { userId, message } = req.body;

  // Initialize user session if it doesn't exist
  if (!userSessions[userId]) {
    userSessions[userId] = { currentQuestion: 0, answers: [] };
  }

  const session = userSessions[userId];

  // Handle the initial "Hi" message
  if (message.toLowerCase().trim() === "hi" && session.currentQuestion === 0) {
    const welcomeMessage =
      "Welcome to the onboarding process! Let's get started.";
    const firstQuestion = questions[session.currentQuestion];
    session.currentQuestion += 1;
    res.json({ message: `${welcomeMessage} ${firstQuestion}` });
    return;
  } else if (message.toLowerCase().trim() !== "hi" && session.currentQuestion === 0) {
    res.json({ message: "Type 'Hi' to activate the bot." });
    return;
  }

  // Store the user's response to the current question
  if (session.currentQuestion > 0) {
    session.answers[session.currentQuestion - 1] = message;
  }

  // Check if all questions are answered
  if (session.currentQuestion >= questions.length) {
    const userAnswers = session.answers;

    // Clear the session data for the user
    delete userSessions[userId];

    res.json({
      message: "Thank you for completing the onboarding!",
      questions: questions,
      answers: userAnswers,
      isComplete: true
    });
    return;
  }

  // Prepare context and ask the next question
  const context = formatContext(questions, session.answers);
  const nextQuestion = questions[session.currentQuestion];
  session.currentQuestion += 1;

  try {
    const response = await generateResponse(context, nextQuestion);
    res.json({ message: response });
  } catch (error) {
    res.status(500).json({
      message: "An error occurred while generating the next question.",
    });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Chatbot server running on http://localhost:${port}`);
});
