import { GoogleGenerativeAI } from "@google/generative-ai";
import { appendMessage } from "./script.js";
import { appendSystemMessage } from "./script.js";

await fetch("/processInput", {
  method: "POST",
  headers: {
    Authorization: "f4v3KdlBQCfvMWPYCOOsBPl6rOLgzsaU",
  },
})
  .then((response) => response.json())
  .then((data) => {
    const genAI = new GoogleGenerativeAI(data.apiKey);
    const generationConfig = {
      temperature: 0.9,
      topP: 1,
      topK: 1,
      maxOutputTokens: 4096,
    };

    const model = genAI.getGenerativeModel({
      model: "gemini-pro",
      generationConfig,
    });

    const user = {
      name: "me",
      gender: "",
      age: "",
      occupation: "",
      dream: "",
      mbti: "",
      goal: "",
      reason: "",
      language: "english",
    };

    let status = true;
    let chat_history = [];
    let ai_personalities = [];
    let user_personality = `This is a ${user["language"]} chatroom consisting of a total of 6 people including me, we are of different races, cultures and religions. I am the user.`;
    let intro = `${user_personality}. In this chatroom we also have 5 other people: ${ai_personalities}.`;

    const chat = model.startChat({
      history: [],
      generationConfig: generationConfig,
    });

    async function processModelMessage(initial_msgs) {
      let current_chat_history = [];

      if (Array.isArray(initial_msgs)) {
        for (let initial_msg of initial_msgs) {
          try {
            const chat_msg = JSON.parse(initial_msg);
            if (chat_msg && chat_msg["name"] != user.name) {
              current_chat_history.push({
                text: { [chat_msg["name"]]: chat_msg["response"] },
              });
              console.log(`${chat_msg["name"]}: ${chat_msg["response"]}`);
              appendMessage("model", {
                name: chat_msg["name"],
                response: chat_msg["response"],
              });
            } else {
              console.log("Error: data is empty");
            }
          } catch (error) {
            console.log("Error: data err");
            if (initial_msg["name"] != user.name) {
              current_chat_history.push({
                text: { [initial_msg["name"]]: initial_msg["response"] },
              });
              console.log(`${initial_msg["name"]}: ${initial_msg["response"]}`);
              appendMessage("model", {
                name: initial_msg["name"],
                response: initial_msg["response"],
              });
            }
          }
        }
      } else {
        let initial_msg = initial_msgs;
        try {
          const chat_msg = JSON.parse(initial_msg);
          if (chat_msg && chat_msg["name"] != user.name) {
            current_chat_history.push({
              text: { [chat_msg["name"]]: chat_msg["response"] },
            });
            console.log(`${chat_msg["name"]}: ${chat_msg["response"]}`);
            appendMessage("model", {
              name: chat_msg["name"],
              response: chat_msg["response"],
            });
          } else {
            console.log("Error: data is empty");
          }
        } catch (error) {
          console.log("Error: data err");
          if (initial_msg["name"] != user.name) {
            current_chat_history.push({
              text: { [initial_msg["name"]]: initial_msg["response"] },
            });
            console.log(`${initial_msg["name"]}: ${initial_msg["response"]}`);
            appendMessage("model", {
              name: initial_msg["name"],
              response: initial_msg["response"],
            });
          }
        }
      }
      return current_chat_history;
    }

    async function sendMessage(role, prompt) {
      let req = await chat.sendMessage(prompt);

      if (role != "") {
        chat_history.push({ role: role, parts: [{ text: prompt }] });
      }

      const res = await req.response;

      return res;
    }

    async function generateAI() {
      let prompt =
        user_personality +
        'Generate the 9 other bots\' personalities in this format with a "\n" separator: {"name": "Alice", "age": 25, "gender": "female", "occupation": "software engineer", "dream": "professional musician", "mbti": "INFJ", "goal": "provide emotional support", "reason": "I love helping others."}\n.';

      const generated_personalities_response = await sendMessage("", prompt);
      const generated_candidate = generated_personalities_response.candidates;
      const generated_personalities_str =
        generated_candidate[0].content.parts[0].text;

      const split_personalities_str = generated_personalities_str.split("\n");

      for (let personality_str of split_personalities_str) {
        try {
          const clean_personality_str = personality_str.split(". ")[1];
          const personality_dict = JSON.parse(clean_personality_str);
          ai_personalities.push(personality_dict);
        } catch (error) {
          try {
            const personality_dict = JSON.parse(personality_str);
            ai_personalities.push(personality_dict);
          } catch (error) {
            ai_personalities.push(personality_str);
          }
        }
      }
    }

    async function generateChat() {
      async function setup() {
        const prompt = `${intro}. Now, ask them to introduce themselves using the following format, with each introduction separated by a comma and newline:
    {"name": "Alice", "response": "Hi! It's great to meet you."},
    {"name": "Bob", "response": "Hello there! Nice to be here."},
    {"name": "Charlie", "response": "Greetings! I'm excited to join the conversation."}`;

        const response = await sendMessage("user", prompt);

        return response.candidates[0].content.parts[0].text.split(",\n");
      }

      let initial_msgs = await setup();
      let current_chat_history = processModelMessage(initial_msgs);

      chat_history.push({
        role: "model",
        parts: current_chat_history,
      });

      function delay(ms) {
        return new Promise((resolve) => setTimeout(resolve, ms));
      }

      // Continuous conversation loop
      while (status) {
        // Wait for user input
        const last_input = chat_history[chat_history.length - 1];

        if (last_input.role == "model") {
          // Generate AI response after a interval
          const delayTime = Math.floor(Math.random() * 5000) + 5000; // Random delay between 5 and 10 seconds
          await delay(delayTime);

          const ai_reply = await generateAIResponse();

          let current_chat_history = processModelMessage(ai_reply);

          chat_history.push({
            role: "model",
            parts: current_chat_history,
          });
        }
      }
    }

    async function generateAIResponse() {
      const prompt = `${intro}. Review the chat history and consider the messages sent, they are formatted as {sender name}: {sender message}. Select a chatroom member that are not the user ${user["name"]} (Since that is me myself), to continue the conversation. 
  If the last message is addressed to or related to a specific member, choose them and continue the topic; 
  If the last message is addressed to me, select another member and introduce a new topic. 
  Otherwise, select a random member to either continue the current topic or introduce a new one. Don't start a new topic until the previous one is talk through by most members. The chosen member will reply to the sender of the last message strictly using the following format:
  Don't do introduction and don't greet again since they have already done so.
  {"name": "selected member name", "response": "message"},
  {"name": "Alice", "response": "It's great to meet you."},
  {"name": "Bob", "response": "Nice to be here."},
  {"name": "Charlie", "response": "I'm excited to join the conversation."}
  `;

      const response = await sendMessage("user", prompt);

      try {
        const reply =
          response.candidates[0].content.parts[0].text.match(/\{.*\}/)[0];
        return reply;
      } catch (error) {
        console.log("Error: Wrong format");
        console.log(response);
        generateAIResponse();
      }
      return response;
    }

    async function generateResponse(user_input) {
      const prompt = `${intro}. Review the chat history and reply to the user ${user["name"]} who just said ${user_input}. 
  Select a chatroom member, exclude the user ${user["name"]}, to continue the conversation. 
  The chosen member will reply to the message using the following format:
  {"name": "selected member name", "response": "message"},
  {"name": "Alice", "response": "Hi! It's great to meet you."},
  {"name": "Bob", "response": "Hello there! Nice to be here."},
  {"name": "Charlie", "response": "Greetings! I'm excited to join the conversation."}
  `;

      const response = await sendMessage("user", prompt);
      return response.candidates[0].content.parts[0].text.split(",\n");
    }

    async function generateResult() {
      const generated_scores_prompt = `
  ${intro}
  Rate the user ${user["name"]}'s social skills based on their interactions in the chat history.
  Each member will give the user ${user["name"]} a score out of 10, reflecting their interactions with them in the chatroom.
  Provide feedback on how the user ${user["name"]} performed, highlighting areas for improvement and strengths.
  Finally, assign an overall score and comment under the key "Overall".

  The format for each member's feedback should be:
  {
    "name": "MemberName",
    "score": "X/10",
    "comment": "Feedback comment"
  }

  Use ',\n' as a separator between each member's feedback.

  Example:
  {
    "name": "Alice",
    "score": "3/10",
    "comment": "Encourage more participation"
  },\n
  {
    "name": "Overall",
    "score": "7.6/10",
    "comment": "They are a good listener and ask thoughtful questions. They are also very respectful of others. They would benefit from speaking up more and sharing their thoughts and ideas more often."
  }
  `;
      const generated_scores_response = await sendMessage(
        "",
        generated_scores_prompt
      );

      const generated_comments_prompt = `
  ${intro}
  Provide a detailed paragraph comment on the user\'s overall social skills, as observed from their interactions within the chatroom. Reflect on how the user has demonstrated their ability to achieve their goal of "${user["goal"]}" and the reasons behind it. Consider interactions with other members and provide constructive feedback on areas of strength and improvement.

  Example:
  "In reviewing the user's interactions within the chatroom, it's evident that they are actively striving to achieve their goal of "${user["goal"]}". Their engagement with other members reflects their commitment to this objective. However, there are opportunities for improvement in areas such as communication style and responsiveness. Overall, the user shows promise in their social skills, with potential for further growth and development."
  `;
      const generated_comments_response = await sendMessage(
        "",
        generated_comments_prompt
      );

      const generated_recommendations_prompt = `
${intro}
Offer a recommendation or piece of advice to the user regarding their social skills, as observed from the chat history (${JSON.stringify(
        chat_history
      )}). Consider the interactions with other members in the chatroom and how the user
  } can better achieve their goal of "${user["goal"]}" due to "${
        user["reason"]
      }".

Example:
"After reviewing the chat history, I recommend that the user focuses on active listening during conversations to better understand the perspectives of other members. By demonstrating empathy and engaging in meaningful dialogue, they can enhance their social skills and move closer to achieving their goal of "${
        user["goal"]
      }"."
`;
      const generated_recommendations_response = await sendMessage(
        "",
        generated_recommendations_prompt
      );

      const scores =
        generated_scores_response.candidates[0].content.parts[0].text.replace(
          /\n/g,
          ""
        );
      const f_scores_match = scores.match(/{[^{}]+}/g);
      const f_scores = f_scores_match.map((f_score) => JSON.parse(f_score));

      const comment =
        generated_comments_response.candidates[0].content.parts[0].text;

      const recommendation =
        generated_recommendations_response.candidates[0].content.parts[0].text;

      const result = {
        r_score: f_scores,
        r_comment: comment,
        r_recommendation: recommendation,
      };
      return result;
    }

    async function generateContent() {
      try {
        await generateAI();
        await generateChat();
      } catch (error) {
        console.log("Error generating content:", error);
      }
    }

    generateContent();

    document
      .getElementById("chatForm")
      .addEventListener("submit", async (event) => {
        event.preventDefault(); // Prevent default form submission
        const userInput = document.getElementById("userInput").value;
        document.getElementById("userInput").value = "";

        async function getUserInput(user_input) {
          console.log(`${user.name}: ${user_input}`);
          appendMessage("user", user_input);

          if (user_input.toLowerCase() === "exit") {
            status = false;
            const result = await generateResult();
            appendSystemMessage(result);
            return; // Exit the function if user inputs "exit"
          }

          chat_history.push({
            role: "user",
            parts: [{ text: { [`${user["name"]}(Me)`]: user_input } }],
          });

          const ai_reply = await generateResponse(user_input);
          let current_chat_history = processModelMessage(ai_reply);

          chat_history.push({
            role: "model",
            parts: current_chat_history,
          });
        }
        if (userInput != "") {
          getUserInput(userInput);
        }
      });
  })
  .catch((error) =>
    console.error("Error fetching environment variables:", error)
  );
