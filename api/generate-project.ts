import type { IncomingMessage, ServerResponse } from 'node:http'

type Request = IncomingMessage & { body?: unknown }
type Response = ServerResponse

type DetailsRequest = {
  title?: string
  category?: string
  client?: string
  year?: string
  notes?: string
  categories?: { key: string; title: string }[]
  media?: string[]
}

const send = (res: Response, status: number, body: unknown) => {
  res.statusCode = status
  res.setHeader('Content-Type', 'application/json; charset=utf-8')
  res.end(JSON.stringify(body))
}

export default async function handler(req: Request, res: Response) {
  if (req.method !== 'POST') return send(res, 405, { error: 'Use POST for project generation.' })

  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_PUBLISHABLE_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY
  const openAiKey = process.env.OPENAI_API_KEY
  if (!supabaseUrl || !supabaseKey) return send(res, 503, { error: 'Supabase server configuration is missing.' })
  if (!openAiKey) return send(res, 503, { error: 'AI generation is not configured yet. Add OPENAI_API_KEY to the Vercel project environment.' })

  const bearer = req.headers.authorization?.match(/^Bearer\s+(.+)$/i)?.[1]
  if (!bearer) return send(res, 401, { error: 'Sign in as an admin to generate project details.' })

  try {
    const userResponse = await fetch(`${supabaseUrl.replace(/\/$/, '')}/auth/v1/user`, {
      headers: { apikey: supabaseKey, authorization: `Bearer ${bearer}` },
    })
    if (!userResponse.ok) return send(res, 401, { error: 'Your admin session expired. Sign in again.' })

    const adminResponse = await fetch(`${supabaseUrl.replace(/\/$/, '')}/rest/v1/rpc/is_admin`, {
      method: 'POST',
      headers: { apikey: supabaseKey, authorization: `Bearer ${bearer}`, 'content-type': 'application/json' },
      body: '{}',
    })
    if (!adminResponse.ok || (await adminResponse.json()) !== true) return send(res, 403, { error: 'Only portfolio admins can generate project details.' })

    const input = (req.body ?? {}) as DetailsRequest
    const categories = Array.isArray(input.categories) ? input.categories.slice(0, 30) : []
    if (!categories.length) return send(res, 400, { error: 'The project category list is empty.' })
    const allowedCategories = new Set(categories.map((category) => category.key))
    const category = typeof input.category === 'string' && allowedCategories.has(input.category) ? input.category : ''
    const media = Array.isArray(input.media) ? input.media.slice(0, 10) : []
    const allowedOrigin = new URL(supabaseUrl).origin
    const validatedMedia = media.filter((item): item is string => {
      if (typeof item !== 'string' || item.length > 3_500_000) return false
      if (/^data:image\/(png|jpe?g|webp);base64,/i.test(item)) return true
      try {
        const url = new URL(item)
        return url.protocol === 'https:' && url.origin === allowedOrigin && url.pathname.startsWith('/storage/v1/object/public/works/')
      } catch {
        return false
      }
    })
    if (!validatedMedia.length) return send(res, 400, { error: 'Upload at least one image or video before generating details.' })

    const categoryList = categories.map((item) => `${item.key}: ${item.title}`).join('\n')
    const content = [
      {
        type: 'input_text',
        text: [
          'Analyze this portfolio project using the attached images and sampled video frames. Create concise, polished portfolio copy.',
          'Describe only what is visibly supported by the media and the supplied notes. Do not invent clients, awards, outcomes, dates, tools, or project facts.',
          'Return a title, one-line summary, 2-3 short description paragraphs, a category key from the supplied list, and 4-8 useful search keywords/tags.',
          'Use the supplied title and category as context, not as facts to invent around. If the exact category is unclear, keep the selected category.',
          `Existing title: ${String(input.title ?? '').slice(0, 180) || '(none)'}`,
          `Selected category: ${category || '(none)'}`,
          `Client (provided by admin): ${String(input.client ?? '').slice(0, 120) || '(not supplied; do not guess)'}`,
          `Year (provided by admin): ${String(input.year ?? '').slice(0, 20) || '(not supplied; do not guess)'}`,
          `Admin notes: ${String(input.notes ?? '').slice(0, 1200) || '(none)'}`,
          `Allowed categories:\n${categoryList}`,
        ].join('\n\n'),
      },
      ...validatedMedia.map((image_url) => ({ type: 'input_image', image_url, detail: 'low' })),
    ]

    const aiResponse = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: { authorization: `Bearer ${openAiKey}`, 'content-type': 'application/json' },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
        store: false,
        input: [{ role: 'user', content }],
        text: {
          format: {
            type: 'json_schema',
            name: 'portfolio_project_details',
            strict: true,
            schema: {
              type: 'object',
              properties: {
                title: { type: 'string' },
                category: { type: 'string', enum: [...allowedCategories] },
                summary: { type: 'string' },
                description: { type: 'string' },
                tags: { type: 'array', items: { type: 'string' } },
              },
              required: ['title', 'category', 'summary', 'description', 'tags'],
              additionalProperties: false,
            },
          },
        },
        max_output_tokens: 700,
      }),
    })

    const result = await aiResponse.json() as { output_text?: string; error?: { message?: string } }
    if (!aiResponse.ok) return send(res, 502, { error: result.error?.message || 'The AI service could not generate project details.' })
    if (!result.output_text) return send(res, 502, { error: 'The AI returned no project details. Try again with different media.' })
    return send(res, 200, JSON.parse(result.output_text))
  } catch (error) {
    console.error('Project detail generation failed:', error)
    return send(res, 500, { error: error instanceof Error ? error.message : 'Project detail generation failed.' })
  }
}
