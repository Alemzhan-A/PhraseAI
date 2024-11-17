'use client'

import React, { useState, useEffect } from 'react'
import { Alert } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'

type GameState = {
  attempts: number;
  bestScore: number;
  history: {
    guess: string;
    score: number;
  }[];
}

export default function IdiomGame() {
  const [idiom, setIdiom] = useState('')
  const [meaning, setMeaning] = useState('')
  const [guess, setGuess] = useState('')
  const [score, setScore] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [gameState, setGameState] = useState<GameState>({
    attempts: 0,
    bestScore: 0,
    history: []
  })
  const [showMeaning, setShowMeaning] = useState(false)

  const generateNewIdiom = async () => {
    try {
      setLoading(true)
      setError('')
      setScore(null)
      setGuess('')
      setShowMeaning(false)
      setGameState(prev => ({
        ...prev,
        attempts: 0,
        history: []
      }))
      
      const response = await fetch('/api/generate-idiom')
      const data = await response.json()
      
      if (data.idiom && data.meaning) {
        setIdiom(data.idiom)
        setMeaning(data.meaning)
      } else {
        setError('Не удалось получить фразеологизм')
      }
    } catch (err) {
      setError('Произошла ошибка при генерации фразеологизма')
      console.log(err)

    } finally {
      setLoading(false)
    }
  }


  const getScoreTextColor = (score: number) => {
    if (score >= 90) return 'text-green-700'
    if (score >= 70) return 'text-lime-700'
    if (score >= 50) return 'text-yellow-700'
    if (score >= 30) return 'text-orange-700'
    return 'text-red-700'
  }

  const handleGiveUp = () => {
    setShowMeaning(true)
    setScore(0)
    setGameState(prev => ({
      ...prev,
      attempts: prev.attempts + 1,
      history: [...prev.history, { guess: "Сдался", score: 0 }]
    }))
  }

  const checkGuess = async () => {
    if (!guess.trim()) return

    try {
      setLoading(true)
      setError('')
      
      const response = await fetch('/api/check-guess', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          meaning: meaning,
          guess: guess,
        }),
      })
      
      const data = await response.json()
      setScore(data.score)

      setGameState(prev => {
        const newState = {
          attempts: prev.attempts + 1,
          bestScore: Math.max(prev.bestScore, data.score),
          history: [...prev.history, { guess, score: data.score }]
        }
        return newState
      })

      if (data.score >= 90) {
        setShowMeaning(true)
        setError(`Отлично! Правильное значение: "${meaning}"`)
      }
    } catch (err) {
      setError('Произошла ошибка при проверке догадки')
      console.log(err)
    } finally {
      setLoading(false)
      setGuess('')
    }
  }

  useEffect(() => {
    generateNewIdiom()
  }, [])

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !loading && guess.trim()) {
      checkGuess()
    }
  }

  return (
    <Card className="w-full max-w-xl mx-auto mt-8">
      <CardHeader>
        <CardTitle>Игра &quot;Угадай значение фразеологизма&quot;</CardTitle>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant={error.includes('Отлично!') ? 'default' : 'destructive'} className="mb-4">
            {error}
          </Alert>
        )}
        
        {idiom && (
          <div className="space-y-4">
            <div className="text-xl font-bold text-center p-4 bg-gray-100 rounded">
              {idiom}
            </div>
            
            {showMeaning && (
              <div className="text-lg text-center p-3 bg-blue-50 rounded border border-blue-200">
                Значение: {meaning}
              </div>
            )}
            
            <div className="space-y-2">
              <Input
                type="text"
                placeholder="Введите ваше предположение о значении..."
                value={guess}
                onChange={(e) => setGuess(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={loading || showMeaning}
              />
              
              <div className="flex space-x-2">
                <Button 
                  onClick={checkGuess} 
                  disabled={loading || !guess.trim() || showMeaning}
                  className="flex-1"
                >
                  Проверить
                </Button>
                <Button 
                  onClick={handleGiveUp}
                  disabled={loading || showMeaning}
                  variant="outline"
                  className="flex-1"
                >
                  Сдаться
                </Button>
                <Button 
                  onClick={generateNewIdiom}
                  disabled={loading}
                  variant="outline"
                >
                  Новый фразеологизм
                </Button>
              </div>
            </div>

            <div className="space-y-4">
              {gameState.history.length > 0 && (
                <div className="mt-4">
                  <h4 className="text-sm font-semibold mb-2">История попыток:</h4>
                  <div className="space-y-2">
                    {gameState.history.map((attempt, index) => (
                      <div key={index} className="text-sm p-2 bg-gray-50 rounded">
                        <div className="flex justify-between mb-1">
                          <span>{attempt.guess}</span>
                          <span className={`font-semibold ${getScoreTextColor(attempt.score)}`}>
                            {attempt.score}%
                          </span>
                        </div>
                        <Progress 
                          value={attempt.score} 
                          className="h-2"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {score !== null && (
                <div className="text-center p-4 bg-gray-100 rounded">
                  <div className={`text-lg font-semibold ${getScoreTextColor(score)}`}>
                    Схожесть вашей догадки: {score}%
                  </div>
                  <Progress 
                    value={score} 
                    className="h-2 mt-2"
                  />
                  <div className="text-sm text-gray-600 mt-2">
                    Попыток: {gameState.attempts} | Лучший результат: {gameState.bestScore}%
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {!idiom && !loading && (
          <div className="text-center text-gray-500">
            Не удалось загрузить фразеологизм. Попробуйте снова.
          </div>
        )}

        {loading && (
          <div className="text-center text-gray-500">
            Пожалуйста, подождите, идет генерация...
          </div>
        )}
      </CardContent>
    </Card>
  )
}