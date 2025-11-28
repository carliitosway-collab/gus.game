console.log("script.js está conectado y funcionando");

class Game {

    constructor() {
        this.gameContainer = document.getElementById("game-container");
        this.statusText = document.getElementById("statusText");
        this.scoreText = document.getElementById("scoreText");

        this.startScreen = document.getElementById("start-screen");
        this.startContent = document.getElementById("start-content");
        this.gameOverContent = document.getElementById("gameover-content");
        this.finalScore = document.getElementById("finalScoreElement");
        this.replayButton = document.getElementById("replayButton");


        this.gus = null;
        this.gusSize = 80;
        this.gusX = 0;
        this.gusY = 0;

        this.playerSpeed = 30;

        this.score = 0;

        this.gusPadding = 8;
        this.treatPadding = 4;
        this.enemyPadding = 6;

        this.step = 30;


        this.maxLives = 3;
        this.lives = this.maxLives;

        this.progressContainer = document.getElementById("progressContainer");
        this.progressFill = document.getElementById("progressFill");
        this.pointsPerLife = 30;
        this.progressPoints = 0;

        this.isHitCooldown = false;
        this.hitCooldownTime = 500;

        this.livesContainer = document.getElementById("livesContainer");

        this.treats = [];
        this.treatSize = 30;
        this.maxTreats = 6;
        this.treatMinSpeed = 3;
        this.treatMaxSpeed = 8;
        this.treatTypes = [
            { name: "normal", value: 1, speedFactor: 1 },
            { name: "bonus", value: 3, speedFactor: 2 },
            { name: "fast", value: 4, speedFactor: 3 },
            { name: "rare", value: 6, speedFactor: 2 },
            { name: "cookie", value: 5, speedFactor: 0.8 },
        ];

        this.enemies = [];
        this.enemySize = 30;
        this.maxEnemies = 6;
        this.enemySpeed = 4;
        this.enemyMinSpeed = 3;
        this.enemyMaxSpeed = 6;
        this.enemyInterval = null;
        this.enemyTypes = [

            { id: 1, level: "easy", speedFactor: 1, size: 40, className: "enemy1-easy" },
            { id: 1, level: "medium", speedFactor: 1.4, size: 45, className: "enemy1-medium" },
            { id: 1, level: "hard", speedFactor: 1.8, size: 50, className: "enemy1-hard" },

            { id: 2, level: "easy", speedFactor: 1, size: 40, className: "enemy2-easy" },
            { id: 2, level: "medium", speedFactor: 1.4, size: 45, className: "enemy2-medium" },
            { id: 2, level: "hard", speedFactor: 1.8, size: 50, className: "enemy2-hard" },
        ]

        this.isGameOver = false;
        this.treatInterval = null;

        this.audioStarted = false;


        this.musicMenu = new Audio("./assets/sounds/inicio.playhouse.mp3");
        this.musicMenu.volume = 0.5;
        this.musicMenu.loop = true;

        this.musicGame = new Audio("./assets/sounds/game.smile.mp3");
        this.musicGame.volume = 0.5;
        this.musicGame.loop = true;


        this.soundHit = new Audio("./assets/sounds/cat-meow.wav");
        this.soundGameOver = new Audio("./assets/sounds/game-over.wav");
        this.soundTreat = new Audio("./assets/sounds/chewing.wav");

        this.soundHit.volume = 0.6;
        this.soundGameOver.volume = 0.8;
        this.soundTreat.volume = 0.8;

    }

    init() {

        this.showStartScreen();

        if (this.replayButton) {
            this.replayButton.addEventListener("click", () => {
                if (this.isGameOver) {
                    this.restartGame();
                }
            });
        }
        setTimeout(() => {
            this.statusText.innerText = "Pulsa ESPACIO para comenzar";
        }, 2000);

        document.addEventListener("keydown", (event) =>
            this.handleKeyDown(event)
        );

        this.musicMenu.play();
    }

    showStartScreen() {
        if (this.startScreen) {
            this.startScreen.style.display = "flex";
        }

        if (this.startContent) {
            this.startContent.style.display = "block";
        }

        if (this.gameOverContent) {
            this.gameOverContent.style.display = "none";
        }
    }

    showGameOverScreen() {
        if (this.startScreen) {
            this.startScreen.style.display = "flex";
        }

        if (this.startContent) {
            this.startContent.style.display = "none";
        }

        if (this.gameOverContent) {
            this.gameOverContent.style.display = "block";
        }

        if (this.finalScore) {
            this.finalScore.innerText = this.score;
        }
    }

    hideStartScreen() {
        if (this.startScreen) {
            this.startScreen.style.display = "none";
        }
    }

    handleKeyDown(event) {
        console.log("Tecla pulsada:", event.code);

        if (!this.audioStarted) {
            if (this.musicMenu) {
                this.musicMenu.currentTime = 0;
                this.musicMenu.play();
            }
            this.audioStarted = true;
        }

        if (this.isGameOver && event.code === "Enter") {

            this.restartGame();
            return;
        }

        if (event.code === "Space") {
            if (!this.gus && !this.isGameOver) {
                this.hideStartScreen();
                this.starGame();
            }
            return;
        }

        if (this.isGameOver) return;

        if (this.gus) {
            this.moveGus(event.code);
        }
    }

    handleGameOver() {

        this.musicMenu.currentTime = 0;
        this.musicMenu.play();

        if (this.music) this.music.pause();

        this.soundGameOver.currentTime = 0;
        this.soundGameOver.play();

        this.isGameOver = true;

        if (this.treatInterval) clearInterval(this.treatInterval);
        if (this.enemyInterval) clearInterval(this.enemyInterval);


        this.enemies.forEach(e => e.active = false);
        this.treats.forEach(t => t.active = false);

        this.showGameOverScreen();

        this.statusText.style.display = "none";

    }

    starGame() {

        if (this.gus) {
            console.warn("starGame() llamado pero gus ya existe, no creo otro.");
            return;
        }

        this.musicMenu.pause();
        this.musicGame.currentTime = 0;
        this.musicGame.play();

        this.statusText.style.display = "none";

        this.lives = this.maxLives;
        this.updateLivesDisplay();

        this.progressPoints = 0;
        this.updateProgressBar();


        this.gameContainer.classList.add("playing");
        this.step = 30;

        this.createGus();
        this.createTreats();
        this.createEnemies();
        this.updateScoreText();
    }

    restartGame() {
        this.isGameOver = false;
        this.score = 0;

        this.statusText.style.display = "block";
        this.statusText.innerText = "Pulsa ESPACIO para comenzar";

        this.scoreText.innerText = `Puntos: ${this.score}`;

        this.gameContainer.innerHTML = "";
        this.gameContainer.classList.remove("playing");

        this.gus = null;
        this.treats = [];
        this.enemies = [];

        if (this.treatInterval) clearInterval(this.treatInterval);
        if (this.enemyInterval) clearInterval(this.enemyInterval);

        this.treatInterval = null;
        this.enemyInterval = null;

        const livesContainer = document.createElement("div");
        livesContainer.id = "livesContainer";
        this.gameContainer.appendChild(livesContainer);
        this.livesContainer = livesContainer;

        const progressContainer = document.createElement("div");
        progressContainer.id = "progressContainer";
        progressContainer.innerHTML = `
        <div id="progressBar">
            <div id="progressFill"></div>
        </div>
    `;
        this.gameContainer.appendChild(progressContainer);
        this.progressContainer = progressContainer;
        this.progressFill = progressContainer.querySelector("#progressFill");

        this.lives = this.maxLives;
        this.updateLivesDisplay();

        this.progressPoints = 0;
        this.updateProgressBar();

        this.showStartScreen();
    }

    createGus() {
        const gus = document.createElement("div");

        gus.id = "gus";
        this.gameContainer.appendChild(gus);
        this.gus = gus;
        this.gus.classList.add("gus-right");

        this.gusSize = 80;

        this.gusX = (this.gameContainer.clientWidth - this.gusSize) / 2;
        this.gusY = this.gameContainer.clientHeight - this.gusSize

        this.updateGusposition();
    }

    moveGus(key) {

        const gusWidth = 80;
        const containerWidth = this.gameContainer.clientWidth;
        const marginX = 20;

        if (key === "ArrowLeft") {
            this.gusX -= this.step;

            this.gus.classList.remove("gus-right", "gus-left");
            this.gus.classList.add("gus-left");

        } else if (key === "ArrowRight") {
            this.gusX += this.step;


            this.gus.classList.remove("gus-left", "gus-right");
            this.gus.classList.add("gus-right");
        } else {
            return;
        }

        const minX = marginX;
        const maxX = containerWidth - gusWidth - marginX;

        if (this.gusX < minX) this.gusX = minX;
        if (this.gusX > maxX) this.gusX = maxX;

        this.updateGusposition();
    }

    updateGusSpeed() {
        this.step = 20;

        if (this.score > 20) this.step = 30;
        if (this.score > 50) this.step = 80;
        if (this.score > 100) this.step = 110;
        if (this.score > 150) this.step = 160;
        if (this.score > 200) this.step = 300;
    }

    createTreats() {

        for (let i = 0; i < this.maxTreats; i++) {
            const treat = document.createElement("div");
            treat.classList.add("treat");
            treat.style.position = "absolute";
            treat.style.width = `${this.treatSize}px`;
            treat.style.height = `${this.treatSize}px`;
            treat.style.backgroundSize = "contain";
            treat.style.backgroundRepeat = "no-repeat";
            treat.style.backgroundPosition = "center";


            this.gameContainer.appendChild(treat);


            const randomType =
                this.treatTypes[Math.floor(Math.random() * this.treatTypes.length)];

            treat.classList.add(`treat--${randomType.name}`);


            const treatObj = {
                el: treat,
                x: 0,
                y: 0,
                active: true,
                type: randomType,

                speed:
                    (this.treatMinSpeed +
                        Math.random() *
                        (this.treatMaxSpeed - this.treatMinSpeed)) *
                    randomType.speedFactor,
                value: randomType.value,
            };

            this.placeTreatRandomly(treatObj);
            this.treats.push(treatObj);
        }

        this.treatInterval = setInterval(() => {
            this.moveTreats();
            this.checkTreatCollisions();
        }, 50);

    }

    moveTreats() {

        const marginBottom = 10;
        const maxY = this.gameContainer.clientHeight - this.treatSize - marginBottom;

        this.treats.forEach((treatObj) => {
            if (!treatObj.active) return;

            treatObj.y += treatObj.speed;

            if (treatObj.y > maxY) {
                this.placeTreatRandomly(treatObj);
                return;
            }
            treatObj.el.style.left = `${treatObj.x}px`;
            treatObj.el.style.top = `${treatObj.y}px`;
        });
    }

    placeTreatRandomly(treatObj) {
        const containerWidth = this.gameContainer.clientWidth;
        const containerHeight = this.gameContainer.clientHeight;

        const marginX = 20;
        const maxX = containerWidth - this.treatSize - marginX;

        treatObj.x = Math.floor(marginX + Math.random() * maxX);

        const extraOffset = Math.random() * containerHeight;
        treatObj.y = -this.treatSize - extraOffset;


        const randomType =
            this.treatTypes[Math.floor(Math.random() * this.treatTypes.length)];

        treatObj.type = randomType;
        treatObj.value = randomType.value;
        treatObj.speed =
            (this.treatMinSpeed +
                Math.random() *
                (this.treatMaxSpeed - this.treatMinSpeed)) *
            randomType.speedFactor;


        treatObj.el.className = "treat";
        treatObj.el.classList.add(`treat--${randomType.name}`);

        treatObj.el.style.left = `${treatObj.x}px`;
        treatObj.el.style.top = `${treatObj.y}px`;

    }

    checkTreatCollisions() {

        this.treats.forEach((treatObj) => {
            if (!treatObj.active) return;

            const gusLeft = this.gusX;
            const gusRigth = this.gusX + this.gusSize;
            const gusTop = this.gusY;
            const gusBotton = this.gusY + this.gusSize;

            const treatLeft = treatObj.x;
            const treatRight = treatObj.x + this.treatSize;
            const treatTop = treatObj.y;
            const treatBottom = treatObj.y + this.treatSize;

            const isColliding =
                gusLeft < treatRight &&
                gusRigth > treatLeft &&
                gusTop < treatBottom &&
                gusBotton > treatTop;

            if (isColliding) {

                this.soundTreat.currentTime = 0;
                this.soundTreat.play();

                this.gainPoints(treatObj.value);
                this.placeTreatRandomly(treatObj);
            }
        });
    }

    createEnemies() {
        for (let i = 0; i < this.maxEnemies; i++) {

            const randomType = this.enemyTypes[Math.floor(Math.random() * this.enemyTypes.length)];

            const enemy = document.createElement("div");
            enemy.classList.add("enemy", randomType.className);

            enemy.style.position = "absolute";
            enemy.style.width = `${randomType.size}px`;
            enemy.style.height = `${randomType.size}px`;

            this.gameContainer.appendChild(enemy);

            const baseSpeed = this.getEnemySpeed();

            const enemyObj = {
                el: enemy,
                x: 0,
                y: 0,
                type: randomType,
                active: true,
                baseSpeed: baseSpeed,
                speed: baseSpeed * randomType.speedFactor
            };

            this.placeEnemyRandomly(enemyObj);
            this.enemies.push(enemyObj);
        }

        this.enemyInterval = setInterval(() => {
            this.moveEnemies();
            this.checkEnemiesCollision();
        }, 50);
    }

    moveEnemies() {
        if (this.isGameOver) return;

        const marginBottom = 10;

        this.enemies.forEach((enemyObj) => {
            if (!enemyObj.active) return;

            const enemyHeight = enemyObj.type.size;
            const maxY = this.gameContainer.clientHeight - enemyHeight - marginBottom;

            enemyObj.y += enemyObj.speed;

            if (enemyObj.y > maxY) {
                this.placeEnemyRandomly(enemyObj);
                return;
            }

            enemyObj.el.style.left = `${enemyObj.x}px`;
            enemyObj.el.style.top = `${enemyObj.y}px`;
        });
    }

    getEnemySpeed() {
        const baseSpeed =
            this.enemyMinSpeed +
            Math.random() * (this.enemyMaxSpeed - this.enemyMinSpeed);

        const difficultyMultiplier = 1 + this.score * 0.02;

        return baseSpeed * difficultyMultiplier;
    }

    placeEnemyRandomly(enemyObj) {
        const containerWidth = this.gameContainer.clientWidth;
        const marginX = 20;

        const enemyWidth = enemyObj.type.size;
        const enemyHeight = enemyObj.type.size;

        const maxX = containerWidth - enemyWidth - marginX;

        enemyObj.x = Math.floor(marginX + Math.random() * maxX);

        enemyObj.y = -enemyHeight - Math.random() * 100;

        const baseSpeed = this.getEnemySpeed();
        enemyObj.baseSpeed = baseSpeed;
        enemyObj.speed = baseSpeed * enemyObj.type.speedFactor;

        enemyObj.el.style.left = `${enemyObj.x}px`;
        enemyObj.el.style.top = `${enemyObj.y}px`;
    }

    checkEnemiesCollision() {

        if (!this.gus || this.isGameOver) return;

        const gusLeft = this.gusX + this.gusPadding;
        const gusRight = this.gusX + this.gusSize - this.gusPadding;
        const gusTop = this.gusY + this.gusPadding;
        const gusBottom = this.gusY + this.gusSize - this.gusPadding;

        this.enemies.forEach((enemyObj) => {
            const size = enemyObj.type.size;

            const enemyLeft = enemyObj.x + this.enemyPadding;
            const enemyRight = enemyObj.x + size - this.enemyPadding;
            const enemyTop = enemyObj.y + this.enemyPadding;
            const enemyBottom = enemyObj.y + size - this.enemyPadding;

            const overlap =
                gusLeft < enemyRight &&
                gusRight > enemyLeft &&
                gusTop < enemyBottom &&
                gusBottom > enemyTop;

            if (overlap) {

                this.soundHit.currentTime = 0;
                this.soundHit.play();

                this.lives--;
                this.updateLivesDisplay();

                this.placeEnemyRandomly(enemyObj);

                if (this.lives <= 0) {
                    this.handleGameOver();
                }
            }
        });
    }

    updateGusposition() {
        this.gus.style.left = `${this.gusX}px`;
        this.gus.style.top = `${this.gusY}px`;
    }

    updateScoreText() {
        this.scoreText.innerText = `Puntos: ${this.score}`;
    }

    updateLivesDisplay() {
        if (!this.livesContainer) return;

        this.livesContainer.innerHTML = "";

        for (let i = 0; i < this.lives; i++) {
            const heart = document.createElement("span");
            heart.classList.add("heart");
            heart.textContent = "❤️";
            this.livesContainer.appendChild(heart);
        }
    }

    updateProgressBar() {
        if (!this.progressFill) return;

        const ratio = Math.min(this.progressPoints / this.pointsPerLife, 1);
        this.progressFill.style.width = `${ratio * 100}%`;
    }

    gainPoints(amount) {

        this.score += amount;
        this.updateScoreText();

        this.progressPoints += amount;

        while (this.progressPoints >= this.pointsPerLife) {
            this.progressPoints -= this.pointsPerLife;

            this.lives++;
            this.updateLivesDisplay();
        }

        this.updateProgressBar();

        this.updateGusSpeed();
    }
}

document.addEventListener("DOMContentLoaded", () => {
    const game = new Game();
    game.init();
}); 