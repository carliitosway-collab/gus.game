console.log("script.js está conectado y funcionando");

class Game {

    constructor() {
        this.gameContainer = document.getElementById("game-container");
        this.statusText = document.getElementById("statusText");
        this.scoreText = document.getElementById("scoreText");

        this.gus = null;
        this.gusSize = 80;
        this.gusX = 0;
        this.gusY = 0;

        this.playerSpeed = 10;

        this.score = 0;

        this.gusPadding = 8;
        this.treatPadding = 4;
        this.enemyPadding = 6;

        this.step = 10;

        this.treats = [];
        this.treatSpeed = 4;
        this.treatSize = 30;
        this.maxTreats = 3;
        this.treatMinSpeed = 2;
        this.treatMaxSpeed = 5;


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

        if (this.isGameOver && event.code === "Enter") {

            this.restartGame();
            return;
        }

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

    handleGameOver() {
        this.isGameOver = true;

        this.statusText.style.display = "block";
        this.statusText.innerText = "Game Over - pulsa ENTER para reiniciar";

        if (this.treatInterval) clearInterval(this.treatInterval);
        if (this.enemyInterval) clearInterval(this.enemyInterval);
    }

    restartGame() {
        this.isGameOver = false;
        this.score = 0;

        this.statusText.style.display = "none";
        this.scoreText.innerText = `Puntos: ${this.score}`;

        this.gameContainer.innerHTML = "";

        this.gus = null;
        this.treats = [];
        this.enemy = null;

        if (this.treatInterval) clearInterval(this.treatInterval);
        if (this.enemyInterval) clearInterval(this.enemyInterval);
        if (this.enemyTimeout) clearTimeout(this.enemyTimeout);
        this.treatInterval = null;
        this.enemyInterval = null;
        this.enemyTimeout = null;


        setTimeout(() => {
            this.statusText.style.display = "block";
            this.statusText.innerText = "Pulsa ESPACIO para comenzar";
        }, 300);
    }




    starGame() {
        this.statusText.style.display = "none";
        this.createGus();
        this.createTreats();
        this.createEnemy();
        this.updateScoreText();
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

    createTreats() {
        const treatTypes = ["normal", "bonus", "fast"];

        for (let i = 0; i < this.maxTreats; i++) {
            const treat = document.createElement("div");
            treat.classList.add("treat");
            treat.style.position = "absolute";
            treat.style.width = `${this.treatSize}px`;
            treat.style.height = `${this.treatSize}px`;

            const randomType = treatTypes[Math.floor(Math.random() * treatTypes.length)];
            treat.classList.add(`treat--${randomType}`);

            this.gameContainer.appendChild(treat);

            const treatObj = {
                el: treat,
                x: 0,
                y: 0,
                active: true,
                type: randomType,
                speed: this.treatMinSpeed + Math.random() * (this.treatMaxSpeed - this.treatMinSpeed)
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
                setTimeout(() => {
                    this.placeTreatRandomly(treatObj);
                }, Math.random() * 1000);
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

        treatObj.el.style.left = `${treatObj.x}px`;
        treatObj.el.style.top = `${treatObj.y}px`;
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


        this.enemyY += this.enemySpeed;

        const marginBottom = 10;
        const maxY = this.gameContainer.clientHeight - this.enemySize - marginBottom;

        if (this.enemyY > maxY) {
            this.despawnEnemyAndScheduleRespawn();
            return;
        }

        this.enemy.style.left = `${this.enemyX}px`;
        this.enemy.style.top = `${this.enemyY}px`;
    }

    placeEnemyRandomly() {
        if (!this.enemy) return;

        const containerWidth = this.gameContainer.clientWidth;

        const marginX = 20;

        const maxX = containerWidth - this.enemySize - marginX;

        this.enemyX = Math.floor(marginX + Math.random() * maxX);

        this.enemyY = -this.enemySize;

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
                this.score++;
                this.updateScoreText();

                this.placeTreatRandomly(treatObj);
            }
        });
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

}

document.addEventListener("DOMContentLoaded", () => {
    const game = new Game();
    game.init();
}); 