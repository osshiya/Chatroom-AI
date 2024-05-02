import { GoogleGenerativeAI } from "@google/generative-ai";

// Fetch your API_KEY
const API_KEY = "AIzaSyBXq0dw1fxNgGhlBRfwPrSo_D1dIpZowWM";

// Access your API key (see "Set up your API key" above)
let msg = document.getElementById("message").value;
const li = document.createElement("li");

// ...
const genAI = new GoogleGenerativeAI(API_KEY);
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
  name: "shyon",
  gender: "female",
  age: 24,
  occupation: "university student",
  dream: "programmer",
  mbti: "ISTP",
  goal: "make friends",
  reason: "I am a shy person, reluctant and scared of people",
  language: "english",
};

let status = true;

const user_personality = `This is a ${user["language"]} chatroom consisting of a total of 6 people including me, we are of different races, cultures and religions. I am the user, my name is ${user["name"]}, I am a ${user["age"]} years old ${user["gender"]}. I am a ${user["occupation"]} and my dream is to be a ${user["dream"]}. my MBTI is a ${user["mbti"]} and my goal here is to ${user["goal"]} because ${user["reason"]}.`;

let ai_personalities = [];
let chat_history = [];
const intro = `${user_personality}. In this chatroom we also have 5 other people: ${ai_personalities}.`;

const chat = model.startChat({
  history: [],
  generationConfig: generationConfig,
});

async function generateAI() {
  let generated_personalities_result = await chat.sendMessage(
    user_personality +
      'Generate the 9 other bots\' personalities in this format with a "\n" separator: {"name": "Alice", "age": 25, "gender": "female", "occupation": "software engineer", "dream": "professional musician", "mbti": "INFJ", "goal": "provide emotional support", "reason": "I love helping others."}\n.'
  );

  const generated_personalities_response =
    await generated_personalities_result.response;

  let generated_candidate = generated_personalities_response.candidates;
  let generated_personalities_str =
    generated_candidate[0].content.parts[0].text;

  let split_personalities_str = generated_personalities_str.split("\n");

  for (let personality_str of split_personalities_str) {
    // console.log(personality_str);

    try {
      let clean_personality_str = personality_str.split(". ")[1];
      let personality_dict = JSON.parse(clean_personality_str);
      ai_personalities.push(personality_dict);
    } catch (error) {
      try {
        let personality_dict = JSON.parse(personality_str);
        ai_personalities.push(personality_dict);
      } catch (error) {
        ai_personalities.push(personality_str);
      }
    }
  }

  console.log(ai_personalities);
}

async function generateChat() {
  async function setup() {
    const prompt = `${intro}. Now, ask them to introduce themselves using the following format, with each introduction separated by a comma and newline:
{"name": "Alice", "response": "Hi! It's great to meet you."},
{"name": "Bob", "response": "Hello there! Nice to be here."},
{"name": "Charlie", "response": "Greetings! I'm excited to join the conversation."}`;
    chat_history.push({ role: "user", parts: [{ text: prompt }] });
    // console.log(chat_history)
    const result = await chat.sendMessage(prompt);
    const response = await result.response;

    return response.candidates[0].content.parts[0].text.split(",\n");
  }

  const initial_msgs = await setup();
  let current_chat_history = [];
  for (let initial_msg of initial_msgs) {
    // console.log(initial_msg);
    try {
      let chat_msg = JSON.parse(initial_msg);
      if (
        chat_msg &&
        chat_msg["name"].toLowerCase() != user["name"].toLowerCase()
      ) {
        current_chat_history.push({
          text: { [chat_msg["name"]]: chat_msg["response"] },
        });
        console.log(`${chat_msg["name"]}: ${chat_msg["response"]}`);
        // io.emit("model", {
        //   name: chat_msg["name"],
        //   response: chat_msg["response"],
        // });
        li.textContent = chat_msg["response"];
        document.getElementById("messages").appendChild(li);
      } else {
        console.log("setup() empty");
        // io.emit("model", initial_msg);
      }
    } catch (error) {
      console.log("setup() err");
      if (initial_msg["name"].toLowerCase() != user["name"].toLowerCase()) {
        current_chat_history.push({
          text: { [initial_msg["name"]]: initial_msg["response"] },
        });
        console.log(`${initial_msg["name"]}: ${initial_msg["response"]}`);
        // io.emit("model", {
        //   name: initial_msg["name"],
        //   response: initial_msg["response"],
        // });
        li.textContent = initial_msg["response"];
        document.getElementById("messages").appendChild(li);
      }
    }
  }
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
      // Generate AI response after a random interval
      const delayTime = Math.floor(Math.random() * 5000) + 2000; // Random delay between 5 and 30 seconds
      await delay(delayTime);

      // setTimeout(async () => {
      const ai_reply = await generateAIResponse();
      // console.log(ai_reply);

      let current_chat_history = [];
      // for (ai_reply of ai_replies) {
      try {
        let chat_msg = JSON.parse(ai_reply);
        if (
          chat_msg &&
          chat_msg["name"].toLowerCase() != user["name"].toLowerCase()
        ) {
          current_chat_history.push({
            text: { [chat_msg["name"]]: chat_msg["response"] },
          });
          console.log(`${chat_msg["name"]}: ${chat_msg["response"]}`);
          // io.emit("model", {
          //   name: chat_msg["name"],
          //   response: chat_msg["response"],
          // });
          li.textContent = chat_msg["response"];
          document.getElementById("messages").appendChild(li);

          // res.json({
          //   message: `${chat_msg["name"]}: ${chat_msg["response"]}`,
          // });
        } else {
          console.log("chat_msg empty");
          // res.json({
          //   message: `${chat_msg}`,
          // });
        }
      } catch (error) {
        if (ai_reply["name"].toLowerCase() != user["name"].toLowerCase()) {
          console.log("generateAIResponse() err");
          current_chat_history.push({
            text: { [ai_reply["name"]]: ai_reply["response"] },
          });
          console.log(`${ai_reply["name"]}: ${ai_reply["response"]}`);
          // io.emit("model", {
          //   name: ai_reply["name"],
          //   response: ai_reply["response"],
          // });
          li.textContent = ai_reply["response"];
          document.getElementById("messages").appendChild(li);
        }
        // res.json({ message: `${ai_reply["name"]}: ${ai_reply["response"]}` });
      }
      // }
      chat_history.push({
        role: "model",
        parts: current_chat_history,
      });
      // }, delay);
    }
  }
}

async function generateAIResponse() {
  // async function ai_response(user_input, chat_history) {
  // console.log(JSON.stringify(chat_history));
  // prompt =
  //   `${intro}. This is the chat history ${JSON.stringify(
  //     chat_history
  //   )}. This is the last message sent ${last_input} where its formatting is {sender name}: {sender message}. Choose a suitable chatroom member that is not ${
  //     user["name"]
  //   } and their name is not the same as the sender name of the last message. Choose the member if the last message is addressed/related to them or else choose a new member to continue the current topic or start a new topic. The chosen chatroom member will reply to the sender of the last message, in this format with a ',\n' separator, key with name and response:` +
  //   '{"name": "new chosen member name", "response": "message"}.';
  const prompt = `${intro}. Review the chat history and consider the messages sent, they are formatted as {sender name}: {sender message}. Select a chatroom member that are not ${user["name"]} (Since that is me myself), to continue the conversation. 
  If the last message is addressed to or related to a specific member, choose them and continue the topic; 
  If the last message is addressed to me ${user["name"]}, select another member and introduce a new topic. 
  Otherwise, select a random member to either continue the current topic or introduce a new one. Don't start a new topic until the previous one is talk through by most members. The chosen member will reply to the sender of the last message strictly using the following format:
  Don't do introduction and don't greet again since they have already done so.
{"name": "selected member name", "response": "message"},
{"name": "Alice", "response": "It's great to meet you."},
{"name": "Bob", "response": "Nice to be here."},
{"name": "Charlie", "response": "I'm excited to join the conversation."}
`;

  chat_history.push({ role: "user", parts: [{ text: prompt }] });
  const result = await chat.sendMessage(prompt);
  const response = await result.response;
  let reply = response.candidates[0].content.parts[0].text;
  try {
    reply = response.candidates[0].content.parts[0].text.match(/\{.*\}/)[0];
  } catch (error) {
    console.log("result wrong format");
    console.log(reply);
    generateAIResponse();
  }
  return reply;
  // }

  // const readline = require("readline");

  // const rl = readline.createInterface({
  //   input: process.stdin,
  //   output: process.stdout,
  // });
}

async function generateResponse(user_input) {
  // async function ai_response(user_input, chat_history) {
  // console.log(chat_history);
  // prompt =
  //   `${intro}. This is the chat history ${JSON.stringify(
  //     chat_history
  //   )}. Reply to the user ${
  //     user["name"]
  //   } who just said ${user_input}. Choose a suitable chatroom member and reply in this format with a ',\n' separator, key with name and response:` +
  //   '{"name": "Alice", "response": "Hi! It\'s great to meet you."}.';

  const prompt = `${intro}. Review the chat history and reply to the user ${user["name"]} who just said ${user_input}. 
  Select a chatroom member, exclude ${user["name"]}, to continue the conversation. 
  The chosen member will reply to the message using the following format:

{"name": "selected member name", "response": "message"},
{"name": "Alice", "response": "Hi! It's great to meet you."},
{"name": "Bob", "response": "Hello there! Nice to be here."},
{"name": "Charlie", "response": "Greetings! I'm excited to join the conversation."}
`;
  chat_history.push({ role: "user", parts: [{ text: prompt }] });
  const result = await chat.sendMessage(prompt);
  const response = await result.response;
  return response.candidates[0].content.parts[0].text.split(",\n");
  // }

  // const readline = require("readline");

  // const rl = readline.createInterface({
  //   input: process.stdin,
  //   output: process.stdout,
  // });
}

async function generateResult() {
  const generated_scores_result = await chat.sendMessage(
    `${intro}. Rate the user: ${
      user["name"]
    }'s social skill from the chats: ${JSON.stringify(
      chat_history
    )}. Based on the interaction with other members in the chatroom, each member give a score to ${
      user["name"]
    }, out of a score of 10, where name is the member name and score is the rating for the interaction from the chats and comment on how the user ${
      user["name"]
    } done well or could do better when interacting with the specific member in the chat. Lastly, give an overall score and comment where name is Overall. Show in this format with a ',\n' separator, key with name, score, comment:` +
      '```{"name": "Alice", "score": "3/10", "comment": "Speak out more"}```,\n.'
  );
  const generated_comments_result = await chat.sendMessage(
    `${intro}. Comment in a paragraph and go indepth on the overall performance of the user: ${
      user["name"]
    }'s social skill from the chats: ${JSON.stringify(
      chat_history
    )}. Based on the interaction with other members in the chatroom, as the user ${
      user["name"]
    } try to achieve the goal ${user["goal"]} because ${user["reason"]}`
  );
  const generated_recommendations_result = await chat.sendMessage(
    `${intro}. Give a recommendation/advice to the user: ${
      user["name"]
    }'s social skill from the chats: ${JSON.stringify(
      chat_history
    )}. Based on the interaction with other members in the chatroom, in order for the user ${
      user["name"]
    } to achieve the goal ${user["goal"]} because ${user["reason"]}.`
  );

  const generated_scores_response = await generated_scores_result.response;
  const generated_comments_response = await generated_comments_result.response;
  const generated_recommendations_response =
    await generated_recommendations_result.response;

  // console.log("\nChat History:")
  // for (chat of chat_history) {
  //     console.log(chat)
  // }
  // console.log()

  // console.log("Overall Result:\n");
  // console.log("Scores:");

  const scores =
    generated_scores_response.candidates[0].content.parts[0].text.split(",\n");
  let f_score = [];

  // console.log(scores);
  try {
    for (let score of scores) {
      try {
        const f_scores = JSON.parse(score);
        if (f_scores) {
          // console.log(
          //   `${f_scores["name"]}: ${f_scores["score"]} : ${f_scores["comment"]}`
          // );
          f_score.push(
            `${f_scores["name"]}: ${f_scores["score"]} : ${f_scores["comment"]}`
          );
        }
      } catch (error) {
        try {
          // console.log(
          //   `${score["name"]}: ${score["score"]} : ${score["comment"]}`
          // );
          f_score.push(
            `${score["name"]}: ${score["score"]} : ${score["comment"]}`
          );
        } catch (error) {
          // console.log(score);
          f_score.push(`${score}`);
        }
      }
    }
  } catch (error) {
    // console.log(scores);
    f_score.push(`${scores}\n`);
  } finally {
    // console.log();
  }

  // console.log("Comment:");
  const comment =
    generated_comments_response.candidates[0].content.parts[0].text;
  // console.log(comment);
  // console.log();

  // console.log("Recommendation:");
  const recommendation =
    generated_recommendations_response.candidates[0].content.parts[0].text;
  // console.log(recommendation);
  // console.log();

  const result = {
    r_score: f_score,
    r_comment: comment,
    r_recommendation: recommendation,
  };
  return result;
}

async function generateContent() {
  try {
    await generateAI();
    await generateChat();
    //   const prompt = 'Create a Meal Plan for today';
    //   const result = await chat.sendMessage(prompt);
    //   const response = await result.response;
    //   console.log(response.text());
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

    async function getUserInput(user_input) {
      console.log(`${user.name}: ${user_input}`);
      // io.emit("user", user_input);
      li.textContent = user_input;
      document.getElementById("messages").appendChild(li);

      if (user_input.toLowerCase() === "exit") {
        status = false;
        // rl.close();
        const result = await generateResult();
        console.log(result);
        return; // Exit the function if user inputs "exit"
      }

      chat_history.push({
        role: "user",
        parts: [{ text: { [`${user["name"]}(Me)`]: user_input } }],
      });

      // Call ai_response function and handle ai replies
      const ai_reply = await generateResponse(user_input);
      let current_chat_history = [];
      // for (ai_reply of ai_replies) {
      // console.log(`debug: ${ai_reply}`);
      try {
        const chat_msg = JSON.parse(ai_reply);
        if (
          chat_msg &&
          chat_msg["name"].toLowerCase() != user["name"].toLowerCase()
        ) {
          current_chat_history.push({
            text: { [chat_msg["name"]]: chat_msg["response"] },
          });
          console.log(`${chat_msg["name"]}: ${chat_msg["response"]}`);
          // io.emit("model", {
          //   name: chat_msg["name"],
          //   response: chat_msg["response"],
          // });
          li.textContent = chat_msg["response"];
          document.getElementById("messages").appendChild(li);
        } else {
          console.log("chat_msg empty");
        }
      } catch (error) {
        if (ai_reply["name"].toLowerCase() != user["name"].toLowerCase()) {
          current_chat_history.push({
            text: { [ai_reply["name"]]: ai_reply["response"] },
          });
          console.log(`${ai_reply["name"]}: ${ai_reply["response"]}`);
          // io.emit("model", {
          //   name: ai_reply["name"],
          //   response: ai_reply["response"],
          // });
          li.textContent = ai_reply["response"];
          document.getElementById("messages").appendChild(li);
        }
      }
      // }
      chat_history.push({
        role: "model",
        parts: current_chat_history,
      });
    }

    getUserInput(userInput);
  });
