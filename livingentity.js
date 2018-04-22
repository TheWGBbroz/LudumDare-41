class LivingEntity extends Entity {
	constructor(x, y, width, height, type) {
		super(x, y, width, height, type);

		this.health = 100;
	}

	damage(dmg) {
		if(EDITOR && (this instanceof Player)) {
			// Don't take damage if editing
			return;
		}

		this.health -= dmg;
		if(this.health <= 0) {
			this.health = 0;

			// Call onDeath() if present
			if(this.onDeath) this.onDeath();

			this.remove();
		}
	}
}