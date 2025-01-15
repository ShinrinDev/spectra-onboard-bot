require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const {
  questions,
  generateResponse,
  formatContext,
  generateEmail,
} = require("./utils");

const app = express();
const port = process.env.PORT;

app.use(bodyParser.json());
app.use(cors());

const userSessions = {};

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
  } else if (
    message.toLowerCase().trim() !== "hi" &&
    session.currentQuestion === 0
  ) {
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
      isComplete: true,
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

// Email endopoint
app.post("/email", async (req, res) => {
  const { context, previousEmail } = req.body;

  if (!context) {
    return res
      .status(400)
      .json({ error: "Please provide context" });
  }

  try {
    const email = await generateEmail(context, previousEmail);
    return res.send({ email });
  } catch (error) {
    console.error("Failed to generate email: ", error);
  }
});
// Start the server
app.listen(port, () => {
  console.log(`Chatbot server running on http://localhost:${port}`);
});
