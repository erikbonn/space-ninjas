// Define enemy designs at the top level
const enemyDesigns = ["👾", "👽", "🤖", "👹", "👻"]
const enemySVGs = [
  "enemy1.svg",
  "enemy2.svg",
  "enemy3.svg",
  "enemy4.svg",
  "enemy5.svg",
]

// Add this near the top of the file with other global variables
const INITIAL_ENEMY_SPEED = 3 // Constant initial speed
let enemySpeed = INITIAL_ENEMY_SPEED
let animationFrameId = null

// Add this function near the top of your file
function logGameState(message) {
  console.log(`[Game State] ${message}`)
}

// Wrap all the code in a function that we'll call when the DOM is fully loaded
function initGame() {
  // Function to check if the canvas is available
  function checkCanvas() {
    console.log("Checking for canvas...")
    const canvas = document.getElementById("game-canvas")
    if (canvas) {
      startGame(canvas)
    } else {
      console.log("Canvas not found, retrying...")
      // If canvas is not found, try again after a short delay
      setTimeout(checkCanvas, 100)
    }
  }

  // Function to start the game once canvas is available
  function startGame(canvas) {
    const ctx = canvas.getContext("2d")

    // Set canvas size
    canvas.width = 800
    canvas.height = 600

    let player
    let enemies = []
    let bullets = []
    let gameOver = false
    let gameWon = false
    let gameStarted = false

    class Player {
      constructor(x, y, width, height) {
        this.x = x
        this.y = y
        this.width = width
        this.height = height
        this.speed = 5
        this.emoji = "🥷"
      }

      draw() {
        ctx.font = `${this.height}px Arial`
        ctx.textAlign = "center"
        ctx.textBaseline = "middle"
        ctx.fillText(
          this.emoji,
          this.x + this.width / 2,
          this.y + this.height / 2
        )
      }

      move(direction) {
        if (direction === "left" && this.x > 0) {
          this.x -= this.speed
        } else if (
          direction === "right" &&
          this.x + this.width < canvas.width
        ) {
          this.x += this.speed
        }
      }

      shoot() {
        const bulletWidth = 5
        const bulletHeight = 10
        const bulletX = this.x + this.width / 2 - bulletWidth / 2
        const bulletY = this.y - bulletHeight
        bullets.push(new Bullet(bulletX, bulletY, bulletWidth, bulletHeight))
      }
    }

    class Enemy {
      constructor(x, y, width, height) {
        this.x = x
        this.y = y
        this.width = width
        this.height = height
        this.speed = INITIAL_ENEMY_SPEED
        this.direction = 1 // 1 for right, -1 for left

        // For emojis:
        this.emoji =
          enemyDesigns[Math.floor(Math.random() * enemyDesigns.length)]
      }

      move() {
        this.x += this.speed * this.direction
        if (this.x + this.width > canvas.width || this.x < 0) {
          this.direction *= -1 // Change direction
          this.y += 20 // Move down
        }
      }

      draw() {
        if (this.imageLoaded) {
          try {
            ctx.drawImage(this.image, this.x, this.y, this.width, this.height)
          } catch (error) {
            console.error("Error drawing image:", error)
            this.drawEmoji()
          }
        } else {
          this.drawEmoji()
        }
      }

      drawEmoji() {
        ctx.font = `${this.height}px Arial`
        ctx.textAlign = "center"
        ctx.textBaseline = "middle"
        ctx.fillText(
          this.emoji,
          this.x + this.width / 2,
          this.y + this.height / 2
        )
      }
    }

    class Bullet {
      constructor(x, y, width, height) {
        this.x = x
        this.y = y
        this.width = width
        this.height = height
        this.speed = 8
      }

      draw() {
        ctx.fillStyle = "blue"
        ctx.fillRect(this.x, this.y, this.width, this.height)
      }

      move() {
        this.y -= this.speed
      }
    }

    function init() {
      // Cancel the previous animation frame if it exists
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId)
      }

      gameStarted = true
      gameOver = false
      gameWon = false

      enemies = []
      bullets = []

      player = new Player(canvas.width / 2, canvas.height - 30, 30, 30)

      Enemy.speed = INITIAL_ENEMY_SPEED
      enemySpeed = INITIAL_ENEMY_SPEED
      createEnemies()

      logGameState(
        `Game initialized. Enemy count: ${enemies.length}, Enemy.speed: ${Enemy.speed}, enemySpeed: ${enemySpeed}`
      )

      // Start a new game loop
      animationFrameId = requestAnimationFrame(gameLoop)
    }

    function createTriangleFormation() {
      const rows = 5
      const enemyWidth = 40
      const enemyHeight = 30
      const spacing = 20

      for (let row = 0; row < rows; row++) {
        const enemiesInRow = row + 1
        const rowWidth = enemiesInRow * (enemyWidth + spacing) - spacing
        const startX = (canvas.width - rowWidth) / 2

        for (let col = 0; col < enemiesInRow; col++) {
          const x = startX + col * (enemyWidth + spacing)
          const y = 50 + row * (enemyHeight + spacing)
          enemies.push(new Enemy(x, y, enemyWidth, enemyHeight))
        }
      }
    }

    function createDiamondFormation() {
      const rows = 7
      const enemyWidth = 40
      const enemyHeight = 30
      const spacing = 20

      for (let row = 0; row < rows; row++) {
        const enemiesInRow = row < rows / 2 ? row + 1 : rows - row
        const rowWidth = enemiesInRow * (enemyWidth + spacing) - spacing
        const startX = (canvas.width - rowWidth) / 2

        for (let col = 0; col < enemiesInRow; col++) {
          const x = startX + col * (enemyWidth + spacing)
          const y = 50 + row * (enemyHeight + spacing)
          enemies.push(new Enemy(x, y, enemyWidth, enemyHeight))
        }
      }
    }

    function createRandomFormation() {
      const maxEnemies = 30
      const enemyWidth = 40
      const enemyHeight = 30

      for (let i = 0; i < maxEnemies; i++) {
        const x = Math.random() * (canvas.width - enemyWidth)
        const y = Math.random() * (canvas.height / 2 - enemyHeight) + 50
        enemies.push(new Enemy(x, y, enemyWidth, enemyHeight))
      }
    }

    function createEnemies() {
      enemies = [] // Clear existing enemies
      const formations = [
        createTriangleFormation,
        createDiamondFormation,
        createRandomFormation,
      ]
      const selectedFormation =
        formations[Math.floor(Math.random() * formations.length)]
      selectedFormation()

      enemies.forEach((enemy) => (enemy.speed = INITIAL_ENEMY_SPEED))
      enemySpeed = INITIAL_ENEMY_SPEED
    }

    // Add this function to check for speed changes
    function checkSpeedChanges() {
      if (
        Enemy.speed !== INITIAL_ENEMY_SPEED ||
        enemySpeed !== INITIAL_ENEMY_SPEED
      ) {
        console.warn("Speed has changed from initial value!")
      }
    }

    function gameLoop() {
      if (!gameStarted) {
        // Display the start banner
        ctx.fillStyle = "white"
        ctx.font = "30px Arial"
        ctx.textAlign = "center"
        ctx.fillText(
          "Hit the space bar to start",
          canvas.width / 2,
          canvas.height / 2
        )
        animationFrameId = requestAnimationFrame(gameLoop)
        return
      }

      if (gameOver || gameWon) {
        ctx.fillStyle = "white"
        ctx.font = "30px Arial"
        ctx.textAlign = "center"
        ctx.fillText(
          gameOver ? "Game Over..." : "Game Won!",
          canvas.width / 2,
          canvas.height / 2 - 30
        )
        ctx.fillText(
          "Press space to restart",
          canvas.width / 2,
          canvas.height / 2 + 30
        )
        animationFrameId = requestAnimationFrame(gameLoop)
        return
      }

      // clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Draw and update game objects
      enemies.forEach((enemy) => {
        enemy.draw()
        enemy.move()
      })
      player.draw()
      bullets.forEach((bullet) => {
        bullet.draw()
        bullet.move()
      })

      // Check for collisions
      checkCollisions()
      checkGameWon()

      // Remove bullets that are off-screen
      bullets = bullets.filter((bullet) => bullet.y > 0)

      if (!gameOver && !gameWon) {
        // Check speeds every 2 seconds
        if (Math.floor(Date.now() / 2000) % 2 === 0) {
          checkSpeedChanges()
        }
      }

      // Request next frame
      animationFrameId = requestAnimationFrame(gameLoop)
    }

    function checkCollisions() {
      // Check for collisions between player and enemies
      enemies.forEach((enemy, enemyIndex) => {
        if (
          player.x < enemy.x + enemy.width &&
          player.x + player.width > enemy.x &&
          player.y < enemy.y + enemy.height &&
          player.y + player.height > enemy.y
        ) {
          gameOver = true
        }

        // Check for collisions between bullets and enemies
        bullets.forEach((bullet, bulletIndex) => {
          if (
            bullet.x < enemy.x + enemy.width &&
            bullet.x + bullet.width > enemy.x &&
            bullet.y < enemy.y + enemy.height &&
            bullet.y + bullet.height > enemy.y
          ) {
            enemies.splice(enemyIndex, 1)
            bullets.splice(bulletIndex, 1)
          }
        })
      })
    }

    function checkGameWon() {
      if (enemies.length === 0) {
        gameWon = true
      }
    }

    // Modify the event listener for player movement and shooting
    document.addEventListener("keydown", (e) => {
      if ((!gameStarted || gameOver || gameWon) && e.key === " ") {
        logGameState("Game restarting")
        Enemy.speed = INITIAL_ENEMY_SPEED
        enemySpeed = INITIAL_ENEMY_SPEED
        init()
      } else if (gameStarted && !gameOver && !gameWon) {
        if (e.key === "ArrowLeft") {
          player.move("left")
        } else if (e.key === "ArrowRight") {
          player.move("right")
        } else if (e.key === " ") {
          player.shoot()
        }
      }
    })

    // Start the game loop to display the banner
    requestAnimationFrame(gameLoop)
  }

  // Start checking for the canvas
  checkCanvas()
}

// Use DOMContentLoaded to ensure the DOM is fully loaded before running the game
document.addEventListener("DOMContentLoaded", initGame)
