class Entity {
	constructor(x, y, width, height, type) {
		this.x = x;
		this.y = y;
		this.width = width;
		this.height = height;
		this.type = type;

		// Gravity stuff
		this.gravity = 0;
		this.gravityFactor = 0.1;
		this.onGround = false;

		// Jumping stuff
		this.jumpPowerCurrent = 0;
		this.jumpPower = 3;
		this.jumping = false;

		this.removed = false;
	}

	move(dx, dy) {
		let newX = this.x + dx;
		let newY = this.y + dy;

		let colX = this.collision(newX, this.y);
		if(!colX)
			this.x = newX;

		let colY = this.collision(this.x, newY);
		if(!colY)
			this.y = newY;

		return colX || colY;
	}

	applyGravity() {
		if(!this.jumping) {
			this.onGround = this.move(0, this.gravity);
			if(!this.onGround) {
				this.gravity += this.gravityFactor;
			}else{
				// Don't set it to zero, otherwise this.move() will return true/false in a loop
				this.gravity = 0.1;
			}
		}else{
			let hitCeiling = this.move(0, -this.jumpPowerCurrent);
			this.jumpPowerCurrent -= this.gravityFactor;
			if(this.jumpPowerCurrent <= 0 || hitCeiling) {
				this.jumping = false;
			}

			// When the player is jumping, it's always in the air
			this.onGround = false;
		}
	}

	jump() {
		if(!this.jumping && this.onGround) {
			this.jumping = true;
			this.jumpPowerCurrent = this.jumpPower;
		}
	}

	collision(newX, newY) {
		let points = [
						[newX, newY], // Top left
						[newX + this.width, newY], // Top right
						[newX, newY + this.height], // Bottom left
						[newX + this.width, newY + this.height], // Bottom right
						[newX + this.width / 2, newY], // Top center
						[newX + this.width / 2, newY + this.height], // Bottom center
						[newX, newY + this.height / 2], // Left center
						[newX + this.width, newY + this.height / 2] // Right center
		];

		for(let i = 0; i < points.length; i++) {
			let p = points[i];
			if(this.collisionPoint(p[0], p[1]))
				return true;
		}

		return false;

		// return this.collisionPoint(newX, newY) || this.collisionPoint(newX + this.width, newY) || this.collisionPoint(newX, newY + this.height) ||
		// 		this.collisionPoint(newX + this.width, newY + this.height);
	}

	collisionPoint(px, py) {
		let tx = floor(px / TILE_SIZE);
		if(tx < 0 || tx >= ROWS) return true;

		let ty = floor(py / TILE_SIZE);
		if(ty < 0 || ty >= COLS) return true;

		let t = tiles[tx + ty * ROWS];

		if(!t)
			return false;

		return t.solid;
	}

	remove() {
		this.removed = true;
	}

	collides(other) {
		return this.x < other.x + other.width &&
			this.x + this.width > other.x &&
			this.y < other.y + other.height &&
			this.height + this.y > other.y;
	}

	contains(px, py) {
		return px > this.x && py > this.y && px < this.x + this.width && py < this.y + this.height;
	}
}

function getEntityByType(type, x, y) {
	if(type == "enemy") {
		return new Enemy(x, y);
	}else if(type == "bullet") {
		return new Bullet(x, y);
	}else if(type == "player") {
		return new Player(x, y);
	}
}
