/* ===================================================================
   Chat — Queue-based animation system with exclusive ownership
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

  // ── Config ─────────────────────────────────────────────────────
  const STORAGE_KEY = 'hunar_chat_history';
  const TIMEOUT_MS = 36000;
  const FILLER_DELAY = 5000;
  const FILLER_INTERVAL = 6000;
  const CANNED_DELAY = 2000;
  const TYPE_SPEED = 22;
  const TYPE_VARIANCE = 14;

  // ── Canned responses ───────────────────────────────────────────
  const CANNED_RESPONSES = {
    'What do you do at PayPal?': 'I\'m a Software Engineer on the Communications Hub team at PayPal. I build and maintain backend services using Java and Spring Boot — think push notifications, in-app alerts, and out-of-badge alerts. Basically, I make sure millions of users get the right message at the right time!',
    'Tell me about your projects': 'I\'ve built some fun stuff! Dukh_Bank is a full-stack Java DBMS for banking operations. I also made a hybrid entertainment recommender system in Python that does age-and-context-aware suggestions. There\'s a Course Similarity Evaluator for finding overlapping uni courses, and even a Snakes and Ladders game in Java. You can check them all out on my GitHub!',
    'What\'s your tech stack?': 'My core stack is Java and Spring Boot for backend work — REST APIs, caching strategies, that kind of thing. I also use Python a lot, especially with Jupyter for data stuff. On the design side, I\'m comfortable with Figma and Canva. And I\'ve worked with databases, recommender systems, and notification infrastructure at scale.',
    'Where did you study?': 'I did my B.Tech in Computer Science and Applied Mathematics at IIIT Delhi — graduated in 2024. The applied math side was super useful for optimization and modeling, and it pairs really well with the CS fundamentals. Loved the rigor of blending both disciplines.',
    'What languages do you work with?': 'Primarily Java and Python! Java is my go-to for backend services at PayPal — all the Spring Boot microservices stuff. Python I use for data analysis, scripting, and academic projects like my recommender system. I\'m pretty comfortable with both.',
    'Tell me about your PayPal work': 'At PayPal, I\'m on the Communications Hub team in Bengaluru. My day-to-day involves developing backend services in Java and Spring Boot that handle push notifications, in-app alerts, and out-of-badge alerts. It\'s all about reliability and scale — making sure our communication infrastructure works smoothly across the entire platform.',
    'What did you study at IIIT Delhi?': 'B.Tech in Computer Science and Applied Mathematics! It was a great combo — I got deep into algorithms, system design, and database management on the CS side, while the applied math gave me tools for optimization and analytical problem-solving. That dual perspective really helps in my engineering work.',
    'What\'s the Communications Hub?': 'It\'s basically PayPal\'s central communication infrastructure — the system responsible for delivering push notifications, in-app alerts, and out-of-badge alerts to users. I work on the backend services that power all of this, making sure everything is reliable, scalable, and low-latency.',
    'How did you get into backend dev?': 'It started during my internship at PayPal in 2023! I worked on reducing API latency and implementing caching strategies for the notification system. I loved the challenge of making things faster and more efficient at scale. That experience solidified my passion for backend engineering.',
    'Tell me about Dukh Bank': 'Dukh_Bank is a project I\'m pretty proud of — it\'s an end-to-end multi-user database management system built in Java for managing a banking company. It has a frontend UI and proper data security implementations. It was a great exercise in full-stack thinking and understanding how real banking systems handle data.',
    'What\'s your experience with Spring Boot?': 'Spring Boot is my primary framework at PayPal. I use it daily for building and maintaining the backend services on the Communications Hub. RESTful APIs, service scalability, dependency injection — it\'s become second nature. I really appreciate how it lets you focus on business logic while handling a lot of the boilerplate.',
    'What design tools do you use?': 'Figma and Canva! I actually interned as a UI Designer at ScrapUncle before pivoting to backend engineering. I designed high-fidelity prototypes and interfaces for their web and mobile apps. That design background gives me a user-centric perspective even when I\'m working on backend systems.',
    'Tell me about your internships': 'I\'ve done two internships! First was a UI Designer role at ScrapUncle in 2022, where I designed prototypes in Figma and Canva. Then in 2023, I interned at PayPal as a Software Engineer — worked on API latency reduction and caching strategies. Got a return offer and joined full-time in 2024!',
    'What projects are you most proud of?': 'Honestly, the work at PayPal\'s Communications Hub — building systems that serve millions of users is incredibly rewarding. On the personal side, the hybrid recommender system was challenging and fun. And Dukh_Bank was satisfying because it was a complete end-to-end system.',
    'How do you approach system design?': 'I focus on reliability and simplicity first. At PayPal, I\'ve learned that scalable systems start with clean abstractions and clear boundaries. I think about failure modes early, design for observability, and always consider the end-user experience — even when building backend services.',
    'What\'s your GitHub username?': 'It\'s HunarKaur25! You can find all my projects there — github.com/HunarKaur25. I\'ve got the banking DBMS, recommender system, course evaluator, assembler simulator, and the Snakes and Ladders game.',
    'Do you have a LinkedIn?': 'Yes! You can find me at linkedin.com/in/hunar-kaur-229067242. Feel free to connect — I\'m always happy to chat about tech, projects, or opportunities!',
    'What was your ScrapUncle internship like?': 'It was my first professional experience! I worked as a UI Designer from June to August 2022 in New Delhi. I designed high-fidelity prototypes for their web and mobile apps using Figma and Canva. It taught me a lot about user-centric design and visual consistency.',
    'Tell me about the Recommender System': 'It\'s an age-and-context-sensitive hybrid entertainment recommender system built in Python. It combines content-based and collaborative filtering, has spell-correcting predictive search, and maintains a user database for personalized suggestions. One of my more data-heavy projects!',
    'What caching strategies do you use?': 'During my PayPal internship, I implemented advanced caching to optimize database and API response times for the notification ecosystem. We focused on reducing redundant DB hits and improving response latency for internal APIs. Caching is one of those things that sounds simple but gets complex at scale!',
    'What\'s your approach to API optimization?': 'It\'s all about measuring first — find the bottlenecks, then optimize. During my internship at PayPal, I engineered solutions to reduce latency for internal APIs handling notification delivery. The key was smart caching, minimizing round-trips, and being thoughtful about data payloads.',
    'Where are you based?': 'I\'m based in Bengaluru, India! That\'s where PayPal\'s office is for the Communications Hub team. Before this, I was in New Delhi for my time at IIIT Delhi and the ScrapUncle internship.',
    'What did you learn at IIIT Delhi?': 'So much! The CS side covered algorithms, databases, computer architecture, and system design. The applied mathematics part was about optimization, modeling, and quantitative methods. I built projects like the Assembler-Simulator and the Course Similarity Evaluator during my coursework.',
    'How do you handle push notifications at scale?': 'At PayPal, we ensure high reliability and availability for our notification infrastructure. It\'s about designing services that can handle massive throughput — using Spring Boot microservices, proper queueing, and robust error handling. Every notification counts when you\'re serving a global platform!',
    'Tell me about the Course Similarity Evaluator': 'It\'s a Python tool I built to help students and administrators identify overlapping coursework within a university\'s course directory. It analyzes course content to find similarities and helps minimize redundant offerings. Built it with Jupyter Notebook.',
    'What\'s your favorite project?': 'Hard to pick! The PayPal Communications Hub work is fulfilling because of the scale. But personally, I really enjoyed building the recommender system — combining ML techniques with a usable product was super satisfying.',
    'How did your career start?': 'It started with my UI design internship at ScrapUncle in 2022 — that\'s where I got my first taste of building real products. Then the PayPal internship in 2023 shifted my focus to backend engineering. Got a return offer and I\'ve been working full-time as a Software Engineer since July 2024!',
    'What motivates you as an engineer?': 'Building things that actually matter to people. At PayPal, knowing that the notifications I help deliver reach millions of users — that\'s pretty cool. I also love the puzzle aspect of engineering: taking a complex problem and finding a clean, scalable solution.',
  };

  const FILLERS = [
    'umm let me think about this...',
    'ooh that\'s a good one, give me a sec...',
    'hmm interesting question...',
    'ah wait, let me recall...',
    'okay so basically...',
    'let me put my thoughts together...',
  ];

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

  const POST_SUGGESTIONS = [
    'What languages do you work with?', 'Tell me about your PayPal work',
    'What did you study at IIIT Delhi?', 'What\'s the Communications Hub?',
    'How did you get into backend dev?', 'Tell me about Dukh Bank',
    'What\'s your experience with Spring Boot?', 'What design tools do you use?',
    'Tell me about your internships', 'What projects are you most proud of?',
    'How do you approach system design?', 'What\'s your GitHub username?',
    'Do you have a LinkedIn?', 'What was your ScrapUncle internship like?',
    'Tell me about the Recommender System', 'What caching strategies do you use?',
    'What\'s your approach to API optimization?', 'Where are you based?',
    'What did you learn at IIIT Delhi?', 'How do you handle push notifications at scale?',
    'Tell me about the Course Similarity Evaluator', 'What\'s your favorite project?',
    'How did your career start?', 'What motivates you as an engineer?',
  ];

  // ── State ──────────────────────────────────────────────────────
  let conversation = [];
  let isProcessing = false;
  let usedTimeoutIdx = 0;
  let usedErrorIdx = 0;
  let suggestionOffset = 0;
  let isNearBottom = true;

  // ── EXCLUSIVE ANIMATION OWNERSHIP ──────────────────────────────
  // Only ONE animation owner at a time. Any function that wants to
  // animate the bubble must call claimOwnership() first. Previous
  // owner's animations immediately die.
  let animOwner = 0;
  let fillerTimers = []; // all filler-related timer IDs

  function claimOwnership() {
    // Kill all filler timers
    fillerTimers.forEach(id => { clearTimeout(id); clearInterval(id); });
    fillerTimers = [];
    // Bump owner — all prior animations with old owner ID will bail
    return ++animOwner;
  }

  // ── Initialize ─────────────────────────────────────────────────
  loadHistory();
  initScrollWatcher();

  // ── Scroll-aware + auto-hide scrollbar ─────────────────────────
  let scrollHideTimer = null;

  function initScrollWatcher() {
    messagesEl.addEventListener('scroll', () => {
      const atBottom = messagesEl.scrollHeight - messagesEl.scrollTop - messagesEl.clientHeight < 120;
      isNearBottom = atBottom;
      if (suggestionsBar && !atBottom) suggestionsBar.style.display = 'none';

      // Show scrollbar thumb while scrolling
      messagesEl.classList.add('scrolling');
      clearTimeout(scrollHideTimer);
      scrollHideTimer = setTimeout(() => {
        messagesEl.classList.remove('scrolling');
      }, 1200);
    }, { passive: true });
  }

  function scrollToBottom() {
    if (!isNearBottom) return;
    requestAnimationFrame(() => { messagesEl.scrollTop = messagesEl.scrollHeight; });
  }

  function forceScroll() {
    isNearBottom = true;
    requestAnimationFrame(() => { messagesEl.scrollTop = messagesEl.scrollHeight; });
  }

  // ── Persistence ────────────────────────────────────────────────
  function saveHistory() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        conversation, welcomeHidden: welcomeEl ? welcomeEl.style.display === 'none' : false,
      }));
    } catch (e) {}
  }

  function loadHistory() {
    try {
      const d = JSON.parse(localStorage.getItem(STORAGE_KEY));
      if (!d?.conversation?.length) return;
      if (welcomeEl && d.welcomeHidden) welcomeEl.style.display = 'none';
      conversation = d.conversation;
      conversation.forEach(m => appendInstant(m.role, m.content));
      forceScroll();
      // Restore suggestions if there's history
      showSuggestions();
    } catch (e) { localStorage.removeItem(STORAGE_KEY); }
  }

  function clearHistory() {
    conversation = [];
    localStorage.removeItem(STORAGE_KEY);
    messagesEl.querySelectorAll('.chat-msg, .chat-suggestions-bar').forEach(el => el.remove());
    if (welcomeEl) welcomeEl.style.display = '';
    suggestionOffset = 0;
  }

  function pick(arr, idx) { return arr[idx % arr.length]; }

  // ── Send ───────────────────────────────────────────────────────
  async function sendMessage(text) {
    text = text.trim();
    if (!text || isProcessing) return;

    removeSuggestions();
    isProcessing = true;
    sendBtn.disabled = true;
    inputEl.disabled = true;
    inputEl.value = '';
    inputEl.placeholder = 'Thinking...';
    inputEl.style.height = 'auto';
    if (welcomeEl) welcomeEl.style.display = 'none';

    conversation.push({ role: 'user', content: text });
    appendInstant('user', text);
    forceScroll();
    saveHistory();

    // Create the response bubble (with dots)
    const bub = createBubble();

    // ── CANNED PATH ──────────────────────────────────────────────
    if (CANNED_RESPONSES[text]) {
      const canned = CANNED_RESPONSES[text];
      conversation.push({ role: 'assistant', content: canned });
      saveHistory();

      const owner = claimOwnership();
      await delay(CANNED_DELAY);
      if (owner !== animOwner) { finish(); return; }

      removeDots(bub);
      await typeText(bub.textEl, canned, owner);
      removeCursor(bub);
      showSuggestions();
      finish();
      return;
    }

    // ── API PATH ─────────────────────────────────────────────────
    const fillerOwner = claimOwnership();
    startFiller(bub, fillerOwner);

    let responded = false;
    let fetchController = new AbortController();

    // Timeout that DISCARDS the fetch
    const timeoutId = setTimeout(() => {
      if (responded) return;
      responded = true;
      fetchController.abort();
      const owner = claimOwnership(); // kill filler
      removeDots(bub);
      bub.textEl.textContent = '';
      bub.bubble.classList.remove('chat-bubble--filler');
      typeText(bub.textEl, pick(TIMEOUT_RESPONSES, usedTimeoutIdx++), owner).then(() => {
        removeCursor(bub);
        showSuggestions();
        finish();
      });
    }, TIMEOUT_MS);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: conversation }),
        signal: fetchController.signal,
      });

      if (responded) return; // timeout already fired
      responded = true;
      clearTimeout(timeoutId);

      const owner = claimOwnership(); // kill filler
      removeDots(bub);
      bub.textEl.textContent = '';
      bub.bubble.classList.remove('chat-bubble--filler');

      if (!res.ok) {
        let fb;
        if (res.status === 429) fb = pick(RATE_LIMIT_RESPONSES, usedErrorIdx++);
        else if (res.status === 504) fb = pick(TIMEOUT_RESPONSES, usedTimeoutIdx++);
        else fb = pick(ERROR_RESPONSES, usedErrorIdx++);
        await typeText(bub.textEl, fb, owner);
        removeCursor(bub);
        showSuggestions();
        finish();
        return;
      }

      const data = await res.json();
      const assistantText = data.content || pick(ERROR_RESPONSES, usedErrorIdx++);
      conversation.push({ role: 'assistant', content: assistantText });
      saveHistory();

      await typeText(bub.textEl, assistantText, owner);
      removeCursor(bub);
      showSuggestions();
    } catch (err) {
      if (responded) return;
      responded = true;
      clearTimeout(timeoutId);

      const owner = claimOwnership();
      removeDots(bub);
      bub.textEl.textContent = '';
      bub.bubble.classList.remove('chat-bubble--filler');

      const fb = err.name === 'AbortError'
        ? pick(TIMEOUT_RESPONSES, usedTimeoutIdx++)
        : pick(ERROR_RESPONSES, usedErrorIdx++);
      await typeText(bub.textEl, fb, owner);
      removeCursor(bub);
      showSuggestions();
    }

    finish();
  }

  function finish() {
    isProcessing = false;
    sendBtn.disabled = false;
    inputEl.disabled = false;
    inputEl.placeholder = 'Ask me anything...';
    inputEl.focus();
  }

  // ── Bubble creation ────────────────────────────────────────────
  function createBubble() {
    const div = document.createElement('div');
    div.className = 'chat-msg chat-msg--assistant';

    const avatar = document.createElement('div');
    avatar.className = 'chat-msg__avatar';
    avatar.textContent = 'H';

    const bubble = document.createElement('div');
    bubble.className = 'chat-msg__bubble';

    const textEl = document.createElement('span');
    textEl.className = 'chat-bubble-text';

    const dotsEl = document.createElement('span');
    dotsEl.className = 'chat-dots-inline';
    dotsEl.innerHTML = '<span class="chat-dots-inline__dot"></span><span class="chat-dots-inline__dot"></span><span class="chat-dots-inline__dot"></span>';

    const cursorEl = document.createElement('span');
    cursorEl.className = 'typewriter-cursor';
    cursorEl.style.display = 'none'; // hidden during dots phase

    bubble.appendChild(textEl);
    bubble.appendChild(dotsEl);
    bubble.appendChild(cursorEl);
    div.appendChild(avatar);
    div.appendChild(bubble);
    messagesEl.appendChild(div);
    scrollToBottom();

    return { div, bubble, textEl, dotsEl, cursorEl };
  }

  function removeDots(bub) {
    if (bub.dotsEl?.parentNode) bub.dotsEl.remove();
    bub.cursorEl.style.display = ''; // show typewriter cursor
  }

  function removeCursor(bub) {
    if (bub.cursorEl?.parentNode) bub.cursorEl.remove();
  }

  // ── Filler system (NO typewriter — just instant text swap) ────
  function startFiller(bub, owner) {
    bub.bubble.classList.add('chat-bubble--filler');
    bub.textEl.textContent = '';

    // After FILLER_DELAY, start cycling filler texts (instant swap, no typewriter)
    let idx = 0;
    const t1 = setTimeout(() => {
      if (owner !== animOwner) return;
      bub.textEl.textContent = FILLERS[idx++];
      scrollToBottom();

      const t2 = setInterval(() => {
        if (owner !== animOwner) { clearInterval(t2); return; }
        if (idx >= FILLERS.length) { clearInterval(t2); return; }
        bub.textEl.textContent = FILLERS[idx++];
        scrollToBottom();
      }, FILLER_INTERVAL);
      fillerTimers.push(t2);
    }, FILLER_DELAY);
    fillerTimers.push(t1);
  }

  // ── Typewriter (owner-gated) ──────────────────────────────────
  function typeText(el, text, owner) {
    return new Promise(resolve => {
      let i = 0;
      isNearBottom = true; // force scroll for real response
      el.textContent = '';

      function step() {
        if (owner !== animOwner) { el.textContent = text; resolve(); return; }
        if (i >= text.length) { resolve(); return; }
        el.textContent += text[i++];
        if (i % 5 === 0) scrollToBottom();
        setTimeout(step, TYPE_SPEED + Math.random() * TYPE_VARIANCE);
      }
      step();
    });
  }

  // ── Utils ──────────────────────────────────────────────────────
  function delay(ms) { return new Promise(r => setTimeout(r, ms)); }

  function appendInstant(role, text) {
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

  // ── Suggestions (inline in chat flow) ───────────────────────────
  function showSuggestions() {
    // Remove any existing inline suggestions
    removeSuggestions();

    const picks = [];
    for (let i = 0; i < 4; i++) picks.push(POST_SUGGESTIONS[(suggestionOffset + i) % POST_SUGGESTIONS.length]);
    suggestionOffset = (suggestionOffset + 4) % POST_SUGGESTIONS.length;

    const bar = document.createElement('div');
    bar.className = 'chat-suggestions-bar';
    bar.id = 'chatSuggestionsInline';

    bar.innerHTML = picks.map(t =>
      `<button class="chat-welcome__suggestion" data-msg="${t.replace(/"/g, '&quot;')}">${t}</button>`
    ).join('');

    // Append to messages area (part of scroll flow)
    messagesEl.appendChild(bar);

    bar.querySelectorAll('.chat-welcome__suggestion').forEach(btn => {
      btn.addEventListener('click', () => {
        removeSuggestions();
        sendMessage(btn.getAttribute('data-msg'));
      });
    });

    forceScroll();
  }

  function removeSuggestions() {
    const existing = messagesEl.querySelectorAll('.chat-suggestions-bar');
    existing.forEach(el => el.remove());
  }

  // ── Auto-resize ────────────────────────────────────────────────
  function autoResize() {
    inputEl.style.height = 'auto';
    inputEl.style.height = Math.min(inputEl.scrollHeight, 120) + 'px';
  }

  // ── Events ─────────────────────────────────────────────────────
  sendBtn.addEventListener('click', () => sendMessage(inputEl.value));
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

  // Click to skip typewriter on assistant bubble
  messagesEl.addEventListener('click', (e) => {
    if (e.target.closest('.chat-msg--assistant') && isProcessing) {
      claimOwnership(); // kills current typewriter, text snaps to full
    }
  });

})();
