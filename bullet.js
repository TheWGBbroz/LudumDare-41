const BULLET_MAX_LIFETIME = 60 * 5;
const BULLET_DAMAGE = 10;

class Bullet extends Entity {
	constructor(x, y, dx, dy, shooter) {
		super(x, y, 54/3, 43/3, "bullet");

		this.dx = dx || 0;
		this.dy = dy || 0;

		this.rot = 0;
		this.drot = random(0.1, 0.2) * (random() > 0.5 ? 1 : -1);

		this.shooter = shooter;

		this.framesAlive = 0;

		this.image = random(bulletImages);
	}

	update() {
		let col = this.move(this.dx, this.dy);
		if(col)
			this.remove();

		this.rot += this.drot;

		this.framesAlive++;
		if(this.framesAlive > BULLET_MAX_LIFETIME) {
			this.remove();
		}

		for(let i = 0; i < entities.length; i++) {
			let e = entities[i];
			if(e == this || e == this.shooter || !(e instanceof LivingEntity)) continue;

			if(this.collides(e)) {
				e.damage(BULLET_DAMAGE);
				this.remove();
				break;
			}
		}
	}

	render() {
		// noStroke();
		// fill(0, 0, 255);
		// rect(this.x, this.y, this.width, this.height);

		push();
		translate(this.x + this.width / 2, this.y + this.height / 2);
		rotate(this.rot);
		imageMode(CENTER);
		image(this.image, 0, 0, this.width, this.height);
		pop();
	}
}