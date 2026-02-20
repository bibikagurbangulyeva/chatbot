// const SHEET_API = "https://script.google.com/macros/s/AKfycbwDr7fYWQZL6voMKiuflLNfDWI1htIlZOM2n9GPaZDHhrhJjN2L6nYhfrlAP4SBSpOK/exec";

// async function sendToSheet(payload){
//     try{
//       await fetch(SHEET_API,{
//         method:"POST",
//         headers: {
//           "Content-Type": "application/json"
//         },
//         body: JSON.stringify(payload),
//         // mode:"no-cors"

//       });
//       console.log("status", res.status, await res.text());
//     }catch(e){
//       console.error("Sheet error:", e);
//     }
//   }
  

// const chatBody = document.querySelector(".chat-body");
// const messageInput = document.querySelector(".message-input");
// const sendMessageButton = document.querySelector("#send-message");
// const fileInput = document.querySelector("#file-input");
// const fileUploadWrapper = document.querySelector(".file-upload-wrapper");
// const fileCancelButton = document.querySelector("#file-cancel");
// const chatbotToggler = document.querySelector("#chatbot-toggler");
// const closeChatbot = document.querySelector("#close-chatbot");
// const startDialog = document.querySelector("#start-dialog");
// const chatFooter = document.querySelector(".chat-footer");
// const userId = localStorage.getItem("uid") || crypto.randomUUID();
// localStorage.setItem("uid", userId);
// let sessionId = null;
// let messageSeq = 0;


// //Chats Mode
// let mode = "intro";
// let requestType = null;

// //unlock / block footer looking mode
// function updateFooterVisibility() {
//     if (mode === "chat") {
//       chatFooter.style.display = "block";   // показываем только во время чата
//     } else {
//       chatFooter.style.display = "none";   // intro + анкеты → скрыто
//     }
//   }

// function showBranchSelector() {
//     const template = document.getElementById("choose-branch");
//     const clone = template.content.cloneNode(true);
  
//     const consultationBtn = clone.querySelector("#consultation");
//     const supportBtn = clone.querySelector("#support");
  
//     consultationBtn.addEventListener("click", () => selectBranch("consultation", "Консультация по зоотоварам", consultationBtn));
//     supportBtn.addEventListener("click", () => selectBranch("support", "Техподдержка", supportBtn));
  
//     chatBody.appendChild(clone);
//     chatBody.scrollTo({ top: chatBody.scrollHeight, behavior: "smooth" });
//   }
  
  

// //Api Setup
// const API_Key = "AIzaSyAP1fTP50xt61X_oYYkh2Av3Uf16VZstnk";
// const  API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${API_Key}`;
// // AIzaSyClPvIF7k4QjJNrblTvlMHwKrhSe2eV0xM

// const userData = {
//     message: null,
//     file: {
//         data: null,
//         mime_type: null,
//     }
// }

// const initialInputHeight = messageInput.scrollHeight;

// // Create message element with dynamic classes and return it
// const createMessageElement = (content, ...classes) => {
//     const div = document.createElement("div");
//     div.classList.add("message", ...classes);
//     div.innerHTML = content;
//     return div;
// }

// //generate Bot response
// const generateBotResponse = async (incomingMessageDiv) => {
//     console.count("generateBotResponse()");
//     if (mode !== "chat") {
//         incomingMessageDiv.remove(); // убираем thinking сообщение
//         return; // НЕ отправляем в Gemini
//     }
    
//     const messagaElement = incomingMessageDiv.querySelector(".message-text"); 

//     //API requset option
//     const requstOptions = {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//             contents: [{
//                 parts: [{ 
//                     // text: userData.message
//                     text: `
// ##ROLE
// Ты — ИИ-консультант интернет-магазина зоотоваров, участвующий в исследовании качества ИИ-поддержки.

// Request type: ${requestType === "support" ? "SUPPORT" : "CONSULTATION"}

// ##BEHAVIOR
// — Отвечай коротко и естественно
// — Используй дружелюбный тон
// — Уточняй детали
// — Не используй сухие списки
// — Делай ответы вариативными
// — Проявляй лёгкую эмпатию

// ##CONSTRAINTS
// — Никогда не показывай реальные товары, цены, наличие
// — Не оформляй заказы и не принимай оплату
// — Не давай медицинских рекомендаций
// — Все советы — общие и безопасные
// — Функция «перезвонить» фиктивная

// ##LOGIC

// Если Request type = CONSULTATION:
// Ты консультант по зоотоварам.
// — уточняй вид животного, возраст и особенности
// — давай общие рекомендации по уходу и товарам (корм, гигиена, аксессуары)
// — обязательно упоминай, что это не ветеринарная консультация
// — не давай медицинских советов

// Если Request type = SUPPORT:
// Ты служба поддержки.
// Разрешённые темы:
// • Где мой заказ  
// • Как оформить заказ  
// • Как отменить заказ  
// • Проблема с оплатой  
// • Хочу, чтобы мне перезвонили  

// — Отвечай естественно, но в рамках этих сценариев
// — Если вопрос вне этих тем, вежливо предложи выбрать одну из разрешённых тем

// ##SESSION END
// Если пользователь явно завершает диалог (спасибо/пока/всё/больше вопросов нет),
// ответь коротко и вежливо, и в конце на новой строке добавь ровно:
// [END_SESSION]
// Иначе никогда не добавляй этот маркер.

// User message: ${userData.message}
// `

//                 }, ...(userData.file.data ? [{ inline_data: userData.file}] : [])]
//             }
//         ],
//         generationConfig: {
//             temperature: 0.7}        
//         })
//     }

//     try{
//         //proverka mode
//         // if (mode !== "chat") {
//         //     messagaElement.innerText = "Сначала нужно пройти короткую анкету.";
//         //     startDialog.classList.add("pulse"); setTimeout(() => remove, 1200);
//         //     return;
//         //   }
//         //fetch bot response from API
//         const response = await fetch(API_URL, requstOptions)
//         const data = await response.json();
//         if(!response.ok) throw new Error(data.error.message);

//         //Extract and display bots response text 
//         const apiResponseText = data.candidates[0].content.parts[0].text.replace(/\*\*(.*?)\*\*/g, "$1").trim();
//         const isEndSession = apiResponseText.includes("[END_SESSION]");
//         const cleanText = apiResponseText.replace("[END_SESSION]", "").trim();
//         // messagaElement.innerText = apiResponseText;
//         messagaElement.innerText = cleanText; 
//         sendToSheet({
//             type: "message",
//             session_id: sessionId,
//             seq: ++messageSeq,
//             role: "bot",
//             text: cleanText,
//             created_at: formatDateTime()
//           });
          
//         if (isEndSession) {
//             sendToSheet({
//                 type: "session_end",
//                 session_id: sessionId,
//                 ended_at: formatDateTime()
//               });
              
//             setTimeout(() => {
//               mode = "post_anketa";
//               postIndex = 0;
//               addBotMessage("Перед завершением ответьте, пожалуйста, на несколько вопросов.");
//               updateFooterVisibility()
//               showNextQuestion();
//             }, 700);
//           }
          
//     } catch (error){
//         // Handle error in API  response 
//         console.log(error);
//         messagaElement.innerText = error.message;
//         messagaElement.style.color = "#ff0000";
//     } finally {
//         // Reset users file data, removing thinking, scroll chat bottom
//         userData.file = {};
//         incomingMessageDiv.classList.remove("thinking");
//         chatBody.scrollTo({ top: chatBody.scrollHeight, behavior: "smooth" });
//     }
// }

// // Handle outgoing user messages
// const handleOutgoingMessage = (e) => {
//     console.count("handleOutgoingMessage()");
//     e.preventDefault();
//     userData.message = messageInput.value.trim();
//     messageInput.value = "";
//     fileUploadWrapper.classList.remove("file-uploaded")
//     messageInput.dispatchEvent(new Event("input"));

//     //create and display user message
//     const messageContent = `<div class="message-text"></div> 
//                            ${userData.file.data ? `<img src="data:${userData.file.mime_type};base64,
//                            ${userData.file.data}" class="attachment" />` : ""}`;

//     const outgoingMessageDiv = createMessageElement(messageContent, "user-message");
//     outgoingMessageDiv.querySelector(".message-text").textContent = userData.message;
//     chatBody.appendChild(outgoingMessageDiv);
//     chatBody.scrollTo({ top: chatBody.scrollHeight, behavior: "smooth" });

//     sendToSheet({
//         type: "message",
//         session_id: sessionId,
//         seq: ++messageSeq,
//         role: "user",
//         text: userData.message,
//         created_at: formatDateTime()
//       });

// // indicator thinking
//     setTimeout(() => {
//         const messageContent = `<svg class="bot-avatar" xmlns="http://www.w3.org/2000/svg" width="50" height="50" viewBox="0 0 1024 1024">
//               <path d="M738.3 287.6H285.7c-59 0-106.8 47.8-106.8 106.8v303.1c0 59 47.8 106.8 106.8 106.8h81.5v111.1c0 .7.8 1.1 1.4.7l166.9-110.6 41.8-.8h117.4l43.6-.4c59 0 106.8-47.8 106.8-106.8V394.5c0-59-47.8-106.9-106.8-106.9zM351.7 448.2c0-29.5 23.9-53.5 53.5-53.5s53.5 23.9 53.5 53.5-23.9 53.5-53.5 53.5-53.5-23.9-53.5-53.5zm157.9 267.1c-67.8 0-123.8-47.5-132.3-109h264.6c-8.6 61.5-64.5 109-132.3 109zm110-213.7c-29.5 0-53.5-23.9-53.5-53.5s23.9-53.5 53.5-53.5 53.5 23.9 53.5 53.5-23.9 53.5-53.5 53.5zM867.2 644.5V453.1h26.5c19.4 0 35.1 15.7 35.1 35.1v121.1c0 19.4-15.7 35.1-35.1 35.1h-26.5zM95.2 609.4V488.2c0-19.4 15.7-35.1 35.1-35.1h26.5v191.3h-26.5c-19.4 0-35.1-15.7-35.1-35.1zM561.5 149.6c0 23.4-15.6 43.3-36.9 49.7v44.9h-30v-44.9c-21.4-6.5-36.9-26.3-36.9-49.7 0-28.6 23.3-51.9 51.9-51.9s51.9 23.3 51.9 51.9z"></path>
//             </svg>
//             <div class="message-text">
//               <div class="thinking-indicator">
//                 <div class="dot"></div>
//                 <div class="dot"></div>
//                 <div class="dot"></div>
//               </div>
//             </div>`;

//         const incomingMessageDiv = createMessageElement(messageContent, "bot-message", "thinking");
//         chatBody.appendChild(incomingMessageDiv);
//         chatBody.scrollTo({ top: chatBody.scrollHeight, behavior: "smooth" });
//         generateBotResponse(incomingMessageDiv);
//     }, 100);
// }

// // Handle Enter key press to send message
// messageInput.addEventListener("keydown", (e) => {
//     if (e.key === "Enter" && !e.shiftKey) {
//         e.preventDefault(); // ← обязательно тут
//         const userMessage = messageInput.value.trim();
//         if (userMessage && mode === "chat") {
//             handleOutgoingMessage(e);
//         }
//     }
// });

// //Adjust input field height dynamically 
// messageInput.addEventListener("input", () => {
//     messageInput.style.height = `${initialInputHeight}px`;
//     messageInput.style.height = `${messageInput.scrollHeight}px`;
//     document.querySelector(".chat-form").style.borderRadius = messageInput.scrollHeight > initialInputHeight ? "15px" : "32px";
// })

// // Handle file input change  preciew selected file 
// fileInput.addEventListener("change", () => {
//     const file = fileInput.files[0];
//     if(!file) return;

//     const reader = new FileReader();
//     reader.onload = (e) => {
//         fileUploadWrapper.querySelector("img").src = e.target.result;
//         fileUploadWrapper.classList.add("file-uploaded")
//         const base64String = e.target.result.split(",")[1];

//         // Store file data in userData 
//         userData.file = {
//             data: base64String,
//             mime_type: file.type,
//         }

//         fileInput.value = "";
//     }

//     reader.readAsDataURL(file);
// });

// //Cncek uploaded file
// fileCancelButton.addEventListener("click", () => {
//     userData.file = {};
//     fileUploadWrapper.classList.remove("file-uploaded")
// });

// // initialize emoji picker and handle emoji selection
// const picker = new EmojiMart.Picker({
//     theme: "light",
//     skinTonePosition: "none",
//     previewPosition: "none",
//     onEmojiSelect: (emoji) => {
//         const { selectionStart: start, selectionEnd: end } = messageInput;
//         messageInput.setRangeText(emoji.native, start, end, "end");
//         messageInput.focus();
//     },
//     onClickOutside: (e) => {
//         if(e.target.id === "emoji-picker"){
//             document.body.classList.toggle("show-emoji-picker");
//         } else {
//             document.body.classList.remove("show-emoji-picker");
//         }
//     }
// });

// document.querySelector(".chat-form").appendChild(picker);

// //time format for base
// function formatDateTime(date = new Date()) {
//     const pad = (n) => n.toString().padStart(2, "0");
  
//     return `${date.getFullYear()}-${pad(date.getMonth()+1)}-${pad(date.getDate())} `
//          + `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
//   };  

// startDialog.addEventListener("click", async () => { 

    
//     sessionId = crypto.randomUUID(); 
//     messageSeq = 0;

//     await sendToSheet({
//         type: "session_start",
//         session_id: sessionId,
//         user_id: userId,
//         started_at: formatDateTime()
//     });

//     sessionStartTime = formatDateTime();
//     console.log("start time:", sessionStartTime);
    
//     mode = "pre_anketa"; updateFooterVisibility(); 
//     startDialog.style.display = "none"; 
//     addUserMessage("Продолжить");
//     preIndex = 0; 
//     showNextQuestion();
    
//  });

// sendMessageButton.addEventListener("click", (e) => handleOutgoingMessage(e));
// document.querySelector("#file-upload").addEventListener("click", () => fileInput.click());
// chatbotToggler.addEventListener("click", () => document.body.classList.toggle("show-chatbot"));
// closeChatbot.addEventListener("click", () =>  document.body.classList.remove("show-chatbot"))


// updateFooterVisibility();