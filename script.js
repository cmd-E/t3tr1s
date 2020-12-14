let main = document.querySelector('.main')
let mainCells = [] // cells of playfield
let mainCellArr = [] // List of lists. Inner list contains rows of playfield cells (10 in each)
const scoreElem = document.getElementById('score')
const levelElem = document.getElementById('level')
const nextTetroElem = document.getElementById('next-tetro')
let ntCells = [] // cells of next tetromino area
let ntCellsArr = [] // List of lists. Inner list contains rows of next tetromino cells (4 in each)
const startPauseBtn = document.getElementById('startPause')
// const pauseBtn = document.getElementById('pause')
const gameOver = document.getElementById('game-over')
let livesImages = Array.from(document.querySelectorAll('img'))
let pauseCover = document.querySelector('.pause-cover')
let playField = [
	[0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
	[0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
	[0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
	[0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
	[0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
	[0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
	[0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
	[0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
	[0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
	[0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
	[0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
	[0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
	[0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
	[0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
	[0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
	[0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
	[0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
	[0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
	[0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
	[0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
]

const maxDeathCount = 3
let deaths = 0
let gameTimerID
let isPaused = true
let score = 0
let currentLevel = 1
let possibleLevels = {
	1: {
		scorePerLine: 10,
		speed: 400,
		nextLevelScore: 500,
	},
	2: {
		scorePerLine: 15,
		speed: 300,
		nextLevelScore: 1500,
	},
	3: {
		scorePerLine: 20,
		speed: 200,
		nextLevelScore: 2500,
	},
	4: {
		scorePerLine: 25,
		speed: 100,
		nextLevelScore: 3500,
	},
	5: {
		scorePerLine: 30,
		speed: 50,
		nextLevelScore: Infinity,
	},
}

let figures = {
	O: [
		[1, 1],
		[1, 1],
	],
	I: [
		[0, 0, 0, 0],
		[1, 1, 1, 1],
		[0, 0, 0, 0],
		[0, 0, 0, 0],
	],
	S: [
		[0, 1, 1],
		[1, 1, 0],
		[0, 0, 0],
	],
	Z: [
		[1, 1, 0],
		[0, 1, 1],
		[0, 0, 0],
	],
	L: [
		[1, 0, 0],
		[1, 1, 1],
		[0, 0, 0],
	],
	J: [
		[0, 0, 1],
		[1, 1, 1],
		[0, 0, 0],
	],
	T: [
		[1, 1, 1],
		[0, 1, 0],
		[0, 0, 0],
	],
}

let activeTetro = getNewTetro()
let nextTetro = getNewTetro()

/**
 * Draws playfield at page loading
 */
function drawNewPlayfield() {
	let mainInnerHTML = ''
	for (let y = 0; y < playField.length; y++) {
		for (let x = 0; x < playField[y].length; x++) {
			mainInnerHTML += '<div class="cell" style="opacity:0;"></div>'
		}
	}
	main.innerHTML = mainInnerHTML
	mainCells = Array.from(main.querySelectorAll('.cell'))
	while (mainCells.length) mainCellArr.push(mainCells.splice(0, 10))
	drawCleanNtGrid()
}

/**
 * Draws next tetromino grid at page loading
 */
function drawCleanNtGrid() {
	let nextTetroInnerHTML = ''
	for (let y = 0; y < 4; y++) {
		for (let x = 0; x < 4; x++) {
			nextTetroInnerHTML += '<div class="cell" style="opacity:0;"></div>'
		}
		nextTetroInnerHTML += '<br/>'
	}
	nextTetroElem.innerHTML = nextTetroInnerHTML
	ntCells = Array.from(nextTetroElem.querySelectorAll('.cell'))
	while (ntCells.length) ntCellsArr.push(ntCells.splice(0, 4))
}

/**
 * Draws playfield list to page. Opacity 1 means cell is displayed, 0 - not
 */
function draw() {
	for (let y = 0; y < playField.length; y++) {
		for (let x = 0; x < playField[y].length; x++) {
			if (playField[y][x] === 1) {
				mainCellArr[y][x].style.opacity = '1'
			} else if (playField[y][x] === 2) {
				mainCellArr[y][x].style.opacity = '1'
			} else {
				mainCellArr[y][x].style.opacity = '0'
			}
		}
	}
}

/**
 * Works like draw() method but for next tetromino
 */
function drawNextTetro() {
	ntCellsArr.forEach((row) => {
		row.forEach((cell) => {
			cell.style.opacity = 0
		})
	})
	for (let y = 0; y < nextTetro.shape.length; y++) {
		for (let x = 0; x < nextTetro.shape[y].length; x++) {
			if (nextTetro.shape[y][x] === 1) {
				ntCellsArr[y][x].style.opacity = 1
			} else {
				ntCellsArr[y][x].style.opacity = 0
			}
		}
	}
}

/**
 * Removes all "1" from playfield, used in addActiveTetro()
 */
function removePrevActiveTetro() {
	for (let y = 0; y < playField.length; y++) {
		for (let x = 0; x < playField[y].length; x++) {
			if (playField[y][x] === 1) {
				playField[y][x] = 0
			}
		}
	}
}

/**
 * Uses removePrevActiveTetro() to clear all "1" and add them one row down
 */
function addActiveTetro() {
	removePrevActiveTetro()
	for (let y = 0; y < activeTetro.shape.length; y++) {
		for (let x = 0; x < activeTetro.shape[y].length; x++) {
			if (activeTetro.shape[y][x] === 1) {
				playField[activeTetro.y + y][activeTetro.x + x] = activeTetro.shape[y][x]
			}
		}
	}
}
/**
 * Rotates list and if there're any collisions sets previous shape
 */
function rotateTetro() {
	const prevTetroState = activeTetro.shape
	activeTetro.shape = activeTetro.shape[0].map((val, index) => activeTetro.shape.map((row) => row[index]).reverse())
	if (hasCollisions()) {
		activeTetro.shape = prevTetroState
	}
}

/**
 * Checks if tetromino is in playfield borders, not placed in taken cell (checks only "1" because shape object is square of "1" and "0")
 */
function hasCollisions() {
	for (let y = 0; y < activeTetro.shape.length; y++) {
		for (let x = 0; x < activeTetro.shape[y].length; x++) {
			if (activeTetro.shape[y][x] === 1 && (playField[activeTetro.y + y] === undefined || playField[activeTetro.y + y][activeTetro.x + x] === undefined || playField[activeTetro.y + y][activeTetro.x + x] === 2)) {
				return true
			}
		}
	}
	return false
}

/**
 * Iterates over all playfield and checks if full row contains only "2" (taken cell). If yes - deletes row and adds new, full of zeros. After that, adds points according to current level
 */
function removeFullLines() {
	let canRemoveLine = true,
		filledLines = 0
	for (let y = 0; y < playField.length; y++) {
		for (let x = 0; x < playField[y].length; x++) {
			if (playField[y][x] !== 2) {
				canRemoveLine = false
				break
			}
		}
		if (canRemoveLine) {
			playField.splice(y, 1)
			playField.splice(0, 0, [0, 0, 0, 0, 0, 0, 0, 0, 0, 0])
			filledLines += 1
		}
		canRemoveLine = true
	}
	switch (filledLines) {
		case 1:
			score += possibleLevels[currentLevel].scorePerLine
			// scoreElem.innerHTML = score
			requestAnimationFrame(updateScore)
			break
		case 2:
			score += possibleLevels[currentLevel].scorePerLine * 3
			// scoreElem.innerHTML = score
			requestAnimationFrame(updateScore)
			break
		case 3:
			score += possibleLevels[currentLevel].scorePerLine * 6
			// scoreElem.innerHTML = score
			requestAnimationFrame(updateScore)
			break
		case 4:
			score += possibleLevels[currentLevel].scorePerLine * 12
			// scoreElem.innerHTML = score
			requestAnimationFrame(updateScore)
			break
	}

	if (score >= possibleLevels[currentLevel].nextLevelScore) {
		currentLevel++
		requestAnimationFrame(updateLevel)
		// levelElem.innerHTML = currentLevel
	}
	updateScore()
	updateLevel()
}
/**
 * Returns tetromino object that has centered x coordinate, y coordinate and random shape
 */
function getNewTetro() {
	const possibleFigures = 'IOLJTSZ'
	const rand = Math.floor(Math.random() * 7)
	const newTetro = figures[possibleFigures[rand]]
	return {
		x: Math.floor((10 - newTetro[0].length) / 2),
		y: 0,
		shape: newTetro,
	}
}

/**
 * Changes all "1" (active tetromino) to "2" (fixed tetromino)
 */
function fixTetro() {
	for (let y = 0; y < playField.length; y++) {
		for (let x = 0; x < playField[y].length; x++) {
			if (playField[y][x] === 1) {
				playField[y][x] = 2
			}
		}
	}
}
/**
 * Changes y coordinate of active shape. If shape has collisions on new coordinate, coordinate is reduced by 1 and tetromino is fixed, playfield is checked for fullLines, next tetro become active. If new shape already has collisions game is reset
 */
function moveTetroDown() {
	activeTetro.y += 1
	if (hasCollisions()) {
		activeTetro.y -= 1
		fixTetro()
		// removeFullLines()
		requestAnimationFrame(removeFullLines)
		activeTetro = nextTetro
		if (hasCollisions()) {
			reset()
		}
		nextTetro = getNewTetro()
	}
}

/**
 * Drops tetro to bottom
 */
function dropTetro() {
	for (let y = activeTetro.y; y < playField.length; y++) {
		activeTetro.y += 1
		if (hasCollisions()) {
			activeTetro.y -= 1
			break
		}
	}
}
// console.log(gamePaused.style.display, gamePaused.style.zIndex)

/**
 * Reset game state
 * @param {bool} manualReset check if it's manual reset or game over
 */
function reset(manualReset = false) {
	playField = [
		[0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
		[0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
		[0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
		[0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
		[0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
		[0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
		[0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
		[0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
		[0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
		[0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
		[0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
		[0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
		[0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
		[0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
		[0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
		[0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
		[0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
		[0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
		[0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
		[0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
	]
	if (manualReset) {
		gamePaused.style.display = 'none'
		pauseCover.style.zIndex = '0'
		activeTetro = getNewTetro()
		nextTetro = getNewTetro()
		updateGameState()
	} else {
		deaths++
		if (deaths < maxDeathCount) {
			requestAnimationFrame(removeLife)
			return
		}
		score = 0
		currentLevel = 1
		requestAnimationFrame(updateScore)
		requestAnimationFrame(updateLevel)
		requestAnimationFrame(removeLife)
		debugger
		clearInterval(gameTimerID)
		gameTimerID = undefined
		isPaused = true
		gameOver.style.display = 'block'
	}
}

function removeLife() {
	for (let i = 0; i < deaths; i++) {
		livesImages[i].style.display = 'none'
	}
}

/**
 * Arrows and space controls
 * @param {event} e default argument is passed to get keycodes. ISSUE: if arrow down pressed in the same time whem game moves tetro down, tetro will float above the latest row
 */
document.onkeydown = function (e) {
	if (!isPaused) {
		if (e.keyCode === 37) {
			activeTetro.x -= 1
			if (hasCollisions()) {
				activeTetro.x += 1
			}
		} else if (e.keyCode === 39) {
			activeTetro.x += 1
			if (hasCollisions()) {
				activeTetro.x -= 1
			}
		} else if (e.keyCode === 40) {
			dropTetro()
		} else if (e.keyCode === 38) {
			rotateTetro()
		}
		updateGameState()
	}
}

/**
 * Updates page (moves "1" in playfield list, draws playfield on page, draws next tetromino on page) every "possibleLevels[currentLevel].speed" seconds
 */
function updateGameState() {
	addActiveTetro()
	requestAnimationFrame(draw)
	requestAnimationFrame(drawNextTetro)
}

function updateScore() {
	scoreElem.innerHTML = score
}

function updateLevel() {
	levelElem.innerHTML = currentLevel
}

// pauseBtn.addEventListener('click', (e) => {
// 	if (e.target.innerHTML === 'Пауза') {
// 		e.target.innerHTML = 'Продолжить'
// 		pauseCover.style.display = 'block'
// 		clearInterval(gameTimerID)
// 	} else {
// 		e.target.innerHTML = 'Пауза'
// 		pauseCover.style.display = 'none'
// 		gameTimerID = setInterval(startGame, possibleLevels[currentLevel].speed)
// 	}
// 	isPaused = !isPaused
// })

startPauseBtn.addEventListener('click', (e) => {
	debugger
	if (!gameTimerID) {
		// gameOver.style.display = 'block'
		restoreLives()
		// isPaused = false
		e.target.innerHTML = 'Пауза'
		gameTimerID = setInterval(startGame, possibleLevels[currentLevel].speed)
		gameOver.style.display = 'none'
	} else if (e.target.innerHTML === 'Пауза') {
		e.target.innerHTML = 'Старт'
		pauseCover.style.display = 'block'
		clearInterval(gameTimerID)
	} else {
		// reset(true)
		gameTimerID = setInterval(startGame, possibleLevels[currentLevel].speed)
		pauseCover.style.display = 'none'
		// clearInterval(gameTimerID)
	}
	isPaused = !isPaused
})

function restoreLives() {
	deaths = 0
	for (let i = 0; i < livesImages.length; i++) {
		livesImages[i].style.display = 'inline-block'
	}
}

scoreElem.innerHTML = score
levelElem.innerHTML = currentLevel

requestAnimationFrame(drawNewPlayfield)

/**
 * Main function for setInterval
 */
function startGame() {
	updateGameState()
	moveTetroDown()
}
