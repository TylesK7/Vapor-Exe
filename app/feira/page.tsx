"use client"

import { useState, useEffect, useRef, useCallback, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import {
  Play,
  RotateCcw,
  Heart,
  Clock,
  AlertTriangle,
  Trophy,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Zap,
  Wind,
  Target,
  Brain,
  Info,
  Volume2,
  VolumeX,
} from "lucide-react"

// ==================== TIPOS ====================
interface Obstacle {
  x: number
  y: number
  width: number
  height: number
  label: string
  color: string
  velocityX: number
  velocityY: number
  originalX: number
  originalY: number
}

interface Player {
  x: number
  y: number
  width: number
  height: number
  speed: number
}

interface Goal {
  x: number
  y: number
  width: number
  height: number
}

type GameState = "menu" | "playing" | "won" | "lost"

// ==================== CONSTANTES DO JOGO ====================
const CANVAS_WIDTH = 600
const CANVAS_HEIGHT = 400
const PLAYER_SIZE = 20
const PLAYER_SPEED = 4
const GOAL_WIDTH = 50
const GOAL_HEIGHT = 60
const INITIAL_HP = 100
const DAMAGE_PER_COLLISION = 15
const COLLISION_COOLDOWN = 500 // ms entre danos

const INITIAL_OBSTACLES: Omit<Obstacle, "velocityX" | "velocityY" | "originalX" | "originalY">[] = [
  { x: 120, y: 50, width: 35, height: 35, label: "Curiosidade", color: "#bf00ff" },
  { x: 120, y: 310, width: 35, height: 35, label: "Sabor doce", color: "#ff00ff" },
  { x: 220, y: 140, width: 35, height: 35, label: "Pressão social", color: "#ff0055" },
  { x: 220, y: 240, width: 35, height: 35, label: "Propaganda", color: "#bf00ff" },
  { x: 320, y: 70, width: 35, height: 35, label: "Influencer", color: "#ff00ff" },
  { x: 320, y: 290, width: 35, height: 35, label: '"Só uma vez"', color: "#ff0055" },
  { x: 420, y: 170, width: 35, height: 35, label: "Design bonito", color: "#bf00ff" },
  { x: 380, y: 100, width: 35, height: 35, label: "Falsa segurança", color: "#ff00ff" },
  { x: 480, y: 220, width: 35, height: 35, label: "Vício", color: "#ff0055" },
]

const OBSTACLE_MESSAGES = [
  "A influência te atingiu. Pense antes de seguir o grupo.",
  "O design chamou sua atenção. Aparência não é segurança.",
  "A curiosidade é natural, mas questionar também é.",
  "Sabores podem mascarar riscos. Fique atento!",
  "Pressão social pode influenciar escolhas. Reflita.",
  "A propaganda é persuasiva. Busque informação real.",
  "Influencers nem sempre têm todas as informações.",
  '"Só uma vez" pode ser o início de um hábito.',
]

// ==================== COMPONENTE PRINCIPAL ====================
export default function VaporExeGame() {
  // Estados do jogo
  const [gameState, setGameState] = useState<GameState>("menu")
  const [hp, setHp] = useState(INITIAL_HP)
  const [time, setTime] = useState(0)
  const [collisions, setCollisions] = useState(0)
  const [currentMessage, setCurrentMessage] = useState("")
  const [showMessage, setShowMessage] = useState(false)
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [highScore, setHighScore] = useState<number | null>(null)
  const [mounted, setMounted] = useState(false)

  // Refs para o canvas e estado do jogo
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const playerRef = useRef<Player>({
    x: 30,
    y: CANVAS_HEIGHT / 2 - PLAYER_SIZE / 2,
    width: PLAYER_SIZE,
    height: PLAYER_SIZE,
    speed: PLAYER_SPEED,
  })
  const obstaclesRef = useRef<Obstacle[]>([])
  const goalRef = useRef<Goal>({
    x: CANVAS_WIDTH - GOAL_WIDTH - 20,
    y: CANVAS_HEIGHT / 2 - GOAL_HEIGHT / 2,
    width: GOAL_WIDTH,
    height: GOAL_HEIGHT,
  })
  const keysRef = useRef<{ [key: string]: boolean }>({})
  const animationFrameRef = useRef<number>(0)
  const lastCollisionTimeRef = useRef<number>(0)
  const gameTimeRef = useRef<number>(0)
  const audioContextRef = useRef<AudioContext | null>(null)

  // Inicializa obstáculos com velocidade
  const initializeObstacles = useCallback(() => {
    obstaclesRef.current = INITIAL_OBSTACLES.map((obs, index) => ({
      ...obs,
      originalX: obs.x,
      originalY: obs.y,
      velocityX: (Math.random() - 0.5) * 1.5,
      velocityY: (index % 2 === 0 ? 1 : -1) * (0.8 + Math.random() * 0.7),
    }))
  }, [])

  // Sistema de som
  const playSound = useCallback(
    (frequency: number, duration: number, type: OscillatorType = "sine") => {
      if (!soundEnabled) return

      try {
        if (!audioContextRef.current) {
          audioContextRef.current = new (window.AudioContext || (window as typeof window & { webkitAudioContext: typeof AudioContext }).webkitAudioContext)()
        }

        const ctx = audioContextRef.current
        const oscillator = ctx.createOscillator()
        const gainNode = ctx.createGain()

        oscillator.connect(gainNode)
        gainNode.connect(ctx.destination)

        oscillator.frequency.value = frequency
        oscillator.type = type

        gainNode.gain.setValueAtTime(0.1, ctx.currentTime)
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration)

        oscillator.start(ctx.currentTime)
        oscillator.stop(ctx.currentTime + duration)
      } catch {
        // Silently fail if audio context is not available
      }
    },
    [soundEnabled]
  )

  const playCollisionSound = useCallback(() => {
    playSound(200, 0.2, "square")
  }, [playSound])

  const playWinSound = useCallback(() => {
    playSound(523.25, 0.1)
    setTimeout(() => playSound(659.25, 0.1), 100)
    setTimeout(() => playSound(783.99, 0.1), 200)
    setTimeout(() => playSound(1046.5, 0.2), 300)
  }, [playSound])

  const playLoseSound = useCallback(() => {
    playSound(300, 0.15, "square")
    setTimeout(() => playSound(250, 0.15, "square"), 150)
    setTimeout(() => playSound(200, 0.3, "square"), 300)
  }, [playSound])

  // Detecta colisão entre dois retângulos
  const checkCollision = useCallback(
    (rect1: { x: number; y: number; width: number; height: number }, rect2: { x: number; y: number; width: number; height: number }) => {
      return rect1.x < rect2.x + rect2.width && rect1.x + rect1.width > rect2.x && rect1.y < rect2.y + rect2.height && rect1.y + rect1.height > rect2.y
    },
    []
  )

  // Atualiza posição dos obstáculos (movimento contínuo)
  const updateObstacles = useCallback(() => {
    obstaclesRef.current = obstaclesRef.current.map((obstacle) => {
      let newX = obstacle.x + obstacle.velocityX
      let newY = obstacle.y + obstacle.velocityY
      let newVelocityX = obstacle.velocityX
      let newVelocityY = obstacle.velocityY

      // Limites horizontais - bouncing
      const minX = Math.max(100, obstacle.originalX - 60)
      const maxX = Math.min(CANVAS_WIDTH - obstacle.width - 30, obstacle.originalX + 60)

      if (newX <= minX || newX >= maxX) {
        newVelocityX = -newVelocityX
        newX = Math.max(minX, Math.min(maxX, newX))
      }

      // Limites verticais - bouncing
      const minY = Math.max(10, obstacle.originalY - 80)
      const maxY = Math.min(CANVAS_HEIGHT - obstacle.height - 10, obstacle.originalY + 80)

      if (newY <= minY || newY >= maxY) {
        newVelocityY = -newVelocityY
        newY = Math.max(minY, Math.min(maxY, newY))
      }

      return {
        ...obstacle,
        x: newX,
        y: newY,
        velocityX: newVelocityX,
        velocityY: newVelocityY,
      }
    })
  }, [])

  // Loop principal do jogo
  const gameLoop = useCallback(() => {
    if (gameState !== "playing") return

    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const player = playerRef.current

    // Movimento do jogador
    if (keysRef.current["ArrowUp"] || keysRef.current["w"] || keysRef.current["W"]) {
      player.y = Math.max(0, player.y - player.speed)
    }
    if (keysRef.current["ArrowDown"] || keysRef.current["s"] || keysRef.current["S"]) {
      player.y = Math.min(CANVAS_HEIGHT - player.height, player.y + player.speed)
    }
    if (keysRef.current["ArrowLeft"] || keysRef.current["a"] || keysRef.current["A"]) {
      player.x = Math.max(0, player.x - player.speed)
    }
    if (keysRef.current["ArrowRight"] || keysRef.current["d"] || keysRef.current["D"]) {
      player.x = Math.min(CANVAS_WIDTH - player.width, player.x + player.speed)
    }

    // Atualiza obstáculos (movimento)
    updateObstacles()

    // Verifica colisões com obstáculos
    const now = Date.now()
    obstaclesRef.current.forEach((obstacle, index) => {
      if (checkCollision(player, obstacle)) {
        if (now - lastCollisionTimeRef.current > COLLISION_COOLDOWN) {
          lastCollisionTimeRef.current = now
          setCollisions((prev) => prev + 1)
          setHp((prev) => {
            const newHp = Math.max(0, prev - DAMAGE_PER_COLLISION)
            if (newHp <= 0) {
              setGameState("lost")
              playLoseSound()
            }
            return newHp
          })

          // Mostra mensagem
          setCurrentMessage(OBSTACLE_MESSAGES[index % OBSTACLE_MESSAGES.length])
          setShowMessage(true)
          setTimeout(() => setShowMessage(false), 2000)

          // Empurra jogador para trás
          player.x = Math.max(10, player.x - 30)

          playCollisionSound()
        }
      }
    })

    // Verifica se chegou ao objetivo
    if (checkCollision(player, goalRef.current)) {
      setGameState("won")
      playWinSound()

      // Salva high score
      const finalTime = Math.floor((Date.now() - gameTimeRef.current) / 1000)
      if (highScore === null || finalTime < highScore) {
        setHighScore(finalTime)
      }
      
      // Notifica a página principal (quando em iframe) que o jogo foi vencido
      try {
        if (window.parent !== window) {
          window.parent.postMessage({ type: 'VAPOR_GAME_WON', time: finalTime, collisions }, '*')
        }
      } catch {
        // Ignora erros de cross-origin
      }
    }

    // ==================== RENDERIZAÇÃO ====================
    // Limpa canvas
    ctx.fillStyle = "#0a0a12"
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)

    // Grid de fundo
    ctx.strokeStyle = "rgba(0, 240, 255, 0.08)"
    ctx.lineWidth = 1
    for (let i = 0; i < CANVAS_WIDTH; i += 30) {
      ctx.beginPath()
      ctx.moveTo(i, 0)
      ctx.lineTo(i, CANVAS_HEIGHT)
      ctx.stroke()
    }
    for (let i = 0; i < CANVAS_HEIGHT; i += 30) {
      ctx.beginPath()
      ctx.moveTo(0, i)
      ctx.lineTo(CANVAS_WIDTH, i)
      ctx.stroke()
    }

    // Desenha obstáculos
    obstaclesRef.current.forEach((obstacle) => {
      // Glow
      ctx.shadowColor = obstacle.color
      ctx.shadowBlur = 20

      // Corpo do obstáculo
      ctx.fillStyle = obstacle.color
      ctx.beginPath()
      ctx.roundRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height, 6)
      ctx.fill()

      // Borda
      ctx.strokeStyle = "rgba(255, 255, 255, 0.3)"
      ctx.lineWidth = 2
      ctx.stroke()

      // Reset shadow
      ctx.shadowBlur = 0

      // Label
      ctx.fillStyle = "#ffffff"
      ctx.font = "bold 10px sans-serif"
      ctx.textAlign = "center"
      ctx.fillText(obstacle.label, obstacle.x + obstacle.width / 2, obstacle.y + obstacle.height + 14)
    })

    // Desenha objetivo
    const goal = goalRef.current
    ctx.shadowColor = "#00ff88"
    ctx.shadowBlur = 25

    // Gradiente para o objetivo
    const goalGradient = ctx.createLinearGradient(goal.x, goal.y, goal.x, goal.y + goal.height)
    goalGradient.addColorStop(0, "#00ff88")
    goalGradient.addColorStop(1, "#00cc6a")
    ctx.fillStyle = goalGradient
    ctx.beginPath()
    ctx.roundRect(goal.x, goal.y, goal.width, goal.height, 8)
    ctx.fill()

    ctx.shadowBlur = 0

    // Texto do objetivo
    ctx.fillStyle = "#0a0a12"
    ctx.font = "bold 9px sans-serif"
    ctx.textAlign = "center"
    ctx.fillText("ESCOLHA", goal.x + goal.width / 2, goal.y + 22)
    ctx.fillText("CONSCIENTE", goal.x + goal.width / 2, goal.y + 34)

    // Ícone no objetivo
    ctx.font = "16px sans-serif"
    ctx.fillText("🎯", goal.x + goal.width / 2, goal.y + 52)

    // Desenha jogador
    ctx.shadowColor = "#00f0ff"
    ctx.shadowBlur = 20

    // Gradiente para o jogador
    const playerGradient = ctx.createRadialGradient(
      player.x + player.width / 2,
      player.y + player.height / 2,
      0,
      player.x + player.width / 2,
      player.y + player.height / 2,
      player.width / 2
    )
    playerGradient.addColorStop(0, "#00f0ff")
    playerGradient.addColorStop(1, "#0088ff")
    ctx.fillStyle = playerGradient

    ctx.beginPath()
    ctx.arc(player.x + player.width / 2, player.y + player.height / 2, player.width / 2, 0, Math.PI * 2)
    ctx.fill()

    // Borda do jogador
    ctx.strokeStyle = "#ffffff"
    ctx.lineWidth = 2
    ctx.stroke()

    ctx.shadowBlur = 0

    // Atualiza tempo
    setTime(Math.floor((Date.now() - gameTimeRef.current) / 1000))

    animationFrameRef.current = requestAnimationFrame(gameLoop)
  }, [gameState, checkCollision, updateObstacles, playCollisionSound, playWinSound, playLoseSound, highScore])

  // Inicia o jogo
  const startGame = useCallback(() => {
    // Reset do estado
    setHp(INITIAL_HP)
    setTime(0)
    setCollisions(0)
    setCurrentMessage("")
    setShowMessage(false)

    // Reset do jogador
    playerRef.current = {
      x: 30,
      y: CANVAS_HEIGHT / 2 - PLAYER_SIZE / 2,
      width: PLAYER_SIZE,
      height: PLAYER_SIZE,
      speed: PLAYER_SPEED,
    }

    // Inicializa obstáculos
    initializeObstacles()

    // Marca tempo inicial
    gameTimeRef.current = Date.now()
    lastCollisionTimeRef.current = 0

    setGameState("playing")
  }, [initializeObstacles])

  // Efeito para evitar erro de hidratação
  useEffect(() => {
    setMounted(true)
  }, [])

  // Controles de teclado
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "w", "a", "s", "d", "W", "A", "S", "D"].includes(e.key)) {
        e.preventDefault()
        keysRef.current[e.key] = true
      }
    }

    const handleKeyUp = (e: KeyboardEvent) => {
      keysRef.current[e.key] = false
    }

    window.addEventListener("keydown", handleKeyDown)
    window.addEventListener("keyup", handleKeyUp)

    return () => {
      window.removeEventListener("keydown", handleKeyDown)
      window.removeEventListener("keyup", handleKeyUp)
    }
  }, [])

  // Game loop effect
  useEffect(() => {
    if (gameState === "playing") {
      animationFrameRef.current = requestAnimationFrame(gameLoop)
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [gameState, gameLoop])

  // Controles mobile
  const handleMobileControl = (direction: string, pressed: boolean) => {
    const keyMap: { [key: string]: string } = {
      up: "ArrowUp",
      down: "ArrowDown",
      left: "ArrowLeft",
      right: "ArrowRight",
    }
    keysRef.current[keyMap[direction]] = pressed
  }

  // Partículas de fundo pré-calculadas para evitar erro de hidratação
  const particles = useMemo(() => {
    if (!mounted) return []
    // Usar valores pseudo-aleatórios baseados em seed para consistência
    const seed = (n: number) => {
      const x = Math.sin(n * 12.9898 + n * 78.233) * 43758.5453
      return x - Math.floor(x)
    }
    return [...Array(50)].map((_, i) => ({
      left: seed(i * 1) * 100,
      top: seed(i * 2 + 50) * 100,
      delay: seed(i * 3 + 100) * 3,
      duration: 2 + seed(i * 4 + 150) * 3,
    }))
  }, [mounted])

  return (
    <div className="min-h-screen bg-[#0a0a12] text-white overflow-hidden">
      {/* Background animado */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0a0a12] via-[#0d0d18] to-[#0a0015]" />
        <div className="absolute inset-0 opacity-30">
          {particles.map((p, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-cyan-400 rounded-full animate-pulse"
              style={{
                left: `${p.left}%`,
                top: `${p.top}%`,
                animationDelay: `${p.delay}s`,
                animationDuration: `${p.duration}s`,
              }}
            />
          ))}
        </div>
      </div>

      {/* Conteúdo principal */}
      <div className="relative z-10 container mx-auto px-4 py-6 max-w-4xl">
        {/* Header */}
        <header className="text-center mb-6">
          <div className="inline-block mb-4">
            <Badge variant="outline" className="border-cyan-500/50 text-cyan-400 font-mono text-xs px-4 py-1">
              FEIRA DE CIÊNCIAS - DEMONSTRAÇÃO
            </Badge>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 bg-clip-text text-transparent mb-2">
            VAPOR.EXE
          </h1>
          <p className="text-gray-400 text-sm md:text-base">Quando o perigo ganha design</p>
        </header>

        {/* Área do jogo */}
        <Card className="bg-[#0f0f1a]/90 border-cyan-500/30 backdrop-blur-sm mb-6">
          <CardContent className="p-4 md:p-6">
            {/* Stats do jogo */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
              <div className="flex items-center gap-6">
                {/* HP */}
                <div className="flex items-center gap-2">
                  <Heart className={`w-5 h-5 ${hp > 30 ? "text-red-400" : "text-red-600 animate-pulse"}`} />
                  <div className="w-32">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-gray-400">Vida</span>
                      <span className="font-mono text-cyan-400">{hp}%</span>
                    </div>
                    <Progress 
                      value={hp} 
                      className={cn(
                        "h-2",
                        hp > 50 ? "[&>*]:bg-green-500" : hp > 25 ? "[&>*]:bg-yellow-500" : "[&>*]:bg-red-500"
                      )}
                    />
                  </div>
                </div>

                {/* Tempo */}
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="w-4 h-4 text-cyan-400" />
                  <span className="font-mono text-white">{time}s</span>
                </div>

                {/* Colisões */}
                <div className="flex items-center gap-2 text-sm">
                  <AlertTriangle className="w-4 h-4 text-yellow-500" />
                  <span className="font-mono text-white">{collisions}</span>
                </div>
              </div>

              {/* Controles de som */}
              <Button variant="ghost" size="sm" onClick={() => setSoundEnabled(!soundEnabled)} className="text-gray-400 hover:text-white">
                {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              </Button>
            </div>

            {/* Canvas do jogo */}
            <div className="relative flex justify-center">
              <div className="relative border-2 border-cyan-500/30 rounded-lg overflow-hidden">
                <canvas ref={canvasRef} width={CANVAS_WIDTH} height={CANVAS_HEIGHT} className="block max-w-full h-auto" style={{ imageRendering: "pixelated" }} />

                {/* Overlay de menu */}
                {gameState === "menu" && (
                  <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center p-6 text-center">
                    <Zap className="w-16 h-16 text-cyan-400 mb-4 animate-pulse" />
                    <h2 className="text-2xl font-bold mb-2">Escape da Névoa</h2>
                    <p className="text-gray-400 mb-6 max-w-sm">
                      Desvie dos obstáculos que representam influências negativas e chegue até a <strong className="text-green-400">Escolha Consciente</strong>!
                    </p>
                    <div className="flex flex-col gap-3">
                      <Button onClick={startGame} className="bg-cyan-500 hover:bg-cyan-600 text-black font-bold px-8">
                        <Play className="w-4 h-4 mr-2" />
                        Iniciar Jogo
                      </Button>
                      {highScore !== null && (
                        <p className="text-sm text-yellow-400">
                          <Trophy className="w-4 h-4 inline mr-1" />
                          Melhor tempo: {highScore}s
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Overlay de vitória */}
                {gameState === "won" && (
                  <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center p-6 text-center">
                    <Trophy className="w-16 h-16 text-yellow-400 mb-4 animate-bounce" />
                    <h2 className="text-2xl font-bold text-green-400 mb-2">Você Escapou da Névoa!</h2>
                    <p className="text-gray-300 mb-4">Sua consciência crítica aumentou.</p>
                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div className="bg-white/10 rounded-lg p-3">
                        <p className="text-xs text-gray-400">Tempo</p>
                        <p className="text-xl font-mono text-cyan-400">{time}s</p>
                      </div>
                      <div className="bg-white/10 rounded-lg p-3">
                        <p className="text-xs text-gray-400">Colisões</p>
                        <p className="text-xl font-mono text-yellow-400">{collisions}</p>
                      </div>
                    </div>
                    <Button onClick={startGame} className="bg-green-500 hover:bg-green-600 text-black font-bold px-8">
                      <RotateCcw className="w-4 h-4 mr-2" />
                      Jogar Novamente
                    </Button>
                  </div>
                )}

                {/* Overlay de derrota */}
                {gameState === "lost" && (
                  <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center p-6 text-center">
                    <Wind className="w-16 h-16 text-red-500 mb-4" />
                    <h2 className="text-2xl font-bold text-red-400 mb-2">A Névoa Venceu...</h2>
                    <p className="text-gray-300 mb-4">As influências foram muito fortes, mas você pode tentar novamente!</p>
                    <div className="bg-white/10 rounded-lg p-4 mb-6 max-w-sm">
                      <p className="text-sm text-gray-300">
                        <Brain className="w-4 h-4 inline mr-2 text-purple-400" />
                        Lembre-se: na vida real, informação e pensamento crítico são suas melhores defesas.
                      </p>
                    </div>
                    <Button onClick={startGame} className="bg-cyan-500 hover:bg-cyan-600 text-black font-bold px-8">
                      <RotateCcw className="w-4 h-4 mr-2" />
                      Tentar Novamente
                    </Button>
                  </div>
                )}

                {/* Mensagem de colisão */}
                {showMessage && gameState === "playing" && (
                  <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-red-500/90 text-white px-4 py-2 rounded-lg text-sm font-medium animate-pulse max-w-[90%] text-center">
                    {currentMessage}
                  </div>
                )}
              </div>
            </div>

            {/* Controles mobile */}
            {gameState === "playing" && (
              <div className="mt-6 flex justify-center md:hidden">
                <div className="grid grid-cols-3 gap-2">
                  <div />
                  <Button
                    variant="outline"
                    size="lg"
                    className="border-cyan-500/50 text-cyan-400 active:bg-cyan-500/30"
                    onTouchStart={() => handleMobileControl("up", true)}
                    onTouchEnd={() => handleMobileControl("up", false)}
                    onMouseDown={() => handleMobileControl("up", true)}
                    onMouseUp={() => handleMobileControl("up", false)}
                    onMouseLeave={() => handleMobileControl("up", false)}
                  >
                    <ChevronUp className="w-6 h-6" />
                  </Button>
                  <div />
                  <Button
                    variant="outline"
                    size="lg"
                    className="border-cyan-500/50 text-cyan-400 active:bg-cyan-500/30"
                    onTouchStart={() => handleMobileControl("left", true)}
                    onTouchEnd={() => handleMobileControl("left", false)}
                    onMouseDown={() => handleMobileControl("left", true)}
                    onMouseUp={() => handleMobileControl("left", false)}
                    onMouseLeave={() => handleMobileControl("left", false)}
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    className="border-cyan-500/50 text-cyan-400 active:bg-cyan-500/30"
                    onTouchStart={() => handleMobileControl("down", true)}
                    onTouchEnd={() => handleMobileControl("down", false)}
                    onMouseDown={() => handleMobileControl("down", true)}
                    onMouseUp={() => handleMobileControl("down", false)}
                    onMouseLeave={() => handleMobileControl("down", false)}
                  >
                    <ChevronDown className="w-6 h-6" />
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    className="border-cyan-500/50 text-cyan-400 active:bg-cyan-500/30"
                    onTouchStart={() => handleMobileControl("right", true)}
                    onTouchEnd={() => handleMobileControl("right", false)}
                    onMouseDown={() => handleMobileControl("right", true)}
                    onMouseUp={() => handleMobileControl("right", false)}
                    onMouseLeave={() => handleMobileControl("right", false)}
                  >
                    <ChevronRight className="w-6 h-6" />
                  </Button>
                </div>
              </div>
            )}

            {/* Instruções */}
            {gameState === "menu" && (
              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white/5 rounded-lg p-4">
                  <h3 className="font-bold text-cyan-400 mb-2 flex items-center gap-2">
                    <Target className="w-4 h-4" />
                    Objetivo
                  </h3>
                  <p className="text-sm text-gray-300">
                    Guie o jogador (círculo azul) até o objetivo verde &quot;Escolha Consciente&quot; desviando dos obstáculos que representam influências negativas.
                  </p>
                </div>
                <div className="bg-white/5 rounded-lg p-4">
                  <h3 className="font-bold text-cyan-400 mb-2 flex items-center gap-2">
                    <Info className="w-4 h-4" />
                    Controles
                  </h3>
                  <p className="text-sm text-gray-300">
                    Use as <strong>setas do teclado</strong> ou <strong>WASD</strong> para mover. Em dispositivos móveis, use os botões na tela.
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Informações educativas */}
        <Card className="bg-[#0f0f1a]/90 border-purple-500/30 backdrop-blur-sm">
          <CardContent className="p-4 md:p-6">
            <h3 className="text-lg font-bold text-purple-400 mb-4 flex items-center gap-2">
              <Brain className="w-5 h-5" />
              Sobre o Vapor.exe
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="bg-white/5 rounded-lg p-4">
                <h4 className="font-bold text-pink-400 mb-2">O que representa?</h4>
                <p className="text-gray-300">
                  Os obstáculos representam fatores que podem influenciar negativamente as escolhas de jovens: curiosidade, pressão social, propaganda e design atrativo.
                </p>
              </div>
              <div className="bg-white/5 rounded-lg p-4">
                <h4 className="font-bold text-cyan-400 mb-2">Por que é importante?</h4>
                <p className="text-gray-300">
                  Cigarros eletrônicos podem parecer inofensivos pelo design moderno e sabores, mas contêm substâncias que podem causar dependência e problemas de saúde.
                </p>
              </div>
              <div className="bg-white/5 rounded-lg p-4">
                <h4 className="font-bold text-green-400 mb-2">A mensagem</h4>
                <p className="text-gray-300">
                  Informação e pensamento crítico são suas melhores ferramentas para fazer escolhas conscientes e não ser influenciado apenas pela aparência.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <footer className="text-center mt-6 text-gray-500 text-xs">
          <p>Vapor.exe - Projeto de Conscientização | Feira de Ciências 2024</p>
          <p className="mt-1">&quot;Nem todo perigo vem com cheiro de fumaça. Alguns vêm com sabor, LED e neon.&quot;</p>
        </footer>
      </div>
    </div>
  )
}
