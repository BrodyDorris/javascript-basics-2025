// A base object for all player modes
class PlayerMode {
    constructor() {
        this.gravity = 0.8;
        this.jumpStrength = -18;
    }
    update(player) {
        player.velocityY += this.gravity;
        player.y += player.velocityY;
    }
    handleInput(player) {}
}

class CubeMode extends PlayerMode {
    constructor() {
        super();
        this.color = '#00ff00';
    }
    handleInput(player) {
        if (!player.isJumping) {
            player.isJumping = true;
            player.velocityY = this.jumpStrength;
        }
    }
}

class ShipMode extends PlayerMode {
    constructor() {
        super();
        this.gravity = 0.4;
        this.jumpStrength = -6;
    }
    handleInput(player, inputState) {
        if (inputState.isPressing) {
            player.velocityY += this.jumpStrength;
        } else {
            player.velocityY += this.gravity;
        }
        player.y += player.velocityY;
    }
}

const gameModes = {
    'cube': new CubeMode(),
    'ship': new ShipMode()
};
