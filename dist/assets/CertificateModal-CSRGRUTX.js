import{j as e}from"./query-yHorNRzN.js";import{r as f}from"./router-BJHTTtoj.js";import{c as g,A as w,m as h,X as y,d as b,g as k,n as p}from"./index-LEPocBbD.js";import{L as C}from"./linkedin-CknD17aH.js";/**
 * @license lucide-react v0.395.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const v=g("Copy",[["rect",{width:"14",height:"14",x:"8",y:"8",rx:"2",ry:"2",key:"17jyea"}],["path",{d:"M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2",key:"zix9uf"}]]);/**
 * @license lucide-react v0.395.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const N=g("Download",[["path",{d:"M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4",key:"ih7n3h"}],["polyline",{points:"7 10 12 15 17 10",key:"2ggqvy"}],["line",{x1:"12",x2:"12",y1:"15",y2:"3",key:"1vk2je"}]]),D=t=>{const c=new Date(t.completionDate).toLocaleDateString("en-US",{year:"numeric",month:"long",day:"numeric"}),o=t.userName.length>30?t.userName.substring(0,27)+"...":t.userName,n=t.challengeName.length>35?t.challengeName.substring(0,32)+"...":t.challengeName;return`<?xml version="1.0" encoding="UTF-8"?>
<svg viewBox="0 0 1200 800" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet">
  <defs>
    <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#000000;stop-opacity:1" />
      <stop offset="50%" style="stop-color:#0a0a0a;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#000000;stop-opacity:1" />
    </linearGradient>
    <linearGradient id="neonGradient" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" style="stop-color:#32D17B;stop-opacity:1"/>
      <stop offset="50%" style="stop-color:#32D17B;stop-opacity:1"/>
      <stop offset="100%" style="stop-color:#25B96A;stop-opacity:1"/>
    </linearGradient>
    <linearGradient id="textGradient" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" style="stop-color:#FFFFFF;stop-opacity:1"/>
      <stop offset="100%" style="stop-color:#E0E0E0;stop-opacity:1"/>
    </linearGradient>
    <filter id="glow" x="-30%" y="-30%" width="160%" height="160%">
      <feGaussianBlur stdDeviation="8" result="blur"/>
      <feComposite in="SourceGraphic" in2="blur" operator="over"/>
    </filter>
    <filter id="strongGlow" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation="12" result="blur"/>
      <feComposite in="SourceGraphic" in2="blur" operator="over"/>
    </filter>
    <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
      <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#32D17B" stroke-width="0.5" stroke-opacity="0.08"/>
    </pattern>
  </defs>

  <!-- Background -->
  <rect width="1200" height="800" fill="url(#bgGradient)"/>
  <rect width="1200" height="800" fill="url(#grid)"/>

  <!-- Decorative neon border -->
  <rect x="40" y="40" width="1120" height="720" fill="none" stroke="#32D17B" stroke-width="2" filter="url(#glow)" opacity="0.8"/>
  <rect x="50" y="50" width="1100" height="700" fill="none" stroke="#32D17B" stroke-width="0.5" opacity="0.4"/>

  <!-- Corner decorations -->
  <g stroke="#32D17B" stroke-width="3" stroke-linecap="round" filter="url(#glow)">
    <!-- Top left -->
    <path d="M 50 80 L 50 50 L 80 50" fill="none" stroke-opacity="0.9"/>
    <!-- Top right -->
    <path d="M 1150 50 L 1150 80 M 1150 50 L 1120 50" fill="none" stroke-opacity="0.9"/>
    <!-- Bottom left -->
    <path d="M 50 720 L 50 750 L 80 750" fill="none" stroke-opacity="0.9"/>
    <!-- Bottom right -->
    <path d="M 1150 720 L 1150 750 L 1120 750" fill="none" stroke-opacity="0.9"/>
  </g>

  <!-- Decorative vertical lines -->
  <line x1="100" y1="80" x2="100" y2="150" stroke="#32D17B" stroke-width="2" opacity="0.6"/>
  <line x1="1100" y1="80" x2="1100" y2="150" stroke="#32D17B" stroke-width="2" opacity="0.6"/>

  <!-- Top section badge -->
  <rect x="400" y="60" width="400" height="50" fill="none" stroke="#32D17B" stroke-width="1.5" opacity="0.6"/>
  <text x="600" y="92" font-family="'Courier New', monospace" font-size="16" font-weight="bold" fill="#32D17B" letter-spacing="8" text-anchor="middle" filter="url(#glow)">SYSTEM_OPERATIVE_CERT</text>

  <!-- Main title -->
  <text x="600" y="200" font-family="'Arial Black', sans-serif" font-size="78" font-weight="900" fill="url(#textGradient)" text-anchor="middle" letter-spacing="6" filter="url(#strongGlow)">CERTIFICATE</text>
  <text x="600" y="260" font-family="'Courier New', monospace" font-size="24" fill="#32D17B" text-anchor="middle" letter-spacing="8" filter="url(#glow)">OF ACHIEVEMENT</text>

  <!-- Decorative line under title -->
  <line x1="300" y1="290" x2="900" y2="290" stroke="url(#neonGradient)" stroke-width="2" filter="url(#glow)"/>

  <!-- Verification text -->
  <text x="600" y="350" font-family="Arial, sans-serif" font-size="15" fill="#CCCCCC" text-anchor="middle" letter-spacing="3">THIS DOCUMENT CERTIFIES THAT</text>

  <!-- User name - prominently displayed -->
  <rect x="200" y="380" width="800" height="90" fill="#32D17B" fill-opacity="0.05" stroke="#32D17B" stroke-width="1.5" filter="url(#glow)"/>
  <text x="600" y="465" font-family="'Courier New', monospace" font-size="56" font-weight="900" fill="#32D17B" text-anchor="middle" filter="url(#strongGlow)">${o.toUpperCase()}</text>

  <!-- Achievement text -->
  <text x="600" y="530" font-family="Arial, sans-serif" font-size="15" fill="#CCCCCC" text-anchor="middle" letter-spacing="2">HAS SUCCESSFULLY COMPLETED</text>

  <!-- Challenge name box -->
  <rect x="150" y="545" width="900" height="60" fill="none" stroke="#32D17B" stroke-width="1.5" opacity="0.7" filter="url(#glow)"/>
  <text x="600" y="585" font-family="'Arial Black', sans-serif" font-size="28" fill="#FFFFFF" text-anchor="middle" letter-spacing="2">[ ${n.toUpperCase()} ]</text>

  <!-- Decorative divider -->
  <line x1="250" y1="640" x2="950" y2="640" stroke="#32D17B" stroke-width="1" stroke-dasharray="5,5" opacity="0.5"/>

  <!-- Date and Authority -->
  <g font-family="'Courier New', monospace" font-size="13" text-anchor="middle">
    <!-- Date section -->
    <text x="350" y="680" fill="#32D17B" font-weight="bold" letter-spacing="3">DATE_ISSUED</text>
    <text x="350" y="710" fill="#FFFFFF" font-size="14">${c}</text>
    
    <!-- Authority section -->
    <text x="850" y="680" fill="#32D17B" font-weight="bold" letter-spacing="3">AUTHORITY</text>
    <text x="850" y="710" fill="#FFFFFF" font-size="14">FSOCIETY.PK</text>
  </g>

  <!-- Footer -->
  <line x1="100" y1="745" x2="1100" y2="745" stroke="#32D17B" stroke-width="1" opacity="0.4"/>
  <text x="600" y="770" font-family="'Courier New', monospace" font-size="11" fill="#666666" text-anchor="middle" letter-spacing="3">© 2026 FSOCIETY_PK // SECURE_COMMUNICATIONS_NETWORK</text>
</svg>`},m=async(t,c)=>{const o=document.createElement("canvas");o.width=1200,o.height=800;const n=o.getContext("2d");if(!n)throw new Error("Failed to get canvas context");const r=new Image,d=new Blob([t],{type:"image/svg+xml"}),s=URL.createObjectURL(d);await new Promise((i,a)=>{r.onload=()=>{n.drawImage(r,0,0),URL.revokeObjectURL(s),i(void 0)},r.onerror=a,r.src=s}),o.toBlob(i=>{if(!i)throw new Error("Failed to create blob");const a=URL.createObjectURL(i),l=document.createElement("a");l.href=a,l.download=`${c}.png`,document.body.appendChild(l),l.click(),document.body.removeChild(l),URL.revokeObjectURL(a)})},j=t=>`🎖️ Excited to announce that I've successfully completed "${t.challengeName}" on FSOCIETY.PK! 🔥

Completed ${t.totalChallenges} challenge(s) as part of my cybersecurity training journey. This experience has strengthened my skills in security assessment and problem-solving.

FSOCIETY.PK is a phenomenal platform for hands-on learning. Highly recommend it for anyone looking to develop their cybersecurity expertise!

#Cybersecurity #HackingChallenge #InfoSec #FsocietyPK #PakistanCyberSecurity #LearningJourney`,S=({data:t,isOpen:c,onClose:o,onShare:n})=>{const[r]=f.useState(()=>D(t)),[d,s]=f.useState(!1),[i]=f.useState(()=>j(t)),a=async()=>{try{s(!0),await m(r,`${t.userName}-${t.platformName}-Certificate`),p.success("Certificate downloaded successfully!")}catch(x){p.error("Failed to download certificate"),console.error(x)}finally{s(!1)}},l=()=>{navigator.clipboard.writeText(i),p.success("LinkedIn description copied to clipboard!")},u=async()=>{try{s(!0),await m(r,`${t.userName}-${t.platformName}-Certificate`),navigator.clipboard.writeText(i),p.success("Certificate downloaded! Drop it into the LinkedIn post we just opened for you.",{duration:5e3,icon:"🚀"}),window.open("https://www.linkedin.com/feed/","_blank"),n&&n(i)}catch(x){p.error("Share process encountered an error."),console.error(x)}finally{s(!1)}};return e.jsx(w,{children:c&&e.jsxs(e.Fragment,{children:[e.jsx(h.div,{initial:{opacity:0},animate:{opacity:1},exit:{opacity:0},onClick:o,className:"fixed inset-0 bg-black/60 backdrop-blur-sm z-40"}),e.jsx(h.div,{initial:{opacity:0,scale:.9,y:20},animate:{opacity:1,scale:1,y:0},exit:{opacity:0,scale:.9,y:20},className:"fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none",children:e.jsxs("div",{className:"bg-background-card border border-neon-green/30 rounded-2xl p-6 md:p-8 max-w-6xl w-full pointer-events-auto max-h-[90vh] overflow-y-auto",children:[e.jsx("button",{onClick:o,className:"absolute top-6 right-6 p-2 hover:bg-surface rounded-lg transition-colors",children:e.jsx(y,{size:24,className:"text-text-muted"})}),e.jsxs("div",{className:"text-center mb-8",children:[e.jsxs("div",{className:"flex items-center justify-center gap-3 mb-4 flex-wrap",children:[e.jsx(b,{className:"w-8 h-8 text-neon-green shrink-0"}),e.jsx("h2",{className:"text-2xl md:text-3xl font-black italic text-glow uppercase",children:"MISSION ACCOMPLISHED!"})]}),e.jsx("p",{className:"text-text-muted font-mono text-sm md:text-base",children:"You've successfully completed all challenges. Here's your certificate of achievement."})]}),e.jsx("div",{className:"bg-black/40 border border-surface-border rounded-xl p-4 md:p-6 mb-8 w-full",children:e.jsx("div",{dangerouslySetInnerHTML:{__html:r},className:"w-full",style:{maxWidth:"100%",height:"auto"}})}),e.jsxs("div",{className:"space-y-4",children:[e.jsx("h3",{className:"text-lg font-bold text-text-primary uppercase mb-4",children:"SHARE YOUR ACHIEVEMENT"}),e.jsxs("div",{className:"bg-surface/50 border border-surface-border rounded-lg p-4 space-y-3",children:[e.jsx("p",{className:"text-sm text-text-muted font-mono uppercase tracking-wider",children:"Suggested LinkedIn Post:"}),e.jsx("p",{className:"text-sm text-text-secondary leading-relaxed whitespace-pre-wrap italic",children:i}),e.jsxs("button",{onClick:l,className:"flex items-center gap-2 px-4 py-2 bg-blue-500/10 border border-blue-500/30 text-blue-400 rounded-lg hover:bg-blue-500/20 transition-colors text-sm font-bold",children:[e.jsx(v,{size:16}),"COPY TO CLIPBOARD"]})]}),e.jsxs("div",{className:"grid grid-cols-1 md:grid-cols-3 gap-4",children:[e.jsxs("button",{onClick:a,disabled:d,className:k("flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-black uppercase text-sm transition-all",d?"bg-zinc-700 text-zinc-400 cursor-not-allowed":"bg-neon-green/10 border border-neon-green/50 text-neon-green hover:bg-neon-green/20"),children:[e.jsx(N,{size:18}),d?"DOWNLOADING...":"DOWNLOAD CERTIFICATE"]}),e.jsxs("button",{onClick:u,className:"flex items-center justify-center gap-2 px-6 py-3 bg-blue-600/10 border border-blue-600/50 text-blue-400 rounded-lg hover:bg-blue-600/20 font-black uppercase text-sm transition-all",children:[e.jsx(C,{size:18}),"SHARE ON LINKEDIN"]}),e.jsxs("button",{onClick:o,className:"flex items-center justify-center gap-2 px-6 py-3 bg-zinc-700/50 border border-zinc-600/50 text-zinc-300 rounded-lg hover:bg-zinc-700 font-black uppercase text-sm transition-all",children:[e.jsx(y,{size:18}),"CLOSE"]})]})]}),e.jsxs("p",{className:"text-xs text-text-muted text-center mt-6 font-mono",children:["By sharing this certificate, you acknowledge that you completed this challenge on"," ",e.jsx("span",{className:"text-neon-green",children:t.platformName})]})]})})]})})};export{S as C};
//# sourceMappingURL=CertificateModal-CSRGRUTX.js.map
