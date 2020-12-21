let main = document.querySelector('.main')
let mainCells = [] // cells of playfield
let mainCellArr = [] // List of lists. Inner list contains rows of playfield cells (10 in each)
const scoreElem = document.getElementById('score')
const levelElem = document.getElementById('level')
const nextTetroElem = document.getElementById('next-tetro')
let ntCells = [] // cells of next tetromino area
let ntCellsArr = [] // List of lists. Inner list contains rows of next tetromino cells (4 in each)
const startPauseBtn = document.getElementById('startPause')
const restartBtn = document.getElementById('restartBtn')
const restartBtn2 = document.getElementById('restartBtn2') // button from gameover menu
const gameOver = document.getElementById('game-over')
let livesImages = Array.from(document.querySelectorAll('img'))
let pauseCover = document.querySelector('.pause-cover')
const rowPopAudio = new Audio('./sounds/row-pop.wav')
const gameOverAudio = new Audio('./sounds/game-over.wav')
let soundIsOn = true
document.getElementById('sound-icon').addEventListener('click', (e) => {
	if (soundIsOn) {
		e.target.src = './images/sound-off.svg'
	} else {
		e.target.src = './images/sound-on.svg'
	}
	soundIsOn = !soundIsOn
})
let rowRemoved = false
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
			mainInnerHTML += '<div class="cell" style="opacity:0.25;"></div>'
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
			nextTetroInnerHTML += '<div class="cell" style="opacity:0.25;"></div>'
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
	if (rowRemoved && soundIsOn) {
		rowPopAudio.play()
		rowRemoved = false
	}
	for (let y = 0; y < playField.length; y++) {
		for (let x = 0; x < playField[y].length; x++) {
			if (playField[y][x] === 1) {
				mainCellArr[y][x].style.opacity = '1'
			} else if (playField[y][x] === 2) {
				mainCellArr[y][x].style.opacity = '1'
			} else {
				mainCellArr[y][x].style.opacity = '0.25'
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
			cell.style.opacity = '0.25'
		})
	})
	for (let y = 0; y < nextTetro.shape.length; y++) {
		for (let x = 0; x < nextTetro.shape[y].length; x++) {
			if (nextTetro.shape[y][x] === 1) {
				ntCellsArr[y][x].style.opacity = 1
			} else {
				ntCellsArr[y][x].style.opacity = '0.25'
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
			rowRemoved = true
		}
		canRemoveLine = true
	}
	switch (filledLines) {
		case 1:
			score += possibleLevels[currentLevel].scorePerLine
			requestAnimationFrame(updateScore)
			break
		case 2:
			score += possibleLevels[currentLevel].scorePerLine * 3
			requestAnimationFrame(updateScore)
			break
		case 3:
			score += possibleLevels[currentLevel].scorePerLine * 6
			requestAnimationFrame(updateScore)
			break
		case 4:
			score += possibleLevels[currentLevel].scorePerLine * 12
			requestAnimationFrame(updateScore)
			break
	}
	if (score >= possibleLevels[currentLevel].nextLevelScore) {
		currentLevel++
		requestAnimationFrame(updateLevel)
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
	resetStopWatch()
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
		pauseCover.style.display = 'none'
		activeTetro = getNewTetro()
		nextTetro = getNewTetro()
		updateGameState()
		score = 0
		currentLevel = 1
		requestAnimationFrame(updateScore)
		requestAnimationFrame(updateLevel)
		requestAnimationFrame(removeLife)
		clearInterval(gameTimerID)
		gameTimerID = undefined
		isPaused = true
	} else {
		if (soundIsOn) gameOverAudio.play()
		deaths++
		if (deaths < maxDeathCount) {
			requestAnimationFrame(removeLife)
			startStopwatch()
			return
		}
		document.getElementById('go-score').innerHTML = score
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

startPauseBtn.addEventListener('click', (e) => {
	if (!gameTimerID) {
		restoreLives()
		startStopwatch()
		e.target.innerHTML = 'Пауза'
		gameTimerID = setInterval(startGame, possibleLevels[currentLevel].speed)
		gameOver.style.display = 'none'
	} else if (!isPaused) {
		e.target.innerHTML = 'Старт'
		pauseCover.style.display = 'block'
		pauseStopWatch()
		clearInterval(gameTimerID)
	} else {
		gameTimerID = setInterval(startGame, possibleLevels[currentLevel].speed)
		startStopwatch()
		pauseCover.style.display = 'none'
		e.target.innerHTML = 'Пауза'
	}
	isPaused = !isPaused
})

restartBtn.addEventListener('click', () => {
	reset(true)
})

restartBtn2.addEventListener('click', () => {
	reset()
	gameOver.style.display = 'none'
	startPauseBtn.textContent = 'Старт'
	ntCellsArr.forEach((row) => {
		row.forEach((cell) => {
			cell.style.opacity = 0
		})
	})
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

function timeToString(time) {
	let diffInHrs = time / 3600000
	let hh = Math.floor(diffInHrs)

	let diffInMin = (diffInHrs - hh) * 60
	let mm = Math.floor(diffInMin)

	let diffInSec = (diffInMin - mm) * 60
	let ss = Math.floor(diffInSec)

	let formattedHH = hh.toString().padStart(2, '0')
	let formattedMM = mm.toString().padStart(2, '0')
	let formattedSS = ss.toString().padStart(2, '0')

	return `${formattedHH}:${formattedMM}:${formattedSS}`
}

let startTime
let elapsedTime = 0
let timerInterval

function updateTimeOnPage(txt) {
	document.getElementById('display').innerHTML = txt
}

function startStopwatch() {
	startTime = Date.now() - elapsedTime
	timerInterval = setInterval(function printTime() {
		elapsedTime = Date.now() - startTime
		updateTimeOnPage(timeToString(elapsedTime))
	}, 10)
}

function pauseStopWatch() {
	clearInterval(timerInterval)
}

function resetStopWatch() {
	clearInterval(timerInterval)
	updateTimeOnPage('00:00:00')
	elapsedTime = 0
}
