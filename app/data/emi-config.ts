/**
 * EMI Configuration & Data
 * SSLCOMMERZ EMI rates, supported banks, and availability information
 */

export interface EMIOption {
  months: number;
  label: string;
}

export interface BankEMIRate {
  bankName: string;
  bankId: string;
  standardChartered?: number;
  lankaBangla?: number;
  forAllBanks?: number;
}

export interface SupportedBank {
  id: string;
  name: string;
  logoPath?: string;
  visa: boolean;
  mastercard: boolean;
  amex: boolean;
  status: "Live" | "Pending";
}

export interface BankEMIAvailability {
  bankId: string;
  bankName: string;
  months: number[];
  minPurchase: number;
  maxPurchase?: number;
}

// Available EMI tenure options
export const emiOptions: EMIOption[] = [
  { months: 3, label: "3 months" },
  { months: 6, label: "6 months" },
  { months: 9, label: "9 months" },
  { months: 12, label: "12 months" },
  { months: 18, label: "18 months" },
  { months: 24, label: "24 months" },
  { months: 30, label: "30 months" },
  { months: 36, label: "36 months" },
];

// EMI Interest Rates by Bank Type
export const emiInterestRates = {
  standardChartered: {
    3: 3.5,
    6: 5.5,
    9: 8.0,
    12: 10.5,
    18: 13.5,
    24: 17.5,
    36: 22.5,
  },
  lankaBangla: {
    3: 3.5,
    6: 4.5,
    9: 6.5,
    12: 8.5,
    18: 11.5,
    24: 15.5,
    36: 19.5,
  },
  forAllBanks: {
    3: 3.0,
    6: 4.5,
    9: 6.5,
    12: 8.5,
    18: 11.5,
    24: 15.5,
    30: 16.5,
    36: 19.5,
  },
};

// Supported Banks List (19 banks)
export const supportedBanks: SupportedBank[] = [
  {
    id: "scb",
    name: "Standard Chartered Bank (SCB)",
    logoPath: "/bank_logo/standard_chartert.png",
    visa: true,
    mastercard: true,
    amex: false,
    status: "Live",
  },
  {
    id: "brac",
    name: "BRAC Bank Limited",
    logoPath: "/bank_logo/brack_bank.png",
    visa: true,
    mastercard: true,
    amex: false,
    status: "Live",
  },
  {
    id: "citybank",
    name: "City Bank Limited",
    logoPath: "/bank_logo/city_bank.png",
    visa: false,
    mastercard: false,
    amex: true,
    status: "Live",
  },
  {
    id: "dbbl",
    name: "Dutch Bangla Bank Limited",
    logoPath: "/bank_logo/dutch_bangla_bank.png",
    visa: true,
    mastercard: true,
    amex: false,
    status: "Live",
  },
  {
    id: "sebl",
    name: "Southeast Bank Limited",
    logoPath: "/bank_logo/south_east_bank.png",
    visa: true,
    mastercard: true,
    amex: false,
    status: "Live",
  },
  {
    id: "sbl",
    name: "Standard Bank Limited",
    logoPath: "/bank_logo/standard_bank.png",
    visa: true,
    mastercard: true,
    amex: false,
    status: "Live",
  },
  {
    id: "mtb",
    name: "Mutual Trust Bank Limited",
    logoPath: "/bank_logo/mutual_trust_bank.png",
    visa: true,
    mastercard: true,
    amex: false,
    status: "Live",
  },
  {
    id: "ebl",
    name: "Eastern Bank Limited",
    logoPath: "/bank_logo/eastern_bank.png",
    visa: true,
    mastercard: true,
    amex: false,
    status: "Live",
  },
  {
    id: "lankabangla",
    name: "Lanka Bangla",
    logoPath: "/bank_logo/lanka_bangla.png",
    visa: true,
    mastercard: true,
    amex: false,
    status: "Live",
  },
  {
    id: "bankasia",
    name: "Bank Asia Limited",
    logoPath: "/bank_logo/bank_asia.png",
    visa: true,
    mastercard: false,
    amex: false,
    status: "Live",
  },
  {
    id: "dhakabank",
    name: "Dhaka Bank Limited",
    logoPath: "/bank_logo/dhaka_bank.png",
    visa: true,
    mastercard: false,
    amex: false,
    status: "Live",
  },
  {
    id: "meghnabank",
    name: "Meghana Bank Limited",
    logoPath: "/bank_logo/meghna_bank.png",
    visa: true,
    mastercard: false,
    amex: false,
    status: "Live",
  },
  {
    id: "jamunabank",
    name: "Jamuna Bank Limited",
    logoPath: "/bank_logo/jamuna_bank.png",
    visa: true,
    mastercard: false,
    amex: false,
    status: "Live",
  },
  {
    id: "ncc",
    name: "National Credit & Commerce (NCC) Bank Limited",
    logoPath: "/bank_logo/ncc_bank.png",
    visa: true,
    mastercard: false,
    amex: false,
    status: "Live",
  },
  {
    id: "nrb",
    name: "NRB Bank Limited",
    logoPath: "/bank_logo/NRB_bank.png",
    visa: true,
    mastercard: false,
    amex: false,
    status: "Live",
  },
  {
    id: "nrbc",
    name: "NRBC Bank Limited",
    logoPath: "/bank_logo/NRBC_bank.png",
    visa: true,
    mastercard: false,
    amex: false,
    status: "Live",
  },
  {
    id: "sbac",
    name: "South Bangla Agriculture Bank (SBAC)",
    logoPath: "/bank_logo/SBAC_bank.png",
    visa: true,
    mastercard: false,
    amex: false,
    status: "Live",
  },
  {
    id: "midland",
    name: "Midland Bank Limited",
    logoPath: "/bank_logo/midland_bank.png",
    visa: true,
    mastercard: false,
    amex: false,
    status: "Live",
  },
  {
    id: "shahjalal",
    name: "Shahjalal Islami Bank Limited",
    logoPath: "/bank_logo/shahjalal_bank.png",
    visa: true,
    mastercard: false,
    amex: false,
    status: "Live",
  },
];

// EMI Availability by Bank
export const bankEMIAvailability: BankEMIAvailability[] = [
  {
    bankId: "scb",
    bankName: "Standard Chartered Bank",
    months: [3, 6, 9, 12, 18, 24, 36],
    minPurchase: 5000,
  },
  {
    bankId: "citybank",
    bankName: "City Bank",
    months: [3, 6, 9, 12, 18, 24, 30, 36],
    minPurchase: 5000,
  },
  {
    bankId: "brac",
    bankName: "BRAC Bank",
    months: [3, 6, 9, 12, 18, 24, 36],
    minPurchase: 5000,
  },
  {
    bankId: "dbbl",
    bankName: "Dutch Bangla Bank",
    months: [3, 6, 9, 12, 18, 24, 36],
    minPurchase: 5000,
  },
  {
    bankId: "mtb",
    bankName: "Mutual Trust Bank",
    months: [3, 6, 9, 12, 18, 24, 36],
    minPurchase: 5000,
  },
  {
    bankId: "sebl",
    bankName: "Southeast Bank",
    months: [3, 6, 9, 12, 18, 24, 30, 36],
    minPurchase: 5000,
  },
  {
    bankId: "sbl",
    bankName: "Standard Bank",
    months: [3, 6, 9, 12, 18, 24, 36],
    minPurchase: 5000,
  },
  {
    bankId: "ebl",
    bankName: "Eastern Bank",
    months: [3, 6, 9, 12, 18, 24],
    minPurchase: 5000,
  },
  {
    bankId: "nrb",
    bankName: "NRB Bank",
    months: [3, 6, 9, 12, 18, 24, 36],
    minPurchase: 5000,
  },
  {
    bankId: "meghnabank",
    bankName: "Meghna Bank",
    months: [3, 6, 9, 12, 18, 24],
    minPurchase: 5000,
  },
  {
    bankId: "jamunabank",
    bankName: "Jamuna Bank",
    months: [3, 6, 9, 12, 18, 24, 36],
    minPurchase: 5000,
  },
  {
    bankId: "midland",
    bankName: "Midland Bank",
    months: [3, 6, 9, 12, 18, 24],
    minPurchase: 5000,
  },
  {
    bankId: "bankasia",
    bankName: "Bank Asia",
    months: [3, 6, 9, 12, 18, 24],
    minPurchase: 5000,
  },
  {
    bankId: "dhakabank",
    bankName: "Dhaka Bank",
    months: [3, 6, 9, 12, 18, 24, 36],
    minPurchase: 5000,
    maxPurchase: 200000,
  },
  {
    bankId: "sbac",
    bankName: "South Bangla Agriculture Bank",
    months: [3, 6, 9, 12, 18, 24],
    minPurchase: 5000,
  },
  {
    bankId: "nrbc",
    bankName: "NRBC Bank",
    months: [3, 6, 9, 12, 18, 24, 36],
    minPurchase: 5000,
  },
  {
    bankId: "lankabangla",
    bankName: "Lanka Bangla",
    months: [3, 6, 9, 12, 18, 24, 36],
    minPurchase: 5000,
  },
  {
    bankId: "shahjalal",
    bankName: "Shahjalal Islami Bank",
    months: [3, 6, 9, 12, 18, 24, 36],
    minPurchase: 5000,
  },
  {
    bankId: "ncc",
    bankName: "National Credit & Commerce Bank",
    months: [3, 6, 9, 12, 18, 24, 36],
    minPurchase: 5000,
  },
];

// Get interest rate for a specific bank and tenure
export function getEMIRate(
  bankType: "standardChartered" | "lankaBangla" | "forAllBanks",
  months: number,
): number | undefined {
  return emiInterestRates[bankType][
    months as keyof (typeof emiInterestRates)[typeof bankType]
  ];
}

// Get available tenures for a specific bank
export function getBankAvailableTenures(bankId: string): number[] {
  const bank = bankEMIAvailability.find((b) => b.bankId === bankId);
  return bank?.months || [];
}

// Get bank details
export function getBankDetails(bankId: string): SupportedBank | undefined {
  return supportedBanks.find((b) => b.id === bankId);
}
