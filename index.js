const TILE_SIZE = 32;
let ROWS = 100;
let COLS = 20;

const EDITOR = false;

const NUM_LEVELS = 5;

let loadedLevel = false;
let player;
let entities;
let tiles;

let selectedTileId = 1;

let screenXOff = 0, screenYOff = 0;

let screenJump = 0;
let screenJumping = false;

let fft;
let lastFFTAvg = 0;

let nextLevelDelay = 0;

let levelId = -1; // Next level will be (-1)++, which is 0.

// Next level screen
let nextLevelScreen = false;
let nextLevelCounter = 0;
let nextLevelTextSize = 0;
//

// Game completed screen
let gameCompletedScreen = false;
//

// Death screen
let deathScreen = false;
let deathScreenCounter = 0;
let deathScreenTextSize = 0;
//

// Assets
let music;

let font;

let screenOutline;
let sadFace;
let backgroundImg;

let playerAnimation;
let playerAnimation_rev;

let enemyAnimation;
let enemyAnimation_rev;

let enemyAnimation2;
let enemyAnimation2_rev;

let bulletImages;
//

function preload() {
	music = loadSound("Chiptoise.mp3");

	font = loadFont("Gugi-Regular.ttf");

	screenOutline = loadImage("outline.png");
	sadFace = loadImage("blockerSad.png");
	backgroundImg = loadImage("bg_grasslands.png");

	// Load all tiles
	let tilePaths = ["sandRight.png", "ladder_mid.png", "sand.png", "boxAlt.png", "snow.png", "stoneMid.png", "dirtCenter.png", "snowHalf.png", "boxExplosive.png", "snowLeft.png", "grassCenter.png", "castleLeft.png", "snowHalfMid.png", "boxItemAlt_disabled.png", "dirtMid.png", "stoneCenter.png", "grassCenter_rounded.png", "castleHalfLeft.png", "boxExplosiveAlt.png", "snowHalfLeft.png", "dirtCenter_rounded.png", "stoneHalfLeft.png", "boxCoinAlt.png", "brickWall.png", "sandCenter.png", "snowCenter_rounded.png", "stoneLeft.png", "boxCoinAlt_disabled.png", "signLeft.png", "castleRight.png", "castleHalfMid.png", "sandHalfRight.png", "stoneCenter_rounded.png", "castle.png", "grassHalf.png", "bridge.png", "boxCoin_disabled.png", "boxEmpty.png", "castleCenter_rounded.png", "bridgeLogs.png", "boxItem_disabled.png", "stoneHalf.png", "stoneHalfRight.png", "stoneWall.png", "box.png", "snowHalfRight.png", "grassRight.png", "signExit.png", "sandLeft.png", "sandHalfLeft.png", "sandHalfMid.png", "castleMid.png", "grassMid.png", "boxExplosive_disabled.png", "dirtRight.png", "dirt.png", "sandMid.png", "snowRight.png", "grassHalfMid.png", "castleCenter.png", "stoneHalfMid.png", "castleHalf.png", "dirtHalfRight.png", "snowCenter.png", "stoneRight.png", "stone.png", "signRight.png", "boxWarning.png", "grass.png", "dirtHalfMid.png", "dirtHalfLeft.png", "dirtLeft.png", "boxItemAlt.png", "grassHalfLeft.png", "grassHalfRight.png", "fence.png", "sandHalf.png", "ladder_top.png", "boxCoin.png", "castleHalfRight.png", "sandCenter_rounded.png", "boxItem.png", "grassLeft.png", "fenceBroken.png", "snowMid.png", "dirtHalf.png"];
	tilePaths.forEach(path => {
		new Tile(loadImage("tiles/" + path), true);
	});

	// Load player animation
	let playerAnimationPaths = ["p2_walk02.png", "p2_walk03.png", "p2_walk11.png", "p2_walk06.png", "p2_walk04.png", "p2_walk05.png", "p2_walk10.png", "p2_walk01.png", "p2_walk07.png", "p2_walk08.png", "p2_walk09.png"];
	playerAnimation = [];
	for(let i = 0; i < playerAnimationPaths.length; i++) {
		playerAnimation[i] = loadImage("player_animation/" + playerAnimationPaths[i]);
	}

	// Load enemy animation
	let enemyAnimationPaths = ["snailWalk1.png", "snailWalk2.png"];
	enemyAnimation = [];
	for(let i = 0; i < enemyAnimationPaths.length; i++) {
		enemyAnimation[i] = loadImage("enemy_animation/" + enemyAnimationPaths[i]);
	}

	// Load enemy 2 animation
	let enemyAnimation2Paths = ["slimeWalk1.png", "slimeWalk2.png"];
	enemyAnimation2 = [];
	for(let i = 0; i < enemyAnimation2Paths.length; i++) {
		enemyAnimation2[i] = loadImage("enemy_animation/" + enemyAnimation2Paths[i]);
	}

	// Load bullets
	let bulletPaths = ["particle_beige.png", "particle_grey.png", "particle_darkGrey.png", "particle_brown.png", "particle_darkBrown.png"];
	bulletImages = [];
	for(let i = 0; i < bulletPaths.length; i++) {
		bulletImages[i] = loadImage("bullets/" + bulletPaths[i]);
	}
}

function setup() {
	if(EDITOR)
		console.log("Editing mode enabled!");

	playerAnimation_rev = [];
	for(let i = 0; i < playerAnimation.length; i++) {
		playerAnimation_rev[i] = reverseImage(playerAnimation[i]);
	}

	enemyAnimation_rev = [];
	for(let i = 0; i < enemyAnimation.length; i++) {
		enemyAnimation_rev[i] = reverseImage(enemyAnimation[i]);
	}

	enemyAnimation2_rev = [];
	for(let i = 0; i < enemyAnimation2.length; i++) {
		enemyAnimation2_rev[i] = reverseImage(enemyAnimation2[i]);
	}

	let canvas = createCanvas(640, 480);
	canvas.parent("#canvas-holder");

	fft = new p5.FFT();
	music.loop();

	textFont(font);

	if(EDITOR) {
		loadedLevel = false;
		loadLevel("empty_level.json");
		console.log("Loaded empty level");
	}else{
		nextLevel();
	}
}

function reverseImage(src) {
	let dst = createImage(src.width, src.height);

	src.loadPixels();
	dst.loadPixels();

	for(let y = 0; y < src.height; y++) {
		for(let x = 0; x < src.width; x++) {
			let src_index = (x + y * src.width) * 4;
			let dst_index = ((src.width - x - 1) + y * src.width) * 4;
			dst.pixels[dst_index + 0] = src.pixels[src_index + 0];
			dst.pixels[dst_index + 1] = src.pixels[src_index + 1];
			dst.pixels[dst_index + 2] = src.pixels[src_index + 2];
			dst.pixels[dst_index + 3] = src.pixels[src_index + 3];
		}
	}

	dst.updatePixels();

	return dst;
}

function restartLevel() {
	levelId--;
	nextLevel();
}

function nextLevel() {
	screenYOff = 0;

	levelId++;

	console.log(levelId, NUM_LEVELS);
	if(levelId >= NUM_LEVELS) {
		console.log("Completed all levels.");

		gameCompletedScreen = true;

		return;
	}

	loadedLevel = false;
	loadLevel("level_" + levelId + ".json");

	console.log("Level " + levelId + "!");
}

function setupTestLevel() {
	entities = [];

	player = new Player(10, 10);
	entities.push(player);

	entities.push(new Enemy(100, 10));

	tiles = [];
	for(let i = 0; i < 100; i++) {
		tiles[i + 10 * ROWS] = getTileById(1);
	}

	loadedLevel = true;
}

function draw() {
	background(0);

	jumpScreen();

	push();
	translate(width / 2, height / 2);
	scale(screenJump * 0.02 + 1);
	translate(-width / 2, -height / 2);

	if(nextLevelScreen) {
		textSize(64);
		fill(255);
		noStroke();
		textAlign(CENTER, CENTER);
		text("Level cleared!", width / 2, 150);

		if(nextLevelCounter > 60) {
			nextLevelTextSize = lerp(nextLevelTextSize, 48, 0.02);
			textSize(nextLevelTextSize);

			text("Press space to continue..", width / 2, 250);
		}

		nextLevelCounter++;

		return;
	}else { nextLevelCounter = 0; nextLevelTextSize = 0; }

	if(gameCompletedScreen) {
		textSize(64);
		fill(255);
		noStroke();
		textAlign(CENTER, CENTER);
		text("Game over!", width / 2, 80);

		textSize(48);
		text("Thanks for playing!", width / 2, 170);

		textSize(24);
		textAlign(CENTER, TOP);
		text("This game was made in 48 hours for the\nLudum Dare game jam by TheWGBbroz.\n\nMusic by Natanielc, graphics by Kenney", width / 2, 240);

		return;
	}

	if(deathScreen) {
		push();
		imageMode(CENTER);
		image(sadFace, width / 2, 160, 64, 64);
		pop();

		textSize(64);
		fill(255);
		noStroke();
		textAlign(CENTER, CENTER);
		text("You died!", width / 2, 80);

		textSize(24);
		text("Better luck next time!", width / 2, 240);

		if(deathScreenCounter > 60) {
			deathScreenTextSize = lerp(deathScreenTextSize, 32, 0.02);
			textSize(deathScreenTextSize);

			text("Press space to retry..", width / 2, 290);
		}

		deathScreenCounter++;

		return;
	}else { deathScreenCounter = 0; deathScreenTextSize = 0; }

	background(208, 244, 247);

	if(!loadedLevel)
		return;

	pop();

	let numEnemies = 0;
	for(let i = 0; i < entities.length; i++) {
		entities[i].update();
		if(entities[i].removed) {
			entities.splice(i--, 1);
		}

		if(entities[i] instanceof Enemy)
			numEnemies++;
	}

	if(numEnemies == 0 && !EDITOR) {
		nextLevelDelay++;
		if(nextLevelDelay > 60) {
			nextLevelScreen = true;
		}
	}else nextLevelDelay = 0;

	screenXOff = -player.x - player.width / 2 + width / 2;
	//screenYOff = -player.y - player.height / 2 + height / 2;
	if((player.y - height / 2) - -screenYOff > 100)
		screenYOff -= 1.5;
	if((player.y - height / 2) - -screenYOff < -100)
		screenYOff += 1.5;

	push();

	translate(width / 2, height / 2);
	scale(screenJump * 0.1 + 1);
	translate(-width / 2, -height / 2);

	translate(screenXOff, screenYOff);

	image(backgroundImg, floor(player.x / width) * width        , 0, width, height);
	image(backgroundImg, floor(player.x / width) * width + width, 0, width, height);
	image(backgroundImg, floor(player.x / width) * width - width, 0, width, height);

	entities.forEach(e => e.render());

	renderTiles();

	pop();

	push();
	translate(width / 2, height / 2);
	scale(screenJump * 0.05 + 1);
	translate(-width / 2, -height / 2);

	tint(255, 255, 255, 255 - (player.health / 100) * 255);
	image(screenOutline, 0, 0, width, height);
	pop();

	if(EDITOR) {
		// Editor stuff

		let selectedTile = getTileById(selectedTileId);

		// Placing tiles
		if(mouseIsPressed && mouseX >= 0 && mouseY >= 0 && mouseX < width && mouseY < height) {
			let selectedEntity = false;
			for(let i = 0; i < entities.length; i++) {
				if(entities[i].contains(mouseX - screenXOff, mouseY - screenYOff)) {
					selectedEntity = entities[i];
					break;
				}
			}

			if(selectedEntity) {
				// Remove entity
				if(!(selectedEntity instanceof Player)) {
					entities.splice(entities.indexOf(selectedEntity), 1);
				}else{
					console.log("Can't remove the player!");
				}
			}else{
				// Remove tile
				let tx = floor((mouseX - screenXOff) / TILE_SIZE);
				let ty = floor((mouseY - screenYOff) / TILE_SIZE);
				if(tx >= 0 && tx < ROWS && ty >= 0 && ty < COLS) {
					tiles[tx + ty * ROWS] = mouseButton == "center" ? undefined : selectedTile;
				}
			}
		}

		if(selectedTile) {
			let ctx = (width / TILE_SIZE) / 2 - 0.5;
			for(let i = -5; i <= 5; i++) {
				let tile = getTileById(selectedTileId + i);
				if(!tile) continue;

				tile.render(ctx + (i * 1.2), 1);
			}
			noFill();
			stroke(255, 0, 0);
			strokeWeight(3);
			rect(ctx * TILE_SIZE - 2, TILE_SIZE - 2, TILE_SIZE + 3, TILE_SIZE + 3);
			strokeWeight(1);
		}
	}
}

function jumpScreen() {
	if(isOnBeat()) {
		screenJumping = true;
	}

	if(screenJumping) {
		screenJump = lerp(screenJump, 1.2, 0.16);
		if(screenJump > 0.9)
			screenJumping = false;
	}else{
		screenJump = lerp(screenJump, 0, 0.22);
	}
}

function isOnBeat(offset = 0) {
	let spec = fft.analyze();
	let avg = 0;
	for(let i = 0; i < 256; i++) {
		avg += spec[i];
	}

	avg /= 256;
	
	let change = avg / max(lastFFTAvg, 1);

	lastFFTAvg = avg;

	return change > 1.03;
}

function renderTiles() {
	let startRow = floor(-screenXOff / TILE_SIZE);
	let startCol = floor(-screenYOff / TILE_SIZE);
	let numX = floor(width / TILE_SIZE) + 1;
	let numY = floor(height / TILE_SIZE) + 1;

	for(let j = 0; j < numY; j++) {
		let col = startCol + j;
		if(col < 0 || col >= COLS) continue;

		for(let i = 0; i < numX; i++) {
			let row = startRow + i;
			if(row < 0 || row >= ROWS) continue;

			let t = tiles[row + col * ROWS];
			if(t) {
				t.render(row, col);
			}
		}
	}
}

// Should be called from console
function saveLevel() {
	let level = {};

	// Save dimensions
	level.rows = ROWS;
	level.cols = COLS;

	// Save tiles
	{
		let tilesSerialized = [];
		for(let i = 0; i < tiles.length; i++) {
			tilesSerialized[i] = tiles[i] ? tiles[i].id : 0;
		}

		level.tiles = tilesSerialized;
	}

	// Save player coordinates
	level.playerX = player.x;
	level.playerY = player.y;

	// Save entities
	{
		let entitiesSerialized = [];
		for(let i = 0; i < entities.length; i++) {
			let e = entities[i];
			if(e instanceof Player) continue;

			entitiesSerialized.push({
				type: e.type,
				x: e.x,
				y: e.y
			});
		}

		level.entities = entitiesSerialized;
	}

	saveJSON(level, "level.json", true);

	return level;
}

function loadLevel(level, callback) {
	if(typeof level === "string") {
		// Load this file
		loadJSON(level, json => loadLevel(json, callback));
		return;
	}

	// Load dimensions
	ROWS = level.rows;
	COLS = level.cols;

	// Load tiles
	{
		tiles = [];
		for(let i = 0; i < ROWS * COLS; i++) {
			tiles[i] = getTileById(level.tiles[i]);
		}
	}

	// Load player
	player = new Player(level.playerX, level.playerY);

	// Load entities
	{
		entities = [];
		entities.push(player);

		for(let i = 0; i < level.entities.length; i++) {
			let e = level.entities[i];

			entities.push(getEntityByType(e.type, e.x, e.y));
		}
	}

	loadedLevel = true;
}

function keyPressed() {
	if(nextLevelScreen) {
		if(key == ' ' && nextLevelCounter > 30) {
			nextLevelScreen = false;
			nextLevel();
		}

		return;
	}

	if(deathScreen) {
		if(key == ' ' && deathScreenCounter > 30) {
			deathScreen = false;
			restartLevel();
		}

		return;
	}

	if(EDITOR) {
		if(key == 'e') {
			entities.push(new Enemy(player.x, player.y));
		}
	}

	if(key == 'a') {
		player.left = true;
	}else if(key == 'd') {
		player.right = true;
	}else if(key == ' ') {
		player.tryToJump = true;
	}else if(key == 'f') {
		player.shoot();
	}
}

function keyReleased() {
	if(nextLevelScreen) {
		return;
	}

	if(key == 'a') {
		player.left = false;
	}else if(key == 'd') {
		player.right = false;
	}else if(key == ' ') {
		player.tryToJump = false;
	}
}

function mouseWheel(e) {
	if(EDITOR) {
		if(e.delta < 0) {
			// Up
			selectedTileId++;
		}else {
			// Down
			selectedTileId--;
		}
	}
}
