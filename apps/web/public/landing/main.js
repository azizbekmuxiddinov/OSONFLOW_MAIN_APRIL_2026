/* ============================================================
   Osonflow — Japandi landing interactivity (zero-build, vanilla)
   Live demo that answers from a real business's own pages,
   interactive pipeline, ROI calculator,
   animated FAQ, embed modal, and calm scroll choreography.
   ============================================================ */
(function () {
  "use strict";

  function initOsonflowLanding() {
    const root = document.getElementById("main");
    if (!root) return;

    if (typeof window.__destroyOsonflowLanding === "function") {
      window.__destroyOsonflowLanding();
    }

    const ac = new AbortController();
    const { signal } = ac;
    const intervals = [];
    const observers = [];
    const trackInterval = (fn, ms) => {
      const id = setInterval(fn, ms);
      intervals.push(id);
      return id;
    };
    const trackObserver = (observer) => {
      observers.push(observer);
      return observer;
    };

    window.__destroyOsonflowLanding = function () {
      ac.abort();
      intervals.forEach(clearInterval);
      observers.forEach((observer) => observer.disconnect());
      delete root.dataset.landingInitialized;
      window.__destroyOsonflowLanding = undefined;
    };

    root.dataset.landingInitialized = "true";

const $ = (s, c) => (c || document).querySelector(s);
  const $$ = (s, c) => Array.from((c || document).querySelectorAll(s));
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const esc = (t) => String(t).replace(/[&<>"']/g, (m) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[m]));

  /* ---------------- Reveal on scroll (hero only; rest uses Framer Motion) ---------------- */
  const reveals = $$("[data-reveal]");
  if ("IntersectionObserver" in window && !reduceMotion) {
    const io = trackObserver(new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          if (!e.target.closest(".hero")) return;
          const sibs = $$("[data-reveal]", e.target.closest("section") || document).filter((n) => !n.classList.contains("is-in"));
          const i = sibs.indexOf(e.target);
          e.target.style.transitionDelay = Math.min(i, 4) * 80 + "ms";
          e.target.classList.add("is-in");
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }));
    reveals.forEach((el) => {
      if (el.closest(".hero")) {
        if (!el.classList.contains("is-in")) io.observe(el);
      } else {
        el.classList.add("fm-pending");
      }
    });
  } else { reveals.forEach((el) => el.classList.add("is-in")); }

  /* ---------------- Count-up stats ---------------- */
  const formatCountValue = (value, el) => {
    const decimals = el.dataset.countDecimals ? parseInt(el.dataset.countDecimals, 10) : 0;
    const prefix = el.dataset.countPrefix || "";
    const suffix = el.dataset.countSuffix || "";
    let numeric;
    if (decimals > 0) {
      numeric = value.toFixed(decimals);
    } else {
      numeric = Math.round(value).toLocaleString("en-US");
    }
    return prefix + numeric + suffix;
  };
  const runCount = (el) => {
    const target = parseFloat(el.dataset.count);
    if (!Number.isFinite(target)) return;
    if (reduceMotion) {
      el.textContent = formatCountValue(target, el);
      return;
    }
    const dur = parseInt(el.dataset.countDuration || "1500", 10);
    const start = performance.now();
    const step = (now) => {
      const p = Math.min((now - start) / dur, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = formatCountValue(eased * target, el);
      if (p < 1) requestAnimationFrame(step);
      else el.textContent = formatCountValue(target, el);
    };
    requestAnimationFrame(step);
  };
  if ("IntersectionObserver" in window) {
    const co = trackObserver(new IntersectionObserver((entries) => entries.forEach((e) => { if (e.isIntersecting) { runCount(e.target); co.unobserve(e.target); } }), { threshold: 0.35, rootMargin: "0px 0px -8% 0px" }));
    $$("[data-count]").forEach((el) => co.observe(el));
  } else { $$("[data-count]").forEach((el) => (el.textContent = formatCountValue(parseFloat(el.dataset.count), el))); }

  /* ---------------- Animate intent bars + ops stack when revealed ---------------- */
  if ("IntersectionObserver" in window) {
    const bo = trackObserver(new IntersectionObserver((entries) => entries.forEach((e) => {
      if (!e.isIntersecting) return;
      const root = e.target;
      root.classList.add("is-in");
      $$("i[data-w]", root).forEach((i) => (i.style.width = i.dataset.w));
      $$(".opsintent__stack span", root).forEach((s) => { s.style.width = getComputedStyle(s).getPropertyValue("--share"); });
      bo.unobserve(root);
    }), { threshold: 0.28 }));
    $$(".ibars, .opsboard").forEach((el) => bo.observe(el));
  }

  /* ---------------- Tenancy board reveal ---------------- */
  const tenancyBoard = $("#tenancyBoard");
  if (tenancyBoard && "IntersectionObserver" in window) {
    const to = trackObserver(new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        e.target.classList.add("is-in");
        to.unobserve(e.target);
      });
    }, { threshold: 0.3 }));
    to.observe(tenancyBoard);
  } else if (tenancyBoard) {
    tenancyBoard.classList.add("is-in");
  }

  /* ---------------- Hero parallax + tilt ---------------- */
  const stage = $(".hero__stage");
  if (stage && !reduceMotion && window.matchMedia("(pointer:fine)").matches) {
    stage.addEventListener("mousemove", (e) => {
      const r = stage.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
      $$("[data-float]", stage).forEach((p, i) => {
        const d = (i + 1) * 4;
        p.style.setProperty("--fx", (-x * d).toFixed(2) + "px");
        p.style.setProperty("--fy", (-y * d).toFixed(2) + "px");
      });
    }, { signal });
    stage.addEventListener("mouseleave", () => $$("[data-float]", stage).forEach((p) => {
      p.style.setProperty("--fx", "0px");
      p.style.setProperty("--fy", "0px");
    }), { signal });
  }

  /* ---------------- Hero typewriter ---------------- */
  const typeEl = $("#chatType");
  if (typeEl && !reduceMotion) {
    const phrases = ["Type a message…", "Where is my order?", "Can I get a refund?", "Talk to a human"];
    let pi = 0; typeEl.style.transition = "opacity 0.35s ease";
    trackInterval(() => { typeEl.style.opacity = "0"; setTimeout(() => { pi = (pi + 1) % phrases.length; typeEl.textContent = phrases[pi]; typeEl.style.opacity = "1"; }, 350); }, 2600);
  }

  /* ---------------- Pipeline stepper ---------------- */
  /* Each step plays a small scene on the ink stage. The scenes share one world:
     the three sheets added in step 1 are the sources every later answer cites. */
  const sheet = (cls, name, kind, heading, lines, style) =>
    `<div class="sheet ${cls}" style="${style || ""}"><div class="sheet__head"><span class="sheet__name">${name}</span><span class="sheet__kind">${kind}</span></div>` +
    `<div class="sheet__body"><b>${heading}</b>${lines.map((l) => `<span>${l}</span>`).join("")}</div><span class="sheet__scan"></span>` +
    `<span class="sheet__read"><svg viewBox="0 0 16 16" width="10" height="10" aria-hidden="true"><path d="M3.5 8.5 6.5 11.5 12.5 4.5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>Read</span></div>`;
  const sgauge = (value, bar, mood, delay) =>
    `<div class="sgauge sgauge--${mood}" style="--v:${value};--bar:${bar};--d:${delay}s" role="img" aria-label="Confidence ${value}%, your bar is ${bar}%">` +
    `<div class="sgauge__read"><span><b data-tick="${value}" data-tick-delay="${delay * 1000}">${value}</b>%</span><small>sure</small></div>` +
    `<div class="sgauge__track"><span class="sgauge__fill"></span><span class="sgauge__bar"><em>your bar ${bar}%</em></span></div></div>`;
  const pviews = [
    { title: "You add your content", desc: "You don't write scripts or keyword rules. Point Osonflow at your website, or upload the PDFs and text files your team already answers from. It reads them once and keeps them up to date.",
      scene: '<div class="scn scn--ingest"><div class="desk">' +
        sheet("", "yourshop.uz/pricing", "Web page", "Plans and prices", ["Starter is free for up to 100 chats a month.", "Growth is 299 000 soms a month.", "Business is 790 000 soms a month."], "--i:0;--r:-5deg;--x:2%") +
        sheet("", "Refund policy.pdf", "PDF, 4 pages", "Refunds", ["Unworn items can be returned within 14 days.", "Money reaches your card in 3 to 5 working days."], "--i:1;--r:1.5deg;--x:34%") +
        sheet("", "Delivery questions.txt", "Text file", "Delivery", ["Tashkent orders arrive the next day.", "Regions take 2 to 4 days by courier."], "--i:2;--r:6deg;--x:66%") +
        '</div><div class="scn__note" style="--d:2.7s"><b data-tick="46" data-tick-delay="2700">46</b> passages from 3 sources, ready to answer from</div></div>' },
    { title: "Osonflow reads it", desc: "When a customer asks something, Osonflow pulls up only the parts of your content that actually relate to the question — then writes its answer from those, and nothing else.",
      scene: '<div class="scn scn--find">' +
        sheet("sheet--open", "yourshop.uz/pricing", "Web page", "Plans and prices", ["Starter is free for up to 100 chats a month.", '<mark style="--d:1.1s">Growth is 299 000 soms a month.</mark>', "Business is 790 000 soms a month.", "Every plan includes the voice assistant."]) +
        '<div class="chat"><div class="bub bub--them" style="--d:.2s">How much is the Growth plan?</div>' +
        '<div class="bub bub--typing" style="--d:.8s"><i></i><i></i><i></i></div>' +
        '<div class="bub bub--us" style="--d:2s">Growth is 299 000 soms a month.</div>' +
        '<div class="cite" style="--d:2.4s"><span class="cite__swatch"></span>From yourshop.uz/pricing</div></div></div>' },
    { title: "It answers — or it stops", desc: "Before replying, Osonflow rates how well the answer is backed by your content. If that rating falls below the level you set, it doesn't send a guess — it stops and gets a person.",
      scene: '<div class="scn scn--gate"><div class="chat">' +
        '<div class="bub bub--them" style="--d:.2s">Can I return a jacket I bought 10 days ago?</div>' +
        '<div class="swap" style="--d:2.6s"><div class="bub bub--draft" style="--d:.8s">Yes. Unworn items can be returned within 14 days.</div>' +
        '<div class="bub bub--us">Yes. Unworn items can be returned within 14 days.</div></div>' +
        '<div class="cite" style="--d:2.9s"><span class="cite__swatch"></span>Sent, from Refund policy.pdf</div></div>' +
        sgauge(95, 80, "pass", 1.3) + "</div>" },
    { title: "Your team steps in", desc: "If confidence drops, or the customer just asks for a person, your team is notified and the chat appears in the shared inbox. The customer stays in the same conversation and never repeats themselves.",
      scene: '<div class="scn scn--hand"><div class="chat">' +
        '<div class="bub bub--them" style="--d:.2s">The jacket arrived torn. I want my money back today.</div>' +
        '<div class="bub bub--draft bub--held" style="--d:.8s">Sorry about that. Refunds usually take…</div>' +
        '<div class="sys" style="--d:2.7s">Held back and sent to your shared inbox</div>' +
        '<div class="bub bub--team" style="--d:3.5s"><span class="bub__who">Madina, support team</span>Hi, I can see the whole chat. Sending a courier for the jacket and refunding you today.</div></div>' +
        sgauge(44, 80, "fail", 1.3) + "</div>" }
  ];
  const pipelineView = $("#pipelineView");
  function runCounts(root) {
    $$("[data-tick]", root).forEach((el) => {
      const to = parseInt(el.dataset.tick, 10);
      if (reduceMotion) { el.textContent = to; return; }
      el.textContent = "0";
      setTimeout(() => {
        const t0 = performance.now();
        const tick = (now) => {
          const p = Math.min(1, (now - t0) / 1100);
          el.textContent = Math.round(to * (1 - Math.pow(1 - p, 3)));
          if (p < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      }, parseInt(el.dataset.tickDelay || "0", 10));
    });
  }
  function renderPipeline(i) {
    const v = pviews[i];
    pipelineView.innerHTML = '<div class="pview__in"><h4>' + v.title + "</h4><p>" + v.desc + "</p>" + v.scene + "</div>";
    runCounts(pipelineView);
  }
  if (pipelineView) {
    renderPipeline(0);
    $$(".pstep").forEach((btn) => btn.addEventListener("click", () => {
      $$(".pstep").forEach((b) => b.classList.remove("is-active"));
      btn.classList.add("is-active");
      renderPipeline(parseInt(btn.dataset.step, 10));
    }, { signal }));
  }

  /* ---------------- Platform tiles: one hands-on moment each ---------------- */
  /* Every visible word for every state lives in the markup, so the page's
     translator handles them; these handlers only flip state attributes. */
  const srcdemo = $(".srcdemo");
  if (srcdemo) {
    const citeBtn = $(".srcdemo__cite", srcdemo);
    citeBtn.addEventListener("click", () => {
      const open = srcdemo.dataset.open !== "true";
      srcdemo.dataset.open = String(open);
      citeBtn.setAttribute("aria-expanded", String(open));
    }, { signal });
  }

  const inbx = $(".inbx");
  if (inbx) {
    const go = (state, focusSel) => {
      inbx.dataset.state = state;
      const next = $(focusSel, inbx);
      if (next && document.activeElement && inbx.contains(document.activeElement)) next.focus({ preventScroll: true });
    };
    $(".inbx__claim", inbx).addEventListener("click", () => go("claimed", ".inbx__send"), { signal });
    $(".inbx__send", inbx).addEventListener("click", () => go("sent", ".inbx__reset"), { signal });
    $(".inbx__reset", inbx).addEventListener("click", () => go("new", ".inbx__claim"), { signal });
  }

  const route = $(".route");
  if (route) {
    const msgs = $$(".route__msg", route);
    const syncChips = () => $$(".route__chip", route).forEach((chip) => {
      const current = route.dataset[chip.dataset.field];
      $$("[data-v]", chip).forEach((opt) => opt.classList.toggle("is-on", opt.dataset.v === current));
    });
    const sortChats = (animate) => {
      const first = new Map(msgs.map((m) => [m, m.getBoundingClientRect()]));
      msgs.forEach((m) => {
        const lane = m.dataset.kind === route.dataset.if ? route.dataset.to : "ai";
        $(`.route__lane[data-lane="${lane}"] .route__slot`, route).appendChild(m);
      });
      $$(".route__lane", route).forEach((l) => l.classList.toggle("is-target", l.dataset.lane === route.dataset.to));
      if (!animate || reduceMotion) return;
      msgs.forEach((m) => {
        const a = first.get(m), b = m.getBoundingClientRect();
        const dx = a.left - b.left, dy = a.top - b.top;
        if (!dx && !dy) return;
        m.animate([{ transform: `translate(${dx}px, ${dy}px)` }, { transform: "none" }], { duration: 520, easing: "cubic-bezier(0.22, 1, 0.36, 1)" });
      });
    };
    $$(".route__chip", route).forEach((chip) => chip.addEventListener("click", () => {
      const options = chip.dataset.options.split(" ");
      const field = chip.dataset.field;
      route.dataset[field] = options[(options.indexOf(route.dataset[field]) + 1) % options.length];
      syncChips();
      sortChats(true);
    }, { signal }));
    syncChips();
    sortChats(false);
  }

  const setbar = $(".setbar");
  if (setbar) {
    const input = $(".setbar__input", setbar);
    const readout = $(".setbar__handle b", setbar);
    const rows = $$(".setbar__row", setbar);
    const apply = (raw) => {
      const bar = Math.max(30, Math.min(98, Math.round(raw)));
      setbar.style.setProperty("--bar", bar);
      readout.textContent = bar;
      rows.forEach((row) => {
        const team = parseInt(row.style.getPropertyValue("--v"), 10) < bar;
        if (row.classList.contains("is-team") === team) return;
        row.classList.toggle("is-team", team);
        row.classList.remove("is-flip");
        void row.offsetWidth;
        row.classList.add("is-flip");
      });
      return bar;
    };
    input.addEventListener("input", () => { input.value = apply(input.value); }, { signal });
    apply(input.value);
    // Show once that the line moves: ease it down past the middle question and back.
    if (!reduceMotion && "IntersectionObserver" in window) {
      const so = trackObserver(new IntersectionObserver((entries) => {
        if (!entries.some((e) => e.isIntersecting)) return;
        so.disconnect();
        let touched = false;
        input.addEventListener("pointerdown", () => { touched = true; }, { once: true, signal });
        const t0 = performance.now() + 500;
        const tick = (now) => {
          if (touched) return;
          const p = Math.max(0, Math.min(1, (now - t0) / 1800));
          input.value = apply(80 - 16 * Math.sin(p * Math.PI));
          if (p < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      }, { threshold: 0.6 }));
      so.observe(setbar);
    }
  }

  /* ---------------- ROI calculator ---------------- */
  const roiConv = $("#roiConv"), roiCost = $("#roiCost");
  function fmt(n) { return Math.round(n).toLocaleString("en-US"); }
  function updateRoi() {
    const conv = parseInt(roiConv.value, 10), cost = parseFloat(roiCost.value);
    $("#roiConvVal").textContent = fmt(conv);
    $("#roiCostVal").textContent = "$" + cost.toFixed(2);
    $("#roiResolved").textContent = fmt(conv * 0.82);
    $("#roiSavings").textContent = "$" + fmt(conv * 0.82 * (cost - 0.4));
  }
  if (roiConv && roiCost) { roiConv.addEventListener("input", updateRoi, { signal }); roiCost.addEventListener("input", updateRoi, { signal }); updateRoi(); }

  /* ---------------- Live demo: answers from a business's own pages ---------------- */
  /* Osonflow finds the passage that best matches the question and answers with it,
     citing the page. When nothing matches well enough, or the customer asks for a
     person, the chat goes to the team instead. Samples ship in all three page
     languages because matching compares the words the visitor actually types. */
  const DEMO_SAMPLES = {
    shop: {
      name: "Libos Store",
      asks: ["Do you deliver on Sundays?", "Can I return a jacket after a week?", "Can I pay in installments?", "Do you sell gift cards?"],
      pages: [
        { title: { en: "Delivery", uz: "Yetkazib berish", ru: "Доставка" },
          text: { en: "We deliver across Tashkent the next day for 25 000 soms, and for free on orders over 500 000 soms. Delivery to the regions takes 2 to 4 days. Couriers also work on Saturdays and Sundays.",
                  uz: "Toshkent bo'ylab ertasi kuni 25 000 so'mga yetkazib beramiz, 500 000 so'mdan ortiq buyurtmalar uchun esa bepul. Viloyatlarga yetkazish 2–4 kun davom etadi. Kuryerlar shanba va yakshanba kunlari ham ishlaydi.",
                  ru: "Доставляем по Ташкенту на следующий день за 25 000 сумов, а при заказе от 500 000 сумов бесплатно. Доставка в регионы занимает 2–4 дня. Курьеры работают и в субботу, и в воскресенье." },
          keys: { en: "shipping courier weekend cost free", uz: "dostavka kuryer dam olish narxi bepul yetkazasizmi", ru: "курьер доставляете выходные стоимость бесплатно" } },
        { title: { en: "Returns", uz: "Qaytarish", ru: "Возврат" },
          text: { en: "You can return or exchange unworn items within 14 days if you have the receipt. The money goes back to your card within 3 to 5 working days.",
                  uz: "Kiyilmagan mahsulotni chek bilan 14 kun ichida qaytarish yoki almashtirish mumkin. Pul kartangizga 3–5 ish kunida qaytariladi.",
                  ru: "Неношеные вещи можно вернуть или обменять в течение 14 дней при наличии чека. Деньги возвращаются на карту за 3–5 рабочих дней." },
          keys: { en: "refund return exchange swap money back week", uz: "qaytarsam almashtirish pul hafta", ru: "возврат вернуть обмен деньги неделю" } },
        { title: { en: "Sizes", uz: "O'lchamlar", ru: "Размеры" },
          text: { en: "Our sizes go from XS to 3XL. If you are between two sizes, we recommend the larger one. You can try clothes on in the store before paying.",
                  uz: "O'lchamlarimiz XS dan 3XL gacha. Ikki o'lcham orasida bo'lsangiz, kattarog'ini tavsiya qilamiz. Do'konda to'lashdan oldin kiyib ko'rishingiz mumkin.",
                  ru: "Размеры от XS до 3XL. Если вы между двумя размерами, советуем брать больший. В магазине можно примерить одежду до оплаты." },
          keys: { en: "size fit bigger smaller try fitting", uz: "o'lcham razmer kattaroq kichikroq kiyib", ru: "размер больше меньше примерить примерка" } },
        { title: { en: "Payment", uz: "To'lov", ru: "Оплата" },
          text: { en: "You can pay with Click, Payme, Uzcard, Humo, or in cash to the courier. Installments with Uzum Nasiya are available for orders over 1 000 000 soms.",
                  uz: "Click, Payme, Uzcard, Humo orqali yoki kuryerga naqd pul bilan to'lashingiz mumkin. 1 000 000 so'mdan ortiq buyurtmalar uchun Uzum Nasiya orqali muddatli to'lov bor.",
                  ru: "Оплатить можно через Click, Payme, Uzcard, Humo или наличными курьеру. Для заказов от 1 000 000 сумов доступна рассрочка через Uzum Nasiya." },
          keys: { en: "pay payment card cash installments credit monthly", uz: "to'lov to'lash karta naqd muddatli nasiya kredit", ru: "оплата оплатить карта наличные рассрочка кредит частями" } },
        { title: { en: "Store and hours", uz: "Do'kon va ish vaqti", ru: "Магазин и часы работы" },
          text: { en: "Our store is at 12 Amir Temur Street in Tashkent. It is open every day from 10:00 to 21:00.",
                  uz: "Do'konimiz Toshkentda, Amir Temur ko'chasi 12-uyda. Har kuni 10:00 dan 21:00 gacha ishlaydi.",
                  ru: "Наш магазин находится в Ташкенте, на улице Амира Темура, 12. Работаем каждый день с 10:00 до 21:00." },
          keys: { en: "address location located store shop open hours time working", uz: "manzil qayerda joylashgan do'kon ish vaqti ochiq soat", ru: "адрес где находится магазин часы работы время открыт" } },
        { title: { en: "Your order", uz: "Buyurtmangiz", ru: "Ваш заказ" },
          text: { en: "After you order, we send an SMS with a link to track it. The courier calls 30 minutes before arriving.",
                  uz: "Buyurtma bergach, uni kuzatish havolasi bilan SMS yuboramiz. Kuryer yetib kelishidan 30 daqiqa oldin qo'ng'iroq qiladi.",
                  ru: "После заказа мы отправляем SMS со ссылкой для отслеживания. Курьер звонит за 30 минут до приезда." },
          keys: { en: "track tracking order status sms call courier arrive", uz: "buyurtma kuzatish holati sms qo'ng'iroq keladi", ru: "заказ отследить статус смс звонок приедет" } }
      ]
    },
    dental: {
      name: "Tabassum Dental",
      asks: ["How much is teeth cleaning?", "Are you open on Sunday?", "Do you treat children?", "Do you accept insurance?"],
      pages: [
        { title: { en: "Prices", uz: "Narxlar", ru: "Цены" },
          text: { en: "A check-up with a dentist costs 100 000 soms. Professional teeth cleaning costs 350 000 soms. A filling starts from 400 000 soms.",
                  uz: "Stomatolog ko'rigi 100 000 so'm turadi. Tishlarni professional tozalash 350 000 so'm. Plomba 400 000 so'mdan boshlanadi.",
                  ru: "Осмотр у стоматолога стоит 100 000 сумов. Профессиональная чистка зубов стоит 350 000 сумов. Пломба от 400 000 сумов." },
          keys: { en: "price cost checkup cleaning filling", uz: "narx narxi turadi tozalash ko'rik plomba", ru: "цена стоимость стоит осмотр чистка пломба" } },
        { title: { en: "Opening hours", uz: "Ish vaqti", ru: "Часы работы" },
          text: { en: "We are open Monday to Saturday from 9:00 to 20:00. On Sundays we only see patients with urgent pain.",
                  uz: "Dushanbadan shanbagacha 9:00 dan 20:00 gacha ishlaymiz. Yakshanba kuni faqat shoshilinch og'riq bilan kelgan bemorlarni qabul qilamiz.",
                  ru: "Работаем с понедельника по субботу с 9:00 до 20:00. В воскресенье принимаем только пациентов с острой болью." },
          keys: { en: "open hours weekend time schedule working", uz: "ish vaqti ochiq dam olish jadval", ru: "часы открыты выходные график" } },
        { title: { en: "Booking", uz: "Qabulga yozilish", ru: "Запись" },
          text: { en: "Book a visit by calling +998 71 200 00 00 or by writing to us on Telegram. Most patients get an appointment the same week.",
                  uz: "Qabulga +998 71 200 00 00 raqamiga qo'ng'iroq qilib yoki Telegram orqali yozilishingiz mumkin. Ko'pchilik bemorlar shu haftaning o'zida qabulga kiradi.",
                  ru: "Записаться можно по телефону +998 71 200 00 00 или в Telegram. Большинство пациентов попадают на приём в ту же неделю." },
          keys: { en: "book appointment visit schedule telegram phone call", uz: "yozilish navbat telegram telefon", ru: "записаться запись телеграм телефон" } },
        { title: { en: "Children", uz: "Bolalar", ru: "Дети" },
          text: { en: "We treat children from 3 years old. A parent can stay in the room during the visit.",
                  uz: "3 yoshdan katta bolalarni davolaymiz. Ota-ona qabul vaqtida xonada qolishi mumkin.",
                  ru: "Лечим детей с 3 лет. Родитель может находиться в кабинете во время приёма." },
          keys: { en: "kids child children son daughter baby", uz: "bola bolalar farzand o'g'il qiz", ru: "дети ребёнок ребенка сын дочь" } },
        { title: { en: "Implants", uz: "Implantlar", ru: "Импланты" },
          text: { en: "A dental implant costs from 5 500 000 soms, crown included. The first consultation about implants is free.",
                  uz: "Implant tojsi bilan birga 5 500 000 so'mdan turadi. Implant bo'yicha birinchi maslahat bepul.",
                  ru: "Имплант с коронкой стоит от 5 500 000 сумов. Первая консультация по имплантам бесплатная." },
          keys: { en: "implant tooth missing crown price", uz: "implant tish toj narxi", ru: "имплант зуб коронка цена" } },
        { title: { en: "Toothache", uz: "Tish og'rig'i", ru: "Если болит зуб" },
          text: { en: "If you are in pain, call us and we will see you the same day, even on Sunday.",
                  uz: "Tishingiz og'risa, qo'ng'iroq qiling, sizni o'sha kuniyoq, hatto yakshanba kuni ham qabul qilamiz.",
                  ru: "Если болит зуб, позвоните нам, и мы примем вас в тот же день, даже в воскресенье." },
          keys: { en: "pain hurts emergency urgent toothache today", uz: "og'riq og'riyapti shoshilinch bugun", ru: "боль срочно экстренно сегодня" } }
      ]
    },
    food: {
      name: "Navro'z Kitchen",
      asks: ["Is plov served in the evening?", "Can I book a table for 12 people?", "Is delivery free?", "Do you have a halal certificate?"],
      pages: [
        { title: { en: "Opening hours", uz: "Ish vaqti", ru: "Часы работы" },
          text: { en: "We are open every day from 11:00 to 23:00. The kitchen takes the last orders at 22:30.",
                  uz: "Har kuni 11:00 dan 23:00 gacha ishlaymiz. Oshxona oxirgi buyurtmalarni 22:30 da qabul qiladi.",
                  ru: "Работаем каждый день с 11:00 до 23:00. Последние заказы кухня принимает в 22:30." },
          keys: { en: "open hours time close closing late working", uz: "ish vaqti ochiq yopiladi kech soat", ru: "часы открыты закрываетесь поздно время" } },
        { title: { en: "Table booking", uz: "Stol band qilish", ru: "Бронь столов" },
          text: { en: "Book a table by phone or on Telegram. For groups of more than 10 people, please book one day ahead.",
                  uz: "Stolni telefon yoki Telegram orqali band qilishingiz mumkin. 10 kishidan ortiq guruhlar uchun bir kun oldin band qiling.",
                  ru: "Забронировать стол можно по телефону или в Telegram. Для компаний больше 10 человек бронируйте за день." },
          keys: { en: "book reserve reservation table people group seats", uz: "band bron stol kishi guruh odam", ru: "бронь забронировать стол человек компания гостей" } },
        { title: { en: "Delivery", uz: "Yetkazib berish", ru: "Доставка" },
          text: { en: "We deliver within 5 km with our own couriers. Delivery is free on orders over 150 000 soms, otherwise it costs 15 000 soms.",
                  uz: "5 km radiusda o'z kuryerlarimiz orqali yetkazib beramiz. 150 000 so'mdan ortiq buyurtmalarga yetkazish bepul, aks holda 15 000 so'm.",
                  ru: "Доставляем в радиусе 5 км своими курьерами. При заказе от 150 000 сумов доставка бесплатная, иначе 15 000 сумов." },
          keys: { en: "deliver delivery courier free cost price", uz: "yetkazib yetkazasizmi dostavka kuryer bepul narxi", ru: "доставка доставляете курьер бесплатно стоимость" } },
        { title: { en: "Menu", uz: "Menyu", ru: "Меню" },
          text: { en: "Plov is served every day until 15:00, while it lasts. We also have vegetarian dishes and a children's menu.",
                  uz: "Osh har kuni soat 15:00 gacha, tugaguncha tortiladi. Vegetarian taomlar va bolalar menyusi ham bor.",
                  ru: "Плов подаём каждый день до 15:00, пока не закончится. Есть вегетарианские блюда и детское меню." },
          keys: { en: "plov menu food dishes vegetarian kids evening lunch", uz: "osh palov menyu taom vegetarian bolalar kechqurun tushlik", ru: "плов меню блюда вегетарианское детское вечером обед" } },
        { title: { en: "Banquets", uz: "Banketlar", ru: "Банкеты" },
          text: { en: "Our banquet hall seats up to 80 guests. The banquet menu starts from 180 000 soms per person.",
                  uz: "Banket zalimiz 80 nafargacha mehmonga mo'ljallangan. Banket menyusi bir kishi uchun 180 000 so'mdan boshlanadi.",
                  ru: "Банкетный зал вмещает до 80 гостей. Банкетное меню от 180 000 сумов на человека." },
          keys: { en: "banquet wedding party event hall guests birthday", uz: "banket to'y bazm tadbir zal mehmon tug'ilgan", ru: "банкет свадьба праздник мероприятие зал гости рождения" } },
        { title: { en: "Parking", uz: "Avtoturargoh", ru: "Парковка" },
          text: { en: "There is free parking for guests right next to the entrance.",
                  uz: "Mehmonlar uchun kiraverishda bepul avtoturargoh bor.",
                  ru: "Для гостей есть бесплатная парковка прямо у входа." },
          keys: { en: "parking car park", uz: "parkovka avtoturargoh mashina", ru: "парковка машина авто" } }
      ]
    }
  };
  /* A visitor's own site: suggestions are asked in the site's language, since answers
     start by matching the words of the question against the words on its pages. */
  const SITE_ASKS = {
    en: ["Do you deliver?", "How can I pay?", "Where are you located?", "What are your opening hours?"],
    ru: ["Есть доставка?", "Как можно оплатить?", "Где вы находитесь?", "Какой у вас график работы?"],
    uz: ["Yetkazib berasizmi?", "Qanday to'lash mumkin?", "Manzilingiz qayerda?", "Ish vaqtingiz qanday?"]
  };
  const siteLanguage = (passages) => {
    const sample = passages.slice(0, 60).map((p) => p.text).join(" ");
    const letters = sample.match(/\p{L}/gu) || [];
    const cyrillic = sample.match(/\p{Script=Cyrillic}/gu) || [];
    if (letters.length && cyrillic.length / letters.length > 0.3) return "ru";
    if (/\b(va|uchun|bilan|yetkazib|mahsulot|narxi|buyurtma)\b|o['‘’ʻ]|g['‘’ʻ]/i.test(sample)) return "uz";
    return "en";
  };

  const demo = $(".demo");
  if (demo) {
    const log = $("#demoLog"), asks = $("#demoAsks"), askForm = $("#demoAskForm"), askInput = $("#demoAskInput");
    const urlForm = $("#demoUrlForm"), urlInput = $("#demoUrl"), replyForm = $("#demoReplyForm"), replyInput = $("#demoReplyInput");
    const MATCH_BAR = 0.55;
    const STOP = new Set([
      ..."a an the is are was be do does did you your we our us i me my it its this that of to in on at for with and or but can could would will should how what when where which who why much many any there have has had please tell about get after before".split(" "),
      ..."va bilan uchun ham bu shu u men mening siz sizda sizning sizlar biz bizda bormi bor mi qanday qancha qachon qayerda qayer nima necha nechta mumkinmi mumkin kerak iltimos bir keyin oldin bo'ladimi boladimi qilsa bo'lsa".split(" "),
      ..."и в во на с со по к у о об от до за для из что как где когда какой какая какие сколько ли есть можно мне меня мой моя я вы вас ваш это то не да нет бы же пожалуйста а или но через после".split(" ")
    ]);
    const GREETING = /^(hi|hello|hey|salom|assalomu alaykum|assalom|привет|здравствуйте|добрый день)[\s!.,?]*$/i;
    const ASKED_FOR_PERSON = /\b(human|real person|a person|operator|manager|live agent)\b|operator|menejer|odam bilan|xodim bilan|с человеком|живым|оператор|менеджер/i;

    const normalize = (t) => t.toLowerCase().replace(/[‘’ʻʼ`´]/g, "'").replace(/ё/g, "е");
    const stem = (w) => { const b = w.replace(/'/g, ""); return b.length >= 6 ? b.slice(0, 5) : b.length === 5 ? b.slice(0, 4) : b; };
    const wordsOf = (t) => normalize(t).match(/[\p{L}\p{N}']+/gu) || [];
    const termsOf = (t) => [...new Set(wordsOf(t).filter((w) => w.length > 1 && !STOP.has(w)).map(stem).filter((s) => s.length > 1))];
    const same = (a, b) => a === b || (Math.min(a.length, b.length) >= 4 && (a.startsWith(b) || b.startsWith(a)));

    const state = { kind: "sample", sample: "shop", host: "", chunks: [], busy: false };
    const lang = () => (["uz", "ru"].includes(document.documentElement.lang) ? document.documentElement.lang : "en");

    function sampleChunks(key) {
      const l = lang();
      return DEMO_SAMPLES[key].pages.map((p) => ({ title: p.title[l], url: "", text: p.text[l], terms: termsOf(p.text[l] + " " + p.keys[l] + " " + p.title[l]) }));
    }

    /* Customers and websites rarely use the same word ("where are you?" vs "address").
       For a visitor's own site these groups widen the search; the model still decides
       whether a passage really answers. Samples keep strict matching. */
    const RELATED = [
      "where located location address branch shop store find qayerda joylashgan manzil manzilingiz filial do'kon где находитесь адрес расположены филиал магазин",
      "deliver delivery shipping courier yetkazib yetkazish dostavka kuryer доставка доставляете курьер",
      "pay payment card cash installments credit to'lov to'lash karta naqd muddatli nasiya оплата оплатить карта наличные рассрочка кредит",
      "hours open schedule time working ish vaqti vaqtingiz ochiq soat jadval график работы работаете часы режим",
      "price cost much narx narxi qancha turadi цена стоимость сколько стоит",
      "return refund exchange qaytarish qaytarsam almashtirish возврат вернуть обмен",
      "phone call contact telefon aloqa qo'ng'iroq телефон контакты связаться позвонить"
    ].map(termsOf);
    const relatedTerms = (terms) => [...new Set(RELATED.filter((group) => group.some((g) => terms.some((t) => same(g, t)))).flat())].filter((g) => !terms.some((t) => same(g, t)));

    /* Passages ranked by how much of the question they cover, rarer words counting more. */
    function rankMatches(question, { widen = false } = {}) {
      const qTerms = termsOf(question);
      if (!qTerms.length || !state.chunks.length) return { ranked: [], terms: qTerms };
      const n = state.chunks.length;
      const weights = qTerms.map((q) => {
        const df = state.chunks.reduce((c, ch) => c + (ch.terms.some((t) => same(t, q)) ? 1 : 0), 0);
        // A word the pages never use counts as fully as a rare one: missing the key word means no answer.
        return { q, w: df ? Math.log(1 + n / df) : Math.log(1 + n), known: df > 0 };
      });
      const total = weights.reduce((sum, x) => sum + x.w, 0);
      // Related words help a passage rank, at half weight, without inflating the question's own total.
      const extra = widen ? relatedTerms(qTerms) : [];
      const covers = (chunk) => weights.reduce((sum, x) => sum + (x.known && chunk.terms.some((t) => same(t, x.q)) ? x.w : 0), 0);
      const related = (chunk) => extra.reduce((sum, g) => sum + (chunk.terms.some((t) => same(t, g)) ? 0.5 : 0), 0);
      const ranked = state.chunks
        .map((chunk) => ({ chunk, score: Math.min(1, (covers(chunk) + Math.min(related(chunk), total * 0.5)) / total) }))
        .filter((m) => m.score > 0)
        .sort((x, y) => y.score - x.score || x.chunk.text.length - y.chunk.text.length);
      return { ranked, terms: qTerms };
    }

    function bestMatch(question) {
      const { ranked, terms } = rankMatches(question);
      return { chunk: ranked[0] ? ranked[0].chunk : null, score: ranked[0] ? ranked[0].score : 0, terms };
    }

    /* Page text is untrusted, so every visible string is set as text, never as HTML. */
    function el(tag, cls, text) {
      const node = document.createElement(tag);
      if (cls) node.className = cls;
      if (text != null) node.textContent = text;
      return node;
    }

    function addMessage(role, text) {
      const row = el("div", "demo__msg demo__msg--" + role);
      if (role === "bot") row.appendChild(el("span", "demo__who", "Osonflow"));
      if (role === "team") row.appendChild(el("span", "demo__who", "Your team"));
      row.appendChild(el("p", "demo__bubble", text));
      log.appendChild(row);
      log.scrollTop = log.scrollHeight;
      return row;
    }

    function setTeam(view) { demo.dataset.team = view; }
    function setStatus(key) { demo.dataset.status = key; }

    function markPassage(target, text, terms) {
      target.textContent = "";
      text.split(/([\p{L}\p{N}'’ʻ]+)/u).forEach((part) => {
        const isWord = /[\p{L}\p{N}]/u.test(part);
        const hit = isWord && !STOP.has(normalize(part)) && terms.some((q) => same(stem(normalize(part)), q));
        target.appendChild(hit ? el("mark", "", part) : document.createTextNode(part));
      });
    }

    function showAnswer(match) {
      const { chunk, score, terms } = match;
      $("#demoSrcTitle").textContent = chunk.title;
      const urlEl = $("#demoSrcUrl");
      if (chunk.url) {
        try { const u = new URL(chunk.url); urlEl.textContent = u.hostname.replace(/^www\./, "") + (u.pathname === "/" ? "" : u.pathname); } catch (_) { urlEl.textContent = chunk.url; }
        urlEl.hidden = false;
      } else {
        urlEl.hidden = true;
      }
      markPassage($("#demoSrcText"), chunk.text, terms);
      const pct = Math.round(score * 100);
      $("#demoMatch").textContent = pct;
      $("#demoMatchFill").style.width = pct + "%";
      setTeam("answer");
    }

    function handOff(question, reason) {
      $("#demoTicketQuote").textContent = question;
      demo.dataset.reason = reason;
      demo.dataset.replied = "false";
      setTeam("handoff");
    }

    /* Words from the answer, so the cited passage lights up where the two agree. */
    function answerTerms(question, answer) { return [...new Set([...termsOf(question), ...termsOf(answer)])]; }

    async function answerFromSite(question) {
      const { ranked, terms } = rankMatches(question, { widen: true });
      // Nothing on the pages shares a word with the question: hand off without spending a model call.
      if (!ranked.length || ranked[0].score < 0.25) return { kind: "handoff" };
      const top = ranked.slice(0, 3);
      try {
        const res = await fetch("/api/demo/answer", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ question, lang: lang(), passages: top.map(({ chunk }) => ({ title: chunk.title, url: chunk.url, text: chunk.text, sig: chunk.sig })) })
        });
        const data = await res.json();
        if (!res.ok || data.error) throw new Error(data.error || "unavailable");
        if (!data.found) return { kind: "handoff" };
        const cited = top[data.passage] || top[0];
        return { kind: "answer", text: data.answer, match: { chunk: cited.chunk, score: cited.score, terms: answerTerms(question, data.answer) } };
      } catch (_) {
        // The model is a nicety, not a dependency: fall back to quoting the best passage.
        const best = ranked[0];
        return best.score >= MATCH_BAR ? { kind: "answer", text: best.chunk.text, match: { chunk: best.chunk, score: best.score, terms } } : { kind: "handoff" };
      }
    }

    function respond(question) {
      const asked = ASKED_FOR_PERSON.test(question);
      const typing = el("div", "demo__msg demo__msg--bot demo__msg--typing");
      typing.appendChild(el("span", "demo__dots")).append(el("i"), el("i"), el("i"));
      log.appendChild(typing);
      log.scrollTop = log.scrollHeight;
      const kindAtStart = state.kind + ":" + state.host + ":" + state.sample;

      const settle = (result) => {
        typing.remove();
        // The visitor switched business while this was on its way; drop the stale reply.
        if (kindAtStart !== state.kind + ":" + state.host + ":" + state.sample) return;
        if (result.kind === "asked") {
          addMessage("bot", "Of course. I've passed this chat to the team. They'll reply here.");
          handOff(question, "asked");
        } else if (result.kind === "nudge") {
          addMessage("bot", "Ask me something about this business, like delivery, prices, or opening hours.");
        } else if (result.kind === "answer") {
          addMessage("bot", result.text);
          showAnswer(result.match);
        } else {
          addMessage("bot", "I couldn't find that in this business's pages, so I've passed your question to the team. They'll reply here.");
          handOff(question, "missing");
        }
      };

      const delay = reduceMotion ? 150 : 650;
      if (asked) { window.setTimeout(() => settle({ kind: "asked" }), delay); return; }
      if (!termsOf(question).length || GREETING.test(question)) { window.setTimeout(() => settle({ kind: "nudge" }), delay); return; }

      if (state.kind === "site") {
        const started = Date.now();
        answerFromSite(question).then((result) => window.setTimeout(() => settle(result), Math.max(0, delay - (Date.now() - started))));
        return;
      }

      const match = bestMatch(question);
      window.setTimeout(() => settle(match.chunk && match.score >= MATCH_BAR ? { kind: "answer", text: match.chunk.text, match } : { kind: "handoff" }), delay);
    }

    function ask(question) {
      const q = question.trim().slice(0, 300);
      if (!q || state.busy) return;
      addMessage("customer", q);
      respond(q);
    }

    function renderAsks(list) {
      asks.textContent = "";
      list.forEach((q) => {
        const b = el("button", "demo__chip", q);
        b.type = "button";
        b.addEventListener("click", () => { b.classList.add("is-used"); ask(b.textContent); }, { signal });
        asks.appendChild(b);
      });
    }

    function startChat(name, pageCount, asksList) {
      $("#demoBizName").textContent = name;
      $("#demoBizMark").textContent = name.trim().charAt(0).toUpperCase();
      $("#demoPageCount").textContent = pageCount;
      log.textContent = "";
      addMessage("bot", "Hi! Ask me anything about this business.");
      renderAsks(asksList);
      setTeam("idle");
    }

    function loadSample(key) {
      state.kind = "sample";
      state.sample = key;
      state.host = "";
      demo.dataset.kind = "sample";
      state.chunks = sampleChunks(key);
      $$(".demo__sample", demo).forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.sample === key)));
      startChat(DEMO_SAMPLES[key].name, DEMO_SAMPLES[key].pages.length, DEMO_SAMPLES[key].asks);
      setStatus("ready");
    }

    async function readSite(raw) {
      const value = raw.trim();
      if (!value || /\s/.test(value) || !/\.[a-z]{2,}/i.test(value)) { setStatus("invalid_url"); urlInput.focus(); return; }
      state.busy = true;
      demo.dataset.phase = "reading";
      urlInput.setAttribute("aria-busy", "true");
      setStatus("reading");
      try {
        const res = await fetch("/api/demo/read-site", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ url: value }) });
        const data = await res.json().catch(() => ({ error: "unreachable" }));
        if (!res.ok || data.error) { setStatus(data.error || "unreachable"); return; }
        state.kind = "site";
        state.host = data.host;
        state.chunks = data.passages.map((p) => ({ ...p, terms: termsOf(p.title + " " + p.text) }));
        demo.dataset.kind = "site";
        $$(".demo__sample", demo).forEach((b) => b.setAttribute("aria-pressed", "false"));
        const siteLang = siteLanguage(data.passages);
        // English suggestions go through the page translator; a Russian or Uzbek site gets its own.
        startChat(data.host, data.pageCount, SITE_ASKS[siteLang === "en" ? "en" : siteLang]);
        setStatus("ready");
        askInput.focus({ preventScroll: true });
      } catch (_) {
        setStatus("unreachable");
      } finally {
        state.busy = false;
        demo.dataset.phase = "ready";
        urlInput.removeAttribute("aria-busy");
      }
    }

    urlForm.addEventListener("submit", (e) => { e.preventDefault(); if (!state.busy) readSite(urlInput.value); }, { signal });
    $$(".demo__sample", demo).forEach((b) => b.addEventListener("click", () => { if (!state.busy) loadSample(b.dataset.sample); }, { signal }));
    askForm.addEventListener("submit", (e) => { e.preventDefault(); const v = askInput.value; askInput.value = ""; ask(v); }, { signal });
    $("#demoHuman").addEventListener("click", () => ask("I'd like to talk to a person."), { signal });
    replyForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const v = replyInput.value.trim().slice(0, 300);
      if (!v) return;
      replyInput.value = "";
      addMessage("team", v);
      demo.dataset.replied = "true";
    }, { signal });

    // Samples answer in the page's language, so a language switch restarts the sample chat.
    const langWatch = new MutationObserver(() => { if (state.kind === "sample") loadSample(state.sample); });
    langWatch.observe(document.documentElement, { attributes: true, attributeFilter: ["lang"] });
    trackObserver(langWatch);

    loadSample("shop");
  }

  /* ---------------- FAQ accordion ---------------- */
  $$(".acc").forEach((acc) => {
    const q = $(".acc__q", acc), a = $(".acc__a", acc);
    const open = (el) => { el.classList.add("is-open"); $(".acc__a", el).style.maxHeight = $(".acc__a", el).scrollHeight + "px"; };
    const close = (el) => { el.classList.remove("is-open"); $(".acc__a", el).style.maxHeight = ""; };
    if (acc.classList.contains("is-open")) requestAnimationFrame(() => open(acc));
    q.addEventListener("click", () => {
      const isOpen = acc.classList.contains("is-open");
      $$(".acc").forEach((o) => { if (o !== acc) close(o); });
      isOpen ? close(acc) : open(acc);
    }, { signal });
  });
  window.addEventListener("resize", () => { const o = $(".acc.is-open"); if (o) $(".acc__a", o).style.maxHeight = $(".acc__a", o).scrollHeight + "px"; }, { signal });

  /* ---------------- Embed modal ---------------- */
  const modal = $("#embedModal");
  const snippet = () => '<span class="c-com">&lt;!-- Osonflow calm portal --&gt;</span>\n<span class="c-tag">&lt;script&gt;</span>\n  window.osonflowConfig = {\n    portalId: <span class="c-str">"' + esc($("#modalCompany").value || "your-company") + '"</span>,\n    theme: <span class="c-str">"' + $("#modalTheme").value + '"</span>\n  };\n<span class="c-tag">&lt;/script&gt;</span>\n<span class="c-tag">&lt;script</span> <span class="c-attr">src</span>=<span class="c-str">"https://widget.osonflow.uz/widget.js"</span> async<span class="c-tag">&gt;&lt;/script&gt;</span>';
  function plainSnippet() { return '<!-- Osonflow calm portal -->\n<script>\n  window.osonflowConfig = {\n    portalId: "' + ($("#modalCompany").value || "your-company") + '",\n    theme: "' + $("#modalTheme").value + '"\n  };\n</' + 'script>\n<script src="https://widget.osonflow.uz/widget.js" async></' + "script>"; }
  function renderSnippet() { $("#modalSnippet").innerHTML = snippet(); }
  function openModal() { renderSnippet(); modal.hidden = false; document.body.style.overflow = "hidden"; }
  function closeModal() { modal.hidden = true; document.body.style.overflow = ""; }
  ["#heroEmbed", "#embedOpen2", "#ctaEmbed"].forEach((id) => { const el = $(id); if (el) el.addEventListener("click", openModal, { signal }); });
  ["#modalClose", "#modalCancel", "#modalOverlay"].forEach((id) => { const el = $(id); if (el) el.addEventListener("click", closeModal, { signal }); });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape" && !modal.hidden) closeModal(); }, { signal });
  $("#modalCompany") && $("#modalCompany").addEventListener("input", (e) => { e.target.value = e.target.value.toLowerCase().replace(/\s+/g, "-"); renderSnippet(); }, { signal });
  $("#modalTheme") && $("#modalTheme").addEventListener("change", renderSnippet, { signal });
  function copyText(text, btn) {
    const done = () => { const o = btn.textContent; btn.textContent = "Copied"; btn.classList.add("is-copied"); setTimeout(() => { btn.textContent = o; btn.classList.remove("is-copied"); }, 1600); };
    if (navigator.clipboard) navigator.clipboard.writeText(text).then(done, done); else done();
  }
  $("#modalCopy") && $("#modalCopy").addEventListener("click", (e) => copyText(plainSnippet(), e.currentTarget), { signal });
  $("#modalCopyClose") && $("#modalCopyClose").addEventListener("click", () => { copyText(plainSnippet(), $("#modalCopy")); setTimeout(closeModal, 300); }, { signal });

  /* ---------------- Embed code copy (channels) ---------------- */
  const copyBtn = $("#copyBtn");
  if (copyBtn) copyBtn.addEventListener("click", () => copyText('<!-- Osonflow widget -->\n<script src="https://widget.osonflow.uz/widget.js"\n        data-id="osf_live_7f3a9c"></' + "script>", copyBtn), { signal });

  /* ---------------- Card tilt micro-interaction ---------------- */
  if (!reduceMotion && window.matchMedia("(pointer:fine)").matches) {
    $$(".tilt").forEach((card) => {
      card.addEventListener("mousemove", (e) => {
        const r = card.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
        card.style.transform = "perspective(900px) rotateX(" + (-y * 4).toFixed(2) + "deg) rotateY(" + (x * 4).toFixed(2) + "deg) translateY(-4px)";
      }, { signal });
      card.addEventListener("mouseleave", () => (card.style.transform = ""), { signal });
    });
  }

  }

  window.__initOsonflowLanding = initOsonflowLanding;
})();