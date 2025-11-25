console.log("script.js está conectado y funcionando");

class Game {

    constructor() {
        this.gameContainer = document.getElementById("game-container");
        this.statusText = document.getElementById("statusText");
        this.scoreText = document.getElementById("scoreText");

        this.gus = null;
        this.gusSize = 40;
        this.gusX = 0;
        this.gusY = 0;

        this.playerSpeed = 10;

        this.score = 0;

        this.gusPadding = 8;
        this.treatPadding = 4;
        this.enemyPadding = 6;

        this.step = 10;

        this.treat = null;
        this.treatSize = 30;
        this.treatX = 0;
        this.treatY = 0;
        this.treatSpeed = 4;
        this.treatActive = false;
        this.treatTimeout = null;
        this.treatMinDelay = 800;
        this.treatMaxDelay = 2000;

        this.enemy = null;
        this.enemySize = 30;
        this.enemyX = 0;
        this.enemyY = 0;
        this.enemySpeed = 5;
        this.enemyActive = false;
        this.enemyTimeout = null;
        this.enemyMinDelay = 1000;
        this.enemyMaxDelay = 2500;

        this.isGameOver = false;
        this.enemyInterval = null;

    }

    init() {
        setTimeout(() => {
            this.statusText.innerText = "Pulsa ESPACIO para comenzar";
        }, 2000);

        document.addEventListener("keydown", (event) =>
            this.handleKeyDown(event)
        );
    }

    handleKeyDown(event) {
        console.log("Tecla pulsada:", event.code);

        if (event.code === "Space") {
            if (!this.gus && !this.isGameOver) {
                this.starGame();
            }
            return;
        }

        if (this.isGameOver) return;

        if (this.gus) {
            this.moveGus(event.code);
        }
    }

    starGame() {
        this.statusText.style.display = "none";
        this.createGus();
        this.createTreat();
        //setInterval(() => this.createTreat(), 3000);
        this.createEnemy();
        //setInterval(() => this.createEnemy(), 3000);
        this.updateScoreText();
    }

    createGus() {
        const gus = document.createElement("div");
        gus.id = "gus";


        this.gameContainer.appendChild(gus);
        this.gus = gus;

        const centerX = (this.gameContainer.clientWidth - this.gusSize) / 2;
        const centerY = (this.gameContainer.clientHeight - this.gusSize) / 2;

        this.gusX = centerX;
        this.gusY = centerY;

        this.updateGusposition();
    }


    moveGus(key) {

        if (key === "ArrowUp") {
            this.gusY -= this.step;
        } else if (key === "ArrowDown") {
            this.gusY += this.step;
        } else if (key === "ArrowLeft") {
            this.gusX -= this.step;
        } else if (key === "ArrowRight") {
            this.gusX += this.step;
        } else {
            return;
        }

        const maxX = this.gameContainer.clientWidth - this.gusSize;
        const maxY = this.gameContainer.clientHeight - this.gusSize;

        if (this.gusX < 0) this.gusX = 0;
        if (this.gusX > maxX) this.gusX = maxX;
        if (this.gusY < 0) this.gusY = 0;
        if (this.gusY > maxY) this.gusY = maxY;

        this.updateGusposition();
    }

    createTreat() {
        const treat = document.createElement("div");
        treat.id = "treat";

        this.gameContainer.appendChild(treat);
        this.treat = treat;

        this.treatActive = true;
        this.placeTreatRandomly();

        this.treatInterval = setInterval(() => {
            this.moveTreat();
            this.checkCollision(); // && this.checkCollision();
        }, 50);
    }

    moveTreat() {
        if (!this.treat) return;
        if (!this.treatActive) return;

        this.treatX -= this.treatSpeed;

        if (this.treatX < - this.treatSize) {
            this.despawnTreatAndScheduleRespawn();
            return;
        }

        this.treat.style.left = `${this.treatX}px`;
        this.treat.style.top = `${this.treatY}px`;
    }

    placeTreatRandomly() {
        if (!this.treat) return;

        const containerWidth = this.gameContainer.clientWidth;
        const maxY = this.gameContainer.clientHeight - this.treatSize;

        this.treatX = containerWidth - this.treatSize;
        this.treatY = Math.floor(Math.random() * maxY);

        this.treat.style.width = `${this.treatSize}px`;
        this.treat.style.height = `${this.treatSize}px`;
        this.treat.style.left = `${this.treatX}px`;
        this.treat.style.top = `${this.treatY}px`;
        this.treat.style.position = "absolute";
    }

    despawnTreatAndScheduleRespawn() {
        if (!this.treat) return;

        this.treatActive = false;
        this.treat.style.display = "none";

        const delay = Math.floor(Math.random() * (this.treatMaxDelay - this.treatMinDelay + 1)
        ) + this.treatMinDelay;

        this.treatTimeout = setTimeout(() => {
            this.placeTreatRandomly();
            this.treat.style.display = "block";
            this.treatActive = true;
        }, delay);
    }

    createEnemy() {
        if (!this.enemy) {
            const enemy = document.createElement("div");
            enemy.id = "enemy";

            this.gameContainer.appendChild(enemy);
            this.enemy = enemy;

            this.enemyInterval = setInterval(() => {
                this.moveEnemy();
                this.checkEnemyCollision();
            }, 50);
        }

        this.enemyActive = true;
        this.enemy.style.display = "block";
        this.placeEnemyRandomly();
    }

    moveEnemy() {
        if (!this.enemy) return;
        if (this.isGameOver) return;
        if (!this.enemyActive) return;

        this.enemyX -= this.enemySpeed;

        if (this.enemyX < - this.enemySize) {
            this.despawnEnemyAndScheduleRespawn();
            return;
        }

        this.enemy.style.left = `${this.enemyX}px`;
        this.enemy.style.top = `${this.enemyY}px`;
    }

    placeEnemyRandomly() {
        if (!this.enemy) return;

        const containerWidth = this.gameContainer.clientWidth;
        const maxY = this.gameContainer.clientHeight - this.enemySize;

        this.enemyX = containerWidth - this.enemySize,
            this.enemyY = Math.floor(Math.random() * maxY);

        this.enemy.style.width = `${this.enemySize}px`;
        this.enemy.style.height = `${this.enemySize}px`;
        this.enemy.style.left = `${this.enemyX}px`;
        this.enemy.style.top = `${this.enemyY}px`;
        this.enemy.style.position = "absolute";
    }

    despawnEnemyAndScheduleRespawn() {
        if (!this.enemy) return;

        this.enemyActive = false;
        this.enemy.style.display = "none";

        const delay = Math.floor(Math.random() * (this.enemyMaxDelay - this.enemyMinDelay + 1)
        ) + this.enemyMinDelay;

        if (this.enemyTimeout) {
            clearTimeout(this.enemyTimeout);
        }

        this.enemyTimeout = setTimeout(() => {
            this.placeEnemyRandomly();
            this.enemy.style.display = "block";
            this.enemyActive = true;
        }, delay);
    }

    updateGusposition() {
        this.gus.style.left = `${this.gusX}px`;
        this.gus.style.top = `${this.gusY}px`;
    }

    updateScoreText() {
        this.scoreText.innerText = `Puntos ${this.score}`
    }

    checkCollision() {

        if (!this.gus || !this.treat) return;

        const gusRect = this.gus.getBoundingClientRect();
        const treatRect = this.treat.getBoundingClientRect();

        const padding = 10;
        const treatPaddig = 4

        const overlap =
            gusRect.left + this.gusPadding < treatRect.right - this.treatPadding &&
            gusRect.right - this.gusPadding > treatRect.left + this.treatPadding &&
            gusRect.top + this.gusPadding < treatRect.bottom - this.treatPadding &&
            gusRect.bottom - this.gusPadding > treatRect.top + this.treatPadding;

        if (overlap) {
            this.score += 1;
            this.updateScoreText();

            this.treat.style.display = "none"

            this.despawnTreatAndScheduleRespawn();
        }
    }

    checkEnemyCollision() {
        if (!this.gus || !this.enemy || this.isGameOver || !this.enemyActive) return;

        const gusRect = this.gus.getBoundingClientRect();
        const enemyRect = this.enemy.getBoundingClientRect();

        const padding = 10;
        const gusPadding = 8;
        const enemyPadding = 6;

        const overlap =
            gusRect.left + this.gusPadding < enemyRect.right - this.enemyPadding &&
            gusRect.right - this.gusPadding > enemyRect.left + this.enemyPadding &&
            gusRect.top + this.gusPadding < enemyRect.bottom - this.enemyPadding &&
            gusRect.bottom - this.gusPadding > enemyRect.top + this.enemyPadding;

        if (!overlap) return;

        this.handleGameOver();
    }


    handleGameOver() {
        this.isGameOver = true;

        this.statusText.style.display = "block";
        this.statusText.innerText = "Game Over - pulsa F5 para reiniciar";

        if (this.treatInterval) clearInterval(this.treatInterval);
        if (this.enemyInterval) clearInterval(this.enemyInterval);
    }
}

document.addEventListener("DOMContentLoaded", () => {
    const game = new Game();
    game.init();
}); 