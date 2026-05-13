const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'EUR',
  maximumFractionDigits: 0,
})

const compactCurrencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'EUR',
  notation: 'compact',
  maximumFractionDigits: 1,
})

const integerFormatter = new Intl.NumberFormat('en-US')

function asNumber(value) {
  if (typeof value === 'number') {
    return value
  }

  if (typeof value === 'string' && value.trim() !== '') {
    return Number(value)
  }

  return 0
}

export function formatCurrency(value, compact = false) {
  const amount = asNumber(value)
  return compact ? compactCurrencyFormatter.format(amount) : currencyFormatter.format(amount)
}

export function formatNumber(value) {
  return integerFormatter.format(asNumber(value))
}

export function formatScore(value) {
  return asNumber(value).toFixed(2)
}

export function formatDate(value) {
  if (!value) {
    return '—'
  }

  return new Date(value).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}
