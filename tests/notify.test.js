import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'
import { runInNewContext } from 'node:vm'

const source = readFileSync(new URL('../src/main.js', import.meta.url), 'utf8')

function loadNotifyForm() {
  const form = new EventTarget()
  const emailField = { value: '' }
  const statusLine = { textContent: '', hidden: true }
  const saved = new Map()
  const elements = {
    '#notify-form': form,
    '#notify-email': emailField,
    '#notify-status': statusLine,
  }

  form.reset = () => { emailField.value = '' }
  runInNewContext(source, {
    document: { querySelector: (selector) => elements[selector] },
    window: {
      localStorage: {
        getItem: (key) => saved.get(key) ?? null,
        setItem: (key, value) => saved.set(key, value),
      },
    },
  })

  return {
    emailField,
    statusLine,
    savedAddresses: () => JSON.parse(saved.get('cpc.notify-list') ?? '[]'),
    submit(address) {
      emailField.value = address
      const event = new Event('submit', { cancelable: true })
      form.dispatchEvent(event)
      return event
    },
  }
}

test('submission prevents navigation and reveals the existing confirmation', () => {
  const page = loadNotifyForm()
  const event = page.submit('visitor@example.com')

  assert.equal(event.defaultPrevented, true)
  assert.equal(page.statusLine.hidden, false)
  assert.equal(
    page.statusLine.textContent,
    'Thank you. We will write to visitor@example.com on the morning we open.'
  )
  assert.deepEqual(page.savedAddresses(), ['visitor@example.com'])
  assert.equal(page.emailField.value, '')
})

test('repeat submission stays on the page and confirms without adding a duplicate', () => {
  const page = loadNotifyForm()
  page.submit('visitor@example.com')
  const event = page.submit('visitor@example.com')

  assert.equal(event.defaultPrevented, true)
  assert.equal(page.statusLine.hidden, false)
  assert.equal(
    page.statusLine.textContent,
    'visitor@example.com is already on the list. We will write on the morning we open.'
  )
  assert.deepEqual(page.savedAddresses(), ['visitor@example.com'])
})
