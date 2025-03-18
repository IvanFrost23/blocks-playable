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
var coinCountElement = document.getElementById("coin-count");

var coinCount = parseInt(coinCountElement.textContent, 10);
var step = 0;

var initialFieldState = [
    0, 1, null, null, null, null, 2, 0,
    2, 1, null, null, 0, null, 0, 2,
    2, 0, null, null, null, null, 1, 2,
    2, null, null, null, null, null, null, null,
    0, null, null, null, 2, null, null, null,
    null, null, null, null, null, null, null, null,
    0, 2, null, null, 0, 1, 2, 1,
    1, 1, null, null, 2, 1, 0, 0
];

var draggedShape = null;
var shapeOffsets = [];
var currentHighlightCells = [];

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

            cell.classList.add("filled");
        }

        playingField.appendChild(cell);
        cells.push(cell);
    }
}

function createDragImage(shape, shapeOffsets, cellSize) {
    var dragImage = shape.cloneNode(true);
    dragImage.style.position = "absolute";
    dragImage.style.pointerEvents = "none";
    dragImage.style.display = "grid";

    var maxRow = Math.max.apply(null, shapeOffsets.map(function(o) { return o.row; })) + 1;
    var maxCol = Math.max.apply(null, shapeOffsets.map(function(o) { return o.col; })) + 1;

    dragImage.style.gridTemplateRows = "repeat(" + maxRow + ", " + cellSize + "px)";
    dragImage.style.gridTemplateColumns = "repeat(" + maxCol + ", " + cellSize + "px)";
    dragImage.style.width = (cellSize * maxCol) + "px";
    dragImage.style.height = (cellSize * maxRow) + "px";
    dragImage.style.zIndex = "1000";

    var blocks = dragImage.querySelectorAll(".block");
    for (var i = 0; i < blocks.length; i++) {
        var block = blocks[i];
        block.style.width = cellSize + "px";
        block.style.height = cellSize + "px";
        var crystal = block.querySelector(".crystal");
        if (crystal) {
            crystal.style.width = (cellSize * 0.5) + "px";
            crystal.style.height = (cellSize * 0.5) + "px";
        }
    }

    return dragImage;
}

function handleStart(event, isTouch) {
    if (draggedShape) return;

    if (!musicStarted) {
        document.getElementById('music').play();
        musicStarted = true;
    }

    if (isTouch === void 0) { isTouch = false; }
    draggedShape = isTouch ? event.target.closest(".shape") : event.target;
    if (!draggedShape) return;

    stopTutorialAnimation();

    var blocks = draggedShape.querySelectorAll(".block");
    shapeOffsets = [];

    for (var i = 0; i < blocks.length; i++) {
        var block = blocks[i];
        var row = parseInt(block.style.gridRowStart) - 1;
        var col = parseInt(block.style.gridColumnStart) - 1;
        shapeOffsets.push({
            row: row,
            col: col,
            color: block.dataset.color,
            hasCrystal: !!block.querySelector(".crystal"),
            crystal: block.dataset.crystal
        });
    }

    var cellSize = playingField.querySelector(".cell").offsetWidth;
    var dragImage = createDragImage(draggedShape, shapeOffsets, cellSize);

    var fieldRect = playingField.getBoundingClientRect();
    var currentScaleFactor = getScaleFactor();

    if (isTouch) {
        var touch = event.touches[0];
        var rect = draggedShape.getBoundingClientRect();
        var dragWidth = parseInt(dragImage.style.width, 10) * currentScaleFactor;
        var dragHeight = parseInt(dragImage.style.height, 10) * currentScaleFactor;

        var adjustedX = touch.clientX - fieldRect.left - dragWidth / 2;
        var adjustedY = touch.clientY - fieldRect.top - dragHeight / 2 + (MOBILE_DRAG_OFFSET * currentScaleFactor);

        dragImage.style.left = (adjustedX / currentScaleFactor) + "px";
        dragImage.style.top = (adjustedY / currentScaleFactor) + "px";

    } else {
        dragImage.style.left = ((event.clientX - fieldRect.left - draggedShape.offsetWidth / 2) / currentScaleFactor) + "px";
        dragImage.style.top = ((event.clientY - fieldRect.top - draggedShape.offsetHeight / 2) / currentScaleFactor) + "px";

        var transparentPixel = new Image();
        transparentPixel.src = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==";
        transparentPixel.width = 1;
        transparentPixel.height = 1;
        transparentPixel.setAttribute("draggable", "true");
        event.dataTransfer.setDragImage(transparentPixel, 0, 0);
    }

    playingField.appendChild(dragImage);
    draggedShape.dragImage = dragImage;

    requestAnimationFrame(function() {
        if (draggedShape) {
            draggedShape.classList.add("dragging");
        }
        event.preventDefault();
    });
}

function handleTouchStart(event) {
    if (!isGameOver()) {
        handleStart(event, true);
    } else {
        onCTAClick();
        event.preventDefault();
    }
}

function handleDragStart(event) {
    if (!isGameOver()) {
        handleStart(event, false);
    } else {
        onCTAClick();
        event.preventDefault();
    }
}

function createNewShape(randomType) {
    var shape = document.createElement("div");
    shape.classList.add("shape");
    shape.setAttribute("draggable", "true");

    shape.addEventListener("touchstart", handleTouchStart);
    shape.addEventListener("touchmove", handleTouchMove);
    shape.addEventListener("touchend", handleTouchEnd);
    shape.addEventListener("touchcancel", handleTouchEnd);

    shape.addEventListener("dragstart", handleDragStart);
    shape.addEventListener("dragend", handleDragEnd);

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

                if (block.dataset.color === colorTypes[0]) {
                    candidateBlocks.push(block);
                }
            }
        });
    });

    if (candidateBlocks.length > 0 && Math.random() < 0.5) {
        var randomIndex = Math.floor(Math.random() * candidateBlocks.length);
        var selectedBlock = candidateBlocks[randomIndex];

        var crystal = document.createElement("div");
        crystal.classList.add("crystal", randomType.color);
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

function handleTouchMove(event) {
    if (!draggedShape) return;
    event.preventDefault();

    var touch = event.touches[0];
    var dragImage = draggedShape.dragImage;
    var fieldRect = playingField.getBoundingClientRect();
    var currentScaleFactor = getScaleFactor();

    if (dragImage) {
        var dragWidth = parseInt(dragImage.style.width, 10);
        var dragHeight = parseInt(dragImage.style.height, 10);

        var touchX = touch.clientX;
        var touchY = touch.clientY;
        var fieldLeft = fieldRect.left;
        var fieldTop = fieldRect.top;
        var dragHalfWidth = dragWidth / 2 * currentScaleFactor;
        var dragHalfHeight = dragHeight / 2 * currentScaleFactor;
        var mobileOffset = MOBILE_DRAG_OFFSET * currentScaleFactor;

        var offsetX = touchX - fieldLeft - dragHalfWidth;
        var offsetY = touchY - fieldTop - dragHalfHeight + mobileOffset;

        dragImage.style.left = (offsetX / currentScaleFactor) + 'px';
        dragImage.style.top = (offsetY / currentScaleFactor) + 'px';
    }

    var startIndex = calcHighlightIndex(touch.clientX, touch.clientY, true);
    if (startIndex >= 0 && startIndex < 64) {
        highlightCells(startIndex, true);
    } else {
        clearHighlight();
    }
}

function handleTouchEnd(event) {
    if (!draggedShape) return;

    var currentScaleFactor = getScaleFactor();
    var dragImage = draggedShape.dragImage;
    var shapeWidth = dragImage && parseInt(dragImage.style.width);
    var shapeHeight = dragImage && parseInt(dragImage.style.height);

    var touch = event.changedTouches[0];
    var startIndex = calcHighlightIndex(touch.clientX, touch.clientY, true);
    if (startIndex >= 0 && startIndex < 64) {
        placeShape(startIndex);
    } else {
        clearHighlight();
    }

    draggedShape.classList.remove("dragging");
    if (dragImage) {
        playingField.removeChild(dragImage);
        draggedShape.dragImage = null;
    }

    draggedShape = null;
    shapeOffsets = [];
}

function handleDragEnd() {
    var dragImage = draggedShape && draggedShape.dragImage;
    if (dragImage) {
        playingField.removeChild(dragImage);
        draggedShape.dragImage = null;
    }

    if (draggedShape) {
        draggedShape.classList.remove("dragging");
        draggedShape = null;
        shapeOffsets = [];
    }

    clearHighlight();
}

document.body.addEventListener("dragover", function(e) {
    e.preventDefault();
    if (!draggedShape) return;

    var dragImage = draggedShape.dragImage;
    var currentScaleFactor = getScaleFactor();

    if (dragImage) {
        var width = parseInt(dragImage.style.width, 10) * currentScaleFactor;
        var height = parseInt(dragImage.style.height, 10) * currentScaleFactor;

        dragImage.style.left = ((e.clientX - playingField.getBoundingClientRect().left - width / 2) / currentScaleFactor) + 'px';
        dragImage.style.top = ((e.clientY - playingField.getBoundingClientRect().top - height / 2) / currentScaleFactor) + 'px';
    }

    var startIndex = calcHighlightIndex(e.clientX, e.clientY);
    if (startIndex >= 0 && startIndex < 64) {
        highlightCells(startIndex, true);
    } else {
        clearHighlight();
    }
});

function calcHighlightIndex(dragX, dragY, isTouch) {
    if (!draggedShape) return -1;

    var dragImage = draggedShape.dragImage;
    var currentScaleFactor = getScaleFactor();
    var fieldRect = playingField.getBoundingClientRect();
    var width = parseInt(dragImage.style.width, 10) * currentScaleFactor;
    var height = parseInt(dragImage.style.height, 10) * currentScaleFactor;

    var touchX = dragX - fieldRect.left;
    var touchY = dragY - fieldRect.top;

    var gridX = Math.round((touchX - width / 2) / (currentScaleFactor * playingField.offsetWidth / 8));
    var gridY = Math.round((touchY - height / 2 + (isTouch ? MOBILE_DRAG_OFFSET * currentScaleFactor : 0)) / (currentScaleFactor * playingField.offsetHeight / 8));

    if (gridX < 0 || gridY < 0 || gridX > 7 || gridY > 7) {
        return -1;
    }
    return gridY * 8 + gridX;
}

document.body.addEventListener("drop", function(e) {
    e.preventDefault();
    if (!draggedShape) return;

    var targetCellIndex = calcHighlightIndex(e.clientX, e.clientY);
    if (targetCellIndex !== -1) {
        placeShape(targetCellIndex);
    }
});

function highlightCells(startIndex, isTouch) {
    if (isTouch === void 0) { isTouch = false; }
    clearHighlight();
    currentHighlightCells = [];
    var canPlace = true;

    shapeOffsets.forEach(function(offset) {
        var targetIndex = startIndex + offset.row * 8 + offset.col;
        if (!isValidCell(startIndex, offset, targetIndex) || cells[targetIndex].classList.contains("filled")) {
            canPlace = false;
        }
    });

    if (canPlace) {
        shapeOffsets.forEach(function(offset) {
            var targetIndex = startIndex + offset.row * 8 + offset.col;
            var cell = cells[targetIndex];

            if (cell && !cell.classList.contains("filled")) {
                var highlightDiv = document.createElement("div");
                highlightDiv.classList.add("highlight", offset.color);
                if (offset.hasCrystal) {
                    var crystal = document.createElement("div");
                    crystal.classList.add("crystal");
                    highlightDiv.appendChild(crystal);
                }
                cell.appendChild(highlightDiv);
                currentHighlightCells.push(cell);
            }
        });
    }
}

function clearHighlight() {
    currentHighlightCells.forEach(function(cell) {
        var highlightDiv = cell.querySelector(".highlight");
        if (highlightDiv) {
            cell.removeChild(highlightDiv);
        }
    });
    currentHighlightCells = [];
}

function placeShape(startIndex) {
    if (!draggedShape) return;

    var canPlace = true;
    shapeOffsets.forEach(function(offset) {
        var targetIndex = startIndex + offset.row * 8 + offset.col;
        if (!isValidCell(startIndex, offset, targetIndex) || cells[targetIndex].classList.contains("filled")) {
            canPlace = false;
        }
    });

    if (canPlace) {
        document.getElementById('place_piece_effect').play();
        shapeOffsets.forEach(function(offset) {
            var targetIndex = startIndex + offset.row * 8 + offset.col;
            var cell = cells[targetIndex];

            if (cell) {
                var color = offset.color;
                cell.classList.add("filled");
                var block = document.createElement("div");
                block.classList.add("block", color);
                cell.appendChild(block);
                cell.block = block;
            }
        });
        updateProgress(shapeOffsets.length);

        checkAndClearFullRowsOrColumns();
        draggedShape.style.visibility = "hidden";

        if (Array.prototype.every.call(shapesContainer.children, function(shape) { return shape.style.visibility === "hidden"; })) {
            regenerateShapes();
        }

        step++;
    }

    clearHighlight();
}

function isValidCell(startIndex, offset, targetIndex) {
    var startRow = Math.floor(startIndex / 8);
    var targetRow = Math.floor(targetIndex / 8);
    var startCol = startIndex % 8;
    return (
        targetIndex >= 0 &&
        targetIndex < 64 &&
        startRow + offset.row === targetRow &&
        startCol + offset.col < 8
    );
}

function checkAndClearFullRowsOrColumns() {
    for (var i = 0; i < 8; i++) {
        var rowStart = i * 8;
        var rowEnd = rowStart + 7;
        var rowCells = cells.slice(rowStart, rowEnd + 1);
        var rowFilled = true;
        for (var k = 0; k < rowCells.length; k++) {
            if (!rowCells[k].classList.contains("filled")) {
                rowFilled = false;
                break;
            }
        }
        if (rowFilled) {
            clearRowOrColumn(rowStart, rowEnd, "row");
        }

        var colFilled = true;
        for (var j = 0; j < 8; j++) {
            if (!cells[i + j * 8].classList.contains("filled")) {
                colFilled = false;
                break;
            }
        }
        if (colFilled) {
            clearRowOrColumn(i, i + 56, "column");
        }
    }
}

function clearRowOrColumn(start, end, type) {
    var cellsToClear = [];
    if (type === "row") {
        for (var i = start; i <= end; i++) {
            cellsToClear.push(cells[i]);
        }
    } else {
        for (var i = start; i <= end; i += 8) {
            cellsToClear.push(cells[i]);
        }
    }

    addCoins(10);
    updateProgress(10);
    document.getElementById('burn_line_effect').play();
    cellsToClear.forEach(function(cell) {
        cell.classList.remove("filled");
        cell.block.classList.add("burn");
        cell.block.addEventListener("animationend", function() {
            cell.block.remove();
        }, { once: true });
    });
}

function canPlaceShape(shape) {
    var blocks = shape.querySelectorAll(".block");
    var shapeOffsets = [];
    blocks.forEach(function(block) {
        var row = parseInt(block.style.gridRowStart) - 1;
        var col = parseInt(block.style.gridColumnStart) - 1;
        shapeOffsets.push({ row: row, col: col });
    });


    for (var startIndex = 0; startIndex < 64; startIndex++) {
        var startRow = Math.floor(startIndex / 8);
        var startCol = startIndex % 8;
        var canPlace = true;
        for (var j = 0; j < shapeOffsets.length; j++) {
            var offset = shapeOffsets[j];
            var targetRow = startRow + offset.row;
            var targetCol = startCol + offset.col;

            if (targetRow > 7 || targetCol > 7) {
                canPlace = false;
                break;
            }
            var targetIndex = targetRow * 8 + targetCol;

            if (cells[targetIndex].classList.contains("filled")) {
                canPlace = false;
                break;
            }
        }
        if (canPlace) return true;
    }
    return false;
}

function isGameOver() {
    if (progress >= goalProgress) {
        return true;
    }

    var shapes = shapesContainer.children;
    for (var i = 0; i < shapes.length; i++) {
        if (shapes[i].style.visibility !== "hidden" && canPlaceShape(shapes[i])) {
            return false;
        }
    }

    return true;
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

var currentDeltaAmount = 0;
var activeDeltaElement = null;
var accumulatedDelta = 0;
var deltaTimeoutId = null;

function addCoins(amount) {
    coinCount += amount;

    var coinCountElement = document.getElementById('coin-count');
    coinCountElement.textContent = coinCount;

    var coinContainer = document.getElementById('coin-container');

    if (activeDeltaElement) {
        accumulatedDelta += amount;
        activeDeltaElement.textContent = "+" + accumulatedDelta;

        clearTimeout(deltaTimeoutId);

        activeDeltaElement.style.transform = 'translateY(0)';
        activeDeltaElement.style.opacity = '1';

        setTimeout(function () {
            activeDeltaElement.style.transform = 'translateY(-10px)';
            activeDeltaElement.style.opacity = '0';
        }, 10);
    } else {
        accumulatedDelta = amount;
        activeDeltaElement = document.createElement('div');
        activeDeltaElement.textContent = "+" + accumulatedDelta;
        activeDeltaElement.classList.add('coin-delta');

        var left = coinCountElement.offsetLeft;
        var top = coinCountElement.offsetTop + coinCountElement.offsetHeight;
        activeDeltaElement.style.left = left + "px";
        activeDeltaElement.style.top = (top + 10) + "px";

        coinContainer.appendChild(activeDeltaElement);

        setTimeout(function () {
            activeDeltaElement.style.transform = 'translateY(-10px)';
            activeDeltaElement.style.opacity = '0';
        }, 10);
    }

    deltaTimeoutId = setTimeout(function () {
        if (activeDeltaElement) {
            activeDeltaElement.remove();
            activeDeltaElement = null;
            accumulatedDelta = 0;
        }
    }, 1000);
}

var progress = 0;
var goalProgress = 368;
function updateProgress(amount) {
    var fill = document.getElementById("progressbar-fill");
    var scoreGreen = document.getElementById("score-green");
    var scoreGreenText = document.getElementById("score-green-text");
    var scoreEndText = document.getElementById("score-end-text");

    progress += amount;

    var percentage = (progress / goalProgress) * 100;
    percentage = Math.max(0, Math.min(100, percentage));

    fill.style.width = percentage + "%";

    scoreGreen.style.left = 'calc(' + percentage + '% - 30px)';

    scoreGreenText.textContent = progress;

    scoreEndText.textContent = goalProgress;
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

    setTimeout(startTutorialAnimation, 500);

    window.addEventListener("resize", resizeGame);
    window.addEventListener('load', resizeGame);
}

window.startGame = startGame;