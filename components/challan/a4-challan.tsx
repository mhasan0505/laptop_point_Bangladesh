'use client'

import Image from 'next/image'
import Barcode from 'react-barcode'

type NumericLike = number | string | { toString(): string }

type ChallanParty = {
  name: string
  slogan?: string | null
  phone?: string | null
  email?: string | null
  address?: string | null
}

type ChallanLine = {
  id: string
  description: string
  code?: string | null
  quantity: NumericLike
  serials?: string[]
  isGift?: boolean
  parentLineId?: string | null
  specs?: string[]
}

interface A4ChallanProps {
  challanTitle?: string
  invoiceNumber: string
  invoiceDate: Date | string
  barcodeValue?: string
  seller: ChallanParty & { website?: string | null }
  billToLabel: string
  billTo: ChallanParty
  secondaryLabel?: string
  secondaryValue?: string | null
  lines: ChallanLine[]
  notes?: string | null
  terms?: string[]
  footerText?: string
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

export function A4Challan({
  challanTitle = 'DELIVERY CHALLAN',
  invoiceNumber,
  invoiceDate,
  barcodeValue,
  seller,
  billToLabel,
  billTo,
  secondaryLabel,
  secondaryValue,
  lines,
  notes,
  terms,
  footerText = 'TECH DRIVE, © 2026',
}: A4ChallanProps) {
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
              body {
                background: white;
              }

              .no-print {
                display: none !important;
              }

              .challan-shell {
                box-shadow: none !important;
                border: none !important;
                margin: 0 !important;
                width: 100% !important;
                max-width: 100% !important;
                font-size: 9.5px !important;
                line-height: 1.2 !important;
              }

              .challan-shell * {
                page-break-inside: avoid;
              }

              .challan-main-grid {
                grid-template-columns: 108px 1fr 190px !important;
              }

              .challan-main-grid > div,
              .challan-meta,
              .challan-content {
                padding: 8px !important;
              }

              .challan-title {
                font-size: 14px !important;
                letter-spacing: 0.08em !important;
                padding: 4px 8px !important;
              }

              .challan-table th,
              .challan-table td {
                padding: 2px 4px !important;
              }

              .challan-signatures {
                margin-top: 24px !important;
                padding-top: 10px !important;
                gap: 32px !important;
              }

              .challan-signatures .signature-line {
                width: 140px !important;
              }
            }
          `,
        }}
      />

      <div className="challan-shell mx-auto w-full max-w-[210mm] bg-white p-4 text-black shadow-[0_2px_16px_rgba(15,23,42,0.10)] ring-1 ring-slate-200/80 print:p-0 print:shadow-none print:ring-0">
        <div className="border border-slate-200">
          {/* Header */}
          <div className="challan-main-grid grid grid-cols-[132px_1fr_210px] border-b border-slate-200">
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
              <h1 className="text-[22px] font-extrabold tracking-tight">
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

            <div className="challan-meta p-5 text-right">
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
                Challan Ref: {invoiceNumber}
              </p>
              <p className="text-sm font-semibold">
                Date: {formatDate(invoiceDate)}
              </p>
            </div>
          </div>

          {/* Title */}
          <div className="challan-title border-b border-slate-200 px-5 py-2 text-center text-[22px] font-extrabold tracking-widest text-slate-900">
            {challanTitle}
          </div>

          {/* Bill To */}
          <div className="grid grid-cols-2 gap-6 border-b border-slate-200 px-5 py-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                {billToLabel}
              </p>
              <p className="mt-1.5 text-lg font-bold">{billTo.name}</p>
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

            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                {secondaryLabel ?? 'Reference'}
              </p>
              <p className="mt-1.5 text-lg font-bold">
                {secondaryValue ?? '-'}
              </p>
            </div>
          </div>

          {/* Items Table — no price columns */}
          <div className="challan-content px-5 py-3">
            <table className="challan-table w-full border-collapse text-[10px]">
              <thead>
                <tr className="border-y border-emerald-200 bg-slate-50 text-[9px] uppercase tracking-widest text-slate-600">
                  <th className="w-8 border border-slate-200 px-2 py-1 text-left">
                    N°
                  </th>
                  <th className="border border-slate-200 px-2 py-1 text-left">
                    Description (Code)
                  </th>
                  <th className="w-14 border border-slate-200 px-2 py-1 text-center">
                    Qty
                  </th>
                  <th className="w-24 border border-slate-200 px-2 py-1 text-left">
                    Serial / IMEI
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
                        className={`font-medium flex items-center gap-1 ${line.parentLineId ? 'pl-2 text-slate-600' : ''}`}
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
                      {line.code && (
                        <div className="text-[9px] text-slate-400">
                          {line.code}
                        </div>
                      )}
                      {line.specs && line.specs.length > 0 && (
                        <div className="text-[9px] text-slate-500 leading-tight">
                          {line.specs.join(' | ')}
                        </div>
                      )}
                    </td>
                    <td className="border border-slate-200 px-2 py-1 text-center font-medium tabular-nums">
                      {Number(line.quantity)}
                    </td>
                    <td className="border border-slate-200 px-2 py-1 text-[9px] text-slate-600">
                      {line.serials && line.serials.length > 0
                        ? line.serials.join(', ')
                        : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {notes && (
              <div className="mt-2 rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-[12px] text-slate-700">
                <span className="font-semibold">Notes:</span> {notes}
              </div>
            )}

            {terms && terms.length > 0 && (
              <div className="mt-3">
                <p className="text-[12px] font-semibold">Terms & Conditions</p>
                <ul className="mt-1 list-disc space-y-0.5 pl-5 text-[11px] italic leading-snug text-slate-700">
                  {terms.map(term => (
                    <li key={term}>{term}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="challan-signatures mt-8 grid grid-cols-2 gap-10 pt-4 text-center text-[10px]">
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

          <div className="border-t border-slate-200 px-5 py-3 text-center text-xs text-slate-500">
            {footerText}
          </div>
        </div>
      </div>
    </>
  )
}
