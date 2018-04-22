let _nextTileID = 1; // 0 is reserved for null
let _tilesById = [];

class Tile {
	constructor(img, solid) {
		this.img = img;
		this.solid = solid;

		this.id = _nextTileID++;
		_tilesById[this.id] = this;
	}

	render(row, col) {
		//stroke(0);
		//fill(this.r, this.g, this.b);
		//rect(row * TILE_SIZE, col * TILE_SIZE, TILE_SIZE, TILE_SIZE);
		image(this.img, row * TILE_SIZE, col * TILE_SIZE, TILE_SIZE, TILE_SIZE);
	}
}

function getTileById(id) {
	return _tilesById[id];
}
