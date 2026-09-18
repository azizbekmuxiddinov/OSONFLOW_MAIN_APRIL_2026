(function(){var e={WIDGET_URL:`https://widget.osonflow.uz`,DEFAULT_ORG_ID:`org_3Dhb76QSczUyE7dErBZuY9k65wC`,DEFAULT_POSITION:`bottom-right`},t=`<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
</svg>`,n=`<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"></path>
  <path d="M5 3v4"></path>
  <path d="M3 5h4"></path>
</svg>`,r=`<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <circle cx="12" cy="12" r="10"></circle>
  <path d="M9.09 9a3 3 0 1 1 5.83 1c0 2-3 3-3 3"></path>
  <path d="M12 17h.01"></path>
</svg>`,i=`<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.35" stroke-linecap="round" stroke-linejoin="round">
  <path d="m6 9 6 6 6-6"></path>
</svg>`,a=`<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <line x1="18" y1="6" x2="6" y2="18"></line>
  <line x1="6" y1="6" x2="18" y2="18"></line>
</svg>`,o=20,s=48,c=40,l=76,u=160,d=300,ee=`echo-widget-auto-opened`,te=8,ne=18,re=180,ie=34,ae=18,oe=8,se=4,ce=296,le=900,ue=`echo-widget-teaser-dismissed`,de=3,fe=40,pe=[`none`,`pulse`,`bounce`,`wiggle`,`glow`],me=380,he=640,ge={min:340,max:560},_e={min:520,max:880},ve=470,ye=`translate3d(0, 26px, 0) scale(0.975)`,be=`translate3d(0, 0, 0) scale(1)`,xe=360,Se=220,Ce=`cubic-bezier(0.16, 1, 0.3, 1)`,f=`cubic-bezier(0.4, 0, 1, 1)`,we=`blur(10px)`,Te=`blur(0px)`,Ee=`30px`,De=`echo-widget-launcher-styles`,Oe=`(prefers-reduced-motion: reduce)`,ke=`Talk with us`,Ae=`/sounds/notification.mp3`;(function(){let p=null,m=null,h=null,g=null,_=!1,v=null,y=null,b=null,x=!1,S=!1,C=!1,w=null,T=!1,je=!1,E=null,D=0,O=!1,k=null,A=!1,Me=``,Ne=``,j={launcherColor:`#6366f1`,launcherLabel:`Chat with us`,voiceLauncherLabel:ke,launcherIcon:`chat`,launcherIconUrl:``,launcherPromptEnabled:!1,launcherPromptText:`Need help? Talk with us`,launcherPromptDelaySeconds:5,launcherQuickReplies:[],launcherAttention:`none`,launcherBadgeEnabled:!1,animation:`slide-up`},M={"slide-up":{closedTransform:`translate3d(0, 18px, 0) scale(0.98)`,openTransform:`translate3d(0, 0, 0) scale(1)`,duration:260,easing:`cubic-bezier(0.16, 1, 0.3, 1)`},scale:{closedTransform:`translate3d(0, 8px, 0) scale(0.92)`,openTransform:`translate3d(0, 0, 0) scale(1)`,duration:240,easing:`cubic-bezier(0.2, 0.8, 0.2, 1)`},fade:{closedTransform:`translate3d(0, 0, 0) scale(1)`,openTransform:`translate3d(0, 0, 0) scale(1)`,duration:200,easing:`ease`},pop:{closedTransform:`translate3d(0, 20px, 0) scale(0.86)`,openTransform:`translate3d(0, 0, 0) scale(1)`,duration:320,easing:`cubic-bezier(0.18, 1.35, 0.32, 1)`}},N=null,P=null,F=e.DEFAULT_POSITION,I=o,L=o,R=s,z=me,B=he,Pe=!1,Fe=0,V=`session`,H=null,U=!1,Ie=!0,W=(e,t,n)=>Math.round(Math.max(t,Math.min(n,e))),Le=()=>L*2,Re=()=>L+R+te,ze=()=>L+Re(),Be=()=>{let e=F===`bottom-right`?`right`:`left`,t=F===`bottom-right`?`left`:`right`;g&&(g.style[e]=`${I}px`,g.style[t]=``,g.style.bottom=`${L}px`),m&&(m.style[e]=`${I}px`,m.style[t]=``,m.style.transformOrigin=F===`bottom-right`?`bottom right`:`bottom left`),b&&(b.style[e]=`${I}px`,b.style[t]=``,b.style.bottom=`${L+R+oe}px`,b.style.textAlign=F===`bottom-right`?`right`:`left`),It(),J()},Ve=()=>{if(V===`always`)return null;try{return V===`visitor`?window.localStorage:window.sessionStorage}catch{return null}},He=()=>`${ee}:${N??`default`}`,Ue=()=>{let e=Ve();if(!e)return!1;try{return e.getItem(He())===`1`}catch{return!1}},We=()=>{let e=Ve();if(e)try{e.setItem(He(),`1`)}catch{}},Ge=()=>{H!==null&&(window.clearTimeout(H),H=null)},Ke=()=>{!Pe||U||_||Ue()||(U=!0,H=window.setTimeout(()=>{H=null,!_&&(We(),$())},Fe*1e3))},qe=e=>{switch(e){case`sparkles`:return n;case`question`:return r;default:return t}},Je=e=>e===`sparkles`||e===`question`||e===`chat`?e:`chat`,G=e=>e===`slide-up`||e===`scale`||e===`fade`||e===`pop`?e:`slide-up`,K=e=>{if(!/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(e))return null;if(e.length===4){let[t,n,r,i]=e;return`${t}${n}${n}${r}${r}${i}${i}`}return e},Ye=e=>{let t=e.trim();if(!t||/[()"'\\\s;<>]/.test(t))return``;if(/^data:image\/(?:png|jpeg|jpg|gif|webp);base64,[A-Za-z0-9+/=]+$/.test(t))return t;try{let e=new URL(t,window.location.href).protocol;return e===`http:`||e===`https:`?t:``}catch{return``}},Xe=e=>{let t=K(e);if(!t)return`#ffffff`;let n=parseInt(t.slice(1,3),16),r=parseInt(t.slice(3,5),16),i=parseInt(t.slice(5,7),16);return(.299*n+.587*r+.114*i)/255>.6?`#111111`:`#ffffff`},Ze=e=>{let t=K(e);return t?`rgba(${parseInt(t.slice(1,3),16)}, ${parseInt(t.slice(3,5),16)}, ${parseInt(t.slice(5,7),16)}, 0.35)`:`rgba(99, 102, 241, 0.35)`},Qe=e=>e.replace(/&/g,`&amp;`).replace(/</g,`&lt;`).replace(/>/g,`&gt;`).replace(/"/g,`&quot;`).replace(/'/g,`&#039;`),$e=e=>Number.isNaN(e)?5:Math.max(0,Math.min(120,e)),et=()=>{y!==null&&(window.clearTimeout(y),y=null),k!==null&&(window.clearTimeout(k),k=null)},tt=e=>pe.includes(e)?e:`none`,nt=e=>{if(!Array.isArray(e))return[];let t=e.filter(e=>typeof e==`string`).map(e=>e.trim().slice(0,fe)).filter(Boolean);return[...new Set(t)].slice(0,de)},rt=()=>`${ue}:${N??`default`}`,it=()=>{try{return window.sessionStorage.getItem(rt())===`1`}catch{return!1}},at=()=>{try{window.sessionStorage.setItem(rt(),`1`)}catch{}},ot=()=>{b&&(b.style.cssText=`
      position: fixed;
      ${F===`bottom-right`?`right: ${I}px;`:`left: ${I}px;`}
      bottom: ${L+R+oe+se}px;
      width: min(${ce}px, calc(100vw - ${I*2}px));
      z-index: 999999;
      --echo-accent: ${j.launcherColor};
      --echo-accent-ink: ${Xe(j.launcherColor)};
      transform-origin: ${F===`bottom-right`?`bottom right`:`bottom left`};
      display: ${O?`block`:`none`};
    `,b.dataset.side=F===`bottom-right`?`right`:`left`)},st=()=>{x=!0,at(),ut()},ct=t=>{$(),p?.contentWindow?.postMessage({type:`start-chat`,payload:{message:t}},new URL(e.WIDGET_URL).origin)},lt=e=>{if(!b)return;let t=document.createElement(`div`);t.className=`echo-teaser`,e&&t.classList.add(`is-typing`);let n=document.createElement(`button`);n.type=`button`,n.className=`echo-teaser__close`,n.setAttribute(`aria-label`,`Dismiss`),n.innerHTML=a,n.addEventListener(`click`,e=>{e.stopPropagation(),st()});let r=document.createElement(`div`);r.className=`echo-teaser__header`;let i=document.createElement(`span`);i.className=`echo-teaser__avatar`;let o=Ye(Ne);if(o){let e=document.createElement(`img`);e.src=o,e.alt=``,i.appendChild(e)}else i.textContent=(Me.trim()[0]??``).toUpperCase();let s=document.createElement(`span`);s.className=`echo-teaser__name`,s.textContent=Me.trim();let c=document.createElement(`span`);c.className=`echo-teaser__status`,c.setAttribute(`aria-hidden`,`true`),r.append(i,s,c);let l=document.createElement(`button`);l.type=`button`,l.className=`echo-teaser__message`,l.addEventListener(`click`,()=>$());let u=document.createElement(`span`);u.className=`echo-teaser__typing`,u.setAttribute(`aria-hidden`,`true`),u.append(document.createElement(`i`),document.createElement(`i`),document.createElement(`i`));let d=document.createElement(`span`);if(d.className=`echo-teaser__text`,d.textContent=j.launcherPromptText.trim(),l.append(u,d),t.append(n,r,l),j.launcherQuickReplies.length>0){let e=document.createElement(`div`);e.className=`echo-teaser__replies`,j.launcherQuickReplies.forEach((t,n)=>{let r=document.createElement(`button`);r.type=`button`,r.className=`echo-teaser__chip`,r.style.setProperty(`--echo-chip-index`,String(n)),r.textContent=t,r.addEventListener(`click`,()=>ct(t)),e.appendChild(r)}),t.appendChild(e)}b.replaceChildren(t)},ut=()=>{et(),O=!1,q(),b&&(b.classList.remove(`is-visible`),b.style.display=`none`)},dt=()=>{if(!b||!j.launcherPromptText.trim())return;let e=!Z();O=!0,lt(e),ot(),q(),window.requestAnimationFrame(()=>{b?.classList.add(`is-visible`)}),e&&(k=window.setTimeout(()=>{k=null,b?.querySelector(`.echo-teaser`)?.classList.remove(`is-typing`)},le))},ft=()=>{let e=!_||!C;return j.launcherPromptEnabled&&!x&&!_&&!C&&S&&!!g&&e},pt=()=>{if(!ft()){ut();return}if(O){lt(!1),ot();return}if(y!==null)return;let e=$e(j.launcherPromptDelaySeconds)*1e3;y=window.setTimeout(()=>{y=null,ft()&&dt()},e)};function q(){if(!g)return;let e=D>0;if(!(!_&&!C&&(e||j.launcherBadgeEnabled&&O))){E?.remove();return}E||(E=document.createElement(`span`),E.className=`echo-widget-badge`,E.setAttribute(`aria-hidden`,`true`));let t=e?D>9?`9+`:String(D):`1`;E.textContent!==t&&(E.textContent=t,E.style.animation=`none`,E.offsetWidth,E.style.animation=``);let n=R*(1-Math.SQRT1_2)*.5;E.style.top=`${Math.round(n-9)}px`,E.style.right=`${Math.round(n-9)}px`,E.parentElement!==g&&g.appendChild(E)}function mt(){p?.contentWindow?.postMessage({type:`host-visibility`,payload:{open:_}},new URL(e.WIDGET_URL).origin)}function ht(){if(!g)return;for(let e of pe)g.classList.remove(`echo-widget-attn--${e}`);let e=j.launcherAttention;e===`none`||_||C||A||(g.style.setProperty(`--echo-launcher-glow`,Ze(j.launcherColor)),g.classList.add(`echo-widget-attn--${e}`))}let gt=e=>`<img src="${Qe(e)}" alt="Launcher" style="width: ${R}px; height: ${R}px; border-radius: 50%; object-fit: cover; display: block;" />`,_t=()=>`
      <span class="echo-widget-voice-orb" aria-hidden="true">
        <span class="echo-widget-voice-orb__pulse"></span>
        <span class="echo-widget-voice-orb__gradient"></span>
        <span class="echo-widget-voice-orb__shine"></span>
        <span class="echo-widget-voice-orb__sweep"></span>
        <span class="echo-widget-voice-orb__core"></span>
        <span class="echo-widget-voice-orb__ripple"></span>
      </span>
    `,vt=()=>{if(document.getElementById(De))return;let e=document.createElement(`style`);e.id=De,e.textContent=`
      @keyframes echo-widget-orb-shape {
        0%, 100% {
          border-radius: 50%;
          transform: scale(1) rotate(0deg);
        }

        50% {
          border-radius: 44% 56% 53% 47% / 49% 44% 56% 51%;
          transform: scale(1.08) rotate(8deg);
        }
      }

      @keyframes echo-widget-orb-gradient {
        0% {
          transform: translate3d(-3%, -2%, 0) rotate(0deg) scale(1);
        }

        50% {
          transform: translate3d(3%, 2%, 0) rotate(180deg) scale(1.06);
        }

        100% {
          transform: translate3d(-3%, -2%, 0) rotate(360deg) scale(1);
        }
      }

      @keyframes echo-widget-orb-core {
        0%, 100% {
          transform: scale(0.82);
          opacity: 0.78;
        }

        50% {
          transform: scale(1.18);
          opacity: 1;
        }
      }

      @keyframes echo-widget-orb-pulse-ripple {
        0% {
          box-shadow: 0 0 0 0 rgba(125, 211, 252, 0.42);
          opacity: 0.88;
        }

        72% {
          box-shadow: 0 0 0 10px rgba(125, 211, 252, 0);
          opacity: 0;
        }

        100% {
          box-shadow: 0 0 0 10px rgba(125, 211, 252, 0);
          opacity: 0;
        }
      }

      @keyframes echo-widget-orb-sweep {
        0% {
          transform: translate3d(-140%, 110%, 0) rotate(34deg);
          opacity: 0;
        }

        24% {
          opacity: 0.72;
        }

        52% {
          opacity: 0.34;
        }

        100% {
          transform: translate3d(140%, -130%, 0) rotate(34deg);
          opacity: 0;
        }
      }

      @keyframes echo-widget-orb-click-ripple {
        0% {
          transform: scale(0.25);
          opacity: 0.46;
        }

        100% {
          transform: scale(2.15);
          opacity: 0;
        }
      }

      @keyframes echo-widget-voice-launcher-glow {
        0%, 100% {
          box-shadow:
            0 16px 36px rgba(0, 0, 0, 0.28),
            0 0 0 1px rgba(255, 255, 255, 0.08),
            0 0 0 0 rgba(56, 189, 248, 0.18);
        }

        50% {
          box-shadow:
            0 18px 42px rgba(0, 0, 0, 0.34),
            0 0 0 1px rgba(255, 255, 255, 0.12),
            0 0 0 8px rgba(56, 189, 248, 0.08);
        }
      }

      @keyframes echo-widget-voice-shimmer {
        0% {
          transform: translateX(-130%) skewX(-18deg);
        }

        100% {
          transform: translateX(220%) skewX(-18deg);
        }
      }

      #echo-widget-button.echo-widget-button--voice {
        isolation: isolate;
        overflow: hidden;
        contain: paint;
      }

      #echo-widget-button.echo-widget-button--voice::before {
        content: "";
        position: absolute;
        inset: 1px;
        z-index: -1;
        overflow: hidden;
        border-radius: inherit;
        background:
          radial-gradient(circle at 17% 50%, rgba(56, 189, 248, 0.1), transparent 30%),
          linear-gradient(135deg, rgba(255,255,255,0.98) 0%, rgba(248,250,252,0.98) 54%, rgba(241,245,249,0.96) 100%);
      }

      #echo-widget-button.echo-widget-button--voice::after {
        content: "";
        position: absolute;
        top: 1px;
        bottom: 1px;
        left: 1px;
        z-index: 0;
        width: 34%;
        border-radius: inherit;
        background: linear-gradient(90deg, transparent, rgba(14,165,233,0.12), transparent);
        animation: echo-widget-voice-shimmer 3.4s ease-in-out infinite;
        pointer-events: none;
      }

      #echo-widget-button.echo-widget-button--voice > * {
        position: relative;
        z-index: 1;
      }

      .echo-widget-voice-label {
        position: relative;
        display: inline-flex;
        align-items: center;
        white-space: nowrap;
        line-height: 1;
        letter-spacing: -0.01em;
      }

      .echo-widget-voice-orb {
        position: relative;
        display: inline-flex;
        width: ${ie}px;
        height: ${ie}px;
        flex: 0 0 ${ie}px;
        overflow: hidden;
        border-radius: 50%;
        clip-path: circle(50%);
        -webkit-clip-path: circle(50%);
        box-shadow:
          inset 0 0 0 1px rgba(255, 255, 255, 0.38),
          0 8px 18px rgba(14, 165, 233, 0.34);
        animation: echo-widget-orb-shape 1.8s ease-in-out infinite;
      }

      .echo-widget-voice-orb__pulse {
        position: absolute;
        inset: 3px;
        z-index: 0;
        border-radius: inherit;
        animation: echo-widget-orb-pulse-ripple 1.9s cubic-bezier(0.16, 1, 0.3, 1) infinite;
      }

      .echo-widget-voice-orb__gradient {
        position: absolute;
        inset: -8px;
        z-index: 1;
        background:
          radial-gradient(circle at 28% 22%, rgba(238, 247, 126, 0.92), transparent 30%),
          radial-gradient(circle at 72% 24%, rgba(139, 211, 255, 0.96), transparent 34%),
          radial-gradient(circle at 46% 84%, rgba(0, 120, 224, 0.95), transparent 42%),
          radial-gradient(circle at 86% 72%, rgba(4, 31, 43, 0.86), transparent 42%),
          radial-gradient(circle at 20% 70%, rgba(96, 169, 129, 0.74), transparent 34%);
        animation: echo-widget-orb-gradient 3.2s linear infinite;
      }

      .echo-widget-voice-orb__shine {
        position: absolute;
        inset: 0;
        z-index: 2;
        background: conic-gradient(from 120deg, rgba(255,255,255,0.2), rgba(255,255,255,0), rgba(255,255,255,0.24), rgba(255,255,255,0));
        mix-blend-mode: overlay;
        opacity: 0.82;
      }

      .echo-widget-voice-orb__sweep {
        position: absolute;
        inset: -10px;
        z-index: 3;
        width: 18px;
        background: linear-gradient(90deg, transparent, rgba(255,255,255,0.74), transparent);
        filter: blur(0.5px);
        animation: echo-widget-orb-sweep 2.7s cubic-bezier(0.16, 1, 0.3, 1) infinite;
      }

      .echo-widget-voice-orb__core {
        position: absolute;
        left: 50%;
        top: 50%;
        z-index: 4;
        width: 9px;
        height: 9px;
        margin-left: -4.5px;
        margin-top: -4.5px;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.92);
        box-shadow: 0 0 16px rgba(255, 255, 255, 0.72);
        animation: echo-widget-orb-core 1.4s ease-in-out infinite;
      }

      .echo-widget-voice-orb__ripple {
        position: absolute;
        left: 50%;
        top: 50%;
        z-index: 5;
        width: 100%;
        height: 100%;
        margin-left: -50%;
        margin-top: -50%;
        border-radius: inherit;
        background: rgba(255, 255, 255, 0.52);
        opacity: 0;
        transform: scale(0.25);
        pointer-events: none;
      }

      #echo-widget-button.echo-widget-button--voice:active .echo-widget-voice-orb__ripple {
        animation: echo-widget-orb-click-ripple 520ms ease-out;
      }

      /* ── attention motions ───────────────────────────────────────────────
         Each plays in the first part of a long cycle and then rests, so the
         launcher catches the eye without fidgeting. Bounce and wiggle use the
         standalone translate/rotate properties, which compose with the
         transform the hover scale writes instead of fighting it. */

      @keyframes echo-widget-attn-pulse {
        0% { box-shadow: 0 0 0 0 var(--echo-launcher-glow); opacity: 1; }
        38%, 100% { box-shadow: 0 0 0 16px transparent; opacity: 0; }
      }

      @keyframes echo-widget-attn-bounce {
        0%, 20%, 100% { translate: 0 0; }
        6% { translate: 0 -10px; }
        11% { translate: 0 0; }
        15% { translate: 0 -4px; }
      }

      @keyframes echo-widget-attn-wiggle {
        0%, 18%, 100% { rotate: 0deg; }
        3% { rotate: -14deg; }
        6% { rotate: 12deg; }
        9% { rotate: -8deg; }
        12% { rotate: 5deg; }
        15% { rotate: -2deg; }
      }

      @keyframes echo-widget-attn-glow {
        0%, 100% { filter: drop-shadow(0 0 0 transparent); }
        20% { filter: drop-shadow(0 0 14px var(--echo-launcher-glow)) brightness(1.08); }
        40% { filter: drop-shadow(0 0 0 transparent); }
      }

      #echo-widget-button.echo-widget-attn--pulse::after {
        content: "";
        position: absolute;
        inset: 0;
        border-radius: inherit;
        pointer-events: none;
        animation: echo-widget-attn-pulse 2.6s cubic-bezier(0.16, 1, 0.3, 1) infinite;
      }

      #echo-widget-button.echo-widget-attn--bounce {
        animation: echo-widget-attn-bounce 5s cubic-bezier(0.3, 0, 0.3, 1) 1.2s infinite;
      }

      #echo-widget-button.echo-widget-attn--wiggle {
        animation: echo-widget-attn-wiggle 6s ease-in-out 1.2s infinite;
      }

      #echo-widget-button.echo-widget-attn--glow {
        animation: echo-widget-attn-glow 3.2s ease-in-out infinite;
      }

      /* ── unread badge ──────────────────────────────────────────────────── */

      @keyframes echo-widget-badge-in {
        0% { transform: scale(0); }
        60% { transform: scale(1.18); }
        100% { transform: scale(1); }
      }

      #echo-widget-button .echo-widget-badge {
        position: absolute;
        z-index: 2;
        display: grid;
        place-items: center;
        min-width: 18px;
        height: 18px;
        padding: 0 5px;
        box-sizing: border-box;
        border-radius: 999px;
        background: #ef4444;
        color: #fff;
        font: 700 11px/1 -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        box-shadow: 0 0 0 2px #fff, 0 4px 10px rgba(239, 68, 68, 0.45);
        pointer-events: none;
        animation: echo-widget-badge-in 420ms cubic-bezier(0.18, 1.35, 0.32, 1) both;
      }

      /* ── invitation card ───────────────────────────────────────────────── */

      #echo-widget-launcher-prompt button {
        all: unset;
        box-sizing: border-box;
        cursor: pointer;
      }

      #echo-widget-launcher-prompt {
        opacity: 0;
        transform: translate3d(0, 12px, 0) scale(0.92);
        transition:
          opacity 260ms cubic-bezier(0.16, 1, 0.3, 1),
          transform 420ms cubic-bezier(0.18, 1.25, 0.32, 1);
      }

      #echo-widget-launcher-prompt.is-visible {
        opacity: 1;
        transform: none;
      }

      #echo-widget-launcher-prompt .echo-teaser {
        position: relative;
        display: flex;
        flex-direction: column;
        gap: 10px;
        padding: 12px 14px 14px;
        border-radius: 18px;
        background: rgba(255, 255, 255, 0.97);
        color: #0f172a;
        box-shadow:
          0 0 0 1px rgba(15, 23, 42, 0.06),
          0 24px 48px -24px rgba(15, 23, 42, 0.45),
          0 8px 18px -12px rgba(15, 23, 42, 0.25);
        backdrop-filter: blur(12px);
        -webkit-backdrop-filter: blur(12px);
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        -webkit-font-smoothing: antialiased;
      }

      #echo-widget-launcher-prompt[data-side="right"] .echo-teaser {
        border-bottom-right-radius: 6px;
      }

      #echo-widget-launcher-prompt[data-side="left"] .echo-teaser {
        border-bottom-left-radius: 6px;
      }

      #echo-widget-launcher-prompt .echo-teaser__close {
        position: absolute;
        top: -9px;
        right: -9px;
        display: grid;
        place-items: center;
        width: 24px;
        height: 24px;
        border-radius: 999px;
        background: #fff;
        color: #475569;
        box-shadow: 0 0 0 1px rgba(15, 23, 42, 0.08), 0 6px 14px -6px rgba(15, 23, 42, 0.4);
        opacity: 0;
        transform: scale(0.8);
        transition: opacity 160ms ease, transform 160ms ease, color 160ms ease;
      }

      #echo-widget-launcher-prompt[data-side="left"] .echo-teaser__close {
        right: auto;
        left: -9px;
      }

      #echo-widget-launcher-prompt .echo-teaser__close svg {
        width: 12px;
        height: 12px;
      }

      #echo-widget-launcher-prompt .echo-teaser:hover .echo-teaser__close,
      #echo-widget-launcher-prompt .echo-teaser__close:focus-visible {
        opacity: 1;
        transform: scale(1);
      }

      #echo-widget-launcher-prompt .echo-teaser__close:hover {
        color: #0f172a;
      }

      /* Touch screens have no hover, so the dismiss control is always there. */
      @media (hover: none) {
        #echo-widget-launcher-prompt .echo-teaser__close {
          opacity: 1;
          transform: scale(1);
        }
      }

      #echo-widget-launcher-prompt .echo-teaser__header {
        display: flex;
        align-items: center;
        gap: 8px;
        min-width: 0;
      }

      #echo-widget-launcher-prompt .echo-teaser__avatar {
        position: relative;
        display: grid;
        place-items: center;
        flex: 0 0 26px;
        width: 26px;
        height: 26px;
        overflow: hidden;
        border-radius: 999px;
        background: var(--echo-accent);
        color: var(--echo-accent-ink);
        font-size: 12px;
        font-weight: 700;
      }

      #echo-widget-launcher-prompt .echo-teaser__avatar img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        background: #fff;
      }

      #echo-widget-launcher-prompt .echo-teaser__name {
        min-width: 0;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        font-size: 12.5px;
        font-weight: 650;
        letter-spacing: -0.01em;
      }

      @keyframes echo-teaser-online {
        0%, 100% { box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.5); }
        60% { box-shadow: 0 0 0 5px rgba(34, 197, 94, 0); }
      }

      #echo-widget-launcher-prompt .echo-teaser__status {
        flex: 0 0 7px;
        width: 7px;
        height: 7px;
        border-radius: 999px;
        background: #22c55e;
        animation: echo-teaser-online 2.4s ease-out infinite;
      }

      #echo-widget-launcher-prompt .echo-teaser__message {
        display: block;
        font-size: 14px;
        font-weight: 500;
        line-height: 1.45;
        letter-spacing: -0.006em;
        overflow-wrap: anywhere;
      }

      @keyframes echo-teaser-dot {
        0%, 60%, 100% { transform: translateY(0); opacity: 0.35; }
        30% { transform: translateY(-3px); opacity: 1; }
      }

      #echo-widget-launcher-prompt .echo-teaser__typing {
        display: none;
        gap: 4px;
        padding: 6px 0;
      }

      #echo-widget-launcher-prompt .echo-teaser__typing i {
        width: 6px;
        height: 6px;
        border-radius: 999px;
        background: #64748b;
        animation: echo-teaser-dot 1s ease-in-out infinite;
      }

      #echo-widget-launcher-prompt .echo-teaser__typing i:nth-child(2) { animation-delay: 0.14s; }
      #echo-widget-launcher-prompt .echo-teaser__typing i:nth-child(3) { animation-delay: 0.28s; }

      #echo-widget-launcher-prompt .echo-teaser.is-typing .echo-teaser__typing {
        display: inline-flex;
      }

      @keyframes echo-teaser-reveal {
        from { opacity: 0; transform: translate3d(0, 6px, 0); }
        to { opacity: 1; transform: none; }
      }

      #echo-widget-launcher-prompt .echo-teaser__text {
        display: block;
        animation: echo-teaser-reveal 320ms cubic-bezier(0.16, 1, 0.3, 1) both;
      }

      #echo-widget-launcher-prompt .echo-teaser.is-typing .echo-teaser__text,
      #echo-widget-launcher-prompt .echo-teaser.is-typing .echo-teaser__replies {
        display: none;
      }

      #echo-widget-launcher-prompt .echo-teaser__replies {
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
      }

      #echo-widget-launcher-prompt .echo-teaser__chip {
        max-width: 100%;
        padding: 7px 12px;
        border-radius: 999px;
        border: 1px solid color-mix(in srgb, var(--echo-accent) 38%, #e2e8f0);
        background: color-mix(in srgb, var(--echo-accent) 7%, #fff);
        color: #0f172a;
        font-size: 12.5px;
        font-weight: 600;
        line-height: 1.2;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        animation: echo-teaser-reveal 360ms cubic-bezier(0.16, 1, 0.3, 1) both;
        animation-delay: calc(80ms + var(--echo-chip-index, 0) * 70ms);
        transition: background-color 160ms ease, color 160ms ease, border-color 160ms ease, transform 160ms ease;
      }

      #echo-widget-launcher-prompt .echo-teaser__chip:hover,
      #echo-widget-launcher-prompt .echo-teaser__chip:focus-visible {
        background: var(--echo-accent);
        border-color: var(--echo-accent);
        color: var(--echo-accent-ink);
        transform: translateY(-1px);
      }

      #echo-widget-launcher-prompt .echo-teaser__message:focus-visible,
      #echo-widget-launcher-prompt .echo-teaser__chip:focus-visible,
      #echo-widget-launcher-prompt .echo-teaser__close:focus-visible {
        outline: 2px solid var(--echo-accent);
        outline-offset: 2px;
      }

      @media (prefers-reduced-motion: reduce) {
        #echo-widget-button.echo-widget-button--voice,
        #echo-widget-button.echo-widget-button--voice::after,
        .echo-widget-voice-orb,
        .echo-widget-voice-orb__pulse,
        .echo-widget-voice-orb__gradient,
        .echo-widget-voice-orb__core,
        .echo-widget-voice-orb__sweep,
        .echo-widget-voice-orb__ripple {
          animation-duration: 0.01ms !important;
          animation-iteration-count: 1 !important;
        }
      }

      @media (prefers-reduced-motion: reduce) {
        #echo-widget-button[class*="echo-widget-attn--"],
        #echo-widget-button[class*="echo-widget-attn--"]::after,
        #echo-widget-launcher-prompt,
        #echo-widget-launcher-prompt * {
          animation: none !important;
          transition: none !important;
        }
      }
    `,document.head.appendChild(e)},J=()=>{if(!g)return;if(g.style.transition=`all 0.2s ease`,_){g.classList.remove(`echo-widget-button--voice`),C||(g.style.width=`${R}px`,g.style.minWidth=`${R}px`,g.style.height=`${R}px`,g.style.padding=`0`,g.style.borderRadius=`50%`,g.style.justifyContent=`center`,g.style.background=j.launcherColor,g.style.color=Xe(j.launcherColor),g.style.boxShadow=`0 18px 40px ${Ze(j.launcherColor)}`,g.style.animation=`none`,g.setAttribute(`aria-label`,`Close chat widget`),g.innerHTML=i),ht(),q(),Y();return}let e=C,t=e&&!_,n=t?j.voiceLauncherLabel.trim()||ke:j.launcherLabel.trim(),r=!t&&!_&&j.launcherIconUrl.trim().length>0,a=!_&&(t||!r&&n.length>0),o=r?gt(j.launcherIconUrl):t?_t():qe(j.launcherIcon);g.classList.toggle(`echo-widget-button--voice`,t),g.style.width=a?`auto`:`${R}px`,g.style.minWidth=`${R}px`,g.style.height=`${R}px`,g.style.padding=t?`0 22px 0 7px`:a?`0 ${ae}px 0 8px`:`0`,g.style.borderRadius=a?`9999px`:`50%`,g.style.justifyContent=a?`flex-start`:`center`,g.style.background=e?`rgba(255, 255, 255, 0.94)`:j.launcherColor,g.style.color=e?`#0f172a`:Xe(j.launcherColor),g.style.boxShadow=e?`0 16px 36px rgba(15, 23, 42, 0.16), 0 0 0 1px rgba(15, 23, 42, 0.08)`:`0 4px 24px ${Ze(j.launcherColor)}`,g.style.animation=t?`echo-widget-voice-launcher-glow 2.8s ease-in-out infinite`:``,g.setAttribute(`aria-label`,_?e?`Close voice widget`:`Close chat widget`:a?n:`Open chat widget`),a?g.innerHTML=`${o}<span class="echo-widget-voice-label">${Qe(n)}</span>`:g.innerHTML=o,ht(),q(),Y()},yt=()=>{g&&(J(),g.style.transition=`none`,g.style.visibility=`visible`,g.style.display=`flex`,g.style.opacity=`0`,g.style.pointerEvents=`none`,g.style.transform=`translate3d(${ne}px, 0, 0) scale(0.94)`,window.requestAnimationFrame(()=>{g&&(g.style.transition=`opacity ${re}ms cubic-bezier(0.16, 1, 0.3, 1), transform ${re}ms cubic-bezier(0.16, 1, 0.3, 1)`,g.style.opacity=`1`,g.style.pointerEvents=`auto`,g.style.transform=`scale(1)`)}))},bt=e=>{if(typeof e.launcherColor==`string`){let t=K(e.launcherColor.trim());t&&(j.launcherColor=t)}typeof e.launcherLabel==`string`&&(j.launcherLabel=e.launcherLabel),typeof e.voiceLauncherLabel==`string`&&(j.voiceLauncherLabel=e.voiceLauncherLabel),typeof e.launcherIcon==`string`&&(j.launcherIcon=Je(e.launcherIcon)),typeof e.launcherIconUrl==`string`&&(j.launcherIconUrl=Ye(e.launcherIconUrl)),typeof e.animation==`string`&&(j.animation=G(e.animation),Q(_?`open`:`closed`)),typeof e.launcherPromptEnabled==`boolean`&&(j.launcherPromptEnabled=e.launcherPromptEnabled),typeof e.launcherPromptText==`string`&&(j.launcherPromptText=e.launcherPromptText),typeof e.launcherPromptDelaySeconds==`number`&&(j.launcherPromptDelaySeconds=$e(e.launcherPromptDelaySeconds)),e.launcherQuickReplies!==void 0&&(j.launcherQuickReplies=nt(e.launcherQuickReplies)),e.launcherAttention!==void 0&&(j.launcherAttention=tt(e.launcherAttention)),typeof e.launcherBadgeEnabled==`boolean`&&(j.launcherBadgeEnabled=e.launcherBadgeEnabled),(e.launcherPosition===`bottom-right`||e.launcherPosition===`bottom-left`)&&(F=e.launcherPosition),typeof e.launcherOffsetX==`number`&&(I=W(e.launcherOffsetX,0,u)),typeof e.launcherOffsetY==`number`&&(L=W(e.launcherOffsetY,0,u)),typeof e.launcherSize==`number`&&(R=W(e.launcherSize,c,l)),typeof e.widgetWidth==`number`&&(z=W(e.widgetWidth,ge.min,ge.max)),typeof e.widgetHeight==`number`&&(B=W(e.widgetHeight,_e.min,_e.max)),typeof e.notificationSoundEnabled==`boolean`&&(Ie=e.notificationSoundEnabled),typeof e.autoOpenEnabled==`boolean`&&(Pe=e.autoOpenEnabled),typeof e.autoOpenDelaySeconds==`number`&&(Fe=W(e.autoOpenDelaySeconds,0,d)),(e.autoOpenFrequency===`session`||e.autoOpenFrequency===`visitor`||e.autoOpenFrequency===`always`)&&(V=e.autoOpenFrequency),Be(),xt(),Ke()},xt=()=>{!g||S||(S=!0,Y(),pt())},Y=()=>{if(!g||!S)return;let e=!_||!C;g.style.visibility=e?`visible`:`hidden`,g.style.display=e?`flex`:`none`,g.style.opacity=e?`1`:`0`,g.style.pointerEvents=e?`auto`:`none`,g.style.transform=`scale(1)`,pt()},X=document.currentScript;if(X)N=X.getAttribute(`data-organization-id`),P=X.getAttribute(`data-agent-id`),F=X.getAttribute(`data-position`)||e.DEFAULT_POSITION,j.animation=G(X.getAttribute(`data-animation`));else{let t=document.querySelectorAll(`script[src*="embed"]`),n=Array.from(t).find(e=>e.hasAttribute(`data-organization-id`));n&&(N=n.getAttribute(`data-organization-id`),P=n.getAttribute(`data-agent-id`),F=n.getAttribute(`data-position`)||e.DEFAULT_POSITION,j.animation=G(n.getAttribute(`data-animation`)))}if(!N){console.error(`Echo Widget: data-organization-id attribute is required`);return}function St(){document.readyState===`loading`?document.addEventListener(`DOMContentLoaded`,Ct):Ct()}function Ct(){vt(),g=document.createElement(`button`),g.id=`echo-widget-button`,g.style.cssText=`
      position: fixed;
      ${F===`bottom-right`?`right: ${I}px;`:`left: ${I}px;`}
      bottom: ${L}px;
      width: auto;
      min-width: ${R}px;
      height: ${R}px;
      border-radius: 9999px;
      color: white;
      border: none;
      cursor: pointer;
      z-index: 999999;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      font-size: 15px;
      font-weight: 600;
      line-height: 1;
      transition: all 0.2s ease;
      visibility: hidden;
      opacity: 0;
      pointer-events: none;
    `,J(),g.addEventListener(`click`,jt),g.addEventListener(`mouseenter`,()=>{g&&(g.style.transform=`scale(1.05)`)}),g.addEventListener(`mouseleave`,()=>{g&&(g.style.transform=`scale(1)`)}),document.body.appendChild(g),b=document.createElement(`div`),b.id=`echo-widget-launcher-prompt`,b.setAttribute(`role`,`status`),x=it(),ot(),document.body.appendChild(b),m=document.createElement(`div`),m.id=`echo-widget-container`,m.style.cssText=`
      position: fixed;
      ${F===`bottom-right`?`right: ${I}px;`:`left: ${I}px;`}
      bottom: ${L}px;
      width: ${z}px;
      height: ${B}px;
      max-width: calc(100vw - 40px);
      max-height: calc(100vh - ${Le()}px);
      z-index: 999998;
      border-radius: ${Ee};
      overflow: hidden;
      isolation: isolate;
      background: transparent;
      box-shadow: 0 4px 24px rgba(0, 0, 0, 0.15);
      display: none;
      opacity: 0;
      filter: ${Te};
      transform: ${M[j.animation].closedTransform};
      transform-origin: ${F===`bottom-right`?`bottom right`:`bottom left`};
      transition:
        opacity ${M[j.animation].duration}ms ${M[j.animation].easing},
        transform ${M[j.animation].duration}ms ${M[j.animation].easing},
        filter ${M[j.animation].duration}ms ${M[j.animation].easing},
        border-radius ${M[j.animation].duration}ms ${M[j.animation].easing};
      will-change: opacity, transform, filter, border-radius;
    `,h=document.createElement(`div`),h.setAttribute(`aria-hidden`,`true`),h.style.cssText=`
      position: absolute;
      inset: 0;
      z-index: 1;
      pointer-events: none;
      opacity: 0;
      background:
        linear-gradient(180deg, rgba(255,255,255,0.86) 0%, rgba(255,255,255,0) 22%),
        linear-gradient(0deg, rgba(255,255,255,0.84) 0%, rgba(255,255,255,0) 24%);
      backdrop-filter: blur(10px);
      -webkit-backdrop-filter: blur(10px);
      mask-image: linear-gradient(180deg, black 0%, transparent 26%, transparent 74%, black 100%);
      -webkit-mask-image: linear-gradient(180deg, black 0%, transparent 26%, transparent 74%, black 100%);
      transform: translate3d(0, 8px, 0);
      transition: none;
      will-change: opacity, transform;
    `,p=document.createElement(`iframe`),p.src=kt(),p.style.cssText=`
      position: relative;
      z-index: 2;
      width: 100%;
      height: 100%;
      border: none;
      opacity: 1;
      transform: translate3d(0, 0, 0);
      transform-origin: center;
      will-change: opacity, transform;
    `,p.allow=`microphone; clipboard-read; clipboard-write; autoplay`,m.appendChild(h),m.appendChild(p),document.body.appendChild(m),window.addEventListener(`message`,At),wt()}function wt(){if(je)return;je=!0;let e=()=>{Et(),T&&(window.removeEventListener(`pointerdown`,e),window.removeEventListener(`touchstart`,e),window.removeEventListener(`keydown`,e))};window.addEventListener(`pointerdown`,e,{passive:!0}),window.addEventListener(`touchstart`,e,{passive:!0}),window.addEventListener(`keydown`,e)}function Tt(){return w||(w=new Audio(`${e.WIDGET_URL}${Ae}`),w.preload=`auto`),w}function Et(){if(!T)try{let e=Tt();e.muted=!0,e.currentTime=0;let t=e.play();if(!(t instanceof Promise))return;t.then(()=>{e.pause(),e.currentTime=0,e.muted=!1,T=!0,Ot()}).catch(()=>{e.muted=!1})}catch{}}function Dt(){try{let e=Tt();e.muted=!1,e.currentTime=0,e.play().catch(()=>{})}catch{}}function Ot(){p?.contentWindow&&p.contentWindow.postMessage({type:`host-audio-ready`},new URL(e.WIDGET_URL).origin)}function kt(){let t=new URLSearchParams;t.append(`organizationId`,N);let n=P?.trim();return n&&t.append(`agentId`,n),`${e.WIDGET_URL}?${t.toString()}`}function At(t){if(t.origin!==new URL(e.WIDGET_URL).origin)return;let{type:n,payload:r}=t.data;switch(n){case`widget-ready`:mt(),T&&Ot();break;case`notification-sound`:Ie&&Dt();break;case`close`:zt();break;case`unread-count`:{let e=Number(r?.count);D=Number.isFinite(e)&&e>0?Math.floor(e):0,q();break}case`widget-settings`:if(r){let e=r;e.teaser&&(typeof e.teaser.name==`string`&&(Me=e.teaser.name.slice(0,60)),typeof e.teaser.avatarUrl==`string`&&(Ne=e.teaser.avatarUrl)),typeof e.liveVoiceEnabled==`boolean`&&(C=e.liveVoiceEnabled,Q(_?`open`:`closed`)),e.appearance?bt(e.appearance):J()}break}}function jt(){Ge(),_?zt():$()}function Z(){return window.matchMedia?.(Oe).matches??!1}function Mt(e){return Z()?0:C?e===`open`?xe:Se:M[j.animation].duration}function Nt(e){return C?e===`open`?Ce:f:M[j.animation].easing}function Pt(e){if(C)return e===`open`?be:ye;let t=M[j.animation];return e===`open`?t.openTransform:t.closedTransform}function Ft(){!m||!g||(m.style.transformOrigin=F===`bottom-right`?`bottom right`:`bottom left`)}function It(){if(!m)return;let e=_&&!C;m.style.width=`${z}px`,m.style.bottom=`${e?Re():L}px`,m.style.maxHeight=`calc(100vh - ${e?ze():Le()}px)`,m.style.height=`${C?ve:B}px`}function Lt(e,t=!1){if(!p)return;if(!C||t||Z()){p.style.opacity=`1`,p.style.transition=`none`,p.style.transform=`translate3d(0, 0, 0)`,p.style.filter=`blur(0px)`,C&&e===`closed`&&(p.style.opacity=`0`,p.style.transform=`translate3d(0, 10px, 0)`,p.style.filter=`blur(8px)`);return}let n=e===`open`?260:120,r=e===`open`?72:0,i=e===`open`?Ce:f;p.style.transition=`opacity ${n}ms ${i} ${r}ms, transform ${n}ms ${i} ${r}ms, filter ${n}ms ${i} ${r}ms`,p.style.opacity=e===`open`?`1`:`0`,p.style.transform=e===`open`?`translate3d(0, 0, 0)`:`translate3d(0, 10px, 0)`,p.style.filter=e===`open`?`blur(0px)`:`blur(8px)`}function Rt(e,t=!1){if(!h)return;if(!C||t||Z()){h.style.opacity=`0`,h.style.transition=`none`,h.style.transform=`translate3d(0, 8px, 0)`;return}let n=e===`open`?220:120,r=e===`open`?42:0,i=e===`open`?Ce:f;h.style.transition=`opacity ${n}ms ${i} ${r}ms, transform ${n}ms ${i} ${r}ms`,h.style.opacity=e===`open`?`0`:`1`,h.style.transform=e===`open`?`translate3d(0, -4px, 0)`:`translate3d(0, 8px, 0)`}function Q(e,t={}){if(!m)return;let n=Mt(e),r=Nt(e),i=t.immediate||n===0,a=Pt(e),o=C&&e===`open`?`0 24px 70px rgba(15, 23, 42, 0.18), 0 0 0 1px rgba(15, 23, 42, 0.06)`:`0 4px 24px rgba(0, 0, 0, 0.15)`,s=C&&e===`closed`?we:Te;It(),m.style.transition=i?`none`:`opacity ${n}ms ${r}, transform ${n}ms ${r}, filter ${n}ms ${r}, border-radius ${n}ms ${r}, box-shadow ${n}ms ${r}`,m.style.opacity=C||e===`open`?`1`:`0`,m.style.background=`transparent`,m.style.transform=a,m.style.filter=s,m.style.borderRadius=Ee,m.style.boxShadow=o,Rt(e,i),Lt(e,i)}function $(){m&&g&&(v!==null&&(window.clearTimeout(v),v=null),x||(x=!0,at()),A=!0,ut(),m.style.display=`block`,Ft(),_=!0,mt(),Q(`closed`,{immediate:!0}),Y(),window.requestAnimationFrame(()=>{window.requestAnimationFrame(()=>Q(`open`))}),J())}function zt(){if(m&&g){v!==null&&(window.clearTimeout(v),v=null);let e=!C;_=!1,mt();let t=C;t||yt(),Ft(),C&&g&&(g.style.visibility=`hidden`,g.style.opacity=`0`,g.style.pointerEvents=`none`),Q(`closed`),v=window.setTimeout(()=>{m&&!_&&(m.style.display=`none`),t?Y():e&&g&&(g.style.pointerEvents=`auto`),v=null},Mt(`closed`))}}function Bt(){window.removeEventListener(`message`,At),m&&(m.remove(),m=null,p=null,h=null),b&&=(b.remove(),null),g&&=(g.remove(),null),E=null,D=0,O=!1,A=!1,v!==null&&(window.clearTimeout(v),v=null),et(),Ge(),U=!1,_=!1,S=!1,C=!1,x=!1}function Vt(e){Bt(),e.organizationId&&(N=e.organizationId),e.agentId!==void 0&&(P=e.agentId),e.position&&(F=e.position),e.animation&&(j.animation=G(e.animation)),St()}window.EchoWidget={init:Vt,show:$,hide:zt,destroy:Bt,setAppearance:bt},St()})()})();