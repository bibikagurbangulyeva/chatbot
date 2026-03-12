const SHEET_API = "https://script.google.com/macros/s/AKfycbxQH2pTrmdSejFN1TnnHbUY0BkHjKUz9seoI3FMtMFamPcx0WfO8FQo-2z9YIJD-R1V/exec";

async function sendToSheet(payload){
    try{
      const res = await fetch(SHEET_API,{
        method:"POST",
        headers: {
          "Content-Type": "text/plain;charset=utf-8"
        },
        body: JSON.stringify(payload),
        keepalive: true,
        mode:"no-cors"
      });
      console.log("status", res.status, await res.text());
    }catch(e){
      console.error("Sheet error:", e);
    }
  }
  

const chatBody = document.querySelector(".chat-body");
const messageInput = document.querySelector(".message-input");
const sendMessageButton = document.querySelector("#send-message");
const fileInput = document.querySelector("#file-input");
const fileUploadWrapper = document.querySelector(".file-upload-wrapper");
const fileCancelButton = document.querySelector("#file-cancel");
const chatbotToggler = document.querySelector("#chatbot-toggler");
const closeChatbot = document.querySelector("#close-chatbot");
const startDialog = document.querySelector("#start-dialog");
const chatFooter = document.querySelector(".chat-footer");
const userId = localStorage.getItem("uid") || crypto.randomUUID();
localStorage.setItem("uid", userId);
let sessionId = null;
let messageSeq = 0;
let chatHistory = [];


//Chats Mode
let mode = "intro";
let requestType = null;

//unlock / block footer looking mode
function updateFooterVisibility() {
    if (mode === "chat") {
      chatFooter.style.display = "block";   // показываем только во время чата
    } else {
      chatFooter.style.display = "none";   // intro + анкеты → скрыто
    }
  }

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
  
  // const Keys =[
  //   "AIzaSyCduAu5pYp6jJGEEBhBH50JY41wdzaeY-U",
  //   "AIzaSyB0SeFjeq3GpBUd-wn61B7g-8I9kMyMMFU",
  //   "AIzaSyDQfgFNJFOEbjc4-2seBsugfSmzG6BZJKM",
  //   "AIzaSyBcoytQ6wwEvJ8MB_8jdpx-LjJCa2uCRNM",
  //   "AIzaSyDEGmQLEF-Gv1NuZmTIQXbQ9CxCb6Ocw2o",
  //   "AIzaSyBsxracRxyAhhb9Cs8EQ1nWD65WX-ekoF0"
  // ]

  // let geminiKeyIndex = 0;

  // function getGeminiUrl(){
  //   const key = Keys[geminiKeyIndex];
  //   return `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${encodeURIComponent(key)}`;
  // }
  function getGeminiUrl(){
    return "./chat.php";
  }

  // function isQuotaError(status, data) {
  //   const msg = (data && data.error && data.error.message) ? String(data.error.message) : "";
  //   return (
  //     status === 429 || // Too Many Requests / quota
  //     status === 403 || // Forbidden (часто квота/лимиты/нет доступа)
  //     /quota|rate|limit|leaked|exceed|RESOURCE_EXHAUSTED/i.test(msg)
  //   );
  // }

//Api Setup
// AIzaSyDUSq8LooL_oj4ppsUvqK_nxVgPRi9H-HE
// AIzaSyClPvIF7k4QjJNrblTvlMHwKrhSe2eV0xM

// 1 AIzaSyDQfgFNJFOEbjc4-2seBsugfSmzG6BZJKM
// 2 AIzaSyBcoytQ6wwEvJ8MB_8jdpx-LjJCa2uCRNM

//last-1  AIzaSyCduAu5pYp6jJGEEBhBH50JY41wdzaeY-U
// last-2 AIzaSyB0SeFjeq3GpBUd-wn61B7g-8I9kMyMMFU
// const API_Key = "AIzaSyCduAu5pYp6jJGEEBhBH50JY41wdzaeY-U";
// const  API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${API_Key}`;




const userData = {
    message: null,
    file: {
        data: null,
        mime_type: null,
    }
}

const initialInputHeight = messageInput.scrollHeight;

// Create message element with dynamic classes and return it
const createMessageElement = (content, ...classes) => {
    const div = document.createElement("div");
    div.classList.add("message", ...classes);
    div.innerHTML = content;
    return div;
}

function buildPrompt(requestType, userMessage) {
    const type = requestType === "support" ? "SUPPORT" : "CONSULTATION";
    const historyText = chatHistory
    .slice(-6)
    .map(item => `${item.role === "user" ? "Пользователь" : "Бот"}: ${item.text}`)
    .join("\n");
  
    return `
  Ты консультант зоомагазина. Тип: ${type}.
  Отвечай Быстро и коротко (1–2 предложения), дружелюбно, с 1 уточняющим вопросом.
  Правила общения:
- Здоровайся только в самом первом сообщении диалога.
- Продолжай разговор по текущему вопросу пользователя.
- Не пиши длинные фразы.
- Отвечай коротко и по делу.

  Запрещено: цены/наличие/оформление заказа/оплата/медицинские советы.
  
  Если Request type = CONSULTATION: Ты консультант по зоотоварам. упоминай, что это не ветеринарная консультация. не давай медицинских советов.
  Если Request type = SUPPORT: Ты служба поддержки. Разрешённые темы: Где мой заказ, Как оформить заказ, Как отменить заказ, Проблема с оплатой.

  Если вопрос вне этих тем, предложи выбрать одну из разрешённых тем.
  Если пользователь завершает диалог — добавь на новой строке: [END_SESSION].
  
  История диалога:
  ${historyText || "Истории пока нет."}

  Сообщение: ${userMessage}
  `.trim();
  }

//generate Bot response
const generateBotResponse = async (incomingMessageDiv) => {
    console.count("generateBotResponse()");
    if (mode !== "chat") {
      incomingMessageDiv.remove();
      return;
    }
  
    const messagaElement = incomingMessageDiv.querySelector(".message-text");
  
    const requstOptions = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{
          parts: [
            { text: buildPrompt(requestType, userData.message) },
            ...(userData.file?.data ? [{ inline_data: userData.file }] : [])
          ]
        }],
        generationConfig: { temperature: 0.8 }
      })
    };
  
    try {
      
        const url = getGeminiUrl();
      
        let response, data;
        try {
          response = await fetch(url, requstOptions);
          data = await response.json().catch(() => ({}));
        } catch (netErr) {
          throw new Error("Failed to fetch.");
        }
      
        if (!response.ok) {
          throw new Error(data?.error?.message || `HTTP ${response.status}`);
        }
      
        const apiResponseText = String(
          data?.candidates?.[0]?.content?.parts?.[0]?.text || ""
        ).replace(/\*\*(.*?)\*\*/g, "$1").trim();
      
        const isEndSession = apiResponseText.includes("[END_SESSION]");
        const cleanText = apiResponseText.replace("[END_SESSION]", "").trim();
        chatHistory.push({
          role: "bot",
          text: cleanText
        });
        
        if (chatHistory.length > 12) {
          chatHistory = chatHistory.slice(-12);
        }
      
        messagaElement.style.color = "";
        messagaElement.innerText = cleanText || "Нет ответа от модели.";
      
        sendToSheet({
          type: "message",
          session_id: sessionId,
          seq: ++messageSeq,
          role: "bot",
          text: cleanText,
          created_at: formatDateTime()
        });
      
        if (isEndSession) {
          sendToSheet({
            type: "session_end",
            session_id: sessionId,
            ended_at: formatDateTime()
          });
      
          setTimeout(() => {
            mode = "post_anketa";
            postIndex = 0;
            addBotMessage("Перед завершением ответьте, пожалуйста, на несколько вопросов.");
            updateFooterVisibility();
            showNextQuestion();
          }, 700);
        }
      
    } catch (error) {
      console.log(error);
      messagaElement.style.color = "#ff0000";
      messagaElement.innerText = error?.message || "Ошибка. Повторите запрос.";
    } finally {
      userData.file = {};
      incomingMessageDiv.classList.remove("thinking");
      chatBody.scrollTo({ top: chatBody.scrollHeight, behavior: "smooth" });
    }
  };


// Handle outgoing user messages
const handleOutgoingMessage = (e) => {
    console.count("handleOutgoingMessage()");
    e.preventDefault();
    userData.message = messageInput.value.trim();
    chatHistory.push({
      role: "user",
      text: userData.message
    });
    
    if (chatHistory.length > 12) {
      chatHistory = chatHistory.slice(-12);
    }
    messageInput.value = "";
    fileUploadWrapper.classList.remove("file-uploaded")
    messageInput.dispatchEvent(new Event("input"));

    //create and display user message
    const messageContent = `<div class="message-text"></div> 
                           ${userData.file.data ? `<img src="data:${userData.file.mime_type};base64,
                           ${userData.file.data}" class="attachment" />` : ""}`;

    const outgoingMessageDiv = createMessageElement(messageContent, "user-message");
    outgoingMessageDiv.querySelector(".message-text").textContent = userData.message;
    chatBody.appendChild(outgoingMessageDiv);
    chatBody.scrollTo({ top: chatBody.scrollHeight, behavior: "smooth" });

    sendToSheet({
        type: "message",
        session_id: sessionId,
        seq: ++messageSeq,
        role: "user",
        text: userData.message,
        created_at: formatDateTime()
      });

// indicator thinking
    setTimeout(() => {
        const messageContent = `<svg class="bot-avatar" xmlns="http://www.w3.org/2000/svg" width="50" height="50" viewBox="0 0 1024 1024">
              <path d="M738.3 287.6H285.7c-59 0-106.8 47.8-106.8 106.8v303.1c0 59 47.8 106.8 106.8 106.8h81.5v111.1c0 .7.8 1.1 1.4.7l166.9-110.6 41.8-.8h117.4l43.6-.4c59 0 106.8-47.8 106.8-106.8V394.5c0-59-47.8-106.9-106.8-106.9zM351.7 448.2c0-29.5 23.9-53.5 53.5-53.5s53.5 23.9 53.5 53.5-23.9 53.5-53.5 53.5-53.5-23.9-53.5-53.5zm157.9 267.1c-67.8 0-123.8-47.5-132.3-109h264.6c-8.6 61.5-64.5 109-132.3 109zm110-213.7c-29.5 0-53.5-23.9-53.5-53.5s23.9-53.5 53.5-53.5 53.5 23.9 53.5 53.5-23.9 53.5-53.5 53.5zM867.2 644.5V453.1h26.5c19.4 0 35.1 15.7 35.1 35.1v121.1c0 19.4-15.7 35.1-35.1 35.1h-26.5zM95.2 609.4V488.2c0-19.4 15.7-35.1 35.1-35.1h26.5v191.3h-26.5c-19.4 0-35.1-15.7-35.1-35.1zM561.5 149.6c0 23.4-15.6 43.3-36.9 49.7v44.9h-30v-44.9c-21.4-6.5-36.9-26.3-36.9-49.7 0-28.6 23.3-51.9 51.9-51.9s51.9 23.3 51.9 51.9z"></path>
            </svg>
            <div class="message-text">
              <div class="thinking-indicator">
                <div class="dot"></div>
                <div class="dot"></div>
                <div class="dot"></div>
              </div>
            </div>`;

        const incomingMessageDiv = createMessageElement(messageContent, "bot-message", "thinking");
        chatBody.appendChild(incomingMessageDiv);
        chatBody.scrollTo({ top: chatBody.scrollHeight, behavior: "smooth" });
        generateBotResponse(incomingMessageDiv);
    }, 100);
}

// Handle Enter key press to send message
messageInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault(); // ← обязательно тут
        const userMessage = messageInput.value.trim();
        if (userMessage && mode === "chat") {
            handleOutgoingMessage(e);
        }
    }
});

//Adjust input field height dynamically 
messageInput.addEventListener("input", () => {
    messageInput.style.height = `${initialInputHeight}px`;
    messageInput.style.height = `${messageInput.scrollHeight}px`;
    document.querySelector(".chat-form").style.borderRadius = messageInput.scrollHeight > initialInputHeight ? "15px" : "32px";
})

// Handle file input change  preciew selected file 
fileInput.addEventListener("change", () => {
    const file = fileInput.files[0];
    if(!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
        fileUploadWrapper.querySelector("img").src = e.target.result;
        fileUploadWrapper.classList.add("file-uploaded")
        const base64String = e.target.result.split(",")[1];

        // Store file data in userData 
        userData.file = {
            data: base64String,
            mime_type: file.type,
        }

        fileInput.value = "";
    }

    reader.readAsDataURL(file);
});

//Cncek uploaded file
fileCancelButton.addEventListener("click", () => {
    userData.file = {};
    fileUploadWrapper.classList.remove("file-uploaded")
});

// initialize emoji picker and handle emoji selection
const picker = new EmojiMart.Picker({
    theme: "light",
    skinTonePosition: "none",
    previewPosition: "none",
    onEmojiSelect: (emoji) => {
        const { selectionStart: start, selectionEnd: end } = messageInput;
        messageInput.setRangeText(emoji.native, start, end, "end");
        messageInput.focus();
    },
    onClickOutside: (e) => {
        if(e.target.id === "emoji-picker"){
            document.body.classList.toggle("show-emoji-picker");
        } else {
            document.body.classList.remove("show-emoji-picker");
        }
    }
});

document.querySelector(".chat-form").appendChild(picker);

//time format for base
function formatDateTime(date = new Date()) {
    const pad = (n) => n.toString().padStart(2, "0");
  
    return `${date.getFullYear()}-${pad(date.getMonth()+1)}-${pad(date.getDate())} `
         + `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
  };  

startDialog.addEventListener("click", async () => { 

    
    sessionId = crypto.randomUUID(); 
    messageSeq = 0;
    chatHistory = [];

    sendToSheet({
        type: "session_start",
        session_id: sessionId,
        user_id: userId,
        started_at: formatDateTime()
    });

    sessionStartTime = formatDateTime();
    console.log("start time:", sessionStartTime);
    
    mode = "pre_anketa"; updateFooterVisibility(); 
    startDialog.style.display = "none"; 
    addUserMessage("Продолжить");
    preIndex = 0; 
    showNextQuestion();
    
 });

sendMessageButton.addEventListener("click", (e) => handleOutgoingMessage(e));
document.querySelector("#file-upload").addEventListener("click", () => fileInput.click());
chatbotToggler.addEventListener("click", () => document.body.classList.toggle("show-chatbot"));
closeChatbot.addEventListener("click", () =>  document.body.classList.remove("show-chatbot"))


updateFooterVisibility();