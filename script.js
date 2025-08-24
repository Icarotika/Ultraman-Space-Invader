const game = document.getElementById("game")
const player = document.getElementById("player")
const scoreDisplay = document.getElementById("score")
const levelDisplay = document.getElementById("level")
const livesDisplay = document.getElementById("lives")
const bossHealthDisplay = document.getElementById("boss-health")
const bossHealthFill = document.getElementById("boss-health-fill")
const startScreen = document.getElementById("start-screen")
const gameOverScreen = document.getElementById("game-over")
const finalScoreDisplay = document.getElementById("final-score")

const leftBtn = document.getElementById("leftBtn")
const rightBtn = document.getElementById("rightBtn")
const shootBtn = document.getElementById("shootBtn")
const startBtn = document.getElementById("start-btn")
const restartBtn = document.getElementById("restart-btn")

const gameState = {
  playerX: 0,
  score: 0,
  level: 1,
  lives: 3,
  moveLeft: false,
  moveRight: false,
  gameRunning: false,
  enemies: [],
  lasers: [],
  boss: null,
  bossHealth: 0,
  maxBossHealth: 0,
  enemySpawnRate: 1000,
  lastShot: 0,
  shootCooldown: 200,
}

const enemyTypes = {
  asteroid: {
    width: 40,
    height: 40,
    speed: 2,
    health: 1,
    points: 10,
    className: "asteroid",
  },
  fast: {
    width: 35,
    height: 35,
    speed: 4,
    health: 1,
    points: 20,
    className: "fast-enemy",
  },
  tank: {
    width: 55,
    height: 45,
    speed: 1,
    health: 3,
    points: 30,
    className: "tank-enemy",
  },
}

function initGame() {
  gameState.playerX = game.clientWidth / 2 - 25
  gameState.score = 0
  gameState.level = 1
  gameState.lives = 3
  gameState.enemies = []
  gameState.lasers = []
  gameState.boss = null
  gameState.enemySpawnRate = 1000

  updateUI()
  player.style.left = `${gameState.playerX}px`
}

function updateUI() {
  scoreDisplay.textContent = `Pontuação: ${gameState.score}`
  levelDisplay.textContent = `Nível: ${gameState.level}`
  livesDisplay.textContent = `Vidas: ${gameState.lives}`
}

document.addEventListener("keydown", (event) => {
  if (!gameState.gameRunning) return

  switch (event.key) {
    case "ArrowLeft":
      gameState.moveLeft = true
      player.classList.add("moving-left")
      break
    case "ArrowRight":
      gameState.moveRight = true
      player.classList.add("moving-right")
      break
    case " ":
      event.preventDefault()
      shoot()
      break
  }
})

document.addEventListener("keyup", (event) => {
  switch (event.key) {
    case "ArrowLeft":
      gameState.moveLeft = false
      player.classList.remove("moving-left")
      break
    case "ArrowRight":
      gameState.moveRight = false
      player.classList.remove("moving-right")
      break
  }
})

leftBtn.addEventListener("touchstart", (e) => {
  e.preventDefault()
  gameState.moveLeft = true
  player.classList.add("moving-left")
})
leftBtn.addEventListener("touchend", () => {
  gameState.moveLeft = false
  player.classList.remove("moving-left")
})

rightBtn.addEventListener("touchstart", (e) => {
  e.preventDefault()
  gameState.moveRight = true
  player.classList.add("moving-right")
})
rightBtn.addEventListener("touchend", () => {
  gameState.moveRight = false
  player.classList.remove("moving-right")
})

shootBtn.addEventListener("touchstart", (e) => {
  e.preventDefault()
  shoot()
})

function shoot() {
  const now = Date.now()
  if (now - gameState.lastShot < gameState.shootCooldown) return

  gameState.lastShot = now

  const laser = document.createElement("div")
  laser.classList.add("laser")
  laser.style.left = `${gameState.playerX + 23}px`
  laser.style.bottom = "70px"
  game.appendChild(laser)

  gameState.lasers.push({
    element: laser,
    x: gameState.playerX + 23,
    y: 70,
  })
}

function spawnEnemy() {
  if (!gameState.gameRunning) return

  // Determina tipo de inimigo baseado no nível
  let enemyType
  const rand = Math.random()

  if (gameState.level >= 3 && rand < 0.3) {
    enemyType = enemyTypes.tank
  } else if (gameState.level >= 2 && rand < 0.5) {
    enemyType = enemyTypes.fast
  } else {
    enemyType = enemyTypes.asteroid
  }

  const enemy = document.createElement("div")
  enemy.classList.add("enemy", enemyType.className)
  enemy.style.left = `${Math.random() * (game.clientWidth - enemyType.width)}px`
  enemy.style.top = "0px"
  game.appendChild(enemy)

  gameState.enemies.push({
    element: enemy,
    x: Number.parseInt(enemy.style.left),
    y: 0,
    type: enemyType,
    health: enemyType.health,
    maxHealth: enemyType.health,
  })
}

function spawnBoss() {
  if (gameState.boss) return

  const boss = document.createElement("div")
  boss.classList.add("enemy", "boss")
  boss.style.left = `${game.clientWidth / 2 - 60}px`
  boss.style.top = "50px"
  game.appendChild(boss)

  const bossHealth = 20 + gameState.level * 5
  gameState.boss = {
    element: boss,
    x: game.clientWidth / 2 - 60,
    y: 50,
    health: bossHealth,
    maxHealth: bossHealth,
    moveDirection: 1,
    lastShot: 0,
  }

  gameState.bossHealth = bossHealth
  gameState.maxBossHealth = bossHealth
  bossHealthDisplay.style.display = "block"
  updateBossHealth()
}

function updateBossHealth() {
  const percentage = (gameState.bossHealth / gameState.maxBossHealth) * 100
  bossHealthFill.style.width = `${percentage}%`
}

function checkCollision(obj1, obj2) {
  const rect1 = obj1.getBoundingClientRect()
  const rect2 = obj2.getBoundingClientRect()
  return !(rect1.top > rect2.bottom || rect1.right < rect2.left || rect1.bottom < rect2.top || rect1.left > rect2.right)
}

function createExplosion(x, y) {
  const explosion = document.createElement("div")
  explosion.classList.add("explosion")
  explosion.style.left = `${x - 30}px`
  explosion.style.top = `${y - 30}px`
  game.appendChild(explosion)

  setTimeout(() => {
    if (explosion.parentNode) {
      explosion.remove()
    }
  }, 500)
}

function gameLoop() {
  if (!gameState.gameRunning) return

  // Movimento do jogador
  if (gameState.moveLeft) {
    gameState.playerX = Math.max(0, gameState.playerX - 6)
  }
  if (gameState.moveRight) {
    gameState.playerX = Math.min(game.clientWidth - 50, gameState.playerX + 6)
  }
  player.style.left = `${gameState.playerX}px`

  // Movimento dos lasers
  gameState.lasers.forEach((laser, laserIndex) => {
    laser.y += 8
    laser.element.style.bottom = `${laser.y}px`

    // Remove laser se sair da tela
    if (laser.y > game.clientHeight) {
      laser.element.remove()
      gameState.lasers.splice(laserIndex, 1)
      return
    }

    // Colisão laser-inimigo
    gameState.enemies.forEach((enemy, enemyIndex) => {
      if (checkCollision(laser.element, enemy.element)) {
        createExplosion(enemy.x + enemy.type.width / 2, enemy.y + enemy.type.height / 2)

        enemy.health--
        if (enemy.health <= 0) {
          gameState.score += enemy.type.points
          enemy.element.remove()
          gameState.enemies.splice(enemyIndex, 1)
        }

        laser.element.remove()
        gameState.lasers.splice(laserIndex, 1)
        updateUI()
      }
    })

    // Colisão laser-chefão
    if (gameState.boss && checkCollision(laser.element, gameState.boss.element)) {
      createExplosion(gameState.boss.x + 60, gameState.boss.y + 40)
      gameState.bossHealth--
      updateBossHealth()

      laser.element.remove()
      gameState.lasers.splice(laserIndex, 1)

      if (gameState.bossHealth <= 0) {
        gameState.score += 200
        gameState.boss.element.remove()
        gameState.boss = null
        bossHealthDisplay.style.display = "none"
        gameState.level++
        gameState.enemySpawnRate = Math.max(300, gameState.enemySpawnRate - 50)
        updateUI()
      }
    }
  })

  // Movimento dos inimigos
  gameState.enemies.forEach((enemy, index) => {
    enemy.y += enemy.type.speed
    enemy.element.style.top = `${enemy.y}px`

    // Remove inimigo se sair da tela
    if (enemy.y > game.clientHeight) {
      enemy.element.remove()
      gameState.enemies.splice(index, 1)
      return
    }

    // Colisão inimigo-jogador
    if (checkCollision(enemy.element, player)) {
      createExplosion(gameState.playerX + 25, game.clientHeight - 45)
      gameState.lives--
      enemy.element.remove()
      gameState.enemies.splice(index, 1)
      updateUI()

      if (gameState.lives <= 0) {
        gameOver()
        return
      }
    }
  })

  // Movimento do chefão
  if (gameState.boss) {
    gameState.boss.x += gameState.boss.moveDirection * 2
    if (gameState.boss.x <= 0 || gameState.boss.x >= game.clientWidth - 120) {
      gameState.boss.moveDirection *= -1
    }
    gameState.boss.element.style.left = `${gameState.boss.x}px`

    // Colisão chefão-jogador
    if (checkCollision(gameState.boss.element, player)) {
      createExplosion(gameState.playerX + 25, game.clientHeight - 45)
      gameState.lives--
      updateUI()

      if (gameState.lives <= 0) {
        gameOver()
        return
      }
    }
  }

  // Spawn de chefão a cada 5 níveis
  if (gameState.level % 5 === 0 && !gameState.boss && gameState.enemies.length === 0) {
    spawnBoss()
  }

  requestAnimationFrame(gameLoop)
}

function gameOver() {
  gameState.gameRunning = false
  finalScoreDisplay.textContent = `Pontuação Final: ${gameState.score}`
  gameOverScreen.style.display = "flex"

  // Limpa todos os elementos do jogo
  gameState.enemies.forEach((enemy) => enemy.element.remove())
  gameState.lasers.forEach((laser) => laser.element.remove())
  if (gameState.boss) gameState.boss.element.remove()

  gameState.enemies = []
  gameState.lasers = []
  gameState.boss = null
  bossHealthDisplay.style.display = "none"
}

function startGame() {
  startScreen.style.display = "none"
  gameOverScreen.style.display = "none"
  gameState.gameRunning = true
  initGame()
  gameLoop()

  // Inicia spawn de inimigos
  setInterval(() => {
    if (gameState.gameRunning && !gameState.boss) {
      spawnEnemy()
    }
  }, gameState.enemySpawnRate)
}

startBtn.addEventListener("click", startGame)
restartBtn.addEventListener("click", startGame)

initGame()
