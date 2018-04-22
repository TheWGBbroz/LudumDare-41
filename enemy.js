const ENEMY_SPEED = 2;

class Enemy extends LivingEntity {
	constructor(x, y) {
		super(x, y, 54, 31, "enemy");

		this.left = random() > 0.5;

		this.snail = random() > 0.5;
		this.images = this.snail ? enemyAnimation : enemyAnimation2;
		this.images_rev = this.snail ? enemyAnimation_rev : enemyAnimation2_rev;

		this.animation = new Animation(this.images, 16);
	}

	update() {
		let turn = this.move((this.left ? -1 : 1) * ENEMY_SPEED, 0);

		if(!turn) {
			// Check other conditions to turn for
			let tx = floor((this.x + this.width / 2) / TILE_SIZE);
			let ty = floor((this.y + this.height / 2) / TILE_SIZE);
			
			tx += (this.left ? -1 : 1);
			ty += 1;

			if(!tiles[tx + ty * ROWS]) {
				turn = true;
			}
		}

		if(turn) {
			this.left = !this.left;

			this.animation.images = this.left ? this.images : this.images_rev;
			this.animation.updateCurrImage();
		}

		this.applyGravity();

		this.animation.update();
	}

	render() {
		// stroke(0);
		// fill(0, 0, 255);
		// rect(this.x, this.y, this.width, this.height);
		image(this.animation.currImage, this.x, this.y, this.width, this.height);
	}
}