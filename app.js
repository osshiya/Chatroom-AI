const { GoogleGenerativeAI } = require("@google/generative-ai");
const dotenv = require("dotenv");
const express = require("express");
const http = require("http");
const socketIO = require("socket.io");
const bodyParser = require("body-parser");

dotenv.config();

const app = express();
// app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static("public"));
app.use(
  "/socket.io",
  express.static(__dirname + "/node_modules/socket.io/client-dist")
);
const server = http.createServer(app);
const io = socketIO(server);

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
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

user_personality = `This is a ${user["language"]} chatroom consisting of a total of 6 people including me, we are of different races, cultures and religions. I am the user, my name is ${user["name"]}, I am a ${user["age"]} years old ${user["gender"]}. I am a ${user["occupation"]} and my dream is to be a ${user["dream"]}. my MBTI is a ${user["mbti"]} and my goal here is to ${user["goal"]} because ${user["reason"]}.`;

ai_personalities = [];
chat_history = [];
intro = `${user_personality}. In this chatroom we also have 5 other people: ${ai_personalities}.`;

const chat = model.startChat({
  history: [],
  generationConfig: generationConfig,
});

async function generateAI() {
  generated_personalities_result = await chat.sendMessage(
    user_personality +
      'Generate the 9 other bots\' personalities in this format with a "\n" separator: {"name": "Alice", "age": 25, "gender": "female", "occupation": "software engineer", "dream": "professional musician", "mbti": "INFJ", "goal": "provide emotional support", "reason": "I love helping others."}\n.'
  );

  const generated_personalities_response =
    await generated_personalities_result.response;

  generated_candidate = generated_personalities_response.candidates;
  generated_personalities_str = generated_candidate[0].content.parts[0].text;

  split_personalities_str = generated_personalities_str.split("\n");

  for (let personality_str of split_personalities_str) {
    // console.log(personality_str);

    try {
      let clean_personality_str = personality_str.split(". ")[1];
      personality_dict = JSON.parse(clean_personality_str);
      ai_personalities.push(personality_dict);
    } catch (error) {
      try {
        personality_dict = JSON.parse(personality_str);
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
    prompt = `${intro}. Now, ask them to introduce themselves using the following format, with each introduction separated by a comma and newline:
{"name": "Alice", "response": "Hi! It's great to meet you."},
{"name": "Bob", "response": "Hello there! Nice to be here."},
{"name": "Charlie", "response": "Greetings! I'm excited to join the conversation."}`;
    chat_history.push({ role: "user", parts: [{ text: prompt }] });
    // console.log(chat_history)
    result = await chat.sendMessage(prompt);
    const response = await result.response;

    return response.candidates[0].content.parts[0].text.split(",\n");
  }

  initial_msgs = await setup();
  current_chat_history = [];
  for (let initial_msg of initial_msgs) {
    // console.log(initial_msg);
    try {
      chat_msg = JSON.parse(initial_msg);
      if (chat_msg && chat_msg["name"] != user.name) {
        current_chat_history.push({
          text: { [chat_msg["name"]]: chat_msg["response"] },
        });
        console.log(`${chat_msg["name"]}: ${chat_msg["response"]}`);
        io.emit("model", {
          name: chat_msg["name"],
          response: chat_msg["response"],
        });
      } else {
        console.log("setup() empty");
        // io.emit("model", initial_msg);
      }
    } catch (error) {
      console.log("setup() err");
      if (initial_msg["name"] != user.name) {
        current_chat_history.push({
          text: { [initial_msg["name"]]: initial_msg["response"] },
        });
        console.log(`${initial_msg["name"]}: ${initial_msg["response"]}`);
        io.emit("model", {
          name: initial_msg["name"],
          response: initial_msg["response"],
        });
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

      current_chat_history = [];
      // for (ai_reply of ai_replies) {
      try {
        chat_msg = JSON.parse(ai_reply);
        if (chat_msg && chat_msg["name"] != user.name) {
          current_chat_history.push({
            text: { [chat_msg["name"]]: chat_msg["response"] },
          });
          console.log(`${chat_msg["name"]}: ${chat_msg["response"]}`);
          io.emit("model", {
            name: chat_msg["name"],
            response: chat_msg["response"],
          });
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
            if (ai_reply["name"] != user.name) {
              console.log("generateAIResponse() err");
              current_chat_history.push({
                text: { [ai_reply["name"]]: ai_reply["response"] },
              });
              console.log(`${ai_reply["name"]}: ${ai_reply["response"]}`);
              io.emit("model", {
                name: ai_reply["name"],
                response: ai_reply["response"],
              });
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
  prompt = `${intro}. Review the chat history and consider the messages sent, they are formatted as {sender name}: {sender message}. Select a chatroom member that are not ${user["name"]} (Since that is me myself), to continue the conversation. 
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
  result = await chat.sendMessage(prompt);
  const response = await result.response;
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

  prompt = `${intro}. Review the chat history and reply to the user ${user["name"]} who just said ${user_input}. 
  Select a chatroom member, exclude ${user["name"]}, to continue the conversation. 
  The chosen member will reply to the message using the following format:

{"name": "selected member name", "response": "message"},
{"name": "Alice", "response": "Hi! It's great to meet you."},
{"name": "Bob", "response": "Hello there! Nice to be here."},
{"name": "Charlie", "response": "Greetings! I'm excited to join the conversation."}
`;
  chat_history.push({ role: "user", parts: [{ text: prompt }] });
  result = await chat.sendMessage(prompt);
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
  generated_scores_result = await chat.sendMessage(
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
  generated_comments_result = await chat.sendMessage(
    `${intro}. Comment in a paragraph and go indepth on the overall performance of the user: ${
      user["name"]
    }'s social skill from the chats: ${JSON.stringify(
      chat_history
    )}. Based on the interaction with other members in the chatroom, as the user ${
      user["name"]
    } try to achieve the goal ${user["goal"]} because ${user["reason"]}`
  );
  generated_recommendations_result = await chat.sendMessage(
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

  scores =
    generated_scores_response.candidates[0].content.parts[0].text.split(",\n");
  f_score = [];

  // console.log(scores);
  try {
    for (score of scores) {
      try {
        f_scores = JSON.parse(score);
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
  comment = generated_comments_response.candidates[0].content.parts[0].text;
  // console.log(comment);
  // console.log();

  // console.log("Recommendation:");
  recommendation =
    generated_recommendations_response.candidates[0].content.parts[0].text;
  // console.log(recommendation);
  // console.log();

  result = {
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

// Add route to handle form submission
app.post("/processInput", (req, res) => {
  const userInput = req.body.userInput;

  async function getUserInput(user_input) {
    console.log(`${user.name}: ${user_input}`);
    io.emit("user", user_input);

    if (user_input.toLowerCase() === "exit") {
      status = false;
      // rl.close();
      result = await generateResult();
      console.log(result);
      res.json(result);
      return; // Exit the function if user inputs "exit"
    }

    chat_history.push({
      role: "user",
      parts: [{ text: { [`${user["name"]}(Me)`]: user_input } }],
    });

    // Call ai_response function and handle ai replies
    ai_reply = await generateResponse(user_input);
    current_chat_history = [];
    // for (ai_reply of ai_replies) {
    // console.log(`debug: ${ai_reply}`);
    try {
      chat_msg = JSON.parse(ai_reply);
      if (chat_msg && chat_msg["name"] != user.name) {
        current_chat_history.push({
          text: { [chat_msg["name"]]: chat_msg["response"] },
        });
        console.log(`${chat_msg["name"]}: ${chat_msg["response"]}`);
        io.emit("model", {
          name: chat_msg["name"],
          response: chat_msg["response"],
        });
        res.json({
          message: `${chat_msg["name"]}: ${chat_msg["response"]}`,
        });
      } else {
        console.log("chat_msg empty");
        res.json({
          message: `${chat_msg}`,
        });
      }
    } catch (error) {
                  if (ai_reply["name"] != user.name) {
      current_chat_history.push({
        text: { [ai_reply["name"]]: ai_reply["response"] },
      });
      console.log(`${ai_reply["name"]}: ${ai_reply["response"]}`);
      io.emit("model", {
        name: ai_reply["name"],
        response: ai_reply["response"],
      });
      res.json({ message: `${ai_reply["name"]}: ${ai_reply["response"]}` });
    }
  }
    // }
    chat_history.push({
      role: "model",
      parts: current_chat_history,
    });
  }

  getUserInput(userInput);

  // Send output back to client
  // console.log(output)
});

// Socket.IO connection handling
io.on("connection", (socket) => {
  console.log("A user connected");

  socket.on("chat message", (msg) => {
    console.log("message: " + msg);
    io.emit("chat message", msg);
  });

  socket.on("disconnect", () => {
    console.log("A user disconnected");
  });
});

server.listen(3000, () => {
  console.log("Server is running on port 3000");
});
