class Animation {
	constructor(images, delay, pauseIndex, turning) {
		this.images = images || [];
		this.delay = delay || 5;
		this.pauseIndex = pauseIndex || 0;
		this.turning = turning || false;

		this.currImageId = 0;
		this.updateCurrImage();

		this.paused = false;

		// Only used when turning is true (Going back and forth)
		this.goingUp = true;
	}

	update() {
		if(this.paused) return;

		if(frameCount % this.delay == 0) {
			if(this.turning) {
				if(this.goingUp) {
					this.currImageId++;
					if(this.currImageId == this.images.length) {
						this.currImageId -= 2;
						this.goingUp = false;
					}
				}else{
					this.currImageId--;
					if(this.currImageId == -1) {
						this.currImageId += 2;
						this.goingUp = true;
					}
				}
			}else{
				this.currImageId++;
				if(this.currImageId == this.images.length)
					this.currImageId = 0;
			}

			this.updateCurrImage();
		}
	}

	updateCurrImage() {
		this.currImage = this.images[this.currImageId];
	}

	pause() {
		this.paused = true;

		this.currImageId = this.pauseIndex;
		this.updateCurrImage();
	}

	resume() {
		this.paused = false;
	}
}