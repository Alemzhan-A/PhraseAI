import { NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function GET() {
  try {
    const completion = await openai.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "Придумай новый, не существующий фразеологизм на русском языке. Он должен звучать правдоподобно, но быть полностью выдуманным. Он также должен быть смешным или абсудрным. Ответ дай в формате JSON с полями 'idiom' (сам фразеологизм) и 'meaning' (его значение)."
        }
      ],
      model: "gpt-4o",
    })

    const response = JSON.parse(completion.choices[0].message.content || "{}")
    return NextResponse.json(response)
  } catch (error) {
    console.log(error)
    return NextResponse.json({ message: 'Error generating idiom' }, { status: 500 })
  }
}