const game = document.getElementById("game");
const player = document.getElementById("player");
const scoreDisplay = document.getElementById("score");

let playerX = game.clientWidth / 2 - 20;
let score = 0;
let moveLeft = false, moveRight = false;

// Movimentação do jogador
document.addEventListener("keydown", (event) => {
    if (event.key === "ArrowLeft") moveLeft = true;
    if (event.key === "ArrowRight") moveRight = true;
    if (event.key === " ") shoot();
});
document.addEventListener("keyup", (event) => {
    if (event.key === "ArrowLeft") moveLeft = false;
    if (event.key === "ArrowRight") moveRight = false;
});

// Movimentação para toque na tela (mobile)
game.addEventListener("touchmove", (event) => {
    let touchX = event.touches[0].clientX - game.offsetLeft;
    playerX = Math.max(0, Math.min(game.clientWidth - 40, touchX - 20));
    player.style.left = `${playerX}px`;
});

game.addEventListener("touchstart", shoot);

// Disparo do laser
function shoot() {
    let laser = document.createElement("div");
    laser.classList.add("laser");
    laser.style.left = `${playerX + 1}px`;
    laser.style.bottom = "40px";
    game.appendChild(laser);

    let laserInterval = setInterval(() => {
        laser.style.bottom = `${parseInt(laser.style.bottom) + 5}px`;

        // Remove o laser se sair da tela
        if (parseInt(laser.style.bottom) > game.clientHeight) {
            laser.remove();
            clearInterval(laserInterval);
        }

        // Checa colisão com asteroides
        document.querySelectorAll(".asteroid").forEach((asteroid) => {
            if (collision(laser, asteroid)) {
                laser.remove();
                asteroid.remove();
                clearInterval(laserInterval);
                score += 10;
                scoreDisplay.innerText = `Pontuação: ${score}`;
            }
        });
    }, 20);
}

// Criando asteroides
function spawnAsteroid() {
    let asteroid = document.createElement("div");
    asteroid.classList.add("asteroid");
    asteroid.style.left = `${Math.random() * (game.clientWidth - 30)}px`;
    asteroid.style.top = "0px";
    game.appendChild(asteroid);

    let asteroidInterval = setInterval(() => {
        asteroid.style.top = `${parseInt(asteroid.style.top) + 3}px`;

        if (parseInt(asteroid.style.top) > game.clientHeight) {
            asteroid.remove();
            clearInterval(asteroidInterval);
        }

        if (collision(asteroid, player)) {
            alert("Game Over!");
            location.reload();
        }
    }, 30);
}

// Verifica colisão
function collision(obj1, obj2) {
    let rect1 = obj1.getBoundingClientRect();
    let rect2 = obj2.getBoundingClientRect();
    return !(
        rect1.top > rect2.bottom ||
        rect1.right < rect2.left ||
        rect1.bottom < rect2.top ||
        rect1.left > rect2.right
    );
}

// Atualiza a posição do jogador continuamente
function update() {
    if (moveLeft) playerX = Math.max(0, playerX - 5);
    if (moveRight) playerX = Math.min(game.clientWidth - 40, playerX + 5);
    player.style.left = `${playerX}px`;
    requestAnimationFrame(update);
}

// Inicia o jogo
setInterval(spawnAsteroid, 1000);
update();