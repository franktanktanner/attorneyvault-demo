export type AttorneyTier =
  | "platinum"
  | "gold"
  | "silver"
  | "bronze"
  | "prospect"
  | "dormant";

export type AttorneyStatus =
  | "active"
  | "warm"
  | "cold"
  | "dormant"
  | "reactivation";

export type BbbOffice =
  | "San Jose"
  | "Oakland"
  | "San Francisco"
  | "Los Angeles"
  | "Orange County"
  | "San Diego";

export interface Attorney {
  id: string;
  name: string;
  firm: string;
  city: string;
  county: string;
  phone: string;
  email: string;
  assistant: string;
  practiceAreas: string[];
  barNumber: string;
  yearsAdmitted: number;
  tier: AttorneyTier;
  lifetimeReferrals: number;
  lifetimeVolume: number;
  lastReferralDate: string;
  lastContactDate: string;
  averageBondSize: number;
  conversionRate: number;
  ownerOffice: BbbOffice;
  tags: string[];
  status: AttorneyStatus;
  avatarInitials: string;
  firmLogoColor: string;
}

export type TimelineType =
  | "call"
  | "text"
  | "email"
  | "in_person"
  | "gift"
  | "event"
  | "referral"
  | "note";

export interface TimelineEntry {
  id: string;
  attorneyId: string;
  type: TimelineType;
  timestamp: string;
  summary: string;
  channel: string;
  actor: string;
}

export type BondStatus =
  | "posted"
  | "active"
  | "exonerated"
  | "forfeited"
  | "reinstated";

export interface ReferredBond {
  id: string;
  attorneyId: string;
  defendant: string;
  amount: number;
  status: BondStatus;
  postedDate: string;
  charge: string;
}

export interface AuditLogEntry {
  id: string;
  action: string;
  user: string;
  timestamp: string;
  target: string;
  details: string;
}

const PALETTE = [
  "#1A3D2E",
  "#8B7355",
  "#7A1F1F",
  "#0A0A0A",
  "#6B6B68",
  "#1A1A18",
];

const initials = (name: string) =>
  name
    .split(" ")
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 3)
    .join("")
    .toUpperCase();

const cityToCounty: Record<string, string> = {
  "San Jose": "Santa Clara",
  "Santa Clara": "Santa Clara",
  Oakland: "Alameda",
  Berkeley: "Alameda",
  "Redwood City": "San Mateo",
  "San Mateo": "San Mateo",
  "Los Angeles": "Los Angeles",
  "Beverly Hills": "Los Angeles",
  Pasadena: "Los Angeles",
  "Long Beach": "Los Angeles",
  "Santa Ana": "Orange",
  Irvine: "Orange",
  "San Diego": "San Diego",
  "La Jolla": "San Diego",
};

const cityToOffice: Record<string, BbbOffice> = {
  "San Jose": "San Jose",
  "Santa Clara": "San Jose",
  Oakland: "Oakland",
  Berkeley: "Oakland",
  "Redwood City": "San Francisco",
  "San Mateo": "San Francisco",
  "Los Angeles": "Los Angeles",
  "Beverly Hills": "Los Angeles",
  Pasadena: "Los Angeles",
  "Long Beach": "Los Angeles",
  "Santa Ana": "Orange County",
  Irvine: "Orange County",
  "San Diego": "San Diego",
  "La Jolla": "San Diego",
};

const daysAgo = (days: number) => {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString();
};

interface Seed {
  name: string;
  firm: string;
  city: string;
  areas: string[];
  tier: AttorneyTier;
  years: number;
  assistant: string;
  tags: string[];
  status: AttorneyStatus;
  lastReferralDays: number;
  lastContactDays: number;
  refs: number;
  avgBond: number;
  conv: number;
}

const SEEDS: Seed[] = [
  // PLATINUM (5)
  {
    name: "C. Jeffrey Stanley",
    firm: "Stanley & Reyes Defense Group",
    city: "San Jose",
    areas: ["Violent Crimes", "White Collar", "Federal"],
    tier: "platinum",
    years: 28,
    assistant: "Marta Beltran",
    tags: ["Trusted Circle", "Board Referred", "High Net Worth"],
    status: "active",
    lastReferralDays: 4,
    lastContactDays: 2,
    refs: 142,
    avgBond: 185000,
    conv: 0.84,
  },
  {
    name: "Marisol Castaneda",
    firm: "Castaneda Criminal Defense",
    city: "Los Angeles",
    areas: ["Homicide", "Gang Enhancement", "Three Strikes"],
    tier: "platinum",
    years: 22,
    assistant: "Julian Ortiz",
    tags: ["Trusted Circle", "Statewide Network"],
    status: "active",
    lastReferralDays: 6,
    lastContactDays: 5,
    refs: 118,
    avgBond: 240000,
    conv: 0.79,
  },
  {
    name: "Harold Okonkwo",
    firm: "Okonkwo Law Offices",
    city: "Oakland",
    areas: ["Federal", "Narcotics", "Asset Forfeiture"],
    tier: "platinum",
    years: 31,
    assistant: "Denise Park",
    tags: ["Federal Panel", "Trusted Circle"],
    status: "active",
    lastReferralDays: 9,
    lastContactDays: 3,
    refs: 96,
    avgBond: 310000,
    conv: 0.81,
  },
  {
    name: "Priya Ramanathan",
    firm: "Ramanathan Defense LLP",
    city: "Beverly Hills",
    areas: ["White Collar", "Securities", "Federal"],
    tier: "platinum",
    years: 19,
    assistant: "Rebecca Soong",
    tags: ["Celebrity Docket", "High Net Worth"],
    status: "active",
    lastReferralDays: 11,
    lastContactDays: 4,
    refs: 88,
    avgBond: 420000,
    conv: 0.74,
  },
  {
    name: "Darnell Whitfield",
    firm: "Whitfield Trial Group",
    city: "San Diego",
    areas: ["Violent Crimes", "DUI Manslaughter", "Appeals"],
    tier: "platinum",
    years: 24,
    assistant: "Ana Figueroa",
    tags: ["Trusted Circle", "Appellate Specialist"],
    status: "active",
    lastReferralDays: 3,
    lastContactDays: 1,
    refs: 131,
    avgBond: 205000,
    conv: 0.86,
  },

  // GOLD (10)
  {
    name: "Elena Vasquez",
    firm: "Vasquez & Partners",
    city: "Santa Ana",
    areas: ["Domestic Violence", "DUI", "Probation Violations"],
    tier: "gold",
    years: 16,
    assistant: "Tomas Leal",
    tags: ["Volume Referrer"],
    status: "active",
    lastReferralDays: 12,
    lastContactDays: 8,
    refs: 74,
    avgBond: 58000,
    conv: 0.71,
  },
  {
    name: "Benjamin Hartley",
    firm: "Hartley Criminal Law",
    city: "Pasadena",
    areas: ["Sex Crimes", "Juvenile", "Appeals"],
    tier: "gold",
    years: 18,
    assistant: "Lily Choi",
    tags: ["Appellate Specialist"],
    status: "active",
    lastReferralDays: 14,
    lastContactDays: 10,
    refs: 62,
    avgBond: 92000,
    conv: 0.68,
  },
  {
    name: "Kamala Brennan",
    firm: "Brennan Defense Associates",
    city: "Long Beach",
    areas: ["DUI", "Drug Possession", "Weapons"],
    tier: "gold",
    years: 13,
    assistant: "Gregory Foss",
    tags: ["Volume Referrer"],
    status: "active",
    lastReferralDays: 5,
    lastContactDays: 3,
    refs: 81,
    avgBond: 42000,
    conv: 0.77,
  },
  {
    name: "Roberto Salazar",
    firm: "Salazar & Huang",
    city: "San Mateo",
    areas: ["White Collar", "Fraud", "Embezzlement"],
    tier: "gold",
    years: 20,
    assistant: "Patricia Wynn",
    tags: ["High Net Worth"],
    status: "warm",
    lastReferralDays: 28,
    lastContactDays: 18,
    refs: 54,
    avgBond: 140000,
    conv: 0.62,
  },
  {
    name: "Alexandra Kerrigan",
    firm: "Kerrigan Law Firm",
    city: "Santa Clara",
    areas: ["Violent Crimes", "Domestic Violence"],
    tier: "gold",
    years: 15,
    assistant: "Brian Nakamura",
    tags: ["Volume Referrer", "Trial Heavy"],
    status: "active",
    lastReferralDays: 7,
    lastContactDays: 4,
    refs: 69,
    avgBond: 78000,
    conv: 0.73,
  },
  {
    name: "Dmitri Chen",
    firm: "Chen & Vega Defense",
    city: "Irvine",
    areas: ["Federal", "Immigration Crimes", "Narcotics"],
    tier: "gold",
    years: 17,
    assistant: "Yasmin Reed",
    tags: ["Federal Panel"],
    status: "active",
    lastReferralDays: 10,
    lastContactDays: 6,
    refs: 58,
    avgBond: 155000,
    conv: 0.66,
  },
  {
    name: "Grace Underwood",
    firm: "Underwood Criminal Defense",
    city: "Berkeley",
    areas: ["Sex Crimes", "Civil Rights", "Wrongful Conviction"],
    tier: "gold",
    years: 21,
    assistant: "Marcus Delaney",
    tags: ["Appellate Specialist", "Trusted Circle"],
    status: "warm",
    lastReferralDays: 22,
    lastContactDays: 14,
    refs: 47,
    avgBond: 98000,
    conv: 0.69,
  },
  {
    name: "Xavier Montrose",
    firm: "Montrose Trial Advocates",
    city: "La Jolla",
    areas: ["DUI Manslaughter", "Violent Crimes"],
    tier: "gold",
    years: 14,
    assistant: "Sofia Darmawan",
    tags: ["Trial Heavy"],
    status: "active",
    lastReferralDays: 9,
    lastContactDays: 7,
    refs: 63,
    avgBond: 115000,
    conv: 0.72,
  },
  {
    name: "Naomi Kelleher",
    firm: "Kelleher Defense Group",
    city: "Redwood City",
    areas: ["White Collar", "Tax Crimes"],
    tier: "gold",
    years: 19,
    assistant: "Ethan Prasad",
    tags: ["High Net Worth"],
    status: "active",
    lastReferralDays: 13,
    lastContactDays: 9,
    refs: 51,
    avgBond: 168000,
    conv: 0.64,
  },
  {
    name: "Marcus Thibodeaux",
    firm: "Thibodeaux Law",
    city: "Oakland",
    areas: ["Homicide", "Gang Enhancement"],
    tier: "gold",
    years: 23,
    assistant: "Vanessa Holmes",
    tags: ["Trial Heavy", "Trusted Circle"],
    status: "active",
    lastReferralDays: 6,
    lastContactDays: 4,
    refs: 72,
    avgBond: 132000,
    conv: 0.75,
  },

  // SILVER (15)
  {
    name: "Olivia Rasmussen",
    firm: "Rasmussen & Co.",
    city: "San Jose",
    areas: ["DUI", "Traffic Crimes"],
    tier: "silver",
    years: 9,
    assistant: "Jared Kim",
    tags: ["Volume Referrer"],
    status: "active",
    lastReferralDays: 18,
    lastContactDays: 12,
    refs: 32,
    avgBond: 28000,
    conv: 0.58,
  },
  {
    name: "Terrence Mbala",
    firm: "Mbala Law",
    city: "Los Angeles",
    areas: ["Drug Possession", "Probation Violations"],
    tier: "silver",
    years: 11,
    assistant: "Renee Vassallo",
    tags: [],
    status: "warm",
    lastReferralDays: 24,
    lastContactDays: 20,
    refs: 28,
    avgBond: 32000,
    conv: 0.55,
  },
  {
    name: "Catherine Obrien",
    firm: "Obrien Defense",
    city: "Pasadena",
    areas: ["Juvenile", "DUI"],
    tier: "silver",
    years: 8,
    assistant: "Samuel Akin",
    tags: [],
    status: "active",
    lastReferralDays: 15,
    lastContactDays: 11,
    refs: 35,
    avgBond: 24000,
    conv: 0.61,
  },
  {
    name: "Hiroshi Tanaka",
    firm: "Tanaka Criminal Law",
    city: "Oakland",
    areas: ["Weapons", "Drug Distribution"],
    tier: "silver",
    years: 12,
    assistant: "Evelyn Park",
    tags: [],
    status: "active",
    lastReferralDays: 21,
    lastContactDays: 15,
    refs: 26,
    avgBond: 48000,
    conv: 0.57,
  },
  {
    name: "Selena Okafor",
    firm: "Okafor Defense Associates",
    city: "Long Beach",
    areas: ["Domestic Violence", "Assault"],
    tier: "silver",
    years: 10,
    assistant: "Dante Varela",
    tags: ["Volume Referrer"],
    status: "active",
    lastReferralDays: 11,
    lastContactDays: 8,
    refs: 38,
    avgBond: 36000,
    conv: 0.63,
  },
  {
    name: "Jonathan Pressley",
    firm: "Pressley Law Offices",
    city: "Santa Ana",
    areas: ["DUI", "Hit and Run"],
    tier: "silver",
    years: 7,
    assistant: "Celeste Moreno",
    tags: [],
    status: "active",
    lastReferralDays: 19,
    lastContactDays: 13,
    refs: 24,
    avgBond: 22000,
    conv: 0.54,
  },
  {
    name: "Anika Bergstrom",
    firm: "Bergstrom & Fields",
    city: "Berkeley",
    areas: ["Theft", "Fraud"],
    tier: "silver",
    years: 13,
    assistant: "Philippe Auger",
    tags: [],
    status: "warm",
    lastReferralDays: 32,
    lastContactDays: 24,
    refs: 22,
    avgBond: 41000,
    conv: 0.52,
  },
  {
    name: "Rafael Montenegro",
    firm: "Montenegro Defense",
    city: "Irvine",
    areas: ["DUI", "Drug Possession"],
    tier: "silver",
    years: 6,
    assistant: "Hannah Brooks",
    tags: [],
    status: "active",
    lastReferralDays: 16,
    lastContactDays: 10,
    refs: 31,
    avgBond: 26000,
    conv: 0.60,
  },
  {
    name: "Yvette Caruso",
    firm: "Caruso Law",
    city: "San Diego",
    areas: ["Domestic Violence", "Restraining Orders"],
    tier: "silver",
    years: 9,
    assistant: "Tobias Whelan",
    tags: [],
    status: "active",
    lastReferralDays: 13,
    lastContactDays: 9,
    refs: 29,
    avgBond: 31000,
    conv: 0.59,
  },
  {
    name: "Kwame Ferrari",
    firm: "Ferrari Defense Group",
    city: "Santa Clara",
    areas: ["Drug Possession", "Expungement"],
    tier: "silver",
    years: 11,
    assistant: "Isadora Locke",
    tags: [],
    status: "active",
    lastReferralDays: 20,
    lastContactDays: 14,
    refs: 23,
    avgBond: 38000,
    conv: 0.56,
  },
  {
    name: "Lorna Haddad",
    firm: "Haddad Criminal Defense",
    city: "Redwood City",
    areas: ["DUI", "Traffic Crimes"],
    tier: "silver",
    years: 8,
    assistant: "Benedict Shaw",
    tags: [],
    status: "active",
    lastReferralDays: 17,
    lastContactDays: 12,
    refs: 27,
    avgBond: 29000,
    conv: 0.58,
  },
  {
    name: "Silas Worthington",
    firm: "Worthington Law",
    city: "La Jolla",
    areas: ["White Collar", "Embezzlement"],
    tier: "silver",
    years: 14,
    assistant: "Maya Pereira",
    tags: [],
    status: "warm",
    lastReferralDays: 29,
    lastContactDays: 21,
    refs: 20,
    avgBond: 68000,
    conv: 0.50,
  },
  {
    name: "Imani Kozlowski",
    firm: "Kozlowski Defense",
    city: "Beverly Hills",
    areas: ["Theft", "Shoplifting", "Fraud"],
    tier: "silver",
    years: 10,
    assistant: "Fernando Alarcon",
    tags: [],
    status: "active",
    lastReferralDays: 14,
    lastContactDays: 11,
    refs: 33,
    avgBond: 44000,
    conv: 0.62,
  },
  {
    name: "Desmond Rivera",
    firm: "Rivera & Quinn",
    city: "San Jose",
    areas: ["DUI", "Probation Violations"],
    tier: "silver",
    years: 7,
    assistant: "Odessa Platt",
    tags: [],
    status: "active",
    lastReferralDays: 22,
    lastContactDays: 16,
    refs: 25,
    avgBond: 27000,
    conv: 0.56,
  },
  {
    name: "Brynn Halvorsen",
    firm: "Halvorsen Defense",
    city: "Santa Ana",
    areas: ["Juvenile", "Truancy"],
    tier: "silver",
    years: 12,
    assistant: "Corinne Abiola",
    tags: [],
    status: "active",
    lastReferralDays: 18,
    lastContactDays: 13,
    refs: 30,
    avgBond: 33000,
    conv: 0.59,
  },

  // BRONZE (5)
  {
    name: "August Weatherby",
    firm: "Weatherby Law",
    city: "Pasadena",
    areas: ["DUI"],
    tier: "bronze",
    years: 4,
    assistant: "Inez Carrera",
    tags: ["Early Career"],
    status: "warm",
    lastReferralDays: 38,
    lastContactDays: 26,
    refs: 11,
    avgBond: 18000,
    conv: 0.44,
  },
  {
    name: "Chandra Velasquez",
    firm: "Velasquez Criminal Law",
    city: "Long Beach",
    areas: ["Drug Possession"],
    tier: "bronze",
    years: 3,
    assistant: "Beckett Lowry",
    tags: ["Early Career"],
    status: "active",
    lastReferralDays: 26,
    lastContactDays: 19,
    refs: 14,
    avgBond: 21000,
    conv: 0.48,
  },
  {
    name: "Gideon Ashford",
    firm: "Ashford Law Office",
    city: "Oakland",
    areas: ["Theft", "Burglary"],
    tier: "bronze",
    years: 5,
    assistant: "Tamsin Wolfe",
    tags: [],
    status: "warm",
    lastReferralDays: 41,
    lastContactDays: 28,
    refs: 9,
    avgBond: 23000,
    conv: 0.42,
  },
  {
    name: "Paloma Iriarte",
    firm: "Iriarte Defense",
    city: "Irvine",
    areas: ["Domestic Violence"],
    tier: "bronze",
    years: 4,
    assistant: "Harlan Boone",
    tags: [],
    status: "active",
    lastReferralDays: 30,
    lastContactDays: 22,
    refs: 12,
    avgBond: 26000,
    conv: 0.46,
  },
  {
    name: "Nikolai Ozerov",
    firm: "Ozerov Law",
    city: "Berkeley",
    areas: ["DUI", "Traffic Crimes"],
    tier: "bronze",
    years: 6,
    assistant: "Rosalind Pace",
    tags: [],
    status: "active",
    lastReferralDays: 33,
    lastContactDays: 24,
    refs: 10,
    avgBond: 19000,
    conv: 0.43,
  },

  // PROSPECT (3)
  {
    name: "Simone Delacroix",
    firm: "Delacroix & Associates",
    city: "San Mateo",
    areas: ["White Collar", "Federal"],
    tier: "prospect",
    years: 15,
    assistant: "Ansel Kirby",
    tags: ["Targeted Introduction"],
    status: "reactivation",
    lastReferralDays: 999,
    lastContactDays: 7,
    refs: 0,
    avgBond: 0,
    conv: 0,
  },
  {
    name: "Theodore Brantley",
    firm: "Brantley Criminal Defense",
    city: "Los Angeles",
    areas: ["Celebrity Defense", "High Profile"],
    tier: "prospect",
    years: 22,
    assistant: "Milena Vostok",
    tags: ["Targeted Introduction", "High Value"],
    status: "reactivation",
    lastReferralDays: 999,
    lastContactDays: 15,
    refs: 0,
    avgBond: 0,
    conv: 0,
  },
  {
    name: "Ingrid Palomar",
    firm: "Palomar Law Firm",
    city: "San Diego",
    areas: ["Violent Crimes", "Homicide"],
    tier: "prospect",
    years: 18,
    assistant: "Wesley Tran",
    tags: ["Targeted Introduction"],
    status: "reactivation",
    lastReferralDays: 999,
    lastContactDays: 21,
    refs: 0,
    avgBond: 0,
    conv: 0,
  },

  // DORMANT (2)
  {
    name: "Leland Rothschild",
    firm: "Rothschild Defense",
    city: "Beverly Hills",
    areas: ["White Collar"],
    tier: "dormant",
    years: 26,
    assistant: "Juliet Marchetti",
    tags: ["Former Trusted Circle"],
    status: "dormant",
    lastReferralDays: 420,
    lastContactDays: 180,
    refs: 41,
    avgBond: 95000,
    conv: 0.58,
  },
  {
    name: "Constance Mbeki",
    firm: "Mbeki Law Group",
    city: "Santa Clara",
    areas: ["Violent Crimes", "Appeals"],
    tier: "dormant",
    years: 24,
    assistant: "Percival Hayes",
    tags: ["Former Volume Referrer"],
    status: "dormant",
    lastReferralDays: 510,
    lastContactDays: 240,
    refs: 36,
    avgBond: 72000,
    conv: 0.54,
  },
];

function volumeForTier(tier: AttorneyTier, refs: number, avg: number): number {
  if (tier === "prospect") return 0;
  const bands: Record<AttorneyTier, [number, number]> = {
    platinum: [2_000_000, 5_000_000],
    gold: [500_000, 2_000_000],
    silver: [100_000, 500_000],
    bronze: [0, 100_000],
    prospect: [0, 0],
    dormant: [100_000, 500_000],
  };
  const [min, max] = bands[tier];
  const computed = refs * avg;
  return Math.min(max, Math.max(min, computed));
}

export const attorneys: Attorney[] = SEEDS.map((seed, index) => {
  const county = cityToCounty[seed.city] ?? "Unknown";
  const office = cityToOffice[seed.city] ?? "San Jose";
  const lifetimeVolume = volumeForTier(seed.tier, seed.refs, seed.avgBond);
  const areaCode =
    office === "San Jose" || office === "Oakland" || office === "San Francisco"
      ? 408 + (index % 6) * 3
      : office === "Los Angeles"
      ? 213 + (index % 3) * 110
      : office === "Orange County"
      ? 714
      : 619;
  const phone = `(${areaCode}) ${String(200 + (index * 37) % 799).padStart(3, "0")}-${String(1000 + (index * 113) % 8999).padStart(4, "0")}`;
  const emailLocal = seed.name
    .toLowerCase()
    .replace(/[^a-z ]/g, "")
    .split(" ")
    .filter(Boolean)
    .map((p, i) => (i === 0 ? p[0] : p))
    .join(".");
  const firmDomain = seed.firm
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z ]/g, "")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .join("");

  return {
    id: `atty-${String(index + 1).padStart(3, "0")}`,
    name: seed.name,
    firm: seed.firm,
    city: seed.city,
    county,
    phone,
    email: `${emailLocal}@${firmDomain}.law`,
    assistant: seed.assistant,
    practiceAreas: seed.areas,
    barNumber: String(118000 + index * 1373).slice(0, 6),
    yearsAdmitted: seed.years,
    tier: seed.tier,
    lifetimeReferrals: seed.refs,
    lifetimeVolume,
    lastReferralDate:
      seed.lastReferralDays >= 900
        ? daysAgo(900)
        : daysAgo(seed.lastReferralDays),
    lastContactDate: daysAgo(seed.lastContactDays),
    averageBondSize: seed.avgBond,
    conversionRate: seed.conv,
    ownerOffice: office,
    tags: seed.tags,
    status: seed.status,
    avatarInitials: initials(seed.name),
    firmLogoColor: PALETTE[index % PALETTE.length],
  };
});

const TIMELINE_TEMPLATES: Array<{
  type: TimelineType;
  summary: string;
  channel: string;
  actor: string;
}> = [
  {
    type: "call",
    summary: "Follow-up on pending arraignment for high-net-worth client",
    channel: "Direct line",
    actor: "C. Jeffrey Stanley",
  },
  {
    type: "text",
    summary: "Confirmed next-day posting for weekend booking",
    channel: "SMS",
    actor: "Night Desk",
  },
  {
    type: "email",
    summary: "Sent Q1 volume summary and projected trajectory",
    channel: "Vault Outbound",
    actor: "Relationship Desk",
  },
  {
    type: "in_person",
    summary: "Coffee meeting at Alameda courthouse cafe",
    channel: "In person",
    actor: "Regional Partner",
  },
  {
    type: "gift",
    summary: "Hand-delivered leather-bound bar registry annual",
    channel: "Concierge",
    actor: "Concierge Desk",
  },
  {
    type: "event",
    summary: "Hosted at private box, Chase Center, Warriors playoffs",
    channel: "Hospitality",
    actor: "Events Desk",
  },
  {
    type: "referral",
    summary: "Referred federal white collar matter, $280K bond posted",
    channel: "Vault Intake",
    actor: "Intake Desk",
  },
  {
    type: "note",
    summary: "Prefers Tuesday calls after 2pm, avoid Friday trial prep window",
    channel: "Internal",
    actor: "Principal",
  },
];

export const timelineEntries: TimelineEntry[] = Array.from({ length: 30 }).map(
  (_, i) => {
    const template = TIMELINE_TEMPLATES[i % TIMELINE_TEMPLATES.length];
    const attorney = attorneys[i % attorneys.length];
    return {
      id: `tl-${String(i + 1).padStart(3, "0")}`,
      attorneyId: attorney.id,
      type: template.type,
      timestamp: daysAgo(Math.floor(i * 1.5) + 1),
      summary: template.summary,
      channel: template.channel,
      actor: template.actor,
    };
  }
);

const CHARGES = [
  "PC 187 Homicide",
  "PC 245 Assault with Deadly Weapon",
  "VC 23152 DUI",
  "HS 11351 Drug Possession for Sale",
  "PC 422 Criminal Threats",
  "PC 273.5 Domestic Violence",
  "PC 459 Burglary",
  "PC 487 Grand Theft",
  "PC 182 Conspiracy",
  "PC 211 Robbery",
];

const BOND_STATUSES: BondStatus[] = [
  "posted",
  "active",
  "exonerated",
  "forfeited",
  "reinstated",
];

const FIRST_NAMES = [
  "Andre",
  "Briana",
  "Carlos",
  "Deanna",
  "Elijah",
  "Fatima",
  "Gavin",
  "Hana",
  "Ivan",
  "Jasmine",
  "Kellan",
  "Lorena",
  "Miguel",
  "Nadia",
  "Omar",
  "Paige",
  "Quentin",
  "Rosa",
  "Shane",
  "Talia",
];
const LAST_NAMES = [
  "Alvarado",
  "Brooks",
  "Castillo",
  "Diaz",
  "Esposito",
  "Ford",
  "Greene",
  "Hutchins",
  "Imani",
  "Jablonski",
  "Kendrick",
  "Lindstrom",
  "Marquez",
  "Nguyen",
  "Obi",
  "Paredes",
  "Quintero",
  "Ruiz",
  "Silva",
  "Tavares",
];

export const referredBonds: ReferredBond[] = Array.from({ length: 50 }).map(
  (_, i) => {
    const attorney = attorneys[i % attorneys.length];
    const firstName = FIRST_NAMES[i % FIRST_NAMES.length];
    const lastName = LAST_NAMES[(i * 7) % LAST_NAMES.length];
    const amount =
      Math.round(
        (attorney.averageBondSize || 35000) *
          (0.6 + ((i * 13) % 100) / 100) /
          1000
      ) * 1000;
    return {
      id: `bond-${String(i + 1).padStart(4, "0")}`,
      attorneyId: attorney.id,
      defendant: `${firstName} ${lastName}`,
      amount,
      status: BOND_STATUSES[i % BOND_STATUSES.length],
      postedDate: daysAgo((i * 11) % 365 + 1),
      charge: CHARGES[i % CHARGES.length],
    };
  }
);

const AUDIT_ACTIONS = [
  { action: "VAULT_UNLOCKED", details: "Principal session established" },
  { action: "VAULT_LOCKED", details: "Session ended by auto-timeout" },
  { action: "ATTORNEY_VIEWED", details: "Profile accessed for review" },
  { action: "REFERRAL_LOGGED", details: "Inbound referral recorded to ledger" },
  { action: "EXPORT_GENERATED", details: "Quarterly intelligence export PDF" },
  { action: "TAG_APPLIED", details: "Trusted Circle tag applied" },
  { action: "NOTE_ADDED", details: "Relationship note appended" },
  { action: "ENRICHMENT_RUN", details: "CourtConnect enrichment completed" },
  { action: "TIER_UPGRADED", details: "Attorney moved to higher tier" },
  { action: "SESSION_EXTENDED", details: "Session extended by principal" },
];

const AUDIT_USERS = [
  "C. Jeffrey Stanley",
  "Marta Beltran",
  "Night Desk",
  "Intake Desk",
  "Concierge Desk",
];

export const auditLogEntries: AuditLogEntry[] = Array.from({ length: 20 }).map(
  (_, i) => {
    const template = AUDIT_ACTIONS[i % AUDIT_ACTIONS.length];
    const attorney = attorneys[i % attorneys.length];
    return {
      id: `audit-${String(i + 1).padStart(3, "0")}`,
      action: template.action,
      user: AUDIT_USERS[i % AUDIT_USERS.length],
      timestamp: daysAgo(Math.floor(i / 2) + 1),
      target: attorney.name,
      details: template.details,
    };
  }
);
