import OpenAI from 'openai'
import { OPENAI_API_KEY, OPENAI_MODEL } from '../config.js'

const openai = OPENAI_API_KEY ? new OpenAI({ apiKey: OPENAI_API_KEY }) : null

export const aiSummary = async (systemPrompt, payload, fallback) => {
  if (!openai) return fallback

  try {
    const completion = await openai.responses.create({
      model: OPENAI_MODEL,
      input: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: JSON.stringify(payload) },
      ],
      temperature: 0.3,
      max_output_tokens: 220,
    })

    const text = completion.output_text?.trim()
    return text || fallback
  } catch {
    return fallback
  }
}
