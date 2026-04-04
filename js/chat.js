/* ===================================================================
   Chat — Production-grade client with canned responses, filler text,
   typewriter effects, scroll-aware behavior, and persistence
   =================================================================== */

(function() {
  'use strict';

  const messagesEl = document.getElementById('chatMessages');
  const welcomeEl = document.getElementById('chatWelcome');
  const inputEl = document.getElementById('chatInput');
  const sendBtn = document.getElementById('chatSend');
  const clearBtn = document.getElementById('chatClear');
  const suggestionsBar = document.getElementById('chatSuggestionsBar');

  if (!messagesEl || !inputEl || !sendBtn) return;

  // ── Constants ───────────────────────────────────────────────────
  const STORAGE_KEY = 'hunar_chat_history';
  const FILLER_INTERVAL = 6000;
  const TIMEOUT_MS = 36000;
  const TYPE_SPEED = 14;
  const TYPE_VARIANCE = 8;
  const ERASE_SPEED = 6;

  // ── Canned responses for known suggestions ─────────────────────
  const CANNED_RESPONSES = {
    'What do you do at PayPal?':
      'I\'m a Software Engineer on the Communications Hub team at PayPal. I build and maintain backend services using Java and Spring Boot — think push notifications, in-app alerts, and out-of-badge alerts. Basically, I make sure millions of users get the right message at the right time!',
    'Tell me about your projects':
      'I\'ve built some fun stuff! Dukh_Bank is a full-stack Java DBMS for banking operations. I also made a hybrid entertainment recommender system in Python that does age-and-context-aware suggestions. There\'s a Course Similarity Evaluator for finding overlapping uni courses, and even a Snakes and Ladders game in Java. You can check them all out on my GitHub!',
    'What\'s your tech stack?':
      'My core stack is Java and Spring Boot for backend work — REST APIs, caching strategies, that kind of thing. I also use Python a lot, especially with Jupyter for data stuff. On the design side, I\'m comfortable with Figma and Canva. And I\'ve worked with databases, recommender systems, and notification infrastructure at scale.',
    'Where did you study?':
      'I did my B.Tech in Computer Science and Applied Mathematics at IIIT Delhi — graduated in 2024. The applied math side was super useful for optimization and modeling, and it pairs really well with the CS fundamentals. Loved the rigor of blending both disciplines.',
    'What languages do you work with?':
      'Primarily Java and Python! Java is my go-to for backend services at PayPal — all the Spring Boot microservices stuff. Python I use for data analysis, scripting, and academic projects like my recommender system. I\'m pretty comfortable with both.',
    'Tell me about your PayPal work':
      'At PayPal, I\'m on the Communications Hub team in Bengaluru. My day-to-day involves developing backend services in Java and Spring Boot that handle push notifications, in-app alerts, and out-of-badge alerts. It\'s all about reliability and scale — making sure our communication infrastructure works smoothly across the entire platform.',
    'What did you study at IIIT Delhi?':
      'B.Tech in Computer Science and Applied Mathematics! It was a great combo — I got deep into algorithms, system design, and database management on the CS side, while the applied math gave me tools for optimization and analytical problem-solving. That dual perspective really helps in my engineering work.',
    'What\'s the Communications Hub?':
      'It\'s basically PayPal\'s central communication infrastructure — the system responsible for delivering push notifications, in-app alerts, and out-of-badge alerts to users. I work on the backend services that power all of this, making sure everything is reliable, scalable, and low-latency.',
    'How did you get into backend dev?':
      'It started during my internship at PayPal in 2023! I worked on reducing API latency and implementing caching strategies for the notification system. I loved the challenge of making things faster and more efficient at scale. That experience solidified my passion for backend engineering.',
    'Tell me about Dukh Bank':
      'Dukh_Bank is a project I\'m pretty proud of — it\'s an end-to-end multi-user database management system built in Java for managing a banking company. It has a frontend UI and proper data security implementations. It was a great exercise in full-stack thinking and understanding how real banking systems handle data.',
    'What\'s your experience with Spring Boot?':
      'Spring Boot is my primary framework at PayPal. I use it daily for building and maintaining the backend services on the Communications Hub. RESTful APIs, service scalability, dependency injection — it\'s become second nature. I really appreciate how it lets you focus on business logic while handling a lot of the boilerplate.',
    'What design tools do you use?':
      'Figma and Canva! I actually interned as a UI Designer at ScrapUncle before pivoting to backend engineering. I designed high-fidelity prototypes and interfaces for their web and mobile apps. That design background gives me a user-centric perspective even when I\'m working on backend systems.',
    'Tell me about your internships':
      'I\'ve done two internships! First was a UI Designer role at ScrapUncle in 2022, where I designed prototypes in Figma and Canva. Then in 2023, I interned at PayPal as a Software Engineer — worked on API latency reduction and caching strategies. Got a return offer and joined full-time in 2024!',
    'What projects are you most proud of?':
      'Honestly, the work at PayPal\'s Communications Hub — building systems that serve millions of users is incredibly rewarding. On the personal side, the hybrid recommender system was challenging and fun. And Dukh_Bank was satisfying because it was a complete end-to-end system.',
    'How do you approach system design?':
      'I focus on reliability and simplicity first. At PayPal, I\'ve learned that scalable systems start with clean abstractions and clear boundaries. I think about failure modes early, design for observability, and always consider the end-user experience — even when building backend services.',
    'What\'s your GitHub username?':
      'It\'s HunarKaur25! You can find all my projects there — github.com/HunarKaur25. I\'ve got the banking DBMS, recommender system, course evaluator, assembler simulator, and the Snakes and Ladders game.',
    'Do you have a LinkedIn?':
      'Yes! You can find me at linkedin.com/in/hunar-kaur-229067242. Feel free to connect — I\'m always happy to chat about tech, projects, or opportunities!',
    'What was your ScrapUncle internship like?':
      'It was my first professional experience! I worked as a UI Designer from June to August 2022 in New Delhi. I designed high-fidelity prototypes for their web and mobile apps using Figma and Canva. It taught me a lot about user-centric design and visual consistency.',
    'Tell me about the Recommender System':
      'It\'s an age-and-context-sensitive hybrid entertainment recommender system built in Python. It combines content-based and collaborative filtering, has spell-correcting predictive search, and maintains a user database for personalized suggestions. One of my more data-heavy projects!',
    'What caching strategies do you use?':
      'During my PayPal internship, I implemented advanced caching to optimize database and API response times for the notification ecosystem. We focused on reducing redundant DB hits and improving response latency for internal APIs. Caching is one of those things that sounds simple but gets complex at scale!',
    'What\'s your approach to API optimization?':
      'It\'s all about measuring first — find the bottlenecks, then optimize. During my internship at PayPal, I engineered solutions to reduce latency for internal APIs handling notification delivery. The key was smart caching, minimizing round-trips, and being thoughtful about data payloads.',
    'Where are you based?':
      'I\'m based in Bengaluru, India! That\'s where PayPal\'s office is for the Communications Hub team. Before this, I was in New Delhi for my time at IIIT Delhi and the ScrapUncle internship.',
    'What did you learn at IIIT Delhi?':
      'So much! The CS side covered algorithms, databases, computer architecture, and system design. The applied mathematics part was about optimization, modeling, and quantitative methods. I built projects like the Assembler-Simulator and the Course Similarity Evaluator during my coursework.',
    'How do you handle push notifications at scale?':
      'At PayPal, we ensure high reliability and availability for our notification infrastructure. It\'s about designing services that can handle massive throughput — using Spring Boot microservices, proper queueing, and robust error handling. Every notification counts when you\'re serving a global platform!',
    'Tell me about the Course Similarity Evaluator':
      'It\'s a Python tool I built to help students and administrators identify overlapping coursework within a university\'s course directory. It analyzes course content to find similarities and helps minimize redundant offerings. Built it with Jupyter Notebook.',
    'What\'s your favorite project?':
      'Hard to pick! The PayPal Communications Hub work is fulfilling because of the scale. But personally, I really enjoyed building the recommender system — combining ML techniques with a usable product was super satisfying.',
    'How did your career start?':
      'It started with my UI design internship at ScrapUncle in 2022 — that\'s where I got my first taste of building real products. Then the PayPal internship in 2023 shifted my focus to backend engineering. Got a return offer and I\'ve been working full-time as a Software Engineer since July 2024!',
    'What motivates you as an engineer?':
      'Building things that actually matter to people. At PayPal, knowing that the notifications I help deliver reach millions of users — that\'s pretty cool. I also love the puzzle aspect of engineering: taking a complex problem and finding a clean, scalable solution.',
  };

  // ── Filler texts (Hunar personality) ────────────────────────────
  const FILLERS = [
    'umm let me think about this...',
    'ooh that\'s a good one, give me a sec...',
    'hmm interesting question...',
    'ah wait, let me recall...',
    'okay so basically...',
    'let me put my thoughts together...',
  ];

  // ── Timeout fallback responses ─────────────────────────────────
  const TIMEOUT_RESPONSES = [
    'Ah sorry, I took too long thinking about that one! Could you try asking again?',
    'Hmm, my brain froze for a sec there. Mind asking that again?',
    'Oops, I got a bit lost in thought. Try again and I\'ll be quicker this time!',
    'Sorry about that — I was overthinking it. Ask me again?',
    'Looks like I needed more coffee for that one. Give it another shot!',
  ];

  const ERROR_RESPONSES = [
    'Oops, something went wrong on my end. Try again in a moment!',
    'Ah, hit a small glitch. Mind trying that again?',
    'Something tripped me up — give it another go!',
  ];

  const RATE_LIMIT_RESPONSES = [
    'Whoa, that\'s a lot of questions! Give me a breather and try again in a minute.',
    'Haha slow down! I need a sec to catch up. Try again shortly!',
  ];

  // ── Post-chat suggestion pool ──────────────────────────────────
  const POST_SUGGESTIONS = [
    'What languages do you work with?',
    'Tell me about your PayPal work',
    'What did you study at IIIT Delhi?',
    'What\'s the Communications Hub?',
    'How did you get into backend dev?',
    'Tell me about Dukh Bank',
    'What\'s your experience with Spring Boot?',
    'What design tools do you use?',
    'Tell me about your internships',
    'What projects are you most proud of?',
    'How do you approach system design?',
    'What\'s your GitHub username?',
    'Do you have a LinkedIn?',
    'What was your ScrapUncle internship like?',
    'Tell me about the Recommender System',
    'What caching strategies do you use?',
    'What\'s your approach to API optimization?',
    'Where are you based?',
    'What did you learn at IIIT Delhi?',
    'How do you handle push notifications at scale?',
    'Tell me about the Course Similarity Evaluator',
    'What\'s your favorite project?',
    'How did your career start?',
    'What motivates you as an engineer?',
  ];

  // ── State ──────────────────────────────────────────────────────
  let conversation = [];
  let isProcessing = false;
  let fillerTimer = null;
  let fillerIndex = 0;
  let typewriterAbortFn = null;
  let usedTimeoutIdx = 0;
  let usedErrorIdx = 0;
  let suggestionOffset = 0;
  let isNearBottom = true;
  let animGeneration = 0; // generation counter to kill stale animations

  // ── Initialize ─────────────────────────────────────────────────
  loadHistory();
  initScrollWatcher();

  // ── Scroll-aware behavior ─────────────────────────────────────
  function initScrollWatcher() {
    messagesEl.addEventListener('scroll', () => {
      const threshold = 120;
      const atBottom = messagesEl.scrollHeight - messagesEl.scrollTop - messagesEl.clientHeight < threshold;
      isNearBottom = atBottom;

      // Hide suggestions bar when scrolled up
      if (suggestionsBar && !atBottom) {
        suggestionsBar.style.display = 'none';
      }
    }, { passive: true });
  }

  function scrollToBottom() {
    if (!isNearBottom) return;
    requestAnimationFrame(() => {
      messagesEl.scrollTop = messagesEl.scrollHeight;
    });
  }

  function forceScrollToBottom() {
    isNearBottom = true;
    requestAnimationFrame(() => {
      messagesEl.scrollTop = messagesEl.scrollHeight;
    });
  }

  // ── Persist to localStorage ────────────────────────────────────
  function saveHistory() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        conversation: conversation,
        welcomeHidden: welcomeEl ? welcomeEl.style.display === 'none' : false,
      }));
    } catch (e) { /* full */ }
  }

  function loadHistory() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const data = JSON.parse(raw);
      if (!data.conversation || !data.conversation.length) return;

      if (welcomeEl && data.welcomeHidden) welcomeEl.style.display = 'none';

      conversation = data.conversation;
      conversation.forEach(msg => appendMessageInstant(msg.role, msg.content));
      forceScrollToBottom();
    } catch (e) {
      localStorage.removeItem(STORAGE_KEY);
    }
  }

  function clearHistory() {
    conversation = [];
    localStorage.removeItem(STORAGE_KEY);
    messagesEl.querySelectorAll('.chat-msg, .chat-typing').forEach(el => el.remove());
    if (welcomeEl) welcomeEl.style.display = '';
    if (suggestionsBar) suggestionsBar.style.display = 'none';
    suggestionOffset = 0;
    usedTimeoutIdx = 0;
    usedErrorIdx = 0;
  }

  function pickResponse(arr, idx) {
    return arr[idx % arr.length];
  }

  // ── Send message ───────────────────────────────────────────────
  async function sendMessage(text) {
    text = text.trim();
    if (!text || isProcessing) return;

    if (suggestionsBar) suggestionsBar.style.display = 'none';

    isProcessing = true;
    sendBtn.disabled = true;
    inputEl.disabled = true;
    inputEl.value = '';
    inputEl.placeholder = 'Thinking...';
    inputEl.style.height = 'auto';

    if (welcomeEl) welcomeEl.style.display = 'none';

    conversation.push({ role: 'user', content: text });
    appendMessageInstant('user', text);
    forceScrollToBottom();
    saveHistory();

    // Check for canned response first
    if (CANNED_RESPONSES[text]) {
      const canned = CANNED_RESPONSES[text];
      conversation.push({ role: 'assistant', content: canned });
      saveHistory();

      const bubble = createAssistantBubble();
      await typeTextInto(bubble.textSpan, canned);
      if (bubble.cursorSpan.parentNode) bubble.cursorSpan.remove();

      showPostSuggestions();
      finishProcessing();
      return;
    }

    // API call path
    fillerIndex = 0;
    const fillerBubble = createAssistantBubble();
    startFillerCycle(fillerBubble);

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: conversation }),
        signal: controller.signal,
      });

      clearTimeout(timeout);
      stopFillerCycle();

      if (!response.ok) {
        let fallback;
        if (response.status === 429) fallback = pickResponse(RATE_LIMIT_RESPONSES, usedErrorIdx++);
        else if (response.status === 504) fallback = pickResponse(TIMEOUT_RESPONSES, usedTimeoutIdx++);
        else fallback = pickResponse(ERROR_RESPONSES, usedErrorIdx++);
        await eraseAndTypeNew(fillerBubble, fallback);
        showPostSuggestions();
        finishProcessing();
        return;
      }

      const data = await response.json();
      const assistantText = data.content || pickResponse(ERROR_RESPONSES, usedErrorIdx++);

      conversation.push({ role: 'assistant', content: assistantText });
      saveHistory();

      await eraseAndTypeNew(fillerBubble, assistantText);
      showPostSuggestions();

    } catch (err) {
      stopFillerCycle();
      const fallback = err.name === 'AbortError'
        ? pickResponse(TIMEOUT_RESPONSES, usedTimeoutIdx++)
        : pickResponse(ERROR_RESPONSES, usedErrorIdx++);
      await eraseAndTypeNew(fillerBubble, fallback);
      showPostSuggestions();
    }

    finishProcessing();
  }

  function finishProcessing() {
    isProcessing = false;
    sendBtn.disabled = false;
    inputEl.disabled = false;
    inputEl.placeholder = 'Ask me anything...';
    inputEl.focus();
  }

  // ── Post-chat suggestions ─────────────────────────────────────
  function showPostSuggestions() {
    if (!suggestionsBar || !isNearBottom) return;

    const picks = [];
    for (let i = 0; i < 4; i++) {
      picks.push(POST_SUGGESTIONS[(suggestionOffset + i) % POST_SUGGESTIONS.length]);
    }
    suggestionOffset = (suggestionOffset + 4) % POST_SUGGESTIONS.length;

    suggestionsBar.innerHTML = picks.map(text =>
      `<button class="chat-welcome__suggestion" data-msg="${text.replace(/"/g, '&quot;')}">${text}</button>`
    ).join('');

    suggestionsBar.style.display = 'flex';

    suggestionsBar.querySelectorAll('.chat-welcome__suggestion').forEach(btn => {
      btn.addEventListener('click', () => {
        const msg = btn.getAttribute('data-msg');
        if (msg) {
          suggestionsBar.style.display = 'none';
          sendMessage(msg);
        }
      });
    });
  }

  // ── Create assistant bubble ───────────────────────────────────
  function createAssistantBubble() {
    const msgDiv = document.createElement('div');
    msgDiv.className = 'chat-msg chat-msg--assistant';

    const avatar = document.createElement('div');
    avatar.className = 'chat-msg__avatar';
    avatar.textContent = 'H';

    const bubble = document.createElement('div');
    bubble.className = 'chat-msg__bubble';

    const textSpan = document.createElement('span');
    textSpan.className = 'chat-bubble-text';
    const cursorSpan = document.createElement('span');
    cursorSpan.className = 'typewriter-cursor';

    bubble.appendChild(textSpan);
    bubble.appendChild(cursorSpan);
    msgDiv.appendChild(avatar);
    msgDiv.appendChild(bubble);
    messagesEl.appendChild(msgDiv);
    scrollToBottom();

    return { msgDiv, textSpan, cursorSpan, bubble };
  }

  // ── Filler text cycle ─────────────────────────────────────────
  function startFillerCycle(bubbleRef) {
    fillerIndex = 1;
    bubbleRef.bubble.classList.add('chat-bubble--filler');
    typeTextInto(bubbleRef.textSpan, FILLERS[0]);

    fillerTimer = setInterval(() => {
      if (fillerIndex >= FILLERS.length) { stopFillerCycle(); return; }
      const next = FILLERS[fillerIndex++];
      eraseText(bubbleRef.textSpan).then(() => typeTextInto(bubbleRef.textSpan, next));
    }, FILLER_INTERVAL);
  }

  function stopFillerCycle() {
    if (fillerTimer) { clearInterval(fillerTimer); fillerTimer = null; }
  }

  // ── Cancel all ongoing text animations ─────────────────────────
  // Bumps the generation counter. Any in-flight typeTextInto or
  // eraseText with an older generation will silently stop.
  function cancelAllAnimations(span) {
    animGeneration++;
    if (typewriterAbortFn) { typewriterAbortFn = null; }
    span.textContent = ''; // clean slate
  }

  // ── Typewriter (generation-gated, scroll-aware) ────────────────
  function typeTextInto(span, text) {
    const gen = animGeneration;
    return new Promise(resolve => {
      let i = 0;
      typewriterAbortFn = () => {
        if (gen !== animGeneration) { resolve(); return; }
        span.textContent = text;
        scrollToBottom();
        typewriterAbortFn = null;
        resolve();
      };

      (function next() {
        if (gen !== animGeneration) { resolve(); return; }
        if (i >= text.length) { typewriterAbortFn = null; resolve(); return; }
        span.textContent += text[i++];
        if (i % 6 === 0) scrollToBottom();
        setTimeout(next, TYPE_SPEED + Math.random() * TYPE_VARIANCE);
      })();
    });
  }

  function eraseText(span) {
    const gen = animGeneration;
    return new Promise(resolve => {
      (function step() {
        if (gen !== animGeneration) { resolve(); return; }
        const t = span.textContent;
        if (!t.length) { resolve(); return; }
        span.textContent = t.slice(0, -1);
        setTimeout(step, ERASE_SPEED);
      })();
    });
  }

  async function eraseAndTypeNew(bubbleRef, newText) {
    // Kill ALL in-flight animations (filler type + filler erase)
    cancelAllAnimations(bubbleRef.textSpan);
    bubbleRef.bubble.classList.remove('chat-bubble--filler');
    isNearBottom = true;
    await typeTextInto(bubbleRef.textSpan, newText);
    if (bubbleRef.cursorSpan.parentNode) bubbleRef.cursorSpan.remove();
  }

  // ── Instant append (history restore) ──────────────────────────
  function appendMessageInstant(role, text) {
    const d = document.createElement('div');
    d.className = `chat-msg chat-msg--${role}`;
    d.style.cssText = 'animation:none;opacity:1;transform:none;';
    const a = document.createElement('div');
    a.className = 'chat-msg__avatar';
    a.textContent = role === 'user' ? 'You' : 'H';
    const b = document.createElement('div');
    b.className = 'chat-msg__bubble';
    b.textContent = text;
    d.appendChild(a); d.appendChild(b);
    messagesEl.appendChild(d);
  }

  // ── Auto-resize textarea ──────────────────────────────────────
  function autoResize() {
    inputEl.style.height = 'auto';
    inputEl.style.height = Math.min(inputEl.scrollHeight, 120) + 'px';
  }

  // ── Event listeners ───────────────────────────────────────────
  sendBtn.addEventListener('click', () => { sendMessage(inputEl.value); });
  inputEl.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(inputEl.value); }
  });
  inputEl.addEventListener('input', autoResize);

  document.querySelectorAll('.chat-welcome__suggestion').forEach(btn => {
    btn.addEventListener('click', () => {
      const msg = btn.getAttribute('data-msg');
      if (msg) sendMessage(msg);
    });
  });

  if (clearBtn) clearBtn.addEventListener('click', clearHistory);

  messagesEl.addEventListener('click', (e) => {
    if (typewriterAbortFn && e.target.closest('.chat-msg--assistant')) typewriterAbortFn();
  });

})();
