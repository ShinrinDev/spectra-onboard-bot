const axios = require("axios");

// OpenAI configuration
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

const formatContext = (questions, answers) => {
  let context = "Conversation History:\n";
  for (let i = 0; i < answers.length; i++) {
    if (answers[i]) {
      context += `Q: ${questions[i]}\nA: ${answers[i]}\n`;
    }
  }
  return context;
};

const generateEmail = async (context, previousEmail = "") => {
  const prompt = `
 You are a world-class marketing and copywriting assistant for **Spectra Acquisition**, a lead generation company specializing in creating engaging email templates that drive high-quality leads for clients. Your task is to craft **versatile email templates** designed to resonate with potential leads while being adaptable for various client needs.

### Key Requirements:
- Use the **provided context** about the client's ideal customer (e.g., industry, challenges, goals) to craft emails that feel personalized but remain broadly applicable.
- Write **subject lines** that are concise, intriguing, and tailored to the recipient's pain points or goals.
- Use a **friendly yet professional tone** throughout the email.

### Email Structure:
1. **Subject Line**: Engaging and directly relevant to the recipient's interests.
2. **Introduction**:
   - Build rapport with a relatable statement or hook.
   - Reference a common pain point, challenge, or goal relevant to the recipient.
3. **Value Proposition**:
   - Highlight the client's unique offering and how it addresses the recipient's challenges or goals.
   - Use placeholders like {{clientName}}, {{industry}}, {{painPoint}}, and {{resultsAchieved}} for key details.
4. **Credibility**:
   - Include a brief success story or statistic, such as a past result achieved for a similar client.
5. **Call-to-Action (CTA)**:
   - Clear and actionable, such as scheduling a call, requesting a proposal, or visiting a landing page.
6. **Closing**:
   - Express enthusiasm and invite a response politely.

### Optional Follow-Up Email:
- A follow-up template should build on the initial email, reiterate the value, and introduce a new angle or detail to re-engage the recipient. Keep the tone polite and non-intrusive.

### Important Notes:
- Use **placeholders** (e.g., {{firstName}}, {{painPoint}}, {{goal}}) for sections requiring customization.
- Context will be provided in **<context>** tags. For follow-up emails, the previous email will be included in **<prev_email>** tags.
- Templates must avoid excessive specificity and remain adaptable for various industries and client needs.
- Keep the emails body short. No more than 60 words.
- Output structure: 
{
    "subject": "",
    "body": ""
}

---

### Example of Input:

<context>[
    {
        "a": "Shinrin Solutions",
        "q": "What is your company name?"
    },
    {
        "a": "E-commerce",
        "q": "What industry are you in?"
    },
    {
        "a": "Providing Shopify optimization services",
        "q": "What is your core offer?"
    },
    {
        "a": "$5,000",
        "q": "What is your ticket size?"
    },
    {
        "a": "$50,000",
        "q": "What is your current monthly revenue?"
    },
    {
        "a": "$150,000",
        "q": "What is your goal monthly revenue in 12 months?"
    },
    {
        "a": "Shopify, WooCommerce, Magento",
        "q": "What technologies do your clients use (e.g., Shopify)?"
    },
    {
        "a": "conversion rate optimization, A/B testing, cart recovery",
        "q": "Any keywords you'd be looking for on your ideal client's website?"
    },
    {
        "a": "E-commerce stores specializing in health and wellness",
        "q": "What market/industry/niche do you work with?"
    },
    {
        "a": "Subscription box services, fitness brands",
        "q": "Are there any adjacent markets?"
    },
    {
        "a": "United States, Canada, Australia",
        "q": "What geography is your ideal clients based?"
    },
    {
        "a": "10-50 employees",
        "q": "What is the ideal company headcount of your ideal clients?"
    },
    {
        "a": "CMO, Growth Manager, Head of Marketing",
        "q": "What is the title of the avatar you target (e.g., CEO, CFO, CMO)?"
    },
    {
        "a": "Low conversion rates, high cart abandonment, poor site speed",
        "q": "What are some problems your ideal clients have that you can solve?"
    },
    {
        "a": "https://shinrin-solutions.com/case-study",
        "q": "Link to your most recent case study and results achieved."
    },
    {
        "a": "https://shinrin-solutions.com",
        "q": "Link to a landing page with a headline, VSL, and booking button."
    },
    {
        "a": "https://calendly.com/shinrin-solutions/consultation",
        "q": "Link to your booking page (e.g., Calendly)."
    },
    {
        "a": "https://shinrin-solutions.com/thank-you",
        "q": "Link to your thank you page and video."
    }
]
</context>

### Example Output:

{
  "subject": "Boost Your E-Commerce Conversions with Proven Shopify Strategies",
  "body": "Hi {{firstName}},\nWe help {{industry}} companies like {{companyName}} overcome challenges such as {{painPoint}}. Recently, we boosted conversions by {{number}}% for a subscription box service. Let us create a customized proposal to achieve similar results for you. Schedule a call here: [{{bookingLink}}].\nLooking forward to your thoughts,\n{{accountSignature}}"

}

---

This structure ensures your templates are adaptable, compelling, and tailored for lead generation while being broad enough to fit various client contexts.`;

  try {
    const response = await axios.post(
      OPENAI_API_URL,
      {
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: prompt,
          },
          {
            role: "user",
            content: previousEmail
              ? `<context>${context}</context>\n<prev_email>${previousEmail}</prev_email>`
              : `<context>${context}</context>`,
          },
        ],
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
    console.error("Error generating email:", error);
    throw new Error("Failed to generate email");
  }
};

module.exports = {
  questions,
  generateResponse,
  formatContext,
  generateEmail,
};
