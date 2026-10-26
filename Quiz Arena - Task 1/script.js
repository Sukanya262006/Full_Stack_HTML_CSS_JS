const QUESTIONS = [
  { q: "What does typeof null return?", o: ["null", "object", "undefined", "number"], a: 1, e: "A long-standing JS quirk: typeof null is 'object'." },
  { q: "Which keyword declares a block-scoped constant?", o: ["var", "let", "const", "static"], a: 2, e: "const creates a block-scoped binding that cannot be reassigned." },
  { q: "What is the result of [] + []?", o: ["[]", "0", "undefined", "'' (empty string)"], a: 3, e: "Both arrays convert to empty strings, so the result is ''." },
  { q: "What does === check that == does not?", o: ["Only value", "Type and value", "Only type", "Reference only"], a: 1, e: "=== is strict equality: no type coercion." },
  { q: "Which array method returns items that pass a test?", o: ["map", "reduce", "filter", "find"], a: 2, e: "filter returns a new array of the elements that pass the test." },
  { q: "What does typeof NaN return?", o: ["NaN", "undefined", "object", "number"], a: 3, e: "NaN is a special numeric value, so its type is 'number'." },
  { q: "Which method adds an element to the end of an array?", o: ["push", "pop", "shift", "unshift"], a: 0, e: "push appends to the end; unshift adds to the start." },
  { q: "What does JSON.stringify() do?", o: ["Parses JSON into an object", "Converts a value to a JSON string", "Validates JSON", "Encrypts an object"], a: 1, e: "It serialises a JS value into a JSON-formatted string." },
  { q: "What is a closure?", o: ["A function with no parameters", "A way to close the browser", "A function that remembers its outer scope variables", "A private class"], a: 2, e: "A closure keeps access to variables from the scope where it was created." },
  { q: "What is '5' + 3 in JavaScript?", o: ["8", "'53'", "NaN", "Error"], a: 1, e: "+ with a string concatenates, so 3 becomes '3'." },
  { q: "What is '5' - 3 in JavaScript?", o: ["2", "'53'", "NaN", "'2'"], a: 0, e: "The - operator converts the string to a number first." },
  { q: "Which of these is truthy?", o: ["0", "''", "'0'", "null"], a: 2, e: "A non-empty string, even '0', is truthy." },
  { q: "How do you select an element by its id?", o: ["document.getElementById('x')", "document.query('x')", "document.getId('x')", "document.find('#x')"], a: 0, e: "document.getElementById returns the element with that id." },
  { q: "What does addEventListener do?", o: ["Creates a new element", "Attaches a handler for an event", "Removes an element", "Sends an HTTP request"], a: 1, e: "It registers a function to run when the event fires." },
  { q: "What does an async function always return?", o: ["A string", "undefined", "A Promise", "A callback"], a: 2, e: "Async functions always wrap their return value in a Promise." },
  { q: "Which method removes the last element of an array?", o: ["shift", "pop", "splice", "slice"], a: 1, e: "pop removes and returns the last element." },
  { q: "Scope of a variable declared with var?", o: ["Block scoped", "Function scoped", "Module scoped only", "Always global"], a: 1, e: "var is function-scoped (or global outside functions)." },
  { q: "What does 0.1 + 0.2 === 0.3 return?", o: ["true", "false", "undefined", "Error"], a: 1, e: "Floating point precision makes 0.1 + 0.2 = 0.30000000000000004." },
  { q: "How does 'this' behave in an arrow function?", o: ["Always window", "Always undefined", "Inherited from the enclosing scope", "Refers to the function itself"], a: 2, e: "Arrow functions have no own 'this'; they use the surrounding one." },
  { q: "What does Array.map() return?", o: ["A filtered array", "A single value", "undefined", "A new array of the same length"], a: 3, e: "map returns a new array with each element transformed." },
  { q: "What does the spread operator (...) do?", o: ["Expands an iterable into individual elements", "Deletes elements", "Compares arrays", "Declares a variable"], a: 0, e: "Spread expands arrays/objects, e.g. [...arr] makes a shallow copy." },
  { q: "localStorage data persists...", o: ["Until the tab closes", "Until page refresh", "Even after the browser is closed", "Only for 1 hour"], a: 2, e: "localStorage has no expiry; sessionStorage clears with the tab." },
  { q: "When does setTimeout(fn, 0) run fn?", o: ["Immediately", "After the current call stack is clear", "Before any code", "Never"], a: 1, e: "The callback goes to the task queue and waits for the stack to empty." },
  { q: "Which method joins array elements into a string?", o: ["concat", "merge", "join", "toArray"], a: 2, e: "arr.join(',') returns a string with elements separated by ','." },
  { q: "What does NaN === NaN return?", o: ["true", "false", "undefined", "Error"], a: 1, e: "NaN is not equal to itself. Use Number.isNaN() to check." }
];

const TIME_LIMIT = 30;

const $ = (id) => document.getElementById(id);
const quizScreen = $("quiz-screen");
const resultScreen = $("result-screen");
const reviewScreen = $("review-screen");
const progressEl = $("progress");
const progressFill = $("progress-fill");
const timerEl = $("timer");
const scoreEl = $("score");
const questionEl = $("question");
const optionsEl = $("options");
const explanationEl = $("explanation");
const nextBtn = $("next-btn");

let questions = [];
let current = 0;
let score = 0;
let answered = false;
let timeLeft = TIME_LIMIT;
let timerId = null;
let wrongList = [];

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function startQuiz() {
  // shuffle questions and options, keeping track of the correct answer
  questions = shuffle(QUESTIONS).map((item) => {
    const correctText = item.o[item.a];
    const opts = shuffle(item.o);
    return { q: item.q, o: opts, a: opts.indexOf(correctText), e: item.e };
  });
  current = 0;
  score = 0;
  wrongList = [];
  show(quizScreen);
  loadQuestion();
}

function show(screen) {
  [quizScreen, resultScreen, reviewScreen].forEach((s) => s.classList.add("hidden"));
  screen.classList.remove("hidden");
}

function loadQuestion() {
  const item = questions[current];
  answered = false;
  progressEl.textContent = `Q ${current + 1}/${questions.length}`;
  progressFill.style.width = `${(current / questions.length) * 100}%`;
  scoreEl.textContent = `Score: ${score}`;
  questionEl.textContent = item.q;
  explanationEl.classList.add("hidden");
  nextBtn.disabled = true;
  nextBtn.textContent = current === questions.length - 1 ? "Finish" : "Next";

  optionsEl.innerHTML = "";
  item.o.forEach((text, i) => {
    const btn = document.createElement("button");
    btn.className = "option";
    btn.textContent = text;
    btn.addEventListener("click", () => selectOption(i));
    optionsEl.appendChild(btn);
  });

  startTimer();
}

function startTimer() {
  clearInterval(timerId);
  timeLeft = TIME_LIMIT;
  updateTimer();
  timerId = setInterval(() => {
    timeLeft--;
    updateTimer();
    if (timeLeft <= 0) {
      clearInterval(timerId);
      lockQuestion(-1); // time's up
    }
  }, 1000);
}

function updateTimer() {
  timerEl.textContent = `${timeLeft}s`;
  timerEl.classList.toggle("low", timeLeft <= 10);
}

function selectOption(index) {
  if (answered) return;
  clearInterval(timerId);
  lockQuestion(index);
}

// chosen = -1 means time ran out
function lockQuestion(chosen) {
  if (answered) return;
  answered = true;
  const item = questions[current];
  const buttons = optionsEl.querySelectorAll(".option");

  buttons.forEach((btn, i) => {
    btn.disabled = true;
    if (i === item.a) btn.classList.add("correct");
    else if (i === chosen) btn.classList.add("wrong");
    else btn.classList.add("locked");
  });

  if (chosen === item.a) {
    score++;
    scoreEl.textContent = `Score: ${score}`;
  } else {
    wrongList.push({
      q: item.q,
      yours: chosen === -1 ? "No answer (time up)" : item.o[chosen],
      correct: item.o[item.a],
      e: item.e
    });
  }

  explanationEl.textContent =
    (chosen === -1 ? "Time's up! " : "") + "Explanation: " + item.e;
  explanationEl.classList.remove("hidden");
  nextBtn.disabled = false;
}

function nextQuestion() {
  current++;
  if (current >= questions.length) {
    showResult();
  } else {
    loadQuestion();
  }
}

function showResult() {
  clearInterval(timerId);
  progressFill.style.width = "100%";
  const total = questions.length;
  const pct = (score / total) * 100;
  $("final-score").textContent = `${score} / ${total}`;

  let msg;
  if (pct >= 90) msg = "🏆 JavaScript Legend!";
  else if (pct >= 70) msg = "🔥 Great job! Almost a pro.";
  else if (pct >= 50) msg = "👍 Good effort. Keep practising!";
  else msg = "📚 Keep learning, you'll get there!";
  $("rating").textContent = msg;

  $("review-btn").classList.toggle("hidden", wrongList.length === 0);
  show(resultScreen);
}

function showReview() {
  const list = $("review-list");
  list.innerHTML = "";
  wrongList.forEach((w, i) => {
    const div = document.createElement("div");
    div.className = "review-item";
    div.innerHTML = `
      <p><strong>${i + 1}. ${w.q}</strong></p>
      <p class="yours">Your answer: ${w.yours}</p>
      <p class="right">Correct answer: ${w.correct}</p>
      <p>${w.e}</p>`;
    list.appendChild(div);
  });
  show(reviewScreen);
}

function restart() {
  clearInterval(timerId);
  startQuiz();
}

nextBtn.addEventListener("click", nextQuestion);
$("restart-btn").addEventListener("click", restart);
$("restart-btn-2").addEventListener("click", restart);
$("restart-btn-3").addEventListener("click", restart);
$("review-btn").addEventListener("click", showReview);
$("back-btn").addEventListener("click", () => show(resultScreen));

startQuiz();
