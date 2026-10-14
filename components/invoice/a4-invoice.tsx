'use client'

import Image from 'next/image'
import Barcode from 'react-barcode'

type NumericLike = number | string | { toString(): string }

type InvoiceParty = {
  name: string
  slogan?: string | null
  phone?: string | null
  email?: string | null
  address?: string | null
}

type InvoiceLine = {
  id: string
  description: string
  code?: string | null
  quantity: NumericLike
  unitPrice: NumericLike
  discount?: NumericLike
  total: NumericLike
  serials?: string[]
  isGift?: boolean
  parentLineId?: string | null
  specs?: string[]
}

type InvoicePayment = {
  label: string
  amount: NumericLike
  reference?: string | null
  paidAt?: Date | string
}

interface A4InvoiceProps {
  invoiceType:
    | 'SALES INVOICE'
    | 'PURCHASE INVOICE'
    | 'DEBIT NOTE'
    | 'PURCHASE RETURN'
    | (string & {})
  invoiceNumber: string
  invoiceDate: Date | string
  barcodeValue?: string
  seller: InvoiceParty & { website?: string | null }
  billToLabel: string
  billTo: InvoiceParty
  secondaryLabel?: string
  secondaryValue?: string | null
  lines: InvoiceLine[]
  subtotal: NumericLike
  discountTotal?: NumericLike
  shippingCost?: NumericLike
  previousDue?: NumericLike
  newBalance?: NumericLike
  isB2BLinked?: boolean
  currentBill?: NumericLike
  paidAmount?: NumericLike
  balanceDue?: NumericLike
  totalDue?: NumericLike
  grandTotal: NumericLike
  amountInWords?: string
  notes?: string | null
  payments?: InvoicePayment[]
  terms?: string[]
  footerText?: string
}

function toNumber(value: NumericLike | undefined) {
  if (value === undefined) return 0
  return Number(value)
}

function formatMoney(value: NumericLike | undefined) {
  return toNumber(value).toLocaleString('en-BD', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

function formatDate(value: Date | string) {
  const d = new Date(value)
  if (isNaN(d.getTime())) return '—'
  const isUtcMidnight =
    d.getUTCHours() === 0 &&
    d.getUTCMinutes() === 0 &&
    d.getUTCSeconds() === 0 &&
    d.getUTCMilliseconds() === 0

  if (isUtcMidnight) {
    return d.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    })
  }

  return d.toLocaleString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  })
}

function numberToWordsUnder1000(value: number): string {
  const ones = [
    '',
    'One',
    'Two',
    'Three',
    'Four',
    'Five',
    'Six',
    'Seven',
    'Eight',
    'Nine',
    'Ten',
    'Eleven',
    'Twelve',
    'Thirteen',
    'Fourteen',
    'Fifteen',
    'Sixteen',
    'Seventeen',
    'Eighteen',
    'Nineteen',
  ]
  const tens = [
    '',
    '',
    'Twenty',
    'Thirty',
    'Forty',
    'Fifty',
    'Sixty',
    'Seventy',
    'Eighty',
    'Ninety',
  ]

  if (value < 20) return ones[value]
  if (value < 100) {
    return `${tens[Math.floor(value / 10)]}${value % 10 ? ` ${ones[value % 10]}` : ''}`.trim()
  }

  return `${ones[Math.floor(value / 100)]} Hundred${value % 100 ? ` ${numberToWordsUnder1000(value % 100)}` : ''}`.trim()
}

function numberToWords(value: number): string {
  if (!Number.isFinite(value) || value === 0) return 'Zero'

  const scales = [
    { value: 10000000, label: 'Crore' },
    { value: 100000, label: 'Lakh' },
    { value: 1000, label: 'Thousand' },
  ]

  let remainder = Math.floor(value)
  const parts: string[] = []

  for (const scale of scales) {
    if (remainder >= scale.value) {
      const chunk = Math.floor(remainder / scale.value)
      parts.push(`${numberToWordsUnder1000(chunk)} ${scale.label}`)
      remainder %= scale.value
    }
  }

  if (remainder > 0) {
    parts.push(numberToWordsUnder1000(remainder))
  }

  return parts.join(' ').trim()
}

function buildAmountInWords(total: NumericLike): string {
  const numericTotal = toNumber(total)
  const taka = Math.floor(numericTotal)
  const poisha = Math.round((numericTotal - taka) * 100)
  const takaPart = `${numberToWords(taka)} Taka`
  const poishaPart = poisha > 0 ? ` And ${numberToWords(poisha)} Poisha` : ''

  return `${takaPart}${poishaPart} Only`
}

export function A4Invoice({
  invoiceType,
  invoiceNumber,
  invoiceDate,
  barcodeValue,
  seller,
  billToLabel,
  billTo,
  secondaryLabel,
  secondaryValue,
  lines,
  subtotal,
  discountTotal,
  shippingCost,
  previousDue,
  newBalance,
  isB2BLinked,
  currentBill,
  paidAmount,
  balanceDue,
  totalDue,
  grandTotal,
  amountInWords,
  notes,
  payments,
  terms,
  footerText = 'TECH DRIVE, © 2026',
}: A4InvoiceProps) {
  const resolvedWords = amountInWords ?? buildAmountInWords(grandTotal)
  const isCompact = true
  const shouldShowPurchaseDueSummary =
    invoiceType === 'PURCHASE INVOICE' &&
    previousDue !== undefined &&
    currentBill !== undefined &&
    totalDue !== undefined

  return (
    <>
      <style
        dangerouslySetInnerHTML={{
          __html: `
            @page {
              size: A4;
              margin: 8mm;
            }

            @media print {
              html,
              body {
                margin: 0 !important;
                padding: 0 !important;
                height: auto !important;
                overflow: visible !important;
              }

              body {
                background: white;
              }

              .no-print {
                display: none !important;
              }

              .invoice-shell {
                box-shadow: none !important;
                border: none !important;
                margin: 0 !important;
                width: 100% !important;
                max-width: 100% !important;
                min-height: 0 !important;
                height: auto !important;
                max-height: none !important;
                overflow: visible !important;
                font-size: 9.5px !important;
                line-height: 1.2 !important;
                break-inside: auto !important;
                page-break-inside: auto !important;
                break-before: auto !important;
                page-break-before: auto !important;
                break-after: auto !important;
                page-break-after: auto !important;
              }

              .invoice-shell .invoice-signatures,
              .invoice-shell .invoice-payments-block,
              .invoice-shell .invoice-meta,
              .invoice-shell .invoice-billto {
                break-inside: avoid !important;
                page-break-inside: avoid !important;
              }

              .invoice-main-grid {
                grid-template-columns: 108px 1fr 190px !important;
              }

              .invoice-main-grid > div,
              .invoice-meta,
              .invoice-content {
                padding: 8px !important;
              }

              .invoice-title {
                font-size: 14px !important;
                letter-spacing: 0.08em !important;
                padding: 4px 8px !important;
              }

              .invoice-table th,
              .invoice-table td,
              .invoice-payments th,
              .invoice-payments td {
                padding: 2px 4px !important;
              }

              .invoice-signatures {
                margin-top: 24px !important;
                padding-top: 10px !important;
                gap: 32px !important;
              }

              .invoice-signatures .signature-line {
                width: 140px !important;
              }

              .invoice-shell.invoice-compact {
                font-size: 9px !important;
              }

              .invoice-shell.invoice-compact .invoice-main-grid {
                grid-template-columns: 98px 1fr 174px !important;
              }

              .invoice-shell.invoice-compact .invoice-main-grid > div,
              .invoice-shell.invoice-compact .invoice-meta,
              .invoice-shell.invoice-compact .invoice-content,
              .invoice-shell.invoice-compact .invoice-billto {
                padding: 6px !important;
              }

              .invoice-shell.invoice-compact .invoice-title {
                font-size: 16px !important;
                padding: 4px 8px !important;
              }

              .invoice-shell.invoice-compact .invoice-company-name {
                font-size: 14px !important;
              }

              .invoice-shell.invoice-compact .invoice-secondary-value,
              .invoice-shell.invoice-compact .invoice-billto-name {
                font-size: 12px !important;
              }

              .invoice-shell.invoice-compact .invoice-table th,
              .invoice-shell.invoice-compact .invoice-table td,
              .invoice-shell.invoice-compact .invoice-payments th,
              .invoice-shell.invoice-compact .invoice-payments td {
                padding: 1px 3px !important;
              }

              .invoice-shell.invoice-compact .invoice-signatures {
                margin-top: 16px !important;
                padding-top: 6px !important;
                gap: 20px !important;
              }

              .invoice-shell.invoice-compact .invoice-signatures .signature-line {
                width: 120px !important;
              }

              .invoice-payments-block {
                margin-bottom: 18px !important;
              }
            }
          `,
        }}
      />

      <div
        className={`invoice-shell relative mx-auto w-full max-w-[210mm] overflow-hidden bg-white p-4 text-black shadow-[0_2px_16px_rgba(15,23,42,0.10)] ring-1 ring-slate-200/80 print:overflow-visible print:p-0 print:shadow-none print:ring-0 ${
          isCompact ? 'invoice-compact' : ''
        }`}
      >
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="flex -rotate-12 flex-col items-center gap-3 opacity-[0.06]">
            <Image
              src="/logo_icons.png"
              alt="Tech Drive watermark"
              width={220}
              height={220}
              className="h-auto w-44"
            />
            <p className="text-5xl font-extrabold uppercase tracking-[0.35em] text-slate-700">
              Tech Drive
            </p>
          </div>
        </div>

        <div className="relative z-10 flex h-full flex-col border border-slate-200">
          <div className="invoice-main-grid grid grid-cols-[132px_1fr_210px] border-b border-slate-200 bg-white/90">
            <div className="flex items-center justify-center border-r border-slate-200 p-5">
              <Image
                src="/logo_icons.png"
                alt="Tech Drive logo"
                width={96}
                height={96}
                className="h-auto w-20"
                priority
              />
            </div>

            <div className="border-r border-slate-200 p-5">
              <h1 className="invoice-company-name text-[22px] font-extrabold tracking-tight">
                {seller.name}
              </h1>
              {seller.slogan && (
                <p className="text-xs italic text-slate-500 font-medium mt-0.5 leading-normal">
                  {seller.slogan}
                </p>
              )}
              {seller.address && (
                <p className="mt-1 text-sm leading-5 text-slate-700">
                  {seller.address}
                </p>
              )}
              <div className="mt-2 space-y-1 text-sm">
                {seller.phone && (
                  <p>
                    <span className="font-semibold">Phone:</span> {seller.phone}
                  </p>
                )}
                {seller.email && (
                  <p>
                    <span className="font-semibold">Email:</span> {seller.email}
                  </p>
                )}
                {seller.website && (
                  <p>
                    <span className="font-semibold">Web:</span> {seller.website}
                  </p>
                )}
              </div>
            </div>

            <div className="invoice-meta p-5 text-right">
              <div className="mb-2 flex justify-end">
                <Barcode
                  value={barcodeValue ?? invoiceNumber}
                  format="CODE128"
                  width={1.2}
                  height={38}
                  margin={0}
                  displayValue={false}
                />
              </div>
              <p className="text-sm font-semibold">
                Invoice N°: {invoiceNumber}
              </p>
              <p className="text-sm font-semibold">
                Date: {formatDate(invoiceDate)}
              </p>
              {secondaryValue && (
                <div className="mt-3 border-t border-slate-200 pt-3 text-right">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                    {secondaryLabel ?? 'Reference'}
                  </p>
                  <p className="invoice-secondary-value mt-1 text-sm font-bold text-slate-900">
                    {secondaryValue}
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="invoice-title border-b border-slate-200 px-5 py-2 text-center text-[22px] font-extrabold tracking-widest text-slate-900">
            {invoiceType}
          </div>

          <div className="invoice-billto grid grid-cols-1 gap-6 border-b border-slate-200 bg-white/90 px-5 py-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                {billToLabel}
              </p>
              <p className="invoice-billto-name mt-1.5 text-lg font-bold">
                {billTo.name}
              </p>
              {billTo.address && (
                <p className="mt-1 text-sm text-slate-700">{billTo.address}</p>
              )}
              {billTo.phone && (
                <p className="mt-1 text-sm text-slate-700">
                  Phone: {billTo.phone}
                </p>
              )}
              {billTo.email && (
                <p className="mt-1 text-sm text-slate-700">
                  Email: {billTo.email}
                </p>
              )}
            </div>
          </div>

          <div className="invoice-content flex flex-1 flex-col bg-white/85 px-5 py-3">
            <div>
              <table className="invoice-table w-full border-collapse text-[10px]">
                <thead>
                  <tr className="border-y border-red-200 bg-slate-50 text-[9px] uppercase tracking-widest text-slate-600">
                    <th className="w-8 border border-slate-200 px-2 py-1 text-left">
                      N°
                    </th>
                    <th className="border border-slate-200 px-2 py-1 text-left">
                      Description(Code)
                    </th>
                    <th className="w-24 border border-slate-200 px-2 py-1 text-right">
                      Price
                    </th>
                    <th className="w-14 border border-slate-200 px-2 py-1 text-center">
                      Qty
                    </th>
                    <th className="w-14 border border-slate-200 px-2 py-1 text-right">
                      Dis
                    </th>
                    <th className="w-24 border border-slate-200 px-2 py-1 text-right">
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {lines.map((line, index) => (
                    <tr
                      key={line.id}
                      className={`align-top ${line.parentLineId ? 'bg-slate-50/50' : ''}`}
                    >
                      <td className="border border-slate-200 px-2 py-1">
                        {index + 1}
                      </td>
                      <td className="border border-slate-200 px-2 py-1">
                        <div
                          className={`flex items-center gap-1 font-medium ${line.parentLineId ? 'pl-2 text-slate-600' : ''}`}
                        >
                          {line.parentLineId && (
                            <span className="text-slate-400">↳</span>
                          )}
                          {line.description}
                          {line.isGift && (
                            <span className="ml-1 inline-block rounded bg-green-100 px-1 py-0 text-[8px] font-bold uppercase text-green-700">
                              GIFT
                            </span>
                          )}
                        </div>

                        {line.specs &&
                          line.specs.length > 0 &&
                          (() => {
                            const condition = line.specs!.find(
                              s => typeof s === 'string' && s.toLowerCase().startsWith('condition')
                            )
                            return condition ? (
                              <div className="text-[9px] leading-tight text-slate-500">
                                {condition}
                              </div>
                            ) : null
                          })()}
                        {line.serials && line.serials.length > 0 && (
                          <div className="text-[9px] text-slate-500">
                            SN: {line.serials.join(', ')}
                          </div>
                        )}
                      </td>
                      <td className="border border-slate-200 px-2 py-1 text-right font-medium tabular-nums">
                        {line.isGift ? (
                          <span className="text-green-600">৳0.00</span>
                        ) : (
                          formatMoney(line.unitPrice)
                        )}
                      </td>
                      <td className="border border-slate-200 px-2 py-1 text-center tabular-nums">
                        {toNumber(line.quantity)}
                      </td>
                      <td className="border border-slate-200 px-2 py-1 text-right tabular-nums">
                        {toNumber(line.discount) > 0
                          ? formatMoney(line.discount)
                          : '-'}
                      </td>
                      <td className="border border-slate-200 px-2 py-1 text-right font-semibold tabular-nums">
                        {line.isGift ? (
                          <span className="text-green-600">৳0.00</span>
                        ) : (
                          formatMoney(line.total)
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="ml-auto mt-2 w-full max-w-72">
                <div className="grid grid-cols-[1fr_110px] border border-slate-200 text-[10px]">
                  <div className="border-r border-b border-slate-200 px-2 py-1 font-semibold">
                    Sub Total
                  </div>
                  <div className="border-b border-slate-200 px-2 py-1 text-right font-semibold tabular-nums">
                    {formatMoney(subtotal)}
                  </div>

                  {toNumber(discountTotal) > 0 && (
                    <>
                      <div className="border-r border-b border-slate-200 px-2 py-1 font-semibold">
                        Discount
                      </div>
                      <div className="border-b border-slate-200 px-2 py-1 text-right font-semibold tabular-nums">
                        {formatMoney(discountTotal)}
                      </div>
                    </>
                  )}

                  {toNumber(shippingCost) > 0 && (
                    <>
                      <div className="border-r border-b border-slate-200 px-2 py-1 font-semibold">
                        Shipping
                      </div>
                      <div className="border-b border-slate-200 px-2 py-1 text-right font-semibold tabular-nums">
                        {formatMoney(shippingCost)}
                      </div>
                    </>
                  )}

                  <div className="border-r border-b border-slate-200 px-2 py-1 font-semibold">
                    Gross Total
                  </div>
                  <div className="border-b border-slate-200 px-2 py-1 text-right font-semibold tabular-nums">
                    {formatMoney(grandTotal)}
                  </div>

                  {shouldShowPurchaseDueSummary ? (
                    <>
                      <div className="border-r border-b border-slate-200 px-2 py-1 font-semibold">
                        Previous Due
                      </div>
                      <div className="border-b border-slate-200 px-2 py-1 text-right font-semibold tabular-nums">
                        {formatMoney(previousDue)}
                      </div>

                      <div className="border-r border-b border-slate-200 px-2 py-1 font-semibold">
                        Current Bill
                      </div>
                      <div className="border-b border-slate-200 px-2 py-1 text-right font-semibold tabular-nums">
                        {formatMoney(currentBill)}
                      </div>

                      <div className="border-r border-b border-slate-200 px-2 py-1 font-semibold">
                        Paid Amount
                      </div>
                      <div className="border-b border-slate-200 px-2 py-1 text-right font-semibold tabular-nums">
                        {formatMoney(paidAmount)}
                      </div>

                      <div className="border-r border-slate-200 px-2 py-1 font-semibold text-red-700">
                        Total Due
                      </div>
                      <div className="px-2 py-1 text-right font-semibold text-red-700 tabular-nums">
                        {formatMoney(totalDue)}
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="border-r border-b border-slate-200 px-2 py-1 font-semibold">
                        Paid Amount
                      </div>
                      <div className="border-b border-slate-200 px-2 py-1 text-right font-semibold tabular-nums">
                        {formatMoney(paidAmount)}
                      </div>

                      <div className="border-r border-slate-200 px-2 py-1 font-semibold">
                        Outstanding
                      </div>
                      <div className="px-2 py-1 text-right font-semibold tabular-nums">
                        {formatMoney(balanceDue)}
                      </div>
                    </>
                  )}
                </div>
              </div>

              <div className="mt-1 text-[10px] leading-snug">
                <span className="font-semibold">Amount in words:</span>{' '}
                {resolvedWords.toUpperCase()}
              </div>

              {/* Account Running Balance Summary (Visually Distinct) */}
              {(previousDue !== undefined && previousDue !== null || newBalance !== undefined && newBalance !== null) && (
                <div className="mt-3 rounded-md border border-slate-300 bg-slate-50/90 p-3 text-[11px]">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-1.5 font-bold text-slate-800">
                    <span>Account Running Balance Summary</span>
                    {isB2BLinked && (
                      <span className="rounded bg-indigo-100 px-2 py-0.5 text-[9px] font-bold text-indigo-800 border border-indigo-200">
                        Net B2B Balance
                      </span>
                    )}
                  </div>
                  <div className="mt-2 grid grid-cols-3 gap-3 text-center">
                    <div className="rounded border border-slate-200 bg-white p-2">
                      <span className="block text-[9px] font-sans font-semibold text-slate-500 uppercase tracking-wider">Previous Due</span>
                      <span className="mt-0.5 block font-bold text-slate-900 text-xs tabular-nums">
                        ৳{formatMoney(previousDue ?? 0)}
                      </span>
                    </div>
                    <div className="rounded border border-slate-200 bg-white p-2">
                      <span className="block text-[9px] font-sans font-semibold text-slate-500 uppercase tracking-wider">This Invoice</span>
                      <span className="mt-0.5 block font-bold text-slate-900 text-xs tabular-nums">
                        ৳{formatMoney(grandTotal)}
                      </span>
                    </div>
                    <div className="rounded border border-indigo-200 bg-indigo-50/50 p-2">
                      <span className="block text-[9px] font-sans font-semibold text-indigo-700 uppercase tracking-wider">New Balance</span>
                      <span className="mt-0.5 block font-bold text-indigo-900 text-xs tabular-nums">
                        ৳{formatMoney(newBalance ?? (toNumber(previousDue) + toNumber(grandTotal)))}
                      </span>
                    </div>
                  </div>
                  {isB2BLinked && (
                    <p className="mt-1.5 text-[10px] italic text-slate-600">
                      * Note: Running balance reflects Net B2B Balance across combined Customer (A/R) & Supplier (A/P) accounts.
                    </p>
                  )}
                </div>
              )}

              {/* Payment History (Positioned immediately after Account Running Balance Summary) */}
              {payments && payments.length > 0 && (
                <div className="invoice-payments-block mt-3 mb-2">
                  <p className="text-[12px] font-semibold">Payment History</p>
                  <div className="mt-1.5 overflow-hidden rounded-md border border-slate-200">
                    <table className="invoice-payments w-full text-[11px]">
                      <thead>
                        <tr className="bg-slate-50 text-slate-600">
                          <th className="px-3 py-1.5 text-left">Method</th>
                          <th className="px-3 py-1.5 text-left">Reference</th>
                          <th className="px-3 py-1.5 text-left">Date</th>
                          <th className="px-3 py-1.5 text-right">Amount</th>
                        </tr>
                      </thead>
                      <tbody>
                        {payments.map((payment, index) => (
                          <tr
                            key={`${payment.label}-${index}`}
                            className="border-t border-slate-200"
                          >
                            <td className="px-3 py-1.5">{payment.label}</td>
                            <td className="px-3 py-1.5 text-slate-600">
                              {payment.reference ?? '-'}
                            </td>
                            <td className="px-3 py-1.5 text-slate-600">
                              {payment.paidAt
                                ? formatDate(payment.paidAt)
                                : '-'}
                            </td>
                            <td className="px-3 py-1.5 text-right font-medium tabular-nums">
                              {formatMoney(payment.amount)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {notes && (
                <div className="mt-2 rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-[12px] text-slate-700">
                  <span className="font-semibold">Notes:</span> {notes}
                </div>
              )}
            </div>

            <div className="mt-auto pt-6">
              {terms && terms.length > 0 && (
                <div>
                  <p className="text-[12px] font-semibold">
                    Terms & Conditions
                  </p>
                  <ul className="invoice-terms mt-1 list-disc space-y-0.5 pl-5 text-[11px] italic leading-snug text-slate-700">
                    {terms.map(term => (
                      <li key={term}>{term}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="invoice-signatures mt-10 grid grid-cols-2 gap-10 pt-4 text-center text-[10px]">
                <div>
                  <div className="signature-line mx-auto mb-2 w-40 border-t border-slate-500" />
                  Customer Signature
                </div>
                <div>
                  <div className="signature-line mx-auto mb-2 w-40 border-t border-slate-500" />
                  Authorized Signature
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-200 px-5 py-3 text-center text-xs text-slate-500">
            {footerText}
          </div>
        </div>
      </div>
    </>
  )
}
