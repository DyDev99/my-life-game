# ជីវិតខ្ញុំ (My Life) — Game Design Document

Oct 6, 2026 · @Sonal HENG

## 1. Document Control

This is version 0.1 of the Game Design Document (GDD), the single source of truth for what the game is before production starts. Every team member reads it; every change to scope is recorded here first.

| Field | Value |
| --- | --- |
| Working title | ជីវិតខ្ញុំ (My Life) |
| Document type | Game Design Document (pre-production) |
| Version | 0.1 — first draft |
| Status | Concept / pre-production |
| Owner | Game Director (to be assigned) |
| Reviewers | Lead Designer, Lead Engineer, Art Director, Producer |
| Currency used | US dollars (USD), as commonly used in Cambodia |

### Revision history

| Version | Date | Author | Change |
| --- | --- | --- | --- |
| 0.1 | 6 Oct 2026 | Concept owner | First draft built from the original concept notes |

## 2. Executive Summary

ជីវិតខ្ញុំ (My Life) is a single-player life simulation set in modern Cambodia, where the player builds an ordinary life through a career, money, family and community. There is no enemy to defeat; the question the game asks is "What kind of life do you want to build?"

### High concept

The Sims meets a career simulator, grounded in real Cambodian daily life: motorbikes, markets, family obligations, provincial towns and a realistic salary.

### Elevator pitch

Start at 22 with $100 and a motorbike. Choose to be a teacher in Kampong Cham, a developer in Phnom Penh, a farmer in Takeo or a shop owner in Siem Reap. Every morning you decide how to spend your time and money. Ten in-game years later, no two players have the same life — and every Cambodian player will say, "This is literally Cambodia."

### Key facts

| Item | Detail |
| --- | --- |
| Genre | Life simulation / career simulation, choice-driven |
| Perspective | Stylized 3D, isometric or third-person (to be decided at prototype) |
| Platforms | Android and iOS first; PC (Steam) second |
| Engine | Unity (LTS version) |
| Languages | Khmer and English at launch |
| Target age | 13+ |
| Session length | 10–20 minutes (one in-game day ≈ 5–8 minutes) |
| Business model | Premium or free-to-play with fair, non-pay-to-win options (see section 14) |

### Unique selling points

1. **Cultural recognition.** The first life sim built specifically around Cambodian life, written in Khmer, with real places, prices and social customs.
2. **Career gameplay, not career labels.** Each career is its own mini-game system (teaching a class, coding a project, running a farm), not just a salary number.
3. **Family and community first.** Relationships focus on parents, grandparents, siblings, neighbours and coworkers, not only romance.
4. **Emergent life stories.** A systemic simulation, not a fixed plot, so two players with the same start end up with very different lives.

## 3. Vision and Design Pillars

The vision: a game that lets Cambodian players see their own lives on screen, and lets everyone else experience what an ordinary life in Cambodia feels like. Every feature must support at least one of the five pillars below; a feature that supports none is cut.

| Pillar | What it means | Example | Test question for any feature |
| --- | --- | --- | --- |
| 1. "This is literally Cambodia" | Places, prices, food, language and customs are authentic, not names pasted onto a generic world | Grandma calls: "អូន មកលេងយាយអត់?" | Would a Cambodian player recognise this from real life? |
| 2. Every choice matters | Decisions change stats, relationships and future options | Punish a late student vs. talk privately | Does this choice have a visible consequence later? |
| 3. Life, not victory | No win state; success is defined by the player | Rich but lonely vs. modest but surrounded by family | Does this let the player define their own success? |
| 4. Family and community | Social bonds are as important as money | Supporting parents is a monthly expense and a source of happiness | Does this connect the player to other people? |
| 5. Readable, relaxed depth | Easy to start on a phone, deep over many hours | One in-game day in 5–8 minutes | Can a new player understand it in 30 seconds? |

### What this game is not

- Not a crime or violence game (no GTA-style gameplay).
- Not a dating sim; romance can exist later but is never the focus.
- Not a political commentary game; it portrays daily life without taking sides.
- Not a stereotype; Cambodia is shown as modern, varied and dignified.

## 4. Target Audience and Market

The primary audience is young Cambodian mobile players aged 15–30; the secondary audience is the Cambodian diaspora and international players curious about Southeast Asian life. Mobile-first is required because most Cambodian players game on Android phones.

### Player personas

| Persona | Profile | What they want | Design implication |
| --- | --- | --- | --- |
| Sokha, 19, student | University student in Phnom Penh, plays on a mid-range Android phone | Fun, relatable humour, content to share on Facebook and TikTok | Shareable moments, Khmer text, low device requirements |
| Dara, 27, office worker | Works in an office, plays during commute and breaks | Short sessions, sense of progress | Quick daily loop, auto-save, clear goals |
| Srey Pov, 34, diaspora | Khmer-American, grew up abroad | Connection to family roots and culture | English option, cultural notes, festivals |
| Alex, 25, international | Fan of The Sims and Stardew Valley | A new, authentic setting | Polished presentation, Steam release, English localisation |

### Comparable games

| Game | What we learn from it | How we differ |
| --- | --- | --- |
| The Sims series | Open-ended life simulation, needs and relationships | Grounded in one real country; careers are playable, not off-screen |
| BitLife | Simple choice-driven life sim that works on mobile | Visual world and real daily routine, not only text menus |
| Stardew Valley | Relaxing daily loop, community bonds, farming | Many careers, modern city and provinces |
| Papers, Please | Small choices with moral and financial pressure | Pressure comes from ordinary life, not authority |

### Market notes

- Strong local identity content tends to spread well on Cambodian social media; marketing should plan for this.
- Few, if any, commercial games are built around Cambodian daily life, so the concept has little direct competition.
- Open question: collect current data on Cambodian smartphone users, average device specs and spending on mobile games before finalising the business model.

## 5. Core Gameplay Loop

The game repeats one daily loop — wake, decide, work, earn, spend, connect, react, improve, sleep — and every decision in it changes what the next day offers. One loop takes 5–8 minutes of real time.

&#91;embedded content: core gameplay loop · 9 steps, repeats daily\]

Decide is highlighted because it is where the player's choices shape the rest of the loop; Sleep closes the day with a summary and auto-save.

### 5.1 Daily time structure

| In-game time | Phase | What the player does |
| --- | --- | --- |
| 06:00–07:00 | Morning | Breakfast, family, messages, travel to work |
| 07:00–17:00 | Work | Career mini-game shifts with event cards in between |
| 17:00–21:00 | Evening | Side jobs, relationships, shopping, study, hobbies |
| 21:00–23:00 | Night | Rest, phone, plan tomorrow |
| 23:00 | Sleep | Day summary, stat changes, auto-save |

### 5.2 Longer cycles

- **Weekly:** weekends are free days for family visits, travel between provinces and hobbies.
- **Monthly:** salary arrives, bills are paid, the budget screen shows the result.
- **Yearly:** seasons change, festivals return, the character ages and may be promoted.
- **Life:** milestones and life goals give long-term direction (section 10).

## 6. Core Systems

Five systems drive the whole game: character stats, choices and consequences, the economy, relationships and random events. All values below are starting proposals to be balanced during prototyping.

### 6.1 Character stats

| Stat | Range | Goes up when | Goes down when | Effect if too low |
| --- | --- | --- | --- | --- |
| Energy | 0–100 | Sleeping, eating, rest | Working, travelling, studying | Slower actions, mistakes at work |
| Health | 0–100 | Good food, exercise, doctor visits | Overwork, skipped meals, accidents | Sick days, medical costs |
| Happiness | 0–100 | Family time, hobbies, festivals, achievements | Debt, conflict, loneliness | Lower work performance |
| Stress | 0–100 | (bad) Deadlines, money worries, conflict | Rest, pagoda visit, coffee with friends | Burnout event above 90 |
| Money | USD | Salary, sales, side jobs | Rent, food, fuel, family support | Debt and borrowing events |
| Skills | Per skill, level 1–10 | Practice, courses, experience | Long inactivity (slow decay) | Blocks promotions |
| Reputation | Per community, 0–100 | Good work, helping others | Broken promises, rudeness | Fewer opportunities |

### 6.2 Choices and consequences

Every decision card shows 2–4 options. Each option changes stats immediately and may set a hidden flag that triggers a later event.

Example: a student keeps arriving late.

| Option | Immediate effect | Possible later effect |
| --- | --- | --- |
| A. Punish the student | Discipline +, student relationship −, stress − | Student avoids class; parents complain |
| B. Talk privately | Student relationship ++, costs 20 minutes | Discover the student works before school; new side story |
| C. Ignore it | No time cost | Other students start arriving late |
| D. Contact parents | Parent trust +, student relationship − | Parents become allies or become angry |

Rule: consequences should feel fair. The game always shows a short hint of what changed (for example, "Vibol trusts you more").

### 6.3 Economy

The economy uses simplified but realistic Cambodian prices in US dollars. Money is tight at the start so that spending choices feel meaningful.

Starting budget for a new teacher (monthly):

| Item | Amount (USD) |
| --- | --- |
| Salary | +250 |
| Rent | −80 |
| Food | −100 |
| Family support | −30 |
| Fuel | −20 |
| Electricity | −15 |
| Phone | −10 |
| **Balance** | **−5** |

The −5 balance is intentional: the player must find a solution in the first month (cook at home, tutor students in the evening, share a room, or reduce family support at a happiness cost).

Economy rules:

- Income sources: salary, overtime, side jobs (tutoring, delivery, online selling), business profit, crop sales.
- Money sinks: fixed bills, food, transport, repairs, health, family, festivals, weddings, education, savings goals.
- Savings and debt: bank savings, borrowing from family, microfinance loans with interest. Debt creates stress and must never become a dead end.
- All prices live in data tables so designers can rebalance without code changes.

### 6.4 Relationships

Each character the player knows has a relationship value from −100 to 100 and a memory of key events.

| Circle | Examples | Main benefits |
| --- | --- | --- |
| Family | Parents, grandparents, siblings | Happiness, emotional support, help in emergencies |
| Friends | School friends, neighbours | Stress relief, job tips, invitations |
| Work | Coworkers, boss, students, customers | Promotions, reputation, business growth |
| Community | Market sellers, village chief, monks | Discounts, local events, reputation |

Actions that build relationships: visiting, calling, giving gifts, helping, attending weddings and ceremonies, keeping promises. Relationships slowly decay if ignored.

Example: Grandma calls and asks, "អូន មកលេងយាយអត់?" Visiting costs time and fuel but gives the largest bond; calling is cheaper; saying you are busy saves time but lowers the bond.

### 6.5 Random events

Random events make each life unique. They are drawn from a weighted event table filtered by career, location, season and stats.

| Category | Example | Choice |
| --- | --- | --- |
| Money | Motorbike breaks down, repair $35 | Repair now, or save money and take a tuk-tuk |
| Health | Fever during rainy season | Go to the clinic, or rest at home |
| Family | Sibling needs school fees | Pay, partly pay, or refuse |
| Opportunity | Friend offers a weekend job | Accept (money +, energy −) or decline |
| Community | Neighbour's wedding invitation | Attend with a gift, or send money only |
| Weather | Flooded road in the rainy season | Take a longer route, or wait |

Balance rules: no more than one major negative event per in-game week, and bad luck is followed by a chance of good luck.

## 7. Careers and Life Paths

Each career is a separate gameplay module with its own mini-game, progression ladder and events. Launch ships with 4 careers; the rest arrive in updates. Salaries are balancing placeholders, not research figures.

### 7.1 Career overview

| Career | Release | Core work gameplay | Progression ladder | Start salary (USD/month) |
| --- | --- | --- | --- | --- |
| Teacher | Launch | Manage a class: attendance, lessons, discipline, grading, parent meetings | New teacher → Experienced → Senior teacher → Vice-director → School director | 250 |
| Software developer | Launch | Task board: pick tasks, solve logic puzzles, fix bugs before deadlines | Junior → Mid → Senior → Tech lead → Start own company | 400 |
| Farmer | Launch | Plant, water and harvest by season; sell at market at changing prices | Small plot → Buy equipment → Expand land → Hire workers → Agri-business | Variable (crop income) |
| Shop owner | Launch | Buy stock, set prices, serve customers, manage cash | Small stall → Shop → Second branch → Mini-mart chain | Variable (profit) |
| University student | Update 1 | Attend classes, exams, part-time jobs, choose a major | Year 1 → Graduate → Enter any career with bonuses | 0 (part-time income) |
| Delivery driver | Update 1 | Route-planning mini-game across the city, ratings | Driver → Top-rated driver → Own fleet | Per delivery |
| Doctor | Update 2 | Diagnose patients through symptom puzzles | Intern → Doctor → Specialist → Own clinic | Higher, after long study |
| Police officer | Update 2 | Patrol, help citizens, traffic duty (no violence focus) | Officer → Senior → Chief | Placeholder |
| Restaurant worker | Update 2 | Time-management cooking (bai sach chrouk, nom banh chok) | Helper → Cook → Head chef → Own restaurant | Placeholder |
| Office employee | Update 3 | Email triage, meetings, reports | Staff → Supervisor → Manager | Placeholder |
| Construction worker | Update 3 | Build-order puzzle, safety choices | Worker → Skilled worker → Foreman → Contractor | Placeholder |

### 7.2 Career design rules

- Every career must have a mini-game that takes 2–4 minutes per work shift and can be auto-played after it has been mastered.
- Every career has at least 30 unique events at launch.
- Players can change career at any time, but lose seniority and keep skills.
- Every career can lead to owning a business, so all paths can reach a late-game goal.

### 7.3 Example life paths

Four players start identically: age 22, $100, living in Phnom Penh. After 10 in-game years:

| Player | Path | Result after 10 years |
| --- | --- | --- |
| A | Studies coding → developer → saves → starts a software company | Wealthy, high stress, lives in the city |
| B | Works and supports family → moves to the province → opens a shop | Modest income, very strong family bonds |
| C | Becomes a teacher → helps students → becomes school director | Respected in the community, stable life |
| D | Becomes a farmer → expands the farm → builds a family house | Owns land and a new house, close to parents |

## 8. World and Setting

The world is a stylized, compact version of real Cambodian places, built as separate maps connected by a travel screen. Launch includes Phnom Penh and Kampong Cham; more provinces arrive in updates.

### 8.1 Locations

| Location | Release | Character | Key places | Careers best suited |
| --- | --- | --- | --- | --- |
| Phnom Penh | Launch | Busy capital: traffic, high costs, more jobs | Apartment, office tower, university, hospital, market, coffee shops, shopping mall, government offices, riverside | Developer, office, delivery, shop |
| Kampong Cham | Launch | Provincial town on the Mekong, slower life, lower costs | Family house, school, local market, rice fields, pagoda, bridge | Teacher, farmer, shop |
| Siem Reap | Update 1 | Tourism economy, temples | Pub Street area, guesthouses, Angkor-area villages | Shop, restaurant, tour guide |
| Battambang | Update 2 | Agriculture and arts | Rice farms, old town, art schools | Farmer, teacher |
| Kampot | Update 2 | Coast, pepper farms, river | Pepper farm, riverside, salt fields | Farmer, restaurant |
| Takeo, Kampong Thom | Update 3 | Rural provinces | Villages, fields, small markets | Farmer, teacher |

### 8.2 World rules

- **Day and night cycle:** 06:00 to 23:00 playable; sleeping skips the night.
- **Seasons:** dry season (Nov–Apr) and rainy season (May–Oct) change crops, travel time, events and illnesses.
- **Calendar:** real Cambodian calendar with festivals (see section 9).
- **Transport:** walking, bicycle, motorbike, tuk-tuk / ride-hailing, bus between provinces, and later a car. Each has cost, time and safety values.
- **Traffic:** busy hours (07:00–08:00, 17:00–18:00) slow travel in Phnom Penh.
- **Moving:** the player can move between provinces, which changes rent, job options and distance from family.

### 8.3 Living spaces

Homes progress from a shared rented room to an apartment, a borey house, and finally a self-built family house. Homes can be decorated with Cambodian furniture and items, which raise happiness.

## 9. Narrative and Cultural Content

The game has no fixed main story; narrative comes from short event scenes, character side stories and the yearly festival calendar. Writing is in Khmer first, then translated to English.

### 9.1 Narrative structure

- **Event scenes:** short dialogues (3–8 lines) with a choice at the end. Target: 500+ events at launch.
- **Side stories:** multi-part stories for important characters, for example a student who works before school, or a sibling who wants to study abroad.
- **Life milestones:** graduation, first salary, first motorbike, wedding, first child, building a house, retirement.
- **Life journal:** the game automatically records key moments, which the player can review and share as an image.

### 9.2 Festival calendar

| Festival | Timing | Gameplay |
| --- | --- | --- |
| Khmer New Year | Mid-April (3 days) | Travel home, traditional games, family bonus, spending spike |
| Visak Bochea | April or May (lunar) | Pagoda visit, calm and happiness bonus |
| Royal Ploughing Ceremony | May (lunar) | Farmers receive season predictions |
| Pchum Ben | September or October (15 days, lunar) | Visit pagodas, offerings for ancestors, family reunion |
| Water Festival (Bon Om Touk) | October or November (lunar) | Boat races in Phnom Penh, crowds, vendor opportunities |
| Chinese New Year | January or February | Family gatherings, business owners get a sales boost |
| Weddings and ceremonies | Year-round, mostly dry season | Invitations, gift-money choices, social reputation |

### 9.3 Cultural sensitivity guidelines

- Portray Cambodia as modern, diverse and dignified; avoid poverty stereotypes.
- Religious practices (Buddhism, pagodas, monks) are shown respectfully; monks are never comic or interactive targets for negative choices.
- Avoid real political parties, politicians and the Khmer Rouge era in gameplay.
- No real brands or company logos without a licence; use invented brands.
- Hire a Cambodian cultural consultant and a native Khmer editor to review all text and art.
- Include players from different provinces in playtests so the game does not represent only Phnom Penh.

## 10. Character Creation and Progression

The player creates one character, chooses a starting situation, and plays from age 18–23 to retirement at around 60. A full life takes about 30–50 hours of play.

### 10.1 Character creation

| Option | Choices | Effect |
| --- | --- | --- |
| Name | Free text (Khmer or Latin script) | Used in dialogue |
| Gender and appearance | Body, face, hair, skin tone, clothing | Visual only |
| Hometown | Phnom Penh or Kampong Cham at launch | Starting location, family nearby, costs |
| Family background | Farming family, shop family, office family, large family | Starting money, family obligations, starting skills |
| Education | High school, vocational, university graduate | Which careers open first |
| Starting career | Any unlocked career | First job |
| Personality trait (pick 2) | Hardworking, sociable, thrifty, creative, calm, ambitious | Small stat bonuses and unique dialogue |

Example starting character: Dara, 23, from Kampong Cham, university graduate, teacher, with $150 savings, a phone, a motorbike, family nearby and teaching materials.

### 10.2 Life stages

| Stage | Age | Focus |
| --- | --- | --- |
| Young adult | 18–25 | Study, first job, independence |
| Building | 26–35 | Career growth, marriage (optional), home |
| Established | 36–50 | Leadership, business, children's education |
| Later life | 51–60+ | Mentoring, family legacy, retirement |

### 10.3 Time scale

One in-game day takes 5–8 minutes. To keep long lives practical, weekdays can be fast-forwarded and the game time-skips between important life events ("Skip to next month" option after the first year).

### 10.4 Goals and endings

There is no single ending. The game offers optional life goals ("Build a house for my parents", "Become school director", "Save $10,000") and an end-of-life summary that scores the life on five dimensions: wealth, family, career, community and happiness. A "next generation" option lets the player continue as their child.

## 11. UI/UX Design

The interface is designed for one-handed portrait play on a phone, with every main action reachable in two taps. PC uses the same layout with mouse and keyboard shortcuts.

### 11.1 Main screens

| Screen | Purpose |
| --- | --- |
| Main menu | New life, continue, settings, language |
| Character creation | Step-by-step wizard (section 10.1) |
| World view | Character in the world; tap to move or interact |
| Decision card | 2–4 choices with icons showing likely effects |
| Phone menu | In-game smartphone: messages, bank app, job app, map, contacts, social feed |
| Work mini-game | Career-specific gameplay |
| Budget screen | Monthly income, expenses, savings, debt |
| Relationship screen | Family and friends with bond levels |
| Life journal | Milestones and shareable images |
| End-of-day summary | Money, stat changes, relationships, tomorrow's events |

### 11.2 HUD

Always visible: time and date, money, energy, happiness and stress bars, and a phone button. Notifications appear as phone messages, matching how people really receive news.

### 11.3 UX principles

- Every choice shows its time and money cost before the player commits.
- Icons plus text, never colour alone, for accessibility.
- Text size options and full Khmer Unicode support (correct rendering of subscripts and vowels is a technical requirement).
- Tutorial is the first in-game day, taught through Grandma and a friendly coworker, not pop-up walls of text.
- Auto-save at the end of every in-game day and when the app is closed.

## 12. Art and Audio Direction

The look is warm, bright and stylized low-poly 3D, which runs well on mid-range Android phones and keeps asset production affordable. Realism comes from details, not polygons.

### 12.1 Art direction

- **Style:** stylized low-poly 3D with soft lighting; characters slightly cartoon-proportioned for readability on small screens.
- **Colour palette:** warm golden morning light, saffron (monk robes, temple roofs), green rice fields, red-orange laterite earth, blue rainy-season skies.
- **Signature details:** motorbikes loaded with goods, tuk-tuks, street-food carts, sugar palm trees, Khmer script on shop signs, pagoda rooftops, plastic stools at coffee stalls.
- **Reference board:** to be created from photos taken in Phnom Penh and Kampong Cham by the art team.
- **Asset budget (launch):** 2 city maps, about 40 building types, 25 character base models with customisation, 15 vehicle models.

### 12.2 Audio direction

- **Music:** modern lo-fi and pop arrangements mixed with traditional instruments such as tro, roneat and skor. Different tracks for morning, work, evening and festivals.
- **Ambience:** motorbike traffic, market chatter, roosters at dawn, monsoon rain, pagoda chanting at a distance.
- **Voice:** short Khmer voice barks (greetings, reactions) rather than full voice acting, to control cost.
- **Licensing:** all music must be original or licensed; no unlicensed Cambodian pop songs.

## 13. Technical Specification

The game is built in Unity (LTS) with C#, using a data-driven architecture so that designers add careers, events and prices through data files instead of code. Target: run at 30 fps on a 3 GB RAM Android phone.

### 13.1 Technology stack

| Area | Choice | Reason |
| --- | --- | --- |
| Engine | Unity 6 LTS, Universal Render Pipeline | Strong mobile support, large talent pool, cross-platform |
| Language | C# | Unity standard |
| Data | ScriptableObjects plus JSON / spreadsheet import | Designers edit events, careers, prices without programmers |
| UI | Unity UI Toolkit or uGUI with TextMeshPro | TextMeshPro needs a Khmer font with correct shaping |
| Localisation | Unity Localization package | Khmer and English string tables |
| Save system | Local JSON save, encrypted; optional cloud save | Offline play is essential |
| Analytics | Unity Analytics or Firebase | Balance and retention data |
| Version control | Git with Git LFS, or Unity Version Control | Large binary assets |
| Build pipeline | Unity Cloud Build or GitHub Actions | Automatic Android, iOS and PC builds |

### 13.2 System architecture

&#91;embedded content: system architecture · 3 layers\]

The time and calendar manager drives every system each in-game hour; all careers, events, prices and dialogue are loaded from data, so designers can add content without programmers.

### 13.3 Performance targets

| Metric | Target |
| --- | --- |
| Minimum device | Android 9, 3 GB RAM |
| Frame rate | 30 fps (60 fps option on high-end devices) |
| Install size | Under 500 MB at launch |
| Load time | Under 10 seconds to world view |
| Offline | Fully playable without internet |

### 13.4 Technical risks to prototype first

1. Khmer text rendering in TextMeshPro (subscript consonants and vowel positioning).
2. Simulation of many NPC schedules on low-end phones.
3. Save-file compatibility across updates that add new careers and provinces.

## 14. Monetization and Business Model

Recommended model: free-to-play on mobile with a fair, cosmetic-and-expansion approach, plus a premium paid version on Steam. Nothing sold may let players buy in-game money or skip the life simulation, because that would break pillar 2 (every choice matters).

| Revenue stream | Platform | Description | Price idea (USD) |
| --- | --- | --- | --- |
| Career packs | Mobile and PC | New careers after launch (e.g. Doctor pack) | 1.99–2.99 each |
| Province packs | Mobile and PC | New regions (e.g. Siem Reap, Kampot) | 1.99–2.99 each |
| Cosmetics | Mobile | Traditional and modern clothing, home decoration, vehicle skins | 0.49–1.99 |
| Remove ads / supporter pack | Mobile | One-time purchase, removes ads and adds a cosmetic set | 2.99 |
| Optional rewarded ads | Mobile | Watch an ad for a small cosmetic or a daily bonus; never forced | — |
| Premium edition | Steam | Full game, no ads, includes launch careers | 9.99–14.99 |
| Partnerships | All | Tourism board, education NGOs or brands (in-game, clearly labelled) | Negotiated |

Prices should be adjusted for Cambodian purchasing power and tested with players; local payment options (for example ABA Pay or Wing through app stores or partners) should be investigated.

## 15. Scope, MVP and Roadmap

The biggest risk for a life sim is building too much. The plan is to prove the fun with one career in one town, then expand. Estimated time from start to launch: about 18 months with the team in section 16.

### 15.1 MVP (vertical slice) scope

In the MVP:

- One location: Kampong Cham (town, school, market, family house).
- One career: Teacher, with the full classroom mini-game.
- Core systems: stats, decision cards, monthly budget, family relationships, 50 random events.
- One in-game month of play (about 2–3 hours).
- Khmer and English text.

Not in the MVP: other careers, Phnom Penh, festivals beyond one, character customisation beyond basics, monetization, cloud save.

Success test for the MVP: 20 Cambodian playtesters play for one week; at least 60% say they want to keep playing and recognise their own lives in the game.

### 15.2 Production roadmap

&#91;embedded content: production roadmap · 5 phases, 4 gates\]

If a gate is not passed, the team fixes the problem inside that phase before moving on; Gate 2 is also the point to seek funding with a playable demo.

## 16. Team and Budget

A core team of about 10 people can deliver the launch version in roughly 18 months. The budget below is a rough planning estimate assuming a Cambodia-based team; it must be replaced with real salary quotes.

### 16.1 Team structure

| Role | Headcount | Main responsibilities | When needed |
| --- | --- | --- | --- |
| Game Director / Producer | 1 | Vision, schedule, budget, publishing | Whole project |
| Game Designer (systems) | 1 | Stats, economy, balancing, career mechanics | Whole project |
| Narrative Designer / Khmer writer | 1 | Events, dialogue, cultural accuracy | From month 2 |
| Unity Programmer | 3 | Gameplay, simulation, UI, save, tools | Whole project |
| 3D Artist | 2 | Environments, characters, vehicles | From month 2 |
| UI/UX Designer | 1 | Screens, HUD, icons, Khmer typography | From month 2 |
| Sound Designer / Composer | Contract | Music and sound effects | Months 6–16 |
| QA Tester | 1 | Testing, bug tracking, device testing | From month 9 |
| Cultural consultant | Part-time | Review content for accuracy and respect | Milestone reviews |

### 16.2 Budget estimate (approximate)

| Category | Estimate (USD) | Notes |
| --- | --- | --- |
| Salaries | 150,000–220,000 | About 10 people for 18 months at local rates |
| Software and tools | 10,000–20,000 | Unity licences if required, art tools, cloud build |
| Audio and music | 8,000–15,000 | Contract composer and voice barks |
| Devices for testing | 3,000–5,000 | Low-, mid- and high-end Android, one iPhone |
| Marketing and launch | 20,000–40,000 | Trailer, social media, influencers, events |
| Contingency (15%) | 30,000–45,000 | For delays and scope changes |
| **Total** | **About 220,000–345,000** |  |

Funding options to explore: self-funding plus a smaller MVP team, local investors, publisher deals, government or NGO grants for cultural and educational content, and crowdfunding after the vertical slice.

## 17. Risks and Mitigations

The two highest risks are scope creep and the game becoming repetitive after a few in-game weeks; both are addressed by the MVP-first plan and a large, data-driven event library.

| Risk | Likelihood | Impact | Mitigation |
| --- | --- | --- | --- |
| Scope creep (too many careers and places) | High | High | Strict MVP; every feature must pass the pillar test; 4 careers at launch only |
| Gameplay becomes repetitive | High | High | 500+ events, career promotions that change gameplay, seasons, festivals, time-skip |
| Khmer text renders incorrectly | Medium | High | Prototype font rendering in week 1; native Khmer QA |
| Cultural misrepresentation or offence | Medium | High | Cultural consultant, diverse playtesters, sensitivity guidelines (9.3) |
| Poor performance on low-end phones | Medium | High | Low-poly art, performance budgets, test on cheap devices monthly |
| Low willingness to pay in the local market | Medium | Medium | Free-to-play with fair purchases; Steam premium for international revenue |
| Funding runs out before launch | Medium | High | Vertical slice first, then seek investors or publishers with a playable demo |
| Economy feels unrealistic or unfair | Medium | Medium | Price research, data tables, playtest balancing, no dead-end debt |
| Team lacks life-sim experience | Medium | Medium | Study The Sims and BitLife, short prototypes, external design review |

## 18. Success Metrics and Playtesting

Success is measured by retention and recognition: players should come back daily and say the game reflects their lives. Targets below are initial goals to be refined after soft launch.

### 18.1 KPIs

| Metric | Target | Measured from |
| --- | --- | --- |
| Day-1 retention | 40% or more | Soft launch |
| Day-7 retention | 15% or more | Soft launch |
| Day-30 retention | 6% or more | Soft launch |
| Average session length | 12 minutes or more | Launch |
| Store rating | 4.3 or higher | Launch |
| "This feels like Cambodia" survey score | 80% agree | Every playtest |
| Crash-free sessions | 99.5% or more | Alpha onward |
| Downloads in first 3 months | Set after soft-launch data | Launch |

### 18.2 Playtesting plan

1. **Paper prototype (month 1):** test decision cards and the budget with 10 people using printed cards.
2. **Prototype test (month 3):** one in-game day as a teacher; observe where players get confused.
3. **Vertical slice test (month 6):** 20 players for one week; survey on fun and recognition.
4. **Closed alpha (month 10):** 100 players across provinces; analytics on economy balance.
5. **Open beta / soft launch (month 15):** Cambodia-only Google Play release to measure retention before global launch.

## 19. Appendix

### 19.1 Title options

Recommended: **ជីវិតខ្ញុំ — My Life**, because the game is about the player's own life, not a fixed hero's.

Alternatives: My Cambodia · Life KH · Khmer Life · My Khmer Life · ជីវិតខ្មែរ · Life in KH · Cambodia Life Simulator · KH: Life · My Life Cambodia. Check trademark and app-store availability before choosing.

### 19.2 Glossary

| Term | Meaning |
| --- | --- |
| GDD | Game Design Document — this document |
| MVP / vertical slice | Smallest playable version that proves the game is fun |
| Core loop | The repeated cycle of actions the player performs |
| Decision card | The UI showing a situation and 2–4 choices |
| Event table | Data list of all random events with conditions and weights |
| Soft launch | Limited release in one country to test before global launch |
| Retention (D1/D7/D30) | Share of players who return 1, 7 or 30 days after install |

### 19.3 Open questions

- [ ] Final camera: isometric or third-person?
- [ ] Free-to-play or premium on mobile?
- [ ] Which 4 careers at launch — is Shop owner or Delivery driver the better fourth?
- [ ] Should romance and marriage be in the launch version or an update?
- [ ] Collect real price data (rent, food, salaries) for Phnom Penh and Kampong Cham.
- [ ] Confirm funding route and team size.
