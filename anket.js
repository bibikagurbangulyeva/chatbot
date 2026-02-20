let preQuestions = [
    {
        id: "question1",
        text: "Насколько высоки ваши ожидания от ИИ-чат-бота в целом?",
        subtitle: "1 — очень низкие ожидания, 5 — очень высокие", 
    },
    {
        id: "question2",
        text: "Как быстро, по вашему ожиданию, бот должен отвечать?",
        subtitle: "1 — можно ждать долго, 5 — ответы должны быть мгновенными", 
    },
    {
        id: "question3",
        text: "Насколько точных и полезных рекомендаций вы ожидаете от бота?",
        subtitle: "1 — совсем не точных, 5 — максимально точных и полезных", 
    },
    {
        id: "question4",
        text: "Насколько важно для вас, чтобы бот общался «по-человечески»?",
        subtitle: "1 — совершенно не важно, 5 — очень важно", 
    },
    {
        id: "question5",
        text: "Насколько вы доверяете ИИ-чат-ботам до начала общения?",
        subtitle: "1 — совсем не доверяю, 5 — полностью доверяю", 
    },
];
let postQuestions = [
    {
        id: "experience1",
        text: "Насколько бот оправдал ваши ожидания?",
        subtitle: "1 — совсем не оправдал, 5 — полностью оправдал", 
    },
    {
        id: "experience2",
        text: "Оцените скорость ответа бота",
        subtitle: "1 — очень медленно, 5 — очень быстро", 
    },
    {
        id: "experience3",
        text: "Насколько качественными и полезными были ответы?",
        subtitle: "1 — бесполезные и неточные, 5 — очень полезные и точные", 
    },
    {
        id: "experience4",
        text: "Было ли ощущение общения с живым человеком?",
        subtitle: "1 — совсем не было, 5 — практически как с человеком", 
    },
    {
        id: "experience5",
        text: "Насколько удобным и понятным был бот в использовании?",
        subtitle: "1 — очень неудобным, 5 — максимально удобным", 
    },
    {
        id: "experience6",
        text: "Оцените общее впечатление от общения с ботом",
        subtitle: "1 — очень негативное, 5 — очень позитивное", 
    },    
]
let preAnswers = {};
let postAnswers = {};

requestType = type;

sendToSheet({
  type: "session_set_type",
  session_id: sessionId,
  request_type: requestType,
  created_at: formatDateTime()
});


function showNextQuestion() {
    let questions, index;

    if (mode === "pre_anketa") {
        questions = preQuestions;
        index = preIndex;        
    } else if (mode === "post_anketa") {
        questions = postQuestions;
        index = postIndex;
    } else {
        return;
    }

    if (index >= questions.length) {

        //the end first ancket
        if (mode === "pre_anketa") {
            mode = "select_type";
            showBranchSelector();
            updateFooterVisibility();
            return;
        }

        //the end second ancket 
        if (mode === "post_anketa") {
            sessionEndTime = formatDateTime();
            console.log("end time:", sessionEndTime);
            mode = "done";
            addBotMessage("Спасибо за участие в исследовании!");
            return;
        }
    }

    const q = questions[index]; 
    addSurveyQuestion(q, index, questions.length);
    
}
//bod message thanx
function addBotMessage(text) {
    const messageContent = `
      <svg class="bot-avatar" xmlns="http://www.w3.org/2000/svg" width="50" height="50" viewBox="0 0 1024 1024">
            <path d="M738.3 287.6H285.7c-59 0-106.8 47.8-106.8 106.8v303.1c0 59 47.8 106.8 106.8 106.8h81.5v111.1c0 .7.8 1.1 1.4.7l166.9-110.6 41.8-.8h117.4l43.6-.4c59 0 106.8-47.8 106.8-106.8V394.5c0-59-47.8-106.9-106.8-106.9zM351.7 448.2c0-29.5 23.9-53.5 53.5-53.5s53.5 23.9 53.5 53.5-23.9 53.5-53.5 53.5-53.5-23.9-53.5-53.5zm157.9 267.1c-67.8 0-123.8-47.5-132.3-109h264.6c-8.6 61.5-64.5 109-132.3 109zm110-213.7c-29.5 0-53.5-23.9-53.5-53.5s23.9-53.5 53.5-53.5 53.5 23.9 53.5 53.5-23.9 53.5-53.5 53.5zM867.2 644.5V453.1h26.5c19.4 0 35.1 15.7 35.1 35.1v121.1c0 19.4-15.7 35.1-35.1 35.1h-26.5zM95.2 609.4V488.2c0-19.4 15.7-35.1 35.1-35.1h26.5v191.3h-26.5c-19.4 0-35.1-15.7-35.1-35.1zM561.5 149.6c0 23.4-15.6 43.3-36.9 49.7v44.9h-30v-44.9c-21.4-6.5-36.9-26.3-36.9-49.7 0-28.6 23.3-51.9 51.9-51.9s51.9 23.3 51.9 51.9z"></path>
          </svg>
      <div class="message-text"></div>
    `;
  
    const messageDiv = createMessageElement(messageContent, "bot-message");
    messageDiv.querySelector(".message-text").textContent = text;
  
    chatBody.appendChild(messageDiv);
    chatBody.scrollTo({ top: chatBody.scrollHeight, behavior: "smooth" });
  }

// bot's send message questions
function addSurveyQuestion(q, index, total) {
    const template = document.getElementById("survey-question-template");
    const clone = template.content.cloneNode(true);

    const message = clone.querySelector(".message");
    const questionText = clone.querySelector(".question-text");
    const questionSubtitle = clone.querySelector(".question-subtitle");
    const inputNumber = clone.querySelector(".number");
    const sendButton = clone.querySelector(".send-answer");
    const answerRow = clone.querySelector(".answer-row");

    questionText.textContent = q.text;
    questionSubtitle.textContent = q.subtitle;

    chatBody.appendChild(clone);
    chatBody.scrollTo({ top: chatBody.scrollHeight, behavior: "smooth" });

    const updateBtnState = () => {
        if (inputNumber.value.trim()) sendButton.classList.add("active");
        else sendButton.classList.remove("active");
      };
      
      inputNumber.addEventListener("input", () => {
        let v = inputNumber.value.replace(/[^0-9]/g, "");
        if (v.length > 1) v = v.slice(0, 1);
        if (v && (v < 1 || v > 5)) v = "";
        inputNumber.value = v;
      
        updateBtnState(); // ВАЖНО: после очистки
      });
      
      updateBtnState(); // начальное состояние

      const submit = () => {
        if (!inputNumber.value.trim()) return; 
        const value = inputNumber.value.trim();
        if (!/^[1-5]$/.test(value)) {
          inputNumber.style.borderColor = "red";
          inputNumber.focus();
          return;
        }
        inputNumber.style.borderColor = "";
        addUserMessage(value);

        const num = Number(value);

        sendToSheet({
          type: "survey_answer",
          session_id: sessionId,
          stage: mode === "pre_anketa" ? "pre" : "post",
          seq: index,
          question_id: q.id,
          value: num,
          created_at: formatDateTime()
        });

        if (mode === "pre_anketa") {
            preAnswers[q.id] = num;
            preIndex++;
          } else if (mode === "post_anketa") {
            postAnswers[q.id] = num;
            postIndex++;
          } else {
            return;
          }

          answerRow.remove();
          showNextQuestion();
        };

        sendButton.addEventListener("click", submit);
        inputNumber.addEventListener("keydown", (e) => { if (e.key === "Enter") submit(); });
        setTimeout(() => inputNumber.focus(), 0);
}

//add answer like user message
function addUserMessage(text) {
    const messageContent = `<div class="message-text"></div>`;
    const outgoingMessageDiv = createMessageElement(messageContent, "user-message");
    outgoingMessageDiv.querySelector(".message-text").textContent = text;
    chatBody.appendChild(outgoingMessageDiv);
    chatBody.scrollTo({ top: chatBody.scrollHeight, behavior: "smooth" });
  }

  function showBranchSelector() {
    const template = document.getElementById("choose-branch");
    const clone = template.content.cloneNode(true);
  
    clone.querySelectorAll(".rt-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const type = btn.dataset.type; // consultation | support
        requestType = type;
        sendToSheet({
          type: "session_set_type",
          session_id: sessionId,
          request_type: requestType,
          created_at: formatDateTime()
        });
        
        console.log("Выбран тип обращения:", requestType);
        addUserMessage(btn.textContent);
  
        // убрать кнопки у этого сообщения
        const actions = btn.closest(".rt-actions");
        if (actions) actions.remove();
  
        mode = "chat";
        updateFooterVisibility();
  
        addBotMessage(
            type === "support"
              ? "Поняла. Напишите, пожалуйста, с чем именно нужна помощь: заказ, оформление, отмена, оплата или перезвонить?"
              : "Супер. Расскажите, для какого питомца нужен совет — вид, возраст и есть ли особенности."
          );          
  
        setTimeout(() => messageInput.focus(), 0);
      });
    });
  
    chatBody.appendChild(clone);
    chatBody.scrollTo({ top: chatBody.scrollHeight, behavior: "smooth" });
  }
  