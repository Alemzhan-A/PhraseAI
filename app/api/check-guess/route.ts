import { NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(req: Request) {
  try {
    const { meaning, guess } = await req.json()

    const completion = await openai.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "Ты - судья в игре угадывания значения фразеологизмов. Твоя задача - оценить насколько догадка игрока близка к правильному значению по шкале от 0 до 100, где 0 - совершенно неверно, 100 - абсолютно точно. Отвечай только числом."
        },
        {
          role: "user",
          content: `Правильное значение: "${meaning}". Догадка игрока: "${guess}". Оцени схожесть по шкале от 0 до 100.`
        }
      ],
      model: "gpt-3.5-turbo",
    })

    const score = parseInt(completion.choices[0].message.content || "0")
    return NextResponse.json({ score })
  } catch (error) {
    console.log(error)
    return NextResponse.json({ message: 'Error processing request' }, { status: 500 })
  }
}