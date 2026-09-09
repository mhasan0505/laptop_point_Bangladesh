"use client";

import {
  emiInterestRates,
  emiOptions,
  getEMIRate,
  supportedBanks,
} from "@/app/data/emi-config";
import { Calculator, ChevronDown, Lock, TrendingDown, Zap } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

const EMIPage = () => {
  const [activeTab, setActiveTab] = useState<
    "calculator" | "rates" | "banks" | "faq"
  >("calculator");
  const [selectedBank, setSelectedBank] = useState<string>("scb");
  const [amount, setAmount] = useState<number>(50000);
  const [months, setMonths] = useState<number>(12);
  const [expandedFAQ, setExpandedFAQ] = useState<string | null>(null);

  // EMI Calculation
  const calculateEMI = () => {
    const monthlyRate = getEMIRate(
      selectedBank === "lankabangla"
        ? "lankaBangla"
        : selectedBank === "citybank"
          ? "forAllBanks"
          : "forAllBanks",
      months,
    );

    if (!monthlyRate) return null;

    const rate = monthlyRate / 100;
    const principalPerMonth = amount / months;
    const interestPerMonth = (amount * rate) / months;
    const totalEMI = principalPerMonth + interestPerMonth;
    const totalAmount = totalEMI * months;
    const totalInterest = totalAmount - amount;

    return {
      monthlyEMI: totalEMI,
      totalAmount,
      totalInterest,
      interestRate: monthlyRate,
    };
  };

  const emiDetails = calculateEMI();
  const selectedBankDetails = supportedBanks.find(
    (bank) => bank.id === selectedBank,
  );
  const featuredBanks = supportedBanks.filter((bank) =>
    ["scb", "lankabangla", "citybank", "brac", "dbbl", "ebl"].includes(bank.id),
  );

  const faqs = [
    {
      question: "What is EMI?",
      answer:
        "EMI (Equated Monthly Installment) allows you to purchase laptops by paying in equal monthly installments. It's a convenient way to buy expensive items without paying the full amount upfront.",
    },
    {
      question: "What's the minimum purchase amount for EMI?",
      answer:
        "The minimum purchase amount for EMI is ৳5,000 across all banks and payment plans.",
    },
    {
      question: "Which payment cards are supported?",
      answer:
        "We support Visa, Mastercard, and American Express (Amex) through different banks. Check the supported banks section to see which cards your bank accepts.",
    },
    {
      question: "Can I increase my EMI tenure?",
      answer:
        "Yes, we offer EMI options from 3 months up to 36 months depending on your bank. Longer tenures mean lower monthly payments but higher total interest.",
    },
    {
      question: "How do I apply for EMI?",
      answer:
        "During checkout, select your preferred bank and EMI tenure. You'll be redirected to the SSLCOMMERZ payment gateway to complete the EMI process.",
    },
    {
      question: "Are there any hidden charges?",
      answer:
        "No, the interest rate shown in the calculator is the only additional cost. The total amount you'll pay is the principal + interest displayed.",
    },
  ];

  return (
    <div className="min-h-screen bg-linear-to-b from-slate-50 via-white to-slate-50">
      {/* Hero Section */}
      <section className="border-b border-slate-200 bg-white py-16 md:py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl">
            <div className="mb-4 flex items-center gap-2">
              <div className="h-1 w-8 bg-yellow-400"></div>
              <span className="text-sm font-semibold tracking-wide text-yellow-600">
                FLEXIBLE PAYMENT PLANS
              </span>
            </div>
            <h1 className="mb-6 text-5xl font-bold leading-tight text-gray-900 md:text-6xl">
              Own Your Laptop Today,
              <span className="block text-yellow-500">
                Pay Comfortably Later
              </span>
            </h1>
            <p className="mb-8 text-xl text-gray-600">
              Spread your laptop purchase across 3 to 36 months with competitive
              interest rates from 19+ trusted banks. No hidden charges.
              Transparent pricing. Instant approval.
            </p>

            {/* Trust Badges */}
            <div className="flex flex-wrap gap-6">
              <div className="flex items-center gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
                  <Lock className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">
                    Secure Process
                  </p>
                  <p className="text-xs text-gray-500">SSLCommerz verified</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                  <TrendingDown className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">
                    Competitive Rates
                  </p>
                  <p className="text-xs text-gray-500">From 3.5% onwards</p>
                </div>
              </div>
            </div>

            <div className="mt-8 rounded-2xl border border-slate-200 bg-slate-50 p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
                Supported banking partners
              </p>
              <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
                {featuredBanks.map((bank) => (
                  <div
                    key={bank.id}
                    className="flex h-20 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 shadow-sm"
                  >
                    {bank.logoPath ? (
                      <Image
                        src={bank.logoPath}
                        alt={bank.name}
                        width={140}
                        height={48}
                        className="max-h-10 w-auto object-contain"
                      />
                    ) : (
                      <span className="text-center text-xs font-semibold text-slate-500">
                        {bank.name}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-12">
          <h2 className="text-center text-sm font-semibold tracking-widest text-gray-500">
            POWERFUL CALCULATOR
          </h2>
          <p className="mt-2 text-center text-3xl font-bold text-gray-900">
            Calculate Your Perfect Plan
          </p>
        </div>

        {/* Navigation Tabs - Premium Style */}
        <div className="mb-12 flex flex-wrap gap-1 border-b-2 border-slate-200">
          {[
            {
              id: "calculator" as const,
              label: "Calculator",
              icon: Calculator,
            },
            { id: "rates" as const, label: "Interest Rates", icon: Zap },
            { id: "banks" as const, label: "19+ Banks", icon: ChevronDown },
            { id: "faq" as const, label: "Questions", icon: ChevronDown },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative px-6 py-4 font-semibold transition-all duration-200 ${
                activeTab === tab.id
                  ? "text-yellow-600"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <span className="flex items-center gap-2">
                <tab.icon className="h-4 w-4" />
                {tab.label}
              </span>
              {activeTab === tab.id && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-yellow-400"></div>
              )}
            </button>
          ))}
        </div>

        {/* Calculator Tab - Premium Layout */}
        {activeTab === "calculator" && (
          <div className="grid gap-12 lg:grid-cols-3">
            {/* Input Form - Wider on mobile, narrower on desktop */}
            <div className="lg:col-span-1 rounded-2xl bg-white p-8 shadow-sm ring-1 ring-slate-200">
              <h3 className="mb-8 text-xl font-bold text-gray-900">
                Build Your Plan
              </h3>

              {/* Bank Selection */}
              <div className="mb-8">
                <label className="mb-3 block text-sm font-semibold text-gray-700">
                  Which bank do you prefer?
                </label>
                {selectedBankDetails?.logoPath && (
                  <div className="mb-3 flex h-20 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 shadow-sm">
                    <Image
                      src={selectedBankDetails.logoPath}
                      alt={selectedBankDetails.name}
                      width={170}
                      height={56}
                      className="max-h-12 w-auto object-contain"
                    />
                  </div>
                )}
                <select
                  value={selectedBank}
                  onChange={(e) => setSelectedBank(e.target.value)}
                  className="w-full rounded-xl border-2 border-slate-200 px-4 py-3 text-gray-900 transition-colors focus:border-yellow-400 focus:outline-none"
                >
                  {supportedBanks.map((bank) => (
                    <option key={bank.id} value={bank.id}>
                      {bank.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Amount Input */}
              <div className="mb-8">
                <div className="mb-3 flex items-baseline justify-between">
                  <label className="text-sm font-semibold text-gray-700">
                    Laptop Budget
                  </label>
                  <span className="text-2xl font-bold text-yellow-600">
                    ৳{amount.toLocaleString()}
                  </span>
                </div>
                <input
                  type="range"
                  min="5000"
                  max="500000"
                  step="1000"
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className="mb-4 w-full accent-yellow-400"
                />
                <div className="flex gap-3">
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) =>
                      setAmount(Math.max(5000, Number(e.target.value)))
                    }
                    className="flex-1 rounded-lg border-2 border-slate-200 px-3 py-2 text-sm transition-colors focus:border-yellow-400 focus:outline-none"
                    min="5000"
                  />
                  <span className="flex items-center text-sm text-gray-500">
                    min ৳5k
                  </span>
                </div>
              </div>

              {/* Months Selection */}
              <div className="mb-8">
                <label className="mb-3 block text-sm font-semibold text-gray-700">
                  Choose your tenure
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {emiOptions.map((option) => (
                    <button
                      key={option.months}
                      onClick={() => setMonths(option.months)}
                      className={`rounded-lg py-2.5 text-xs font-bold transition-all ${
                        months === option.months
                          ? "bg-yellow-400 text-gray-900 shadow-md"
                          : "border-2 border-slate-200 text-gray-700 hover:border-yellow-300"
                      }`}
                    >
                      {option.months}m
                    </button>
                  ))}
                </div>
              </div>

              {/* Info Box */}
              <div className="rounded-lg bg-blue-50 p-4 text-xs leading-relaxed text-blue-700">
                <p className="font-semibold">✓ No hidden charges</p>
                <p className="mt-1">
                  Interest is calculated once and included in your monthly
                  payment.
                </p>
              </div>
            </div>

            {/* Result Cards - Two Column */}
            <div className="lg:col-span-2 space-y-4">
              {emiDetails ? (
                <>
                  {/* Main EMI Result - Large and Bold */}
                  <div className="rounded-2xl bg-linear-to-br from-yellow-400 via-yellow-500 to-amber-500 p-10 text-white shadow-lg">
                    <p className="text-sm font-semibold uppercase tracking-widest opacity-90">
                      Your Monthly Payment
                    </p>
                    <p className="mt-6 text-6xl font-bold">
                      ৳{Math.round(emiDetails.monthlyEMI).toLocaleString()}
                    </p>
                    <p className="mt-4 text-base opacity-95">
                      for {months} months at{" "}
                      {emiDetails.interestRate.toFixed(2)}% annual interest
                    </p>
                  </div>

                  {/* Breakdown Cards */}
                  <div className="grid gap-4 sm:grid-cols-3">
                    <div className="rounded-xl bg-slate-50 p-6 ring-1 ring-slate-200">
                      <p className="text-xs font-semibold uppercase text-gray-500">
                        Principal
                      </p>
                      <p className="mt-3 text-2xl font-bold text-gray-900">
                        ৳{amount.toLocaleString()}
                      </p>
                    </div>
                    <div className="rounded-xl bg-orange-50 p-6 ring-1 ring-orange-100">
                      <p className="text-xs font-semibold uppercase text-orange-600">
                        Total Interest
                      </p>
                      <p className="mt-3 text-2xl font-bold text-orange-600">
                        ৳{Math.round(emiDetails.totalInterest).toLocaleString()}
                      </p>
                    </div>
                    <div className="rounded-xl bg-green-50 p-6 ring-1 ring-green-100">
                      <p className="text-xs font-semibold uppercase text-green-700">
                        You Pay Total
                      </p>
                      <p className="mt-3 text-2xl font-bold text-green-600">
                        ৳{Math.round(emiDetails.totalAmount).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  {/* CTA Button */}
                  <button className="w-full rounded-xl bg-green-500 py-4 font-bold text-white shadow-md transition-all hover:bg-green-600 hover:shadow-lg active:scale-95">
                    Proceed to Checkout →
                  </button>

                  {/* Reassurance Text */}
                  <p className="text-center text-xs text-gray-500">
                    Instant approval • Secure payment • 19+ banks available
                  </p>
                </>
              ) : (
                <div className="rounded-xl bg-red-50 p-8 text-center ring-1 ring-red-100">
                  <p className="text-red-600 font-semibold">
                    EMI not available for this combination
                  </p>
                  <p className="text-xs text-red-500 mt-2">
                    Try adjusting the bank or tenure
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Interest Rates Tab - Premium Tables */}
        {activeTab === "rates" && (
          <div className="space-y-8">
            <div className="mb-8">
              <h2 className="text-sm font-semibold tracking-widest text-gray-500">
                RATE COMPARISON
              </h2>
              <p className="mt-2 text-2xl font-bold text-gray-900">
                See all available interest rates
              </p>
            </div>

            {/* Standard Chartered */}
            <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
              <div className="flex items-center gap-3 border-b border-slate-100 bg-linear-to-r from-blue-50 to-transparent px-8 py-6">
                <div className="flex h-12 w-20 items-center justify-center rounded-xl bg-white px-3 ring-1 ring-blue-100">
                  <Image
                    src="/bank_logo/standard_chartert.png"
                    alt="Standard Chartered Bank"
                    width={96}
                    height={32}
                    className="max-h-7 w-auto object-contain"
                  />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">
                    Standard Chartered Bank
                  </h3>
                  <p className="text-xs text-gray-500">
                    Competitive rates for all tenures
                  </p>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50">
                      {emiOptions.map((opt) => (
                        <th
                          key={opt.months}
                          className="px-4 py-4 text-center text-xs font-bold uppercase text-gray-600"
                        >
                          {opt.label}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      {emiOptions.map((opt) => (
                        <td
                          key={opt.months}
                          className="border-t border-slate-100 px-4 py-4 text-center text-lg font-bold text-gray-900"
                        >
                          {emiInterestRates.standardChartered[
                            opt.months as keyof typeof emiInterestRates.standardChartered
                          ]?.toFixed(2) || "-"}
                          <span className="text-xs text-gray-400">%</span>
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Lanka Bangla */}
            <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
              <div className="flex items-center gap-3 border-b border-slate-100 bg-linear-to-r from-green-50 to-transparent px-8 py-6">
                <div className="flex h-12 w-20 items-center justify-center rounded-xl bg-white px-3 ring-1 ring-green-100">
                  <Image
                    src="/bank_logo/lanka_bangla.png"
                    alt="Lanka Bangla Bank"
                    width={96}
                    height={32}
                    className="max-h-7 w-auto object-contain"
                  />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">Lanka Bangla Bank</h3>
                  <p className="text-xs text-gray-500">
                    Special rates for online shoppers
                  </p>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50">
                      {emiOptions.map((opt) => (
                        <th
                          key={opt.months}
                          className="px-4 py-4 text-center text-xs font-bold uppercase text-gray-600"
                        >
                          {opt.label}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      {emiOptions.map((opt) => (
                        <td
                          key={opt.months}
                          className="border-t border-slate-100 px-4 py-4 text-center text-lg font-bold text-gray-900"
                        >
                          {emiInterestRates.lankaBangla[
                            opt.months as keyof typeof emiInterestRates.lankaBangla
                          ]?.toFixed(2) || "-"}
                          <span className="text-xs text-gray-400">%</span>
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* For All Banks */}
            <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
              <div className="flex items-center gap-3 border-b border-slate-100 bg-linear-to-r from-purple-50 to-transparent px-8 py-6">
                <div className="flex -space-x-3">
                  {supportedBanks
                    .filter(
                      (bank) =>
                        ["citybank", "brac", "dbbl"].includes(bank.id) &&
                        bank.logoPath,
                    )
                    .map((bank) => (
                      <div
                        key={bank.id}
                        className="flex h-12 w-16 items-center justify-center rounded-xl border border-white bg-white px-2 shadow-sm"
                      >
                        <Image
                          src={bank.logoPath!}
                          alt={bank.name}
                          width={72}
                          height={24}
                          className="max-h-6 w-auto object-contain"
                        />
                      </div>
                    ))}
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">All Other Banks</h3>
                  <p className="text-xs text-gray-500">
                    Standard EMI rates for remaining banks
                  </p>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50">
                      {emiOptions.map((opt) => (
                        <th
                          key={opt.months}
                          className="px-4 py-4 text-center text-xs font-bold uppercase text-gray-600"
                        >
                          {opt.label}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      {emiOptions.map((opt) => (
                        <td
                          key={opt.months}
                          className="border-t border-slate-100 px-4 py-4 text-center text-lg font-bold text-gray-900"
                        >
                          {emiInterestRates.forAllBanks[
                            opt.months as keyof typeof emiInterestRates.forAllBanks
                          ]?.toFixed(2) || "-"}
                          <span className="text-xs text-gray-400">%</span>
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Supported Banks Tab - Premium Grid */}
        {activeTab === "banks" && (
          <div className="space-y-8">
            <div className="mb-8">
              <h2 className="text-sm font-semibold tracking-widest text-gray-500">
                YOUR CHOICES
              </h2>
              <p className="mt-2 text-2xl font-bold text-gray-900">
                19+ trusted banks, all verified
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {supportedBanks.map((bank) => (
                <div
                  key={bank.id}
                  className="group rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-200 transition-all hover:shadow-md hover:ring-yellow-200"
                >
                  <div className="mb-4 flex items-start justify-between">
                    <div className="flex min-w-0 items-start gap-4">
                      <div className="flex h-16 w-24 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white px-3 shadow-sm">
                        {bank.logoPath ? (
                          <Image
                            src={bank.logoPath}
                            alt={bank.name}
                            width={112}
                            height={44}
                            className="max-h-10 w-auto object-contain"
                          />
                        ) : (
                          <span className="text-xs font-bold uppercase tracking-wide text-slate-500">
                            {bank.name
                              .split(" ")
                              .slice(0, 2)
                              .map((part) => part[0])
                              .join("")}
                          </span>
                        )}
                      </div>
                      <h3 className="font-bold text-gray-900">{bank.name}</h3>
                    </div>
                    <span className="inline-block rounded-full bg-green-100 px-2 py-1 text-xs font-semibold text-green-700">
                      {bank.status}
                    </span>
                  </div>

                  {/* Payment Methods */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-3">
                      <div
                        className={`flex h-10 w-24 items-center justify-center rounded-lg border bg-white px-3 ${
                          bank.visa
                            ? "border-slate-200"
                            : "border-slate-100 opacity-45 saturate-0"
                        }`}
                      >
                        <Image
                          src="/bank_logo/visa_logo.png"
                          alt="Visa"
                          width={70}
                          height={22}
                          className="h-auto w-auto max-h-5 object-contain"
                        />
                      </div>
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                          bank.visa
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        {bank.visa ? "Available" : "Not available"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <div
                        className={`flex h-10 w-24 items-center justify-center rounded-lg border bg-white px-3 ${
                          bank.mastercard
                            ? "border-slate-200"
                            : "border-slate-100 opacity-45 saturate-0"
                        }`}
                      >
                        <Image
                          src="/bank_logo/mastercard_logo.png"
                          alt="Mastercard"
                          width={70}
                          height={22}
                          className="h-auto w-auto max-h-5 object-contain"
                        />
                      </div>
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                          bank.mastercard
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        {bank.mastercard ? "Available" : "Not available"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <div
                        className={`flex h-10 w-24 items-center justify-center rounded-lg border bg-white px-3 ${
                          bank.amex
                            ? "border-slate-200"
                            : "border-slate-100 opacity-45 saturate-0"
                        }`}
                      >
                        <Image
                          src="/bank_logo/american_express_logo.png"
                          alt="American Express"
                          width={70}
                          height={22}
                          className="h-auto w-auto max-h-5 object-contain"
                        />
                      </div>
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                          bank.amex
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        {bank.amex ? "Available" : "Not available"}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* FAQ Tab - Premium Accordion */}
        {activeTab === "faq" && (
          <div className="space-y-8">
            <div className="mb-8">
              <h2 className="text-sm font-semibold tracking-widest text-gray-500">
                COMMON QUESTIONS
              </h2>
              <p className="mt-2 text-2xl font-bold text-gray-900">
                Everything you should know about EMI
              </p>
            </div>

            <div className="space-y-4">
              {faqs.map((faq) => (
                <button
                  key={faq.question}
                  onClick={() =>
                    setExpandedFAQ(expandedFAQ === faq.question ? null : faq.question)
                  }
                  className="w-full text-left"
                >
                  <div className="flex w-full items-center justify-between rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-200 transition-all hover:ring-yellow-200">
                    <h3 className="pr-4 font-semibold text-gray-900">
                      {faq.question}
                    </h3>
                    <ChevronDown
                      className={`h-5 w-5 shrink-0 text-gray-400 transition-transform duration-300 ${
                        expandedFAQ === faq.question ? "rotate-180" : ""
                      }`}
                    />
                  </div>
                  {expandedFAQ === faq.question && (
                    <div className="mt-2 rounded-lg bg-blue-50 p-6 text-gray-700 leading-relaxed text-sm border-l-4 border-blue-400">
                      {faq.answer}
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Bottom Info Section - Premium Cards */}
        <div className="mt-20 border-t border-slate-200 pt-20">
          <div className="mb-12 text-center">
            <h2 className="text-sm font-semibold tracking-widest text-gray-500">
              WHY CHOOSE EMI
            </h2>
            <p className="mt-2 text-3xl font-bold text-gray-900">
              Smart payment. Smart shopping.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {/* Flexible Card */}
            <div className="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-slate-200">
              <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-xl bg-blue-100">
                <span className="text-2xl">💳</span>
              </div>
              <h3 className="mb-3 text-lg font-bold text-gray-900">
                Flexible Terms
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Choose from 3 to 36 months. Find the payment plan that fits your
                budget perfectly.
              </p>
            </div>

            {/* Multiple Banks Card */}
            <div className="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-slate-200">
              <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-xl bg-green-100">
                <span className="text-2xl">🏦</span>
              </div>
              <h3 className="mb-3 text-lg font-bold text-gray-900">
                19+ Banks
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Your choice of bank. Compare rates and pick the one that works
                best for you.
              </p>
            </div>

            {/* Transparent Card */}
            <div className="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-slate-200">
              <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-xl bg-purple-100">
                <span className="text-2xl">✅</span>
              </div>
              <h3 className="mb-3 text-lg font-bold text-gray-900">
                Complete Transparency
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                No surprises. Interest calculated once. Everything laid out
                clearly from day one.
              </p>
            </div>
          </div>
        </div>

        {/* CTA Footer */}
        <div className="mt-16 rounded-2xl bg-linear-to-r from-yellow-50 to-amber-50 p-12 text-center ring-1 ring-yellow-100">
          <h2 className="text-2xl font-bold text-gray-900">
            Ready to own your laptop?
          </h2>
          <p className="mt-3 text-gray-600">
            Use the calculator above to find your perfect plan, then checkout
            with your preferred bank.
          </p>
          <button
            onClick={() => setActiveTab("calculator")}
            className="mt-6 rounded-xl bg-yellow-400 px-8 py-3 font-bold text-gray-900 transition-all hover:bg-yellow-500 active:scale-95"
          >
            Start Calculating →
          </button>
        </div>
      </div>
    </div>
  );
};

export default EMIPage;
