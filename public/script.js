document.getElementById("chatTestForm").addEventListener("submit", (e) => {
  e.preventDefault();
  const message = document.getElementById("message").value;
  // socket.emit("chat message", message);
  document.getElementById("message").value = "";
});

// document
//   .getElementById("chatForm")
//   .addEventListener("submit", async (event) => {
//     event.preventDefault(); // Prevent default form submission

//     const userInput = document.getElementById("userInput").value;

//     try {
//       const response = await fetch("/processInput", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({ userInput }),
//       });

//       const data = await response.json();

//       if (userInput != "exit") {
//         document.getElementById("output").innerText = data.message;
//       } else {
//         for (score of data.r_score) {
//           document.getElementById("output").innerText += score;
//         }
//         document.getElementById("output").innerText +=
//           "\n" + data.r_comment + "\n";
//         document.getElementById("output").innerText +=
//           "\n" + data.r_recommendation;
//       }
//     } catch (error) {
//       console.error("Error:", error);
//     }
//   });
