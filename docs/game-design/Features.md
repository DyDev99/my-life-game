ជីវិតខ្ញុំ — My Life
Unity Game Functions & Features Specification

Document Version: 0.1
Engine: Unity 6 LTS
Language: C#
Genre: Life Simulation / Career Simulation
Platforms: Android, iOS, PC
Languages: Khmer / English

1. Core Game Features
ID	Feature	Priority	Description
GF-001	New Life	P0	Create and start a new character life
GF-002	Continue Life	P0	Continue an existing saved life
GF-003	Character Creation	P0	Create name, appearance, hometown, education, career and personality
GF-004	Life Simulation	P0	Simulate the player's daily life
GF-005	Time System	P0	Manage hours, days, weeks, months and years
GF-006	Calendar	P0	Manage Cambodian calendar, seasons and festivals
GF-007	Decision System	P0	Present choices that affect the player's future
GF-008	Event System	P0	Generate random and conditional life events
GF-009	Career System	P0	Manage jobs, careers, promotions and career changes
GF-010	Economy System	P0	Income, expenses, savings and debt
GF-011	Relationship System	P0	Family, friends, coworkers and community relationships
GF-012	Life Progression	P0	Age, skills, reputation, achievements and life stages
GF-013	Save/Load	P0	Save and restore the player's life
GF-014	Localization	P0	Khmer and English
GF-015	Life Journal	P1	Record important life events
GF-016	Life Goals	P1	Optional goals chosen by the player
GF-017	Transportation	P1	Motorbike, bicycle, tuk-tuk, bus and other transport
GF-018	Housing	P1	Rent, upgrade and customize homes
GF-019	Festivals	P1	Cambodian cultural festivals and activities
GF-020	Next Generation	P2	Continue the simulation through the player's child
2. Daily Gameplay System

The main gameplay loop is:

Wake → Decide → Travel → Work → Earn → Spend → Socialize → React → Improve → Sleep

This is the central gameplay loop defined in the GDD. One in-game day should take approximately 5–8 minutes.

Functions
StartDay()
GetCurrentTime()
AdvanceTime()
PerformActivity()
CalculateActivityCost()
UpdatePlayerStats()
TriggerEvents()
EndDay()
GenerateDaySummary()
AutoSaveGame()
Daily phases
06:00 - 07:00  Morning
07:00 - 17:00  Work
17:00 - 21:00  Evening
21:00 - 23:00  Night
23:00          Sleep
3. Character System
Character Creation

The player can configure:

Name
Gender
Appearance
Hair
Skin tone
Clothing
Hometown
Family background
Education
Starting career
Personality traits

The GDD specifies starting situations between ages 18–23 and progression toward retirement around 60+.

Unity functions
CreateCharacter()
UpdateCharacter()
SetCharacterName()
SetAppearance()
SetHometown()
SetEducation()
SetCareer()
SetPersonality()
SaveCharacter()
LoadCharacter()
4. Player Stat System

The player has the following major statistics:

Energy
Health
Happiness
Stress
Money
Skills
Reputation

These values directly affect gameplay and future events.

Example
Work
 ↓
Energy -15
Stress +8
Money +$20
Skill +1
Functions
GetStat()
SetStat()
IncreaseStat()
DecreaseStat()
ClampStat()
CheckCriticalStat()
ApplyStatEffect()
5. Time & Calendar System
Features
In-game clock
Day/night cycle
Week system
Month system
Year system
Age progression
Seasons
Cambodian festivals
Workdays
Weekends
Time skipping
Functions
GetCurrentHour()
GetCurrentDay()
GetCurrentMonth()
GetCurrentYear()
AdvanceHour()
AdvanceDay()
AdvanceMonth()
AdvanceYear()
ChangeSeason()
CheckFestival()
SkipTime()
6. Career System

Each career should behave as an independent gameplay module rather than simply giving the player a salary.

Launch Careers
Teacher
Attendance
Teaching
Discipline
Grading
Parent meetings
Student relationships
Software Developer
Task board
Coding challenges
Bug fixing
Deadlines
Skill progression
Team events
Farmer
Plant
Water
Maintain
Harvest
Sell crops
Buy equipment
Expand farm
Shop Owner
Buy stock
Set prices
Serve customers
Manage cash
Manage inventory
Expand shop

The current GDD also identifies future careers such as university student, delivery driver, doctor, police officer, restaurant worker, office employee and construction worker.

7. Career Progression

Every career has:

Entry Level
   ↓
Experienced
   ↓
Senior
   ↓
Leadership
   ↓
Business Owner
Functions
StartCareer()
ChangeCareer()
GetCareerLevel()
GainExperience()
IncreaseSkill()
CheckPromotion()
PromotePlayer()
CalculateSalary()
StartBusiness()

Changing careers keeps skills but can reduce seniority, according to the current design.

8. Decision & Choice System

This should be one of the most important systems in the game.

Every decision can have:

Immediate Effect
+
Hidden Consequence
+
Future Event
+
Relationship Change
+
Stat Change

Example:

Student arrives late.

[ Punish ]
[ Talk privately ]
[ Ignore ]
[ Contact parents ]

The system should remember the player's decision and potentially trigger a future event.

Unity functions
ShowDecision()
GetDecisionOptions()
SelectDecision()
ApplyDecisionEffect()
CreateDecisionMemory()
SetEventFlag()
TriggerFutureConsequence()
9. Random Event System

Events are generated according to:

Career
Location
Season
Time
Player Stats
Relationships
Previous Decisions

Examples include:

Motorbike breakdown
Illness
Family needing money
Job opportunity
Wedding invitation
Flooded road
Unexpected income
Workplace problem
Family conflict
Community event

The GDD proposes 500+ events at launch.

Event architecture
EventDatabase
      ↓
EventConditions
      ↓
EventSelector
      ↓
EventManager
      ↓
DecisionUI
      ↓
EffectProcessor
      ↓
FutureEventMemory
10. Economy System
Income
Salary
Overtime
Side jobs
Business profit
Crop sales
Delivery income
Expenses
Rent
Food
Fuel
Electricity
Phone
Healthcare
Family support
Education
Repairs
Festivals
Weddings
Transport

The GDD intentionally starts players with financial pressure so that money decisions matter.

Functions
AddMoney()
SpendMoney()
CalculateSalary()
PayBills()
AddExpense()
AddIncome()
TransferMoney()
CreateDebt()
RepayDebt()
CalculateInterest()
SaveMoney()
11. Banking System

The player's phone can contain a simplified banking system.

Features
Balance
Income
Expenses
Savings
Transfers
Borrowing
Loan repayment
Interest
Financial history

Possible future feature:

Bank Account
Savings Account
Loan Account
Emergency Fund
12. Relationship System

Relationship score:

-100 ← Neutral → +100
Relationship groups
Family
Father
Mother
Grandparents
Siblings
Children
Friends
School friends
Neighbours
Personal friends
Work
Boss
Coworkers
Students
Customers
Community
Market sellers
Village chief
Monks
Local people

These relationship groups and their gameplay benefits are defined in the GDD.

Functions
GetRelationship()
IncreaseRelationship()
DecreaseRelationship()
VisitCharacter()
CallCharacter()
GiveGift()
HelpCharacter()
AttendEvent()
CreateRelationshipMemory()
DecayRelationships()
13. Phone System

The player's smartphone becomes an important game interface.

Phone Apps
📱 Phone
 ├── Messages
 ├── Contacts
 ├── Bank
 ├── Job
 ├── Map
 ├── Calendar
 ├── Social Feed
 └── Notifications

This is already defined as one of the major game screens in the GDD.

14. World & Map System
Launch locations
Phnom Penh
Apartment
Office
University
Hospital
Market
Coffee shop
Mall
Government offices
Riverside
Kampong Cham
Family house
School
Market
Rice fields
Pagoda
Bridge

The current launch world is intentionally compact, with additional provinces planned for updates.

15. Transportation System

Transport options:

Walking
Bicycle
Motorbike
Tuk-tuk
Ride-hailing
Bus
Car

Each transport type can have:

Cost
Speed
Energy
Safety
Availability
Example
Motorbike
Cost: Low
Speed: High
Energy: Low
Safety: Medium
16. Housing System

Player housing progresses:

Shared Room
     ↓
Apartment
     ↓
Borey House
     ↓
Family House

Features:

Rent
Buy
Upgrade
Furniture
Decoration
Utilities
Maintenance
Location

Homes can also affect happiness.

17. Festival System

Cambodian festivals become gameplay events.

Launch/Planned
Khmer New Year
Visak Bochea
Royal Ploughing Ceremony
Pchum Ben
Water Festival
Chinese New Year
Weddings
Family ceremonies

Festival effects can include:

Travel
Family Bond
Money Spending
Happiness
Business Sales
Special Events

18. Life Milestone System

Important milestones should automatically be recorded.

Examples:

First Job
First Salary
First Motorbike
Graduation
Promotion
First Business
Marriage
First Child
First House
Career Achievement
Retirement

The GDD specifically defines these as life milestones.

19. Life Goal System

Players can choose personal goals.

Examples:

☐ Build a house for my parents
☐ Become school director
☐ Save $10,000
☐ Own a business
☐ Buy land
☐ Help my family
☐ Become highly respected

There is no single winning condition. The player's life is evaluated across wealth, family, career, community and happiness.

20. Life Journal

The game automatically records important moments.

Journal
2027
 ├── First Job
 ├── First Salary
 ├── Grandma's Wedding
 ├── Bought Motorbike
 └── Promotion

Features:

Timeline
Important events
Photos/screenshots
Life statistics
Achievements
Shareable life summary
21. Achievement System

Possible achievements:

🏆 First Salary
🏆 Family Hero
🏆 First Business
🏆 Millionaire
🏆 Master Teacher
🏆 Successful Developer
🏆 Farmer's Dream
🏆 Community Leader
🏆 Built Parents' House
🏆 10 Years in One Career
22. Save System

The game needs reliable offline saving.

Save data
Player
Character
Stats
Money
Career
Skills
Relationships
Inventory
Housing
Vehicles
World
Events
Decisions
Journal
Achievements
Calendar
Settings

The current technical design specifies local encrypted JSON saves, with optional cloud save later.

23. Localization System

Launch languages:

🇰🇭 Khmer
🇬🇧 English

Requirements:

Khmer Unicode
Proper Khmer vowel/subscript rendering
Font fallback
Dynamic text
Date/time localization
Currency formatting
UI translation
Dialogue translation

Khmer text rendering is explicitly identified as an early technical risk, so this should be prototyped very early.

24. UI Screens

Professional screen architecture:

Main Menu
│
├── New Life
│   └── Character Creation
│
├── Continue
│
├── World
│   ├── Player
│   ├── Locations
│   ├── NPCs
│   └── Interactions
│
├── Phone
│   ├── Messages
│   ├── Bank
│   ├── Job
│   ├── Contacts
│   ├── Map
│   ├── Calendar
│   └── Social
│
├── Career
│   └── Work Mini-game
│
├── Budget
│
├── Relationships
│
├── Life Journal
│
├── Goals
│
└── End-of-Day Summary
25. NPC System

Each important NPC should have:

NPC Identity
Name
Age
Occupation
Location
Schedule
Relationship
Personality
Memory
Dialogue
Events

NPCs should have daily schedules so the world feels alive.

Example:

Grandma
06:00 → Home
08:00 → Market
11:00 → Home
15:00 → Pagoda
18:00 → Home
26. Dialogue System

Dialogue supports:

Normal conversations
Decision conversations
Family conversations
Career conversations
Event conversations
Festival conversations
Relationship conversations
Data-driven dialogue
Dialogue ID
Character
Conditions
Dialogue
Choices
Effects
Next Dialogue

This fits the GDD's data-driven approach, where events, careers, prices and dialogue should be editable without requiring programmers.

27. Inventory System

Useful for:

Food
Gifts
Clothing
Career items
Farming items
Shop inventory
Household items
Vehicle-related items

Example:

Inventory
 ├── Food
 ├── Gifts
 ├── Tools
 ├── Clothing
 ├── Career Items
 └── Home Items
28. Notification System

Notifications should appear naturally through the player's phone.

Examples:

📱 Grandma:
"អូន មកលេងយាយអត់?"

📱 Boss:
"Please come to the office at 8:00."

📱 Bank:
"Salary received: $400"

📱 Friend:
"Do you want to join us this weekend?"
29. Audio System
Music
Morning
Work
Evening
Night
Festival
Ambient sounds
Motorbikes
Markets
Roosters
Rain
Traffic
Pagoda ambience
Shops
Street food

The GDD specifically calls for modern music mixed with Cambodian traditional instruments and authentic environmental ambience.

30. Technical Unity Systems

For a professional Unity implementation, I recommend separating the game into these systems:

GameManager
├── TimeManager
├── CalendarManager
├── SaveManager
├── EventManager
├── DecisionManager
├── EconomyManager
├── RelationshipManager
├── CareerManager
├── CharacterManager
├── WorldManager
├── NPCManager
├── InventoryManager
├── TransportationManager
├── HousingManager
├── FestivalManager
├── AchievementManager
├── JournalManager
├── AudioManager
├── LocalizationManager
└── UIManager
31. Data-Driven Architecture

Instead of hard-coding everything:

Unity
   ↓
Game Systems
   ↓
Data Models
   ↓
ScriptableObjects / JSON
   ↓
Game Content

For example:

CareerData
EventData
DecisionData
CharacterData
ItemData
VehicleData
BuildingData
DialogueData
FestivalData
PriceData
AchievementData

This is especially important because your GDD targets 500+ events, multiple careers and multiple provinces.

32. Recommended Unity Project Structure
Assets/
│
├── _Game/
│   ├── Core/
│   │   ├── GameManager
│   │   ├── Time
│   │   ├── Save
│   │   └── Events
│   │
│   ├── Gameplay/
│   │   ├── Character
│   │   ├── Career
│   │   ├── Economy
│   │   ├── Relationship
│   │   ├── Housing
│   │   ├── Transportation
│   │   └── Inventory
│   │
│   ├── World/
│   │   ├── PhnomPenh
│   │   ├── KampongCham
│   │   ├── NPC
│   │   └── Locations
│   │
│   ├── UI/
│   │   ├── MainMenu
│   │   ├── HUD
│   │   ├── Phone
│   │   ├── Career
│   │   ├── Budget
│   │   └── Journal
│   │
│   ├── Data/
│   │   ├── Careers
│   │   ├── Events
│   │   ├── Characters
│   │   ├── Items
│   │   └── Dialogue
│   │
│   ├── Audio/
│   ├── Art/
│   └── Localization/
│
├── Scenes/
├── Resources/
├── Addressables/
└── Tests/
33. MVP Feature Scope

Do not build everything above immediately.

The current GDD already defines a much smaller vertical slice:

MVP
Location
└── Kampong Cham

Career
└── Teacher

Core Systems
├── Character
├── Time
├── Stats
├── Decision Cards
├── Economy
├── Family Relationships
├── Random Events
├── Save/Load
└── Khmer + English

Content
└── 50 Random Events

Duration
└── 1 In-game Month

This is the correct starting point because the GDD explicitly recommends proving the game with one career + one town before expanding.

Recommended Development Order
PHASE 01
Game Foundation
        ↓
PHASE 02
Time + Character + Stats
        ↓
PHASE 03
Economy + Relationships
        ↓
PHASE 04
Decision + Event System
        ↓
PHASE 05
Teacher Career Mini-game
        ↓
PHASE 06
Kampong Cham World
        ↓
PHASE 07
UI + Phone
        ↓
PHASE 08
Save/Load + Localization
        ↓
PHASE 09
Polish + Optimization
        ↓
PHASE 10
MVP Playtest

This gives you a real Unity production feature map, while keeping the MVP controlled rather than trying to implement the entire 18-month game at once. The original GDD estimates roughly 18 months for the full launch version with a ~10-person team.

move them all to readme file for me 

Yes. I can convert the complete Unity Game Functions & Features Specification into a professional README.md, while keeping the existing GDD as the source of truth and organizing the README for the Unity development repository.

I’ll include:

Game overview
Core gameplay loop
Complete feature list
Gameplay systems
Career systems
Character/stat systems
Economy
Relationships
Events & decisions
World/map
NPC/dialogue
Phone system
Housing/transportation
Festivals
Journal/achievements
Save system
Localization
Audio
Unity architecture
Project structure
Data-driven architecture
MVP scope
Development phases
Technical requirements
Future features

I'll make it suitable for a professional Unity GitHub repository, not just copy the previous response verbatim.