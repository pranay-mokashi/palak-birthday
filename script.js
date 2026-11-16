(() => {
  const $ = s => document.querySelector(s), app = $('#app'), hb = $('#hintBtn'), song = $('#song');
  const rnd = (a, b) => a + Math.random() * (b - a), pick = a => a[Math.random() * a.length | 0];
  const shuffle = a => a.map(v => [Math.random(), v]).sort((x, y) => x[0] - y[0]).map(x => x[1]);
  const WORD = 'PALAK', GOLD = ['#e8c277', '#f6dfa6', '#ffb3d1', '#fff6ea'];
  let lvl = 0, cur = null, idle, petals = false;

  /* soft sound effects */
  let ac;
  function sfx(f = 660, d = .15, v = .05) {
    try { ac = ac || new (window.AudioContext || window.webkitAudioContext)(); const o = ac.createOscillator(), g = ac.createGain(), t = ac.currentTime;
      o.frequency.value = f; g.gain.setValueAtTime(v, t); g.gain.exponentialRampToValueAtTime(.0001, t + d);
      o.connect(g); g.connect(ac.destination); o.start(); o.stop(t + d); } catch (e) {}
  }
  const chime = () => [784, 988, 1175, 1568].forEach((f, i) => setTimeout(() => sfx(f, .45), i * 120));

  /* effects: golden dust, shooting stars, petals, fireworks, hearts */
  const cv = $('#fx'), c = cv.getContext('2d'); let W, H, P = [];
  const size = () => { W = cv.width = innerWidth; H = cv.height = innerHeight; }; size(); addEventListener('resize', size);
  const dust = () => ({ k: 'd', x: rnd(0, W), y: rnd(0, H), r: rnd(.5, 1.8), vy: -rnd(.1, .4), p: rnd(0, 6) });
  for (let i = 0; i < 55; i++) P.push(dust());
  function burst(x, y, heart) { for (let i = 0; i < 60; i++) { const a = rnd(0, 6.28), s = rnd(1, 5); P.push({ k: heart ? 'h' : 'f', x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s - (heart ? 2 : 0), l: 80, col: pick(GOLD) }); } }
  const show = () => { burst(rnd(.2, .8) * W, rnd(.15, .45) * H); burst(rnd(.2, .8) * W, rnd(.15, .4) * H, 1); };
  setInterval(() => { if (!document.hidden && Math.random() < .5) P.push({ k: 's', x: rnd(W * .3, W), y: rnd(0, H * .35), l: 40 }); }, 4000);
  setInterval(() => { if (petals && !document.hidden) P.push({ k: 'p', x: rnd(0, W), y: -10, vx: rnd(-.5, .5), vy: rnd(.8, 1.8), a: rnd(0, 6), l: 900 }); }, 350);
  (function loop(t = 0) {
    c.clearRect(0, 0, W, H);
    P = P.filter(p => p.k === 'd' || (--p.l > 0 && p.y < H + 20));
    for (const p of P) {
      if (p.k === 'd') { p.y += p.vy; if (p.y < -5) { p.y = H + 5; p.x = rnd(0, W); } c.globalAlpha = .3 + .5 * Math.abs(Math.sin(t / 900 + p.p)); c.fillStyle = '#e8c277'; c.beginPath(); c.arc(p.x, p.y, p.r, 0, 6.28); c.fill(); }
      else if (p.k === 's') { p.x -= 9; p.y += 4.5; c.globalAlpha = p.l / 40; c.strokeStyle = '#f6dfa6'; c.lineWidth = 2; c.beginPath(); c.moveTo(p.x, p.y); c.lineTo(p.x + 40, p.y - 20); c.stroke(); }
      else if (p.k === 'p') { p.x += p.vx + Math.sin(p.y / 40) * .5; p.y += p.vy; p.a += .03; c.globalAlpha = .75; c.fillStyle = '#ffb3d1'; c.save(); c.translate(p.x, p.y); c.rotate(p.a); c.beginPath(); c.ellipse(0, 0, 7, 3.5, 0, 0, 6.28); c.fill(); c.restore(); }
      else { p.x += p.vx; p.y += p.vy; p.vy += .05; c.globalAlpha = Math.max(p.l / 80, 0); c.fillStyle = p.col; if (p.k === 'h') { c.font = '16px serif'; c.fillText('♥', p.x, p.y); } else { c.beginPath(); c.arc(p.x, p.y, 2, 0, 6.28); c.fill(); } }
    }
    c.globalAlpha = 1; requestAnimationFrame(loop);
  })();

  /* helpers */
  function toast(t) { const e = $('#toast'); e.textContent = t; e.classList.add('show'); setTimeout(() => e.classList.remove('show'), 2600); }
  function screen(html, cls = '') { app.className = cls; app.innerHTML = html; void app.offsetWidth; app.classList.add('in'); }
  const slots = () => { $('#slots').innerHTML = [...WORD].map((ch, i) => `<b class="${i < lvl ? 'on' : ''}">${i < lvl ? ch : '·'}</b>`).join(''); };
  function armHint() { clearTimeout(idle); hb.hidden = true; idle = setTimeout(() => { if (app.classList.contains('game')) hb.hidden = false; }, 12000); }
  document.addEventListener('pointerdown', e => { if (app.classList.contains('game') && !e.target.closest('#hintBtn')) armHint(); });
  hb.onclick = () => { cur && cur.hint(); armHint(); };
  const modal = html => { $('#mbody').innerHTML = html; $('#modal').hidden = false; };
  $('#mclose').onclick = () => $('#modal').hidden = true;

  /* mini games */
  function catchHearts(el, fin) {
    let n = 0; el.innerHTML = '<div class="cnt">0 / 8</div><div class="arena"></div>';
    const ar = el.querySelector('.arena'), cnt = el.querySelector('.cnt');
    const t = setInterval(() => {
      const h = document.createElement('button'); h.className = 'gh'; h.textContent = pick(['💗', '💖', '💜']);
      h.style.left = rnd(4, 80) + '%'; h.style.animationDuration = rnd(5, 7) + 's';
      h.onpointerdown = () => { h.remove(); sfx(600 + n * 70, .2); cnt.textContent = ++n + ' / 8'; if (n >= 8) { clearInterval(t); fin(); } };
      h.onanimationend = () => h.remove(); ar.appendChild(h);
    }, 800);
    return { stop: () => clearInterval(t), hint: () => toast('Tap the hearts as they float down') };
  }
  function findStars(el, fin) {
    let n = 0; el.innerHTML = '<div class="cnt">0 / 5</div><div class="arena sky"></div>'; const ar = el.querySelector('.arena'), cnt = el.querySelector('.cnt');
    for (let i = 0; i < 5; i++) {
      const s = document.createElement('button'); s.className = 'fs'; s.textContent = '✦';
      s.style.left = rnd(8, 78) + '%'; s.style.top = (i * 18 + rnd(2, 10)) + '%'; s.style.animationDelay = rnd(0, 3) + 's';
      s.onclick = () => { if (s.classList.contains('on')) return; s.classList.add('on'); sfx(880 + n * 90, .3); cnt.textContent = ++n + ' / 5'; if (n >= 5) setTimeout(fin, 700); };
      ar.appendChild(s);
    }
    return { stop() {}, hint() { const f = ar.querySelector('.fs:not(.on)'); if (f) f.classList.add('pulse'); toast('A star is glowing for you'); } };
  }
  const PAIRS = [['😄', 'Her laugh'], ['😊', 'Her smile'], ['✨', 'Her eyes'], ['💎', 'Her sharp features'], ['🌸', 'Her cuteness']];
  function matchCards(el, fin) {
    el.innerHTML = '<div class="cap">&nbsp;</div><div class="grid"></div>'; const g = el.querySelector('.grid'), cap = el.querySelector('.cap');
    let open = [], m = 0, busy = false;
    shuffle([...PAIRS, ...PAIRS]).forEach(([e, l]) => {
      const b = document.createElement('button'); b.className = 'mc'; b.innerHTML = `<i>${e}</i>`; b.dataset.l = l;
      b.onclick = () => {
        if (busy || b.classList.contains('up') || b.classList.contains('ok')) return;
        b.classList.add('up'); sfx(520, .1); open.push(b);
        if (open.length === 2) {
          busy = true; const [a, d] = open;
          if (a.dataset.l === d.dataset.l) { a.classList.replace('up', 'ok'); d.classList.replace('up', 'ok'); cap.textContent = l; sfx(1046, .35); open = []; busy = false; if (++m === 5) setTimeout(fin, 900); }
          else setTimeout(() => { a.classList.remove('up'); d.classList.remove('up'); open = []; busy = false; }, 700);
        }
      };
      g.appendChild(b);
    });
    return { stop() {}, hint() {
      const un = [...g.children].filter(x => !x.classList.contains('ok') && !x.classList.contains('up')); if (!un.length) return;
      const pr = un.filter(x => x.dataset.l === un[0].dataset.l); pr.forEach(x => x.classList.add('up'));
      setTimeout(() => pr.forEach(x => !x.classList.contains('ok') && x.classList.remove('up')), 1000);
    } };
  }
  function findApple(el, fin) {
    let wrong = 0; el.innerHTML = '<h1 class="gold word2">APPLE</h1><div class="grid3"></div><p class="soft st">&nbsp;</p>';
    const g = el.querySelector('.grid3'), st = el.querySelector('.st');
    const hintNow = () => { [...g.children].find(b => b.textContent === '🍎').classList.add('pulse'); toast('Look for the apple'); };
    shuffle(['🍐', '🍊', '🍋', '🍎', '🍇', '🍑']).forEach(f => {
      const b = document.createElement('button'); b.className = 'fr'; b.textContent = f;
      b.onclick = () => {
        if (f === '🍎') { b.classList.remove('pulse'); b.classList.add('big'); sfx(988, .5); st.textContent = 'Now think of someone special...'; [...g.children].forEach(x => x !== b && x.classList.add('fade')); setTimeout(fin, 3000); }
        else { b.classList.add('shake'); sfx(240, .2); setTimeout(() => b.classList.remove('shake'), 400); if (++wrong >= 2) hintNow(); }
      };
      g.appendChild(b);
    });
    return { stop() {}, hint: hintNow };
  }
  function blowCandles(el, fin) {
    el.innerHTML = '<div id="cake" class="cake"><div class="candles"><i></i><i></i><i></i></div><div class="t3"></div><div class="t2"></div><div class="t1"></div></div><p class="soft">Tap each candle, or hold the cake</p>';
    const cs = [...el.querySelectorAll('.candles i')], cake = el.querySelector('#cake'); let ht, ended = false;
    const chk = () => { if (!ended && cs.every(x => x.classList.contains('out'))) { ended = true; setTimeout(fin, 800); } };
    cs.forEach(x => x.onclick = () => { x.classList.add('out'); sfx(400, .2); chk(); });
    cake.addEventListener('pointerdown', () => { ht = setTimeout(() => { cs.forEach(x => x.classList.add('out')); chk(); }, 900); });
    ['pointerup', 'pointerleave'].forEach(ev => cake.addEventListener(ev, () => clearTimeout(ht)));
    return { stop() {}, hint() { const f = cs.find(x => !x.classList.contains('out')); if (f) f.classList.add('pulse'); toast('Tap the glowing candle'); } };
  }

  /* levels */
  const LV = [
    { t: 'The Mood Changer', how: 'Catch 8 hearts', msg: 'My entire mood depended on our conversations.', sub: 'I was simply happy talking to you, without expecting anything in return.', play: catchHearts },
    { t: 'The One Who Wanted to Help', how: 'Find the 5 hidden stars', msg: 'I always wanted to help.', sub: 'I never knew everything you were going through, but it was always genuine.', play: findStars },
    { t: 'Little Things', how: 'Match the pairs', msg: 'A few things I noticed.', sub: 'Her laugh. Her smile. Her eyes. All the little things.', play: matchCards, petals: 1 },
    { t: 'The Face I Never Forgot', how: 'Find the apple', msg: 'Whenever I thought about you, your face automatically appeared in my mind.', sub: "Some faces don't need photographs to be remembered.", play: findApple },
    { t: 'The Day I Waited For', how: 'Blow out the candles', msg: '23 NOVEMBER', sub: "Not to impress you. I just couldn't wait for this day.", play: blowCandles, petals: 1 }
  ];

  function intro() {
    lvl = 0; petals = false; $('#hud').hidden = true; hb.hidden = true;
    screen(`<p class="small">A little game, made for you</p><h1 class="gold">Palak</h1><p class="soft">5 levels. 5 letters. One secret to unlock.</p><button class="btn" id="go">Begin</button>`);
    $('#go').onclick = () => { sfx(880); level(); };
  }
  function level() {
    const L = LV[lvl]; $('#hud').hidden = false; slots(); petals = !!L.petals; hb.hidden = true;
    screen(`<p class="small">Level ${lvl + 1}</p><h2 class="gold">${L.t}</h2><p class="soft">${L.how}</p><button class="btn" id="st">Start</button>`);
    $('#st').onclick = () => { sfx(660); play(); };
  }
  function play() {
    screen('<div id="game"></div>', 'game'); cur = LV[lvl].play($('#game'), done); armHint();
  }
  function done() {
    cur && cur.stop(); cur = null; clearTimeout(idle); hb.hidden = true; const L = LV[lvl];
    chime(); burst(W / 2, H * .3); burst(W * .3, H * .25, 1); burst(W * .7, H * .25, 1);
    screen(`<div class="letter">${WORD[lvl]}</div><p class="msg gold">${L.msg}</p><p class="soft">${L.sub}</p><button class="btn" id="nx">${lvl < 4 ? 'Next level' : 'Final unlock'}</button>`, 'done');
    lvl++; slots(); $('#nx').onclick = () => { sfx(700); lvl < 5 ? level() : final(); };
  }
  function final() {
    petals = true; $('#hud').hidden = true;
    screen(`<p class="small">Final unlock</p><div class="word">${[...WORD].map((ch, i) => `<span style="--i:${i}">${ch}</span>`).join('')}</div><h2 class="gold">Happy Birthday, Palak!</h2><p class="soft">To someone who made ordinary conversations feel extraordinary.</p><div class="row"><button class="btn" id="b1">Read my letter</button><button class="btn" id="b2">Open the gift</button><button class="btn" id="b3">Pause song</button><a class="btn" id="b4" target="_blank" rel="noopener" hidden>Message me</a><button class="ghost" id="b5">Play again</button></div>`, 'final');
    chime(); show(); setTimeout(show, 900); setTimeout(show, 1800); setTimeout(show, 3000);
    song.play().catch(() => { $('#b3').textContent = 'Play song'; });
    song.addEventListener('error', () => { const b = $('#b3'); b && (b.hidden = true); });
    $('#b3').onclick = e => { if (song.paused) { song.play(); e.target.textContent = 'Pause song'; } else { song.pause(); e.target.textContent = 'Play song'; } };
    $('#b1').onclick = () => modal(`<div class="hw"><p>Dear Palak,</p><p>Thank you for the happiness our conversations brought into my life. You were someone I could talk to without needing a reason.</p><p>I hope this year brings you endless happiness, success and peace. Never stop smiling.</p><p>Somewhere in this world, someone genuinely wishes the best for you.</p><p>Happy Birthday!</p></div><p class="sg hw">With lots of good wishes ❤️</p><p class="soft">23 November — a date I'll always remember.</p>`);
    $('#b2').onclick = () => { chime(); show(); modal(`<p>One last thing...</p><p>I don't know whether you realised how special your conversations were to me, but I hope this little game gives you an idea.</p><p class="gold">Thank you for being you, Palak. ❤️</p>`); };
    $('#b5').onclick = () => { song.pause(); intro(); };
    const MY_NUMBER = '91XXXXXXXXXX'; /* your WhatsApp number: country code + digits only */
    if (/^\d{10,15}$/.test(MY_NUMBER)) { const r = $('#b4'); r.hidden = false; r.href = 'https://wa.me/' + MY_NUMBER + '?text=' + encodeURIComponent('Thank you for the game 😊'); }
  }

  /* midnight lock (add ?preview to the address while testing) */
  const now = new Date(), unlockAt = new Date(now.getFullYear(), 10, 23), lockEl = $('#lock');
  function lockTick() {
    const ms = unlockAt - new Date();
    if (true) { lockEl.classList.add('gone'); clearInterval(lt); return; }
    const d = Math.floor(ms / 864e5), h = Math.floor(ms % 864e5 / 36e5), m = Math.floor(ms % 36e5 / 6e4), s = Math.floor(ms % 6e4 / 1e3);
    $('#lockCount').textContent = `${d}d  ${h}h  ${m}m  ${s}s`;
  }
  const lt = setInterval(lockTick, 1000); lockTick();
  intro();
})();
