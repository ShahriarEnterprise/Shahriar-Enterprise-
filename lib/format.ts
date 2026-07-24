const bnDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯']

export function toBn(input: number | string): string {
  return String(input).replace(/[0-9]/g, (d) => bnDigits[Number(d)])
}

export function bdt(amount: number): string {
  const rounded = Math.round(amount)
  const formatted = Math.abs(rounded).toLocaleString('en-US')
  return `৳${toBn(formatted)}`
}

export function bnNumber(n: number): string {
  return toBn(n.toLocaleString('en-US'))
}

const bnMonths = [
  'জানু', 'ফেব', 'মার্চ', 'এপ্রিল', 'মে', 'জুন',
  'জুলাই', 'আগস্ট', 'সেপ্ট', 'অক্টো', 'নভে', 'ডিসে',
]

export function bnDate(iso: string): string {
  const d = new Date(iso)
  return `${toBn(d.getDate())} ${bnMonths[d.getMonth()]}, ${toBn(d.getFullYear())}`
}

export function bnRelative(iso: string): string {
  const d = new Date(iso)
  const now = new Date()
  const diffDays = Math.floor(
    (new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime() -
      new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime()) /
      86400000,
  )
  if (diffDays === 0) return 'আজ'
  if (diffDays === 1) return 'গতকাল'
  if (diffDays < 7) return `${toBn(diffDays)} দিন আগে`
  return bnDate(iso)
}
