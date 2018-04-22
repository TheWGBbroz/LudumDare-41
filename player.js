const PLAYER_SPEED = 4;

class Player extends LivingEntity {
	constructor(x, y) {
		super(x, y, 70/2, 94/2, "player");

		this.left = false;
		this.right = false;
		this.lastLeft = false;
		
		this.tryToJump = false;

		this.animation = new Animation(playerAnimation, 8, 0, true);
	}

	update() {
		if(this.animation.paused && (this.left || this.right)) {
			// Resume animation again
			this.animation.resume();
		}else if(!this.animation.paused && !(this.left || this.right)) {
			// Pause animation
			this.animation.pause();
		}

		if(this.left) {
			this.move(-PLAYER_SPEED, 0);

			if(!this.lastLeft) {
				// Animation still has right images
				this.animation.images = playerAnimation_rev;
				this.animation.updateCurrImage();
			}

			this.lastLeft = true;
		}else if(this.right) {
			this.move(PLAYER_SPEED, 0);

			if(this.lastLeft) {
				// Animation still has left images
				this.animation.images = playerAnimation;
				this.animation.updateCurrImage();
			}

			this.lastLeft = false;
		}

		for(let i = 0; i < entities.length; i++) {
			let e = entities[i];
			if(e == this) continue;

			if(e instanceof Enemy) {
				if(frameCount % 30 == 0 && this.collides(e)) {
					// Take damage!
					this.damage(10);
				}
			}
		}

		if(this.tryToJump)
			this.jump();

		this.applyGravity();

		this.animation.update();

		if(this.y > 350 && frameCount % 30 == 0) {
			this.damage(10);
		}
	}

	render() {
		image(this.animation.currImage, this.x, this.y, this.width, this.height);

		textSize(18);
		textAlign(RIGHT);
		fill(0);
		noStroke();
		text("Health: " + floor(this.health), this.x - 2, this.y - 2);
	}

	shoot() {
		if(screenJump > 0.2 || EDITOR) {
			entities.push(new Bullet(this.x + this.width / 2, this.y + 10, 10 * (this.lastLeft ? -1 : 1), 1, this));
		}else{
			// Screen is not jumping - In other words, no beat in the music!
			this.damage(5);
		}
	}

	onDeath() {
		deathScreen = true;
	}
}