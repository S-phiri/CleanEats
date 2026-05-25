/**
 * Extract JSON from Anthropic assistant text (markdown fences, preamble, trailing text).
 */
function extractText(data) {
  if (typeof data === 'string') return data
  if (data?.content && Array.isArray(data.content)) {
    return data.content.map(b => b.text || '').join('')
  }
  if (typeof data?.text === 'string') return data.text
  return ''
}

function stripMarkdownFences(text) {
  let s = text.trim()
  const fenceMatch = s.match(/^```(?:json)?\s*([\s\S]*?)```\s*$/i)
  if (fenceMatch) return fenceMatch[1].trim()
  const inlineFence = s.match(/```(?:json)?\s*([\s\S]*?)```/i)
  if (inlineFence) return inlineFence[1].trim()
  return s
}

function extractJsonSubstring(text) {
  const start = text.indexOf('{')
  const end = text.lastIndexOf('}')
  if (start === -1 || end === -1 || end <= start) return null
  return text.slice(start, end + 1)
}

export function parseAssistantJson(data) {
  const raw = extractText(data)
  if (!raw.trim()) throw new Error('Empty model response')

  console.log('RAW HAIKU RESPONSE:', raw.substring(0, 500))

  let text = stripMarkdownFences(raw.trim())
  let candidate = extractJsonSubstring(text)

  if (!candidate) {
    candidate = extractJsonSubstring(raw.trim())
  }

  if (!candidate) {
    const preview = raw.trim().substring(0, 200)
    throw new Error(`No JSON object found in model response. Received: ${preview}`)
  }

  try {
    return JSON.parse(candidate)
  } catch (parseErr) {
    const preview = raw.trim().substring(0, 200)
    throw new Error(
      `Invalid JSON in model response (${parseErr.message}). Received: ${preview}`
    )
  }
}
