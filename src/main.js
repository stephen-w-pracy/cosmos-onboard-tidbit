/* Cool Professor Clothiers — the notify list.
 *
 * No backend yet, so addresses are kept in localStorage. When the shop has a
 * mailing service, swap `remember()` for the API call and leave the rest. */

const form = document.querySelector('#notify-form')
const emailField = document.querySelector('#notify-email')
const statusLine = document.querySelector('#notify-status')

const STORAGE_KEY = 'cpc.notify-list'

function savedAddresses() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function remember(address) {
  const list = savedAddresses()
  if (list.includes(address)) {
    return false
  }

  list.push(address)
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(list))
  } catch {
    // Private browsing blocks writes. The confirmation still stands.
  }
  return true
}

function announce(message) {
  statusLine.textContent = message
  statusLine.hidden = false
}

form.addEventListener('submit', (event) => {
  event.preventDefault()

  const address = emailField.value.trim()
  if (!address) {
    return
  }

  const isNew = remember(address)
  announce(
    isNew
      ? `Thank you. We will write to ${address} on the morning we open.`
      : `${address} is already on the list. We will write on the morning we open.`
  )
  form.reset()
})
