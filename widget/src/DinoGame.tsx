import React, { useRef, useEffect, useState, useCallback } from 'react'

const CANVAS_WIDTH = 600
const CANVAS_HEIGHT = 180
const GROUND_Y = 150
const GRAVITY = 0.8
const JUMP_FORCE = -13
const INITIAL_SPEED = 5

interface GameState {
  highScore: number
  gamesPlayed: number
}

function DinoGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const gameRef = useRef({
    dino: { x: 50, y: GROUND_Y - 44, width: 44, height: 44, velocityY: 0, isJumping: false },
    obstacles: [] as Array<{ x: number; width: number; height: number }>,
    score: 0,
    highScore: 0,
    speed: INITIAL_SPEED,
    isGameOver: false,
    isRunning: false,
    frameCount: 0
  })
  const animationRef = useRef<number>()
  const [currentScore, setCurrentScore] = useState(0)
  const [highScore, setHighScore] = useState(0)
  const [isGameOver, setIsGameOver] = useState(false)

  useEffect(() => {
    const widgetState = window.openai?.widgetState as GameState | undefined
    if (widgetState?.highScore) {
      gameRef.current.highScore = widgetState.highScore
      setHighScore(widgetState.highScore)
    }
  }, [])

  const saveState = useCallback((newHighScore: number, gamesPlayed: number) => {
    if (window.openai?.setWidgetState) {
      window.openai.setWidgetState({ highScore: newHighScore, gamesPlayed })
    }
  }, [])

  const resetGame = useCallback(() => {
    const game = gameRef.current
    game.dino = { x: 50, y: GROUND_Y - 44, width: 44, height: 44, velocityY: 0, isJumping: false }
    game.obstacles = []
    game.score = 0
    game.speed = INITIAL_SPEED
    game.isGameOver = false
    game.isRunning = true
    game.frameCount = 0
    setCurrentScore(0)
    setIsGameOver(false)
  }, [])

  const jump = useCallback(() => {
    const game = gameRef.current
    if (game.isGameOver) {
      resetGame()
      return
    }
    if (!game.dino.isJumping) {
      game.dino.velocityY = JUMP_FORCE
      game.dino.isJumping = true
    }
  }, [resetGame])

  const drawDino = useCallback((ctx: CanvasRenderingContext2D, dino: typeof gameRef.current.dino, frameCount: number) => {
    const theme = window.openai?.theme || 'light'
    ctx.fillStyle = theme === 'dark' ? '#d4d4d4' : '#535353'
    const x = dino.x
    const y = dino.y
    
    ctx.fillRect(x + 20, y, 24, 20)
    ctx.fillRect(x + 36, y, 8, 8)
    ctx.fillStyle = theme === 'dark' ? '#1a1a1a' : '#fff'
    ctx.fillRect(x + 34, y + 4, 4, 4)
    ctx.fillStyle = theme === 'dark' ? '#d4d4d4' : '#535353'
    ctx.fillRect(x + 12, y + 16, 32, 24)
    ctx.fillRect(x, y + 20, 16, 8)
    ctx.fillRect(x + 8, y + 28, 8, 4)
    
    if (!dino.isJumping) {
      if (Math.floor(frameCount / 5) % 2 === 0) {
        ctx.fillRect(x + 12, y + 36, 8, 8)
        ctx.fillRect(x + 28, y + 36, 8, 4)
      } else {
        ctx.fillRect(x + 12, y + 36, 8, 4)
        ctx.fillRect(x + 28, y + 36, 8, 8)
      }
    } else {
      ctx.fillRect(x + 12, y + 36, 8, 8)
      ctx.fillRect(x + 28, y + 36, 8, 8)
    }
  }, [])

  const drawCactus = useCallback((ctx: CanvasRenderingContext2D, obstacle: { x: number; height: number }) => {
    const theme = window.openai?.theme || 'light'
    ctx.fillStyle = theme === 'dark' ? '#d4d4d4' : '#535353'
    const x = obstacle.x
    const y = GROUND_Y - obstacle.height
    
    ctx.fillRect(x + 8, y, 8, obstacle.height)
    ctx.fillRect(x, y + 10, 6, 20)
    ctx.fillRect(x + 18, y + 5, 6, 25)
    ctx.fillRect(x + 6, y + 15, 4, 6)
    ctx.fillRect(x + 14, y + 10, 4, 6)
  }, [])

  const checkCollision = useCallback((dino: typeof gameRef.current.dino, obstacle: { x: number; width: number; height: number }) => {
    const dinoBox = {
      x: dino.x + 5,
      y: dino.y + 5,
      width: dino.width - 10,
      height: dino.height - 5
    }
    const obsBox = {
      x: obstacle.x + 3,
      y: GROUND_Y - obstacle.height + 3,
      width: obstacle.width - 6,
      height: obstacle.height - 3
    }
    
    return dinoBox.x < obsBox.x + obsBox.width &&
           dinoBox.x + dinoBox.width > obsBox.x &&
           dinoBox.y < obsBox.y + obsBox.height &&
           dinoBox.y + dinoBox.height > obsBox.y
  }, [])

  const gameLoop = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const game = gameRef.current
    
    if (!game.isRunning) return

    const theme = window.openai?.theme || 'light'
    ctx.fillStyle = theme === 'dark' ? '#1a1a1a' : '#f7f7f7'
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)

    ctx.fillStyle = theme === 'dark' ? '#d4d4d4' : '#535353'
    ctx.fillRect(0, GROUND_Y, CANVAS_WIDTH, 2)

    if (!game.isGameOver) {
      game.dino.velocityY += GRAVITY
      game.dino.y += game.dino.velocityY
      
      if (game.dino.y >= GROUND_Y - game.dino.height) {
        game.dino.y = GROUND_Y - game.dino.height
        game.dino.velocityY = 0
        game.dino.isJumping = false
      }

      game.frameCount++
      if (game.frameCount % 100 === 0) {
        game.speed = Math.min(game.speed + 0.25, 15)
      }

      const spawnRate = Math.max(60, 120 - game.score / 5)
      if (game.frameCount % Math.floor(spawnRate) === 0 || game.obstacles.length === 0) {
        const lastObstacle = game.obstacles[game.obstacles.length - 1]
        const minGap = 200 + Math.random() * 200
        
        if (!lastObstacle || CANVAS_WIDTH - lastObstacle.x >= minGap) {
          game.obstacles.push({
            x: CANVAS_WIDTH,
            width: 24,
            height: 30 + Math.random() * 20
          })
        }
      }

      game.obstacles = game.obstacles.filter(obs => obs.x > -obs.width)
      game.obstacles.forEach(obs => {
        obs.x -= game.speed
      })

      for (const obs of game.obstacles) {
        if (checkCollision(game.dino, obs)) {
          game.isGameOver = true
          setIsGameOver(true)
          if (game.score > game.highScore) {
            game.highScore = game.score
            setHighScore(game.score)
            saveState(game.score, 1)
          }
          break
        }
      }

      if (!game.isGameOver) {
        game.score++
        setCurrentScore(game.score)
      }
    }

    drawDino(ctx, game.dino, game.frameCount)
    game.obstacles.forEach(obs => drawCactus(ctx, obs))

    ctx.fillStyle = theme === 'dark' ? '#d4d4d4' : '#535353'
    ctx.font = 'bold 14px monospace'
    ctx.textAlign = 'right'
    ctx.fillText(`HI ${String(game.highScore).padStart(5, '0')}  ${String(game.score).padStart(5, '0')}`, CANVAS_WIDTH - 10, 20)

    if (game.isGameOver) {
      ctx.fillStyle = theme === 'dark' ? '#d4d4d4' : '#535353'
      ctx.font = 'bold 18px Arial'
      ctx.textAlign = 'center'
      ctx.fillText('GAME OVER', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 15)
      ctx.font = '12px Arial'
      ctx.fillText('Press SPACE or tap to restart', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 10)
    }

    animationRef.current = requestAnimationFrame(gameLoop)
  }, [checkCollision, drawCactus, drawDino, saveState])

  useEffect(() => {
    gameRef.current.isRunning = true
    animationRef.current = requestAnimationFrame(gameLoop)
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
      gameRef.current.isRunning = false
    }
  }, [gameLoop])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'ArrowUp') {
        e.preventDefault()
        jump()
      }
    }
    
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [jump])

  return (
    <div className="dino-container">
      <div className="game-header">
        <span className="dino-icon">🦖</span>
        <span className="game-title">Dino Runner</span>
      </div>
      <canvas
        ref={canvasRef}
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
        className="dino-canvas"
        onClick={jump}
        onTouchStart={(e) => { e.preventDefault(); jump(); }}
      />
      <div className="game-info">
        <span>Score: {currentScore}</span>
        <span>High Score: {highScore}</span>
      </div>
      <p className="instructions">Press SPACE or tap to jump!</p>
    </div>
  )
}

export default DinoGame
