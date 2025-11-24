console.log("script.js está conectado y funcionando");

class Game {
    constructor() {
        this.gameContainer = document.getElementById("game-container");
        this.statusText = document.getElementById("statusText");


        this.gus = null;
        this.gusSize = 40;
        this.step = 10;

        this.gusX = 0;
        this.gusY = 0;
    }
    init() {
        setTimeout(() => {
            this.statusText.innerText = "Pulsa ESPACIO para comenzar";
        }, 1000);

        document.addEventListener("keydown", (event) =>
            this.handleKeyDown(event)
        );
    }
    handleKeyDown(event) {
        console.log("Tecla pulsada:", event.code);

        if (event.code === "Space") {
            if (!this.gus) {
                this.starGame();
            }
            return;
        }

        if (this.gus) {
            this.moveGus(event.code);
        }
    }

    starGame() {
        this.statusText.style.display = "none";
        this.createGus();
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

    updateGusposition() {
        this.gus.style.left = `${this.gusX}px`;
        this.gus.style.top = `${this.gusY}px`;
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
}

document.addEventListener("DOMContentLoaded", () => {
    const game = new Game();
    game.init();
});

