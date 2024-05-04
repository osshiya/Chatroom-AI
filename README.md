# Chatroom AI

Elevate Your Social Skills through Conversations in an AI-Powered Chatroom!

## Table of Contents

1. [Installation Instructions](#installation-instructions)
2. [Inspiration](#inspiration)
3. [What it does](#what-it-does)
4. [How we built it](#how-we-built-it)
5. [Challenges we ran into](#challenges-we-ran-into)
6. [Accomplishments that we're proud of](#accomplishments-that-we're-proud-of)
7. [What we learned](#what-we-learned)
8. [What's next for Chatroom AI](#what's-next-for-Chatroom-AI)

## Installation Instructions

There are two methods to access the application:

1. **Node.js:**
   - Run `npm install` in the command line.
   - Run `node app.js` in the command line.
   - Create a `.env` file and add the API key:
     ```
     GOOGLE_API_KEY=your_google_api_key_here
     ```
   - Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

2. **Web:**
   - Open `public/index.html` to view it in your browser.
   - Or visit [https://chatroom-ai.vercel.app/](https://chatroom-ai.vercel.app/)

## Inspiration

The inspiration for Chatroom AI stemmed from the role-playing mechanism of Autonomous Agents that also utilize Large Language Models (LLMs) like Gemini. We were intrigued by the idea of simulating realistic interactions in a chatroom environment through roleplaying using Generative AI.

## What it does

Chatroom AI serves as a virtual platform where individuals can engage in conversations and interactions within a simulated chatroom environment. Designed with the intention of helping socially awkward individuals improve their social skills, Chatroom AI provides a safe and supportive space for users to practice and develop their communication abilities.

Through realistic role-playing scenarios and interactive dialogues, users are presented with opportunities to engage in conversations with virtual characters and other users. The AI-powered chatbot within Chatroom AI offers valuable feedback and advice based on the user's interactions, helping them identify areas for improvement and providing personalized guidance on how to enhance their social skills.

By leveraging the immersive nature of virtual environments, Chatroom AI enables users to gain confidence and proficiency in various social situations, ultimately empowering them to navigate real-life interactions more effectively. Whether it's learning how to initiate conversations, actively listen, or express oneself confidently, Chatroom AI offers a supportive learning experience tailored to the unique needs of each user.

As users continue to engage with Chatroom AI, they receive ongoing support and encouragement, gradually building their social competence and overcoming social barriers. With its innovative approach to social skills development, Chatroom AI aims to empower individuals to thrive in both virtual and real-world social interactions.

## How we built it

We built Chatroom AI by integrating the Gemini API with Node.js and web development technologies. This involved creating a backend server using Node.js to handle requests and responses, as well as developing the frontend interface using HTML, CSS, and JavaScript.

## Challenges we ran into

One of the main challenges we encountered was managing multiple "users" within the chatroom environment while maintaining a coherent and engaging role-playing experience. Additionally, integrating the chatbot with the history of the chat posed its own set of challenges.

## Accomplishments that we're proud of

We are proud of successfully creating a functional and engaging chatroom environment powered by AI. Additionally, we are proud of the collaborative effort and problem-solving skills demonstrated by our team throughout the development process.

## What we learned

Through the development of Chatroom AI, we gained valuable insights into generative AI technologies and their applications in simulating human-like interactions. We also honed our skills in backend and frontend development, as well as project management and collaboration.

## What's next for Chatroom AI

In the future, we plan to implement key features of Gemini, such as multimodal capabilities, to further enhance the realism and effectiveness of the role-playing experience. Additionally, we aim to improve the prompts and interactions within the chatroom to provide users with a more immersive and enjoyable experience.
