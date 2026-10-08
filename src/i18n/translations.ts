// Bilingual Dictionary for ជីវិតខ្ញុំ (My Life)
// Khmer (ភាសាខ្មែរ) + English

export type Language = "en" | "km";

export const translations = {
  en: {
    // Game Title & Brand
    gameTitle: "My Life",
    gameTitleKm: "ជីវិតខ្ញុំ",
    tagline: "A modern Cambodian life simulation",
    subtitle: "Build an ordinary life through work, family, money, and heartfelt choices.",

    // Main Menu
    newLife: "New Life",
    continueLife: "Continue Life",
    settings: "Settings",
    language: "Language",
    sound: "Sound FX",
    on: "On",
    off: "Off",
    credits: "Credits",
    cambodianSetting: "Kampong Cham Province, Cambodia",

    // Character Creation
    characterSetupTitle: "Create Your Character",
    characterSetupSub: "Choose who you want to be in modern Cambodia",
    characterNameLabel: "Name",
    defaultName: "Dara",
    age: "Age",
    hometown: "Hometown",
    career: "Career",
    education: "Education",
    personality: "Personality Traits (Pick 2)",
    startAdventure: "Begin Life in Kampong Cham",

    // Careers
    careerTeacher: "Teacher",
    careerTeacherDesc: "Inspire rural & provincial students with patience and care.",
    careerDeveloper: "Software Developer",
    careerDeveloperDesc: "Build apps & web services for modern Cambodia.",
    careerFarmer: "Farmer",
    careerFarmerDesc: "Grow golden rice crops and sustain the green countryside.",
    careerShopOwner: "Shop Owner",
    careerShopOwnerDesc: "Manage a vibrant community market stall and friendly customer bonds.",
    careerKickboxer: "Kun Khmer Fighter",
    careerKickboxerDesc: "Train in martial arts, compete in the stadium, and represent national pride.",

    // Personality Traits
    traitHardworking: "Hardworking",
    traitFriendly: "Friendly",
    traitCreative: "Creative",
    traitAmbitious: "Ambitious",
    traitCalm: "Calm",
    traitSocial: "Sociable",

    // HUD & Stats
    day: "Day",
    money: "Money",
    energy: "Energy",
    health: "Health",
    happiness: "Happiness",
    stress: "Stress",
    skill: "Skill",
    reputation: "Reputation",
    phone: "Phone",
    inventory: "Inventory",
    chooseDay: "Choose Your Day",
    exploreTown: "Tap Places in Town",

    // Locations
    locHome: "Player Home (Stilt House)",
    locSchool: "Kampong Cham School",
    locMarket: "Local Market",
    locCafe: "Riverside Coffee Cart",
    locPagoda: "Wat / Pagoda Landmark",
    locRiceField: "Rice Paddies",
    locHomeDesc: "A traditional wooden stilt house with a hammock underneath.",
    locSchoolDesc: "Provincial public school where students eagerly await lessons.",
    locMarketDesc: "Fresh tropical fruit stalls, bustling conversation, and warm greetings.",
    locCafeDesc: "Plastic red stools, sweet iced milk coffee, and river breezes.",
    locPagodaDesc: "Golden tiered roofs, quiet contemplation, and spiritual tranquility.",

    // Decision Screen
    morningGreeting: "Good Morning, {name} ☀️",
    decisionPrompt: "What would you like to focus on today?",
    actWorkTitle: "Go to Work at School",
    actWorkDesc: "Teach your energetic students. +$12, +Skill, -Energy",
    actFamilyTitle: "Visit Family & Grandma",
    actFamilyDesc: "Spend quality time with grandma. +Happiness, +Bond",
    actRestTitle: "Stay Home & Rest",
    actRestDesc: "Lounge in the cool shade in your hammock. +Energy, -Stress",
    actHobbyTitle: "Riverside Iced Coffee & Music",
    actHobbyDesc: "Relax by the Mekong with coffee and song. +Happiness, -$3",
    actMarketTitle: "Stroll Through Market",
    actMarketDesc: "Browse local snacks, produce, and chat with neighbors.",

    // Work Mini-Game (Teacher)
    teacherTitle: "Teacher's Classroom",
    teacherSubtitle: "Kampong Cham Primary & Middle School",
    step1Title: "1. Prepare Lesson Plan",
    step1Prompt: "How do you want to conduct class today?",
    planInteractive: "Interactive Storytelling (Engaging & fun)",
    planDrill: "Structured Textbook Drills (Strict & formal)",
    step2Title: "2. Classroom Moment",
    dilemmaPrompt: "Vibol, a quiet student from the lotus farm, arrived 20 minutes late with muddy sandals.",
    choiceTalkPrivate: "Speak kindly in private after class (+Empathy)",
    choiceScold: "Scold him publicly for breaking rules (-Stress, -Trust)",
    choiceIgnore: "Ignore and continue lecturing (+Save Time)",
    step3Title: "3. Class Reaction",
    reactionSuccess: "The students laughed and cheered at your storytelling! Vibol felt understood and smiled warmly.",
    workCompleteBtn: "Finish School Day & Collect Wage",

    // Relationships
    relationshipsTitle: "Relationships",
    grandmaName: "Grandma (យាយ)",
    grandmaRole: "Family Matriarch",
    grandmaQuote: "“Dara, have you eaten rice yet? Don't forget to visit your grandma when you have free time.”",
    motherName: "Mother (ម៉ាក់)",
    motherRole: "Mother",
    motherQuote: "“Work hard and take care of your health, son.”",
    vibolName: "Vibol (វិបុល)",
    vibolRole: "Student",
    vibolQuote: "“Teacher Dara, today's lesson was so fun! Thank you!”",
    kolabName: "Kolab (កុលាប)",
    kolabRole: "Fellow Teacher",
    kolabQuote: "“Let's share iced coffee during the afternoon break.”",
    callBtn: "Call (Phone)",
    visitBtn: "Visit in Person",
    sendGiftBtn: "Send Sweet Fruits ($4)",

    // Phone Apps
    phoneTitle: "SmartPhone",
    appWork: "Career",
    appFamily: "Family",
    appCommunity: "Community",
    appHobby: "Hobbies",
    appBudget: "Budget",
    appJournal: "Journal",
    appStatus: "Status",
    appInventory: "Inventory",

    // Budget
    budgetTitle: "Monthly Finances",
    monthlySalary: "Monthly Base Salary",
    rentExpense: "Room / House Maintenance",
    foodExpense: "Daily Food & Market",
    familyRemittance: "Remittance to Parents",
    fuelExpense: "Motorbike Fuel",
    netSavings: "Estimated Monthly Balance",

    // Life Journal
    journalTitle: "Life Journal",
    journalSub: "Memories & milestones of your life in Cambodia",
    emptyJournal: "Your journey has just begun...",

    // End of Day Summary
    goodNight: "Good Night, {name} 🌙",
    dayComplete: "Day {day} Complete",
    summaryMoney: "Earnings & Expenses",
    summaryEnergy: "Energy Used",
    summaryHappiness: "Happiness Gained",
    summarySkill: "Teaching Skill",
    summaryNote: "You worked sincerely and lived an honest, fulfilling day in Kampong Cham. Tomorrow brings fresh sunshine over the Mekong.",
    nextDayBtn: "Continue to Tomorrow ☀️",

    // Notifications & Feedback
    earnedMoney: "+${val} Cash",
    lostEnergy: "-{val} Energy",
    gainedHappiness: "+{val} Happiness",
    reducedStress: "-{val} Stress",
    gainedSkill: "+{val} Skill",
  },

  km: {
    // Game Title & Brand
    gameTitle: "ជីវិតខ្ញុំ",
    gameTitleKm: "ជីវិតខ្ញុំ",
    tagline: "ហ្គេមក្លែងធ្វើជីវិតខ្មែរទំនើប",
    subtitle: "កសាងជីវិតធម្មតាដ៏ស្រស់បំព្រងតាមរយៈការងារ គ្រួសារ លុយកាក់ និងជម្រើសជីវិតពិតៗ។",

    // Main Menu
    newLife: "ចាប់ផ្តើមជីវិតថ្មី",
    continueLife: "បន្តជីវិត",
    settings: "ការកំណត់",
    language: "ភាសា",
    sound: "សំឡេង",
    on: "បើក",
    off: "បិទ",
    credits: "ព័ត៌មាន",
    cambodianSetting: "ខេត្តកំពង់ចាម ប្រទេសកម្ពុជា",

    // Character Creation
    characterSetupTitle: "បង្កើតតួអង្គរបស់អ្នក",
    characterSetupSub: "ជ្រើសរើសអត្តសញ្ញាណ និងអនាគតរបស់អ្នក",
    characterNameLabel: "ឈ្មោះ",
    defaultName: "ដារ៉ា",
    age: "អាយុ",
    hometown: "ស្រុកកំណើត",
    career: "អាជីព",
    education: "ការអប់រំ",
    personality: "ចរិតលក្ខណៈ (ជ្រើសរើស ២)",
    startAdventure: "ចាប់ផ្តើមជីវិតនៅកំពង់ចាម",

    // Careers
    careerTeacher: "គ្រូបង្រៀន",
    careerTeacherDesc: "បង្រៀនសិស្សានុសិស្សនៅសាលាខេត្តដោយក្តីស្រឡាញ់ និងការយកចិត្តទុកដាក់។",
    careerDeveloper: "អ្នកសរសេរកូដ",
    careerDeveloperDesc: "បង្កើតកម្មវិធី និងគេហទំព័រសម្រាប់សង្គមឌីជីថលកម្ពុជា។",
    careerFarmer: "កសិករ",
    careerFarmerDesc: "ធ្វើស្រែចម្ការប្រកបដោយមោទនភាព និងស្រូបយកខ្យល់អាកាសបរិសុទ្ធ។",
    careerShopOwner: "ម្ចាស់តូបលក់ដូរ",
    careerShopOwnerDesc: "គ្រប់គ្រងមុខរបរលក់ដូរនៅផ្សារ និងរាប់អានអ្នកភូមិជិតខាង។",
    careerKickboxer: "កីឡាករគុនខ្មែរ",
    careerKickboxerDesc: "ហ្វឹកហាត់ក្បាច់គុនបុរាណ ប្រកួតលើសង្វៀន និងលើកស្ទួយកិត្តិយសកីឡាជាតិ។",

    // Personality Traits
    traitHardworking: "ឧស្សាហ៍ព្យាយាម",
    traitFriendly: "រួសរាយរាក់ទាក់",
    traitCreative: "មានគំនិតច្នៃប្រឌិត",
    traitAmbitious: "មានមហិច្ឆតា",
    traitCalm: "សុភាពរាបសារ",
    traitSocial: "ចូលចិត្តសង្គម",

    // HUD & Stats
    day: "ថ្ងៃទី",
    money: "លុយកាក់",
    energy: "ថាមពល",
    health: "សុខភាព",
    happiness: "សេចក្តីសុខ",
    stress: "ភាពតានតឹង",
    skill: "ជំនាញ",
    reputation: "កេរ្តិ៍ឈ្មោះ",
    phone: "ទូរស័ព្ទ",
    inventory: "កាតាប",
    chooseDay: "ជ្រើសរើសសកម្មភាព",
    exploreTown: "ចុចលើទីតាំងក្នុងក្រុង",

    // Locations
    locHome: "ផ្ទះឈើអ្នកលេង",
    locSchool: "សាលារៀនកំពង់ចាម",
    locMarket: "ផ្សារកំពង់ចាម",
    locCafe: "តូបកាហ្វេមាត់ទន្លេ",
    locPagoda: "វត្តអារាម",
    locRiceField: "វាលស្រែបៃតង",
    locHomeDesc: "ផ្ទះឈើបុរាណបែបខ្មែរ មានអង្រឹងយោលក្រោមផ្ទះត្រជាក់ស្រួល។",
    locSchoolDesc: "សាលារៀនរដ្ឋក្នុងខេត្ត ដែលសិស្សកំពុងរង់ចាំលោកគ្រូ។",
    locMarketDesc: "តូបផ្លែឈើស្រស់ៗ និងការសន្ទនារាក់ទាក់របស់អ្នកស្រុក។",
    locCafeDesc: "កៅអីជ័រក្រហម កាហ្វេទឹកដោះគោទឹកកក និងខ្យល់ទន្លេមេគង្គ។",
    locPagodaDesc: "ដំបូលក្បឿងពណ៌លឿងទុំ ភាពស្ងប់ស្ងាត់ និងសេចក្តីស្ងប់ក្នុងចិត្ត។",

    // Decision Screen
    morningGreeting: "អរុណសួស្តី {name} ☀️",
    decisionPrompt: "តើថ្ងៃនេះអ្នកចង់ធ្វើអ្វីដែរ?",
    actWorkTitle: "ទៅបង្រៀននៅសាលា",
    actWorkDesc: "បង្រៀនសិស្សានុសិស្ស +$12, +ជំនាញ, -ថាមពល",
    actFamilyTitle: "ទៅលេងយាយ និងគ្រួសារ",
    actFamilyDesc: "ចំណាយពេលជាមួយយាយ +សេចក្តីសុខ, +ចំណងមេត្រីភាព",
    actRestTitle: "សម្រាកនៅផ្ទះ",
    actRestDesc: "ដេកអង្រឹងលំហែអារម្មណ៍ក្រោមផ្ទះ +ថាមពល, -ភាពតានតឹង",
    actHobbyTitle: "ញ៉ាំកាហ្វេ និងលេងភ្លេងមាត់ទន្លេ",
    actHobbyDesc: "អង្គុយញ៉ាំកាហ្វេទឹកកកមាត់ទន្លេមេគង្គ +សេចក្តីសុខ, -$3",
    actMarketTitle: "ដើរលេងផ្សារទិញម្ហូប",
    actMarketDesc: "ទិញនំចំណី និងផ្លែឈើហូប និងជួបជជែកជាមួយអ្នកភូមិ។",

    // Work Mini-Game (Teacher)
    teacherTitle: "បន្ទប់បង្រៀនរបស់លោកគ្រូ",
    teacherSubtitle: "សាលាបឋម និងអនុវិទ្យាល័យកំពង់ចាម",
    step1Title: "១. រៀបចំកិច្ចតែងការបង្រៀន",
    step1Prompt: "តើអ្នកចង់បង្រៀនសិស្សតាមវិធីណា?",
    planInteractive: "និទានរឿង និងល្បែងសិក្សា (សប្បាយរីករាយ)",
    planDrill: "អានមេរៀន និងកត់ត្រាតាមសៀវភៅ (តឹងរ៉ឹង)",
    step2Title: "២. ស្ថានភាពក្នុងថ្នាក់",
    dilemmaPrompt: "វិបុល ជាសិស្សមកពីគ្រួសារលក់ផ្កាឈូក បានមកយឺត ២០ នាទី ដោយជើងមានប្រឡាក់ភក់។",
    choiceTalkPrivate: "សួរនាំដោយចិត្តសប្បុរសក្រោយចប់ម៉ោង (+ក្តីមេត្តា)",
    choiceScold: "ស្តីបន្ទោសនៅមុខថ្នាក់ពីបទបំពានវិន័យ (-ភាពតានតឹង, -ទំនុកចិត្ត)",
    choiceIgnore: "មិនចាប់អារម្មណ៍ ហើយបន្តបង្រៀន (+ចំណេញពេល)",
    step3Title: "៣. លទ្ធផលនៃការបង្រៀន",
    reactionSuccess: "កូនសិស្សសប្បាយរីករាយ និងស្តាប់ការនិទានរឿងរបស់អ្នកយ៉ាងជក់ចិត្ត! វិបុលញញឹមដោយភាពកក់ក្តៅ។",
    workCompleteBtn: "បញ្ចប់ការងារ និងទទួលប្រាក់ខែប្រចាំថ្ងៃ",

    // Relationships
    relationshipsTitle: "ទំនាក់ទំនង និងគ្រួសារ",
    grandmaName: "លោកយាយ",
    grandmaRole: "ចាស់ទុំក្នុងគ្រួសារ",
    grandmaQuote: "«អូន មកលេងយាយអត់? កុំភ្លេចថែសុខភាពណា មានពេលមកលេងយាយផង។»",
    motherName: "អ្នកម្តាយ",
    motherRole: "ម្តាយ",
    motherQuote: "«ខំប្រឹងធ្វើការងារណាដារ៉ា ហូបបាយឱ្យទៀងទាត់។»",
    vibolName: "វិបុល",
    vibolRole: "សិស្ស",
    vibolQuote: "«លោកគ្រូដារ៉ា ថ្ងៃនេះរៀនសប្បាយណាស់! អរគុណលោកគ្រូ!»",
    kolabName: "កុលាប",
    kolabRole: "មិត្តរួមការងារ",
    kolabQuote: "«ពេលសម្រាកថ្ងៃត្រង់ ទៅញ៉ាំកាហ្វេជាមួយគ្នាអត់លោកគ្រូ?»",
    callBtn: "ខលទូរស័ព្ទ",
    visitBtn: "ទៅលេងផ្ទាល់",
    sendGiftBtn: "ផ្ញើផ្លែឈើផ្អែមៗ ($4)",

    // Phone Apps
    phoneTitle: "ទូរស័ព្ទឆ្លាតវៃ",
    appWork: "ការងារ",
    appFamily: "គ្រួសារ",
    appCommunity: "សហគមន៍",
    appHobby: "ចំណង់ចំណូលចិត្ត",
    appBudget: "ថវិកា",
    appJournal: "កំណត់ហេតុ",
    appStatus: "ស្ថានភាព",
    appInventory: "កាតាប",

    // Budget
    budgetTitle: "ថវិកាប្រចាំខែ",
    monthlySalary: "ប្រាក់បៀវត្សរ៍មូលដ្ឋាន",
    rentExpense: "ថ្លៃបន្ទប់ស្នាក់នៅ / ផ្ទះ",
    foodExpense: "ថ្លៃម្ហូបអាហារប្រចាំថ្ងៃ",
    familyRemittance: "ជួយឧបត្ថម្ភគ្រួសារ",
    fuelExpense: "សាំងម៉ូតូធ្វើដំណើរ",
    netSavings: "សមតុល្យសន្សំប្រចាំខែ",

    // Life Journal
    journalTitle: "កំណត់ហេតុជីវិត",
    journalSub: "អនុស្សាវរីយ៍ និងដំណាក់កាលនៃជីវិតរបស់អ្នក",
    emptyJournal: "ដំណើរជីវិតរបស់អ្នកទើបតែចាប់ផ្តើម...",

    // End of Day Summary
    goodNight: "រាត្រីសួស្តី {name} 🌙",
    dayComplete: "បញ្ចប់ថ្ងៃទី {day}",
    summaryMoney: "ប្រាក់ចំណូល និងចំណាយ",
    summaryEnergy: "ថាមពលបានប្រើប្រាស់",
    summaryHappiness: "សេចក្តីសុខកើនឡើង",
    summarySkill: "ជំនាញបង្រៀន",
    summaryNote: "អ្នកបានខិតខំបំពេញភារកិច្ច និងរស់នៅមួយថ្ងៃដ៏មានន័យនៅខេត្តកំពង់ចាម។ ថ្ងៃស្អែក ព្រះអាទិត្យនឹងរះយ៉ាងត្រចះត្រចង់លើដងទន្លេមេគង្គជាថ្មី។",
    nextDayBtn: "បន្តទៅថ្ងៃស្អែក ☀️",

    // Notifications & Feedback
    earnedMoney: "+${val} ប្រាក់",
    lostEnergy: "-{val} ថាមពល",
    gainedHappiness: "+{val} សេចក្តីសុខ",
    reducedStress: "-{val} ភាពតានតឹង",
    gainedSkill: "+{val} ជំនាញ",
  },
};
