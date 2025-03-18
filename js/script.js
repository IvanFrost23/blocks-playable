var scaleFactor = 1;
var MOBILE_DRAG_OFFSET = -75;
var musicStarted = false;

var shapeTypes = [
    [[1]],
    [[1, 1]],
    [[1],[1]],
    [[1, 1],[1, 1]],
    [[1, 0],[1, 1]],
    [[1, 1, 1]],
    [[1, 1, 1, 1]],
    [[1, 1, 1],[1, 0, 1]]
];

var colorTypes = ["blue", "red", "yellow"];

var playingField = document.getElementById("playing-field");
var cells = [];
var shapesContainer = document.getElementById("shapes-container");

var crystalGoals = {
    blue: 40,
    red: 40,
    yellow: 40
};

var coinCountElement = document.getElementById("coin-count");
var coinCount = parseInt(coinCountElement.textContent, 10);
var step = 0;

var initialFieldState = [
    1, null, null, null, null, null, null, 1,
    null, null, null, null, null, null, null, null,
    null, 2, null, 0, 0, null, 2, null,
    null, 1, 2, 1, 1, 2, 1, null,
    null, null, 0, 1, 1, 0, null, null,
    2, null, 0, 1, 1, 0, null, 2,
    null, null, 0, 0, 0, 0, null, null,
    null, null, null, 2, 2, null, null, null
];
var initialCrystalsState = [0, 7, 17, 19, 20, 22, 25, 26, 29, 30, 34, 35, 36, 37, 40, 42, 45, 47, 50, 51, 52, 53, 59, 60];

function buildField() {
    playingField.innerHTML = "";
    cells = [];

    for (var i = 0; i < 64; i++) {
        var cell = document.createElement("div");
        cell.classList.add("cell");

        if (initialFieldState[i] !== null) {
            var block = document.createElement("div");
            block.classList.add("block", colorTypes[initialFieldState[i]]);
            cell.appendChild(block);
            cell.block = block;

            if (initialCrystalsState.indexOf(i) !== -1) {
                var crystal = document.createElement("div");
                crystal.classList.add("crystal", colorTypes[initialFieldState[i]]);
                block.appendChild(crystal);
            }

            cell.classList.add("filled");
        }

        playingField.appendChild(cell);
        cells.push(cell);
    }
}


function createNewShape(randomType) {
    var shape = document.createElement("div");
    shape.classList.add("shape");

    var candidateBlocks = [];

    randomType.shape.forEach(function(row, rowIndex) {
        row.forEach(function(cell, colIndex) {
            if (cell === 1) {
                var block = document.createElement("div");
                block.classList.add("block", randomType.color);
                block.dataset.color = randomType.color;
                block.style.gridRowStart = rowIndex + 1;
                block.style.gridColumnStart = colIndex + 1;
                shape.appendChild(block);
                candidateBlocks.push(block);
            }
        });
    });

    if (candidateBlocks.length > 0 && Math.random() < 0.5) {
        var randomIndex = Math.floor(Math.random() * candidateBlocks.length);
        var selectedBlock = candidateBlocks[randomIndex];
        var crystal = document.createElement("div");
        crystal.classList.add("crystal", randomType.color);
        crystal.style.width = "20px";
        crystal.style.height = "20px";
        selectedBlock.appendChild(crystal);
        selectedBlock.dataset.crystal = true;
    }

    return shape;
}

var startShapes = [3, 7, 6];

function regenerateShapes() {
    shapesContainer.innerHTML = "";

    for (var i = 0; i < 3; i++) {
        var shape = shapeTypes[Math.floor(Math.random() * shapeTypes.length)];
        if (step === 0) {
            shape = shapeTypes[startShapes[i]];
        }

        var newShape = createNewShape({
            shape: shape,
            color: colorTypes[Math.floor(Math.random() * colorTypes.length)]
        });
        shapesContainer.appendChild(newShape);
    }
}

function getScaleFactor() {
    var gameContainer = document.getElementById("game-container");
    var widthToHeightRatio = 600 / 931;
    var viewportWidth = window.visualViewport ? window.visualViewport.width : window.innerWidth;
    var viewportHeight = window.visualViewport ? window.visualViewport.height : window.innerHeight;

    if (viewportWidth / viewportHeight < widthToHeightRatio) {
        scaleFactor = viewportWidth / 600;
    } else {
        scaleFactor = viewportHeight / 931;
    }
    return scaleFactor;
}

function resizeGame() {
    var gameContainer = document.getElementById("game-container");
    scaleFactor = getScaleFactor();
    gameContainer.style.transform = "scale(" + scaleFactor + ")";

    var coinContainer = document.getElementById("coin-container");
    coinContainer.style.transform = "scale(" + scaleFactor + ")";
    coinContainer.style.left = (20 * scaleFactor) + "px";
    coinContainer.style.top = (20 * scaleFactor) + "px";
}

function startGame() {
    window.gameStarted = true;

    buildField();
    regenerateShapes();
    resizeGame();

    window.addEventListener("resize", resizeGame);
    window.addEventListener('load', resizeGame);
}

window.startGame = startGame;
