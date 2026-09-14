"use client";

import {
  bankEMIAvailability,
  emiInterestRates,
  getBankAvailableTenures,
  getEMIRate,
  supportedBanks,
  type SupportedBank,
} from "@/app/data/emi-config";
import {
  Building2,
  Calendar,
  Check,
  ChevronDown,
  ChevronUp,
  CreditCard,
  Info,
  ShieldCheck,
  Sparkles,
  X,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";

interface ProductEMICalculatorProps {
  price: number;
  productName?: string;
  className?: string;
  onClose?: () => void;
}

// Helper to determine rate table bucket
const getBankRateType = (
  bankId: string,
): "standardChartered" | "lankaBangla" | "forAllBanks" => {
  if (bankId === "scb") return "standardChartered";
  if (bankId === "lankabangla") return "lankaBangla";
  return "forAllBanks";
};

// Popular banks shown as quick pills
const FEATURED_BANK_IDS = ["scb", "citybank", "brac", "dbbl", "ebl", "lankabangla"];

export function calculateProductEMI(price: number, bankId: string, months: number) {
  const bankType = getBankRateType(bankId);
  const ratePercentage = getEMIRate(bankType, months) ?? 0;
  const rate = ratePercentage / 100;
  const interestAmount = Math.round(price * rate);
  const totalAmount = price + interestAmount;
  const monthlyEMI = Math.round(totalAmount / months);
  const principalPerMonth = Math.round(price / months);
  const interestPerMonth = Math.round(interestAmount / months);

  return {
    ratePercentage,
    interestAmount,
    totalAmount,
    monthlyEMI,
    principalPerMonth,
    interestPerMonth,
  };
}

export function getLowestMonthlyEMI(price: number): {
  monthlyEMI: number;
  months: number;
  bankName: string;
} | null {
  if (!price || price < 5000) return null;
  let lowest = Infinity;
  let bestMonths = 36;
  let bestBankName = "Partner Banks";

  for (const bank of supportedBanks) {
    const tenures = getBankAvailableTenures(bank.id);
    const bankType = getBankRateType(bank.id);
    for (const m of tenures) {
      const rate = getEMIRate(bankType, m);
      if (rate !== undefined) {
        const monthly = (price * (1 + rate / 100)) / m;
        if (monthly < lowest) {
          lowest = monthly;
          bestMonths = m;
          bestBankName = bank.name;
        }
      }
    }
  }

  return lowest !== Infinity
    ? {
        monthlyEMI: Math.round(lowest),
        months: bestMonths,
        bankName: bestBankName,
      }
    : null;
}

export default function ProductEMICalculator({
  price,
  productName,
  className = "",
  onClose,
}: ProductEMICalculatorProps) {
  const [selectedBankId, setSelectedBankId] = useState<string>("citybank");
  const [selectedMonths, setSelectedMonths] = useState<number>(12);
  const [showAllTenures, setShowAllTenures] = useState<boolean>(false);

  const isEligible = price >= 5000;

  // Selected bank details
  const selectedBank = useMemo<SupportedBank>(() => {
    return (
      supportedBanks.find((b) => b.id === selectedBankId) || supportedBanks[0]
    );
  }, [selectedBankId]);

  // Available tenures for selected bank
  const availableTenures = useMemo<number[]>(() => {
    return getBankAvailableTenures(selectedBankId);
  }, [selectedBankId]);

  // Safe selected months
  const activeMonths = useMemo(() => {
    if (availableTenures.includes(selectedMonths)) {
      return selectedMonths;
    }
    return availableTenures[availableTenures.length - 1] || 12;
  }, [availableTenures, selectedMonths]);

  // Calculations for current selection
  const calculation = useMemo(() => {
    return calculateProductEMI(price, selectedBankId, activeMonths);
  }, [price, selectedBankId, activeMonths]);

  // Lowest EMI summary
  const lowestEMI = useMemo(() => getLowestMonthlyEMI(price), [price]);

  // Bank availability rule
  const bankRule = useMemo(() => {
    return bankEMIAvailability.find((b) => b.bankId === selectedBankId);
  }, [selectedBankId]);

  // Popular banks list
  const featuredBanks = useMemo(() => {
    return supportedBanks.filter((b) => FEATURED_BANK_IDS.includes(b.id));
  }, []);

  const handleBankChange = (bankId: string) => {
    setSelectedBankId(bankId);
    const tenures = getBankAvailableTenures(bankId);
    if (!tenures.includes(selectedMonths)) {
      setSelectedMonths(tenures[Math.min(3, tenures.length - 1)] || tenures[0]);
    }
  };

  return (
    <div
      className={`rounded-2xl border border-border bg-card p-5 sm:p-7 md:p-8 ${className}`}
    >
      {/* Header */}
      <div className="flex flex-col gap-3 pb-6 border-b border-border/70 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <CreditCard className="h-4 w-4" />
            </span>
            <h3 className="text-lg font-bold text-foreground sm:text-xl">
              EMI Calculator & Plans
            </h3>
          </div>
          <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
            Check equated monthly installments across 19+ partner banks
          </p>
        </div>

        <div className="flex items-center gap-2 sm:self-auto self-start">
          {lowestEMI && isEligible && (
            <div className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/5 px-3 py-1.5 text-xs font-semibold text-primary">
              <Sparkles className="h-3.5 w-3.5 shrink-0" />
              <span>
                EMI Starts from{" "}
                <strong className="font-bold">
                  ৳ {lowestEMI.monthlyEMI.toLocaleString()}
                </strong>
                /mo
              </span>
            </div>
          )}

          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-xl border border-border bg-secondary/50 text-muted-foreground transition hover:border-border/80 hover:bg-secondary hover:text-foreground cursor-pointer"
              aria-label="Close EMI calculator"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {!isEligible ? (
        <div className="mt-6 rounded-xl border border-dashed border-amber-300 bg-amber-50/70 p-5 text-center text-xs text-amber-800 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-300">
          <Info className="mx-auto mb-2 h-5 w-5 text-amber-600 dark:text-amber-400" />
          <p className="font-semibold">Minimum purchase for EMI is ৳ 5,000</p>
          <p className="mt-1 text-muted-foreground">
            This product is currently below the minimum qualifying price for EMI
            facility.
          </p>
        </div>
      ) : (
        <div className="mt-6 space-y-6">
          {/* Step 1: Bank Selection */}
          <div>
            <div className="mb-2.5 flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                1. Select Bank
              </label>

              {/* All Banks dropdown */}
              <div className="relative">
                <select
                  value={selectedBankId}
                  onChange={(e) => handleBankChange(e.target.value)}
                  className="h-8 cursor-pointer rounded-lg border border-border bg-secondary/50 px-2.5 pr-7 text-xs font-semibold text-foreground transition hover:bg-secondary focus:outline-none focus:ring-1 focus:ring-primary"
                  aria-label="Select from all partner banks"
                >
                  <option disabled value="">
                    All 19 Banks
                  </option>
                  {supportedBanks.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-2 top-2.5 h-3 w-3 text-muted-foreground" />
              </div>
            </div>

            {/* Quick Bank Pills */}
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-6">
              {featuredBanks.map((b) => {
                const isSelected = b.id === selectedBankId;
                return (
                  <button
                    key={b.id}
                    type="button"
                    onClick={() => handleBankChange(b.id)}
                    className={`group relative flex flex-col items-center justify-center gap-1.5 rounded-xl border p-2.5 text-center transition-all duration-200 cursor-pointer ${
                      isSelected
                        ? "border-primary bg-primary/5 shadow-xs ring-1 ring-primary"
                        : "border-border/80 bg-card hover:border-primary/40 hover:bg-secondary/40"
                    }`}
                  >
                    <div className="relative h-6 w-full max-w-16">
                      {b.logoPath ? (
                        <Image
                          src={b.logoPath}
                          alt={b.name}
                          fill
                          className="object-contain"
                          sizes="64px"
                        />
                      ) : (
                        <Building2 className="mx-auto h-5 w-5 text-muted-foreground" />
                      )}
                    </div>
                    <span
                      className={`line-clamp-1 text-[0.7rem] font-semibold leading-tight ${
                        isSelected
                          ? "text-primary"
                          : "text-foreground group-hover:text-primary"
                      }`}
                    >
                      {b.name.replace(/ Limited| Bank/gi, "")}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Selected bank info & supported card types */}
            <div className="mt-3 flex flex-wrap items-center justify-between gap-2 rounded-xl bg-secondary/30 px-3.5 py-2 text-xs">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-foreground">
                  {selectedBank.name}
                </span>
                {bankRule?.maxPurchase && (
                  <span className="text-[0.68rem] text-muted-foreground">
                    (Max ৳{bankRule.maxPurchase.toLocaleString()})
                  </span>
                )}
              </div>

              <div className="flex items-center gap-1.5">
                <span className="text-[0.7rem] text-muted-foreground">
                  Accepted:
                </span>
                {selectedBank.visa && (
                  <span className="rounded-md border border-border bg-card px-1.5 py-0.5 text-[0.65rem] font-bold text-blue-600 shadow-2xs">
                    VISA
                  </span>
                )}
                {selectedBank.mastercard && (
                  <span className="rounded-md border border-border bg-card px-1.5 py-0.5 text-[0.65rem] font-bold text-amber-600 shadow-2xs">
                    Mastercard
                  </span>
                )}
                {selectedBank.amex && (
                  <span className="rounded-md border border-border bg-card px-1.5 py-0.5 text-[0.65rem] font-bold text-cyan-600 shadow-2xs">
                    AMEX
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Step 2: Tenure Selection */}
          <div>
            <div className="mb-2.5 flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                2. Select Tenure
              </label>
              <span className="text-[0.7rem] text-muted-foreground">
                {availableTenures.length} tenures available for this bank
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-7">
              {availableTenures.map((m) => {
                const isSelected = m === activeMonths;
                const quickCalc = calculateProductEMI(price, selectedBankId, m);
                return (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setSelectedMonths(m)}
                    className={`flex flex-col items-center justify-center rounded-xl border p-2.5 text-center transition-all duration-200 cursor-pointer ${
                      isSelected
                        ? "border-primary bg-primary text-primary-foreground shadow-sm"
                        : "border-border/80 bg-card hover:border-primary/40 hover:bg-secondary/40"
                    }`}
                  >
                    <span
                      className={`text-xs font-bold ${
                        isSelected ? "text-primary-foreground" : "text-foreground"
                      }`}
                    >
                      {m} Months
                    </span>
                    <span
                      className={`mt-0.5 text-[0.68rem] ${
                        isSelected
                          ? "text-primary-foreground/90 font-medium"
                          : "text-muted-foreground"
                      }`}
                    >
                      ৳{quickCalc.monthlyEMI.toLocaleString()}/mo
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Step 3: Calculation Breakdown Minimal Box */}
          <div className="overflow-hidden rounded-2xl border border-primary/20 bg-linear-to-br from-primary/5 via-card to-secondary/20 p-5 sm:p-6">
            <div className="grid gap-6 md:grid-cols-12 md:items-center">
              {/* Main monthly figure */}
              <div className="space-y-1 md:col-span-5 md:border-r md:border-border/60 md:pr-6">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Monthly Installment
                </span>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-3xl font-black tracking-tight text-foreground sm:text-4xl">
                    ৳ {calculation.monthlyEMI.toLocaleString()}
                  </span>
                  <span className="text-xs font-semibold text-muted-foreground">
                    / month
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Payable for {activeMonths} consecutive months
                </p>
              </div>

              {/* Breakdown metrics */}
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 md:col-span-7">
                <div className="rounded-xl border border-border/60 bg-card/80 p-3">
                  <span className="text-[0.65rem] font-bold uppercase tracking-wider text-muted-foreground">
                    Product Price
                  </span>
                  <p className="mt-1 text-sm font-bold text-foreground">
                    ৳ {price.toLocaleString()}
                  </p>
                </div>

                <div className="rounded-xl border border-border/60 bg-card/80 p-3">
                  <span className="text-[0.65rem] font-bold uppercase tracking-wider text-muted-foreground">
                    Bank Charge ({calculation.ratePercentage}%)
                  </span>
                  <p className="mt-1 text-sm font-bold text-amber-600 dark:text-amber-400">
                    + ৳ {calculation.interestAmount.toLocaleString()}
                  </p>
                </div>

                <div className="rounded-xl border border-border/60 bg-card/80 p-3">
                  <span className="text-[0.65rem] font-bold uppercase tracking-wider text-muted-foreground">
                    Total Payable
                  </span>
                  <p className="mt-1 text-sm font-bold text-foreground">
                    ৳ {calculation.totalAmount.toLocaleString()}
                  </p>
                </div>

                <div className="rounded-xl border border-border/60 bg-card/80 p-3">
                  <span className="text-[0.65rem] font-bold uppercase tracking-wider text-muted-foreground">
                    Principal / Mo
                  </span>
                  <p className="mt-1 text-sm font-bold text-foreground">
                    ৳ {calculation.principalPerMonth.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            {/* Toggle full tenure table */}
            <div className="mt-5 border-t border-border/60 pt-4 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setShowAllTenures(!showAllTenures)}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary transition hover:underline cursor-pointer"
              >
                {showAllTenures ? (
                  <>
                    <ChevronUp className="h-3.5 w-3.5" />
                    Hide all tenures comparison for {selectedBank.name}
                  </>
                ) : (
                  <>
                    <ChevronDown className="h-3.5 w-3.5" />
                    Compare all {availableTenures.length} tenure plans for{" "}
                    {selectedBank.name}
                  </>
                )}
              </button>

              <div className="flex items-center gap-1.5 text-[0.7rem] text-muted-foreground">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                <span>SSLCOMMERZ Verified</span>
              </div>
            </div>

            {/* Expandable comparison table */}
            {showAllTenures && (
              <div className="mt-4 overflow-x-auto rounded-xl border border-border bg-card">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-border bg-secondary/50 font-bold text-muted-foreground">
                      <th className="p-3">Tenure</th>
                      <th className="p-3">Bank Rate</th>
                      <th className="p-3">Monthly EMI</th>
                      <th className="p-3">Total Charge</th>
                      <th className="p-3">Total Payable</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {availableTenures.map((m) => {
                      const rowCalc = calculateProductEMI(
                        price,
                        selectedBankId,
                        m,
                      );
                      const isCurrent = m === activeMonths;
                      return (
                        <tr
                          key={m}
                          className={`transition hover:bg-secondary/30 ${
                            isCurrent ? "bg-primary/5 font-semibold" : ""
                          }`}
                        >
                          <td className="p-3 text-foreground flex items-center gap-1.5">
                            {isCurrent && (
                              <Check className="h-3 w-3 text-primary" />
                            )}
                            {m} Months
                          </td>
                          <td className="p-3 text-muted-foreground">
                            {rowCalc.ratePercentage}%
                          </td>
                          <td className="p-3 font-bold text-foreground">
                            ৳ {rowCalc.monthlyEMI.toLocaleString()}
                          </td>
                          <td className="p-3 text-amber-600 dark:text-amber-400">
                            +৳ {rowCalc.interestAmount.toLocaleString()}
                          </td>
                          <td className="p-3 text-foreground">
                            ৳ {rowCalc.totalAmount.toLocaleString()}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Minimal Footnote & Policy Link */}
          <div className="flex flex-col gap-2 rounded-xl bg-secondary/20 p-3.5 text-[0.7rem] text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-secondary text-foreground">
                ℹ
              </span>
              <span>
                EMI facility is exclusively available for credit cards. Select EMI
                option at checkout via SSLCOMMERZ gateway.
              </span>
            </div>
            <Link
              href="/EMI"
              className="font-bold text-primary hover:underline shrink-0"
            >
              Full EMI Terms & FAQ →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
