let main = document.querySelector('.main')
let mainCells = []
let mainCellArr = [] // List of lists. Inner list contains rows of playfield cells (10 in each)
const scoreElem = document.getElementById('score')
const levelElem = document.getElementById('level')
const nextTetroElem = document.getElementById('next-tetro')
let ntCells = []
let ntCellsArr = []
const startBtn = document.getElementById('start')
const pauseBtn = document.getElementById('pause')
const gameOver = document.getElementById('game-over')

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

function drawNewPlayfield() {
	let mainInnerHTML = ''
	for (let y = 0; y < playField.length; y++) {
		for (let x = 0; x < playField[y].length; x++) {
			mainInnerHTML += '<div class="cell" style="opacity:0;"></div>'
			// if (playField[y][x] === 1) {
			// 	mainInnerHTML += '<div class="cell" style="opacity:0;"></div>'
			// } else if (playField[y][x] === 2) {
			// 	mainInnerHTML += '<div class="cell" style="opacity:0;></div>'
			// } else {
			// 	mainInnerHTML += '<div class="cell" style="opacity:0;></div>'
			// }
		}
	}
	main.innerHTML = mainInnerHTML
	mainCells = Array.from(main.querySelectorAll('.cell'))
	while (mainCells.length) mainCellArr.push(mainCells.splice(0, 10))
	drawCleanNtGrid()
	// console.log(mainCellArr)
}

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

function draw() {
	// let mainInnerHTML = ''
	for (let y = 0; y < playField.length; y++) {
		for (let x = 0; x < playField[y].length; x++) {
			if (playField[y][x] === 1) {
				mainCellArr[y][x].style.opacity = '1'
				// mainInnerHTML += '<div class="cell movingCell"></div>'
			} else if (playField[y][x] === 2) {
				// mainInnerHTML += '<div class="cell fixedCell"></div>'
				mainCellArr[y][x].style.opacity = '1'
			} else {
				// mainInnerHTML += '<div class="cell"></div>'
				mainCellArr[y][x].style.opacity = '0'
			}
		}
	}
	// main.innerHTML = mainInnerHTML
}

function drawNextTetro() {
	// let nextTetroInnerHTML = ''
	// debugger
	ntCellsArr.forEach((row) => {
		row.forEach((cell) => {
			cell.style.opacity = 0
		})
	})
	for (let y = 0; y < nextTetro.shape.length; y++) {
		for (let x = 0; x < nextTetro.shape[y].length; x++) {
			if (nextTetro.shape[y][x] === 1) {
				// nextTetroInnerHTML += '<div class="cell movingCell"></div>'
				ntCellsArr[y][x].style.opacity = 1
			} else {
				// nextTetroInnerHTML += '<div class="cell"></div>'
				ntCellsArr[y][x].style.opacity = 0
			}
		}
		// nextTetroInnerHTML += '<br/>'
	}
	// nextTetroElem.innerHTML = nextTetroInnerHTML
}

function removePrevActiveTetro() {
	for (let y = 0; y < playField.length; y++) {
		for (let x = 0; x < playField[y].length; x++) {
			if (playField[y][x] === 1) {
				playField[y][x] = 0
			}
		}
	}
}

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

function rotateTetro() {
	const prevTetroState = activeTetro.shape
	activeTetro.shape = activeTetro.shape[0].map((val, index) => activeTetro.shape.map((row) => row[index]).reverse())
	if (hasCollisions()) {
	}
}

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
			break
		case 2:
			score += possibleLevels[currentLevel].scorePerLine * 3
			break
		case 3:
			score += possibleLevels[currentLevel].scorePerLine * 6
			break
		case 4:
			score += possibleLevels[currentLevel].scorePerLine * 12
			break
	}

	scoreElem.innerHTML = score
	if (score >= possibleLevels[currentLevel].nextLevelScore) {
		currentLevel++
		levelElem.innerHTML = currentLevel
	}
}

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

function fixTetro() {
	for (let y = 0; y < playField.length; y++) {
		for (let x = 0; x < playField[y].length; x++) {
			if (playField[y][x] === 1) {
				playField[y][x] = 2
			}
		}
	}
}

function moveTetroDown() {
	activeTetro.y += 1
	if (hasCollisions()) {
		activeTetro.y -= 1
		fixTetro()
		removeFullLines()
		activeTetro = nextTetro
		if (hasCollisions()) {
			reset()
		}
		nextTetro = getNewTetro()
	}
}

function dropTetro() {
	for (let y = activeTetro.y; y < playField.length; y++) {
		activeTetro.y += 1
		if (hasCollisions()) {
			activeTetro.y -= 1
			break
		}
	}
}

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
		activeTetro = getNewTetro()
		nextTetro = getNewTetro()
		updateGameState()
	} else {
		clearInterval(gameTimerID)
		gameTimerID = undefined
		isPaused = true
		gameOver.style.display = 'block'
	}
}

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
			moveTetroDown()
		} else if (e.keyCode === 38) {
			rotateTetro()
		} else if (e.keyCode === 32) {
			dropTetro()
		}
		updateGameState()
	}
}

function updateGameState() {
	addActiveTetro()
	draw()
	drawNextTetro()
}

pauseBtn.addEventListener('click', (e) => {
	if (e.target.innerHTML === 'Пауза') {
		e.target.innerHTML = 'Продолжить'
		clearInterval(gameTimerID)
	} else {
		e.target.innerHTML = 'Пауза'
		gameTimerID = setInterval(startGame, possibleLevels[currentLevel].speed)
	}
	isPaused = !isPaused
})

startBtn.addEventListener('click', (e) => {
	// debugger
	if (!gameTimerID) {
		isPaused = false
		e.target.innerHTML = 'Перезапустить'
		gameTimerID = setInterval(startGame, possibleLevels[currentLevel].speed)
		gameOver.style.display = 'none'
	} else {
		reset(true)
	}
})

scoreElem.innerHTML = score
levelElem.innerHTML = currentLevel

// draw()
drawNewPlayfield()

function startGame() {
	moveTetroDown()
	updateGameState()
}
