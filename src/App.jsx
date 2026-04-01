
import { useState, useEffect, useRef } from "react";

// ─── DESIGN SYSTEM ───────────────────────────────────────────────────────────
const D = {
  bg:          "#0a0a12",
  bgCard:      "#0d0d1a",
  text:        "#e8e6e0",
  textMid:     "rgba(232,230,224,0.6)",
  textDim:     "rgba(232,230,224,0.38)",
  textFaint:   "rgba(232,230,224,0.18)",
  // Primary — Blue #3B82F6
  blue:        "#3B82F6",
  blueDim:     "rgba(59,130,246,0.55)",
  blueFaint:   "rgba(59,130,246,0.1)",
  // Secondary — Purple #8B5CF6
  purple:      "#8B5CF6",
  purpleDim:   "rgba(139,92,246,0.55)",
  purpleFaint: "rgba(139,92,246,0.1)",
  // Tertiary — Gold #C9A84C (scores & ratings only)
  amber:       "#C9A84C",
  amberDim:    "rgba(201,168,76,0.55)",
  amberFaint:  "rgba(201,168,76,0.1)",
  border:      "rgba(255,255,255,0.06)",
  borderMed:   "rgba(255,255,255,0.12)",
  serif:       "'Georgia', 'Times New Roman', serif",
  sans:        "'Helvetica Neue', Helvetica, Arial, sans-serif",
  mono:        "'Courier New', Courier, monospace",
};


// ─── PEAK SYSTEM PROMPT ───────────────────────────────────────────────────────
const PEAK_SYSTEM_PROMPT = `
You are PEAK — an AI-powered objective rating system.
You rate any anime, manga, TV show, or film based purely
on the principles of great storytelling, not popularity.

PEAK produces two scores for every title:
PEAK SCORE — craft-based, AI-generated
PEAK EXPERIENCE — derived from real world audience signals

═══════════════════════════════════════════
PART 1 — INTENT DEFINITION
═══════════════════════════════════════════

Before rating anything define intent clearly.
Ask: "What was this work actually trying to be?"

Examples:
- "A philosophical anti-war story"
- "A pure power fantasy"
- "A tragic romance disguised as action"
- "A comfort sitcom about chosen family"

This prevents genre bias. A comedy is never
punished for not being Berserk. It is judged
on whether it succeeded at being a great comedy.

═══════════════════════════════════════════
PART 2 — PEAK SCORE
═══════════════════════════════════════════

Three layers combined into one final score.

LAYER 1 — CORE CRAFT (50%)
Score each out of 10. Use 0.5 increments only.
Every score must cite specific evidence.

① WRITING & STRUCTURE — 15%
Plot logic, coherence, setup/payoff discipline,
narrative architecture, whether every scene has purpose.
10=Perfect architecture 8=Minor issues 6=Inconsistencies 4=Frequent issues 2=Broken

② CHARACTERIZATION — 10%
Psychological depth, consistency, believable motivations,
character evolution across full run.
10=Complex & consistent 8=Strong but uneven 6=Some flat behavior 4=Mostly shallow 2=Illogical

③ CONSISTENCY — 10%
Quality stability across arcs and seasons, tonal consistency.
10=No drop 8=Minor dips 6=Noticeable decline 4=Major inconsistency 2=Collapse

④ PACING — 10%
Rhythm and flow, tension building and release.
10=Perfect flow 8=Slight drag 6=Uneven 4=Frequent issues 2=Disruptive

⑤ TECHNICAL EXECUTION — 5%
MEDIUM-AWARE — judge within medium constraints.
MANGA: Panel composition, linework, visual density, page design
ANIME: Animation quality, art direction, choreography, soundtrack
TV SHOW: Cinematography, direction, production design, lighting, score
FILM: Everything in TV plus visual effects, shot composition, theatrical ambition
NEVER compare manga art to anime animation.
10=Ceiling of its medium 8=Strong 6=Functional 4=Weak 2=Distracting

LAYER 2 — INTERPRETIVE VALUE (30%)

⑥ THEMES & DEPTH — 15%
HARD RULE: Themes score cannot influence Writing score. No cross-contamination.
10=Deep & layered throughout 8=Strong but not fully explored 6=Surface level 4=Weak 2=Absent

⑦ EMOTIONAL IMPACT — 10%
Whether emotion is earned or forced, weight accumulated across full run.
10=Consistently powerful 8=Strong moments 6=Some impact 4=Weak 2=None

⑧ ORIGINALITY — 5%
Freshness in execution not just concept.
10=Genuinely unique 8=Familiar but fresh 6=Standard 4=Derivative 2=Generic

LAYER 3 — INTENT FULFILLMENT (20%)

⑨ INTENT FULFILLMENT — 20%
Step 1: State the intent clearly.
Step 2: Score how completely it achieved that intent.
A comedy scored on whether it is funny.
A romance scored on whether it moves you.
A power fantasy scored on whether it satisfies the fantasy.
10=Fully achieves goal 8=Mostly succeeds 6=Partial success 4=Misses key goals 2=Fails

PEAK SCORE FORMULA:
Core Craft Average × 0.5 + Interpretive Value Average × 0.3 + Intent Fulfillment × 0.2 = PEAK SCORE

HARD RULES:
EVIDENCE RULE: Every score must reference specific evidence — a scene, arc, episode or chapter.
NO COMPENSATION RULE: High themes cannot cover weak writing. Each category scored independently.
INCOMPLETENESS PENALTY: Ongoing clear direction:-0.1 / Hiatus unclear:-0.2 / Author death:-0.2 / Abandoned:-0.4
SCORE CALIBRATION: 10.0=Once in a generation / 9.5+=All time great / 9.0+=S Tier / 8.5-8.9=A Tier / 8.0-8.4=B Tier / 7.0-7.9=C Tier / Below 7.0=D Tier
Use 0.5 increments only. No false precision.
SPOILER RULE: Hook lines NEVER name characters who die, reveal twist identities, or describe major plot events.
WRONG: "Ned Stark's execution redefines the show"
RIGHT: "A single event in season 1 permanently redefines what kind of show this is"

SEASON ANIMATION BOUNDARY RULE (for episode ratings):
Season Technical Execution 5.0 or below → episode Peak Score cannot exceed 7.0
Season Technical Execution 9.0 or above → episode Peak Score cannot go below 8.5

═══════════════════════════════════════════
PART 3 — PEAK EXPERIENCE
═══════════════════════════════════════════

Measures how the work FEELS to its audience.
Derived from real world signals not AI guessing.

SIGNALS: Box office, MAL score/vote count, IMDb score,
Rotten Tomatoes audience score, CinemaScore,
social response/viral moments, rewatch behaviour.

Weight signals by sample size and reliability.
If under 100k MAL votes or no box office:
State — "Limited data — smaller sample"

Experience categories: Enjoyment / Engagement / Rewatchability

═══════════════════════════════════════════
PART 4 — EPISODE RATINGS
═══════════════════════════════════════════

Episode types: PREMIERE / MYTHOLOGY/LORE / CHARACTER STUDY /
ACTION/SET PIECE / BOTTLE EPISODE / MID SEASON CLIMAX /
FINALE / TOURNAMENT ARC EPISODE / FILLER

UNIVERSAL EPISODE CATEGORIES (60%):
① Writing & Purpose
② Emotional Impact
③ Character Consistency
④ Contribution to overall story
⑤ Technical Execution (animation/cinematography)

TYPE-SPECIFIC CATEGORIES (40%) — 3 categories per type:
PREMIERE: Hook Strength / World Establishment / Return Promise
FINALE: Payoff / Earned Resolution / Lasting Feeling
ACTION/SET PIECE: Choreography & Execution / Stakes / Payoff of buildup
CHARACTER STUDY: Psychological Depth / Restraint / Standalone Power
TOURNAMENT ARC: Fight Choreography / Power Reveal Quality / Crowd & Stakes Energy
FILLER: Entertainment Value / Character Warmth / Tone Consistency
BOTTLE EPISODE: Dialogue Quality / Tension Management / Character Revelation
MID SEASON CLIMAX: Stakes Escalation / Shift Quality / Setup for Second Half
MYTHOLOGY/LORE: Revelation Quality / Integration / Recontextualisation

EPISODE SCORE FORMULA:
Universal Categories Average × 0.6 + Type-Specific Average × 0.4 = PEAK EPISODE SCORE

═══════════════════════════════════════════
PART 5 — OUTPUT FORMAT
═══════════════════════════════════════════

Respond ONLY with valid JSON. No markdown. No backticks. No explanation.

For full series/film use this exact structure:
{
  "title": "",
  "type": "",
  "year": "",
  "status": "",
  "intent": "",
  "peakScore": 0.0,
  "peakExperience": 0.0,
  "tier": "",
  "spoilerWarning": false,
  "synopsis": "",
  "scores": {
    "writing": 0.0,
    "characterization": 0.0,
    "consistency": 0.0,
    "pacing": 0.0,
    "technicalExecution": 0.0,
    "themes": 0.0,
    "emotionalImpact": 0.0,
    "originality": 0.0,
    "intentFulfillment": 0.0
  },
  "scoreReasons": {
    "writing": "",
    "characterization": "",
    "consistency": "",
    "pacing": "",
    "technicalExecution": "",
    "themes": "",
    "emotionalImpact": "",
    "originality": "",
    "intentFulfillment": ""
  },
  "verdict": "",
  "comparisons": ["", "", ""],
  "incompletenessNote": ""
}

TIER GUIDE: S=9.0+ / A=8.5-8.9 / B=8.0-8.4 / C=7.0-7.9 / D=below 7.0
`;

// ─── AI RATING ENGINE ─────────────────────────────────────────────────────────
const generatePeakRating = async (title, type) => {
  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1500,
      system: PEAK_SYSTEM_PROMPT,
      messages: [{ role: "user", content: `Rate this ${type}: ${title}` }]
    })
  });
  if (!response.ok) throw new Error("API error");
  const data = await response.json();
  const raw = data.content.filter(i => i.type === "text").map(i => i.text).join("");
  const match = raw.match(/\{[\s\S]*\}/);
  if (!match) throw new Error("No JSON in response");
  return JSON.parse(match[0]);
};

// ─── ALL 24 WORKS ─────────────────────────────────────────────────────────────
const WORKS = [
  // ── S TIER ──
  {
    id:"vs", title:"Vinland Saga", type:"Manga", year:"2005", status:"Complete ✓",
    overall:9.7, hook:"The greatest finished manga ever made.", tier:"S", color:D.blue,
    tagline:"A man who chose to stop — and changed everything by doing so.",
    overview:{
      surface:"A Viking warrior seeks revenge for his father's murder.",
      real:"A story about whether goodness is actually possible in a brutal world — and the quiet, patient, costly insistence that it is.",
      deep:"Vinland Saga ended July 25 2025 — chapter 220, titled 'Somewhere Not Here.' Thorfinn does not conquer Vinland. He leaves. The warchief raises his sword at the end — war remains. Thorfinn leaves anyway. And plants wheat seeds. That is not a narrative failure. That is the most honest anti-war statement in manga history. The destination was never the destination. It was always the man making the journey. Einar dies in Vinland and stays there — the cost of Thorfinn's dream made permanent in the earth itself."
    },
    scores:{Writing:9.6, Art:8.9, Themes:9.9, Twists:9.0, Characters:9.7, Pacing:9.3, "Emotional Impact":9.7, Consistency:9.7},
    scoreReasons:{
      "Writing":"9.6 — Yukimura maintained his thesis across 220 chapters with extraordinary discipline. The failure of Vinland as a place making Vinland as an idea more powerful — that is writing of the highest sophistication. He never lost the philosophical thread even as the tone evolved across radically different arcs.",
      "Art":"8.9 — Yukimura's art is excellent but not in the same category as Inoue or Miura. His emotive character designs and sweeping background work anchor emotional moments within a realist world. The final chapter's visual restraint — gentle smiles, wind-blown grass, silent tears — is exactly correct for the ending.",
      "Themes":"9.9 — the highest thematic score on this list. Vinland Saga is asking whether goodness is actually possible in a brutal world — and answers it without naivety. The cycle of violence theme is not just present but the structural spine of every arc. The ending proves Yukimura pursued it with total discipline across 20 years.",
      "Twists":"9.0 — Askeladd's true identity and motivation is extraordinary. His death simultaneously the greatest twist and greatest emotional gut punch in the manga. Canute's transformation is a gradual twist grounded in complete psychological logic. The reveal that Thorfinn's pacifism is genuine strength reframes the entire slave arc retroactively.",
      "Characters":"9.7 — Thorfinn's complete arc from rage-filled child to pacifist visionary is the most complete and honest character journey on this list. Canute's parallel corruption is devastating and earned. Askeladd remains one of the greatest characters in manga even after his death — his presence echoes through every subsequent chapter.",
      "Pacing":"9.3 — deliberately slow, especially the slave arc, but almost always earned. Yukimura trusts silence and stillness. The pacing is the argument — a manga about the value of presence and restraint should require patience from the reader.",
      "Emotional Impact":"9.7 — Askeladd's death. Einar's death and burial in Vinland. Thorfinn's breakdown. The final image of wheat growing. These moments hit with the weight of 20 years of patient investment. The ending is somber, hopeful and human — three words that perfectly describe its emotional achievement.",
      "Consistency":"9.7 — the greatest consistency score on this list. 220 chapters across 20 years without losing the thematic thread once. The final chapter is indistinguishable in philosophy from the slave arc's finest moments. That sustained integrity across two decades is itself an extraordinary achievement."
    },
    arcs:[
      {name:"War Arc / Prologue",rating:9.1,tags:["Askeladd","Revenge","Foundation"],hook:"You have no enemies.",analysis:"Thorfinn's childhood and descent into becoming a tool of revenge. Askeladd is established as one of the most complex figures in manga — not a villain but a tragic product of his world. The action is brutal but always purposeful."},
      {name:"Slave Arc",rating:9.5,tags:["Masterpiece","Pacifism","Trauma"],hook:"The single boldest creative decision in the manga.",highlight:true,analysis:"After 54 chapters of Viking warfare, Thorfinn wakes up a broken slave with no fighting ability, no revenge, no purpose. Einar arrives as a perfect foil. This arc is a masterclass in depicting trauma recovery honestly — no quick fixes, no sudden strength. The philosophical foundation of the entire series is laid here permanently."},
      {name:"Eastern Expedition Arc",rating:9.3,tags:["Canute","Politics","Hild"],hook:"Can good intentions justify violent means?",analysis:"Thorfinn and Einar join Canute's political intrigue while pursuing the dream of Vinland. Canute's transformation from idealistic prince to ruthless king is handled with genuine tragedy. Hild's introduction and her relationship with Thorfinn is one of the most emotionally complex dynamics in the manga."},
      {name:"Baltic Sea / Final Arc",rating:9.0,tags:["Vinland","Pacifism","Conclusion"],hook:"The promised land was never a place.",analysis:"Thorfinn actively pursuing Vinland while navigating slave trade abolition, war and political complexity. The ending — wheat growing from Plmk's hands — is the most important final image in manga history. Not the most spectacular. The most true."},
    ],
    comparisons:[
      {title:"Berserk",verdict:"Greatest conceived vs greatest delivered",detail:"Berserk is the greater conceived work. Vinland Saga is the greater delivered work. Berserk's Eclipse has no equal as a single event. But Vinland Saga finished — and completion is itself an artistic achievement.",color:D.amber},
      {title:"AOT",verdict:"Better ending",detail:"Both deal with cycles of violence. AOT's chapter 139 partially contradicts its own thesis. Vinland Saga's ending deepens everything that came before it. That gap is why Vinland Saga is #1.",color:D.purple},
    ],
    verdict:{score:9.7,line:"The wheat growing at the end of chapter 220 is the most important final image in manga history.",full:"Not the most spectacular. The most true. Yukimura spent 20 years asking whether goodness is possible in a brutal world and answered it with wheat growing from the hands of a native boy taught by a Viking who failed and left. Vinland Saga is number one because it is the only work simultaneously philosophically ambitious, thematically consistent across its full length, complete on its own terms, and concluded with an ending that deepens rather than diminishes everything before it.",canReachS:false}
  },
  {
    id:"berserk", title:"Berserk", type:"Manga", year:"1989", status:"Incomplete",
    overall:9.6, hook:"The greatest conceived work in manga history.", tier:"S", color:D.blue,
    tagline:"Can a human being retain their humanity when the universe itself is designed to destroy it?",
    overview:{
      surface:"A dark warrior fights demons in a medieval world.",
      real:"Not whether Guts will win — but whether winning is even possible without losing what makes him worth rooting for.",
      deep:"The Eclipse is not a plot twist. It is the revelation of truth that was present from the beginning. Griffith doesn't become evil at the Eclipse. He reveals what he always was — a person for whom other human beings were ultimately instruments of his ambition. The horror is that Miura made you love him anyway. Made you understand him. Made you see his perspective so clearly that his choice is simultaneously monstrous and psychologically coherent. That simultaneous understanding and condemnation is the rarest achievement in antagonist writing."
    },
    scores:{Writing:9.7, Art:9.9, Themes:9.9, Twists:9.2, Characters:9.8, Pacing:9.0, "Emotional Impact":9.8, Consistency:9.2},
    scoreReasons:{
      "Writing":"9.7 — the most architecturally sophisticated long form narrative on this list. Every element introduced pays off. The Black Swordsman — Golden Age structural decision alone demonstrates narrative intelligence demanding comparison with the greatest novelists. The Eclipse as inevitable culmination of everything that preceded it is plotting at the absolute ceiling.",
      "Art":"9.9 — Miura's technical mastery is the greatest in manga history alongside Inoue, surpassing him in density and scale. The apostle designs represent an artistic achievement with no parallel in the medium. Eclipse pages are among the most extraordinary pieces of visual art ever produced in sequential form. His battle sequences have spatial coherence no other mangaka matches.",
      "Themes":"9.9 — Berserk operates on more thematic levels simultaneously than any other work on this list. Surface: a man fighting monsters. Deeper: a survivor learning whether he deserves love. Deeper still: whether ambition justifies instrumentalizing others. Deepest: a humanist argument that love is the only meaningful resistance to a universe designed for suffering. All present simultaneously. None stated explicitly.",
      "Twists":"9.2 — The Eclipse as a plot twist scores 10/10 — the greatest single twist event on this list. It functions as a twist only on first read. On reread it functions as tragedy. A story that works as both simultaneously is operating at the absolute ceiling of narrative craft. The Skull Knight's identity and Femto's return as Griffith are handled with equal discipline.",
      "Characters":"9.8 — Guts, Griffith and Casca form the greatest character triangle in manga history. Griffith is the most complex antagonist on this list — not because he is unpredictable but because he is completely understandable and still unforgivable simultaneously. Schierke, Farnese and Serpico add genuine depth post-Eclipse rather than mere function.",
      "Pacing":"9.0 — Golden Age and Conviction arcs are paced with near perfection. Millennium Falcon occasionally prioritizes world building over narrative momentum. Fantasia arc's slower pace is the most debated and most legitimately criticized element. Still strong overall — Miura earns almost every moment of stillness he demands.",
      "Emotional Impact":"9.8 — the Eclipse. Guts' childhood. Judeau's death. Casca's trauma. Griffith's imprisonment. Guts choosing to turn back for Casca. Each of these hits with weight accumulated across thousands of pages of patient investment. No work on this list makes you feel the cost of its events more completely.",
      "Consistency":"9.2 — extraordinary for a 32-year serialized work. The thematic thread never breaks. Artistic quality never seriously dips. The Fantasia arc's tonal shift is real but not a quality collapse. The incompleteness due to Miura's death prevents a higher score — we cannot assess what was never completed."
    },
    arcs:[
      {name:"Black Swordsman Arc",rating:9.0,tags:["Introduction","Mystery","Tone"],hook:"We meet Guts already broken — and already mourning what he lost before we know what that was.",analysis:"Chronologically after Golden Age but written first. Miura's structural decision to open here is extraordinary — we know where Guts ends up before we know how he got there. The Golden Age then becomes not an origin story but a tragedy we watch unfold knowing the ending."},
      {name:"Golden Age Arc",rating:9.9,tags:["Masterpiece","Griffith","Eclipse","Greatest Arc"],hook:"Everything was building to this. We just didn't know it.",highlight:true,analysis:"The greatest extended arc in manga history. The Eclipse is the greatest narrative event in manga — not because of the violence but because it is completely inevitable in retrospect and completely shocking in the moment simultaneously. Griffith's choice: not corruption but revelation of what he always was. The reader understands completely. Agrees with him at points. And then watches him commit the Eclipse — and the understanding doesn't diminish the horror. It amplifies it."},
      {name:"Conviction Arc",rating:9.3,tags:["Mozgus","Farnese","Casca"],hook:"Rage aimed inward as much as outward.",analysis:"Post-Eclipse Guts is a different character and Miura handles the transition with discipline. Mozgus — a man of genuine religious faith whose faith has curdled into something that justifies any cruelty — is the institutional face of the same evil the God Hand represents cosmically. Farnese's introduction is particularly strong."},
      {name:"Millennium Falcon Arc",rating:9.5,tags:["Schierke","Griffith Returns","Peak Art"],hook:"Miura's artwork reaches its absolute technical peak here.",analysis:"Where Miura's ambition expands to its fullest scope. Griffith's rebirth as Femto walking back into the human world as a savior mirrors real historical patterns of charismatic leaders emerging from catastrophe. Schierke humanizes Guts in ways nobody else can. Guts choosing to turn back for Casca — quiet and costly — is the most important post-Eclipse character decision."},
      {name:"Fantasia Arc",rating:8.3,tags:["Tone Shift","Unfinished","Inaccessible"],hook:"Adventure where there was once horror — and Miura never got to explain why.",analysis:"The most debated arc. Tone shifts toward adventure. The farming chapters are thematically consistent — a manga about the value of presence should be experienced with presence. But Miura died in 2021 leaving the arc unresolved. Continues under Kouji Mori using Miura's notes — not the same. The incompleteness is a tragedy, not a creative failure."},
    ],
    comparisons:[
      {title:"Vagabond",verdict:"Different mastery",detail:"Vagabond has the greatest artwork at 10.0. Berserk has the greatest technical achievement at 9.9. Inoue paints meditation. Miura draws cosmic horror at maximum detail. Different excellence entirely.",color:D.amber},
      {title:"Monster",verdict:"Violence vs conversation",detail:"Monster uses conversation as its weapon. Berserk uses spectacle. Monster's Johan is more human than any Berserk villain. Griffith is more tragic. Both are the greatest in their category — incomparable.",color:D.text},
    ],
    verdict:{score:9.6,line:"Not the most fun. Not the most accessible. Not the most complete. The most serious.",full:"Berserk is not the most fun work on this list. Not the most accessible. Not the most complete. It is the most serious. The most ambitious. The most fully realized vision of what manga can achieve when operated by a once-in-a-generation talent across a lifetime of work. The incompleteness due to Miura's death in 2021 is the only thing separating it from being the undisputed greatest manga ever made. What exists is still the greatest. What will exist cannot be fully his vision.",canReachS:false}
  },
  {
    id:"vagabond", title:"Vagabond", type:"Manga", year:"1998", status:"Hiatus",
    overall:9.5, hook:"The greatest artwork ever produced in manga.", tier:"S", color:D.blue,
    tagline:"The sword is not the point. The sword is what has to be surrendered for the point to emerge.",
    overview:{
      surface:"The fictionalized journey of Miyamoto Musashi becoming the greatest swordsman.",
      real:"A man slowly realizing that the thing he devoted his entire existence to is the obstacle preventing him from truly existing.",
      deep:"Vagabond is the only work where the artwork IS the story — not decoration, not supplement, but the primary narrative voice. Inoue communicates philosophical content through visual choices that have no equivalent in text. The way he draws Kojiro's eyes — present, undefended, completely open — communicates his enlightenment more completely than any dialogue could. Removing the art would not just diminish Vagabond. It would destroy it. The story cannot be told in words alone."
    },
    scores:{Writing:9.4, Art:10.0, Themes:9.7, Twists:8.7, Characters:9.8, Pacing:9.2, "Emotional Impact":9.6, Consistency:8.9},
    scoreReasons:{
      "Writing":"9.4 — Inoue's narrative is not conventional plot-driven writing — it is revelation through accumulation of moment. Every arc recontextualizes what Musashi is actually seeking. The Kojiro arc particularly demonstrates writing intelligence of the highest order — a character who says almost nothing communicates everything. The hiatus prevents a higher score.",
      "Art":"10.0 — the greatest artwork ever produced in manga. Inoue's brushwork in Vagabond is in a category almost entirely alone. The use of negative space, ink wash techniques, facial expressiveness and movement convey emotion that most writers need thousands of words to achieve. Single panels communicate entire philosophical and psychological realities without text. Removing the art would destroy the story.",
      "Themes":"9.7 — Vagabond is about ego dissolution. The entire manga is Musashi slowly realizing that the pursuit of being the strongest is itself the obstacle to true strength. Kojiro's arc is the thematic thesis made visible — a person who never developed ego because the normal mechanisms of ego formation were unavailable to him, and who is therefore the most complete swordsman alive.",
      "Twists":"8.7 — Vagabond's twists are philosophical rather than narrative. The revelation that Kojiro's limitation is his enlightenment. The realization that Inshun already has what Musashi is seeking. Musashi's turn toward farming as abandonment of his entire constructed identity. These are thematic twists of the highest order — they change what the manga means rather than what happens.",
      "Characters":"9.8 — Musashi, Kojiro and Matahachi together constitute one of the greatest character ensembles in manga. Kojiro is the greatest character construction on this list alongside Griffith — not for psychological complexity but for philosophical completeness. Matahachi is manga's most honest portrait of human weakness — consistently failing without malice, consistently choosing easier over right.",
      "Pacing":"9.2 — deliberately slow even by Vinland Saga slave arc standards. Inoue spends thirty pages on a single afternoon of Kojiro watching water. This is not indulgence — it is form matching content. A manga about presence and stillness should require presence and stillness from the reader. The pacing is the philosophical argument.",
      "Emotional Impact":"9.6 — Kojiro's first encounter with a sword is the single most quietly devastating emotional moment on this list. Not through death or loss but through recognition — a human being encountering their own nature for the first time. Musashi's defeats carry genuine weight. Matahachi's failures are more emotionally honest than most manga's victories.",
      "Consistency":"8.9 — remarkably consistent across 327 published chapters spanning twenty years of serialization. The art improved continuously. The philosophy deepened continuously. The hiatus since 2015 prevents a perfect score — we cannot assess the ending that would complete the work."
    },
    arcs:[
      {name:"Intro / Sekigahara Arc",rating:8.7,tags:["Origin","Violence","Takuan"],hook:"Stillness forced on a person built entirely for motion.",analysis:"Takezō before Musashi. Imprisoned in a tree for three years — his transformation begins not through training but through enforced confrontation with his own interior emptiness. Inoue establishing that this story's central conflict is not external."},
      {name:"Inshun Arc",rating:9.5,tags:["Philosophy","Masterpiece","Deafness","Enlightenment"],hook:"Inshun wins philosophically. Musashi wins physically. Both know it.",highlight:true,analysis:"Inshun — a deaf monk — cannot hear the narratives other people construct around combat. He experiences only the physical reality of the moment. That presence makes him approaching enlightened without having sought it. His combat with Musashi is a philosophical encounter — striving effortful mastery against effortless present mastery. Musashi wins. Inshun wins. And Musashi knows it."},
      {name:"Kojiro Arc",rating:9.9,tags:["Greatest Character","Deaf","Nature","Pure"],hook:"He became the greatest swordsman alive without ever trying.",highlight:true,analysis:"The greatest extended character study in manga history. Kojiro is deaf, considered intellectually limited. He has watched water. He has watched birds. He has become — without knowing it, without trying — the most complete swordsman alive. Not because he achieved it. Because he never lost it. The scene where Kojiro first picks up a sword is one of the greatest sequences in manga history — a human being encountering their own nature for the first time."},
      {name:"Yoshioka Arc",rating:9.3,tags:["Institution","Pride","Cost"],hook:"Defeating them doesn't make Musashi right. It just makes him victorious.",analysis:"The most politically complex arc. The Yoshioka school's pride is not mere vanity — it is the organizing principle of their lives, their family's legacy, their students' futures. Musashi defeating them removes the foundation their existence was built on. Inoue handles this with the moral seriousness it deserves."},
      {name:"Farming / Final Chapters",rating:8.8,tags:["Dissolution","Earth","Hiatus"],hook:"He stopped seeking the sword. The sword was always there.",analysis:"Musashi literally farming — tending rice paddies, trying to understand life through cultivation rather than destruction. The most radical tonal departure and the most thematically consistent. On indefinite hiatus since 2015. Inoue has spoken about struggling with the ending's weight. Not a creative failure — possibly the opposite."},
    ],
    comparisons:[
      {title:"Berserk",verdict:"Art vs conception",detail:"Vagabond wins on pure artistic craft — 10.0 vs 9.9. Berserk wins on narrative scope and thematic breadth. Berserk is the greatest conceived work. Vagabond is the greatest artistic achievement. 9.6 vs 9.5.",color:D.amber},
      {title:"Monster",verdict:"Silence vs dialogue",detail:"Monster uses conversation to devastate. Vagabond uses silence and image. Urasawa tells you what Johan means. Inoue shows you what Kojiro is. Both are operating at the ceiling of their chosen method.",color:D.text},
    ],
    verdict:{score:9.5,line:"Inoue doesn't just draw a story. He paints a meditation.",full:"Vagabond is the second greatest work on this list and the greatest artistic achievement across everything we rated. It is the only work here where the visual medium is not a vehicle for the story — it is the story. The hiatus is the only thing separating it from Berserk at the very top. If Inoue returns and concludes with the same philosophical integrity that defines its best chapters — the ranking may need to be revisited one final time.",canReachS:false}
  },
  {
    id:"monster", title:"Monster", type:"Manga", year:"1994", status:"Complete ✓",
    overall:9.4, hook:"The only complete work in S tier — and completion matters.", tier:"S", color:D.text,
    tagline:"Is human life inherently valuable — or does it require meaning to have worth?",
    overview:{
      surface:"A surgeon who saves a boy who grows up to become a serial killer.",
      real:"A humanist argument that must first take the nihilist position completely seriously — and then defeat it through human connection rather than logic.",
      deep:"Johan Liebert is the greatest villain in manga history. What makes him extraordinary is not his power or cruelty but his philosophy — he genuinely believes existence is meaningless and demonstrates it by dismantling people's reasons to live. He never needs to raise his voice. He is scarier fully clothed having a quiet conversation than any monster with supernatural power. Tenma's refusal to kill Johan even when it would save lives is not stupidity — it is a coherent philosophical position held under maximum pressure."
    },
    scores:{Writing:9.6, Art:8.9, Themes:9.8, Twists:9.2, Characters:9.7, Pacing:9.0, "Emotional Impact":9.5, Consistency:9.2},
    scoreReasons:{
      "Writing":"9.6 — Urasawa is operating at a level of narrative control that few manga artists achieve. Every chapter plants seeds that pay off hundreds of chapters later. The plotting is dense but never confusing. Side characters introduced briefly return with purpose. Nothing is decorative — everything is load bearing.",
      "Art":"8.9 — Urasawa's art is not Inoue or Miura level technically but extraordinarily effective as storytelling instrument. His faces are his greatest strength — he can convey entire psychological histories through a single expression. European architecture and atmosphere rendered with loving detail. Action is rare but impactful precisely because of its rarity.",
      "Themes":"9.8 — Monster is asking the hardest question a humanist work can ask: is human life inherently valuable or does it require meaning to have worth? Johan represents the nihilist position with terrifying intelligence. Tenma represents the humanist position at enormous personal cost. The manga never cheapens either position. It earns its humanist conclusion by taking the nihilist argument completely seriously first.",
      "Twists":"9.2 — Urasawa's twists are slower and more atmospheric than AOT or Death Note but perhaps the most carefully planted on this list. The gradual revelation of Johan's true nature, the twin identity question, Tenma's various near misses — all seeded with extraordinary patience. The Ruhenheim revelation of Johan's full plan is a masterclass in slow burn twist construction.",
      "Characters":"9.7 — Tenma is one of the most genuinely moral protagonists in fiction — not moral in a naive way but moral in a tested, costly, exhausted way. His refusal to kill Johan is not stupidity — it is a coherent philosophical position held under maximum pressure. Lunge's arc from antagonist to reluctant ally is masterfully handled. Nina's parallel journey mirrors Tenma's without ever feeling redundant.",
      "Pacing":"9.0 — occasionally slow in middle sections but almost always purposeful. Urasawa understands that dread requires space to breathe. The slow burns pay off consistently. The Ruhenheim arc particularly requires patience that it rewards completely.",
      "Emotional Impact":"9.5 — Monster achieves something rare: it makes you feel the weight of every human life in the story. When minor characters die it matters because Urasawa gave them enough humanity to make their loss real. That is extraordinarily difficult to sustain across 162 chapters. Johan's final scene is devastating precisely because of its restraint.",
      "Consistency":"9.2 — remarkable for a 162-chapter serialized work. The thematic thread never breaks. The artistic quality never seriously dips. Monster is the rare example of a long-running manga whose best arc is its last — the finale matches the quality of the opening in a way almost no long-form narrative achieves."
    },
    arcs:[
      {name:"Tenma's Choice",rating:9.3,tags:["Opening","Moral Dilemma","Foundation"],hook:"A doctor saves a child over a politician and destroys his career.",analysis:"One of the greatest opening acts in manga. The moral dilemma established immediately with devastating clarity. Urasawa trusts the reader to sit with the discomfort. Tenma is established as genuinely good in a world that punishes goodness."},
      {name:"Investigation Arc",rating:9.2,tags:["Lunge","Nina","Mystery"],hook:"A detective who is completely wrong but completely logical.",analysis:"Lunge as antagonist is brilliant — a man whose ironclad logic leads him to precisely the wrong conclusion and he pursues it with complete commitment. The Cold War Europe setting used meaningfully. Every new character adds a layer to the central question rather than diluting it."},
      {name:"Johan's Origin Arc",rating:9.6,tags:["Johan","Revelation","Horror","Masterpiece"],hook:"The most patient revelation in manga — Johan's truth emerges across hundreds of chapters.",highlight:true,analysis:"Urasawa never over-explains. The twin experimentation, the institutional trauma, the question of which twin is which — all creates a mystery that is philosophical rather than merely plot-mechanical. Johan appears sparingly but every appearance redefines the entire narrative."},
      {name:"Ruhenheim Arc",rating:9.8,tags:["Climax","Mass Violence","Nihilism","Greatest Arc"],hook:"Johan engineers mass violence from pure nihilism in a small Austrian town.",highlight:true,analysis:"The greatest single arc in the manga. A small town becomes the stage for Johan's most ambitious act. The townspeople sketched with enough humanity that their deaths carry genuine weight. Tenma's pacifism tested to its absolute limit. The writing achieves something almost impossible — making pure evil feel real and human simultaneously."},
      {name:"Finale",rating:9.4,tags:["Resolution","Ambiguity","Complete"],hook:"The ending is deliberately ambiguous — and earns it.",analysis:"Johan's final fate left open in a way that is thematically consistent rather than evasive. Tenma's journey concludes with quiet dignity. Monster is the rare long-running manga whose best arc is its last."},
    ],
    comparisons:[
      {title:"Death Note",verdict:"Philosophy vs psychology",detail:"Both psychological thrillers with extraordinary antagonists. Death Note's L vs Light is the greatest intellectual battle in manga. Monster's Johan vs the world is the greatest philosophical battle. Monster is deeper.",color:D.amber},
      {title:"20th Century Boys",verdict:"Same author, different warmth",detail:"20CB is Urasawa's more humanly warm work. Monster is his more precisely crafted. Monster wins on almost every critical dimension. Read Monster first. Then 20CB.",color:D.amber},
    ],
    verdict:{score:9.4,line:"Johan Liebert alone makes it essential. There is no close second for greatest antagonist on this list.",full:"Monster has one advantage none of the other top tier works have — it is complete. It told its full story, asked its hardest question, and answered it honestly from beginning to end. Johan Liebert is not a villain. He is a proof — a man who set out to demonstrate that existence is meaningless, and almost succeeded.",canReachS:false}
  },
  {
    id:"reze", title:"CSM: Reze Arc", type:"Film", year:"2025", status:"Complete ✓",
    overall:9.4, hook:"The greatest anime film of 2025.", tier:"S", color:D.blue,
    tagline:"Two weapons pretending to be human — and briefly succeeding.",
    overview:{
      surface:"Chainsaw Man's theatrical debut covering the Bomb Girl arc.",
      real:"The most concentrated examination of whether performance can become genuine feeling across everything on this list.",
      deep:"Reze and Denji connect over coffee and ordinary conversation. Two people who were never allowed to be people, briefly experiencing what being people feels like. Her betrayal — following her mission — is handled with extraordinary restraint. The answer the film gives: it was real from Reze's side too. The performance became genuine. Her hesitation cost her the mission and her life. The Makima movie date scene — added by MAPPA, not in the manga — is the greatest single addition any adaptation has made to its source on this list."
    },
    scores:{Writing:8.9, Art:9.8, Themes:9.3, Twists:9.0, Characters:9.6, Pacing:9.0, "Emotional Impact":9.5, Consistency:9.2},
    scoreReasons:{
      "Writing":"8.9 — the screenplay makes several original additions beyond the manga — most notably the Makima movie date scene — that genuinely enrich the source. The structural decision to give Denji and Reze's ordinary moments real duration rather than compressing them is the correct choice and reflects genuine screenwriting intelligence. Slight deduction for minor transitional scenes feeling slightly rushed.",
      "Art":"9.8 — MAPPA's animation here is operating at the absolute ceiling of what theatrical anime can achieve in 2025. The action sequences have kinetic clarity that exceeds even the manga's equivalent pages. The character designs were modified to better reflect the manga style — a decision that pays off visually. Color and lighting design create atmosphere the weekly anime series never achieved.",
      "Themes":"9.3 — the film's central argument — that two weapons can briefly experience genuine feeling, that the experience is real even when it cannot last, that performance becomes authentic through sustained commitment — is delivered with complete coherence from first frame to last. The Makima date scene crystallizes this with the precision of great filmmaking.",
      "Twists":"9.0 — Reze's hesitation and death function as the film's central twist — the performance became genuine, and that cost her everything. The Makima movie date scene functions as a thematic twist — revealing the gap between recognizing emotion and being capable of genuine feeling. Both are handled with restraint that amplifies rather than diminishes their impact.",
      "Characters":"9.6 — Denji and Reze's relationship is given space the manga's serialization format could not provide. The film makes their connection feel genuinely earned across its duration. The Makima additions deepen her character significantly. Angel Devil and Beam receive expanded roles that add genuine depth rather than padding.",
      "Pacing":"9.0 — the deliberate first half building to an explosive second half is the correct structural decision for this specific story. The restraint in the first half — choosing character over spectacle — is the greatest single directorial decision. Slight deduction for the transition between quiet and explosive halves feeling occasionally abrupt.",
      "Emotional Impact":"9.5 — Reze's death, the Makima date scene, the final image — all devastating and earned. The film achieves the bittersweet register of its source material completely — not tragedy exactly, not romance exactly, something in between that has no clean genre name. Yonezu and Utada's music elevates every emotional beat.",
      "Consistency":"9.2 — the film maintains its thematic and tonal register from opening to closing with complete discipline. No scene feels tonally inconsistent with what surrounds it. The addition of new scenes (Makima date) feels like it belonged in the original rather than feeling grafted on."
    },
    arcs:[
      {name:"First Act — Connection",rating:9.6,tags:["Coffee Shop","Ordinary","Warmth"],hook:"Two broken people attempting something ordinary.",highlight:true,analysis:"The film's greatest achievement over the manga — it gives Denji and Reze's ordinary moments the space they deserve. Weekly serialization meant those moments were always compressed. The film breathes where the manga moved. MAPPA did not race through the first half."},
      {name:"Makima Date Scene",rating:10.0,tags:["Original","Makima","Devastating","Added by MAPPA"],hook:"She can recognize genuine emotion while being constitutionally incapable of honoring it.",highlight:true,analysis:"Not in the manga. Added by the film. Makima takes Denji to a movie marathon — both cry at the final film. Makima tells Denji he has a heart capable of feeling. This scene — created by MAPPA — is the greatest single addition any adaptation has made to source material on this list. It transforms the Makima dynamic into something even more precise and tragic."},
      {name:"Betrayal and Ending",rating:9.4,tags:["Reze","Hesitation","Cost"],hook:"The performance became genuine. That is why it cost her everything.",analysis:"Reze's hesitation during her mission costs her life. Fujimoto's answer — rendered with full cinematic weight by MAPPA — is that genuine feeling emerged from what was supposed to be performance. The ending's bittersweet register is maintained with complete consistency."},
    ],
    comparisons:[
      {title:"DS: Infinity Castle P1",verdict:"Art vs substance",detail:"Infinity Castle scores 9.9 for animation — higher than Reze Arc's 9.8. But Reze Arc scores 9.5 for emotional impact, 9.3 for themes. Infinity Castle scores 8.3 and 6.5 respectively. Reze Arc is a film. Infinity Castle is a spectacular fragment.",color:D.amber},
    ],
    verdict:{score:9.4,line:"Reze deserved the big screen. MAPPA gave it to her.",full:"The Reze arc was always the greatest argument for Chainsaw Man's place among the greatest works in its medium. MAPPA took that argument and put it on the largest possible screen with the finest animation their studio has produced, framed by Yonezu and Utada, and delivered it with the emotional restraint the story always deserved. One of the greatest anime films ever made.",canReachS:false}
  },

  // ── A TIER ──
  {
    id:"bb", title:"Breaking Bad", type:"TV", year:"2008", status:"Complete ✓",
    overall:9.2, hook:"Zero significant quality drop across five seasons.", tier:"S", color:D.blue,
    tagline:"I did it for me. I liked it. I was good at it. And I was really alive.",
    overview:{
      surface:"A chemistry teacher becomes a drug kingpin.",
      real:"A meticulous documentation of how a defensible position corrupts into pure megalomaniacal power worship without the person ever noticing the transition.",
      deep:"Walter White and Light Yagami are essentially the same character in different settings. Both start with a genuinely defensible moral position. Both documents the gap between self-justification and reality with surgical precision. Breaking Bad wins over Death Note because its supporting cast is significantly deeper and its pacing more consistent throughout. The finale's single greatest moment: 'I did it for me.' One sentence recontextualizing five seasons."
    },
    scores:{Writing:9.2, Art:8.0, Themes:9.5, Twists:9.0, Characters:9.4, Pacing:9.2, "Emotional Impact":9.3, Consistency:9.2},
    scoreReasons:{
      "Writing":"9.2 — Vince Gilligan's plotting is among the most precise in television history. Seeds planted in season 1 pay off in season 5. Character decisions emerge from established psychology rather than plot convenience. The show knows exactly what it is about and never loses that thread — a man who convinces himself his destructive actions are justified and gradually becomes the monster he claimed to fight.",
      "Art":"8.0 — Breaking Bad is visually accomplished — the New Mexico landscape used expressively, the color symbolism (Walter's color shift from blue to dark), the composition during key character moments — but not in the same category as the manga works on this list for pure visual artistry. Television craft at a high level rather than visual storytelling as primary language.",
      "Themes":"9.5 — the central thesis is pursued with extraordinary discipline: a man with a genuinely defensible starting position corrupts into pure megalomaniacal power worship without ever noticing the transition. The show is fundamentally about the gap between self-justification and reality — and it maintains that examination across five seasons without simplifying it.",
      "Twists":"9.0 — Hank finding the book. Walt poisoning Brock. Walt letting Jane die. These are not traditional plot twists but reveals of what Walt has already done — and they function as devastating character twists. The finale's greatest moment: 'I did it for me. I liked it. I was good at it. And I was really alive.' One sentence recontextualizing five seasons of self-justification.",
      "Characters":"9.4 — Walter White's complete psychological portrait is the most precisely documented moral deterioration on this list. Jesse Pinkman's arc — from comic relief to moral conscience — is equally extraordinary. Hank, Skyler, Saul, Mike — each fully realized. The supporting cast depth is significantly greater than Death Note, JJK or most works on this list.",
      "Pacing":"9.2 — the show's most underrated quality. It earns its slow moments completely. The pilot establishes tone and character with extraordinary efficiency. Each season escalates with discipline. No arc overstays its welcome. The finale dedicates appropriate time to each character's resolution without feeling rushed or padded.",
      "Emotional Impact":"9.3 — Jane's death. Jesse's breakdown after Jane. Hank's death. Walt's final phone call to Skyler. The emotional peaks are devastating because they are completely earned through patient character investment. The show makes you feel the cost of Walter's choices through their impact on people you genuinely care about.",
      "Consistency":"9.2 — zero significant quality drop across five seasons. This is extraordinarily rare in television. Season 4 is the peak but every season operates at high quality. The slight deduction is for a handful of filler episodes in seasons 2 and 3 that slow momentum without equivalent character payoff."
    },
    arcs:[
      {name:"Season 1",rating:8.8,tags:["Foundation","Walt","Cancer"],hook:"A man who has never had a choice discovering he can make one.",analysis:"Tight, focused, brilliantly written. Character establishment exceptional. Short season but almost zero wasted time. The premise is simple but executed with real craft."},
      {name:"Season 2",rating:8.6,tags:["Jesse","Transformation","Flash-forward"],hook:"The flash-forward structure adds tension throughout — we know something terrible is coming.",analysis:"Deeper psychological exploration of Walt's transformation. The flash-forward structure is patient and earns its payoff. Pacing occasionally slow but deliberately so."},
      {name:"Season 3",rating:9.1,tags:["Gus","Hank","Escalation"],hook:"The show truly hits its stride here.",analysis:"Gus Fring fully emerging is the season's greatest gift. Walt's moral descent accelerating. Writing is razor sharp. Almost no weak episodes."},
      {name:"Season 4",rating:9.6,tags:["Masterpiece","Gus vs Walt","Greatest Season"],hook:"Surgical precision from episode one to the finale.",highlight:true,analysis:"Arguably one of the greatest single seasons in television history on pure craft. Every episode builds with surgical precision. Gus vs Walt is one of the best rivalries ever written. The finale is near perfect."},
      {name:"Season 5",rating:9.1,tags:["Heisenberg","Finale","Complete"],hook:"'Say my name' is earned dramatically, not just cool dialogue.",analysis:"Walt at full Heisenberg. The finale is satisfying and coherent — characters get resolutions consistent with their arcs. An emotionally honest ending that doesn't betray what came before. One of the greatest series finales ever made."},
    ],
    comparisons:[
      {title:"Death Note",verdict:"Same story, different medium",detail:"Both document a man convincing himself his destructive actions are justified and gradually becoming the monster he claimed to fight. Breaking Bad wins on supporting cast depth and pacing consistency.",color:D.amber},
      {title:"Game of Thrones",verdict:"Consistency is everything",detail:"Both start at similar peak quality. GOT collapses. Breaking Bad never does. That single difference explains the gap between 9.2 and 7.0.",color:D.purple},
    ],
    verdict:{score:9.2,line:"The most consistent long-form work in western television.",full:"Breaking Bad is doing something no other work in western television fully achieves — maintaining complete character consistency across five seasons of escalating darkness while never losing the audience's engagement. Walter White's complete psychological portrait is the most precisely documented moral deterioration in television. The ending earns every moment of its conclusion.",canReachS:false}
  },
  {
    id:"aot-manga", title:"AOT", type:"Manga", year:"2009", status:"Complete ✓",
    overall:9.2, hook:"The show that made you root for a genocide without realizing it.", tier:"S", color:D.text,
    tagline:"Season 1 asked: can humanity survive? Season 4 revealed: humanity was never the victim.",
    overview:{
      surface:"Humanity fights titans behind massive walls.",
      real:"A story that used your own genre expectations as the mechanism of its moral lesson — the unrecognizability of Season 4 IS the message.",
      deep:"In Season 1 the titans were monsters. In Season 4 Eren's titans flatten a city of innocent civilians and you feel the same horror — but this time aimed at the character you spent three seasons wanting to win. Isayama made you feel toward Eren exactly what Marleyans felt toward Eldians. He used your own narrative conditioning against you to demonstrate exactly how dehumanization works. That is not a plot twist. That is the entire point of the story revealed."
    },
    scores:{Writing:8.9, Art:8.5, Themes:9.3, Twists:9.7, Characters:8.8, Pacing:8.8, "Emotional Impact":9.2, Consistency:8.2},
    scoreReasons:{
      "Writing":"8.9 — Isayama's plotting in the first half is extraordinary — seeds planted in chapter 1 pay off after 100 chapters with discipline that rivals Urasawa. The Marley arc's perspective shift and moral inversion are writing decisions of the highest courage. Chapter 139's handling of Eren's motivation — revealed too late, too quickly — prevents a higher score.",
      "Art":"8.5 — Isayama's art starts rough and improves dramatically across the manga's run. By the Marley arc his panel composition and character expressiveness are genuinely impressive. Never reaches Miura or Inoue level but becomes more than sufficient as storytelling instrument. The titan designs are iconic and original. Survey Corps ODM gear sequences have spatial coherence few action mangaka match.",
      "Themes":"9.3 — the cycle of hatred, the dehumanization of the other, the impossibility of freedom through violence, the way oppressed peoples become oppressors — these themes are handled with genuine moral seriousness. The manga never allows the reader a comfortable moral position. Marley is evil. Paradis is sympathetic. Then Marley is sympathetic. Then Paradis commits genocide. The discomfort is intentional and correct.",
      "Twists":"9.7 — the greatest plot twist architecture on this list. No work plants seeds as far in advance and pays them off as completely. Reiner and Bertholdt's reveal was seeded from episode one. The basement recontextualizes the entire manga retroactively. The Marley perspective shift functions as a moral twist — changing not what happened but what it means. Eren's future sight is the most ambitious long-term construction.",
      "Characters":"8.8 — Reiner Braun's complete arc is the most psychologically honest portrayal of trauma-induced identity fracture in manga — potentially the greatest individual character arc on this list after Thorfinn. Hange, Levi, Historia, Armin all undergo genuine transformation. The weakness: Historia after the Uprising arc essentially disappears, and Sasha's death lands emotionally but her character was never truly deep.",
      "Pacing":"8.8 — mostly excellent. The Uprising arc pacing is debated but justified by the character work it enables. The Marley arc moves with remarkable efficiency given its tonal shift. The final arc occasionally rushes where it should breathe — particularly the resolution of Hange's leadership and several character deaths that deserved more space.",
      "Emotional Impact":"9.2 — Erwin's death. Sasha's death. The basement reveal. Eren's conversation with Armin in chapter 131. These moments hit with devastating force because Isayama spent years building the relationships that make them matter. The Marley arc's emotional peak — Reiner's rooftop conversation with Eren — is the most quietly devastating scene in the manga.",
      "Consistency":"8.2 — strong throughout with chapter 139 being the only significant stumble. However chapter 139 is a real stumble — not GOT-level collapse but a genuine thematic contradiction that costs consistency points. The Historia pregnancy subplot goes unresolved. The quality trajectory is actually upward through most of the manga — only the very end disappoints."
    },
    arcs:[
      {name:"Clash of Titans Arc",rating:9.0,tags:["Reiner","Reveal","Inversion"],hook:"The greatest single chapter moment in the manga — and it was hiding in plain sight.",analysis:"Reiner and Bertholdt's reveal recontextualizes everything before it. The conversation between Eren and his former friends across the wall is devastating and morally complex. Nobody is simply a villain. The writing suddenly operates at a completely different level."},
      {name:"Uprising Arc",rating:9.2,tags:["Politics","Historia","Kenny"],hook:"Abandons titans entirely and becomes a political thriller.",analysis:"The boldest arc in the manga to this point. Historia's arc is the best individual character work in the manga. Kenny Ackerman is the most interesting antagonist since the Female Titan. Isayama demonstrates genuine range."},
      {name:"Return to Shiganshina",rating:9.5,tags:["Basement","Revelation","Masterpiece"],hook:"The basement recontextualizes the entire manga retroactively.",highlight:true,analysis:"Peak Attack on Titan. The revelation that the outside world exists, Eldians are the persecuted race, Marley is the true geopolitical power — recontextualizes everything. Armin vs Erwin's survival choice is one of the most emotionally brutal decisions in manga."},
      {name:"Marley Arc",rating:9.4,tags:["Perspective Shift","Reiner","Courage"],hook:"We experience Eren's attack from the Marleyan perspective — and it is terrifying.",analysis:"The single most courageous narrative decision in the manga. Complete perspective shift to Marley. Reiner as the new protagonist. The moral complexity reaches its absolute peak here."},
      {name:"Final Chapter 139",rating:6.5,tags:["Controversial","Rushed","Determinism"],hook:"138 chapters of human agency — then fate wins.",analysis:"The most contested ending on this list. Eren's motivation reveal — that he orchestrated everything to give his friends the glory of saving the world — feels narratively convenient rather than earned. The thematic contradiction: AOT argued for human agency against fate for 138 chapters and revealed in chapter 139 that fate won. Idea is correct. Execution is the failure."},
    ],
    comparisons:[
      {title:"Vinland Saga",verdict:"Ending makes the difference",detail:"Both deal with cycles of violence. Vinland Saga's ending deepens its thesis. AOT's chapter 139 partially contradicts its. That single chapter is most of the distance between 9.7 and 9.2.",color:D.amber},
      {title:"Breaking Bad",verdict:"TV vs manga corruption",detail:"Both document how idealists become perpetrators. Breaking Bad's Walt is more precisely documented. AOT's Eren is more structurally ambitious. Both are essential studies of the same human failure.",color:D.amber},
    ],
    verdict:{score:9.2,line:"The greatest twist architecture on this list — attached to a chapter 139 that partially contradicts its own thesis.",full:"AOT is a manga that deserved a 9.5 ending and received a 6.5 ending — and the distance between those two numbers is the entire story of why it sits at 9.2 instead of competing with Berserk and Monster at the very top. The ambition was there. The architecture was there. The final execution was not.",canReachS:false}
  },
  {
    id:"slam-dunk", title:"Slam Dunk", type:"Manga", year:"1990", status:"Complete ✓",
    overall:9.1, hook:"A sports manga that transcends its genre so completely the label becomes irrelevant.", tier:"S", color:D.blue,
    tagline:"Hanamichi Sakuragi's growth arc is one of the most emotionally satisfying journeys in manga.",
    overview:{
      surface:"A delinquent discovers basketball and falls for a girl who likes the sport.",
      real:"A story about the transformative power of genuine passion — discovering not just what you love but that you are capable of loving something completely.",
      deep:"Inoue before Vagabond — proving his emotional craft was always there. The Nationals arc is among the greatest sequences in manga history. What makes Slam Dunk extraordinary is what makes all great sports fiction extraordinary — it uses competition as a mirror for human growth. Sakuragi's journey from delinquent who joins a club for a girl to a player who genuinely loves the game is handled with patience and honesty."
    },
    scores:{Writing:8.9, Art:9.0, Themes:8.5, Twists:8.0, Characters:9.2, Pacing:9.2, "Emotional Impact":9.3, Consistency:9.2},
    scoreReasons:{
      "Writing":"8.9 — Inoue's narrative discipline in constructing Sakuragi's growth arc is exceptional. The Nationals arc particularly demonstrates plotting intelligence — every game beat earns its emotional weight through patient setup. The storytelling economy is remarkable for a sports manga of this length.",
      "Art":"9.0 — Inoue before Vagabond, already demonstrating extraordinary expressive range. The game sequences have kinetic energy and spatial coherence that set the standard for sports manga. Facial expressiveness during peak moments — Sakuragi's injury, Rukawa's determination — conveys character depth that dialogue alone could not.",
      "Themes":"8.5 — Slam Dunk is about discovering genuine passion and whether a person can be transformed by encountering something they love completely. Lighter thematically than the top tier works but executed with honesty. Sakuragi's transformation is not a power fantasy — it is a portrait of what happens when someone who has never cared about anything finally cares.",
      "Twists":"8.0 — Mitsui's return is one of the great dramatic reveals in sports manga. Sakuragi's injury in the Nationals is the narrative twist that makes the emotional climax possible — subverting the expectation of heroic triumph with something more honest and more devastating. Not the most twist-dense work on this list but the twists that exist are perfectly placed.",
      "Characters":"9.2 — Sakuragi's complete arc from delinquent to genuine player is one of the most emotionally satisfying character journeys in manga. The ensemble — Rukawa, Akagi, Miyagi, Mitsui — are individually compelling rather than interchangeable. Coach Anzai's influence is handled with restraint that makes it more affecting than explicit mentorship would be.",
      "Pacing":"9.2 — the game sequences move with genuine athletic rhythm. The early comedic sections establish character efficiently before the dramatic stakes arrive. The Nationals arc in particular is paced with the discipline of the very best dramatic writing — accelerating and decelerating exactly when it should.",
      "Emotional Impact":"9.3 — the Nationals arc climax and Sakuragi's injury are among the most emotionally complete sports sequences in manga history. The final game's conclusion — quiet, costly, honest — hits harder than any triumphant victory could because Inoue has spent the entire manga building toward this specific kind of defeat.",
      "Consistency":"9.2 — remarkably even across its full run. The early comedic tone integrates naturally into the later dramatic material. No arc collapses or betrays what preceded it. The ending honors everything Inoue built with complete thematic integrity."
    },
    arcs:[
      {name:"Introduction / Early Games",rating:8.5,tags:["Sakuragi","Comedy","Foundation"],hook:"A delinquent who joins basketball for the worst reason discovers it for the best one.",analysis:"Sakuragi's comedy and Rukawa's cool establish the central dynamic. Inoue uses humor to build genuine attachment before the emotional stakes arrive."},
      {name:"Interhigh Prelims",rating:8.9,tags:["Growth","Team","Stakes"],hook:"The team begins becoming the team.",analysis:"Where the ensemble truly coalesces. Each player's individual story deepens. Mitsui's return is one of the great dramatic reveals in sports manga."},
      {name:"Nationals Arc",rating:9.6,tags:["Masterpiece","Sakuragi","Climax"],hook:"Hanamichi Sakuragi's final game is the most emotionally devastating sports sequence in manga.",highlight:true,analysis:"Among the greatest sequences in manga history. The final game against Sannoh — a team so dominant they shouldn't be beatable — is constructed with the precision of the very best dramatic writing. Sakuragi's injury and his continued play is one of the most affecting character moments in manga. Complete emotional honesty."},
    ],
    comparisons:[
      {title:"Vagabond",verdict:"Same artist, different medium",detail:"Slam Dunk shows Inoue's emotional craft before Vagabond showed his philosophical depth. Both are extraordinary. Vagabond is the greater work. Slam Dunk is the more immediately joyful one.",color:D.amber},
    ],
    verdict:{score:9.1,line:"The Nationals arc alone places it in conversations about the greatest sequences in manga history.",full:"Slam Dunk is the greatest sports manga ever made and one of the most emotionally complete manga in any genre. Inoue's control of character growth, the pacing of the Nationals arc, and the devastating honesty of Sakuragi's final game constitute a creative achievement that most manga never approach.",canReachS:false}
  },
  {
    id:"dn-manga", title:"Death Note", type:"Manga", year:"2003", status:"Complete ✓",
    overall:9.0, hook:"The greatest intellectual battle ever written in manga.", tier:"S", color:D.blue,
    tagline:"Light Yagami: a man who started with a defensible position and never noticed himself becoming the monster.",
    overview:{
      surface:"A genius student finds a supernatural notebook that kills anyone whose name is written in it.",
      real:"What happens when a human being is given the power of god? The answer is consistent and honest throughout: they become a monster, regardless of initial intentions.",
      deep:"Light Yagami is the most interesting protagonist on this list after Griffith. He starts with a genuinely defensible moral position — the world would be better with fewer violent criminals — and the manga meticulously documents how that position corrupts into pure megalomaniacal power worship without Light ever noticing the transition. That is sophisticated psychological writing. L is equally extraordinary — unconventional, brilliant, morally ambiguous himself."
    },
    scores:{Writing:9.2, Art:9.5, Themes:9.0, Twists:9.3, Characters:8.8, Pacing:8.5, "Emotional Impact":8.8, Consistency:8.2},
    scoreReasons:{
      "Writing":"9.2 — Ohba's plotting in the first half is extraordinary — the L vs Light chess match is constructed with surgical precision where both players are written at genuine maximum intelligence. The second half loses some of this precision but the overall plotting discipline remains high. The central conceit — supernatural murder weapon as vehicle for exploring justice and power — is used with genuine intelligence throughout.",
      "Art":"9.5 — Obata is one of the greatest manga artists alive and Death Note showcases him at his peak. The character designs are iconic — L's posture, Light's expressions, Ryuk's design. The visual storytelling during the intellectual battles is extraordinary — Obata conveys thought, deception and revelation through facial expressions with unmatched precision. Panel composition is consistently cinematic.",
      "Themes":"9.0 — Death Note asks what happens when a human being is given the power of god. The answer is consistent and honest throughout: they become a monster regardless of initial intentions. The justice vs murder distinction, the question of whether ends justify means, and the examination of how power corrupts absolute conviction are handled seriously throughout.",
      "Twists":"9.3 — L's identity reveal, the Kira trap setups, Light regaining his memories — all handled with genuine craft. L's death is the greatest single twist moment on this list in terms of immediate emotional impact. The twists in the L arc are intellectually constructed — they recontextualize the chess match rather than the characters. Near's final trap is slightly more convenient by comparison.",
      "Characters":"8.8 — Light Yagami is one of the greatest protagonists in manga — not because he is likeable but because his psychology is so precisely rendered. His narcissism, his genuine belief in his own righteousness, his gradual total moral corruption — all handled with complete consistency. L is equally extraordinary. The weakness is the second half cast — Near and Mello never achieve the depth of L and Light individually.",
      "Pacing":"8.5 — the L arc is paced with near perfection. The second half loses momentum during the Yotsuba corporate arc and some Near/Mello sections feel stretched. The finale is appropriately paced. Overall strong but the gap between the L arc's pacing and the second half's is noticeable.",
      "Emotional Impact":"8.8 — L's death hits harder than almost anything on this list because it is so completely earned and so completely the result of Light's choices. The final pages of Light's death — pathetic, desperate, begging — are genuinely affecting despite his total unsympathetic state. Light eating a chip while writing in the Death Note is the most iconic image of character hubris in manga.",
      "Consistency":"8.2 — the clear quality gap between first and second half is real and costs consistency points. The second half is still good manga — it just follows extraordinary manga, which makes the dip more noticeable. The ending maintains thematic integrity even as plot mechanics become slightly more convenient."
    },
    arcs:[
      {name:"L vs Light Arc",rating:9.7,tags:["Masterpiece","L","Greatest Duel"],hook:"The greatest sustained intellectual battle in manga history.",highlight:true,analysis:"Peak Death Note. Every chapter is a chess match where both players are operating at maximum capacity. L is extraordinary — the conventional detective tropes completely inverted. The tension is almost unbearable because both characters are written with equal intelligence and neither is allowed to be stupid for plot convenience. L's death is devastating precisely because it is completely earned."},
      {name:"Yotsuba Arc",rating:7.8,tags:["Weakness","Slower","Necessary"],hook:"Light without his memories is a less interesting character — and the manga knows it.",analysis:"The most significant weakness in the manga. Introducing the corporate Kira users dilutes the central tension considerably. Necessary structurally but executed with less brilliance than what surrounds it."},
      {name:"Near & Mello Arc",rating:8.0,tags:["Successors","Finale","Divisive"],hook:"Near and Mello together achieve what L could not alone — because neither is L.",analysis:"Near and Mello are individually weaker characters than L. The manga essentially acknowledges this by having them work together. The finale is dramatically satisfying even if the path there is uneven. Light's death — pathetic, desperate, begging — is exactly the correct ending for this story."},
    ],
    comparisons:[
      {title:"Monster",verdict:"Psychological vs philosophical",detail:"Both psychological thrillers. Death Note's L arc is the greatest intellectual battle in manga. Monster's Johan is the greater villain philosophically. Monster is deeper. Death Note is more immediately thrilling.",color:D.text},
      {title:"Breaking Bad",verdict:"Same corruption arc",detail:"Walter White and Light Yagami are essentially the same character in different settings. Breaking Bad wins on supporting cast and pacing. Death Note wins on visual craft and the L dynamic.",color:D.amber},
    ],
    verdict:{score:9.0,line:"Death Note is not quite Monster. And knowing the difference between a 9.0 and a 9.4 requires being honest about what each work achieves.",full:"Death Note at 9.0 is a genuine masterwork that falls just short of the absolute top tier — primarily because of its second half inconsistency and the thematic ceiling being slightly lower. But within its specific goals it executes at near maximum possible quality for the first half. The L vs Light arc specifically is as good as anything on this entire list.",canReachS:false}
  },
  {
    id:"fmab", title:"FMAB", type:"Anime", year:"2009", status:"Complete ✓",
    overall:9.0, hook:"The gold standard for narrative completion in anime.", tier:"S", color:D.blue,
    tagline:"The most narratively complete and satisfying anime ever concluded — nothing is wasted.",
    overview:{
      surface:"Two brothers seek the Philosopher's Stone to restore their bodies after a failed ritual.",
      real:"An examination of the cost of playing god, the nature of equivalent exchange, and whether good intentions justify destructive means.",
      deep:"FMAB is doing something rare in long-form anime — it planned its ending from the beginning and executed every element of that plan. The transmutation circle reveal — the entire country as a ritual — is genuinely staggering in implication and was seeded from very early chapters. Every Homunculus arc, every political thread, every character relationship pays off with precision that demands genuine respect."
    },
    scores:{Writing:8.8, Art:8.5, Themes:9.0, Twists:9.0, Characters:8.7, Pacing:9.0, "Emotional Impact":8.9, Consistency:9.0},
    scoreReasons:{
      "Writing":"8.8 — Arakawa planned her ending from the beginning and executed every element of that plan with remarkable discipline. Every subplot pays off. Every character introduced serves a purpose. The transmutation circle reveal — the entire country as a ritual — is planted from early chapters. The slight deduction is for some middle arc pacing and villain development that is competent but not exceptional.",
      "Art":"8.5 — Arakawa's artwork is clear, expressive and emotionally effective — exactly what the story requires. Not in the same category as the manga art masters on this list but consistently excellent as a storytelling instrument. The action sequences are spatially coherent. Character expressiveness during emotional peaks — Hughes' funeral, Ed's sacrifice — is genuinely powerful.",
      "Themes":"9.0 — FMAB is examining the cost of playing god, the nature of equivalent exchange, and whether good intentions justify destructive means. Father's philosophy — consuming everything to become perfect — is the thematic inverse of Ed's journey toward accepting human limitation. The examination of how ambition corrupts is handled with more nuance than the shonen genre typically attempts.",
      "Twists":"9.0 — the transmutation circle reveal is one of the greatest single twist moments on this list — staggering in implication and seeded from early. Father's true nature, the Homunculi origins, Ed's sacrifice — all foreshadowed with discipline and thematically coherent. FMAB's twist architecture is not as complex as AOT's but is more consistently executed across the full work.",
      "Characters":"8.7 — Ed and Al's brotherhood is the emotional core and it is handled with genuine warmth and honesty. Roy Mustang's arc from ambition to genuine leadership is well constructed. The Homunculi as embodiments of rejected sins is philosophically coherent. The slight deduction is for some supporting characters — particularly some military figures — who remain functional rather than truly deep.",
      "Pacing":"9.0 — the show's greatest technical strength. Every arc has purpose. No subplot overstays its welcome. The escalation from small-scale alchemy mysteries to global conspiracy is handled with discipline. The finale allocates appropriate time to each character's resolution without feeling rushed or padded.",
      "Emotional Impact":"8.9 — Hughes' death is one of the most effective emotional moments in anime. Ed's final sacrifice and its resolution is emotionally honest. The show generates genuine investment in its characters and pays off that investment with a conclusion that honors them. Slightly below the top tier works because the emotional peaks, while well constructed, don't carry the same weight of years of accumulated dread.",
      "Consistency":"9.0 — the most consistent anime on this list. No arc seriously dips. The tone shifts from adventure to tragedy to resolution are handled with complete discipline. The ending matches the quality of the beginning in a way most long-form anime never achieves."
    },
    arcs:[
      {name:"Ishval / Hughes Arc",rating:9.2,tags:["Tragedy","Hughes","War Crime"],hook:"Hughes' death is the emotional peak that proves this show will not protect anyone.",highlight:true,analysis:"The most emotionally complete stretch of the early series. Hughes' death lands because Arakawa spent sufficient time making him irreplaceable before removing him. The Ishval flashbacks recontextualize the entire political framework."},
      {name:"Father / Homunculi Arc",rating:8.9,tags:["Villain","Philosophy","Scale"],hook:"Father's desire to become a perfect being — and what that costs him.",analysis:"The Homunculi as embodiments of Father's rejected sins is philosophically coherent. Father himself is a compelling antagonist — not as interesting as Johan or Griffith but fulfilling his role with complete internal logic."},
      {name:"Finale",rating:9.3,tags:["Complete","Earned","Satisfying"],hook:"Everything pays off. Nothing is wasted.",highlight:true,analysis:"One of the greatest series finales in anime. Every plot thread resolved. Every character arc concluded consistently. Ed's sacrifice and its resolution is emotionally honest. The ending earns its sentiment completely."},
    ],
    comparisons:[
      {title:"AOT Anime",verdict:"Completion vs ambition",detail:"FMAB is the most narratively complete anime on this list. AOT is the most thematically ambitious. FMAB's ending is excellent. AOT's ending is divisive. Completion wins for overall satisfaction.",color:D.text},
    ],
    verdict:{score:9.0,line:"A story that knew where it was going and got there without losing anything essential.",full:"FMAB represents a standard of narrative craft that most anime never reaches — complete thematic consistency, no wasted arcs, no character betrayals, and an ending that honors everything that preceded it. It is the most complete anime on this list and the best argument that completion is itself a form of artistic excellence.",canReachS:false}
  },
  {
    id:"aot-anime", title:"AOT Anime", type:"Anime", year:"2013", status:"Complete ✓",
    overall:9.0, hook:"Wit Studio's seasons represent animation at its absolute ceiling.", tier:"S", color:D.text,
    tagline:"Season 3 Part 2 has no equal in animated television.",
    overview:{
      surface:"The manga adaptation across four seasons and two studios.",
      real:"One of the greatest manga adaptations ever produced — with Wit Studio's final seasons constituting a genuine masterpiece of direction.",
      deep:"Hiroyuki Sawano's score elevates every scene it accompanies. The charge of the Survey Corps is one of the greatest single sequences in anime history. The transition from Wit to MAPPA in Season 4 is jarring but MAPPA handles the Marley arc with genuine respect for the source material. The anime's emotional peaks — particularly Season 3 Part 2 — exceed even the manga's equivalent moments through the addition of performance, music and motion."
    },
    scores:{Writing:8.9, Art:9.2, Themes:9.3, Twists:9.5, Characters:9.0, Pacing:8.6, "Emotional Impact":9.4, Consistency:8.6},
    scoreReasons:{
      "Writing":"8.9 — faithful and intelligent adaptation of exceptional source material. The screenplay adds nothing unnecessary and removes nothing essential. Smart visual solutions to internal monologue scenes that the manga handles through text. The slight deduction is for the final arc where the anime cannot fix the source material's chapter 139 problems.",
      "Art":"9.2 — Wit Studio's seasons are animation as a serious art form at its absolute ceiling. Season 3 Part 2 has no equal in animated television for pure direction quality. The charge of the Survey Corps is one of the greatest single sequences in anime history. MAPPA's Season 4 maintains quality while the visual style shift from Wit is jarring initially but becomes appropriate.",
      "Themes":"9.3 — all of the manga's thematic achievement translates directly. The Marley arc's moral inversion hits just as hard in animation — arguably harder because the voice acting adds an additional layer of human complexity to Reiner's psychological fracture and the civilians' humanity.",
      "Twists":"9.5 — the anime's twists land with the added weight of sound, music and performance. Sawano's score during the basement reveal is one of the greatest single music cues in anime history. The Reiner and Bertholdt reveal is arguably more devastating in animation than in the manga because we have spent 40 episodes hearing their voices.",
      "Characters":"9.0 — the voice cast across both studios is exceptional. Reiner's voice actor delivers the definitive performance of the series. The rooftop scene between Reiner and Eren in Season 4 — both actors giving career-defining performances — is the single greatest scene in the anime and arguably exceeds the manga equivalent.",
      "Pacing":"8.6 — the anime occasionally pads with recap episodes and some arcs feel slightly stretched across episode counts. Season 4 Part 2 in particular compresses material that needed more space. Overall strong but the manga's pacing is slightly tighter.",
      "Emotional Impact":"9.4 — the emotional peaks of the manga are amplified by music, performance and animation. Erwin's death sequence with Sawano's score is the most emotionally overwhelming single sequence in anime. Season 3 Part 2 as a complete unit is the most sustained emotional achievement in animated television.",
      "Consistency":"8.6 — Wit seasons are remarkably consistent. The Studio transition to MAPPA introduces some visual inconsistency particularly in Season 4 Part 2 where animation quality varies significantly between episodes. The final arc inherits the source material's chapter 139 problems unchanged."
    },
    arcs:[
      {name:"Season 1 (Wit)",rating:9.0,tags:["Foundation","Titans","Sawano"],hook:"The ODM gear sequences set a standard animated action had never seen.",analysis:"Excellent adaptation. The titan designs translate powerfully. Sawano's score is one of the greatest in anime history. Faithful to the manga with smart visual additions."},
      {name:"Season 2 (Wit)",rating:9.4,tags:["Reiner","Reveal","Masterpiece"],hook:"12 episodes. Zero wasted minutes. The greatest reveal in anime history.",highlight:true,analysis:"Season 2 is where AOT anime separates itself from every other action anime. 12 episodes with the density of 25. The Reiner and Bertholdt reveal in Episode 4 is the single greatest twist execution in the anime — 40 episodes of friendship weaponized as devastation. The voice acting in that rooftop conversation is career-defining. Sasha's village episode is the finest standalone character episode in the first two seasons. Erwin's suicidal charge into the titan horde redefines what heroism looks like in this world. The finale's Coordinate awakening closes the season with more open questions than answers — exactly the right choice."},
      {name:"Season 3 Part 2 (Wit)",rating:9.6,tags:["Masterpiece","Basement","Erwin"],hook:"The greatest single season of anime on this entire list.",highlight:true,analysis:"The Shiganshina battle, the basement reveal, the Erwin vs Armin choice — all executed at maximum possible quality. Wit Studio's final AOT season is a genuine masterpiece of animation direction. The charge of the Survey Corps is one of the greatest single sequences in anime history."},
      {name:"Season 4 (MAPPA)",rating:9.2,tags:["Marley","Reiner","Studio Change"],hook:"The rooftop conversation between Reiner and Eren is the best single scene in the anime.",analysis:"Studio transition handled remarkably well. The Marley arc translates powerfully. Both voice actors deliver career-defining performances in that rooftop scene. The visual style shift is jarring initially but becomes appropriate for the darker tone."},
    ],
    comparisons:[
      {title:"Monster Anime",verdict:"Different adaptation excellence",detail:"Both are exceptional manga adaptations. Monster Anime is more faithful. AOT Anime has higher production peaks. Season 3 Part 2 has no equivalent in Monster's adaptation. Both are essential.",color:D.text},
    ],
    episodes:[
      // ── SEASON 1 ──
      {ep:"S1E1",title:"To You, in 2000 Years",type:"PREMIERE",score:9.5,exp:9.8,verdict:"One of the greatest anime premieres ever made. The wall breach, the colossal titan, Eren's mother — all in 24 minutes. Sawano's score announces immediately that this is a different kind of show."},
      {ep:"S1E2",title:"That Day",type:"MYTHOLOGY/LORE",score:8.2,exp:8.0,verdict:"Necessary exposition handled with efficiency. Establishes the Survey Corps, the walls, the political structure. Functional but the tension of the premiere hasn't fully settled yet."},
      {ep:"S1E3",title:"A Dim Light Amid Despair",type:"CHARACTER STUDY",score:8.0,exp:7.8,verdict:"Training arc begins. Character introductions handled well. Mikasa and Armin's dynamic established. Standard setup episode elevated by the quality of what surrounds it."},
      {ep:"S1E4",title:"The Night of the Closing Ceremony",type:"CHARACTER STUDY",score:8.3,exp:8.1,verdict:"Graduation night. The 104th's final rankings and the choices they make about their futures. Jean and Eren's conflict begins. The class dynamic is fully established here."},
      {ep:"S1E5",title:"First Battle",type:"ACTION/SET PIECE",score:8.8,exp:8.9,verdict:"The Trost breach. ODM gear in real combat for the first time. The gap between training and reality made viscerally present. First significant character death hits hard."},
      {ep:"S1E6",title:"The World the Girl Saw",type:"CHARACTER STUDY",score:9.0,exp:8.8,verdict:"Mikasa's origin episode. Her backstory recontextualizes her relationship with Eren completely. One of the most efficient character origin episodes in shonen anime."},
      {ep:"S1E7",title:"Small Blade",type:"ACTION/SET PIECE",score:8.6,exp:8.7,verdict:"Trost battle continues. Armin's strategic thinking emerges as the defining trait that will drive the series forward. The sequence where the squad is picked off one by one is genuinely harrowing."},
      {ep:"S1E8",title:"I Can Hear His Heartbeat",type:"MID SEASON CLIMAX",score:8.4,exp:8.5,verdict:"Eren's titan ability emerges. The reveal is properly shocking — earned by the episode's structure of apparent defeat followed by impossible reversal."},
      {ep:"S1E9",title:"Whereabouts of His Left Arm",type:"ACTION/SET PIECE",score:8.9,exp:9.0,verdict:"Aftermath of Eren's transformation. Military tribunal setup begins. The political reality of the story emerges — humanity's greatest threat might be the boy they need most."},
      {ep:"S1E10",title:"Response",type:"BOTTLE EPISODE",score:8.7,exp:8.6,verdict:"The tribunal. Levi beating Eren to demonstrate controllability is one of the most memorable sequences in Season 1 — brutal, strategic, darkly funny."},
      {ep:"S1E11",title:"Idol",type:"CHARACTER STUDY",score:8.8,exp:8.7,verdict:"Hange's experiments with titan captives. The humanity of titans hinted at for the first time. Hange herself fully established as one of the series' most essential characters."},
      {ep:"S1E12",title:"Wound",type:"ACTION/SET PIECE",score:9.1,exp:9.0,verdict:"Female Titan appears for the first time in the Forest of Giant Trees operation. The ODM combat choreography reaches its Season 1 peak here. Sawano's track choice is perfect."},
      {ep:"S1E13",title:"Primal Desire",type:"ACTION/SET PIECE",score:9.2,exp:9.2,verdict:"The Female Titan capture operation. Erwin's first demonstration of the cold strategic calculus that defines him. The hand-to-hand combat between Levi and the Female Titan is some of the finest action in Season 1."},
      {ep:"S1E14",title:"Can't Look Into His Eyes Yet",type:"CHARACTER STUDY",score:8.5,exp:8.4,verdict:"Aftermath of the Female Titan's escape. Eren and Levi's squad isolated. The episode that makes what follows devastatingly effective by showing us exactly who is about to die."},
      {ep:"S1E15",title:"Special Operations Squad",type:"CHARACTER STUDY",score:8.8,exp:8.6,verdict:"Levi's squad's domestic life in hiding. The episode deliberately makes you love these specific people so that the following episode can use that love against you."},
      {ep:"S1E16",title:"What Needs to be Done Now",type:"MID SEASON CLIMAX",score:9.6,exp:9.5,verdict:"Levi's squad is killed. Eren is captured. The first time the show demonstrates it will kill characters who matter without ceremony or heroism. The emotional devastation is total and earned."},
      {ep:"S1E17",title:"Female Titan",type:"ACTION/SET PIECE",score:9.3,exp:9.2,verdict:"The chase through the forest. Levi's ODM combat at peak quality. The decision to not fight — Erwin's trap — recontextualizes what we thought was happening. Perfect tension architecture."},
      {ep:"S1E18",title:"Forest of Giant Trees",type:"ACTION/SET PIECE",score:9.0,exp:9.0,verdict:"Armin's deduction. The Female Titan's identity revealed to the viewer through implication before confirmation. One of the cleanest trust-the-audience writing decisions in the series."},
      {ep:"S1E19",title:"Bite",type:"MID SEASON CLIMAX",score:9.2,exp:9.3,verdict:"Annie revealed. Eren vs Annie begins. The emotional weight of fighting someone you trained with — the specific horror of betrayal within the 104th — handled with real craft."},
      {ep:"S1E20",title:"Erwin Smith",type:"ACTION/SET PIECE",score:9.0,exp:9.0,verdict:"Eren vs Annie continues through Stohess. The collateral civilian damage made uncomfortable on purpose. Erwin's willingness to sacrifice the innocent for the mission established as his defining moral choice."},
      {ep:"S1E21",title:"Crushing Blow",type:"ACTION/SET PIECE",score:9.1,exp:9.1,verdict:"Annie crystallizes. First season ends on an unresolved threat — the walls contain titans. The show refuses to give the satisfaction of victory. The right choice entirely."},
      {ep:"S1E22",title:"The 57th Exterior Scouting Mission",type:"ACTION/SET PIECE",score:8.9,exp:8.8,verdict:"The Long-range Scouting Formation in action. Eren's first real operation outside the walls. The scale of the survey corps' work made tangible — methodical, dangerous, unforgiving."},
      {ep:"S1E23",title:"Smile",type:"CHARACTER STUDY",score:8.6,exp:8.5,verdict:"The aftermath episode. Survey Corps returns with heavy losses. The political cost of Erwin's operations becomes a central tension. Sets up the conspiracy arc."},
      {ep:"S1E24",title:"Mercy",type:"MID SEASON CLIMAX",score:8.8,exp:8.7,verdict:"The conspiracy within the walls begins to surface. The show's political dimensions deepen significantly. Strong setup for the season finale."},
      {ep:"S1E25",title:"Wall",type:"FINALE",score:9.0,exp:9.2,verdict:"Season 1 closes on titans inside the walls — the entire premise of safety dismantled. Not a triumphant finale but the correct one. The dread of what the second season must address is palpable."},
      // ── SEASON 2 ──
      {ep:"S2E1",title:"Beast Titan",type:"PREMIERE",score:9.3,exp:9.2,verdict:"Season 2 opens with the Beast Titan — immediately a different kind of threat. The wall titans revealed. Everything about the world's safety is now suspect. One of the best season-opening episodes in the series."},
      {ep:"S2E2",title:"I'm Home",type:"MYTHOLOGY/LORE",score:8.8,exp:8.7,verdict:"The 104th sheltering in a church. Wall Sina's secret — the titans inside the walls — begins to surface. Ymir and Historia's relationship established with quiet efficiency."},
      {ep:"S2E3",title:"Southwestward",type:"ACTION/SET PIECE",score:9.0,exp:8.9,verdict:"Sasha's village episode. One of the finest single-character episodes in Season 2 — her confrontation with the titan in her home, protecting a child alone, is perfectly constructed action storytelling."},
      {ep:"S2E4",title:"Soldier",type:"MID SEASON CLIMAX",score:9.7,exp:9.6,verdict:"Reiner and Bertholdt reveal themselves as the Armored and Colossal Titans. The single greatest twist execution in the anime — 40 episodes of friendship weaponized as emotional devastation. The voice acting is extraordinary."},
      {ep:"S2E5",title:"Historia",type:"CHARACTER STUDY",score:8.9,exp:8.7,verdict:"Ymir and Historia's history. Ymir's true identity and her relationship with Reiner's group given full context. The moral complexity of the traitor characters is given room to breathe."},
      {ep:"S2E6",title:"Warrior",type:"CHARACTER STUDY",score:9.1,exp:9.0,verdict:"Reiner's fractured psychology — the dissociation between Soldier and Warrior — is the most psychologically honest moment in Season 2. The voice actor's performance of a man losing grip on which identity is real is extraordinary."},
      {ep:"S2E7",title:"Close Combat",type:"ACTION/SET PIECE",score:9.4,exp:9.3,verdict:"Eren vs the Armored Titan. The emotional weight of fighting your former comrade makes every punch land differently. Sawano's score elevates the combat. Technically the finest ODM and titan fight choreography to this point."},
      {ep:"S2E8",title:"The Hunters",type:"ACTION/SET PIECE",score:8.9,exp:8.8,verdict:"The chase. Hange and the Survey Corps in pursuit. The scale of the threat — how much stronger the warriors are than any single titan — made clear through the pacing of the pursuit."},
      {ep:"S2E9",title:"Opening",type:"ACTION/SET PIECE",score:9.0,exp:9.0,verdict:"The beast titan's attack on the Survey Corps horses — eliminating their retreat. Erwin's charge into the titan horde, knowing it is suicide. One of the most heroic and brutal sequences in the entire anime."},
      {ep:"S2E10",title:"Children",type:"CHARACTER STUDY",score:8.7,exp:8.6,verdict:"Ymir's choice — transforming to save her comrades despite what it costs her. Her relationship with Historia as the emotional core of the episode. Handled with restraint that makes it more affecting."},
      {ep:"S2E11",title:"Charge",type:"ACTION/SET PIECE",score:9.5,exp:9.4,verdict:"The Survey Corps counterattack. Mikasa's rage-driven assault on the Armored Titan. Hannes's death — which hits precisely because of how small and ordinary it is after everything that's come before. Eren's screaming grief is the emotional peak of Season 2."},
      {ep:"S2E12",title:"Scream",type:"FINALE",score:9.6,exp:9.5,verdict:"The Coordinate ability awakened. The titans consume Reiss. Season 2's finale answers some questions while opening existential new ones — Eren's power, the nature of titans, the conspiracy running deeper than anyone knew. The perfect close to 12 episodes of escalating revelation."},
    ],
    verdict:{score:9.0,line:"Wit Studio's seasons are animation as a serious art form operating at its absolute ceiling.",full:"The AOT anime is one of the greatest adaptations ever produced. Its visual achievements — particularly Season 3 Part 2 — constitute animation history. The emotional impact of the anime at its peaks arguably exceeds even the manga's equivalent moments through the addition of Sawano's music.",canReachS:false}
  },
  {
    id:"monster-anime", title:"Monster Anime", type:"Anime", year:"2004", status:"Complete ✓",
    overall:9.0, hook:"The most faithful manga adaptation on this list.", tier:"S", color:D.text,
    tagline:"Madhouse treated Urasawa's work with complete reverence.",
    overview:{
      surface:"Madhouse's 74-episode adaptation of Urasawa's manga.",
      real:"A proof that faithful adaptation done with genuine care can match the quality of extraordinary source material.",
      deep:"The voice acting — particularly in Japanese — is among the best ever recorded for anime. Johan's voice actor delivers a performance of genuinely unsettling restraint. The European atmosphere is enhanced by the orchestral score which is one of the best in anime history. The pacing — criticized for being slow — is actually correct for the material. Dread requires space to breathe."
    },
    scores:{Writing:8.9, Art:8.2, Themes:9.8, Twists:9.0, Characters:9.5, Pacing:8.8, "Emotional Impact":9.3, Consistency:9.0},
    scoreReasons:{
      "Writing":"8.9 — the screenplay is faithful to Urasawa's source to the point of reverence. Every major plot beat, every thematic statement, every character arc is preserved with complete fidelity. The slight deduction from the manga's 9.6 is specifically for scenes where the anime's pacing slightly stretches material that reads with greater momentum on the page.",
      "Art":"8.2 — Madhouse's animation is competent and occasionally distinctive but not in the same category as the manga's artwork. Johan's character design translates perfectly. The European atmosphere is enhanced by careful background art. The animation is not exceptional by any technical standard — but it is consistently correct for the material.",
      "Themes":"9.8 — all of Monster's extraordinary thematic achievement translates completely. The nihilist vs humanist debate is if anything clearer in animation because Johan's voice performance makes his philosophy feel genuinely present rather than hypothetical. The anime makes Monster's central question — is human life inherently valuable or does it require meaning — feel immediate and personal.",
      "Twists":"9.0 — Urasawa's carefully planted revelations translate with full impact to animation. Johan's various appearances — each one redefining the narrative around him — carry additional weight through the voice performance. The gradual revelation of his origin is handled with identical patience to the manga.",
      "Characters":"9.5 — the voice acting elevates the source material significantly. Johan's Japanese voice actor delivers a performance of genuinely unsettling restraint that arguably surpasses even Urasawa's visual characterization. Tenma's exhaustion and moral weight are rendered through performance in ways the manga's artwork cannot fully convey. Lunge's cold logic is given additional humanity by his voice.",
      "Pacing":"8.8 — the adaptation is 74 episodes long and some critics argue this stretches the material. The counterargument — that dread requires space to breathe — is correct. The pacing is slow but the slowness serves the genre. The Ruhenheim arc in particular benefits from the extended buildup that animation allows.",
      "Emotional Impact":"9.3 — Johan's various appearances land with increased force in animation because the voice performance adds menace that illustration alone cannot fully convey. The Ruhenheim sequence is genuinely harrowing. Tenma's moral exhaustion is more immediately felt through performance than through the manga's visual characterization.",
      "Consistency":"9.0 — 74 episodes of remarkably even quality. The artistic quality never seriously dips. The thematic thread never breaks. The adaptation is so faithful that Monster anime's consistency mirrors the manga's — which is itself extraordinary."
    },
    arcs:[],
    comparisons:[
      {title:"Monster Manga",verdict:"Source vs adaptation",detail:"The manga's artwork is more detailed and expressively nuanced. The anime's voice performances add psychological complexity the manga cannot convey. Both are essential — read the manga, watch the anime.",color:D.text},
    ],
    verdict:{score:9.0,line:"A 74-episode commitment that justifies every episode.",full:"Monster Anime is the rare adaptation that treats its source material as sacred without becoming slavish. The voice performances — particularly Johan — constitute genuine artistic achievement. The slow pacing is not a flaw. It is the correct choice for a story about dread.",canReachS:false}
  },
  {
    id:"vs-anime", title:"Vinland Saga Anime", type:"Anime", year:"2019", status:"Complete ✓",
    overall:9.0, hook:"One of the finest manga adaptations ever produced.", tier:"S", color:D.blue,
    tagline:"The anime is excellent. The manga is significantly greater — but excellent is still excellent.",
    overview:{
      surface:"Wit Studio and MAPPA's adaptation across four seasons.",
      real:"A faithful and emotionally honest adaptation of one of the greatest manga ever made.",
      deep:"The slave arc in animated form loses nothing and gains the weight of silence and performance. MAPPA's Season 2 direction choices — the stillness, the use of mundane work as visual language — are correct for the material and sometimes even superior to the manga's equivalent passages. The completed anime now tells Yukimura's complete story."
    },
    scores:{Writing:9.0, Art:8.5, Themes:9.7, Twists:8.5, Characters:9.4, Pacing:9.3, "Emotional Impact":9.4, Consistency:9.3},
    scoreReasons:{
      "Writing":"9.0 — the adaptation screenplay is faithful and intelligent. MAPPA's Season 2 direction choices — the stillness, the use of mundane farm work as visual language — are correct for the material and sometimes even superior to the manga's equivalent passages. The dialogue preserves Yukimura's thematic precision across both studios.",
      "Art":"8.5 — Wit Studio Season 1 has strong action sequences and distinctive visual energy. MAPPA Season 2's more restrained visual style is appropriate for the slave arc's philosophical quietness but less visually impressive. The character designs are consistently expressive. Overall strong adaptation art without reaching exceptional.",
      "Themes":"9.7 — Yukimura's complete thematic vision is fully realized in the anime — including the final arc's ending. The cycle of violence, the possibility of genuine pacifism, the meaning of Vinland — all expressed with the same philosophical discipline as the manga. The anime now tells the complete story including the wheat ending.",
      "Twists":"8.5 — Askeladd's revelations and death hit with full force in animation — arguably more devastating because the voice performance and score amplify the emotional weight. Canute's transformation is handled with identical psychological precision. The anime's completed run now includes all of Yukimura's twists through the ending.",
      "Characters":"9.4 — the voice cast is exceptional across both studios. Askeladd's voice actor delivers one of the finest performances in anime. Thorfinn's complete arc — from child soldier to pacifist visionary — is fully realized. Einar's relationship with Thorfinn gains additional warmth through performance.",
      "Pacing":"9.3 — the slow arcs are handled with appropriate deliberateness. MAPPA's slave arc pacing — extended silences, the rhythm of daily farm work — mirrors the manga's philosophy about what the audience should experience. The final arc maintains this discipline through to the wheat ending.",
      "Emotional Impact":"9.4 — the anime's completed run makes Einar's death and the final image of wheat growing fully available. Askeladd's death is the most emotionally powerful sequence in Season 1 anime — the voice performance adds layers of bitter resignation that the manga conveys through expression alone. The completed anime is now a full emotional experience.",
      "Consistency":"9.3 — both studios maintained thematic and tonal consistency despite their different visual styles. The transition from Wit to MAPPA between seasons is noticeable but does not break the story's emotional continuity. The completed anime is remarkably even in quality across its full run."
    },
    arcs:[],
    comparisons:[
      {title:"AOT Anime",verdict:"Different peaks",detail:"AOT Anime has higher visual peaks — Season 3 Part 2 is unmatched. Vinland Saga Anime is more consistently excellent across its full run. Both are among the finest anime adaptations ever made.",color:D.text},
    ],
    verdict:{score:9.0,line:"For those who cannot read the manga — this is the complete Yukimura experience. It honors every word.",full:"The Vinland Saga anime tells Yukimura's complete story with genuine fidelity and emotional intelligence. The completed anime is now an exceptional standalone work that can be recommended without reservation.",canReachS:false}
  },

  // ── B TIER ──
  {
    id:"op", title:"One Piece", type:"Manga", year:"1997", status:"Ongoing",
    overall:8.9, hook:"27 years of maintained sincerity — the highest emotional impact score on this list.", tier:"A", color:D.purple,
    tagline:"The greatest ongoing work on this list — and the work with the highest potential ceiling.",
    overview:{
      surface:"A boy with rubber powers seeks the legendary treasure to become King of the Pirates.",
      real:"A philosophical argument that joy is resistance — that responding to a cruel world with laughter and friendship is not naivety but the most radical possible position.",
      deep:"One Piece is doing something no other work on this list has done — maintaining genuine joy across 27 years without losing sincerity. Robin's breakdown. Ace's death. Going Merry's funeral. These moments hit harder than almost anything on this list because Oda spends more time on human connection than any other mangaka. The emotional payoffs are enormous because the emotional investment is enormous."
    },
    scores:{Writing:9.2, Art:9.4, Themes:8.8, Twists:9.3, Characters:9.3, Pacing:7.5, "Emotional Impact":9.5, Consistency:8.0},
    scoreReasons:{
      "Writing":"9.2 — Oda planned his ending from the beginning and the long-term plotting discipline is extraordinary. Seeds planted in chapter 1 — the Nika fruit, the Will of D, the Void Century — pay off after 1000+ chapters. The Water 7 arc demonstrates plotting at the absolute highest level. Post-timeskip some arcs show planning seams — Dressrosa and Wano both exceed their optimal length. Still exceptional overall.",
      "Art":"9.4 — Oda's character designs are the most immediately recognizable in manga — every Straw Hat is an iconic silhouette. His panel composition during major emotional moments is among the finest in the medium. His world design — the variety of islands, cultures and architectures across 1100+ chapters — represents a creative output with no quantitative parallel. Post-timeskip action sequences occasionally sacrifice clarity for complexity.",
      "Themes":"8.8 — One Piece's themes are wider than they are deep compared to the top tier. Freedom versus institutional power. The inherited weight of history. Joy as resistance to cruelty. These themes are present and consistent but handled with less philosophical precision than Berserk, Vinland Saga or Monster. Oda prioritizes emotional truth over philosophical argument — which reaches more people but has a lower analytical ceiling.",
      "Twists":"9.3 — the Nika revelation after 1000 chapters is one of the greatest long-term twist payoffs in manga history — planted from chapter 1, paid off after two decades. Ace being Roger's son. Robin's true past. The truth of the Void Century emerging gradually. Oda plants seeds with Urasawa-level patience and pays them off with structural precision that rivals Isayama.",
      "Characters":"9.3 — the Straw Hat crew as a collective ensemble is the greatest crew in manga history. Not individually — but as a group whose specific chemistry, whose specific ways each member's weakness is covered by another's strength, whose specific history of each joining, creates something that no other ensemble on this list matches. Robin's arc, Nami's arc, Sanji's post-timeskip arc — each crew member gets at least one moment of complete emotional honesty.",
      "Pacing":"7.5 — the manga's most significant weakness. Pre-timeskip: near perfect. Post-timeskip: the pacing issues that plagued Dressrosa and Wano demonstrate a pattern of expansion without sufficient compression. Subplots that could resolve in ten chapters extend across thirty. Weekly serialization's commercial pressures are visible in a way they are not in the best arcs. The emotional peaks justify the journey — but the journey is longer than it needs to be.",
      "Emotional Impact":"9.5 — the highest emotional impact score on this list alongside Berserk and Vinland Saga. Robin's breakdown is the single greatest emotional moment in the manga. Ace's death, Going Merry's funeral, Marineford's aftermath — One Piece understands that audiences cry hardest for people they love, and Oda has spent 27 years making us love these specific people.",
      "Consistency":"8.0 — pre-timeskip: 9.5. Post-timeskip: 7.5. The gap is real. The post-timeskip manga is not bad — it is still operating at a high level. But the pacing discipline, the character efficiency and the emotional precision of the pre-timeskip manga is not fully matched after the two-year gap."
    },
    arcs:[
      {name:"Water 7 / Enies Lobby",rating:9.7,tags:["Masterpiece","Robin","Greatest Arc"],hook:"'I want to live.' — the most devastating three words in the manga.",highlight:true,analysis:"The greatest arc in One Piece. Robin's breakdown — a woman who had stopped wanting to survive, screaming that she wants to live — is the single greatest emotional moment in the manga. The crew's declaration of war on the World Government. Going Merry's funeral. This arc alone places One Piece in the conversation about the greatest long-form narratives in any medium."},
      {name:"Marineford",rating:9.4,tags:["Ace","Tragedy","Grief"],hook:"Ace's death is the most devastating emotional moment in post-Water 7 One Piece.",highlight:true,analysis:"Ace's death is earned across years of setup. Luffy's complete breakdown afterward — his inability to function — is the most honest portrayal of grief in the manga. Jinbe's response is the most important conversation in the entire manga."},
      {name:"Wano",rating:8.8,tags:["Kaido","Nika","Visual Peak"],hook:"The Nika revelation after 1000 chapters is one of the greatest long-term twist payoffs in manga history.",analysis:"Miura's artwork reaches its absolute peak here. Kaido as a villain is philosophically the most interesting in the manga — a man who has decided strength is the only truth because everything else failed him. The Nika revelation recontextualizes Luffy's entire power set."},
    ],
    comparisons:[
      {title:"Berserk",verdict:"Joy vs darkness",detail:"Berserk asks its questions through suffering. One Piece asks through laughter. Both are valid philosophical positions. Berserk is the greater work. One Piece has more emotional impact. Both are essential for different reasons.",color:D.amber},
    ],
    verdict:{score:8.9,line:"The pacing is the weakness. The heart is the strength. And no work on this list has more heart.",full:"One Piece at 8.9 is provisional — it cannot be finalized until Oda lands the ending. But what already exists is one of the greatest emotional achievements in manga history. When Oda answers the One Piece, the Void Century, and the Will of D with the same emotional intelligence that defined Water 7 — we come back and potentially move this into A or S tier.",canReachS:true}
  },
  {
    id:"csm", title:"Chainsaw Man", type:"Manga", year:"2018", status:"Ongoing",
    overall:8.9, hook:"The most formally radical manga ever made.", tier:"A", color:D.purple,
    tagline:"A boy whose dreams never evolved beyond survival.",
    overview:{
      surface:"A boy fused with a chainsaw devil hunts demons for the government.",
      real:"A work that uses genre conventions as a delivery mechanism for their own destruction — asking what happens to a human being so thoroughly deprived of ordinary existence that the only dreams they can form are humiliatingly small.",
      deep:"Fujimoto is the most cinematic mangaka in history. His panel composition, his use of negative space, his page layouts, his timing — these are the choices of a filmmaker who happens to be working in sequential art. The Reze arc is the most concentrated examination of whether performance can become genuine feeling on this entire list. Part 1 is a 9.4 work. Part 2 is deliberately alienating — either extraordinary creative courage or self-indulgence. Honest assessment holds both possibilities."
    },
    scores:{Writing:9.1, Art:9.6, Themes:9.0, Twists:9.2, Characters:9.1, Pacing:8.5, "Emotional Impact":9.3, Consistency:8.3},
    scoreReasons:{
      "Writing":"Fujimoto's plotting in Part 1 is among the most efficient on this list — zero wasted chapters, every arc building on the last with genuine cumulative weight. The Makima revelation retroactively enriching every preceding chapter is plotting of the highest order. Part 2's slower, more diffuse approach brings the score down from what Part 1 alone would earn.",
      "Art":"9.6 — the highest artwork score for any ongoing work on this list. Fujimoto's panel composition is the most cinematically sophisticated in manga. His pages have directorial intention in every frame. The action sequences have kinetic clarity that rivals the best in the medium. Color pages are among the finest produced in weekly manga. Only Vagabond's brushwork and Berserk's technical detail surpass it.",
      "Themes":"Chainsaw Man's central argument — that a person stripped of ordinary human dignity cannot dream beyond survival, and that the system which stripped them will exploit even their survival instinct — is pursued with genuine consistency. The devil system as metaphor for human fears is used with more philosophical intelligence than most horror manga attempts.",
      "Twists":"Makima's true identity is the greatest plot twist in Part 1 — it recontextualizes every kindness, every manipulation, every relationship in the manga simultaneously. The Gun Fiend reveal. Reze's genuine feeling despite her mission. Fujimoto plants seeds with Urasawa-level patience and pays them off with Isayama-level structural precision.",
      "Characters":"Denji is one of the most original protagonists on this list — his simplicity IS the complexity. A person whose desires never developed past basic survival needs. Makima is the greatest antagonist in Part 1. Power and Aki are among the finest supporting characters in recent manga. Part 2's Asa is compelling but the shift costs overall character score.",
      "Pacing":"Part 1 — near perfect. The most efficiently paced manga on this list per chapter. Part 2 deliberately slows — some experience this as meditative, others as directionless. It is a coherent creative choice but the efficiency of Part 1 is not maintained, which costs points here.",
      "Emotional Impact":"Aki's death at Denji's hands. Reze's hesitation. Power's final moments. Denji eating Makima's body. These hit with force that comes from Fujimoto's refusal to soften anything. No death in Chainsaw Man is sanitized or heroic. Every loss lands with the full weight of everything established about the person being lost.",
      "Consistency":"Part 1 alone scores 9.5. The transition to Part 2 and Part 2's deliberately alienating approach bring this down significantly. Not because Part 2 is bad — it is good and sometimes excellent — but the tonal and protagonist shift creates a consistency gap wider than almost anything on this list except GOT."
    },
    part1Score:9.4, part2Score:8.6,
    arcs:[
      {name:"Zombie Arc",rating:9.0,tags:["Opening","Denji","Makima"],hook:"A desperate beginning, not a heroic one.",analysis:"One of the greatest manga openings on this list. Fujimoto establishes Denji's complete situation in a handful of pages with extraordinary economy. No wasted panels. The chainsaw transformation is not triumphant. It is desperate."},
      {name:"Reze Arc",rating:9.5,tags:["Masterpiece","Romance","Performance","Betrayal"],hook:"Two weapons pretending to be human.",highlight:true,analysis:"The greatest arc in Part 1. Reze and Denji connect over coffee — two people who were never allowed to be people, briefly experiencing what being people feels like. Her hesitation cost her the mission and her life. The performance became genuine. This arc alone justifies Chainsaw Man's place on this list."},
      {name:"Gun Devil / Control Arc",rating:9.6,tags:["Aki","Makima","Climax","Revelation"],hook:"Taking something that hurt you and making it a part of yourself.",highlight:true,analysis:"Aki's death at Denji's hands. Makima's revelation as the Control Devil. Denji's response — consuming her, becoming her — is the most formally strange and emotionally correct conclusion in manga. It refuses the conventional final battle entirely."},
      {name:"Falling Devil Arc (P2)",rating:9.1,tags:["Part 2","Asa","Psychological"],hook:"A devil that dismantles people by showing them who they failed to be.",analysis:"Part 2's greatest arc. The Falling Devil weaponizes self-knowledge. The Chainsaw Man Church — broken people seeking salvation from someone who never claimed to offer it — is the manga's sharpest social commentary."},
    ],
    comparisons:[
      {title:"Berserk",verdict:"Cinema vs philosophy",detail:"Berserk is the greater philosophical work. Chainsaw Man is the greater cinematic work. No other mangaka composes pages the way Fujimoto does. Different excellence entirely.",color:D.amber},
      {title:"Oshi No Ko",verdict:"Performance vs warmth",detail:"Both examine whether performance can become genuine feeling. Chainsaw Man executes with more economy and devastation. Oshi No Ko executes with more warmth. Chainsaw Man wins objectively.",color:D.amber},
    ],
    verdict:{score:8.9,line:"Part 1 proved it. Part 2 is still in flight.",full:"Part 1 is a 9.4 work — complete, disciplined, devastating and formally revolutionary. When Part 2 concludes — if Fujimoto lands it — we come back. Chainsaw Man has the potential to be the greatest manga of its generation. Part 1 already proved it. Part 2 just needs to prove it can finish.",canReachS:true}
  },
  {
    id:"lotm", title:"LOTM", type:"Novel", year:"2018", status:"Complete ✓",
    overall:8.8, hook:"The greatest world-building achievement on this list.", tier:"A", color:D.purple,
    tagline:"22 cosmological Beyonder Pathways of staggering depth — and a man pretending to be a god.",
    overview:{
      surface:"A man transmigrates into a Victorian steampunk world of Lovecraftian horror.",
      real:"A story about identity when your name, your body, your history and your humanity are all things you can lose, replace or transcend.",
      deep:"The Acting Method — gaining power by acting according to the potion's name — is the most philosophically interesting power system across everything we rated. It is not just mechanics. It is a statement about identity: you are not who you are but who you consistently choose to be. Klein performing omniscience while improvising everything. The Tarot Club's reverence for a man making it all up. The humor coexisting with cosmic horror is a tonal achievement almost no work manages."
    },
    scores:{Writing:8.8, Art:null, Themes:9.0, Twists:9.4, Characters:8.5, Pacing:7.8, "Emotional Impact":8.7, Consistency:8.6},
    scoreReasons:{
      "Writing":"8.8 — Cuttlefish's plotting is exceptional for a web novel — seeds planted in volume 1 pay off in volume 7 with genuine discipline. The mystery architecture — who is the Fool, what is the Grey Fog, what happened to previous epochs — is constructed with patience that rivals Urasawa. The slight deduction is for the web novel format's inherent weaknesses: some stretches exist primarily to fulfill release quotas rather than advance story meaningfully.",
      "Art":"N/A — Lord of the Mysteries is a prose novel with no artwork. Its world-building score of 10.0 — the highest on this list — serves as the equivalent category, reflecting the extraordinary visual imagination embedded in the writing itself.",
      "Themes":"9.0 — LOTM asks: what is identity when your name, your body, your history and your humanity are all things you can lose, replace or transcend? The Acting Method — gaining power by performing an archetype until the performance becomes real — is a philosophical statement about identity embedded in the power system itself. You are not who you are but who you consistently choose to be.",
      "Twists":"9.4 — the greatest plot twist architecture in prose fiction on this list. The revelation that the Grey Fog itself is a Sefirah Castle. The truth about Emperor Roselle's diaries. The identity of the true Lord of Mysteries. The realization that Klein's transmigration was not random but fated. Every major revelation recontextualizes previous chapters. On reread the foreshadowing is everywhere — which is the mark of the highest twist craft.",
      "Characters":"8.5 — Klein is one of the most interesting protagonists on this list — specifically because his core identity is performance. The Tarot Club members are individually strong. The limitation is that 1430 chapters inevitably means many characters are introduced with depth and then recede as the scale expands — a structural limitation of the medium rather than a pure writing failure.",
      "Pacing":"7.8 — the most significant weakness. 1430 chapters is genuinely long even by web novel standards and some volumes drag. The middle volumes occasionally lose momentum as new factions are introduced faster than existing ones are developed. A compressed version of 900-1000 chapters would be a tighter, more disciplined work without losing a single essential idea.",
      "Emotional Impact":"8.7 — the ending's quiet humanity — Klein waving at a child after ascending to near-divinity — is one of the most emotionally effective final images on this list. The humor coexisting with cosmic horror throughout creates genuine affection for Klein that makes the ending land. Dunn Smith's death establishes early that the story will not protect its characters.",
      "Consistency":"8.6 — remarkable for a 1430-chapter serialized work. The thematic thread never breaks. The cosmological rules established early are honored throughout. The deduction is for pacing inconsistencies in middle volumes and a small number of character arcs that receive insufficient resolution given their setup."
    },
    arcs:[
      {name:"Tingen City Arc",rating:8.8,tags:["Foundation","World-building","Seer"],hook:"A man performing omniscience while making everything up — and gradually becoming what he pretended to be.",analysis:"Klein's arrival, the Nighthawks, the Seer pathway, the establishment of the Tarot Club. The Grey Fog — Klein's sanctuary where he plays The Fool — is one of the most creative narrative conceits in modern fantasy."},
      {name:"Cosmic Scale Arc",rating:9.2,tags:["Outer Gods","Pathways","Revelation"],hook:"The deeper Klein goes, the more the universe reveals itself as something far older and more indifferent.",analysis:"Where LOTM separates itself from virtually every other progression fantasy. Most works expand their world as the protagonist gets stronger. LOTM expands its cosmology instead. The 22 Beyonder Pathways as complete philosophical frameworks is a creative achievement with no parallel."},
      {name:"Final Volume",rating:8.9,tags:["Conclusion","Klein","Dormancy"],hook:"Klein waving at a child after ascending to near-divinity is the correct ending.",highlight:true,analysis:"Klein's decision to fall into dormancy to prevent the former Lord of Mysteries' consciousness from replacing his own is thematically consistent with everything built across 1430 chapters. The human moment surviving the divine ascension. That is emotionally and thematically correct."},
    ],
    comparisons:[
      {title:"One Piece",verdict:"World-building comparison",detail:"LOTM's world-building score is 10.0 — the highest on this list. One Piece's world-building is vast and emotionally rich. LOTM's is deeper and more philosophically systematic. Different excellence.",color:D.amber},
    ],
    verdict:{score:8.8,line:"A compressed version of 900-1000 chapters would be a masterwork. What exists at 1430 is very good.",full:"LOTM at 8.8 is extraordinary world-building, sophisticated thematic construction, and an ending that chooses quiet humanity over cosmic spectacle. The pacing issues are a structural consequence of the web novel format. The world-building is unmatched on this list. Klein waving at a child is the correct final image.",canReachS:false}
  },
  {
    id:"20cb", title:"20th Century Boys", type:"Manga", year:"1999", status:"Complete ✓",
    overall:8.8, hook:"The most politically urgent work on this list.", tier:"A", color:D.purple,
    tagline:"Eerily prophetic about the 21st century — written before it began.",
    overview:{
      surface:"Childhood friends must stop a cult leader from destroying the world.",
      real:"A sustained argument that unexamined childhood wounds — loneliness, being overlooked — metastasize across decades into forces capable of destroying civilization.",
      deep:"Friend is not simply a villain. Friend is what happens when a lonely, overlooked child grows up in a world that never acknowledged him. The apocalypse in 20th Century Boys is not ideological or supernatural — it is the consequence of a childhood wound left unexamined for thirty years. Reading this work in 2026 — looking back on the last decade — Urasawa's warning feels less like fiction and more like prophecy."
    },
    scores:{Writing:9.1, Art:9.0, Themes:9.3, Twists:8.5, Characters:9.2, Pacing:8.3, "Emotional Impact":9.3, Consistency:8.0},
    scoreReasons:{
      "Writing":"9.1 — Urasawa's long-term plotting in the first half is extraordinary — small details from volume 1 prove essential in volume 15. The Friend identity as the organizing mystery is constructed with genuine craft. The endgame arc reveals the limitation: some threads are resolved with less precision than their setup deserved, and the potential film-influenced kanzenban changes introduce uncertainty about authorial intent.",
      "Art":"9.0 — Urasawa's faces are his greatest artistic strength and 20CB showcases them at scale — watching these specific people age across thirty years of story, maintaining recognizability while honestly depicting the physical cost of those years, is an artistic achievement with almost no parallel. The giant robot sequences required visual ambition beyond what Monster demanded and Urasawa delivers it.",
      "Themes":"9.3 — the argument that childhood loneliness is a civilizational threat — that the overlooked child who decided to make the world pay attention is not a metaphor but a historical pattern — is handled with genuine intellectual seriousness. Reading this in 2026 looking back on the last decade, Urasawa's warning feels less like fiction and more like prophecy.",
      "Twists":"8.5 — the Bloody New Year's Eve setup and execution is the manga's greatest twist — Friend attacking the world in a way that makes himself the savior is political commentary of the sharpest order. Kenji's return is one of the great character re-entries in manga. The Friend identity resolution is the most significant weakness — potentially compromised by film adaptation influence.",
      "Characters":"9.2 — Kenji is one of the greatest Urasawa protagonists — genuinely decent, without heroic posturing, consistently himself across thirty years of narrative. The aging ensemble — watching these specific people become weathered compromised versions of the children who built a secret base — is more emotionally effective than any dramatic reveal. Kanna is a worthy successor protagonist.",
      "Pacing":"8.3 — the first half is among the most compulsively readable Urasawa produced — tighter than Monster, more propulsive. The second half loses that tightness as the ensemble expands. The endgame suffers from too many false endings — a pacing problem that affects the reading experience of the final stretch significantly.",
      "Emotional Impact":"9.3 — Kenji's final stand before Bloody New Year's Eve. The Bloody New Year sequence itself. Kanna carrying her uncle's song into a destroyed world. The ending's return to the secret base and childhood memory. These achieve the specific emotional register Urasawa does better than almost anyone — ordinary human feeling intersecting with extraordinary circumstance.",
      "Consistency":"8.0 — the endgame rush, the 21st Century Boys epilogue's slightly strained effort to regain thread, and the Friend identity problem all reduce consistency from what the first half promised. Still a strong score — the thematic thread never breaks — but the execution consistency of the later volumes is measurably below the opening arcs."
    },
    arcs:[
      {name:"1997 / Discovery Arc",rating:9.2,tags:["Kenji","Symbol","Foundation"],hook:"A failed rock musician noticing that a cult's symbol matches something from his childhood.",analysis:"One of Urasawa's finest openings. The mystery is established with characteristic restraint. Kenji is established as genuinely decent — a person who genuinely cares without needing to make a thing of it."},
      {name:"Bloody New Year's Eve",rating:9.4,tags:["Giant Robot","Inversion","Masterpiece"],hook:"Friend doesn't just attack the world. He attacks it in a way that makes himself the savior.",highlight:true,analysis:"The genius of this arc: Friend engineers a crisis that makes the people trying to stop him the villains. The manipulation of public narrative — the use of manufactured crisis to consolidate power — is political commentary of the sharpest order. Written weeks before September 11th and inadvertently prophetic."},
      {name:"Kanna Arc / Dystopia",rating:9.0,tags:["Time Skip","Kanna","Resistance"],hook:"Friend won. The story continues.",analysis:"The most structurally ambitious section. Urasawa abandons his protagonist, jumps forward in time, and asks the reader to follow new characters in a world the original cast failed to save. Narratively courageous in the same way Vinland Saga's slave arc was."},
      {name:"Endgame",rating:8.6,tags:["Kenji Returns","Guitar","Rushed"],hook:"A failed rock musician with his guitar walking back into an apocalyptic world.",analysis:"Kenji's return is one of the greatest single character re-entries in manga history. However the endgame arc is rushed — a common Urasawa weakness. The Friend identity resolution has been potentially compromised by the film adaptation's influence on the kanzenban edition."},
    ],
    comparisons:[
      {title:"Monster",verdict:"Same author, warmer work",detail:"Monster is Urasawa's more precisely crafted work. 20CB is his more humanly warm one. Monster wins on almost every technical dimension. But 20CB reaches more people more quickly. Read Monster first. Then this.",color:D.text},
    ],
    verdict:{score:8.8,line:"The most humanly warm Urasawa work — and the most politically urgent thing on this list.",full:"20th Century Boys argues that childhood loneliness is a civilizational threat — and renders that argument through giant robots, a secret base and a failed rock musician with a guitar. The tonal range required to hold those elements together is itself a creative achievement. A slightly compromised ending prevents it from reaching Monster's level. The first half is as good as anything Urasawa wrote.",canReachS:false}
  },
  {
    id:"oshi", title:"Oshi No Ko", type:"Manga", year:"2020", status:"Complete ✓",
    overall:8.3, hook:"Chapter 1 is the greatest single opening chapter in manga history.", tier:"B", color:D.amber,
    tagline:"A properly concluded Oshi No Ko would be a 9.0 work. What we have is 8.3.",
    overview:{
      surface:"Reincarnated twins navigate the Japanese entertainment industry seeking their mother's murderer.",
      real:"An examination of whether performance and authenticity can coexist — whether love expressed through lies is still love.",
      deep:"In the world of showbiz, lies are weapons. Every character in Oshi No Ko is performing something. The question the manga asks across 166 chapters is whether the performance eventually becomes real or eventually destroys the person underneath it. Chapter 1 alone — Ai's death after finally learning what love is — is worth the entire read. The gap between chapter 1 and chapter 166 is the entire story of this manga's legacy."
    },
    scores:{Writing:8.3, Art:9.3, Themes:8.8, Twists:8.9, Characters:8.6, Pacing:7.2, "Emotional Impact":8.7, Consistency:7.0},
    scoreReasons:{
      "Writing":"8.3 — Akasaka's plotting across the first 140 chapters is genuinely impressive. The reincarnation premise is used with intelligence rather than as gimmick. The revenge architecture is constructed with patience. The final arc's compression from what should have been 30+ chapters into four is a serious writing failure that brings the overall score down significantly from what the first half earned.",
      "Art":"9.3 — Yokoyari's artwork is the manga's greatest consistent achievement. Character designs are immediately distinctive — Ai's star eyes, Ruby's intensity, Kana's expressiveness, Aqua's controlled coldness. The idol performance sequences have visual energy few manga artists match. Emotional close-ups — faces registering grief, love, betrayal, joy — are rendered with extraordinary precision. Among the finest artwork currently being produced in manga.",
      "Themes":"8.8 — in the world of showbiz lies are weapons. Every character is performing something. The question — whether performance eventually becomes real or eventually destroys the person underneath — is coherent and consistently maintained. The entertainment industry commentary is the sharpest on this list. Akane studying Ai to portray her — and understanding the dead woman better than her own children — is the manga's thematic peak.",
      "Twists":"8.9 — chapter 1's death of Ai is the greatest twist opening in manga history — establishing immediately that the story will not protect anyone for narrative convenience. The reveal of Aqua's father's identity. The 15 Year Lie's structure as a revenge mechanism. Akane's complete understanding of Ai as a character twist. All handled with genuine craft. The final arc's twists feel compressed and slightly convenient by comparison.",
      "Characters":"8.6 — Aqua is one of the most interesting protagonists on this list — a man performing coldness to enable revenge while the warmth he is suppressing slowly reasserts itself. Kana Arima is the most complete supporting character — her journey from bitter former prodigy to genuine artist is handled with more patience and honesty than most manga give their main characters. Ai herself maintains presence across 166 chapters that shapes every subsequent decision.",
      "Pacing":"7.2 — strong through chapter 140. Catastrophically compressed from chapter 141 onward. The ratio of setup to payoff in the final arc is the most imbalanced on this list. More imbalanced even than GOT's season 8 relative to its length — because GOT had two full seasons to collapse rather than four chapters.",
      "Emotional Impact":"8.7 — chapter 1 alone is among the highest concentrated emotional impact per page on this list. Kana's various moments of genuine vulnerability. Aqua's final moments dying with a smile. Ruby performing at the Dome. These all land. The final arc's emotional beats land slightly less than they should because the compression doesn't give them adequate space to breathe.",
      "Consistency":"7.0 — the quality gap between chapters 1-140 and chapters 141-166 is severe. Not quite GOT season 8 level because the thematic conclusion is correct even if the execution is rushed — but serious enough to significantly affect the overall score. The artwork maintains its quality throughout. The writing does not."
    },
    arcs:[
      {name:"Chapter 1 — Ai's Death",rating:10.0,tags:["Greatest Opening","Ai","Devastating"],hook:"'I finally learned what love is.' — delivered as she dies.",highlight:true,analysis:"One of the greatest single chapters in manga history. In thirty pages Akasaka establishes Ai as a fully realized human being, introduces Gorou, establishes the reincarnation premise, builds genuine attachment, and then kills her. The emotional devastation works because the chapter does something almost impossible — it makes you love a character completely in thirty pages."},
      {name:"2.5D Stage Play Arc",rating:9.1,tags:["Masterpiece","Akane","Layers"],hook:"Actors portraying characters while being characters themselves — layers of performance on performance.",highlight:true,analysis:"The manga's most consistently excellent extended arc. Akane studies Aqua's dead mother to portray her convincingly — and in doing so understands Ai more completely than anyone alive. Her relationship with Aqua develops through the shared project of understanding a dead woman neither of them fully knew."},
      {name:"15 Year Lie / Film Arc",rating:8.8,tags:["Revenge","Biopic","Truth"],hook:"Using art to achieve justice — but who has the right to tell someone else's story?",analysis:"Aqua's revenge plan crystallizes. The meta-commentary on truth told through fiction is extraordinary. Aqua's complete psychological portrait across this arc is the manga's most sustained character achievement."},
      {name:"Final Arc (Ch 141-166)",rating:6.2,tags:["Rushed","4 Chapters","Disappointment"],hook:"Four chapters to end a 166-chapter manga. No four chapters could responsibly carry that burden.",analysis:"The rushing is real, serious and consequential. Aqua's death — not wrong as an idea but wrong in execution. 160 chapters built toward choosing life. The ending chose death in four weekly releases. A properly concluded Oshi No Ko — given 25-30 chapters — would be a 9.0 work."},
    ],
    comparisons:[
      {title:"Chainsaw Man",verdict:"Same theme, different execution",detail:"Both examine whether performance can become genuine feeling. Chainsaw Man executes with more economy. Oshi No Ko executes with more warmth. The Reze arc is more devastating than anything in Oshi No Ko. But Chapter 1 of Oshi No Ko is better than any single chapter in Chainsaw Man.",color:D.amber},
    ],
    verdict:{score:8.3,line:"The gap between chapter 1 and chapter 166 is the most heartbreaking distance in any manga on this list.",full:"Oshi No Ko at 8.3 is a genuinely great manga that ended as a good manga. Chapter 1 alone is a 10/10 achievement. Yokoyari's artwork is among the finest currently being produced. The entertainment industry critique is the sharpest on this list. Four chapters destroyed what 162 built. Aqua deserved more. Kana deserved more. Yokoyari's artwork deserved more.",canReachS:false}
  },
  {
    id:"dn-anime", title:"Death Note Anime", type:"Anime", year:"2006", status:"Complete ✓",
    overall:8.6, hook:"Episodes 1-25 are among the finest anime ever made.", tier:"A", color:D.purple,
    tagline:"Mamoru Miyano's voice adds psychological complexity beyond the manga.",
    overview:{
      surface:"Madhouse's 37-episode adaptation of Ohba and Obata's manga.",
      real:"An adaptation that improves on its source material in specific ways — particularly the internal monologue sequences rendered visually.",
      deep:"The internal monologue sequences — Light and L's simultaneous strategic thinking rendered visually — are creative and effective solutions to a difficult adaptation problem. The score by Yoshihisa Hirano and Hideki Taniuchi perfectly amplifies the tension. Mamoru Miyano's Light is a performance that adds layers even Obata's artwork cannot fully convey."
    },
    scores:{Writing:8.8, Art:8.8, Themes:9.0, Twists:9.0, Characters:8.6, Pacing:8.2, "Emotional Impact":8.8, Consistency:8.0},
    scoreReasons:{
      "Writing":"8.8 — faithful adaptation with smart visual solutions. The internal monologue sequences — Light and L's simultaneous strategic thinking rendered visually — are more viscerally exciting than their manga equivalents. The screenplay adds nothing unnecessary and loses nothing essential. Slight deduction because the second half faithfully adapts weaker source material.",
      "Art":"8.8 — the animation captures Obata's iconic designs with complete fidelity. L's posture, Light's expressions, the tension during intellectual confrontations — all translated effectively. The visual language during the chess-match sequences is genuinely creative. Slightly below the manga's 9.5 because even excellent animation cannot fully replicate the specificity of Obata's line work.",
      "Themes":"9.0 — all of Death Note's thematic achievement translates completely to animation. The anime arguably makes the themes more immediate — Light's internal monologue voiced by Mamoru Miyano makes the gap between his self-justification and his reality more viscerally present than the manga's text boxes alone achieve.",
      "Twists":"9.0 — L's identity reveal, the Kira traps, Light's memory games — all land with full force in animation. The voice performances amplify the reveals significantly. L's death in particular is more devastating animated than on the page because the performance makes his analytical coldness feel genuinely human in a way the manga can only suggest.",
      "Characters":"8.6 — Mamoru Miyano's Light is a genuinely extraordinary voice performance — adding psychological layers that even Obata's artwork cannot fully convey. The voice cast as a whole is exceptional for the L arc. Near and Mello's voice performances maintain quality even as the characters themselves are weaker than L.",
      "Pacing":"8.2 — the L arc is paced identically to the manga with full effect. The second half occasionally feels stretched — some Near/Mello scenes that read quickly on the page feel slightly extended in animation. The finale is appropriately paced.",
      "Emotional Impact":"8.8 — L's death is more emotionally devastating animated than in the manga. The score during that sequence is one of the finest musical moments in anime. Light's final moments — desperate, pathetic, begging — land with the same emotional honesty as the manga but with the additional weight of Mamoru Miyano's performance.",
      "Consistency":"8.0 — episodes 1-25 are exceptional. Episodes 26-37 are good. The quality dip in the second half mirrors the manga's — faithful adaptation means inheriting the source's weaknesses alongside its strengths. The animation quality remains consistent throughout even as the writing quality reflects the source's own decline."
    },
    arcs:[],
    comparisons:[
      {title:"Death Note Manga",verdict:"Visual vs drawn",detail:"The manga's artwork is more detailed. The anime's voice acting adds psychological layers the manga cannot possess. For the L arc specifically, the anime is the superior experience. For the complete work, the manga is slightly stronger.",color:D.text},
    ],
    verdict:{score:8.6,line:"The second half faithfully adapts weaker source — which is both its strength and its limitation.",full:"Death Note Anime at 8.6 is exceptional anime that is slightly less than exceptional manga. Episodes 1-25 are essential viewing. The L arc rendered in animation, performance and music constitutes a genuinely extraordinary artistic experience.",canReachS:false}
  },
  {
    id:"ds-infinity", title:"DS: Infinity Castle P1", type:"Film", year:"2025", status:"Complete ✓",
    overall:7.8, hook:"The greatest visual spectacle on this list — and one of the most narratively hollow films at its budget.", tier:"C", color:"rgba(52,211,153,0.7)",
    tagline:"$778.9M worldwide. Proof that commercial success and artistic merit are different questions.",
    overview:{
      surface:"The first theatrical film covering the Infinity Castle arc.",
      real:"A technically extraordinary first act of a three-part conclusion to a series whose greatest strength was always its visuals and whose greatest weakness was always its writing.",
      deep:"Ufotable has been the greatest action animation studio working in theatrical anime for a decade. Infinity Castle is their ceiling — every technical resource deployed simultaneously. But the screenplay adapts source material that was always thin on character depth — and rather than compensating through original additions the way Reze Arc did with the Makima date scene, it faithfully reproduces the thinness at theatrical scale."
    },
    scores:{Writing:7.2, Art:9.9, Themes:6.5, Twists:7.0, Characters:6.8, Pacing:7.0, "Emotional Impact":8.3, Consistency:null},
    scoreReasons:{
      "Writing":"7.2 — the screenplay faithfully adapts source material that was always thin on character depth. Rather than compensating through original additions — as the Reze Arc film did with the Makima date scene — it reproduces the thinness at theatrical scale. The Akaza flashback placed at the climax of his fight is the most significant structural mistake: correct thematic idea, catastrophically wrong placement.",
      "Art":"9.9 — Ufotable at the absolute ceiling of what theatrical anime can produce. Every technical resource deployed simultaneously. The Infinity Castle environment — infinite architecture folding into itself — is one of the greatest single environment designs in anime film history. The fight sequences are spatially coherent, physically grounded and choreographed with directorial intelligence rather than pure spectacle accumulation. Competing only with the Reze Arc film for finest animation of 2025.",
      "Themes":"6.5 — the source material's thematic ceiling is modest and the film faithfully reproduces it. Breathing style as character identity is competent but not philosophically deep. Akaza's backstory — introduced at the climax of his fight — attempts thematic complexity that the placement makes impossible to land. The film is not trying to be thematically deep. It is trying to be spectacular. It succeeds at one and not the other.",
      "Twists":"7.0 — the reveals present in this installment — Akaza's human past, the scope of Muzan's plan — are handled competently. But this is Part 1 of 3, meaning the film cannot complete any twist architecture it introduces. The most interesting potential revelations are reserved for future installments.",
      "Characters":"6.8 — the source material's character depth limitations are unchanged by theatrical treatment. The characters have defined personalities and visual distinctiveness. They do not have the psychological complexity of the top tier works on this list. Zenitsu's master farewell sequence — the most emotionally honest character moment in the film — is the clearest indication of what the franchise could achieve if the writing matched the animation.",
      "Pacing":"7.0 — the first act and action sequences are well paced. The 25-minute Akaza flashback at the climax of the biggest fight is a structural pacing mistake that no amount of beautiful animation resolves. A three-part theatrical release for one arc is a commercial decision — and the pacing reflects that commercial structure.",
      "Emotional Impact":"8.3 — Zenitsu saying goodbye to his master in a dream is the film's most genuinely affecting sequence — emotionally honest and earned within Zenitsu's established character. Shinobu's defeat is impactful. The film achieves emotional beats beyond what its writing alone would generate through the combination of Ufotable's animation and the sound design.",
      "Consistency":"N/A — this is Part 1 of 3 and cannot be assessed for consistency as an incomplete work. The visual quality is completely consistent throughout. The writing quality reflects the source material's own consistency — which is consistent mediocrity elevated by extraordinary animation."
    },
    arcs:[
      {name:"Opening / First Battles",rating:8.5,tags:["Action","Spectacular","Pacing"],hook:"The Infinity Castle itself as a visual environment has no equal in anime film history.",analysis:"The arrival and early battles establish the scale. Ufotable's action sequences are spatially coherent, physically grounded within their own physics, and choreographed with directorial intelligence. The environment design — infinite architecture folding into itself — is extraordinary."},
      {name:"Akaza Flashback",rating:7.0,tags:["Pacing Problem","Backstory","20 Minutes"],hook:"25 minutes of backstory at the climax of the biggest fight — a structural problem no animation can solve.",analysis:"The Akaza flashback is the film's most discussed structural problem. Introducing a character's emotional backstory at the climax of their fight undermines both the action tension and the emotional payoff simultaneously. The idea of Akaza's tragic humanity is correct. The execution reveals it at the wrong moment."},
      {name:"Zenitsu's Resolution",rating:8.3,tags:["Emotional","Master","Farewell"],hook:"The most genuinely moving sequence in the film.",highlight:true,analysis:"Zenitsu saying goodbye to his master in a dream during his fight — learning he was his master's pride — works because it is psychologically honest. A person who spent their entire life seeking approval from someone who committed suicide out of shame finally receiving the acknowledgment he needed."},
    ],
    comparisons:[
      {title:"CSM: Reze Arc",verdict:"Art vs substance",detail:"Infinity Castle scores 9.9 for animation — higher than Reze Arc's 9.8. But Reze Arc scores 9.5 for emotional impact vs Infinity Castle's 8.3. And 9.3 for themes vs 6.5. Reze Arc is a complete film. Infinity Castle Part 1 is a spectacular fragment.",color:D.amber},
    ],
    verdict:{score:7.8,line:"Ufotable gave Demon Slayer the most technically accomplished animation in theatrical anime history. Gotouge gave Ufotable a story that has never matched it.",full:"Infinity Castle Part 1 at 7.8 is the greatest visual spectacle on this list. It is also one of the most narratively hollow films at its budget. A three-part theatrical release for one arc is a commercial decision masquerading as an artistic one. Parts 2 and 3 cannot change the writing. They can only animate it more beautifully.",canReachS:false}
  },
  {
    id:"st", title:"Stranger Things", type:"TV", year:"2016", status:"Ongoing",
    overall:7.7, hook:"A show that got bigger when it needed to get deeper.", tier:"C", color:"rgba(52,211,153,0.7)",
    tagline:"Season 1 is an 8.8. The series average is 7.7. That gap is the entire story.",
    overview:{
      surface:"Kids in a small Indiana town encounter supernatural forces from another dimension.",
      real:"A show that briefly understood how to create genuine stakes through character investment — and then forgot in favor of scale.",
      deep:"The Duffer Brothers understand how to make audiences feel things even when the writing isn't perfectly disciplined. The friendship dynamics between the core kids carry enormous emotional weight across all seasons. The problem: each subsequent season adds characters and subplots faster than it develops them. Season 4's episode lengths reach feature film duration without the narrative density to justify it."
    },
    scores:{Writing:7.3, Art:8.5, Themes:7.0, Twists:7.5, Characters:8.0, Pacing:7.0, "Emotional Impact":8.3, Consistency:7.2},
    scoreReasons:{
      "Writing":"7.3 — Season 1 writing is exceptional — disciplined, character-rooted, and operating with genuine restraint. Each subsequent season shows the Duffer Brothers choosing scale over precision. Character decisions begin serving plot requirements rather than emerging from established psychology. Season 4's episode lengths exceed their narrative density by a significant margin. The writing average across all seasons lands honestly at 7.3.",
      "Art":"8.5 — the show is visually distinctive and consistently well produced. The Upside Down aesthetic is genuinely creative and atmospherically effective. The practical and digital effects work together well. Later seasons have some of the most visually impressive sequences on Netflix. The visual craft remains at 8.5+ across all seasons even as the writing declines.",
      "Themes":"7.0 — Stranger Things has themes — trauma, friendship, growing up, the cost of government secrecy — but handles them with varying consistency. Season 4's use of Vecna as a manifestation of repressed trauma is the most thematically sophisticated the show has been. The overall thematic ambition is more modest than the show's cultural reputation suggests.",
      "Twists":"7.5 — the Mind Flayer's possession, Vecna being One being Henry being 001 — the latter is well constructed and foreshadowed. However many twists rely on information the audience doesn't have access to rather than information hiding in plain sight — a cheaper form of surprise. Early seasons twist better than later ones. Hold the Door is the single best twist in the series.",
      "Characters":"8.0 — the core ensemble is genuinely well written particularly in early seasons. Eleven's trauma arc, Joyce's desperation, Hopper's gruffness hiding grief — all handled with care. The expanding cast in later seasons means many characters get insufficient development. Eddie Munson is likeable but exists essentially to be sacrificed for emotional impact without sufficient setup.",
      "Pacing":"7.0 — Season 1 is tight and disciplined. Each subsequent season becomes progressively more bloated. Season 4 episodes regularly exceed 70-80 minutes without sufficient narrative density to justify the runtime. The Chicago episode in Season 2 remains one of the worst single pacing decisions on this list — stopping the show's momentum at a critical moment for an episode that serves nothing.",
      "Emotional Impact":"8.3 — Hold the Door is one of the most affecting single moments in the show's run. Hopper and Joyce's relationship across all seasons generates genuine warmth. The friendship dynamics between the core kids carry real emotional weight. The show's ability to make you feel things even when the writing isn't perfectly disciplined is its greatest quality.",
      "Consistency":"7.2 — meaningful decline from Season 1 to Season 4. Not catastrophic like GOT but a clear downward trend in narrative discipline even as production values increase. Season 1 is 8.8 quality. Season 4 is 7.0 quality. The average across all seasons lands at 7.2."
    },
    arcs:[
      {name:"Season 1",rating:8.8,tags:["Masterpiece","Spielberg","Discipline"],hook:"One of the greatest debut seasons in streaming history.",highlight:true,analysis:"Elegant, disciplined, emotionally honest. The mystery of the Upside Down handled with restraint — shows just enough. The child performances are extraordinary. Small town setting used meaningfully. The most efficient storytelling in the series."},
      {name:"Season 3",rating:7.5,tags:["Humor","Russia","Bloat"],hook:"Where the cracks become visible — humor increasing at the expense of tension.",analysis:"The Russian subplot feels tonally disconnected. Hopper's characterization becomes inconsistent. The Mind Flayer as a physical creature reduces the cosmic horror. The pattern is now clear — the show is beginning to serve its spectacle."},
      {name:"Season 4",rating:7.0,tags:["Vecna","Bloat","Running Up That Hill"],hook:"The most ambitious and the most uneven season — often in the same episode.",analysis:"Vecna as a villain is conceptually strong — rooted in real trauma. But the season suffers from severe bloat. Feature-length episodes without the narrative density to justify them. Kate Bush usage is genuinely brilliant. The California subplot is largely unnecessary."},
    ],
    comparisons:[
      {title:"Game of Thrones",verdict:"Different collapses",detail:"Both start excellently and decline. GOT declines through compression — cutting too much. Stranger Things declines through expansion — adding too much. Stranger Things handles its decline more gracefully and maintains character integrity better.",color:D.amber},
    ],
    verdict:{score:7.7,line:"Hold the Door is the greatest single moment the show produced — and it was in Season 2.",full:"Stranger Things at 7.7 is good television that was briefly great television. Season 1 belongs in conversations about the best debut seasons in streaming history. The subsequent seasons represent a show that loved its world and characters but lost the narrative discipline that made Season 1 special.",canReachS:false}
  },

  // ── C TIER ──
  {
    id:"got", title:"Game of Thrones", type:"TV", year:"2011", status:"Complete",
    overall:7.0, hook:"Seasons 1-4 are among the greatest TV ever made. Season 8 is among the greatest collapses.", tier:"C", color:D.textDim,
    tagline:"Ned Stark's death changed television forever. Season 8 changed nothing — it just ended.",
    overview:{
      surface:"Noble families vie for the Iron Throne in a fantasy medieval world.",
      real:"A story about what happens when you run out of source material and have to finish someone else's story yourself.",
      deep:"Seasons 1-4 represent an extraordinary achievement — prestige television operating at a level it had never reached before. The pattern that emerges from Season 5 onward: character decisions begin serving plot requirements rather than emerging from established psychology. The show needed things to happen so they happened — regardless of whether the characters would make those choices. Season 8 is the logical extreme of that pattern applied to everything simultaneously."
    },
    scores:{Writing:6.8, Art:9.0, Themes:7.0, Twists:7.2, Characters:7.5, Pacing:7.0, "Emotional Impact":8.0, Consistency:4.5},
    scoreReasons:{
      "Writing":"6.8 — the average of two completely different shows. Seasons 1-4 writing scores 9.2 — some of the finest writing in television history. Season 7-8 writing scores 4.0 — character decisions serving plot convenience rather than established psychology. The Dany heel turn in two episodes. Littlefinger requiring inexplicable passivity. Jon's true identity changing nothing. The average across all eight seasons lands at 6.8.",
      "Art":"9.0 — consistently excellent throughout and improving every season. Production design, cinematography and visual effects reach genuinely extraordinary levels in later seasons. The show always looked like a 9.0. It stopped being written like one after Season 4. The visual craft is the cruelest irony — the most expensive and beautiful seasons are also the worst written.",
      "Themes":"7.0 — Martin's thesis — that power corrupts, that institutions outlast individuals, that the game of thrones claims everyone who plays it — is present and coherent in the early seasons. The show abandons it in the final seasons by resolving the game through conventional heroic and romantic logic rather than political logic. The Iron Throne melting is the right ending. Everything leading to it is insufficiently coherent.",
      "Twists":"7.2 — the average of the greatest plot twists in western television and some of the worst in recent television history. Ned Stark's death: 10/10. Red Wedding: 9.8. Hodor: 9.5. Night King's death: 5.5. Dany's heel turn: 4.5. Littlefinger's death: 4.0. Jon's identity resolving nothing: 4.0. That range tells you everything about what Game of Thrones was and became.",
      "Characters":"7.5 — the show created some of the greatest characters in television history. It then systematically failed those characters. Jaime's redemption arc abandoned in two episodes. Daenerys's seven-season characterization contradicted in two episodes. Varys executing a plan without Littlefinger's passivity and then dying for inexplicable reasons. The early seasons score 9.5 for character. The final seasons score 4.0. The average is honest.",
      "Pacing":"7.0 — Seasons 1-4 are paced with the confidence of showrunners who understand the material. Season 5-6 begin compressing where they should breathe. Seasons 7-8 abandon the show's foundational understanding that consequences require time — characters traverse continents in minutes, plans that should take seasons resolve in episodes. The compression is not editing discipline. It is running out of story.",
      "Emotional Impact":"8.0 — the early seasons create emotional investment that the later seasons spend without earning. We cry at Jaime's ending because of Season 3. We feel the weight of Varys's death through everything that preceded it — not because of anything in Season 8. The emotional impact of the complete series is a residue of its best seasons rather than an achievement of its complete run.",
      "Consistency":"4.5 — the lowest consistency score on this list. The quality gap between Seasons 1-4 and Seasons 7-8 is the largest of any work rated here. Two full seasons — roughly a quarter of the show's total runtime — constitute a historic failure of narrative responsibility. A show that spent six seasons building towards something specific and spent two seasons failing to deliver it."
    },
    arcs:[
      {name:"Seasons 1-4",rating:9.2,tags:["Masterpiece","Ned","Red Wedding","Peak TV"],hook:"Ned Stark's execution is the greatest single plot twist in western television history.",highlight:true,analysis:"One of the greatest extended runs in television history. The Red Wedding. The Purple Wedding. The Mountain and the Viper. Jaime's complete arc. Tyrion and Tywin's relationship culmination. Television operating at its absolute ceiling. These seasons would place GOT in S tier if rated alone."},
      {name:"Season 5-6",rating:7.4,tags:["Dorne","Decline","Hodor"],hook:"Hold the Door is the greatest emotional moment in the series — surrounded by its weakest writing.",analysis:"Dorne subplot is the most jarring quality drop. The pattern becomes visible: spectacle beginning to supersede character logic. But Hold the Door — Hodor's complete life revealed as a single sacrifice — is devastatingly earned. Cersei's wildfire sequence is magnificent. The inconsistency is jarring."},
      {name:"Seasons 7-8",rating:3.8,tags:["Collapse","Daenerys","Jon","Failure"],hook:"A complete collapse — not of production value but of narrative responsibility.",analysis:"Daenerys's heel turn: thematically correct, catastrophically rushed. The Night King defeated before the final political conflict. Littlefinger requiring inexplicable passivity to lose. Jon's true identity changing nothing. Jaime's redemption arc abandoned in two episodes. Bran becoming king without establishing desire. Each failure individually might be forgivable. All simultaneously is historic."},
    ],
    comparisons:[
      {title:"Breaking Bad",verdict:"Consistency is everything",detail:"Both start at similar peak quality. Breaking Bad never drops. Game of Thrones drops off a cliff. Season 1-4 GOT rivals Season 4-5 Breaking Bad. The complete series comparison is 7.0 vs 9.2. That gap is entirely about the ending.",color:D.amber},
    ],
    verdict:{score:7.0,line:"A surgeon who performs three perfect operations and amputates the wrong limb on the fourth is not a 9.0 surgeon.",full:"Game of Thrones at 7.0 holds the tension between what it was and what it became honestly. Seasons 1-4 alone: 9.2. The complete series: 7.0. A story is not only its best chapters. The ending is part of what you are — and GOT's ending is one of the greatest failures of narrative responsibility in television history.",canReachS:false}
  },
  {
    id:"ds-anime", title:"Demon Slayer", type:"Anime", year:"2019", status:"Complete ✓",
    overall:7.0, hook:"Greatest animation craft on this list. Weakest writing.", tier:"C", color:"rgba(52,211,153,0.7)",
    tagline:"Visual spectacle without substance has a hard ceiling — and Demon Slayer found it.",
    overview:{
      surface:"A boy becomes a demon slayer after his family is killed and his sister transformed.",
      real:"A demonstration that extraordinary execution of a modest ambition has a ceiling — and that ceiling is roughly 7.0.",
      deep:"Ufotable's animation is the greatest on this list — 9.8 in Art, competing with the CSM Reze Arc film. But the writing underneath is significantly weaker. The breathing styles, the demon designs, the family relationships — all are competent. None approach the philosophical depth of the top tier. The pattern across Demon Slayer's entire run: when the animation is spectacular, you don't notice the writing is thin. When you think about it afterwards, you do."
    },
    scores:{Writing:6.5, Art:9.8, Themes:6.0, Twists:5.5, Characters:6.5, Pacing:7.5, "Emotional Impact":7.2, Consistency:7.5},
    scoreReasons:{
      "Writing":"6.5 — Gotouge's writing serves one purpose well: move characters toward their next spectacular fight. The breathing style system is internally consistent. The demon hierarchy is clearly established. Character decisions are largely predictable and emotionally functional without being psychologically deep. The Mugen Train arc demonstrates what the writing can achieve when it invests in a single character — Rengoku — for sufficient time.",
      "Art":"9.8 — Ufotable's animation is the greatest craft achievement in the anime medium for visual spectacle. Every frame of every fight sequence could be paused and printed as a poster. The breathing technique visualizations — water, flame, thunder rendered as dynamic environments — are genuinely creative and technically extraordinary. The highest Art score on this list for any animated work. The gap between this score and every other score tells you everything.",
      "Themes":"6.0 — Demon Slayer has emotional touchstones — family loyalty, brotherhood, sacrifice — but no sustained philosophical inquiry. The story does not ask hard questions. It does not challenge its protagonist or its reader. Nezuko's humanity as theme is functional but not developed with depth. Compared to the works in the top tier this is the starkest contrast — those works use their action as vehicle for meaning. Demon Slayer uses meaning as vehicle for its action.",
      "Twists":"5.5 — Muzan's identity is established early without significant mystery. The breathing style origins add lore but not genuine twist value. Nezuko's sun immunity is the most significant twist — introduced as a convenient power upgrade rather than a foreshadowed revelation. The twists exist to escalate stakes rather than to recontextualize what came before.",
      "Characters":"6.5 — Tanjiro's decency is consistent and occasionally affecting. Rengoku is the most complete character in the series — which is why his arc in Mugen Train is the most emotionally effective. Zenitsu and Inosuke provide personality contrast but not depth. The demon antagonists — Doma, Akaza — have backstories that gesture toward depth without achieving it. Muzan himself is pure antagonist function.",
      "Pacing":"7.5 — the fights are paced with Ufotable's direction intelligence rather than Gotouge's writing intelligence. The connective tissue between fights occasionally drags. The arc structure is clear and functional. The pacing is the one category where the gap between animation quality and writing quality partially closes — Ufotable's direction makes even thin material move.",
      "Emotional Impact":"7.2 — Rengoku's death is the series' most genuinely moving moment and it works because Rengoku is briefly written with real depth. Zenitsu's master farewell in Infinity Castle is the second most affecting moment. The series generates warmth through its character relationships even when those characters lack depth — which is an achievement but not a top-tier one.",
      "Consistency":"7.5 — consistent in quality within its own goals. It never tries to be Berserk and fails — it consistently executes its action spectacular premise at high level. The Entertainment District arc and Mugen Train represent the peak. The Swordsmith Village arc dips slightly. Overall remarkably stable for a franchise of this size."
    },
    arcs:[
      {name:"Entertainment District Arc",rating:7.6,tags:["Tengen","Action","Visual"],hook:"Visually jaw-dropping — the writing underneath is noticeably thinner than the spectacle above.",analysis:"Visually extraordinary — genuinely some of the best animation ever produced for television. But the writing underneath is weaker. Tengen is likeable but shallow. The emotional stakes feel slightly manufactured."},
      {name:"Mugen Train",rating:8.0,tags:["Rengoku","Emotional","Film"],hook:"Rengoku's death lands — because Rengoku is briefly written with depth.",analysis:"The most emotionally effective arc in the series. Rengoku is a compelling character — the arc would be significantly weaker without him. His death hits because he is written with more depth than almost anyone else in the series."},
    ],
    comparisons:[
      {title:"Vagabond",verdict:"Art comparison",detail:"Both have extraordinary artwork — Vagabond at 10.0, Demon Slayer at 9.8. Vagabond is #3 overall. Demon Slayer is #22. The distance between 9.7 in Themes and 6.0 in Themes explains everything.",color:D.amber},
    ],
    verdict:{score:7.0,line:"The most beautiful C tier work ever made.",full:"Demon Slayer at 7.0 is not an insult — it is an honest assessment of a work that achieves its goals excellently but has modest goals relative to the greatest works in the medium. It is the most visually spectacular C tier entry in the history of this list. It is also the clearest demonstration that visual craft without thematic substance has a ceiling.",canReachS:false}
  },
  {
    id:"sl", title:"Solo Leveling", type:"Manhwa", year:"2014", status:"Complete ✓",
    overall:6.8, hook:"A perfectly executed power fantasy.", tier:"D", color:D.textDim,
    tagline:"If you want to feel powerful — Solo Leveling is unmatched. If you want to feel human — read Vinland Saga.",
    overview:{
      surface:"The world's weakest hunter becomes its strongest through a mysterious leveling system.",
      real:"A power fantasy delivery mechanism — and there is nothing wrong with that as a goal, but it limits the ceiling of what the story can achieve.",
      deep:"Solo Leveling is the most fun read on this list. It is the least thematically substantial. Both things are true simultaneously. The artwork is genuinely world class — competing with the best on this list. The writing underneath serves one purpose: justify the next power upgrade. Character decisions are rarely motivated by genuine psychology. The world building is wide but extremely shallow. Jang Sung-rak's art alone is responsible for much of the manhwa's global popularity — and that credit is deserved."
    },
    scores:{Writing:6.5, Art:9.2, Themes:5.5, Twists:6.5, Characters:5.8, Pacing:8.0, "Emotional Impact":6.5, Consistency:7.0},
    scoreReasons:{
      "Writing":"6.5 — the narrative is fundamentally a power fantasy delivery mechanism. Plot exists primarily to justify the next power upgrade. Character decisions are rarely motivated by genuine psychology — they serve the escalation structure. World building is wide but extremely shallow. Within these self-imposed limits the writing is competent and efficient. Outside them it simply doesn't reach.",
      "Art":"9.2 — Jang Sung-rak's art is extraordinary — dynamic, expressive, cinematic and immediately recognizable. The dungeon sequences, shadow army panels and boss designs are legitimately world class. The character designs are distinctive and the action choreography has genuine spatial intelligence. The art alone is responsible for much of the manhwa's global popularity — and that credit is deserved.",
      "Themes":"5.5 — the lowest thematic score on this list for a completed work. Solo Leveling has almost no thematic ambition beyond survival and strength. It does not ask hard questions. It does not challenge its protagonist or its reader philosophically. Survival is meaningful. The story's argument that the strongest deserve to rule is presented without examination.",
      "Twists":"6.5 — the monarchs reveal and the system's true origin are conceptually interesting but executed with insufficient setup. The twists feel retrofitted onto the power fantasy structure rather than organically grown from it. They explain the world but don't meaningfully deepen the characters or recontextualize what came before.",
      "Characters":"5.8 — the lowest character score on this list. Jinwoo is compelling as a power fantasy vehicle but has almost no genuine interiority beyond protecting his family and becoming stronger. Supporting characters exist almost entirely as audience reaction vessels — they exist to be impressed by Jinwoo. The romance arc is particularly thin. No character on this list outside of GOT's later seasons is as underdeveloped relative to their screen time.",
      "Pacing":"8.0 — one of the better paced works on this list for its genre. It moves efficiently, rarely overstays its welcome in any single arc, and maintains momentum throughout. The Jeju Island arc and early dungeon arcs particularly demonstrate pacing intelligence. The final arc rushes slightly but not catastrophically.",
      "Emotional Impact":"6.5 — the Jeju Island arc generates genuine emotional stakes for the first time — the tragedy of the Korean hunters is handled with more weight than the rest of the series manages. Some genuine moments exist. Overall the emotional beats are shallow because the characters aren't deep enough to generate sustained investment beyond satisfaction at watching Jinwoo win.",
      "Consistency":"7.0 — consistent in quality within its own goals. It never tries to be Berserk and fails. The final arc dips below the series' peak but doesn't collapse. The art quality is completely consistent throughout. The writing quality — thin but functional — remains stable. A 7.0 consistency score for a work operating at 6.8 overall reflects that it is consistently what it is."
    },
    arcs:[
      {name:"Jeju Island Arc",rating:8.2,tags:["Best Arc","Emotional","Stakes"],hook:"Peak Solo Leveling — the first time emotional stakes feel real.",highlight:true,analysis:"The national level hunter conflict, the ants, and Beru's introduction represent the manhwa at its most ambitious. The tragedy of the Korean hunters is handled with more weight than the rest of the series manages. Emotional stakes feel real for the first time."},
      {name:"Monarchs / Final Arc",rating:6.8,tags:["Rushed","Thin","Convenient"],hook:"The final villain motivation is thin even by power fantasy standards.",analysis:"Where the serious weaknesses become undeniable. The scaling becomes absurd even by power fantasy standards. Character depth that was never deep becomes almost nonexistent. The ending resolves everything too neatly and too quickly."},
    ],
    comparisons:[
      {title:"Demon Slayer",verdict:"Similar tier, different reasons",detail:"Both sit at the bottom of this list for similar reasons — exceptional visuals, thin writing. Demon Slayer has warmer character relationships. Solo Leveling has better pacing and more coherent narrative structure. Roughly equal in overall quality for different reasons.",color:D.amber},
    ],
    verdict:{score:6.8,line:"Solo Leveling knows exactly what it is. The problem is what it is has a 6.8 ceiling.",full:"Solo Leveling at 6.8 is a genuinely excellent power fantasy that executes its goals at the highest possible level. If those goals had been more ambitious — if the world building had matched the artwork, if the character psychology had matched the action choreography — Solo Leveling could have been a 9.0 work. It chose not to be. And that choice is honest and final.",canReachS:false}
  },
  {
    id:"jjk", title:"Jujutsu Kaisen", type:"Manga", year:"2018", status:"Complete ✓",
    overall:8.0, hook:"The Shibuya arc is one of the greatest things in shonen manga. Everything after it is the story of ambition exceeding its runway.", tier:"B", color:D.amber,
    tagline:"A manga that had a genuine 9.0 work inside it — and could not quite finish delivering it.",
    overview:{
      surface:"High school students fight cursed spirits using supernatural techniques.",
      real:"A technically brilliant action manga with progressively darker ambitions — asking whether the strong have any obligation to the weak — before collapsing under those ambitions in the final stretch.",
      deep:"JJK is the most technically sophisticated action manga of its generation in terms of power system design and fight choreography. Mahito is one of the greatest villain introductions in shonen — a cursed spirit whose philosophy is genuinely disturbing: humans created cursed spirits through negative emotions, therefore cursed spirits are human nature stripped of self-deception. The Shibuya arc is where all of this potential was fully realized simultaneously. What followed revealed that Akutami was working without a fully constructed destination, improvising at Weekly Shonen Jump's relentless pace under significant health challenges."
    },
    scores:{Writing:8.0, Art:8.8, Themes:8.5, Twists:8.7, Characters:8.2, Pacing:7.0, "Emotional Impact":8.6, Consistency:6.8},
    scoreReasons:{
      "Writing":"8.0 — Akutami's plotting in the first half is exceptional — the Hidden Inventory arc demonstrates genuine literary craft, the Shibuya arc is masterful construction. The second half reveals ambition exceeded planning. Too many characters introduced without sufficient development. The final five chapters are a structural collapse that a work of this ambition deserved far better.",
      "Art":"8.8 — Akutami's visual creativity is extraordinary. The cursed technique designs, fight choreography and expressive faces during peak emotional moments are among the finest in shonen manga. The Shibuya arc pages are some of the most dynamic sequential art ever published in Weekly Shonen Jump. Not Inoue or Miura level for technical artistry but unmatched for kinetic energy.",
      "Themes":"8.5 — JJK is genuinely asking hard questions: what is the value of a proper death, what obligation do the strong have to the weak, can curses be understood rather than simply eliminated. These questions are present and interesting throughout. They are answered incompletely in the final arc. But the questions themselves are more sophisticated than most shonen manga attempts.",
      "Twists":"8.7 — Gojo being sealed in Shibuya. Nobara's apparent death. Geto's revealed manipulation by Kenjaku. The Culling Game's true purpose. JJK's twists in the first half are planted and paid off with genuine craft. The second half twists — particularly around Kenjaku's ultimate goal — are less precisely constructed. The first half twists alone would score 9.3+.",
      "Characters":"8.2 — Gojo, Geto, Nanami, Mahito — the first half cast is exceptionally well written. The Culling Game's character explosion dilutes this significantly. Yuji himself is the manga's most underserved character — his philosophical position is interesting but never developed with the depth it deserves. Nobara arguably the most interesting first-year receives the least resolution.",
      "Pacing":"7.0 — the manga's most significant weakness. Perfect in early arcs. Deteriorating through the Culling Game. Collapsed in the final five chapters. The gap between the Shibuya arc's pacing and the final arc's pacing is among the largest quality differentials in the works on this list. Weekly serialization and health challenges are context — not excuse.",
      "Emotional Impact":"8.6 — Junpei's death. Nanami's death. Gojo vs Sukuna. The Hidden Inventory arc's conclusion. JJK achieves genuine emotional devastation at its peaks. Mahito taunting Yuji over Junpei's death is one of the most viscerally upsetting villain moments in recent manga. The final arc's emotional beats land weakly by comparison — the characters are not given sufficient space.",
      "Consistency":"6.8 — the most damaging score. The gap between the Shibuya arc at 9.5 and the final chapters at 5.5 is enormous. JJK is a tale of two manga — a 9.0+ work in its first half and a 7.0 work in its second. This is the largest quality differential between peak and trough for any complete work on this list."
    },
    arcs:[
      {name:"Intro / Cursed Womb Arc",rating:8.8,tags:["Opening","Gojo","Sukuna"],hook:"One of the strongest manga openings in recent shonen.",analysis:"Yuji swallowing Sukuna's finger, the Detention Center mission, the introduction of Gojo — all handled with remarkable efficiency. The death of Haibara plants the seed of JJK's willingness to kill characters without ceremony — a promise the manga keeps aggressively."},
      {name:"Vs. Mahito Arc",rating:9.2,tags:["Mahito","Philosophy","Junpei","Devastating"],hook:"Mahito proves curses are the authentic expression of human nature. That is a genuinely disturbing philosophical position.",highlight:true,analysis:"Where JJK announces its true ambitions. Mahito is one of the greatest villain introductions in shonen manga. His philosophy: humans created cursed spirits through negative emotions, therefore cursed spirits are human nature stripped of self-deception. Junpei's death — gradual, cruel, avoidable — is the most emotionally devastating moment in the manga's first half."},
      {name:"Hidden Inventory / Gojo's Past",rating:9.4,tags:["Masterpiece","Geto","Tragedy","Friendship"],hook:"Can two people who genuinely love each other survive holding incompatible beliefs about the world?",highlight:true,analysis:"The greatest arc in JJK and one of the finest extended flashbacks in manga. Young Gojo and Geto's friendship, their ideological divergence, and the tragic deaths that separate them. Geto's turn is earned in a way Akutami rarely managed in the later chapters. The central question is handled with maturity beyond what the main story often achieves."},
      {name:"Shibuya Incident Arc",rating:9.5,tags:["Masterpiece","Greatest Arc","Nanami","Nobara","Scale"],hook:"The arc that justifies JJK's existence — regardless of everything that followed.",highlight:true,analysis:"The greatest sustained arc in JJK and one of the greatest action arcs in manga history. Gojo sealed. Nanami's death. Nobara's apparent death. The complete dismantling of the sorcerer world as established. Akutami was operating at his absolute ceiling — plotting, pacing, emotional impact and visual creativity all simultaneously at maximum. The Shibuya arc alone places JJK in the conversation about the greatest action manga ever written."},
      {name:"Culling Game Arc",rating:7.2,tags:["Decline","New Characters","Rushed","Pacing"],hook:"Too many characters. Too little time. Too much happening simultaneously.",analysis:"Where the serious decline begins. The battle royale structure introduces too many new characters with insufficient development. Pacing becomes genuinely problematic. Kashimo, Hakari, Higuruma — all interesting concepts poorly developed. The connective tissue between extraordinary moments becomes increasingly thin."},
      {name:"Shinjuku Showdown Arc",rating:7.8,tags:["Gojo Returns","Sukuna","Complex","Divisive"],hook:"Gojo vs Sukuna is visually extraordinary. The text walls explaining why nothing works are less so.",analysis:"Visually and technically extraordinary. But the technical complexity of JJK's power system becomes its weakness here when deployed without sufficient character grounding. Gojo's death is controversial but thematically defensible — the strongest person losing is the correct narrative choice. The execution is abrupt. The decision is correct."},
      {name:"Final Chapters (266-271)",rating:5.5,tags:["Rushed","5 Chapters","Incomplete","Disappointing"],hook:"Five chapters to conclude 271 chapters. No five chapters could responsibly carry that burden.",analysis:"The most significant craft failure in JJK. The final chapter — Yuji investigating a minor curse user — is thematically correct in its quietness but narratively abrupt. Nothing changed in Jujutsu society. The Gojo flashback is emotionally earned but the ending leaves too many significant threads unresolved. Akutami's health challenges are real context — but cannot fully excuse the incompleteness of the conclusion."},
    ],
    comparisons:[
      {title:"Chainsaw Man",verdict:"Same generation, different discipline",detail:"Both are the most formally ambitious shonen manga of their era. Chainsaw Man maintains discipline across both parts. JJK's first half matches Chainsaw Man Part 1. JJK's second half does not. The gap between their overall scores is specifically the second half consistency difference.",color:D.amber},
      {title:"AOT",verdict:"Ambitious endings compared",detail:"Both have controversial endings. AOT's chapter 139 partially contradicts its thesis — one chapter out of 139. JJK's final five chapters leave significant threads unresolved. AOT's ending failure is less structurally damaging. Hence 9.2 vs 8.0.",color:D.text},
      {title:"Demon Slayer",verdict:"Action manga quality ceiling",detail:"Both are action-forward shonen. Demon Slayer is consistent — consistently thin. JJK is inconsistent — with peaks Demon Slayer never reaches and a collapse it never experiences. JJK's ceiling is higher. JJK's floor is lower. Overall JJK wins at 8.0 vs 7.0.",color:D.amber},
    ],
    verdict:{score:8.0,line:"The Shibuya arc alone is essential. The rest of JJK is the story of what happens when that level of ambition runs out of time.",full:"JJK at 8.0 is a genuinely important manga that could not finish what it started. The Hidden Inventory arc, Mahito's introduction, the Shibuya Incident — these constitute a run of shonen manga that rivals anything in the genre's history. The Culling Game and final arc reveal that Akutami was working beyond his planning horizon, at pace, under health pressure, without a fully constructed conclusion. If you read only through Shibuya — you have read one of the greatest action manga ever made. If you read the complete work — you have also read its disappointment.",canReachS:false}
  },
];

// ─── HELPERS ─────────────────────────────────────────────────────────────────
const TIER_C = {S:D.blue, A:D.purple, B:D.amber, C:"rgba(52,211,153,0.7)", D:"rgba(148,163,184,0.6)"};
const sc = v => {
  if(!v && v!==0) return D.textFaint;
  if(v >= 9.0) return D.amber;
  if(v >= 8.5) return "rgba(232,230,224,0.75)";
  if(v >= 8.0) return "rgba(232,230,224,0.5)";
  if(v >= 7.0) return "rgba(232,230,224,0.35)";
  return "rgba(232,230,224,0.2)";
};
const getVisualContentType = (content) => {
  const type = (content?.type || "").toLowerCase();
  const text = [
    content?.type,
    content?.title,
    content?.hook,
    content?.tagline,
    content?.overview?.surface
  ].filter(Boolean).join(" ").toLowerCase();

  if (type === "manga" || type === "manhwa") return "manga";
  if (type === "anime") return "animated";
  if (type === "tv") return "live-action";
  if (type === "film") {
    if (text.includes("anime") || text.includes("animated")) return "animated";
    return "live-action";
  }
  return "live-action";
};
const getVisualCategory = (content, key) => {
  const defaults = {
    "Writing": {
      label: "Writing",
      description: "How well the story is constructed — plot architecture, dialogue, foreshadowing, narrative discipline and whether the ending earns everything that came before it."
    },
    "Themes": {
      label: "Themes",
      description: "The depth and discipline of the ideas the work is exploring — whether it asks serious questions, pursues them consistently, and answers them honestly rather than conveniently."
    },
    "Twists": {
      label: "Twists",
      description: "How well major revelations are planted and paid off — whether they recontextualize what came before, are consistent with established character logic, and deepen the story rather than merely shocking."
    },
    "Characters": {
      label: "Characters",
      description: "The psychological complexity, consistency and depth of the cast — whether characters grow believably, make decisions rooted in their established psychology, and leave a genuine impression."
    },
    "Pacing": {
      label: "Pacing",
      description: "How well the story controls time — whether it earns its slow moments, maintains tension across long stretches, and arrives at its destination without overstaying its welcome."
    },
    "Emotional Impact": {
      label: "Emotional Impact",
      description: "How effectively the work makes you feel — whether emotional peaks are earned through patient investment, and whether the feelings it generates are genuine rather than manufactured."
    },
    "Consistency": {
      label: "Consistency",
      description: "How evenly the quality is distributed across the full work — whether the ending matches the beginning, whether later arcs honor earlier ones, and whether the work maintains its identity throughout."
    }
  };

  if (key !== "Art") return defaults[key] || { label: key, description: "How this category is evaluated in Peak's framework." };

  const visualType = getVisualContentType(content);
  if (visualType === "manga") {
    return {
      label: "Art",
      description: "The quality and expressiveness of the visual craft — panel composition, character design, visual clarity, and how effectively the artwork carries the story."
    };
  }
  if (visualType === "animated") {
    return {
      label: "Animation",
      description: "The quality of animation — movement, fluidity, choreography, visual direction, and how effectively the animation enhances storytelling rather than just spectacle."
    };
  }
  return {
    label: "Cinematography",
    description: "The quality of visual direction — camera work, lighting, shot composition, framing, and how effectively the visuals support the story’s tone and emotion."
  };
};


// ─── SCORE DETAIL PAGE ───────────────────────────────────────────────────────
const ScoreDetailPage = ({ categoryKey, val, explanation, color, work, onBack }) => {
  const col = sc(val);
  const category = getVisualCategory(work, categoryKey);
  const label = category.label;

  useEffect(() => { window.scrollTo(0, 0); }, []);

  return (
    <div style={{ minHeight:"100vh", background:D.bg, color:D.text, fontFamily:D.serif, animation:"fadeIn 0.2s ease" }}>
      {/* Header */}
      <div style={{ position:"sticky", top:0, zIndex:50, background:"rgba(10,10,18,0.98)", backdropFilter:"blur(20px)", borderBottom:"1px solid rgba(255,255,255,0.05)", padding:"0 20px" }}>
        <div style={{ maxWidth:"700px", margin:"0 auto", height:"50px", display:"flex", alignItems:"center", gap:"14px" }}>
          <button onClick={onBack} style={{ background:"rgba(59,130,246,0.06)", border:"1px solid rgba(59,130,246,0.25)", borderRadius:"8px", padding:"6px 14px", color:"#3B82F6", fontSize:"11px", cursor:"pointer", fontFamily:D.mono, letterSpacing:"1px" }}>← BACK</button>
          <span style={{ fontSize:"11px", color:D.textDim, fontFamily:D.mono }}>{work.title} · Score Breakdown</span>
        </div>
      </div>

      <div style={{ maxWidth:"700px", margin:"0 auto", padding:"32px 20px 80px" }}>
        {/* Category header */}
        <div style={{ marginBottom:"32px" }}>
          <div style={{ fontSize:"10px", color:`${color}80`, fontFamily:D.mono, letterSpacing:"4px", marginBottom:"10px" }}>CRAFT CATEGORY</div>
          <h1 style={{ margin:"0 0 6px", fontSize:"clamp(28px,6vw,44px)", fontWeight:"900", color:D.text, letterSpacing:"-0.5px" }}>{label}</h1>
          <p style={{ margin:0, fontSize:"14px", color:D.textDim, lineHeight:1.6, fontFamily:D.serif }}>{category.description}</p>
        </div>

        {/* Score display */}
        <div style={{ textAlign:"center", padding:"36px 20px", background:`linear-gradient(135deg,${col}12 0%,transparent 100%)`, border:`1px solid ${col}30`, borderRadius:"20px", marginBottom:"28px" }}>
          <div style={{ fontSize:"10px", color:`${col}80`, fontFamily:D.mono, letterSpacing:"3px", marginBottom:"12px" }}>
            {work.title.toUpperCase()} · {label.toUpperCase()} SCORE
          </div>
          <div style={{ fontSize:"88px", fontWeight:"900", color:col, fontFamily:D.mono, lineHeight:1, letterSpacing:"-4px", marginBottom:"6px" }}>{val?.toFixed(1)}</div>
          <div style={{ fontSize:"13px", color:D.textFaint, fontFamily:D.mono }}>/10</div>

          {/* Score bar full width */}
          <div style={{ marginTop:"24px", height:"6px", background:"rgba(255,255,255,0.06)", borderRadius:"3px", overflow:"hidden" }}>
            <div style={{ width:`${(val/10)*100}%`, height:"100%", background:D.amber, borderRadius:"3px", transition:"width 1s ease" }}/>
          </div>

          {/* Score label */}
          <div style={{ marginTop:"12px", fontSize:"12px", color:D.textDim, fontFamily:D.mono }}>
            {val >= 9.5 ? "Exceptional — among the greatest ever" :
             val >= 9.0 ? "Outstanding — top tier" :
             val >= 8.5 ? "Excellent — above average" :
             val >= 8.0 ? "Very good" :
             val >= 7.0 ? "Good — competent" :
             val >= 6.0 ? "Average" :
             "Below average"}
          </div>
        </div>

        {/* Why this score */}
        <div style={{ background:"rgba(255,255,255,0.02)", border:"1px solid rgba(255,255,255,0.06)", borderRadius:"16px", padding:"24px 26px", marginBottom:"24px" }}>
          <div style={{ fontSize:"10px", color:D.textFaint, fontFamily:D.mono, letterSpacing:"3px", marginBottom:"16px" }}>
            WHY {work.title.toUpperCase()} SCORES {val?.toFixed(1)} IN {label.toUpperCase()}
          </div>
          <p style={{ margin:0, fontSize:"15px", color:D.textMid, lineHeight:1.9, fontFamily:D.serif }}>
            {explanation || "Detailed analysis not yet available for this category."}
          </p>
        </div>
      </div>
    </div>
  );
};

// ─── SCORE BAR — tappable, opens full detail page ─────────────────────────────
const ScoreBar = ({ label, val, animate, explanation, color, work, onOpenDetail }) => {
  const display = getVisualCategory(work, label);
  const displayLabel = display.label;
  if (!val && val !== 0) return (
    <div style={{ marginBottom:"10px" }}>
      <div style={{ display:"flex", justifyContent:"space-between", marginBottom:"5px" }}>
        <span style={{ fontSize:"11px", color:D.textDim, fontFamily:D.mono, textTransform:"uppercase", letterSpacing:"0.8px" }}>{displayLabel}</span>
        <span style={{ fontSize:"11px", color:D.textFaint, fontFamily:D.mono }}>N/A</span>
      </div>
      <div style={{ height:"4px", background:"rgba(255,255,255,0.04)", borderRadius:"2px" }}/>
    </div>
  );
  const col = sc(val);
  const hasDetail = explanation && explanation.length > 0;
  return (
    <div
      style={{ marginBottom:"12px", cursor: hasDetail ? "pointer" : "default" }}
      onClick={() => hasDetail && onOpenDetail && onOpenDetail(label, val, explanation)}
    >
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"5px" }}>
        <div style={{ display:"flex", alignItems:"center", gap:"6px" }}>
          <span style={{ fontSize:"11px", color:D.textMid, fontFamily:D.mono, textTransform:"uppercase", letterSpacing:"0.8px" }}>{displayLabel}</span>
          {hasDetail && <span style={{ fontSize:"9px", color:`${col}80`, fontFamily:D.mono, border:`1px solid ${col}30`, borderRadius:"3px", padding:"0px 4px" }}>TAP ↗</span>}
        </div>
        <span style={{ fontSize:"14px", color:col, fontFamily:D.mono, fontWeight:"900" }}>{val.toFixed(1)}</span>
      </div>
      <div style={{ height:"4px", background:"rgba(255,255,255,0.06)", borderRadius:"2px", overflow:"hidden" }}>
        <div style={{ width:animate?`${(val/10)*100}%`:"0%", height:"100%", background:D.amber, borderRadius:"2px", transition:"width 1.2s cubic-bezier(0.16,1,0.3,1)" }}/>
      </div>
    </div>
  );
};

// ─── ARC CARD — with spoiler gate ────────────────────────────────────────────
const ArcCard = ({ arc, color, index }) => {
  const [spoilerShown, setSpoilerShown] = useState(false);
  const [open, setOpen] = useState(false);
  const col = sc(arc.rating);

  return (
    <div style={{ borderRadius:"14px", overflow:"hidden", border:arc.highlight?`1px solid ${color}50`:"1px solid rgba(255,255,255,0.07)", background:D.bgCard, marginBottom:"10px", boxShadow:"none", animation:`slideIn 0.4s ease ${index*0.06}s both` }}>
      {/* Arc header — always visible */}
      <div style={{ padding:"14px 16px" }}>
        <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", gap:"12px" }}>
          <div style={{ flex:1 }}>
            <div style={{ display:"flex", alignItems:"center", gap:"8px", marginBottom:"5px", flexWrap:"wrap" }}>
              {arc.highlight && <span style={{ fontSize:"9px", color:color, fontFamily:D.mono, fontWeight:"900", letterSpacing:"2px", border:`1px solid ${color}60`, borderRadius:"4px", padding:"1px 6px", flexShrink:0 }}>★ KEY ARC</span>}
              <span style={{ fontSize:"14px", fontWeight:"800", color:D.text, fontFamily:D.serif }}>{arc.name}</span>
            </div>
            <div style={{ display:"flex", gap:"5px", flexWrap:"wrap", marginBottom:"8px" }}>
              {arc.tags.map(t => <span key={t} style={{ fontSize:"9px", color:D.textDim, fontFamily:D.mono, border:"1px solid rgba(255,255,255,0.08)", borderRadius:"4px", padding:"1px 6px" }}>{t}</span>)}
            </div>
            <p style={{ margin:0, fontSize:"12px", color:D.textDim, fontFamily:D.serif, fontStyle:"italic" }}>"{arc.hook}"</p>
          </div>
          <div style={{ flexShrink:0, textAlign:"right" }}>
            <div style={{ fontSize:"22px", fontWeight:"900", color:col, fontFamily:D.mono, lineHeight:1 }}>{arc.rating.toFixed(1)}</div>
            <div style={{ fontSize:"9px", color:D.textFaint, fontFamily:D.mono }}>/10</div>
          </div>
        </div>
      </div>

      {/* Spoiler gate / Analysis section */}
      <div style={{ borderTop:"1px solid rgba(255,255,255,0.05)" }}>
        {!spoilerShown ? (
          // Spoiler warning
          <div style={{ padding:"14px 16px", display:"flex", alignItems:"center", justifyContent:"space-between", gap:"12px", background:"rgba(255,255,255,0.02)" }}>
            <div>
              <div style={{ fontSize:"9px", color:D.amber, fontFamily:D.mono, letterSpacing:"2px", marginBottom:"4px" }}>⚠ SPOILER WARNING</div>
              <p style={{ margin:0, fontSize:"12px", color:D.textDim, fontFamily:D.serif }}>Full analysis contains plot details and story spoilers.</p>
            </div>
            <button
              onClick={() => { setSpoilerShown(true); setOpen(true); }}
              style={{ flexShrink:0, padding:"8px 14px", background:"rgba(255,212,59,0.1)", border:"1px solid rgba(255,212,59,0.4)", borderRadius:"8px", color:D.amber, fontSize:"11px", cursor:"pointer", fontFamily:D.mono, letterSpacing:"1px", whiteSpace:"nowrap" }}
            >
              I've read it →
            </button>
          </div>
        ) : (
          // Shown — toggle analysis
          <div>
            <div onClick={() => setOpen(o=>!o)} style={{ padding:"10px 16px", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
              <span style={{ fontSize:"11px", color:D.textDim, fontFamily:D.mono }}>{open ? "Hide analysis" : "Show full analysis"}</span>
              <span style={{ fontSize:"14px", color:D.textFaint, transform:open?"rotate(180deg)":"rotate(0deg)", transition:"transform 0.2s", display:"inline-block" }}>▾</span>
            </div>
            {open && (
              <div style={{ padding:"0 16px 16px", animation:"expandIn 0.3s ease" }}>
                <p style={{ margin:0, fontSize:"13px", color:D.textMid, lineHeight:1.85, fontFamily:D.serif }}>{arc.analysis}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

const CmpCard=({comp,index,onSelect})=>{
  const[open,setOpen]=useState(false);
  const target=WORKS.find(w=>w.title.toLowerCase()===comp.title.toLowerCase()||w.title.toLowerCase().includes(comp.title.toLowerCase())||comp.title.toLowerCase().includes(w.title.toLowerCase()));
  const handleClick=()=>{
    if(open&&target){onSelect(target);return;}
    setOpen(o=>!o);
  };
  return(
    <div onClick={handleClick} style={{minWidth:"200px",maxWidth:"240px",background:D.bgCard,border:"1px solid rgba(255,255,255,0.07)",borderRadius:"4px",padding:"16px",cursor:"pointer",flexShrink:0,transition:"all 0.22s",boxShadow:open?`0 0 24px ${comp.color}18`:"none",animation:`slideIn 0.4s ease ${index*0.1}s both`}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"8px"}}>
        <span style={{fontSize:"14px",fontWeight:"800",color:D.text,fontFamily:D.serif}}>{comp.title}</span>
        <span style={{fontSize:"12px",color:comp.color}}>⚔</span>
      </div>
      <div style={{fontSize:"11px",color:comp.color,fontFamily:D.mono,fontWeight:"700",letterSpacing:"0.5px",marginBottom:open?"8px":"0"}}>{comp.verdict}</div>
      {open&&(
        <div style={{animation:"expandIn 0.25s ease"}}>
          <p style={{margin:"8px 0 10px",fontSize:"12px",color:D.textDim,lineHeight:1.7,fontFamily:D.serif}}>{comp.detail}</p>
          {target&&(
            <div style={{display:"flex",alignItems:"center",gap:"8px",padding:"8px 10px",background:"rgba(255,255,255,0.04)",border:`1px solid ${comp.color}30`,borderRadius:"6px"}}>
              <div style={{flex:1}}>
                <div style={{fontSize:"10px",color:comp.color,fontFamily:D.mono,letterSpacing:"1px",marginBottom:"2px"}}>VIEW RATING</div>
                <div style={{fontSize:"12px",color:D.text,fontFamily:D.serif,fontWeight:"700"}}>{target.title} · {target.overall.toFixed(1)}</div>
              </div>
              <span style={{color:D.textFaint,fontSize:"14px"}}>›</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// ─── NARRATIVE VISUALIZATIONS ─────────────────────────────────────────────────
const NARRATIVE_SHAPES = {
  "aot": (color) => `
    <style>
      @keyframes expandRingA { from { r: 5; opacity: 0.9; } to { r: 150; opacity: 0; } }
      @keyframes drawSpokeA { to { stroke-dashoffset: 0; } }
      .ra1 { animation: expandRingA 3s ease-out infinite; }
      .ra2 { animation: expandRingA 3s ease-out 0.5s infinite; }
      .ra3 { animation: expandRingA 3s ease-out 1s infinite; }
      .ra4 { animation: expandRingA 3s ease-out 1.5s infinite; }
      .ra5 { animation: expandRingA 3s ease-out 2s infinite; }
      .ra6 { animation: expandRingA 3s ease-out 2.5s infinite; }
      .spa { stroke-dasharray: 145; stroke-dashoffset: 145; animation: drawSpokeA 2s ease forwards; }
    </style>
    <text x="200" y="24" text-anchor="middle" fill="${color}" font-size="9" font-family="monospace" letter-spacing="3" opacity="0.6">EVERYTHING IS A PLOT POINT</text>
    <circle class="ra1" cx="200" cy="195" r="5" fill="none" stroke="${color}" stroke-width="1.2"/>
    <circle class="ra2" cx="200" cy="195" r="5" fill="none" stroke="${color}" stroke-width="1.2"/>
    <circle class="ra3" cx="200" cy="195" r="5" fill="none" stroke="${color}" stroke-width="1.2"/>
    <circle class="ra4" cx="200" cy="195" r="5" fill="none" stroke="${color}" stroke-width="1.2"/>
    <circle class="ra5" cx="200" cy="195" r="5" fill="none" stroke="${color}" stroke-width="1.2"/>
    <circle class="ra6" cx="200" cy="195" r="5" fill="none" stroke="${color}" stroke-width="1.2"/>
    <line class="spa" x1="200" y1="195" x2="345" y2="195" stroke="${color}" stroke-width="0.6" stroke-opacity="0.3" style="animation-delay:0s"/>
    <line class="spa" x1="200" y1="195" x2="272" y2="69" stroke="${color}" stroke-width="0.6" stroke-opacity="0.3" style="animation-delay:0.1s"/>
    <line class="spa" x1="200" y1="195" x2="128" y2="69" stroke="${color}" stroke-width="0.6" stroke-opacity="0.3" style="animation-delay:0.2s"/>
    <line class="spa" x1="200" y1="195" x2="55" y2="195" stroke="${color}" stroke-width="0.6" stroke-opacity="0.3" style="animation-delay:0.3s"/>
    <line class="spa" x1="200" y1="195" x2="128" y2="321" stroke="${color}" stroke-width="0.6" stroke-opacity="0.3" style="animation-delay:0.4s"/>
    <line class="spa" x1="200" y1="195" x2="272" y2="321" stroke="${color}" stroke-width="0.6" stroke-opacity="0.3" style="animation-delay:0.5s"/>
    <line class="spa" x1="200" y1="195" x2="345" y2="100" stroke="${color}" stroke-width="0.6" stroke-opacity="0.2" style="animation-delay:0.6s"/>
    <line class="spa" x1="200" y1="195" x2="200" y2="50" stroke="${color}" stroke-width="0.6" stroke-opacity="0.2" style="animation-delay:0.7s"/>
    <line class="spa" x1="200" y1="195" x2="55" y2="100" stroke="${color}" stroke-width="0.6" stroke-opacity="0.2" style="animation-delay:0.8s"/>
    <line class="spa" x1="200" y1="195" x2="55" y2="290" stroke="${color}" stroke-width="0.6" stroke-opacity="0.2" style="animation-delay:0.9s"/>
    <line class="spa" x1="200" y1="195" x2="200" y2="340" stroke="${color}" stroke-width="0.6" stroke-opacity="0.2" style="animation-delay:1s"/>
    <line class="spa" x1="200" y1="195" x2="345" y2="290" stroke="${color}" stroke-width="0.6" stroke-opacity="0.2" style="animation-delay:1.1s"/>
    <circle cx="200" cy="195" r="3" fill="${color}" opacity="1"/>
  `,
  "aot-anime": (color) => `
    <style>
      @keyframes expandRingB { from { r: 5; opacity: 0.9; } to { r: 150; opacity: 0; } }
      @keyframes drawSpokeB { to { stroke-dashoffset: 0; } }
      .rb1 { animation: expandRingB 3s ease-out infinite; }
      .rb2 { animation: expandRingB 3s ease-out 0.5s infinite; }
      .rb3 { animation: expandRingB 3s ease-out 1s infinite; }
      .rb4 { animation: expandRingB 3s ease-out 1.5s infinite; }
      .rb5 { animation: expandRingB 3s ease-out 2s infinite; }
      .rb6 { animation: expandRingB 3s ease-out 2.5s infinite; }
      .spb { stroke-dasharray: 145; stroke-dashoffset: 145; animation: drawSpokeB 2s ease forwards; }
    </style>
    <text x="200" y="24" text-anchor="middle" fill="${color}" font-size="9" font-family="monospace" letter-spacing="3" opacity="0.6">EVERYTHING IS A PLOT POINT</text>
    <circle class="rb1" cx="200" cy="195" r="5" fill="none" stroke="${color}" stroke-width="1.2"/>
    <circle class="rb2" cx="200" cy="195" r="5" fill="none" stroke="${color}" stroke-width="1.2"/>
    <circle class="rb3" cx="200" cy="195" r="5" fill="none" stroke="${color}" stroke-width="1.2"/>
    <circle class="rb4" cx="200" cy="195" r="5" fill="none" stroke="${color}" stroke-width="1.2"/>
    <circle class="rb5" cx="200" cy="195" r="5" fill="none" stroke="${color}" stroke-width="1.2"/>
    <circle class="rb6" cx="200" cy="195" r="5" fill="none" stroke="${color}" stroke-width="1.2"/>
    <line class="spb" x1="200" y1="195" x2="345" y2="195" stroke="${color}" stroke-width="0.6" stroke-opacity="0.3" style="animation-delay:0s"/>
    <line class="spb" x1="200" y1="195" x2="272" y2="69" stroke="${color}" stroke-width="0.6" stroke-opacity="0.3" style="animation-delay:0.1s"/>
    <line class="spb" x1="200" y1="195" x2="128" y2="69" stroke="${color}" stroke-width="0.6" stroke-opacity="0.3" style="animation-delay:0.2s"/>
    <line class="spb" x1="200" y1="195" x2="55" y2="195" stroke="${color}" stroke-width="0.6" stroke-opacity="0.3" style="animation-delay:0.3s"/>
    <line class="spb" x1="200" y1="195" x2="128" y2="321" stroke="${color}" stroke-width="0.6" stroke-opacity="0.3" style="animation-delay:0.4s"/>
    <line class="spb" x1="200" y1="195" x2="272" y2="321" stroke="${color}" stroke-width="0.6" stroke-opacity="0.3" style="animation-delay:0.5s"/>
    <circle cx="200" cy="195" r="3" fill="${color}" opacity="1"/>
  `,
  "berserk": (color) => `
    <style>
      @keyframes drawLineB { to { stroke-dashoffset: 0; } }
      .bm { stroke-dasharray: 600; stroke-dashoffset: 600; animation: drawLineB 2s ease forwards; }
      .bf1 { stroke-dasharray: 200; stroke-dashoffset: 200; animation: drawLineB 1s ease 2s forwards; opacity: 0.7; }
      .bf2 { stroke-dasharray: 180; stroke-dashoffset: 180; animation: drawLineB 1s ease 2.2s forwards; opacity: 0.5; }
      .bf3 { stroke-dasharray: 150; stroke-dashoffset: 150; animation: drawLineB 1s ease 2.4s forwards; opacity: 0.3; }
    </style>
    <text x="200" y="24" text-anchor="middle" fill="${color}" font-size="9" font-family="monospace" letter-spacing="3" opacity="0.6">A DESCENT WITH NO FLOOR</text>
    <path class="bm" d="M200,40 C200,80 185,120 175,160 C165,200 155,230 140,280" fill="none" stroke="${color}" stroke-width="2"/>
    <path class="bf1" d="M140,280 C120,295 90,310 60,330" fill="none" stroke="${color}" stroke-width="1.5"/>
    <path class="bf2" d="M140,280 C130,300 125,320 110,350" fill="none" stroke="${color}" stroke-width="1.5"/>
    <path class="bf3" d="M140,280 C150,295 160,315 170,345" fill="none" stroke="${color}" stroke-width="1.5"/>
    <circle cx="200" cy="40" r="3" fill="${color}" opacity="0.8"/>
  `,
  "vs": (color) => `
    <style>
      @keyframes drawVS { to { stroke-dashoffset: 0; } }
      @keyframes growSeedVS { to { r: 8; opacity: 1; } }
      .vsp { stroke-dasharray: 600; stroke-dashoffset: 600; animation: drawVS 2.5s ease forwards; }
      .vsseed { r: 0; opacity: 0; animation: growSeedVS 1s ease 2.5s forwards; }
    </style>
    <text x="200" y="24" text-anchor="middle" fill="${color}" font-size="9" font-family="monospace" letter-spacing="3" opacity="0.6">A WEAPON BECOMING A SEED</text>
    <path class="vsp" d="M60,280 C80,240 100,200 130,160 C155,125 175,100 200,80 C225,60 255,55 280,70 C305,88 315,120 300,150" fill="none" stroke="${color}" stroke-width="2" stroke-opacity="0.8"/>
    <circle class="vsseed" cx="200" cy="200" fill="${color}" opacity="0"/>
  `,
  "monster": (color) => `
    <style>
      @keyframes drawMon { to { stroke-dashoffset: 0; } }
      @keyframes pulseMon { 0%,100%{r:4} 50%{r:7} }
      .ml1 { stroke-dasharray: 500; stroke-dashoffset: 500; animation: drawMon 2.5s ease forwards; }
      .ml2 { stroke-dasharray: 500; stroke-dashoffset: 500; animation: drawMon 2.5s ease 0.3s forwards; }
      .mc { animation: pulseMon 2s ease infinite 2.5s; }
    </style>
    <text x="200" y="24" text-anchor="middle" fill="${color}" font-size="9" font-family="monospace" letter-spacing="3" opacity="0.6">TWO LINES. ONE TRUTH.</text>
    <path class="ml1" d="M40,80 C100,90 150,120 200,200 C230,240 260,260 360,270" fill="none" stroke="${color}" stroke-width="1.5" stroke-opacity="0.9"/>
    <path class="ml2" d="M40,300 C100,285 150,260 200,200 C230,165 260,140 360,130" fill="none" stroke="${color}" stroke-width="1.5" stroke-opacity="0.5"/>
    <circle class="mc" cx="200" cy="200" r="4" fill="${color}"/>
  `,
  "monster-anime": (color) => `
    <style>
      @keyframes drawMonA { to { stroke-dashoffset: 0; } }
      @keyframes pulseMonA { 0%,100%{r:4} 50%{r:7} }
      .ma1 { stroke-dasharray: 500; stroke-dashoffset: 500; animation: drawMonA 2.5s ease forwards; }
      .ma2 { stroke-dasharray: 500; stroke-dashoffset: 500; animation: drawMonA 2.5s ease 0.3s forwards; }
      .mca { animation: pulseMonA 2s ease infinite 2.5s; }
    </style>
    <text x="200" y="24" text-anchor="middle" fill="${color}" font-size="9" font-family="monospace" letter-spacing="3" opacity="0.6">TWO LIVES. ONE TRUTH.</text>
    <path class="ma1" d="M40,80 C100,90 150,120 200,200 C230,240 260,260 360,270" fill="none" stroke="${color}" stroke-width="1.5" stroke-opacity="0.9"/>
    <path class="ma2" d="M40,300 C100,285 150,260 200,200 C230,165 260,140 360,130" fill="none" stroke="${color}" stroke-width="1.5" stroke-opacity="0.5"/>
    <circle class="mca" cx="200" cy="200" r="4" fill="${color}"/>
  `,
  "vagabond": (color) => `
    <style>
      @keyframes brushV { to { stroke-dashoffset: 0; opacity: 0.9; } }
      @keyframes fadeV { to { opacity: 1; } }
      .vs1 { stroke-dasharray: 300; stroke-dashoffset: 300; opacity: 0; animation: brushV 1.5s ease forwards; }
      .vs2 { stroke-dasharray: 200; stroke-dashoffset: 200; opacity: 0; animation: brushV 1s ease 0.8s forwards; }
      .vs3 { stroke-dasharray: 100; stroke-dashoffset: 100; opacity: 0; animation: brushV 0.8s ease 1.4s forwards; }
      .vc { opacity: 0; animation: fadeV 1s ease 2s forwards; }
    </style>
    <text x="200" y="24" text-anchor="middle" fill="${color}" font-size="9" font-family="monospace" letter-spacing="3" opacity="0.6">THE SWORD SURRENDERED</text>
    <path class="vs1" d="M80,60 C120,80 160,140 180,200 C195,245 200,270 195,310" fill="none" stroke="${color}" stroke-width="8" stroke-linecap="round" stroke-opacity="0"/>
    <path class="vs2" d="M140,120 C160,140 180,170 185,200" fill="none" stroke="${color}" stroke-width="4" stroke-linecap="round" stroke-opacity="0"/>
    <path class="vs3" d="M160,180 C170,195 178,210 180,225" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-opacity="0"/>
    <circle class="vc" cx="200" cy="190" r="40" fill="none" stroke="${color}" stroke-width="0.5" stroke-opacity="0.3"/>
  `,
  "death-note": (color) => `
    <style>
      @keyframes drawDN { to { stroke-dashoffset: 0; } }
      @keyframes moveDN { 0%{cx:80;cy:80} 25%{cx:200;cy:120} 50%{cx:120;cy:200} 75%{cx:280;cy:160} 100%{cx:200;cy:280} }
      .dng { stroke-dasharray: 400; stroke-dashoffset: 400; animation: drawDN 2s ease forwards; }
      .dnk { animation: moveDN 4s ease infinite; }
    </style>
    <text x="200" y="24" text-anchor="middle" fill="${color}" font-size="9" font-family="monospace" letter-spacing="3" opacity="0.6">EVERY MOVE CALCULATED</text>
    <line class="dng" x1="80" y1="60" x2="80" y2="340" stroke="${color}" stroke-width="0.5" stroke-opacity="0.2"/>
    <line class="dng" x1="160" y1="60" x2="160" y2="340" stroke="${color}" stroke-width="0.5" stroke-opacity="0.2" style="animation-delay:0.2s"/>
    <line class="dng" x1="240" y1="60" x2="240" y2="340" stroke="${color}" stroke-width="0.5" stroke-opacity="0.2" style="animation-delay:0.4s"/>
    <line class="dng" x1="320" y1="60" x2="320" y2="340" stroke="${color}" stroke-width="0.5" stroke-opacity="0.2" style="animation-delay:0.6s"/>
    <line class="dng" x1="40" y1="80" x2="360" y2="80" stroke="${color}" stroke-width="0.5" stroke-opacity="0.2" style="animation-delay:0.1s"/>
    <line class="dng" x1="40" y1="160" x2="360" y2="160" stroke="${color}" stroke-width="0.5" stroke-opacity="0.2" style="animation-delay:0.3s"/>
    <line class="dng" x1="40" y1="240" x2="360" y2="240" stroke="${color}" stroke-width="0.5" stroke-opacity="0.2" style="animation-delay:0.5s"/>
    <circle class="dnk" cx="80" cy="80" r="5" fill="${color}" opacity="0.9"/>
  `,
  "breaking-bad": (color) => `
    <style>
      @keyframes descentBB { to { stroke-dashoffset: 0; } }
      @keyframes glowBB { 0%,100%{opacity:0.3} 50%{opacity:1} }
      .bbc { stroke-dasharray: 600; stroke-dashoffset: 600; animation: descentBB 3s ease forwards; }
      .bbd { animation: glowBB 2s ease infinite 3s; }
    </style>
    <text x="200" y="24" text-anchor="middle" fill="${color}" font-size="9" font-family="monospace" letter-spacing="3" opacity="0.6">THE INEVITABLE DESCENT</text>
    <path class="bbc" d="M60,100 C100,98 140,95 180,100 C220,108 250,130 270,170 C290,210 295,255 290,300 C285,330 270,345 250,355" fill="none" stroke="${color}" stroke-width="2" stroke-opacity="0.9"/>
    <line x1="60" y1="100" x2="350" y2="100" stroke="${color}" stroke-width="0.5" stroke-opacity="0.2" stroke-dasharray="4,4"/>
    <circle class="bbd" cx="250" cy="355" r="5" fill="${color}"/>
  `,
  "vinland-saga-anime": (color) => `
    <style>
      @keyframes drawVSA { to { stroke-dashoffset: 0; } }
      .vsap { stroke-dasharray: 800; stroke-dashoffset: 800; animation: drawVSA 3s ease forwards; }
    </style>
    <text x="200" y="24" text-anchor="middle" fill="${color}" font-size="9" font-family="monospace" letter-spacing="3" opacity="0.6">RAGE BECOMING PEACE</text>
    <path class="vsap" d="M60,280 L100,240 L80,200 L120,160 L100,120 L160,80 L200,100 L240,60 L280,100 L260,140 L300,180 L280,220 L320,260 L340,300" fill="none" stroke="${color}" stroke-width="2" stroke-opacity="0.8"/>
  `,
  "fmab": (color) => `
    <style>
      @keyframes drawFM { to { stroke-dashoffset: 0; } }
      .fmc { stroke-dasharray: 800; stroke-dashoffset: 800; animation: drawFM 2s ease forwards; }
      .fmi { stroke-dasharray: 400; stroke-dashoffset: 400; animation: drawFM 1.5s ease 0.5s forwards; }
    </style>
    <text x="200" y="24" text-anchor="middle" fill="${color}" font-size="9" font-family="monospace" letter-spacing="3" opacity="0.6">EQUIVALENT EXCHANGE</text>
    <circle class="fmc" cx="200" cy="195" r="130" fill="none" stroke="${color}" stroke-width="1" stroke-opacity="0.5"/>
    <circle class="fmi" cx="200" cy="195" r="80" fill="none" stroke="${color}" stroke-width="1.5" stroke-opacity="0.7"/>
    <circle cx="200" cy="195" r="8" fill="${color}" opacity="0.9"/>
    <circle cx="330" cy="195" r="4" fill="${color}" opacity="0.6"/>
    <circle cx="265" cy="82" r="4" fill="${color}" opacity="0.6"/>
    <circle cx="135" cy="82" r="4" fill="${color}" opacity="0.6"/>
    <circle cx="70" cy="195" r="4" fill="${color}" opacity="0.6"/>
    <circle cx="135" cy="308" r="4" fill="${color}" opacity="0.6"/>
    <circle cx="265" cy="308" r="4" fill="${color}" opacity="0.6"/>
  `,
  "default": (color) => `
    <style>
      @keyframes drawDef { to { stroke-dashoffset: 0; } }
      .defl { stroke-dasharray: 400; stroke-dashoffset: 400; animation: drawDef 2s ease forwards; }
    </style>
    <line class="defl" x1="60" y1="200" x2="340" y2="200" stroke="${color}" stroke-width="2" stroke-opacity="0.8"/>
    <circle cx="340" cy="200" r="4" fill="${color}"/>
  `
};

const NarrativeViz = ({ work }) => {
  const color = work.color || D.amber;
  const shape = NARRATIVE_SHAPES[work.id] || NARRATIVE_SHAPES["default"];
  const svgContent = shape(color);
  const labels = {
    "aot": "Spiral — every thread connects back to one point",
    "aot-anime": "Spiral — every thread connects back to one point",
    "berserk": "A descent with no floor — then fracture",
    "vs": "A weapon becoming a seed",
    "vagabond": "A brushstroke dissolving into stillness",
    "monster": "Two lives converging on one truth",
    "monster-anime": "Two lives converging on one truth",
    "death-note": "A chess match against the world — every move calculated",
    "breaking-bad": "A straight line that curves into nothing",
    "fmab": "A closed circle — everything balanced",
    "vinland-saga-anime": "Rage becoming peace",
  };
  const label = labels[work.id] || "Narrative structure";

  return (
    <div style={{margin:"28px 0",animation:"fadeIn 0.5s ease"}}>
      <div style={{fontSize:"10px",color:`${color}60`,fontFamily:D.mono,letterSpacing:"3px",marginBottom:"12px"}}>NARRATIVE STRUCTURE</div>
      <div style={{background:"rgba(255,255,255,0.01)",border:`1px solid ${color}18`,borderRadius:"12px",overflow:"hidden"}}>
        <svg viewBox="0 0 400 360" width="100%" style={{display:"block",maxHeight:"220px"}}
          dangerouslySetInnerHTML={{__html:svgContent}}
        />
        <div style={{padding:"10px 16px",borderTop:`1px solid ${color}15`}}>
          <p style={{margin:0,fontSize:"11px",color:D.textDim,fontFamily:D.serif,fontStyle:"italic"}}>{label}</p>
        </div>
      </div>
    </div>
  );
};




// ─── GUIDED NEXT ─────────────────────────────────────────────────────────────
const GUIDED_NEXT_MAP = {
  // [work.id]: [ {type, targetId, line}, ... ]
  "vs":        [{type:"experience",targetId:"berserk",    line:"Same weight. Same patience. But this one never stops falling."},{type:"craft",    targetId:"vagabond",  line:"Same philosophical ambition. Drawn with a brush instead of a pen."},{type:"contrast", targetId:"monster",   line:"Same question about violence. Answered through conversation, not war."}],
  "berserk":   [{type:"experience",targetId:"vs",         line:"If the descent worked for you — this one finds a way back up."},{type:"craft",    targetId:"csm",       line:"Same darkness. But Fujimoto builds his from cinema, not mythology."},{type:"contrast", targetId:"vagabond",  line:"Same obsession with the sword. This one asks what happens when you put it down."}],
  "vagabond":  [{type:"experience",targetId:"vs",         line:"Same stillness. Same cost. A different kind of war."},{type:"craft",    targetId:"berserk",   line:"Same brushwork ambition. Miura builds his world darker, denser."},{type:"contrast", targetId:"slam-dunk", line:"Same artist. Same emotional precision. But pure joy instead of emptiness."}],
  "monster":   [{type:"experience",targetId:"dn-manga",   line:"Same chess match energy. But the pieces are souls, not strategy."},{type:"craft",    targetId:"20cb",      line:"Same Urasawa architecture. A warmer story asking a colder question."},{type:"contrast", targetId:"berserk",   line:"Same darkness. Berserk uses spectacle. Monster uses silence."}],
  "csm-film":  [{type:"experience",targetId:"csm",        line:"The film was the peak. Now read what it came from."},{type:"craft",    targetId:"oshi",      line:"Both examine whether performance can become genuine feeling."},{type:"contrast", targetId:"vs",        line:"Same emotional register — something was real. But this one survives."}],
  "bb":        [{type:"experience",targetId:"dn-manga",   line:"Same corruption arc. Different medium, same psychological precision."},{type:"craft",    targetId:"monster",   line:"Same architecture — a moral man tracking a monster he helped create."},{type:"contrast", targetId:"got",       line:"Same peak quality. One held it. One didn't. That gap tells you everything."}],
  "aot-manga": [{type:"experience",targetId:"aot-anime",  line:"You read it. Now hear Sawano play over Erwin's charge."},{type:"craft",    targetId:"csm",       line:"Same twist architecture. Fujimoto plants seeds differently — deeper, stranger."},{type:"contrast", targetId:"vs",        line:"AOT asks if freedom is possible through violence. This answers no — and shows the cost."}],
  "slam-dunk": [{type:"experience",targetId:"vagabond",   line:"Same artist. Twenty years later. The joy becomes something quieter."},{type:"craft",    targetId:"op",        line:"Same emotional investment in the ensemble. Longer road, same destination."},{type:"contrast", targetId:"berserk",   line:"Inoue's other masterwork. The sword has no joy here."}],
  "dn-manga":  [{type:"experience",targetId:"monster",    line:"Same psychological precision. Johan makes Light look like an amateur."},{type:"craft",    targetId:"bb",        line:"Same corruption study. Breaking Bad gives Walt five seasons. Ohba gives Light 108 chapters."},{type:"contrast", targetId:"csm",       line:"Light planned everything. Denji wants a girlfriend. Both end the same way."}],
  "fmab":      [{type:"experience",targetId:"aot-anime",  line:"You appreciated the ending. This one doesn't give you one."},{type:"craft",    targetId:"monster",   line:"Same long-game plotting discipline. Urasawa's payoff is darker."},{type:"contrast", targetId:"berserk",   line:"FMAB closes every circle. Berserk refuses to."}],
  "aot-anime": [{type:"experience",targetId:"aot-manga",  line:"The anime amplified it. The manga built it first."},{type:"craft",    targetId:"vs-anime",  line:"Same adaptation intelligence. A quieter story told with the same care."},{type:"contrast", targetId:"fmab",      line:"AOT refuses closure. FMAB is the most complete ending in anime."}],
  "monster-anime":[{type:"experience",targetId:"monster", line:"The anime added voice. The manga built the silence."},{type:"craft",   targetId:"dn-anime",  line:"Same psychological thriller energy. Death Note runs hotter."},{type:"contrast", targetId:"aot-anime", line:"Monster uses restraint. AOT uses spectacle. Both are correct."}],
  "vs-anime":  [{type:"experience",targetId:"vs",         line:"The anime honored it. The manga is still greater."},{type:"craft",    targetId:"aot-anime", line:"Same adaptation care. A more violent story told with equal intelligence."},{type:"contrast", targetId:"fmab",      line:"Vinland Saga earns its ending through loss. FMAB earns it through completion."}],
  "op":        [{type:"experience",targetId:"slam-dunk",  line:"If the crew's love worked for you — 12 volumes. No filler."},{type:"craft",    targetId:"csm",       line:"Same long-term twist discipline. Fujimoto does it in 97 chapters."},{type:"contrast", targetId:"berserk",   line:"One Piece chooses joy. Berserk refuses it. Both are serious positions."}],
  "csm":       [{type:"experience",targetId:"csm-film",   line:"The Reze arc on a cinema screen. MAPPA gave it what it deserved."},{type:"craft",    targetId:"oshi",      line:"Both ask if performance can become real. Oshi No Ko answers warmer."},{type:"contrast", targetId:"vs",        line:"Denji's dreams are humiliatingly small. Thorfinn's became enormous — then he let them go."}],
  "lotm":      [{type:"experience",targetId:"20cb",       line:"Same long-game conspiracy architecture. Urasawa keeps it human-scale."},{type:"craft",    targetId:"monster",   line:"Same patience. Urasawa's mystery runs for 162 chapters. This ran for 1430."},{type:"contrast", targetId:"csm",       line:"LOTM builds a universe. Chainsaw Man burns one down."}],
  "20cb":      [{type:"experience",targetId:"monster",    line:"Same Urasawa architecture. Colder villain. Longer shadow."},{type:"craft",    targetId:"oshi",      line:"Both argue that performance shapes reality. Different genres, same thesis."},{type:"contrast", targetId:"lotm",      line:"20CB keeps it human. LOTM scales to gods. Same question about identity."}],
  "oshi":      [{type:"experience",targetId:"csm",        line:"Same examination of whether performance can become genuine feeling."},{type:"craft",    targetId:"dn-manga",  line:"Both have protagonists performing who they're not until it destroys them."},{type:"contrast", targetId:"slam-dunk", line:"Oshi No Ko asks if joy is real. Slam Dunk never questions it."}],
  "dn-anime":  [{type:"experience",targetId:"monster-anime",line:"Same thriller precision. Johan operates at a completely different frequency."},{type:"craft",   targetId:"bb",        line:"Same study of a man performing righteousness until he becomes the monster."},{type:"contrast", targetId:"fmab",      line:"Death Note ends in humiliation. FMAB ends in completion. Both are honest."}],
  "ds-infinity":[{type:"experience",targetId:"csm-film",  line:"You came for spectacle. Reze Arc gives you that — and something more."},{type:"craft",   targetId:"fmab",      line:"FMAB proves spectacle and substance can coexist. This one only has one."},{type:"contrast", targetId:"vs",        line:"The most beautiful C tier work on this list. The most honest S tier work."}],
  "st":        [{type:"experience",targetId:"got",        line:"Same arc — brilliant start, difficult end. GOT falls harder."},{type:"craft",    targetId:"bb",        line:"Breaking Bad shows what happens when you maintain discipline through the finale."},{type:"contrast", targetId:"monster",   line:"Stranger Things expands its world. Monster deepens one."}],
  "got":       [{type:"experience",targetId:"bb",         line:"What GOT could have been if it held its discipline to the end."},{type:"craft",    targetId:"monster",   line:"Same political weight in the early seasons. Monster never loses it."},{type:"contrast", targetId:"fmab",      line:"GOT chose ambiguity and ran out of story. FMAB planned its ending from chapter one."}],
  "ds-anime":  [{type:"experience",targetId:"ds-infinity",line:"The film is bigger. The craft question is identical."},{type:"craft",    targetId:"vs-anime",  line:"Same animation ambition. Vinland Saga has something to say underneath it."},{type:"contrast", targetId:"berserk",   line:"Both use darkness. One as aesthetic. One as argument."}],
  "sl":        [{type:"experience",targetId:"ds-anime",   line:"Same power fantasy energy. Demon Slayer looks more beautiful."},{type:"craft",    targetId:"csm",       line:"Both start from weakness. Chainsaw Man asks what it costs."},{type:"contrast", targetId:"vs",        line:"Solo Leveling asks how strong can one man become. Vinland Saga asks what strength is for."}],
  "jjk":       [{type:"experience",targetId:"csm",        line:"Same generation. Fujimoto maintained the discipline through the end."},{type:"craft",    targetId:"dn-manga",  line:"Both have extraordinary first halves. Death Note's second half holds better."},{type:"contrast", targetId:"fmab",      line:"JJK had a 9.0 inside it. FMAB is proof that reaching the destination is the hardest part."}],
};

const GUIDED_LABELS = {experience:"Similar Experience", craft:"Same Craft", contrast:"The Contrast"};
const GUIDED_COLORS = {experience:D.amber, craft:"rgba(100,180,255,0.8)", contrast:"rgba(180,130,255,0.8)"};

const GuidedNext = ({ work, onSelect }) => {
  const [activeTransition, setActiveTransition] = useState(null);
  const cards = GUIDED_NEXT_MAP[work.id];
  if(!cards || !cards.length) return null;

  const resolved = cards.map(c => {
    const target = WORKS.find(w => w.id === c.targetId);
    if(!target) return null;
    return {...c, target};
  }).filter(Boolean);

  if(!resolved.length) return null;

  const handleClick = (item) => {
    setActiveTransition(item);
    setTimeout(() => {
      setActiveTransition(null);
      onSelect(item.target);
    }, 900);
  };

  return (
    <div style={{marginTop:"48px",paddingTop:"32px",borderTop:"1px solid rgba(255,255,255,0.05)"}}>
      {/* Transition overlay */}
      {activeTransition && (
        <div style={{position:"fixed",inset:0,zIndex:200,background:"rgba(10,10,18,0.92)",display:"flex",alignItems:"center",justifyContent:"center",animation:"fadeIn 0.3s ease",backdropFilter:"blur(8px)"}}>
          <div style={{textAlign:"center",padding:"0 40px",animation:"heroIn 0.4s ease"}}>
            <div style={{fontSize:"10px",color:GUIDED_COLORS[activeTransition.type],fontFamily:D.mono,letterSpacing:"4px",marginBottom:"16px"}}>{GUIDED_LABELS[activeTransition.type].toUpperCase()}</div>
            <div style={{fontSize:"28px",fontWeight:"900",color:D.text,fontFamily:D.serif,marginBottom:"8px"}}>{activeTransition.target.title}</div>
            <div style={{fontSize:"13px",color:D.textDim,fontFamily:D.serif,fontStyle:"italic"}}>"{activeTransition.line}"</div>
          </div>
        </div>
      )}

      <div style={{fontSize:"9px",color:D.textFaint,fontFamily:D.mono,letterSpacing:"4px",marginBottom:"20px"}}>WHERE TO GO NEXT</div>

      <div style={{display:"flex",flexDirection:"column",gap:"10px"}}>
        {resolved.map((item, i) => {
          const col = GUIDED_COLORS[item.type];
          const tierCol = TIER_C[item.target.tier] || D.amber;
          return (
            <div key={item.targetId}
              onClick={() => handleClick(item)}
              style={{display:"flex",alignItems:"center",gap:"14px",padding:"14px 16px",borderRadius:"4px",background:"rgba(255,255,255,0.02)",border:`1px solid rgba(255,255,255,0.06)`,cursor:"pointer",transition:"all 0.2s",animation:`slideIn 0.4s ease ${i*0.1}s both`}}
              onMouseEnter={e=>{e.currentTarget.style.background="rgba(255,255,255,0.04)";e.currentTarget.style.borderColor=`${col}40`;e.currentTarget.style.transform="translateX(3px)";}}
              onMouseLeave={e=>{e.currentTarget.style.background="rgba(255,255,255,0.02)";e.currentTarget.style.borderColor="rgba(255,255,255,0.06)";e.currentTarget.style.transform="translateX(0)";}}
            >
              {/* Type tag */}
              <div style={{flexShrink:0,width:"90px"}}>
                <div style={{fontSize:"8px",color:col,fontFamily:D.mono,letterSpacing:"2px",fontWeight:"700",marginBottom:"3px"}}>{GUIDED_LABELS[item.type].toUpperCase()}</div>
                <div style={{height:"1px",background:col,opacity:0.3,width:"100%"}}/>
              </div>

              {/* Text */}
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontSize:"13px",fontWeight:"700",color:D.text,fontFamily:D.serif,marginBottom:"3px"}}>{item.target.title}</div>
                <div style={{fontSize:"12px",color:D.textDim,fontFamily:D.serif,fontStyle:"italic",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>"{item.line}"</div>
              </div>

              {/* Score */}
              <div style={{flexShrink:0,textAlign:"right"}}>
                <div style={{fontSize:"18px",fontWeight:"300",color:tierCol,fontFamily:D.serif,lineHeight:1}}>{item.target.overall.toFixed(1)}</div>
                <div style={{fontSize:"8px",color:D.textFaint,fontFamily:D.mono,letterSpacing:"1px"}}>{item.target.tier} TIER</div>
              </div>

              <div style={{color:D.textFaint,fontSize:"14px",flexShrink:0}}>›</div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ─── TIER REVEAL ──────────────────────────────────────────────────────────────
const TierReveal = ({ work }) => {
  const tiers = ["S","A","B","C","D"];
  const tierColors = {S:"#3B82F6",A:"#8B5CF6",B:"#C9A84C",C:"#34d399",D:"#94a3b8"};
  const tierLabels = {S:"Exceptional",A:"Excellent",B:"Good",C:"Average",D:"Below Average"};
  const scoreTier = work.tier;
  const expTier = work.experience >= 9.0 ? "S" : work.experience >= 8.5 ? "A" : work.experience >= 8.0 ? "B" : work.experience >= 7.0 ? "C" : "D";

  const TierRow = ({tier, isScore, isExp, label}) => {
    const active = isScore || isExp;
    return (
      <div style={{display:"flex",alignItems:"center",gap:"0",marginBottom:"4px",animation:active?"fadeIn 0.5s ease":"none"}}>
        <div style={{width:"44px",height:"56px",background:active?tierColors[tier]:"rgba(255,255,255,0.03)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,borderRadius:"6px 0 0 6px",transition:"background 0.3s"}}>
          <span style={{fontSize:"16px",fontWeight:"700",color:active?"#000":D.textFaint,fontFamily:D.mono}}>{tier}</span>
        </div>
        <div style={{flex:1,height:"56px",background:"rgba(255,255,255,0.02)",border:"1px solid rgba(255,255,255,0.05)",borderLeft:"none",borderRadius:"0 6px 6px 0",display:"flex",alignItems:"center",padding:"0 14px",gap:"10px"}}>
          {isScore && (
            <div style={{display:"flex",alignItems:"center",gap:"8px",animation:"slideIn 0.4s ease"}}>
              <div style={{width:"36px",height:"44px",background:`${tierColors[tier]}22`,border:`1px solid ${tierColors[tier]}40`,borderRadius:"4px",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"8px",color:tierColors[tier],fontFamily:D.mono,letterSpacing:"0.5px",textAlign:"center",lineHeight:1.2}}>
                {work.title.slice(0,4).toUpperCase()}
              </div>
              <div>
                <div style={{fontSize:"10px",color:D.blue,fontFamily:D.mono,letterSpacing:"1px"}}>PEAK SCORE</div>
                <div style={{fontSize:"11px",color:D.textDim,fontFamily:D.serif}}>{work.overall.toFixed(1)} · {tierLabels[tier]}</div>
              </div>
            </div>
          )}
          {isExp && work.experience && (
            <div style={{display:"flex",alignItems:"center",gap:"8px",animation:"slideIn 0.4s ease 0.2s both",marginLeft:isScore?"16px":"0"}}>
              <div style={{width:"36px",height:"44px",background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:"4px",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"8px",color:D.textDim,fontFamily:D.mono,letterSpacing:"0.5px",textAlign:"center",lineHeight:1.2}}>
                {work.title.slice(0,4).toUpperCase()}
              </div>
              <div>
                <div style={{fontSize:"10px",color:D.textDim,fontFamily:D.mono,letterSpacing:"1px"}}>PEAK EXP</div>
                <div style={{fontSize:"11px",color:D.textDim,fontFamily:D.serif}}>{work.experience.toFixed(1)}</div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div style={{animation:"fadeIn 0.4s ease"}}>
      <div style={{marginBottom:"20px"}}>
        <h2 style={{margin:"0 0 6px",fontSize:"20px",fontWeight:"900",color:D.text}}>Peak Placement</h2>
        <p style={{margin:0,fontSize:"12px",color:D.textDim,fontFamily:D.mono}}>Where {work.title} sits. Craft vs feeling.</p>
      </div>
      <div id="tier-reveal-container" style={{marginBottom:"24px"}}>
        {tiers.map(tier => (
          <TierRow
            key={tier}
            tier={tier}
            isScore={tier === scoreTier}
            isExp={tier === expTier && work.experience}
            label={tierLabels[tier]}
          />
        ))}
      </div>
      <div style={{display:"flex",justifyContent:"flex-end",marginBottom:"16px"}}>
        <DownloadButton targetId="tier-reveal-container" filename={`peak-${work.title.replace(/\s+/g,"-").toLowerCase()}-tier`} label="Save Tier Card"/>
      </div>
      {work.experience && scoreTier !== expTier && (
        <div style={{padding:"14px 16px",background:"rgba(255,255,255,0.02)",border:"1px solid rgba(255,255,255,0.07)",borderRadius:"10px",marginBottom:"16px"}}>
          <div style={{fontSize:"10px",color:D.purpleDim,fontFamily:D.mono,letterSpacing:"2px",marginBottom:"6px"}}>THE GAP</div>
          <p style={{margin:0,fontSize:"13px",color:D.textMid,fontFamily:D.serif,lineHeight:1.7}}>
            {work.title} is a {tierLabels[scoreTier].toLowerCase()} work that feels like a {tierLabels[expTier].toLowerCase()} experience. That gap is the most honest thing Peak can say about it.
          </p>
        </div>
      )}
      <ShareButton work={work}/>
    </div>
  );
};

// ─── RADAR CHART ──────────────────────────────────────────────────────────────
const RadarChart = ({ work, onOpenDetail }) => {
  const scores = work.scores || {};
  const keys = Object.keys(scores).filter(k => scores[k] != null);
  const n = keys.length;
  if(!n) return null;
  const getDisplay = (k) => getVisualCategory(work, k);

  // Per-category colors like DAWG
  const CAT_COLORS = {
    "Writing":        "#4fc3f7",
    "Art":            "#ce93d8",
    "Themes":         "#a5d6a7",
    "Twists":         "#ff8a65",
    "Characters":     "#fff176",
    "Pacing":         "#80cbc4",
    "Emotional Impact":"#f48fb1",
    "Consistency":    "#bcaaa4",
  };
  const getColor = (k) => CAT_COLORS[k] || D.amber;

  const size = 280;
  const cx = size/2, cy = size/2, r = size * 0.36;
  const angle = (i) => (i * 2 * Math.PI / n) - Math.PI/2;
  const pt = (i, val) => {
    const a = angle(i);
    const dist = r * Math.max((val - 5) / 5, 0.05); // scale from 5–10 so shape is more dramatic
    return [cx + dist * Math.cos(a), cy + dist * Math.sin(a)];
  };
  const axPt = (i, scale=1) => {
    const a = angle(i);
    return [cx + r*scale*Math.cos(a), cy + r*scale*Math.sin(a)];
  };

  const dataPoints = keys.map((k,i) => pt(i, scores[k]));
  const polyPoints = dataPoints.map(p => p.join(",")).join(" ");

  const shortLabel = (k) => {
    if (k === "Art") {
      const label = getDisplay(k).label.toUpperCase();
      const visualMap = {"ART":"ART","ANIMATION":"ANIM","CINEMATOGRAPHY":"CINEMA"};
      return visualMap[label] || label.slice(0,7);
    }
    const map = {"Writing":"WRITING","Themes":"THEMES","Twists":"TWISTS","Characters":"CHARS","Pacing":"PACING","Emotional Impact":"EMOTION","Consistency":"CONSIST"};
    return map[k] || k.toUpperCase().slice(0,7);
  };

  // Build gradient-ish fill using a single amber with higher opacity
  const fillColor = work.color || D.amber;

  return (
    <div id="radar-chart-container" style={{marginBottom:"24px"}}>
      {/* Chart */}
      <div style={{display:"flex",justifyContent:"center",margin:"0 0 24px"}}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{overflow:"visible"}}>
          {/* Grid rings */}
          {[0.25,0.5,0.75,1.0].map(lvl => {
            const pts = keys.map((_,i) => axPt(i,lvl).join(",")).join(" ");
            return <polygon key={lvl} points={pts} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth={lvl===1?"1":"0.5"}/>;
          })}
          {/* Axis lines */}
          {keys.map((_,i) => {
            const [x2,y2] = axPt(i);
            return <line key={i} x1={cx} y1={cy} x2={x2} y2={y2} stroke="rgba(255,255,255,0.07)" strokeWidth="0.5"/>;
          })}
          {/* Filled shape */}
          <polygon points={polyPoints} fill={fillColor} fillOpacity="0.18" stroke={fillColor} strokeWidth="2" strokeOpacity="0.9" strokeLinejoin="round"/>
          {/* Dots on each axis */}
          {dataPoints.map(([x,y],i) => (
            <circle key={i} cx={x} cy={y} r="3.5" fill={getColor(keys[i])} opacity="1"/>
          ))}
          {/* Center score */}
          <text x={cx} y={cy-10} textAnchor="middle" fill="#3B82F6" fontSize="26" fontFamily="Georgia,serif" fontWeight="300" opacity="0.95">{work.overall.toFixed(1)}</text>
          <text x={cx} y={cy+10} textAnchor="middle" fill="#3B82F6" fontSize="7" fontFamily="monospace" letterSpacing="2" opacity="0.7">PEAK SCORE</text>
        </svg>
      </div>

      {/* Score grid — DAWG style, tappable */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:"8px",padding:"0 4px"}}>
        {keys.map(k => {
          const val = scores[k];
          const col = getColor(k);
          const explanation = work.scoreReasons && work.scoreReasons[k];
          const display = getDisplay(k);
          return (
            <div key={k}
              onClick={() => explanation && onOpenDetail(k, val, explanation)}
              style={{padding:"10px 10px 8px",background:"rgba(255,255,255,0.03)",border:`1px solid ${col}25`,borderRadius:"10px",cursor:explanation?"pointer":"default",transition:"all 0.18s"}}
              onMouseEnter={e=>{if(explanation){e.currentTarget.style.background=`${col}12`;e.currentTarget.style.borderColor=`${col}50`;}}}
              onMouseLeave={e=>{e.currentTarget.style.background="rgba(255,255,255,0.03)";e.currentTarget.style.borderColor=`${col}25`;}}
            >
              <div style={{fontSize:"8px",color:col,fontFamily:D.mono,letterSpacing:"1px",marginBottom:"6px",fontWeight:"700"}}>{shortLabel(k)}</div>
              <div style={{fontSize:"24px",fontWeight:"300",color:col,fontFamily:D.serif,lineHeight:1,marginBottom:"2px"}}>{val?.toFixed(1)}</div>
              <div style={{fontSize:"9px",color:D.textDim,fontFamily:D.sans,lineHeight:1.2,marginBottom:explanation?"4px":"0"}}>{display.label}</div>
              {explanation && <div style={{fontSize:"8px",color:`${col}70`,fontFamily:D.mono,letterSpacing:"0.5px"}}>TAP ↗</div>}
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ─── DOWNLOAD IMAGE BUTTON ────────────────────────────────────────────────────
const DownloadButton = ({ targetId, filename, label }) => {
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");

  const handleDownload = async () => {
    setSaving(true); setErr("");
    const el = document.getElementById(targetId);
    if (!el) { setSaving(false); return; }
    try {
      if (!window.html2canvas) {
        await new Promise((res, rej) => {
          const s = document.createElement("script");
          s.src = "https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js";
          s.onload = res; s.onerror = rej;
          document.head.appendChild(s);
        });
      }
      const canvas = await window.html2canvas(el, {
        backgroundColor:"#0a0a12", scale:2, useCORS:true, allowTaint:true, logging:false
      });
      canvas.toBlob(blob => {
        if (!blob) { setSaving(false); return; }
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.download = `${filename}.png`; a.href = url; a.click();
        URL.revokeObjectURL(url); setSaving(false);
      }, "image/png");
    } catch(e) { setErr("Save failed — try screenshot"); setSaving(false); }
  };

  return (
    <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:"5px"}}>
      <button onClick={handleDownload} disabled={saving}
        style={{padding:"10px 18px",background:saving?"rgba(59,130,246,0.15)":"rgba(59,130,246,0.08)",border:"1px solid rgba(59,130,246,0.3)",borderRadius:"8px",color:"#3B82F6",fontSize:"11px",cursor:saving?"default":"pointer",fontFamily:D.mono,letterSpacing:"1px",transition:"all 0.15s"}}
        onMouseEnter={e=>{if(!saving)e.currentTarget.style.background="rgba(59,130,246,0.16)";}}
        onMouseLeave={e=>{if(!saving)e.currentTarget.style.background="rgba(59,130,246,0.08)";}}
      >
        {saving ? "Saving…" : `↓ ${label}`}
      </button>
      {err && <span style={{fontSize:"10px",color:"#ff6b6b",fontFamily:D.mono}}>{err}</span>}
    </div>
  );
};

const ShareButton = ({ work }) => {
  const [copied, setCopied] = useState(false);

  const shareText = `PEAK rates ${work.title} — ${work.overall.toFixed(1)}/10 ${work.tier} Tier\n\n"${work.verdict?.line || work.hook}"\n\nPeak Score: ${work.overall.toFixed(1)} · Peak Experience: ${work.experience ? work.experience.toFixed(1) : "—"}\n\nAn AI-powered rating system. Rated on the principles of great storytelling, not popularity.\npeak-ratings.com\n\n#Peak #${work.title.replace(/\s+/g,"")} #${work.type.replace(/\s+/g,"")}`;

  const redditTitle = `PEAK rates ${work.title} — ${work.overall.toFixed(1)}/10 ${work.tier} Tier · "${work.verdict?.line || work.hook}"`;

  const redditBody = `PEAK is an AI-powered rating system that rates storytelling craft — not popularity.\n\n**${work.title}**\n\n- Peak Score: ${work.overall.toFixed(1)}/10 (craft-based)\n- Peak Experience: ${work.experience ? work.experience.toFixed(1)+"/10" : "—"} (audience feeling)\n- Tier: ${work.tier}\n\n"${work.verdict?.line || work.hook}"\n\npeak-ratings.com`;

  const handleShareX = () => {
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`, "_blank");
  };

  const handleShareReddit = () => {
    const url = `https://www.reddit.com/submit?title=${encodeURIComponent(redditTitle)}&text=${encodeURIComponent(redditBody)}`;
    window.open(url, "_blank");
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(shareText).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div style={{marginTop:"28px",padding:"20px 22px",background:"rgba(255,255,255,0.02)",border:"1px solid rgba(255,255,255,0.07)",borderRadius:"12px"}}>
      <div style={{fontSize:"10px",color:"rgba(255,255,255,0.22)",fontFamily:D.mono,letterSpacing:"3px",marginBottom:"14px"}}>SHARE THIS RATING</div>
      <div style={{background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.06)",borderRadius:"8px",padding:"14px 16px",marginBottom:"14px"}}>
        <p style={{margin:0,fontSize:"12px",color:D.textDim,fontFamily:D.mono,lineHeight:1.8,whiteSpace:"pre-wrap"}}>{shareText}</p>
      </div>
      <div style={{display:"flex",gap:"10px",flexWrap:"wrap"}}>
        <button
          onClick={handleShareX}
          style={{flex:1,minWidth:"100px",padding:"11px 0",background:D.blueFaint,border:`1px solid ${D.blueDim}`,borderRadius:"8px",color:D.blue,fontSize:"12px",cursor:"pointer",fontFamily:D.mono,letterSpacing:"1px",transition:"all 0.15s"}}
          onMouseEnter={e=>e.currentTarget.style.background="rgba(59,130,246,0.18)"}
          onMouseLeave={e=>e.currentTarget.style.background=D.blueFaint}
        >
          Share on X ↗
        </button>
        <button
          onClick={handleShareReddit}
          style={{flex:1,minWidth:"100px",padding:"11px 0",background:"rgba(255,69,0,0.08)",border:"1px solid rgba(255,69,0,0.3)",borderRadius:"8px",color:"#ff6314",fontSize:"12px",cursor:"pointer",fontFamily:D.mono,letterSpacing:"1px",transition:"all 0.15s"}}
          onMouseEnter={e=>e.currentTarget.style.background="rgba(255,69,0,0.14)"}
          onMouseLeave={e=>e.currentTarget.style.background="rgba(255,69,0,0.08)"}
        >
          Post on Reddit ↗
        </button>
        <button
          onClick={handleCopy}
          style={{padding:"11px 18px",background:"transparent",border:"1px solid rgba(255,255,255,0.1)",borderRadius:"8px",color:copied?D.amber:D.textDim,fontSize:"12px",cursor:"pointer",fontFamily:D.mono,letterSpacing:"1px",transition:"all 0.15s"}}
        >
          {copied ? "Copied ✓" : "Copy"}
        </button>
      </div>
    </div>
  );
};

// ─── PEAK SAYS DATA ───────────────────────────────────────────────────────────
const PEAK_SAYS_OLD = {
  "vs":           { verdict:"Watch / Read it", line:"If you want a story that actually earns its ending after 20 years — this is it. Not for action. For something that stays with you.", forWho:"Best for: people who want meaning, not just excitement." },
  "berserk":      { verdict:"Read it", line:"The darkest, most ambitious manga ever made. If you can handle heavy content and don't mind it being unfinished — essential.", forWho:"Best for: people who want the deepest story, not the prettiest one." },
  "vagabond":     { verdict:"Read it", line:"The most beautiful manga ever drawn. Slow, philosophical, about a swordsman discovering what strength actually means. Not for everyone — but unforgettable.", forWho:"Best for: people who appreciate art and patience over plot." },
  "monster":      { verdict:"Read / Watch it", line:"A psychological thriller with the greatest villain in manga history. If you liked Death Note but wanted it smarter and darker — this is what you're looking for.", forWho:"Best for: fans of psychological thrillers who want substance." },
  "reze":         { verdict:"Watch it", line:"The best anime film of 2025. Even if you haven't seen Chainsaw Man — the animation alone is worth it, and the story stands on its own.", forWho:"Best for: anyone who loves great animation and a bittersweet love story." },
  "bb":           { verdict:"Watch it", line:"One of the greatest TV shows ever made. A chemistry teacher becomes a drug lord — but it's really about how a person convinces themselves they're still the good guy.", forWho:"Best for: everyone. No exceptions." },
  "aot-manga":    { verdict:"Read it", line:"The manga that made you root for the wrong side without realizing it. Smarter and more ambitious than the anime. Best twist architecture in manga.", forWho:"Best for: AOT anime fans who want the real, complete version." },
  "slam-dunk":    { verdict:"Read it", line:"The greatest sports manga ever made. You don't need to like basketball. You'll cry anyway.", forWho:"Best for: anyone who wants pure emotional satisfaction." },
  "dn-manga":     { verdict:"Read it", line:"A genius tries to outsmart the world using a notebook that kills. The smartest battle of wills in manga — and a better ending than the anime.", forWho:"Best for: people who love psychological chess matches." },
  "fmab":         { verdict:"Watch it", line:"The most complete anime ever made. Great action, deep story, satisfying ending. The rare show that delivers on every promise it makes.", forWho:"Best for: everyone, especially beginners to anime." },
  "aot-anime":    { verdict:"Watch it", line:"One of the greatest anime ever made. Starts as a survival story, becomes something much more ambitious. Season 2 alone is worth the price.", forWho:"Best for: people who want story and spectacle in equal measure." },
  "monster-anime":{ verdict:"Watch it", line:"A slow, intelligent psychological thriller. A surgeon hunts the boy he once saved, who grew up to be a monster. Patient and devastating.", forWho:"Best for: people who want a smart thriller with real depth." },
  "vs-anime":     { verdict:"Watch it", line:"A Vikings story that becomes an anti-war meditation. Better than most people expect. Season 2 is the best anime season in recent years.", forWho:"Best for: people who want emotional depth over flashy action." },
  "op":           { verdict:"Read / Watch it (selectively)", line:"The greatest emotional investment in manga. Start with Water 7. Pre-timeskip is near-perfect. Post-timeskip has pacing issues but the emotional peaks are worth it.", forWho:"Best for: people who want to love a cast of characters for years." },
  "csm":          { verdict:"Read it", line:"The most formally radical manga ever made. Dark, weird, cinematic. If you want something that breaks every rule of the genre — this is it.", forWho:"Best for: people bored of standard shonen who want something different." },
  "lotm":         { verdict:"Read it", line:"The best web novel ever written. A boy climbs from zero to god through sheer intelligence. The world-building and power system are unmatched.", forWho:"Best for: people who love cultivation stories done with actual craft." },
  "20cb":         { verdict:"Read it", line:"A conspiracy thriller spanning 50 years, told across two manga. If you liked Monster — same author, warmer story, equally brilliant architecture.", forWho:"Best for: fans of Monster and long-game mystery storytelling." },
  "oshi":         { verdict:"Read / Watch it", line:"An idol story that becomes a dark examination of whether performance can become genuine. More intelligent than the premise suggests.", forWho:"Best for: people who want something emotionally surprising." },
  "dn-anime":     { verdict:"Watch it (first half)", line:"One of the best first halves in anime history. Watch through episode 25. The second half is weaker — the manga handles it better.", forWho:"Best for: anyone who wants a psychological thriller with great style." },
  "ds-infinity":  { verdict:"Watch it for the animation", line:"The most technically impressive anime fight sequences ever made. But it's a fragment — go in knowing that. It's a spectacle, not a complete story.", forWho:"Best for: people who want jaw-dropping animation above all else." },
  "st":           { verdict:"Watch seasons 1–4", line:"One of the best horror-nostalgia shows made. Stop at season 4. The later seasons don't maintain the quality.", forWho:"Best for: people who want fun, emotional, well-crafted horror-adventure." },
  "got":          { verdict:"Watch seasons 1–4", line:"Some of the greatest television ever made — until it wasn't. Seasons 1–4 are essential. After that, manage your expectations.", forWho:"Best for: people who want prestige TV at its peak — while it lasted." },
  "ds-anime":     { verdict:"Watch it if you want great fights", line:"Beautiful animation, intense fights, straightforward story. Perfect for when you want spectacle without complexity.", forWho:"Best for: people who want pure entertainment and don't need deep themes." },
  "sl":           { verdict:"Watch it as a power fantasy", line:"A weak guy becomes the strongest in the world. That's the whole thing — and it's genuinely satisfying if that's what you want.", forWho:"Best for: people who enjoy power fantasy and don't need deeper meaning." },
  "jjk":          { verdict:"Watch the first arc", line:"Some of the best action animation in shonen history. The Shibuya arc is essential. The ending didn't stick the landing — but what came before was incredible.", forWho:"Best for: people who want top-tier animation and don't mind an imperfect ending." },
};

// ─── PEAK SAYS SECTION ────────────────────────────────────────────────────────
// ─── PEAK SAYS SECTION ────────────────────────────────────────────────────────
const PeakSaysSection = ({ work }) => {
  const data = PEAK_SAYS[work.id];
  if (!data) return null;

  const tierCol = TIER_C[work.tier] || D.amber;
  const isPositive = data.verdict.toLowerCase().includes("watch") || data.verdict.toLowerCase().includes("read");

  return (
    <div style={{marginBottom:"48px", animation:"fadeIn 0.4s ease"}}>
      <div style={{fontSize:"10px", color:"rgba(59,130,246,0.5)", fontFamily:D.mono, letterSpacing:"4px", marginBottom:"16px"}}>
        ▲ PEAK SAYS
      </div>
      
      <div style={{background:`linear-gradient(135deg,${tierCol}0a 0%,rgba(255,255,255,0.02) 100%)`, border:`1px solid ${tierCol}30`, borderRadius:"16px", padding:"24px 26px"}}>
        
        {/* Verdict + Score */}
        <div style={{display:"flex", alignItems:"center", gap:"12px", marginBottom:"20px"}}>
          <div style={{padding:"6px 14px", background:`${tierCol}18`, border:`1px solid ${tierCol}50`, borderRadius:"20px"}}>
            <span style={{fontSize:"12px", fontWeight:"900", color:tierCol, fontFamily:D.mono, letterSpacing:"1px"}}>
              {data.verdict.toUpperCase()}
            </span>
          </div>
          <div style={{fontSize:"24px", fontWeight:"300", color:D.blue, fontFamily:D.serif, lineHeight:1}}>
            {work.overall.toFixed(1)}
          </div>
          <div style={{fontSize:"10px", color:D.textFaint, fontFamily:D.mono}}>
            {work.tier} TIER
          </div>
        </div>

        {/* The 3 clear lines */}
        <p style={{margin:"0 0 14px", fontSize:"16px", color:D.text, lineHeight:1.75, fontFamily:D.serif}}>
          {data.line}
        </p>
        <p style={{margin:"0 0 14px", fontSize:"15px", color:D.textMid, lineHeight:1.7, fontFamily:D.serif}}>
          {data.opposite}
        </p>
        <p style={{margin:0, fontSize:"14px", color:D.textDim, fontFamily:D.mono, letterSpacing:"0.5px"}}>
          {data.bestFor}
        </p>
      </div>
    </div>
  );
};
// ─── PEAK SAYS DATA ───────────────────────────────────────────────────────────
const PEAK_SAYS = {
  "vs":           { 
    verdict:"Read it", 
    line:"If you want a slow, meaningful story about violence and growing as a person — read this.", 
    opposite:"If you want fast action and nonstop fights, this isn’t it.", 
    bestFor:"Best for you if you like thoughtful stories that stay with you." 
  },
  "berserk":      { 
    verdict:"Read it", 
    line:"If you want the darkest and most serious story in manga — read this.", 
    opposite:"If you want something light or easy, this isn’t it.", 
    bestFor:"Best for you if you like heavy, ambitious stories." 
  },
  "vagabond":     { 
    verdict:"Read it", 
    line:"If you want beautiful, slow, and philosophical manga — read this.", 
    opposite:"If you want fast plot and lots of action, this isn’t it.", 
    bestFor:"Best for you if you like calm, artistic stories." 
  },
  "monster":      { 
    verdict:"Read / Watch it", 
    line:"If you want a smart psychological thriller with a scary villain — read or watch this.", 
    opposite:"If you want light entertainment or happy stories, this isn’t it.", 
    bestFor:"Best for you if you like tense, thinking stories." 
  },
  "reze":         { 
    verdict:"Watch it", 
    line:"If you want emotional and beautiful animation with a bittersweet love story — watch this.", 
    opposite:"If you want pure nonstop action, this isn’t it.", 
    bestFor:"Best for you if you like emotional anime films." 
  },
  "bb":           { 
    verdict:"Watch it", 
    line:"If you want a smart, intense story about a man slowly turning bad — watch this.", 
    opposite:"If you want light comedy or feel-good shows, this isn’t it.", 
    bestFor:"Best for you if you like serious character dramas." 
  },
  "aot-manga":    { 
    verdict:"Read it", 
    line:"If you want huge twists and a story that messes with your head — read this.", 
    opposite:"If you want simple good-vs-evil, this isn’t it.", 
    bestFor:"Best for you if you like mind-bending plots." 
  },
  "slam-dunk":    { 
    verdict:"Read it", 
    line:"If you want an emotional sports story that makes you feel everything — read this.", 
    opposite:"If you don’t like sports manga, this isn’t it.", 
    bestFor:"Best for you if you like heartfelt character growth." 
  },
  "dn-manga":     { 
    verdict:"Read it", 
    line:"If you want the smartest battle of minds in manga — read this.", 
    opposite:"If you want big action or simple fights, this isn’t it.", 
    bestFor:"Best for you if you like clever psychological stories." 
  },
  "fmab":         { 
    verdict:"Watch it", 
    line:"If you want a complete story with great action and a satisfying ending — watch this.", 
    opposite:"If you want something dark and unfinished, this isn’t it.", 
    bestFor:"Best for you if you like well-made, complete anime." 
  },
  "aot-anime":    { 
    verdict:"Watch it", 
    line:"If you want epic animation, huge twists, and emotional moments — watch this.", 
    opposite:"If you want calm or slow storytelling, this isn’t it.", 
    bestFor:"Best for you if you like intense, exciting anime." 
  },
  "monster-anime":{ 
    verdict:"Watch it", 
    line:"If you want a slow, smart psychological thriller — watch this.", 
    opposite:"If you want fast action and quick entertainment, this isn’t it.", 
    bestFor:"Best for you if you like patient, deep stories." 
  },
  "vs-anime":     { 
    verdict:"Watch it", 
    line:"If you want emotional depth and beautiful quiet moments — watch this.", 
    opposite:"If you want constant action and hype, this isn’t it.", 
    bestFor:"Best for you if you like thoughtful anime." 
  },
  "op":           { 
    verdict:"Read / Watch it (selectively)", 
    line:"If you want a long emotional adventure with characters you’ll love — try this.", 
    opposite:"If you want short and fast stories, this isn’t it.", 
    bestFor:"Best for you if you like big emotional journeys." 
  },
  "csm":          { 
    verdict:"Read it", 
    line:"If you want weird, dark, and unpredictable storytelling — read this.", 
    opposite:"If you want standard shonen action, this isn’t it.", 
    bestFor:"Best for you if you like strange and bold manga." 
  },
  "lotm":         { 
    verdict:"Read it", 
    line:"If you want a smart power fantasy with amazing world-building — read this.", 
    opposite:"If you want simple fights without strategy, this isn’t it.", 
    bestFor:"Best for you if you like clever progression stories." 
  },
  "20cb":         { 
    verdict:"Read it", 
    line:"If you want a long mystery full of great twists — read this.", 
    opposite:"If you want fast action, this isn’t it.", 
    bestFor:"Best for you if you like conspiracy thrillers." 
  },
  "oshi":         { 
    verdict:"Read / Watch it", 
    line:"If you want emotional drama mixed with dark twists — try this.", 
    opposite:"If you want pure idol fun, this isn’t it.", 
    bestFor:"Best for you if you like surprising stories." 
  },
  "dn-anime":     { 
    verdict:"Watch it (first half)", 
    line:"If you want the smartest mind games in anime — watch the first half.", 
    opposite:"If you want consistent quality all the way, this isn’t it.", 
    bestFor:"Best for you if you like clever thrillers." 
  },
  "ds-infinity":  { 
    verdict:"Watch it for the animation", 
    line:"If you want the most beautiful fight animation ever — watch this.", 
    opposite:"If you want a complete story, this isn’t it.", 
    bestFor:"Best for you if you like pure spectacle." 
  },
  "st":           { 
    verdict:"Watch seasons 1–4", 
    line:"If you want fun horror with heart and nostalgia — watch seasons 1-4.", 
    opposite:"If you want dark serious drama, this isn’t it.", 
    bestFor:"Best for you if you like exciting adventure shows." 
  },
  "got":          { 
    verdict:"Watch seasons 1–4", 
    line:"If you want the best political fantasy drama at its peak — watch seasons 1-4.", 
    opposite:"If you want a perfect ending, this isn’t it.", 
    bestFor:"Best for you if you like epic TV at its highest." 
  },
  "ds-anime":     { 
    verdict:"Watch it if you want great fights", 
    line:"If you want beautiful fights and simple fun — watch this.", 
    opposite:"If you want deep themes, this isn’t it.", 
    bestFor:"Best for you if you like flashy action." 
  },
  "sl":           { 
    verdict:"Watch it as a power fantasy", 
    line:"If you want a weak guy becoming super strong — watch this.", 
    opposite:"If you want complex characters, this isn’t it.", 
    bestFor:"Best for you if you like satisfying power fantasies." 
  },
  "jjk":          { 
    verdict:"Watch the first arc", 
    line:"If you want top-tier action animation — watch the early arcs.", 
    opposite:"If you want a perfect ending, this isn’t it.", 
    bestFor:"Best for you if you like hype fights." 
  },
};

// ─── SECTION DIVIDER ─────────────────────────────────────────────────────────
const SectionDivider = ({ label, color }) => (
  <div style={{display:"flex",alignItems:"center",gap:"14px",margin:"52px 0 28px",opacity:0.7}}>
    <div style={{flex:1,height:"1px",background:"rgba(255,255,255,0.06)"}}/>
    <span style={{fontSize:"9px",color:color||D.textFaint,fontFamily:D.mono,letterSpacing:"4px",whiteSpace:"nowrap"}}>{label}</span>
    <div style={{flex:1,height:"1px",background:"rgba(255,255,255,0.06)"}}/>
  </div>
);

// ─── CONVERSATIONAL GUIDED NEXT ───────────────────────────────────────────────
const ConversationalGuidedNext = ({ work, onSelect }) => {
  const [activeTransition, setActiveTransition] = useState(null);
  const cards = GUIDED_NEXT_MAP[work.id];
  if (!cards || !cards.length) return null;

  const resolved = cards.map(c => {
    const target = WORKS.find(w => w.id === c.targetId);
    if (!target) return null;
    return {...c, target};
  }).filter(Boolean);

  if (!resolved.length) return null;

  const handleClick = (item) => {
    setActiveTransition(item);
    setTimeout(() => {
      setActiveTransition(null);
      onSelect(item.target);
    }, 900);
  };

  // Build conversational intro based on the show's qualities
  const buildIntro = () => {
    const exp = resolved.find(r => r.type === "experience");
    const craft = resolved.find(r => r.type === "craft");
    const contrast = resolved.find(r => r.type === "contrast");
    const lines = [];
    if (exp) lines.push(`If what hooked you was the *feeling* — ${exp.target.title} gives you that same energy.`);
    if (craft) lines.push(`If you appreciated the craft underneath — ${craft.target.title} is built with the same discipline.`);
    if (contrast) lines.push(`And if you want to see a completely different answer to the same questions — ${contrast.target.title}.`);
    return lines.join(" ");
  };

  const tierCol = TIER_C[work.tier] || D.amber;

  return (
    <div style={{marginTop:"52px",paddingTop:"36px",borderTop:"1px solid rgba(255,255,255,0.05)"}}>
      {activeTransition && (
        <div style={{position:"fixed",inset:0,zIndex:200,background:"rgba(10,10,18,0.92)",display:"flex",alignItems:"center",justifyContent:"center",animation:"fadeIn 0.3s ease",backdropFilter:"blur(8px)"}}>
          <div style={{textAlign:"center",padding:"0 40px",animation:"heroIn 0.4s ease"}}>
            <div style={{fontSize:"10px",color:GUIDED_COLORS[activeTransition.type],fontFamily:D.mono,letterSpacing:"4px",marginBottom:"16px"}}>{GUIDED_LABELS[activeTransition.type].toUpperCase()}</div>
            <div style={{fontSize:"28px",fontWeight:"900",color:D.text,fontFamily:D.serif,marginBottom:"8px"}}>{activeTransition.target.title}</div>
            <div style={{fontSize:"13px",color:D.textDim,fontFamily:D.serif,fontStyle:"italic"}}>"{activeTransition.line}"</div>
          </div>
        </div>
      )}

      <div style={{fontSize:"9px",color:D.textFaint,fontFamily:D.mono,letterSpacing:"4px",marginBottom:"18px"}}>WHERE TO GO NEXT</div>

      {/* Conversational intro */}
      <div style={{padding:"18px 20px",background:"rgba(255,255,255,0.02)",border:`1px solid ${tierCol}20`,borderRadius:"12px",marginBottom:"20px"}}>
        <p style={{margin:0,fontSize:"14px",color:D.textMid,lineHeight:1.8,fontFamily:D.serif}}>
          You just read <strong style={{color:D.text}}>{work.title}</strong>. {buildIntro()}
        </p>
      </div>

      <div style={{display:"flex",flexDirection:"column",gap:"10px"}}>
        {resolved.map((item, i) => {
          const col = GUIDED_COLORS[item.type];
          const targetTierCol = TIER_C[item.target.tier] || D.amber;
          return (
            <div key={item.targetId}
              onClick={() => handleClick(item)}
              style={{display:"flex",alignItems:"center",gap:"14px",padding:"14px 16px",borderRadius:"4px",background:"rgba(255,255,255,0.02)",border:`1px solid rgba(255,255,255,0.06)`,cursor:"pointer",transition:"all 0.2s",animation:`slideIn 0.4s ease ${i*0.1}s both`}}
              onMouseEnter={e=>{e.currentTarget.style.background="rgba(255,255,255,0.04)";e.currentTarget.style.borderColor=`${col}40`;e.currentTarget.style.transform="translateX(3px)";}}
              onMouseLeave={e=>{e.currentTarget.style.background="rgba(255,255,255,0.02)";e.currentTarget.style.borderColor="rgba(255,255,255,0.06)";e.currentTarget.style.transform="translateX(0)";}}
            >
              <div style={{flexShrink:0,width:"90px"}}>
                <div style={{fontSize:"8px",color:col,fontFamily:D.mono,letterSpacing:"2px",fontWeight:"700",marginBottom:"3px"}}>{GUIDED_LABELS[item.type].toUpperCase()}</div>
                <div style={{height:"1px",background:col,opacity:0.3,width:"100%"}}/>
              </div>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontSize:"13px",fontWeight:"700",color:D.text,fontFamily:D.serif,marginBottom:"3px"}}>{item.target.title}</div>
                <div style={{fontSize:"12px",color:D.textDim,fontFamily:D.serif,fontStyle:"italic",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>"{item.line}"</div>
              </div>
              <div style={{flexShrink:0,textAlign:"right"}}>
                <div style={{fontSize:"18px",fontWeight:"300",color:targetTierCol,fontFamily:D.serif,lineHeight:1}}>{item.target.overall.toFixed(1)}</div>
                <div style={{fontSize:"8px",color:D.textFaint,fontFamily:D.mono,letterSpacing:"1px"}}>{item.target.tier} TIER</div>
              </div>
              <div style={{color:D.textFaint,fontSize:"14px",flexShrink:0}}>›</div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ─── DETAIL VIEW ─────────────────────────────────────────────────────────────
const DetailView=({work,onBack,onSelect})=>{
  const[scoreDetail,setScoreDetail]=useState(null);
  const[deep,setDeep]=useState(false);
  const[spoilerOk,setSpoilerOk]=useState(false);
  const[barsAnim,setBarsAnim]=useState(false);
  const[vExp,setVExp]=useState(false);

  const hasArcs=work.arcs&&work.arcs.length>0;
  const tierCol=TIER_C[work.tier]||D.amber;

  useEffect(()=>{window.scrollTo(0,0);},[]);
  useEffect(()=>{setTimeout(()=>setBarsAnim(true),400);},[]);

  if (scoreDetail) {
    return (
      <ScoreDetailPage
        categoryKey={scoreDetail.categoryKey}
        val={scoreDetail.val}
        explanation={scoreDetail.explanation}
        color={work.color}
        work={work}
        onBack={() => setScoreDetail(null)}
      />
    );
  }

  return(
    <div style={{minHeight:"100vh",background:D.bg,color:D.text,fontFamily:D.serif}}>
      {/* Hero */}
      <div style={{position:"relative",height:"340px",overflow:"hidden"}}>
        <div style={{position:"absolute",inset:0,background:D.bg}}/>
        <div style={{position:"absolute",inset:0,background:"linear-gradient(to bottom,transparent 25%,#080810 100%)"}}/>
        <button onClick={onBack} style={{position:"absolute",top:"20px",left:"20px",zIndex:10,background:"rgba(59,130,246,0.08)",border:"1px solid rgba(59,130,246,0.3)",borderRadius:"10px",padding:"8px 16px",color:D.blue,fontSize:"12px",cursor:"pointer",fontFamily:D.mono,letterSpacing:"1px",backdropFilter:"blur(8px)"}}>← BACK</button>
        <div style={{position:"absolute",bottom:"36px",left:"0",right:"0",padding:"0 24px",animation:"heroIn 0.6s ease"}}>
          <div style={{display:"flex",gap:"8px",marginBottom:"12px",alignItems:"center",flexWrap:"wrap"}}>
            <span style={{fontSize:"10px",color:tierCol,fontFamily:D.mono,fontWeight:"900",border:`1px solid ${tierCol}`,borderRadius:"5px",padding:"2px 8px",letterSpacing:"2px"}}>TIER {work.tier}</span>
            <span style={{fontSize:"10px",color:D.textDim,fontFamily:D.mono}}>{work.type} · {work.year}</span>
            <span style={{fontSize:"10px",fontFamily:D.mono,color:D.textFaint}}>· {work.status}</span>
          </div>
          <h1 style={{margin:"0 0 8px",fontSize:"clamp(28px,6vw,54px)",fontWeight:"900",letterSpacing:"-1px",lineHeight:1.0,color:D.text}}>{work.title}</h1>
          <p style={{margin:"0 0 18px",fontSize:"14px",color:D.textDim,fontStyle:"italic"}}>"{work.hook}"</p>
          <div style={{display:"flex",alignItems:"center",gap:"20px",flexWrap:"wrap"}}>
            <div style={{display:"flex",flexDirection:"column",gap:"2px"}}>
              <span style={{fontSize:"9px",color:"rgba(59,130,246,0.7)",fontFamily:D.mono,letterSpacing:"3px"}}>PEAK SCORE</span>
              <div style={{display:"flex",alignItems:"baseline",gap:"6px"}}>
                <span style={{fontSize:"50px",fontWeight:"300",color:D.amber,fontFamily:D.serif,lineHeight:1}}>{work.overall.toFixed(1)}</span>
                <span style={{fontSize:"13px",color:D.textFaint,fontFamily:D.sans}}>/10</span>
              </div>
            </div>
            {work.experience&&(
              <>
                <div style={{width:"1px",height:"44px",background:"rgba(255,255,255,0.1)"}}/>
                <div style={{display:"flex",flexDirection:"column",gap:"2px"}}>
                  <span style={{fontSize:"9px",color:"rgba(139,92,246,0.7)",fontFamily:D.mono,letterSpacing:"3px"}}>PEAK EXPERIENCE</span>
                  <div style={{display:"flex",alignItems:"baseline",gap:"6px"}}>
                    <span style={{fontSize:"50px",fontWeight:"300",color:D.purple,fontFamily:D.serif,lineHeight:1}}>{work.experience.toFixed(1)}</span>
                    <span style={{fontSize:"13px",color:D.textFaint,fontFamily:D.sans}}>/10</span>
                  </div>
                </div>
              </>
            )}
            {work.part1Score&&(
              <>
                <div style={{width:"1px",height:"44px",background:"rgba(255,255,255,0.1)"}}/>
                <div><div style={{fontSize:"9px",color:"rgba(255,107,69,0.7)",fontFamily:D.mono,letterSpacing:"2px",marginBottom:"2px"}}>PART 1</div><div style={{fontSize:"28px",fontWeight:"300",color:D.amber,fontFamily:D.serif,lineHeight:1}}>{work.part1Score}</div></div>
                <div><div style={{fontSize:"9px",color:"rgba(67,97,238,0.7)",fontFamily:D.mono,letterSpacing:"2px",marginBottom:"2px"}}>PART 2</div><div style={{fontSize:"28px",fontWeight:"300",color:D.amber,fontFamily:D.serif,lineHeight:1}}>{work.part2Score}</div></div>
              </>
            )}
            <button
              onClick={()=>{
                const txt=`PEAK rates ${work.title} — ${work.overall.toFixed(1)}/10 ${work.tier} Tier\n\n"${work.verdict?.line||work.hook}"\n\npeak-ratings.com #Peak #${work.title.replace(/\s+/g,"")}`;
                window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(txt)}`,"_blank");
              }}
              style={{padding:"8px 14px",background:D.blueFaint,border:`1px solid ${D.blueDim}`,borderRadius:"8px",color:D.amber,fontSize:"11px",cursor:"pointer",fontFamily:D.mono,letterSpacing:"1px",whiteSpace:"nowrap"}}
            >Share ↗</button>
          </div>
        </div>
      </div>

      {/* ── SINGLE SCROLL CONTENT ── */}
      <div style={{maxWidth:"900px",margin:"0 auto",padding:"40px 20px 120px"}}>

        {/* 1. PEAK SAYS */}
        <PeakSaysSection work={work}/>

        {/* 2. OVERVIEW */}
        <SectionDivider label="OVERVIEW" color={work.color}/>
        <div style={{marginBottom:"28px"}}>
          <div style={{fontSize:"10px",color:`${work.color}80`,fontFamily:D.mono,letterSpacing:"3px",marginBottom:"8px"}}>SURFACE READING</div>
          <p style={{margin:0,fontSize:"15px",color:D.textDim,fontStyle:"italic",fontFamily:D.serif}}>{work.overview.surface}</p>
        </div>
        <NarrativeViz work={work}/>
        <div style={{borderLeft:`3px solid ${work.color}`,paddingLeft:"20px",marginBottom:"28px"}}>
          <div style={{fontSize:"10px",color:work.color,fontFamily:D.mono,letterSpacing:"3px",marginBottom:"10px"}}>ACTUAL READING</div>
          <p style={{margin:0,fontSize:"18px",color:D.text,lineHeight:1.7,fontFamily:D.serif,fontWeight:"600"}}>{work.overview.real}</p>
        </div>
        <div style={{background:"rgba(255,255,255,0.02)",border:"1px solid rgba(255,255,255,0.07)",borderRadius:"4px",overflow:"hidden",marginBottom:"20px"}}>
          <div style={{padding:"20px 22px"}}>
            <div style={{display:"flex",alignItems:"center",gap:"8px",marginBottom:"12px"}}>
              <span style={{fontSize:"10px",color:D.textFaint,fontFamily:D.sans,letterSpacing:"3px"}}>🧠 DEEP ANALYSIS</span>
              <span style={{fontSize:"9px",color:D.blue,fontFamily:D.mono,border:"1px solid rgba(255,107,107,0.4)",borderRadius:"4px",padding:"1px 6px",letterSpacing:"1px"}}>⚠ SPOILERS</span>
            </div>
            {!spoilerOk ? (
              <div style={{padding:"20px",background:"rgba(255,107,107,0.05)",border:"1px solid rgba(255,107,107,0.15)",borderRadius:"12px",textAlign:"center"}}>
                <div style={{fontSize:"24px",marginBottom:"10px"}}>⚠️</div>
                <div style={{fontSize:"13px",color:D.textMid,fontFamily:D.serif,marginBottom:"6px"}}>This section contains major plot spoilers.</div>
                <div style={{fontSize:"11px",color:D.textDim,fontFamily:D.mono,marginBottom:"16px"}}>Character deaths, twists, ending details revealed.</div>
                <button onClick={()=>setSpoilerOk(true)} style={{background:"rgba(139,92,246,0.12)",border:"1px solid rgba(139,92,246,0.4)",borderRadius:"8px",padding:"9px 20px",color:"#8B5CF6",fontSize:"12px",cursor:"pointer",fontFamily:D.mono,letterSpacing:"1px"}}>
                  I've seen / read it — show analysis
                </button>
              </div>
            ) : (
              <>
                <p style={{margin:0,fontSize:"14px",color:D.textMid,lineHeight:1.85,fontFamily:D.serif,maxHeight:deep?"none":"90px",overflow:"hidden",maskImage:deep?"none":"linear-gradient(180deg,black 45%,transparent 100%)",WebkitMaskImage:deep?"none":"linear-gradient(180deg,black 45%,transparent 100%)"}}>{work.overview.deep}</p>
                <div style={{marginTop:"14px"}}>
                  <button onClick={()=>setDeep(d=>!d)} style={{background:"rgba(59,130,246,0.06)",border:"1px solid rgba(59,130,246,0.2)",borderRadius:"6px",padding:"8px 16px",color:"#3B82F6",fontSize:"12px",cursor:"pointer",fontFamily:D.mono,letterSpacing:"1px"}}>
                    {deep?"Collapse ↑":"Read Full Analysis ↓"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
        <div style={{textAlign:"center",padding:"24px 20px"}}>
          <p style={{margin:0,fontSize:"17px",color:D.textDim,fontStyle:"italic",fontFamily:D.serif,lineHeight:1.6}}>"{work.tagline}"</p>
        </div>

        {/* 3. ARC BREAKDOWN */}
        {hasArcs&&(
          <>
            <SectionDivider label="ARC BREAKDOWN" color={work.color}/>
            <p style={{margin:"0 0 20px",fontSize:"12px",color:D.textDim,fontFamily:D.mono}}>Ratings and hooks are always visible. Full analysis is spoiler-gated.</p>
            {work.arcs.map((arc,i)=><ArcCard key={arc.name} arc={arc} color={work.color} index={i}/>)}
          </>
        )}

        {/* 4. SCORES */}
        <SectionDivider label="CRAFT SCORES" color={work.color}/>
        <p style={{margin:"0 0 22px",fontSize:"12px",color:D.textDim,fontFamily:D.mono}}>Tap any category to see why it got that score.</p>
        <RadarChart work={work} onOpenDetail={(categoryKey,val,explanation)=>setScoreDetail({categoryKey,val,explanation})}/>
        <div style={{display:"flex",justifyContent:"flex-end",marginBottom:"16px"}}>
          <DownloadButton targetId="radar-chart-container" filename={`peak-${work.title.replace(/\s+/g,"-").toLowerCase()}-scores`} label="Save Chart"/>
        </div>
        {work.part1Score&&(
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"12px",marginTop:"8px"}}>
            <div style={{padding:"18px",background:"rgba(255,255,255,0.02)",border:"1px solid rgba(255,255,255,0.07)",borderRadius:"14px",textAlign:"center"}}>
              <div style={{fontSize:"9px",color:D.blue,fontFamily:D.mono,letterSpacing:"2px",marginBottom:"5px"}}>PART 1</div>
              <div style={{fontSize:"42px",fontWeight:"900",color:D.blue,fontFamily:D.mono,lineHeight:1}}>{work.part1Score}</div>
            </div>
            <div style={{padding:"18px",background:"rgba(255,255,255,0.02)",border:"1px solid rgba(255,255,255,0.07)",borderRadius:"14px",textAlign:"center"}}>
              <div style={{fontSize:"9px",color:D.blue,fontFamily:D.mono,letterSpacing:"2px",marginBottom:"5px"}}>PART 2</div>
              <div style={{fontSize:"42px",fontWeight:"900",color:D.blue,fontFamily:D.mono,lineHeight:1}}>{work.part2Score}</div>
            </div>
          </div>
        )}

        {/* 5. COMPARE */}
        {work.comparisons&&work.comparisons.length>0&&(
          <>
            <SectionDivider label="COMPARE" color={work.color}/>
            <p style={{margin:"0 0 16px",fontSize:"12px",color:D.textDim,fontFamily:D.mono}}>Tap to expand · Tap again to open that rating.</p>
            <div style={{display:"flex",gap:"12px",overflowX:"auto",paddingBottom:"16px",scrollbarWidth:"none"}}>
              {work.comparisons.map((c,i)=><CmpCard key={c.title} comp={c} index={i} onSelect={(w)=>{onBack();setTimeout(()=>onSelect(w),80);}}/>)}
            </div>
          </>
        )}

        {/* 6. FINAL */}
        <SectionDivider label="FINAL VERDICT" color={work.color}/>
        <TierReveal work={work}/>
        <div style={{marginTop:"28px",background:"rgba(255,255,255,0.02)",border:"1px solid rgba(255,255,255,0.07)",borderRadius:"4px",overflow:"hidden"}}>
          <div style={{padding:"22px 24px"}}>
            <div style={{fontSize:"10px",color:"rgba(255,255,255,0.22)",fontFamily:D.mono,letterSpacing:"3px",marginBottom:"14px"}}>FULL VERDICT</div>
            <p style={{margin:0,fontSize:"15px",color:D.textMid,lineHeight:1.85,fontFamily:D.serif,maxHeight:vExp?"none":"100px",overflow:"hidden",maskImage:vExp?"none":"linear-gradient(180deg,black 50%,transparent 100%)",WebkitMaskImage:vExp?"none":"linear-gradient(180deg,black 50%,transparent 100%)"}}>{work.verdict.full}</p>
          </div>
          <div style={{padding:"0 24px 20px"}}>
            <button onClick={()=>setVExp(v=>!v)} style={{background:"rgba(59,130,246,0.06)",border:"1px solid rgba(59,130,246,0.2)",borderRadius:"6px",padding:"8px 16px",color:"#3B82F6",fontSize:"12px",cursor:"pointer",fontFamily:D.mono,letterSpacing:"1px"}}>
              {vExp?"Collapse ↑":"Read Full Verdict ↓"}
            </button>
          </div>
        </div>

        {/* 7. WHERE TO GO NEXT */}
        <ConversationalGuidedNext work={work} onSelect={(w)=>{onBack();setTimeout(()=>onSelect(w),80);}}/>

      </div>
    </div>
  );
};
// Get a free key at themoviedb.org/settings/api then paste it below
const TMDB_KEY = "YOUR_TMDB_API_KEY_HERE";
const TMDB_IMG = "https://image.tmdb.org/t/p/w342";
const TMDB_BASE = "https://api.themoviedb.org/3";
const HAS_TMDB = TMDB_KEY !== "YOUR_TMDB_API_KEY_HERE";

// Match a TMDB title to our rated Peak works
const matchPeak = (tmdbTitle) => {
  if (!tmdbTitle) return null;
  const t = tmdbTitle.toLowerCase().replace(/[^a-z0-9]/g,"");
  return WORKS.find(w => {
    const wt = w.title.toLowerCase().replace(/[^a-z0-9]/g,"");
    return wt === t || wt.includes(t) || t.includes(wt);
  }) || null;
};

// ─── SEARCH RESULT ROW ───────────────────────────────────────────────────────
const SearchRow = ({ item, onSelect }) => {
  const [hov, setHov] = useState(false);
  const title = item.title || item.name || "";
  const year = (item.release_date || item.first_air_date || "").slice(0,4);
  const mediaType = item.media_type === "tv" ? "TV" : "Film";
  const poster = item.poster_path ? `${TMDB_IMG}${item.poster_path}` : null;
  const tmdbScore = item.vote_average ? item.vote_average.toFixed(1) : null;
  const peakMatch = matchPeak(title);
  const accent = D.amber;

  return (
    <div
      onClick={() => onSelect(item, peakMatch)}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display:"flex", alignItems:"center", gap:"14px",
        padding:"12px 14px", borderRadius:"14px",
        background:hov?"rgba(255,255,255,0.04)":"rgba(255,255,255,0.02)",
        border: hov ? `1px solid ${accent}40` : "1px solid rgba(255,255,255,0.06)",
        cursor:"pointer", transition:"all 0.2s",
        animation:"slideIn 0.3s ease both",
      }}
    >
      {/* Poster thumbnail */}
      <div style={{width:"46px",height:"66px",borderRadius:"8px",overflow:"hidden",flexShrink:0,background:"rgba(255,255,255,0.04)",display:"flex",alignItems:"center",justifyContent:"center"}}>
        {poster
          ? <img src={poster} alt={title} style={{width:"100%",height:"100%",objectFit:"cover"}}/>
          : <span style={{fontSize:"20px",opacity:0.3}}>🎬</span>
        }
      </div>

      {/* Info */}
      <div style={{flex:1,minWidth:0}}>
        <div style={{display:"flex",alignItems:"center",gap:"7px",marginBottom:"3px",flexWrap:"wrap"}}>
          <span style={{fontSize:"14px",fontWeight:"800",color:D.text,fontFamily:D.serif,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis",maxWidth:"190px"}}>{title}</span>
          {peakMatch && (
            <span style={{fontSize:"8px",color:peakMatch.color,fontFamily:D.mono,fontWeight:"900",border:`1px solid ${peakMatch.color}`,borderRadius:"4px",padding:"1px 5px",letterSpacing:"1px",flexShrink:0}}>PEAK RATED</span>
          )}
        </div>
        <div style={{fontSize:"10px",color:D.textFaint,fontFamily:D.sans,marginBottom:"3px"}}>
          {mediaType}{year ? ` · ${year}` : ""}{tmdbScore ? ` · ⭐ ${tmdbScore}` : ""}
        </div>
        {peakMatch && (
          <div style={{fontSize:"11px",color:D.textDim,fontStyle:"italic",fontFamily:D.serif,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>"{peakMatch.hook}"</div>
        )}
      </div>

      {/* Score */}
      <div style={{flexShrink:0,textAlign:"right",minWidth:"52px"}}>
        {peakMatch ? (
          <>
            <div style={{fontSize:"26px",fontWeight:"900",color:sc(peakMatch.overall),fontFamily:D.mono,lineHeight:1,letterSpacing:"-1px"}}>{peakMatch.overall.toFixed(1)}</div>
            <div style={{fontSize:"8px",color:D.textFaint,fontFamily:D.mono}}>PEAK/10</div>
          </>
        ) : (
          <div style={{fontSize:"10px",color:D.textFaint,fontFamily:D.sans,textAlign:"center",lineHeight:1.4}}>Not<br/>rated</div>
        )}
      </div>
      <div style={{color:D.textFaint,fontSize:"16px"}}>›</div>
    </div>
  );
};

// ─── UNRATED DETAIL VIEW ─────────────────────────────────────────────────────
const UnratedView = ({ item, onBack }) => {
  const title = item.title || item.name || "";
  const year = (item.release_date || item.first_air_date || "").slice(0,4);
  const mediaType = item.media_type === "tv" ? "TV Series" : "Film";
  const poster = item.poster_path ? `https://image.tmdb.org/t/p/w500${item.poster_path}` : null;
  const backdrop = item.backdrop_path ? `https://image.tmdb.org/t/p/w1280${item.backdrop_path}` : null;
  const tmdbScore = item.vote_average ? item.vote_average.toFixed(1) : "N/A";
  const [rating, setRating] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => { window.scrollTo(0,0); }, []);

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await generatePeakRating(title, mediaType);
      setRating(result);
    } catch(e) {
      setError("Failed to generate rating. Check your API key and credits.");
    }
    setLoading(false);
  };

  const sc2 = v => v>=9?"#1D9E75":v>=8?"#378ADD":v>=7?"#BA7517":"#E24B4A";

  return (
    <div style={{minHeight:"100vh",background:D.bg,color:D.text,fontFamily:D.serif}}>
      <div style={{position:"relative",height:"360px",overflow:"hidden"}}>
        {backdrop
          ? <img src={backdrop} alt={title} style={{width:"100%",height:"100%",objectFit:"cover",filter:"brightness(0.22)"}}/>
          : <div style={{width:"100%",height:"100%",background:"linear-gradient(135deg,#0d0d20,#080810)"}}/>
        }
        <div style={{position:"absolute",inset:0,background:"linear-gradient(to bottom,transparent 20%,#080810 100%)"}}/>
        <button onClick={onBack} style={{position:"absolute",top:"20px",left:"20px",zIndex:10,background:"rgba(59,130,246,0.08)",border:"1px solid rgba(59,130,246,0.3)",borderRadius:"10px",padding:"8px 16px",color:D.blue,fontSize:"12px",cursor:"pointer",fontFamily:D.mono,letterSpacing:"1px",backdropFilter:"blur(8px)"}}>← BACK</button>
        <div style={{position:"absolute",bottom:"28px",left:"0",right:"0",padding:"0 22px",display:"flex",gap:"18px",alignItems:"flex-end"}}>
          {poster && <img src={poster} alt={title} style={{width:"80px",height:"120px",borderRadius:"10px",objectFit:"cover",flexShrink:0}}/>}
          <div style={{flex:1,animation:"heroIn 0.5s ease"}}>
            <div style={{fontSize:"10px",color:D.textDim,fontFamily:D.mono,marginBottom:"6px"}}>{mediaType} · {year}</div>
            <h1 style={{margin:"0 0 10px",fontSize:"clamp(22px,5vw,36px)",fontWeight:"900",color:D.text,lineHeight:1.1}}>{title}</h1>
            {rating ? (
              <div style={{display:"flex",gap:"20px",alignItems:"flex-end"}}>
                <div>
                  <div style={{fontSize:"9px",color:`${D.amber}80`,fontFamily:D.mono,letterSpacing:"2px",marginBottom:"2px"}}>PEAK SCORE</div>
                  <div style={{fontSize:"36px",fontWeight:"300",color:D.amber,fontFamily:D.serif,lineHeight:1}}>{rating.peakScore.toFixed(1)}</div>
                </div>
                <div>
                  <div style={{fontSize:"9px",color:"rgba(255,255,255,0.3)",fontFamily:D.mono,letterSpacing:"2px",marginBottom:"2px"}}>PEAK EXPERIENCE</div>
                  <div style={{fontSize:"36px",fontWeight:"300",color:D.text,fontFamily:D.serif,lineHeight:1}}>{rating.peakExperience.toFixed(1)}</div>
                </div>
              </div>
            ) : (
              <div>
                <div style={{fontSize:"9px",color:"rgba(255,212,59,0.6)",fontFamily:D.mono,letterSpacing:"2px",marginBottom:"3px"}}>TMDB SCORE</div>
                <div style={{fontSize:"28px",fontWeight:"300",color:D.amber,fontFamily:D.serif,lineHeight:1}}>{tmdbScore}</div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div style={{maxWidth:"800px",margin:"0 auto",padding:"24px 20px 100px"}}>
        {!rating && !loading && (
          <div style={{padding:"20px",background:"rgba(255,255,255,0.02)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:"14px",marginBottom:"24px",textAlign:"center"}}>
            <div style={{fontSize:"9px",color:D.blue,fontFamily:D.mono,letterSpacing:"3px",marginBottom:"10px"}}>NOT YET IN PEAK DATABASE</div>
            <p style={{margin:"0 0 16px",fontSize:"14px",color:D.textMid,lineHeight:1.7,fontFamily:D.serif}}>Generate an AI-powered Peak rating for <strong style={{color:D.text}}>{title}</strong> using our craft-based framework.</p>
            <button onClick={handleGenerate} style={{background:D.blueFaint,border:`1px solid ${D.blueDim}`,borderRadius:"10px",padding:"12px 28px",color:D.amber,fontSize:"13px",cursor:"pointer",fontFamily:D.mono,letterSpacing:"1px"}}>
              Generate Peak Rating ↗
            </button>
          </div>
        )}

        {loading && (
          <div style={{padding:"40px",textAlign:"center",color:D.textDim,fontFamily:D.mono,fontSize:"12px",letterSpacing:"2px"}}>
            GENERATING PEAK RATING...
          </div>
        )}

        {error && (
          <div style={{padding:"16px",background:"rgba(255,50,50,0.05)",border:"1px solid rgba(255,50,50,0.2)",borderRadius:"10px",marginBottom:"20px",color:"#ff6b6b",fontSize:"13px",fontFamily:D.sans}}>{error}</div>
        )}

        {rating && (
          <div style={{animation:"fadeIn 0.4s ease"}}>
            {/* Intent */}
            <div style={{marginBottom:"20px",padding:"16px 20px",background:"rgba(255,255,255,0.02)",border:"1px solid rgba(255,255,255,0.07)",borderRadius:"12px"}}>
              <div style={{fontSize:"9px",color:D.amberDim,fontFamily:D.mono,letterSpacing:"3px",marginBottom:"8px"}}>INTENT</div>
              <p style={{margin:0,fontSize:"14px",color:D.textMid,fontStyle:"italic",fontFamily:D.serif}}>{rating.intent}</p>
            </div>

            {/* Synopsis */}
            <div style={{marginBottom:"20px"}}>
              <div style={{fontSize:"9px",color:D.textFaint,fontFamily:D.mono,letterSpacing:"3px",marginBottom:"9px"}}>SYNOPSIS</div>
              <p style={{margin:0,fontSize:"14px",color:D.textMid,lineHeight:1.8,fontFamily:D.serif}}>{rating.synopsis}</p>
            </div>

            {/* Tier badge */}
            <div style={{marginBottom:"24px",display:"flex",gap:"12px",alignItems:"center"}}>
              <span style={{fontSize:"11px",color:D.blue,fontFamily:D.mono,border:`1px solid ${D.amber}`,borderRadius:"5px",padding:"3px 10px",letterSpacing:"2px"}}>TIER {rating.tier}</span>
              <span style={{fontSize:"12px",color:D.textDim,fontFamily:D.mono}}>{rating.status} · {rating.year}</span>
            </div>

            {/* Scores grid */}
            <div style={{marginBottom:"24px"}}>
              <div style={{fontSize:"10px",color:"rgba(255,255,255,0.22)",fontFamily:D.mono,letterSpacing:"2px",marginBottom:"14px"}}>CRAFT BREAKDOWN</div>
              {rating.scores && Object.entries(rating.scores).map(([k,v])=>(
                <div key={k} style={{marginBottom:"12px"}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"5px"}}>
                    <span style={{fontSize:"11px",color:D.textMid,fontFamily:D.mono,textTransform:"uppercase",letterSpacing:"0.8px"}}>{k.replace(/([A-Z])/g," $1").trim()}</span>
                    <span style={{fontSize:"14px",color:sc2(v),fontFamily:D.mono,fontWeight:"900"}}>{v.toFixed(1)}</span>
                  </div>
                  <div style={{height:"4px",background:"rgba(255,255,255,0.06)",borderRadius:"2px",overflow:"hidden"}}>
                    <div style={{width:`${(v/10)*100}%`,height:"100%",background:"linear-gradient(90deg,#3B82F6,#8B5CF6)",borderRadius:"2px",transition:"width 1s ease"}}/>
                  </div>
                  {rating.scoreReasons&&rating.scoreReasons[k]&&(
                    <p style={{margin:"6px 0 0",fontSize:"11px",color:D.textDim,fontFamily:D.serif,lineHeight:1.6}}>{rating.scoreReasons[k]}</p>
                  )}
                </div>
              ))}
            </div>

            {/* Verdict */}
            <div style={{padding:"20px 22px",background:"rgba(255,255,255,0.02)",border:"1px solid rgba(255,255,255,0.07)",borderRadius:"14px",marginBottom:"16px"}}>
              <div style={{fontSize:"10px",color:"rgba(255,255,255,0.22)",fontFamily:D.mono,letterSpacing:"3px",marginBottom:"12px"}}>VERDICT</div>
              <p style={{margin:0,fontSize:"14px",color:D.textMid,lineHeight:1.85,fontFamily:D.serif}}>{rating.verdict}</p>
            </div>

            {/* Compared to */}
            {rating.comparisons&&rating.comparisons.length>0&&(
              <div>
                <div style={{fontSize:"10px",color:D.textFaint,fontFamily:D.mono,letterSpacing:"3px",marginBottom:"12px"}}>COMPARED TO SIMILAR WORKS</div>
                {rating.comparisons.map((c,i)=>(
                  <div key={i} style={{padding:"10px 14px",background:"rgba(255,255,255,0.02)",border:"1px solid rgba(255,255,255,0.06)",borderRadius:"8px",marginBottom:"8px",fontSize:"13px",color:D.textMid,fontFamily:D.serif}}>· {c}</div>
                ))}
              </div>
            )}

            {rating.incompletenessNote&&(
              <div style={{marginTop:"16px",padding:"12px 16px",background:"rgba(255,212,59,0.05)",border:"1px solid rgba(255,212,59,0.15)",borderRadius:"8px",fontSize:"12px",color:D.amberDim,fontFamily:D.serif}}>{rating.incompletenessNote}</div>
            )}
          </div>
        )}

        {!rating && !loading && item.overview && (
          <div style={{marginTop:"16px"}}>
            <div style={{fontSize:"9px",color:D.textFaint,fontFamily:D.mono,letterSpacing:"3px",marginBottom:"9px"}}>SYNOPSIS</div>
            <p style={{margin:0,fontSize:"14px",color:D.textMid,lineHeight:1.8,fontFamily:D.serif}}>{item.overview}</p>
          </div>
        )}
      </div>
    </div>
  );
};

// ─── HOME VIEW ────────────────────────────────────────────────────────────────
const HomeView = ({ onSelect }) => {
  const [query, setQuery] = useState("");
  const [tierF, setTierF] = useState("All");
  const [typeF, setTypeF] = useState("All");
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [searchMode, setSearchMode] = useState(false);
  const debRef = useRef(null);

  const types = ["All","Manga","Anime","TV","Film","Novel","Manhwa"];
  const tiers = ["All","S","A","B","C","D"];

  // Local filter
  const filtered = WORKS.filter(w => {
    const qMatch = !query || w.title.toLowerCase().includes(query.toLowerCase()) || w.type.toLowerCase().includes(query.toLowerCase()) || (w.hook||"").toLowerCase().includes(query.toLowerCase());
    const tMatch = tierF === "All" || w.tier === tierF;
    const tyMatch = typeF === "All" || w.type.includes(typeF);
    return qMatch && tMatch && tyMatch;
  });
  const byTier = { S:filtered.filter(w=>w.tier==="S"), A:filtered.filter(w=>w.tier==="A"), B:filtered.filter(w=>w.tier==="B"), C:filtered.filter(w=>w.tier==="C") };

  // Search effect
  useEffect(() => {
    clearTimeout(debRef.current);
    if (!query.trim()) { setSearchMode(false); setSearchResults([]); return; }
    setSearchMode(true);
    if (HAS_TMDB) {
      setSearching(true);
      debRef.current = setTimeout(async () => {
        try {
          const res = await fetch(`${TMDB_BASE}/search/multi?api_key=${TMDB_KEY}&query=${encodeURIComponent(query)}&include_adult=false`);
          const data = await res.json();
          setSearchResults((data.results||[]).filter(r=>r.media_type==="movie"||r.media_type==="tv").slice(0,14));
        } catch(e) { setSearchResults([]); }
        setSearching(false);
      }, 380);
    } else {
      setSearchResults([]);
      setSearching(false);
    }
  }, [query]);

  const handleSelect = (tmdbItem, peakMatch) => {
    if (peakMatch) onSelect(peakMatch);
    else onSelect({ __unrated: true, ...tmdbItem });
  };

  return (
    <div style={{minHeight:"100vh",background:D.bg,color:D.text,fontFamily:D.serif}}>
      {/* Header */}
      <div style={{position:"sticky",top:0,zIndex:100,background:"rgba(10,10,18,0.97)",backdropFilter:"blur(24px)",borderBottom:"1px solid rgba(255,255,255,0.05)"}}>
        <div style={{maxWidth:"960px",margin:"0 auto",padding:"0 18px"}}>
          <div style={{display:"flex",alignItems:"center",height:"50px",gap:"16px"}}>
            <div style={{fontSize:"14px",fontWeight:"900",fontFamily:D.mono,letterSpacing:"3px",background:"linear-gradient(90deg,#3B82F6,#8B5CF6)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",flexShrink:0}}>PEAK<span style={{color:D.textFaint}}>.</span></div>
            {!searchMode && (
              <div style={{display:"flex",gap:"4px",overflowX:"auto",scrollbarWidth:"none",flex:1}}>
                {types.map(t=>(
                  <button key={t} onClick={()=>setTypeF(t)} style={{padding:"3px 12px",borderRadius:"2px",border:typeF===t?`1px solid #3B82F6`:"1px solid rgba(255,255,255,0.07)",background:typeF===t?`rgba(59,130,246,0.12)`:"transparent",color:typeF===t?`#3B82F6`:D.textFaint,fontSize:"10px",fontWeight:"400",cursor:"pointer",whiteSpace:"nowrap",fontFamily:D.sans,transition:"all 0.16s"}}>{t}</button>
                ))}
              </div>
            )}
            {searchMode && (
              <div style={{flex:1,fontSize:"11px",color:D.textDim,fontFamily:D.mono}}>
                {HAS_TMDB ? (searching ? "Searching..." : `${searchResults.length} results`) : `${filtered.length} results from PEAK library`}
              </div>
            )}
          </div>
          {!searchMode && (
            <div style={{display:"flex",alignItems:"center",gap:"4px",paddingBottom:"9px"}}>
              <span style={{fontSize:"9px",color:D.textFaint,fontFamily:D.mono,letterSpacing:"2px",marginRight:"4px"}}>TIER</span>
              {tiers.map(t=>{
                const tc=t!=="All"?TIER_C[t]:null;
                const active=tierF===t;
                return <button key={t} onClick={()=>setTierF(t)} style={{padding:"2px 9px",borderRadius:"5px",border:active&&tc?`1px solid ${tc}`:active?"1px solid rgba(255,255,255,0.25)":"1px solid rgba(255,255,255,0.06)",background:active&&tc?`${tc}15`:active?"rgba(255,255,255,0.05)":"transparent",color:active&&tc?tc:active?"#fff":"rgba(255,255,255,0.28)",fontSize:"10px",fontWeight:"800",cursor:"pointer",fontFamily:D.mono,transition:"all 0.16s"}}>{t}</button>;
              })}
              <span style={{fontSize:"9px",color:D.textFaint,fontFamily:D.mono,marginLeft:"auto"}}>{filtered.length} of {WORKS.length}</span>
            </div>
          )}
        </div>
      </div>

      {/* Hero */}
      {!searchMode && (
        <div style={{maxWidth:"960px",margin:"0 auto",padding:"48px 18px 28px",animation:"heroIn 0.6s ease"}}>
          <div style={{fontSize:"9px",letterSpacing:"5px",color:"#3B82F6",fontFamily:D.mono,marginBottom:"10px",opacity:0.7}}>AN AI-POWERED RATING SYSTEM</div>
          <h1 style={{margin:"0 0 8px",fontSize:"clamp(24px,4.5vw,40px)",fontWeight:"900",letterSpacing:"-1px",color:D.text}}>Rated on the principles of<br/><span style={{background:"linear-gradient(90deg,#3B82F6,#8B5CF6)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>great storytelling.</span> <span style={{color:D.textDim}}>Not popularity.</span></h1>
          <p style={{margin:0,fontSize:"13px",color:D.textDim,fontFamily:D.mono}}>{WORKS.length} works rated · Peak Score · Peak Experience · Arc breakdowns</p>
        </div>
      )}

      {/* SEARCH MODE */}
      {searchMode && (
        <div style={{maxWidth:"960px",margin:"0 auto",padding:"20px 18px 160px",animation:"fadeIn 0.2s ease"}}>
          {/* TMDB results */}
          {HAS_TMDB && !searching && searchResults.length > 0 && (
            <div>
              <div style={{fontSize:"9px",color:D.textFaint,fontFamily:D.mono,letterSpacing:"3px",marginBottom:"12px"}}>RESULTS — PEAK RATED SHOWN FIRST</div>
              <div style={{display:"flex",flexDirection:"column",gap:"8px"}}>
                {/* Peak matches first */}
                {searchResults.filter(r => matchPeak(r.title||r.name)).map((item,i) => (
                  <SearchRow key={`obr-${item.id||i}`} item={item} onSelect={handleSelect}/>
                ))}
                {/* Then unrated */}
                {searchResults.filter(r => !matchPeak(r.title||r.name)).map((item,i) => (
                  <SearchRow key={`tmdb-${item.id||i}`} item={item} onSelect={handleSelect}/>
                ))}
              </div>
            </div>
          )}

          {/* Loading skeletons */}
          {HAS_TMDB && searching && (
            <div style={{display:"flex",flexDirection:"column",gap:"8px"}}>
              {[1,2,3,4,5].map(i=>(
                <div key={i} style={{display:"flex",gap:"14px",padding:"12px 14px",borderRadius:"4px",background:"rgba(255,255,255,0.02)",border:"1px solid rgba(255,255,255,0.06)"}}>
                  <div style={{width:"46px",height:"66px",borderRadius:"8px",background:"linear-gradient(90deg,rgba(255,255,255,0.04) 25%,rgba(255,255,255,0.08) 50%,rgba(255,255,255,0.04) 75%)",backgroundSize:"200%",animation:"shimmer 1.5s infinite",flexShrink:0}}/>
                  <div style={{flex:1}}>
                    <div style={{height:"15px",width:"55%",background:"rgba(255,255,255,0.05)",borderRadius:"4px",marginBottom:"8px"}}/>
                    <div style={{height:"10px",width:"30%",background:"rgba(255,255,255,0.03)",borderRadius:"4px"}}/>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* No TMDB key — show Peak local results + instructions */}
          {!HAS_TMDB && (
            <>
              {filtered.length > 0 && (
                <div style={{marginBottom:"20px"}}>
                  <div style={{fontSize:"9px",color:D.textFaint,fontFamily:D.mono,letterSpacing:"3px",marginBottom:"12px"}}>PEAK LIBRARY RESULTS</div>
                  <div style={{display:"flex",flexDirection:"column",gap:"8px"}}>
                    {filtered.map((w,i) => (
                      <div key={w.id} onClick={()=>onSelect(w)}
                        style={{display:"flex",alignItems:"center",gap:"14px",padding:"12px 14px",borderRadius:"4px",background:"rgba(255,255,255,0.02)",border:`1px solid ${w.color}28`,cursor:"pointer",transition:"all 0.2s",animation:`slideIn 0.3s ease ${i*0.05}s both`}}
                        onMouseEnter={e=>{e.currentTarget.style.background="rgba(255,255,255,0.03)";}}
                        onMouseLeave={e=>{e.currentTarget.style.background="rgba(255,255,255,0.02)";}}
                      >
                        <div style={{width:"1px",height:"30px",borderRadius:"0",background:"rgba(255,255,255,0.15)",flexShrink:0}}/>
                        <div style={{flex:1,minWidth:0}}>
                          <div style={{fontSize:"15px",fontWeight:"800",color:D.text,fontFamily:D.serif,marginBottom:"2px"}}>{w.title}</div>
                          <div style={{fontSize:"10px",color:D.textFaint,fontFamily:D.sans}}>{w.type} · {w.status}</div>
                        </div>
                        <div style={{fontSize:"26px",fontWeight:"900",color:D.blue,fontFamily:D.mono}}>{w.overall.toFixed(1)}</div>
                        <div style={{color:D.textFaint,fontSize:"16px"}}>›</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <div style={{padding:"18px 20px",background:"rgba(255,255,255,0.02)",border:"1px solid rgba(255,255,255,0.07)",borderRadius:"14px"}}>
                <div style={{fontSize:"9px",color:D.textDim,fontFamily:D.mono,letterSpacing:"2px",marginBottom:"7px"}}>🔍 ENABLE LIVE SEARCH</div>
                <p style={{margin:"0 0 8px",fontSize:"13px",color:"rgba(255,255,255,0.48)",lineHeight:1.6,fontFamily:D.serif}}>Add your free TMDB key to search 500,000+ titles with real posters.</p>
                <p style={{margin:0,fontSize:"11px",color:D.textFaint,fontFamily:D.mono,lineHeight:1.8}}>
                  1. Visit themoviedb.org/settings/api<br/>
                  2. Copy your API Read Access Token<br/>
                  3. Replace YOUR_TMDB_API_KEY_HERE at top of file
                </p>
              </div>
            </>
          )}

          {/* Empty state */}
          {HAS_TMDB && !searching && searchResults.length === 0 && (
            <div style={{textAlign:"center",padding:"60px 20px",color:D.textFaint}}>
              <div style={{fontSize:"28px",marginBottom:"12px"}}>◎</div>
              <div style={{fontFamily:D.mono,fontSize:"12px",letterSpacing:"3px"}}>NO RESULTS FOUND</div>
            </div>
          )}
        </div>
      )}

      {/* LIBRARY MODE */}
      {!searchMode && (
        <div style={{maxWidth:"960px",margin:"0 auto",padding:"0 18px 160px"}}>
          {["S","A","B","C","D"].map(tier => {
            const works = byTier[tier];
            if (!works || !works.length) return null;
            const tc = TIER_C[tier];
            return (
              <div key={tier} style={{marginBottom:"36px"}}>
                <div style={{display:"flex",alignItems:"center",gap:"12px",marginBottom:"14px"}}>
                  <div style={{width:"30px",height:"30px",borderRadius:"7px",background:`${tc}14`,border:`1px solid ${tc}50`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:"13px",fontWeight:"900",color:tc,fontFamily:D.mono}}>{tier}</div>
                  <div style={{flex:1,height:"1px",background:"rgba(255,255,255,0.07)"}}/>
                  <span style={{fontSize:"9px",color:D.textFaint,fontFamily:D.mono}}>{works.length} {works.length===1?"work":"works"}</span>
                </div>
                <div style={{display:"flex",flexDirection:"column",gap:"8px"}}>
                  {works.map((w,i) => (
                    <div key={w.id} onClick={()=>onSelect(w)}
                      style={{display:"flex",alignItems:"center",gap:"14px",padding:"14px 16px",borderRadius:"4px",background:"rgba(255,255,255,0.02)",border:"1px solid rgba(255,255,255,0.07)",cursor:"pointer",transition:"all 0.22s",animation:`slideIn 0.4s ease ${i*0.06}s both`}}
                      onMouseEnter={e=>{e.currentTarget.style.background="rgba(255,255,255,0.03)";e.currentTarget.style.borderColor="rgba(255,255,255,0.1)";e.currentTarget.style.transform="translateX(2px)";}}
                      onMouseLeave={e=>{e.currentTarget.style.background="rgba(255,255,255,0.02)";e.currentTarget.style.borderColor="rgba(255,255,255,0.06)";e.currentTarget.style.transform="translateX(0)";}}
                    >
                      <div style={{width:"1px",height:"30px",borderRadius:"0",background:"rgba(255,255,255,0.15)",flexShrink:0}}/>
                      <div style={{flex:1,minWidth:0}}>
                        <div style={{display:"flex",alignItems:"center",gap:"8px",marginBottom:"3px",flexWrap:"wrap"}}>
                          <span style={{fontSize:"15px",fontWeight:"800",color:D.text,fontFamily:D.serif}}>{w.title}</span>
                          <span style={{fontSize:"9px",color:D.textFaint,fontFamily:D.mono,border:"1px solid rgba(255,255,255,0.08)",borderRadius:"4px",padding:"1px 6px"}}>{w.type}</span>
                          <span style={{fontSize:"9px",fontFamily:D.mono,color:D.textDim}}>{w.status}</span>
                        </div>
                        <p style={{margin:0,fontSize:"12px",color:D.textDim,fontStyle:"italic",fontFamily:D.serif,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>"{w.hook}"</p>
                      </div>
                      <div style={{textAlign:"right",flexShrink:0}}>
                        <div style={{fontSize:"24px",fontWeight:"300",color:D.blue,fontFamily:D.serif,lineHeight:1}}>{w.overall.toFixed(1)}</div>
                        <div style={{fontSize:"9px",color:D.textFaint,fontFamily:D.mono}}>/10</div>
                      </div>
                      <div style={{color:D.textFaint,fontSize:"16px"}}>›</div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
          {filtered.length === 0 && (
            <div style={{textAlign:"center",padding:"80px 20px",color:D.textFaint}}>
              <div style={{fontSize:"32px",marginBottom:"12px"}}>◎</div>
              <div style={{fontFamily:D.mono,fontSize:"12px",letterSpacing:"3px"}}>NO RESULTS FOUND</div>
            </div>
          )}
        </div>
      )}

      {/* Fixed search bar */}
      <div style={{position:"fixed",bottom:0,left:0,right:0,zIndex:200,background:"linear-gradient(to top,rgba(10,10,18,1) 65%,transparent 100%)",padding:"16px 18px 26px"}}>
        <div style={{maxWidth:"640px",margin:"0 auto",position:"relative"}}>
          <div style={{position:"absolute",left:"16px",top:"50%",transform:"translateY(-50%)",color:query?D.blue:D.textFaint,fontSize:"14px",pointerEvents:"none",transition:"color 0.2s"}}>◎</div>
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search any title..."
            style={{width:"100%",padding:"13px 44px 13px 42px",background:"rgba(10,10,18,0.98)",border:query?"1px solid rgba(59,130,246,0.45)":"1px solid rgba(255,255,255,0.07)",borderRadius:"3px",color:D.text,fontSize:"14px",fontFamily:D.sans,backdropFilter:"blur(16px)",boxShadow:"none",transition:"all 0.2s"}}
          />
          {query && <button onClick={()=>setQuery("")} style={{position:"absolute",right:"12px",top:"50%",transform:"translateY(-50%)",background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.07)",borderRadius:"50%",width:"22px",height:"22px",color:D.textDim,cursor:"pointer",fontSize:"10px",display:"flex",alignItems:"center",justifyContent:"center"}}>✕</button>}
        </div>
        <div style={{textAlign:"center",marginTop:"7px",fontSize:"9px",color:D.textFaint,fontFamily:D.mono,letterSpacing:"2px"}}>
          {HAS_TMDB ? "LIVE SEARCH · 500K+ TITLES · PEAK RATED HIGHLIGHTED" : `${WORKS.length} works rated · Add TMDB key for live search`}
        </div>
      </div>
    </div>
  );
};

// ─── APP ──────────────────────────────────────────────────────────────────────
export default function App() {
  const [selected, setSelected] = useState(null);

  const handleSelect = (work) => {
    setSelected(work);
    window.history.pushState({ peak: true }, "");
  };
  const handleBack = () => setSelected(null);

  useEffect(() => {
    const onPop = () => setSelected(null);
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  return (
    <>
      <style>{`
        @keyframes fadeIn{from{opacity:0}to{opacity:1}}
        @keyframes heroIn{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:translateY(0)}}
        @keyframes slideIn{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
        @keyframes expandIn{from{opacity:0;transform:translateY(-6px)}to{opacity:1;transform:translateY(0)}}
        @keyframes shimmer{0%{background-position:-200% 0}100%{background-position:200% 0}}
        @keyframes glowPulse{0%,100%{opacity:0.3}50%{opacity:0.6}}
        *{box-sizing:border-box}
        ::-webkit-scrollbar{width:3px;height:3px}
        ::-webkit-scrollbar-thumb{background:rgba(59,130,246,0.25);border-radius:2px}
        input,button{outline:none}
        body{margin:0;background:#0a0a12}
        body::before{content:"";position:fixed;top:-300px;left:50%;transform:translateX(-50%);width:700px;height:500px;background:radial-gradient(ellipse,rgba(59,130,246,0.07) 0%,rgba(139,92,246,0.04) 50%,transparent 70%);pointer-events:none;z-index:0;animation:glowPulse 6s ease-in-out infinite;}
      `}</style>
      {selected
        ? selected.__unrated
          ? <UnratedView item={selected} onBack={handleBack}/>
          : <DetailView work={selected} onBack={handleBack} onSelect={handleSelect}/>
        : <HomeView onSelect={handleSelect}/>
      }
    </>
  );
}
