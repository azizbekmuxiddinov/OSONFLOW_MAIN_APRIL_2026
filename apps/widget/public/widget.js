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
</svg>`,o=20,s=48,c=40,l=76,u=160,d=300,ee=`echo-widget-auto-opened`,te=8,ne=18,re=180,ie=34,ae=18,oe=8,se=4,ce=296,le=900,ue=`echo-widget-teaser-dismissed`,de=3,fe=40,pe=[`none`,`pulse`,`bounce`,`wiggle`,`glow`],me=380,he=640,ge={min:340,max:560},_e={min:520,max:880},ve=470,ye=`translate3d(0, 26px, 0) scale(0.975)`,be=`translate3d(0, 0, 0) scale(1)`,xe=360,Se=220,f=`cubic-bezier(0.16, 1, 0.3, 1)`,p=`cubic-bezier(0.4, 0, 1, 1)`,Ce=`blur(10px)`,we=`blur(0px)`,Te=`30px`,Ee=`echo-widget-launcher-styles`,De=`(prefers-reduced-motion: reduce)`,Oe=`Talk with us`,ke=`/sounds/notification.mp3`;(function(){let m=null,h=null,g=null,_=null,v=!1,y=null,b=null,x=null,S=!1,C=!1,w=!1,T=null,E=!1,Ae=!1,D=null,O=!1,k=null,A=!1,j=``,je=``,M={launcherColor:`#6366f1`,launcherLabel:`Chat with us`,voiceLauncherLabel:Oe,launcherIcon:`chat`,launcherIconUrl:``,launcherPromptEnabled:!1,launcherPromptText:`Need help? Talk with us`,launcherPromptDelaySeconds:5,launcherQuickReplies:[],launcherAttention:`none`,launcherBadgeEnabled:!1,animation:`slide-up`},N={"slide-up":{closedTransform:`translate3d(0, 18px, 0) scale(0.98)`,openTransform:`translate3d(0, 0, 0) scale(1)`,duration:260,easing:`cubic-bezier(0.16, 1, 0.3, 1)`},scale:{closedTransform:`translate3d(0, 8px, 0) scale(0.92)`,openTransform:`translate3d(0, 0, 0) scale(1)`,duration:240,easing:`cubic-bezier(0.2, 0.8, 0.2, 1)`},fade:{closedTransform:`translate3d(0, 0, 0) scale(1)`,openTransform:`translate3d(0, 0, 0) scale(1)`,duration:200,easing:`ease`},pop:{closedTransform:`translate3d(0, 20px, 0) scale(0.86)`,openTransform:`translate3d(0, 0, 0) scale(1)`,duration:320,easing:`cubic-bezier(0.18, 1.35, 0.32, 1)`}},P=null,F=null,I=e.DEFAULT_POSITION,L=o,R=o,z=s,B=me,V=he,Me=!1,Ne=0,H=`session`,U=null,Pe=!1,Fe=!0,W=(e,t,n)=>Math.round(Math.max(t,Math.min(n,e))),Ie=()=>R*2,Le=()=>R+z+te,Re=()=>R+Le(),ze=()=>{let e=I===`bottom-right`?`right`:`left`,t=I===`bottom-right`?`left`:`right`;_&&(_.style[e]=`${L}px`,_.style[t]=``,_.style.bottom=`${R}px`),h&&(h.style[e]=`${L}px`,h.style[t]=``,h.style.transformOrigin=I===`bottom-right`?`bottom right`:`bottom left`),x&&(x.style[e]=`${L}px`,x.style[t]=``,x.style.bottom=`${R+z+oe}px`,x.style.textAlign=I===`bottom-right`?`right`:`left`),Ft(),q()},Be=()=>{if(H===`always`)return null;try{return H===`visitor`?window.localStorage:window.sessionStorage}catch{return null}},Ve=()=>`${ee}:${P??`default`}`,He=()=>{let e=Be();if(!e)return!1;try{return e.getItem(Ve())===`1`}catch{return!1}},Ue=()=>{let e=Be();if(e)try{e.setItem(Ve(),`1`)}catch{}},We=()=>{U!==null&&(window.clearTimeout(U),U=null)},Ge=()=>{!Me||Pe||v||He()||(Pe=!0,U=window.setTimeout(()=>{U=null,!v&&(Ue(),Q())},Ne*1e3))},Ke=e=>{switch(e){case`sparkles`:return n;case`question`:return r;default:return t}},qe=e=>e===`sparkles`||e===`question`||e===`chat`?e:`chat`,G=e=>e===`slide-up`||e===`scale`||e===`fade`||e===`pop`?e:`slide-up`,Je=e=>{if(!/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(e))return null;if(e.length===4){let[t,n,r,i]=e;return`${t}${n}${n}${r}${r}${i}${i}`}return e},Ye=e=>{let t=e.trim();if(!t||/[()"'\\\s;<>]/.test(t))return``;if(/^data:image\/(?:png|jpeg|jpg|gif|webp);base64,[A-Za-z0-9+/=]+$/.test(t))return t;try{let e=new URL(t,window.location.href).protocol;return e===`http:`||e===`https:`?t:``}catch{return``}},Xe=e=>{let t=Je(e);if(!t)return`#ffffff`;let n=parseInt(t.slice(1,3),16),r=parseInt(t.slice(3,5),16),i=parseInt(t.slice(5,7),16);return(.299*n+.587*r+.114*i)/255>.6?`#111111`:`#ffffff`},Ze=e=>{let t=Je(e);return t?`rgba(${parseInt(t.slice(1,3),16)}, ${parseInt(t.slice(3,5),16)}, ${parseInt(t.slice(5,7),16)}, 0.35)`:`rgba(99, 102, 241, 0.35)`},Qe=e=>e.replace(/&/g,`&amp;`).replace(/</g,`&lt;`).replace(/>/g,`&gt;`).replace(/"/g,`&quot;`).replace(/'/g,`&#039;`),$e=e=>Number.isNaN(e)?5:Math.max(0,Math.min(120,e)),et=()=>{b!==null&&(window.clearTimeout(b),b=null),k!==null&&(window.clearTimeout(k),k=null)},tt=e=>pe.includes(e)?e:`none`,nt=e=>{if(!Array.isArray(e))return[];let t=e.filter(e=>typeof e==`string`).map(e=>e.trim().slice(0,fe)).filter(Boolean);return[...new Set(t)].slice(0,de)},rt=()=>`${ue}:${P??`default`}`,it=()=>{try{return window.sessionStorage.getItem(rt())===`1`}catch{return!1}},at=()=>{try{window.sessionStorage.setItem(rt(),`1`)}catch{}},ot=()=>{x&&(x.style.cssText=`
      position: fixed;
      ${I===`bottom-right`?`right: ${L}px;`:`left: ${L}px;`}
      bottom: ${R+z+oe+se}px;
      width: min(${ce}px, calc(100vw - ${L*2}px));
      z-index: 999999;
      --echo-accent: ${M.launcherColor};
      --echo-accent-ink: ${Xe(M.launcherColor)};
      transform-origin: ${I===`bottom-right`?`bottom right`:`bottom left`};
      display: ${O?`block`:`none`};
    `,x.dataset.side=I===`bottom-right`?`right`:`left`)},st=()=>{S=!0,at(),ut()},ct=t=>{Q(),m?.contentWindow?.postMessage({type:`start-chat`,payload:{message:t}},new URL(e.WIDGET_URL).origin)},lt=e=>{if(!x)return;let t=document.createElement(`div`);t.className=`echo-teaser`,e&&t.classList.add(`is-typing`);let n=document.createElement(`button`);n.type=`button`,n.className=`echo-teaser__close`,n.setAttribute(`aria-label`,`Dismiss`),n.innerHTML=a,n.addEventListener(`click`,e=>{e.stopPropagation(),st()});let r=document.createElement(`div`);r.className=`echo-teaser__header`;let i=document.createElement(`span`);i.className=`echo-teaser__avatar`;let o=Ye(je);if(o){let e=document.createElement(`img`);e.src=o,e.alt=``,i.appendChild(e)}else i.textContent=(j.trim()[0]??``).toUpperCase();let s=document.createElement(`span`);s.className=`echo-teaser__name`,s.textContent=j.trim();let c=document.createElement(`span`);c.className=`echo-teaser__status`,c.setAttribute(`aria-hidden`,`true`),r.append(i,s,c);let l=document.createElement(`button`);l.type=`button`,l.className=`echo-teaser__message`,l.addEventListener(`click`,()=>Q());let u=document.createElement(`span`);u.className=`echo-teaser__typing`,u.setAttribute(`aria-hidden`,`true`),u.append(document.createElement(`i`),document.createElement(`i`),document.createElement(`i`));let d=document.createElement(`span`);if(d.className=`echo-teaser__text`,d.textContent=M.launcherPromptText.trim(),l.append(u,d),t.append(n,r,l),M.launcherQuickReplies.length>0){let e=document.createElement(`div`);e.className=`echo-teaser__replies`,M.launcherQuickReplies.forEach((t,n)=>{let r=document.createElement(`button`);r.type=`button`,r.className=`echo-teaser__chip`,r.style.setProperty(`--echo-chip-index`,String(n)),r.textContent=t,r.addEventListener(`click`,()=>ct(t)),e.appendChild(r)}),t.appendChild(e)}x.replaceChildren(t)},ut=()=>{et(),O=!1,K(),x&&(x.classList.remove(`is-visible`),x.style.display=`none`)},dt=()=>{if(!x||!M.launcherPromptText.trim())return;let e=!X();O=!0,lt(e),ot(),K(),window.requestAnimationFrame(()=>{x?.classList.add(`is-visible`)}),e&&(k=window.setTimeout(()=>{k=null,x?.querySelector(`.echo-teaser`)?.classList.remove(`is-typing`)},le))},ft=()=>{let e=!v||!w;return M.launcherPromptEnabled&&!S&&!v&&!w&&C&&!!_&&e},pt=()=>{if(!ft()){ut();return}if(O){lt(!1),ot();return}if(b!==null)return;let e=$e(M.launcherPromptDelaySeconds)*1e3;b=window.setTimeout(()=>{b=null,ft()&&dt()},e)};function K(){if(_){if(!(M.launcherBadgeEnabled&&O&&!v&&!w)){D?.remove();return}D||(D=document.createElement(`span`),D.className=`echo-widget-badge`,D.setAttribute(`aria-hidden`,`true`),D.textContent=`1`),D.parentElement!==_&&_.appendChild(D)}}function mt(){if(!_)return;for(let e of pe)_.classList.remove(`echo-widget-attn--${e}`);let e=M.launcherAttention;e===`none`||v||w||A||(_.style.setProperty(`--echo-launcher-glow`,Ze(M.launcherColor)),_.classList.add(`echo-widget-attn--${e}`))}let ht=e=>`<img src="${Qe(e)}" alt="Launcher" style="width: ${z}px; height: ${z}px; border-radius: 50%; object-fit: cover; display: block;" />`,gt=()=>`
      <span class="echo-widget-voice-orb" aria-hidden="true">
        <span class="echo-widget-voice-orb__pulse"></span>
        <span class="echo-widget-voice-orb__gradient"></span>
        <span class="echo-widget-voice-orb__shine"></span>
        <span class="echo-widget-voice-orb__sweep"></span>
        <span class="echo-widget-voice-orb__core"></span>
        <span class="echo-widget-voice-orb__ripple"></span>
      </span>
    `,_t=()=>{if(document.getElementById(Ee))return;let e=document.createElement(`style`);e.id=Ee,e.textContent=`
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
        top: -3px;
        right: -3px;
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
    `,document.head.appendChild(e)},q=()=>{if(!_)return;if(_.style.transition=`all 0.2s ease`,v){_.classList.remove(`echo-widget-button--voice`),w||(_.style.width=`${z}px`,_.style.minWidth=`${z}px`,_.style.height=`${z}px`,_.style.padding=`0`,_.style.borderRadius=`50%`,_.style.justifyContent=`center`,_.style.background=M.launcherColor,_.style.color=Xe(M.launcherColor),_.style.boxShadow=`0 18px 40px ${Ze(M.launcherColor)}`,_.style.animation=`none`,_.setAttribute(`aria-label`,`Close chat widget`),_.innerHTML=i),mt(),K(),J();return}let e=w,t=e&&!v,n=t?M.voiceLauncherLabel.trim()||Oe:M.launcherLabel.trim(),r=!t&&!v&&M.launcherIconUrl.trim().length>0,a=!v&&(t||!r&&n.length>0),o=r?ht(M.launcherIconUrl):t?gt():Ke(M.launcherIcon);_.classList.toggle(`echo-widget-button--voice`,t),_.style.width=a?`auto`:`${z}px`,_.style.minWidth=`${z}px`,_.style.height=`${z}px`,_.style.padding=t?`0 22px 0 7px`:a?`0 ${ae}px 0 8px`:`0`,_.style.borderRadius=a?`9999px`:`50%`,_.style.justifyContent=a?`flex-start`:`center`,_.style.background=e?`rgba(255, 255, 255, 0.94)`:M.launcherColor,_.style.color=e?`#0f172a`:Xe(M.launcherColor),_.style.boxShadow=e?`0 16px 36px rgba(15, 23, 42, 0.16), 0 0 0 1px rgba(15, 23, 42, 0.08)`:`0 4px 24px ${Ze(M.launcherColor)}`,_.style.animation=t?`echo-widget-voice-launcher-glow 2.8s ease-in-out infinite`:``,_.setAttribute(`aria-label`,v?e?`Close voice widget`:`Close chat widget`:a?n:`Open chat widget`),a?_.innerHTML=`${o}<span class="echo-widget-voice-label">${Qe(n)}</span>`:_.innerHTML=o,mt(),K(),J()},vt=()=>{_&&(q(),_.style.transition=`none`,_.style.visibility=`visible`,_.style.display=`flex`,_.style.opacity=`0`,_.style.pointerEvents=`none`,_.style.transform=`translate3d(${ne}px, 0, 0) scale(0.94)`,window.requestAnimationFrame(()=>{_&&(_.style.transition=`opacity ${re}ms cubic-bezier(0.16, 1, 0.3, 1), transform ${re}ms cubic-bezier(0.16, 1, 0.3, 1)`,_.style.opacity=`1`,_.style.pointerEvents=`auto`,_.style.transform=`scale(1)`)}))},yt=e=>{if(typeof e.launcherColor==`string`){let t=Je(e.launcherColor.trim());t&&(M.launcherColor=t)}typeof e.launcherLabel==`string`&&(M.launcherLabel=e.launcherLabel),typeof e.voiceLauncherLabel==`string`&&(M.voiceLauncherLabel=e.voiceLauncherLabel),typeof e.launcherIcon==`string`&&(M.launcherIcon=qe(e.launcherIcon)),typeof e.launcherIconUrl==`string`&&(M.launcherIconUrl=Ye(e.launcherIconUrl)),typeof e.animation==`string`&&(M.animation=G(e.animation),Z(v?`open`:`closed`)),typeof e.launcherPromptEnabled==`boolean`&&(M.launcherPromptEnabled=e.launcherPromptEnabled),typeof e.launcherPromptText==`string`&&(M.launcherPromptText=e.launcherPromptText),typeof e.launcherPromptDelaySeconds==`number`&&(M.launcherPromptDelaySeconds=$e(e.launcherPromptDelaySeconds)),e.launcherQuickReplies!==void 0&&(M.launcherQuickReplies=nt(e.launcherQuickReplies)),e.launcherAttention!==void 0&&(M.launcherAttention=tt(e.launcherAttention)),typeof e.launcherBadgeEnabled==`boolean`&&(M.launcherBadgeEnabled=e.launcherBadgeEnabled),(e.launcherPosition===`bottom-right`||e.launcherPosition===`bottom-left`)&&(I=e.launcherPosition),typeof e.launcherOffsetX==`number`&&(L=W(e.launcherOffsetX,0,u)),typeof e.launcherOffsetY==`number`&&(R=W(e.launcherOffsetY,0,u)),typeof e.launcherSize==`number`&&(z=W(e.launcherSize,c,l)),typeof e.widgetWidth==`number`&&(B=W(e.widgetWidth,ge.min,ge.max)),typeof e.widgetHeight==`number`&&(V=W(e.widgetHeight,_e.min,_e.max)),typeof e.notificationSoundEnabled==`boolean`&&(Fe=e.notificationSoundEnabled),typeof e.autoOpenEnabled==`boolean`&&(Me=e.autoOpenEnabled),typeof e.autoOpenDelaySeconds==`number`&&(Ne=W(e.autoOpenDelaySeconds,0,d)),(e.autoOpenFrequency===`session`||e.autoOpenFrequency===`visitor`||e.autoOpenFrequency===`always`)&&(H=e.autoOpenFrequency),ze(),bt(),Ge()},bt=()=>{!_||C||(C=!0,J(),pt())},J=()=>{if(!_||!C)return;let e=!v||!w;_.style.visibility=e?`visible`:`hidden`,_.style.display=e?`flex`:`none`,_.style.opacity=e?`1`:`0`,_.style.pointerEvents=e?`auto`:`none`,_.style.transform=`scale(1)`,pt()},Y=document.currentScript;if(Y)P=Y.getAttribute(`data-organization-id`),F=Y.getAttribute(`data-agent-id`),I=Y.getAttribute(`data-position`)||e.DEFAULT_POSITION,M.animation=G(Y.getAttribute(`data-animation`));else{let t=document.querySelectorAll(`script[src*="embed"]`),n=Array.from(t).find(e=>e.hasAttribute(`data-organization-id`));n&&(P=n.getAttribute(`data-organization-id`),F=n.getAttribute(`data-agent-id`),I=n.getAttribute(`data-position`)||e.DEFAULT_POSITION,M.animation=G(n.getAttribute(`data-animation`)))}if(!P){console.error(`Echo Widget: data-organization-id attribute is required`);return}function xt(){document.readyState===`loading`?document.addEventListener(`DOMContentLoaded`,St):St()}function St(){_t(),_=document.createElement(`button`),_.id=`echo-widget-button`,_.style.cssText=`
      position: fixed;
      ${I===`bottom-right`?`right: ${L}px;`:`left: ${L}px;`}
      bottom: ${R}px;
      width: auto;
      min-width: ${z}px;
      height: ${z}px;
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
    `,q(),_.addEventListener(`click`,At),_.addEventListener(`mouseenter`,()=>{_&&(_.style.transform=`scale(1.05)`)}),_.addEventListener(`mouseleave`,()=>{_&&(_.style.transform=`scale(1)`)}),document.body.appendChild(_),x=document.createElement(`div`),x.id=`echo-widget-launcher-prompt`,x.setAttribute(`role`,`status`),S=it(),ot(),document.body.appendChild(x),h=document.createElement(`div`),h.id=`echo-widget-container`,h.style.cssText=`
      position: fixed;
      ${I===`bottom-right`?`right: ${L}px;`:`left: ${L}px;`}
      bottom: ${R}px;
      width: ${B}px;
      height: ${V}px;
      max-width: calc(100vw - 40px);
      max-height: calc(100vh - ${Ie()}px);
      z-index: 999998;
      border-radius: ${Te};
      overflow: hidden;
      isolation: isolate;
      background: transparent;
      box-shadow: 0 4px 24px rgba(0, 0, 0, 0.15);
      display: none;
      opacity: 0;
      filter: ${we};
      transform: ${N[M.animation].closedTransform};
      transform-origin: ${I===`bottom-right`?`bottom right`:`bottom left`};
      transition:
        opacity ${N[M.animation].duration}ms ${N[M.animation].easing},
        transform ${N[M.animation].duration}ms ${N[M.animation].easing},
        filter ${N[M.animation].duration}ms ${N[M.animation].easing},
        border-radius ${N[M.animation].duration}ms ${N[M.animation].easing};
      will-change: opacity, transform, filter, border-radius;
    `,g=document.createElement(`div`),g.setAttribute(`aria-hidden`,`true`),g.style.cssText=`
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
    `,m=document.createElement(`iframe`),m.src=Ot(),m.style.cssText=`
      position: relative;
      z-index: 2;
      width: 100%;
      height: 100%;
      border: none;
      opacity: 1;
      transform: translate3d(0, 0, 0);
      transform-origin: center;
      will-change: opacity, transform;
    `,m.allow=`microphone; clipboard-read; clipboard-write; autoplay`,h.appendChild(g),h.appendChild(m),document.body.appendChild(h),window.addEventListener(`message`,kt),Ct()}function Ct(){if(Ae)return;Ae=!0;let e=()=>{Tt(),E&&(window.removeEventListener(`pointerdown`,e),window.removeEventListener(`touchstart`,e),window.removeEventListener(`keydown`,e))};window.addEventListener(`pointerdown`,e,{passive:!0}),window.addEventListener(`touchstart`,e,{passive:!0}),window.addEventListener(`keydown`,e)}function wt(){return T||(T=new Audio(`${e.WIDGET_URL}${ke}`),T.preload=`auto`),T}function Tt(){if(!E)try{let e=wt();e.muted=!0,e.currentTime=0;let t=e.play();if(!(t instanceof Promise))return;t.then(()=>{e.pause(),e.currentTime=0,e.muted=!1,E=!0,Dt()}).catch(()=>{e.muted=!1})}catch{}}function Et(){try{let e=wt();e.muted=!1,e.currentTime=0,e.play().catch(()=>{})}catch{}}function Dt(){m?.contentWindow&&m.contentWindow.postMessage({type:`host-audio-ready`},new URL(e.WIDGET_URL).origin)}function Ot(){let t=new URLSearchParams;t.append(`organizationId`,P);let n=F?.trim();return n&&t.append(`agentId`,n),`${e.WIDGET_URL}?${t.toString()}`}function kt(t){if(t.origin!==new URL(e.WIDGET_URL).origin)return;let{type:n,payload:r}=t.data;switch(n){case`widget-ready`:E&&Dt();break;case`notification-sound`:Fe&&Et();break;case`close`:$();break;case`widget-settings`:if(r){let e=r;e.teaser&&(typeof e.teaser.name==`string`&&(j=e.teaser.name.slice(0,60)),typeof e.teaser.avatarUrl==`string`&&(je=e.teaser.avatarUrl)),typeof e.liveVoiceEnabled==`boolean`&&(w=e.liveVoiceEnabled,Z(v?`open`:`closed`)),e.appearance?yt(e.appearance):q()}break}}function At(){We(),v?$():Q()}function X(){return window.matchMedia?.(De).matches??!1}function jt(e){return X()?0:w?e===`open`?xe:Se:N[M.animation].duration}function Mt(e){return w?e===`open`?f:p:N[M.animation].easing}function Nt(e){if(w)return e===`open`?be:ye;let t=N[M.animation];return e===`open`?t.openTransform:t.closedTransform}function Pt(){!h||!_||(h.style.transformOrigin=I===`bottom-right`?`bottom right`:`bottom left`)}function Ft(){if(!h)return;let e=v&&!w;h.style.width=`${B}px`,h.style.bottom=`${e?Le():R}px`,h.style.maxHeight=`calc(100vh - ${e?Re():Ie()}px)`,h.style.height=`${w?ve:V}px`}function It(e,t=!1){if(!m)return;if(!w||t||X()){m.style.opacity=`1`,m.style.transition=`none`,m.style.transform=`translate3d(0, 0, 0)`,m.style.filter=`blur(0px)`,w&&e===`closed`&&(m.style.opacity=`0`,m.style.transform=`translate3d(0, 10px, 0)`,m.style.filter=`blur(8px)`);return}let n=e===`open`?260:120,r=e===`open`?72:0,i=e===`open`?f:p;m.style.transition=`opacity ${n}ms ${i} ${r}ms, transform ${n}ms ${i} ${r}ms, filter ${n}ms ${i} ${r}ms`,m.style.opacity=e===`open`?`1`:`0`,m.style.transform=e===`open`?`translate3d(0, 0, 0)`:`translate3d(0, 10px, 0)`,m.style.filter=e===`open`?`blur(0px)`:`blur(8px)`}function Lt(e,t=!1){if(!g)return;if(!w||t||X()){g.style.opacity=`0`,g.style.transition=`none`,g.style.transform=`translate3d(0, 8px, 0)`;return}let n=e===`open`?220:120,r=e===`open`?42:0,i=e===`open`?f:p;g.style.transition=`opacity ${n}ms ${i} ${r}ms, transform ${n}ms ${i} ${r}ms`,g.style.opacity=e===`open`?`0`:`1`,g.style.transform=e===`open`?`translate3d(0, -4px, 0)`:`translate3d(0, 8px, 0)`}function Z(e,t={}){if(!h)return;let n=jt(e),r=Mt(e),i=t.immediate||n===0,a=Nt(e),o=w&&e===`open`?`0 24px 70px rgba(15, 23, 42, 0.18), 0 0 0 1px rgba(15, 23, 42, 0.06)`:`0 4px 24px rgba(0, 0, 0, 0.15)`,s=w&&e===`closed`?Ce:we;Ft(),h.style.transition=i?`none`:`opacity ${n}ms ${r}, transform ${n}ms ${r}, filter ${n}ms ${r}, border-radius ${n}ms ${r}, box-shadow ${n}ms ${r}`,h.style.opacity=w||e===`open`?`1`:`0`,h.style.background=`transparent`,h.style.transform=a,h.style.filter=s,h.style.borderRadius=Te,h.style.boxShadow=o,Lt(e,i),It(e,i)}function Q(){h&&_&&(y!==null&&(window.clearTimeout(y),y=null),S||(S=!0,at()),A=!0,ut(),h.style.display=`block`,Pt(),v=!0,Z(`closed`,{immediate:!0}),J(),window.requestAnimationFrame(()=>{window.requestAnimationFrame(()=>Z(`open`))}),q())}function $(){if(h&&_){y!==null&&(window.clearTimeout(y),y=null);let e=!w;v=!1;let t=w;t||vt(),Pt(),w&&_&&(_.style.visibility=`hidden`,_.style.opacity=`0`,_.style.pointerEvents=`none`),Z(`closed`),y=window.setTimeout(()=>{h&&!v&&(h.style.display=`none`),t?J():e&&_&&(_.style.pointerEvents=`auto`),y=null},jt(`closed`))}}function Rt(){window.removeEventListener(`message`,kt),h&&(h.remove(),h=null,m=null,g=null),x&&=(x.remove(),null),_&&=(_.remove(),null),D=null,O=!1,A=!1,y!==null&&(window.clearTimeout(y),y=null),et(),We(),Pe=!1,v=!1,C=!1,w=!1,S=!1}function zt(e){Rt(),e.organizationId&&(P=e.organizationId),e.agentId!==void 0&&(F=e.agentId),e.position&&(I=e.position),e.animation&&(M.animation=G(e.animation)),xt()}window.EchoWidget={init:zt,show:Q,hide:$,destroy:Rt,setAppearance:yt},xt()})()})();