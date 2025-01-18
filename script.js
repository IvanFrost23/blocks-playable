/**
 * Created by Ivan on 10.01.2025
 */

let scaleFactor = 1;

const shapeTypes = [
    [[1]],
    [[1, 1]],
    [[1], [1]],
    [[1, 1], [1, 1]],
    [[1, 0], [1, 1]],
    [[1, 1, 1]],
    [[1, 1, 1, 1]],
    [[1, 1, 1], [1, 0, 1]]
];
const colorTypes = ["blue", "red", "yellow"];
const playingField = document.getElementById('playing-field');
const cells = [];
const shapesContainer = document.getElementById('shapes-container');
const goal = document.getElementById('goal');
let crystals = parseInt(goal.textContent);
let step = 0;

const initialFieldState = [
    0, 1, null, null, null, null, 2, 0,
    null, 1, null, null, 0, null, 0, null,
    null, 0, null, null, null, null, 1, null,
    null, null, 2, null, null, 1, null, null,
    0, null, null, null, 2, null, null, 1,
    null, null, 0, null, null, 2, null, null,
    0, 2, null, null, 0, 1, 2, 1,
    1, 1, null, null, 2, 1, 0, 0
];
var initialCrystalsState = [0, 7, 12, 14, 17, 32, 48, 52, 62, 63];

for (let i = 0; i < 64; i++) {
    const cell = document.createElement('div');
    cell.classList.add('cell');

    if (initialFieldState[i] !== null) {
        const block = document.createElement('div');
        block.classList.add('block', colorTypes[initialFieldState[i]]);
        cell.appendChild(block);


        if (initialCrystalsState.indexOf(i) !== -1) {
            const crystal = document.createElement('div');
            crystal.classList.add('crystal', colorTypes[initialFieldState[i]]);
            cell.appendChild(crystal);
        }

        cell.classList.add('filled');
    }

    playingField.appendChild(cell);
    cells.push(cell);
}

let draggedShape = null;
let shapeOffsets = [];
let touchOffsetX, touchOffsetY;
let currentHighlightCells = [];

function createDragImage(shape, shapeOffsets, cellSize) {
    const dragImage = shape.cloneNode(true);
    dragImage.style.position = 'absolute';
    dragImage.style.pointerEvents = 'none';
    dragImage.style.display = 'grid';
    dragImage.style.gridTemplateRows = `repeat(${Math.max(...shapeOffsets.map(o => o.row)) + 1}, ${cellSize}px)`;
    dragImage.style.gridTemplateColumns = `repeat(${Math.max(...shapeOffsets.map(o => o.col)) + 1}, ${cellSize}px)`;
    dragImage.style.width = `${cellSize * (Math.max(...shapeOffsets.map(o => o.col)) + 1)}px`;
    dragImage.style.height = `${cellSize * (Math.max(...shapeOffsets.map(o => o.row)) + 1)}px`;
    dragImage.style.zIndex = '1000';

    dragImage.querySelectorAll('.block').forEach((block) => {
        block.style.width = `${cellSize}px`;
        block.style.height = `${cellSize}px`;
        const crystal = block.querySelector('.crystal');
        if (crystal) {
            crystal.style.width = `${cellSize * 0.5}px`;
            crystal.style.height = `${cellSize * 0.5}px`;
        }
    });

    return dragImage;
}
function handleStart(event, isTouch = false) {
    draggedShape = isTouch ? event.target.closest('.shape') : event.target;
    if (!draggedShape) return;

    const blocks = draggedShape.querySelectorAll('.block');
    shapeOffsets = [];

    blocks.forEach((block) => {
        const row = parseInt(block.style.gridRowStart) - 1;
        const col = parseInt(block.style.gridColumnStart) - 1;
        shapeOffsets.push({
            row,
            col,
            color: block.dataset.color,
            hasCrystal: !!block.querySelector('.crystal'),
            crystal: block.dataset.crystal,
        });
    });

    const cellSize = playingField.querySelector('.cell').offsetWidth;
    const dragImage = createDragImage(draggedShape, shapeOffsets, cellSize);

    // Получаем координаты поля относительно окна
    const fieldRect = playingField.getBoundingClientRect();
    const currentScaleFactor = getScaleFactor();
    if (isTouch) {
        const touch = event.touches[0];
        const rect = draggedShape.getBoundingClientRect();
        touchOffsetX = touch.clientX - rect.left;
        touchOffsetY = touch.clientY - rect.top;

        // Корректируем позицию dragImage относительно поля, учитывая масштаб
        dragImage.style.left = `${(touch.clientX - fieldRect.left - touchOffsetX)/currentScaleFactor}px`;
        dragImage.style.top = `${(touch.clientY - fieldRect.top - touchOffsetY)/currentScaleFactor}px`;
    } else {
        const rect = draggedShape.getBoundingClientRect();
        const startX = event.clientX - rect.left;
        const startY = event.clientY - rect.top;
        // Корректируем позицию dragImage относительно поля, учитывая масштаб
        dragImage.style.left = `${(event.clientX - fieldRect.left - draggedShape.offsetWidth / 2) / currentScaleFactor}px`;
        dragImage.style.top = `${(event.clientY - fieldRect.top - draggedShape.offsetHeight / 2) / currentScaleFactor}px`;

        const transparentPixel = new Image();
        transparentPixel.src = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/wcAAn8B9WYyDmMAAAAASUVORK5CYII=";
        event.dataTransfer.setDragImage(transparentPixel, 0, 0);
    }

    playingField.appendChild(dragImage);
    draggedShape.dragImage = dragImage;

    setTimeout(() => {
        draggedShape.classList.add('dragging');
    }, 0);
}

function handleTouchStart(event) {
    if (!isGameOver()) {
        handleStart(event, true);
    } else {
        if (isGameOver()) {
            alert("GAME OVER!");
        }
        event.preventDefault();
    }
}

function handleDragStart(event) {
    if (!isGameOver()) {
        handleStart(event, false);
    } else {
        if (isGameOver()) {
            alert("GAME OVER!");
        }
        event.preventDefault();
    }
}

function handleDragMove(event) {
    if (!draggedShape) return;

    event.preventDefault();
    const dragImage = draggedShape.dragImage;
    const currentScaleFactor = getScaleFactor();

    if (dragImage) {
        dragImage.style.left = `${(event.clientX - playingField.getBoundingClientRect().left - draggedShape.offsetWidth / 2) / currentScaleFactor}px`;
        dragImage.style.top = `${(event.clientY - playingField.getBoundingClientRect().top - draggedShape.offsetHeight / 2) / currentScaleFactor}px`;
    }
}

function createNewShape(randomType) {
    const shape = document.createElement('div');
    shape.classList.add('shape');
    shape.setAttribute('draggable', true);
    shape.addEventListener('touchstart', handleTouchStart);
    shape.addEventListener('touchmove', handleTouchMove);
    shape.addEventListener('touchend', handleTouchEnd);
    shape.addEventListener('touchcancel', handleTouchEnd);

    shape.addEventListener('dragstart', handleDragStart);
    shape.addEventListener('drag', handleDragMove);
    shape.addEventListener('dragend', handleDragEnd);

    randomType.shape.forEach((row, rowIndex) => {
        row.forEach((cell, colIndex) => {
            if (cell === 1) {
                const block = document.createElement('div');
                block.classList.add('block', randomType.color);
                block.dataset.color = randomType.color;

                if (block.dataset.color === colorTypes[0] && Math.random() > 0.5) {
                    const crystal = document.createElement('div');
                    crystal.classList.add('crystal', randomType.color);
                    block.appendChild(crystal);
                    block.dataset.crystal = true;
                }

                block.style.gridRowStart = rowIndex + 1;
                block.style.gridColumnStart = colIndex + 1;

                shape.appendChild(block);
            }
        });
    });

    return shape;
}

const startShapes = [3, 7, 6];

function regenerateShapes() {
    shapesContainer.innerHTML = '';

    for (let i = 0; i < 3; i++) {
        let shape = shapeTypes[Math.floor(Math.random() * shapeTypes.length)];
        if (step === 0) {
            shape = shapeTypes[startShapes[i]];
        }

        const newShape = createNewShape({
            shape: shape,
            color: colorTypes[Math.floor(Math.random() * colorTypes.length)]
        });
        shapesContainer.appendChild(newShape);
    }
}

function handleTouchMove(event) {
    if (!draggedShape) return;
    event.preventDefault();
    const touch = event.touches[0];
    const dragImage = draggedShape.dragImage;
    const currentScaleFactor = getScaleFactor();
    if (dragImage) {
        dragImage.style.left = `${(touch.clientX - playingField.getBoundingClientRect().left - touchOffsetX) / currentScaleFactor}px`;
        dragImage.style.top = `${(touch.clientY - playingField.getBoundingClientRect().top - touchOffsetY) / currentScaleFactor}px`;
    }

    const fieldRect = playingField.getBoundingClientRect();
    const touchX = touch.clientX - fieldRect.left;
    const touchY = touch.clientY - fieldRect.top;

    const cellWidth = playingField.offsetWidth / 8;
    const cellHeight = playingField.offsetHeight / 8;
    const gridX = Math.floor((touchX / currentScaleFactor) / cellWidth);
    const gridY = Math.floor((touchY/ currentScaleFactor) / cellHeight);
    const startIndex = gridY * 8 + gridX;

    if (startIndex >= 0 && startIndex < 64) {
        highlightCells(startIndex, true);
    } else {
        clearHighlight();
    }
}

function handleTouchEnd(event) {
    if (!draggedShape) return;

    const dragImage = draggedShape.dragImage;
    if (dragImage) {
        playingField.removeChild(dragImage);
        draggedShape.dragImage = null;
    }

    draggedShape.classList.remove('dragging');

    const touch = event.changedTouches[0];
    const fieldRect = playingField.getBoundingClientRect();
    const touchX = touch.clientX - fieldRect.left;
    const touchY = touch.clientY - fieldRect.top;

    const cellWidth = playingField.offsetWidth / 8;
    const cellHeight = playingField.offsetHeight / 8;
    const currentScaleFactor = getScaleFactor();
    const gridX = Math.floor((touchX / currentScaleFactor) / cellWidth);
    const gridY = Math.floor((touchY/ currentScaleFactor) / cellHeight);
    const startIndex = gridY * 8 + gridX;

    if (startIndex >= 0 && startIndex < 64) {
        placeShape(startIndex);
    } else {
        clearHighlight();
    }

    draggedShape = null;
    shapeOffsets = [];
}


function handleDragEnd() {
    const dragImage = draggedShape.dragImage;
    if (dragImage) {
        playingField.removeChild(dragImage);
        draggedShape.dragImage = null;
    }

    if (draggedShape) {
        draggedShape.classList.remove('dragging');
        draggedShape = null;
        shapeOffsets = [];
    }
}

playingField.addEventListener('dragover', (e) => {
    e.preventDefault();
    const targetCellIndex = Array.from(playingField.children).indexOf(e.target);
    if (targetCellIndex !== -1) {
        highlightCells(targetCellIndex);
    }
});

playingField.addEventListener('dragleave', (e) => {
    clearHighlight();
});


playingField.addEventListener('drop', (e) => {
    e.preventDefault();
    const targetCellIndex = Array.from(playingField.children).indexOf(e.target);
    if (targetCellIndex !== -1) {
        placeShape(targetCellIndex);
    }
});

function highlightCells(startIndex, isTouch = false) {
    clearHighlight();
    currentHighlightCells = [];
    let canPlace = true;

    shapeOffsets.forEach(offset => {
        const targetIndex = startIndex + offset.row * 8 + offset.col;
        if (!isValidCell(startIndex, offset, targetIndex) || cells[targetIndex].classList.contains('filled')) {
            canPlace = false;
        }
    });

    if (canPlace) {
        shapeOffsets.forEach(offset => {
            const targetIndex = startIndex + offset.row * 8 + offset.col;
            const cell = cells[targetIndex];

            if (cell && !cell.classList.contains('filled')) {
                const highlightDiv = document.createElement('div');
                highlightDiv.classList.add('highlight', offset.color);
                if (offset.hasCrystal) {
                    const crystal = document.createElement('div');
                    crystal.classList.add('crystal');
                    highlightDiv.appendChild(crystal);
                }
                cell.appendChild(highlightDiv);
                currentHighlightCells.push(cell);
            }
        });
    }
}


function clearHighlight() {
    currentHighlightCells.forEach(cell => {
        const highlightDiv = cell.querySelector('.highlight');
        if (highlightDiv) {
            cell.removeChild(highlightDiv);
        }
    });
    currentHighlightCells = [];
}

function placeShape(startIndex) {
    if (!draggedShape) return;

    let canPlace = true;
    shapeOffsets.forEach(offset => {
        const targetIndex = startIndex + offset.row * 8 + offset.col;
        if (!isValidCell(startIndex, offset, targetIndex) || cells[targetIndex].classList.contains('filled')) {
            canPlace = false;
        }
    });

    if (canPlace) {
        shapeOffsets.forEach(offset => {
            const targetIndex = startIndex + offset.row * 8 + offset.col;
            const cell = cells[targetIndex];

            if (cell) {
                const color = offset.color;
                cell.classList.add('filled');
                const block = document.createElement('div');
                block.classList.add('block', color);
                cell.appendChild(block);

                if (offset.hasCrystal) {
                    const crystal = document.createElement('div');
                    crystal.classList.add('crystal');
                    cell.appendChild(crystal);
                }
            }
        });

        checkAndClearFullRowsOrColumns();
        draggedShape.style.visibility = 'hidden';

        if ([...shapesContainer.children].every(shape => shape.style.visibility === 'hidden')) {
            regenerateShapes();
        }

        step++;
    }

    clearHighlight();
}


function isValidCell(startIndex, offset, targetIndex) {
    const startRow = Math.floor(startIndex / 8);
    const targetRow = Math.floor(targetIndex / 8);
    const startCol = startIndex % 8;

    return targetIndex >= 0 &&
        targetIndex < 64 &&
        startRow + offset.row === targetRow &&
        startCol + offset.col < 8;
}

function checkAndClearFullRowsOrColumns() {
    for (let i = 0; i < 8; i++) {
        const rowStart = i * 8;
        const rowEnd = rowStart + 7;
        if (cells.slice(rowStart, rowEnd + 1).every(cell => cell.classList.contains('filled'))) {
            clearRowOrColumn(rowStart, rowEnd, 'row');
        }

        let colFilled = true;
        for (let j = 0; j < 8; j++) {
            if (!cells[i + j * 8].classList.contains('filled')) {
                colFilled = false;
                break;
            }
        }
        if (colFilled) {
            clearRowOrColumn(i, i + 56, 'column');
        }
    }
}

function clearRowOrColumn(start, end, type) {
    const cellsToClear = [];
    if (type === 'row') {
        for (let i = start; i <= end; i++) {
            cellsToClear.push(cells[i]);
        }
    } else {
        for (let i = start; i <= end; i += 8) {
            cellsToClear.push(cells[i]);
        }
    }

    cellsToClear.forEach(cell => {
        if (cell.querySelector('.crystal')) {
            updateCrystalCount();
        }

        cell.classList.add('burn');
        setTimeout(() => {
            cell.classList.remove('burn', 'filled');
            while (cell.firstChild) {
                cell.removeChild(cell.firstChild);
            }
        }, 500);
    });
}

function updateCrystalCount() {
    crystals = Math.max(0, crystals - 1);
    goal.textContent = crystals;
}

function isGameOver() {
    return crystals === 0 || step > 4;
}

function getScaleFactor() {
    const gameContainer = document.getElementById('game-container');
    const widthToHeightRatio = 600 / 931;
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    if (viewportWidth / viewportHeight < widthToHeightRatio) {
        scaleFactor = viewportWidth / 600;
    } else {
        scaleFactor = viewportHeight / 931;
    }
    return scaleFactor;
}

function resizeGame() {
    const gameContainer = document.getElementById('game-container');
    scaleFactor = getScaleFactor();
    gameContainer.style.transform = `scale(${scaleFactor})`;
}

window.addEventListener('resize', resizeGame);
window.onload = function() {
    regenerateShapes();
    resizeGame();
}