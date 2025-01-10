/**
 * Created by Ivan on 10.01.2025
 */

const playingField = document.getElementById('playing-field');
const cells = [];
const shapesContainer = document.getElementById('shapes-container');
const blueGoal = document.getElementById('blue-goal');
const redGoal = document.getElementById('red-goal');
const yellowGoal = document.getElementById('yellow-goal');
let blueCrystals = parseInt(blueGoal.textContent);
let redCrystals = parseInt(redGoal.textContent);
let yellowCrystals = parseInt(yellowGoal.textContent);

const initialFieldState = [
    null, "blue", null, null, "yellow", null, null, "red",
    null, null, null, null, null, null, null, null,
    null, "red", null, null, null, null, "blue", null,
    null, null, "yellow", null, null, "blue", null, null,
    "red", null, null, null, "yellow", null, null, "blue",
    null, null, "red", null, null, "yellow", null, null,
    null, null, null, null, null, "blue", null, null,
    "yellow", null, null, null, "red", null, null, null
];

for (let i = 0; i < 64; i++) {
    const cell = document.createElement('div');
    cell.classList.add('cell');

    if (initialFieldState[i]) {
        const block = document.createElement('div');
        block.classList.add('block', initialFieldState[i]);
        cell.appendChild(block);
        const crystal = document.createElement('div');
        crystal.classList.add('crystal', initialFieldState[i]);
        cell.appendChild(crystal);
        cell.classList.add('filled');
    }

    playingField.appendChild(cell);
    cells.push(cell);
}

let draggedShape = null;
let shapeOffsets = [];
let touchOffsetX, touchOffsetY;
let currentHighlightCells = [];

const shapeTypes = [
    { shape: [[1]], color: 'blue', crystal: 0.2 },
    { shape: [[1, 1]], color: 'red', crystal: 0.3 },
    { shape: [[1], [1]], color: 'red', crystal: 0.3 },
    { shape: [[1], [1]], color: 'yellow', crystal: 0.3 },
    { shape: [[1], [1]], color: 'blue', crystal: 0.3 },
    { shape: [[1, 0], [1, 1]], color: 'yellow', crystal: 0.3 },
    { shape: [[1, 0], [1, 1]], color: 'red', crystal: 0.3 },
    { shape: [[1, 0], [1, 1]], color: 'blue', crystal: 0.3 },
    { shape: [[1], [1]], color: 'yellow', crystal: 0.25 },
    { shape: [[1, 1], [1, 1]], color: 'blue', crystal: 0.15 },
    { shape: [[1, 1, 1]], color: 'yellow', crystal: 0.3 },
    { shape: [[1, 1, 1, 1]], color: 'red', crystal: 0.5 },
    { shape: [[1, 1, 1], [1, 0, 1]], color: 'blue', crystal: 0.3 }
];

function createNewShape(randomType) {
    const shape = document.createElement('div');
    shape.classList.add('shape');
    shape.setAttribute('draggable', true);
    shape.addEventListener('touchstart', handleTouchStart);
    shape.addEventListener('touchmove', handleTouchMove);
    shape.addEventListener('touchend', handleTouchEnd);
    shape.addEventListener('touchcancel', handleTouchEnd); // Handle cancellation

    shape.addEventListener('dragstart', handleDragStart);
    shape.addEventListener('dragend', handleDragEnd);

    randomType.shape.forEach((row, rowIndex) => {
        row.forEach((cell, colIndex) => {
            if (cell === 1) {
                const block = document.createElement('div');
                block.classList.add('block', randomType.color);
                block.dataset.color = randomType.color;

                if (Math.random() < randomType.crystal) {
                    const crystal = document.createElement('div');
                    crystal.classList.add('crystal', randomType.color);
                    block.appendChild(crystal);
                    block.dataset.crystalType = randomType.color;
                }

                block.style.gridRowStart = rowIndex + 1;
                block.style.gridColumnStart = colIndex + 1;

                shape.appendChild(block);
            }
        });
    });

    return shape;
}


function regenerateShapes() {
    shapesContainer.innerHTML = '';
    for (let i = 0; i < 3; i++) {
        const randomType = shapeTypes[Math.floor(Math.random() * shapeTypes.length)];
        const newShape = createNewShape(randomType);
        shapesContainer.appendChild(newShape);
    }
}

function handleTouchStart(event) {
    draggedShape = event.target.closest('.shape');
    if (!draggedShape) return;

    const touch = event.touches[0];
    const rect = draggedShape.getBoundingClientRect();
    touchOffsetX = touch.clientX - rect.left;
    touchOffsetY = touch.clientY - rect.top;

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
            crystalType: block.dataset.crystalType,
        });
    });

    const cellSize = playingField.querySelector('.cell').offsetWidth;

    // Create the drag image
    const dragImage = draggedShape.cloneNode(true);
    dragImage.style.position = 'absolute';
    dragImage.style.pointerEvents = 'none';
    dragImage.style.display = 'grid';
    dragImage.style.gridTemplateRows = `repeat(${Math.max(...shapeOffsets.map(o => o.row)) + 1}, ${cellSize}px)`;
    dragImage.style.gridTemplateColumns = `repeat(${Math.max(...shapeOffsets.map(o => o.col)) + 1}, ${cellSize}px)`;
    dragImage.style.width = `${cellSize * (Math.max(...shapeOffsets.map((o) => o.col)) + 1)}px`;
    dragImage.style.height = `${cellSize * (Math.max(...shapeOffsets.map((o) => o.row)) + 1)}px`;
    dragImage.style.left = `${touch.clientX - touchOffsetX}px`;
    dragImage.style.top = `${touch.clientY - touchOffsetY}px`;
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

    document.body.appendChild(dragImage);
    draggedShape.dragImage = dragImage;

    // Highlight the dragged shape visually
    setTimeout(() => draggedShape.classList.add('dragging'), 0);
}


function handleTouchMove(event) {
    if (!draggedShape) return;

    event.preventDefault(); // Prevent scrolling
    const touch = event.touches[0];
    const dragImage = draggedShape.dragImage;

    if (dragImage) {
        dragImage.style.left = `${touch.clientX - touchOffsetX}px`;
        dragImage.style.top = `${touch.clientY - touchOffsetY}px`;
    }

    const fieldRect = playingField.getBoundingClientRect();
    const touchX = touch.clientX - fieldRect.left;
    const touchY = touch.clientY - fieldRect.top;

    const cellWidth = playingField.offsetWidth / 8;
    const cellHeight = playingField.offsetHeight / 8;
    const gridX = Math.floor(touchX / cellWidth);
    const gridY = Math.floor(touchY / cellHeight);
    const startIndex = gridY * 8 + gridX;

    if (startIndex >= 0 && startIndex < 64) {
        highlightCells(startIndex, true); // Indicate it's a touch event
    } else {
        clearHighlight();
    }
}

function handleTouchEnd(event) {
    if (!draggedShape) return;

    const dragImage = draggedShape.dragImage;
    if (dragImage) {
        document.body.removeChild(dragImage);
        draggedShape.dragImage = null;
    }

    draggedShape.classList.remove('dragging');

    const touch = event.changedTouches[0];
    const fieldRect = playingField.getBoundingClientRect();
    const touchX = touch.clientX - fieldRect.left;
    const touchY = touch.clientY - fieldRect.top;

    const cellWidth = playingField.offsetWidth / 8;
    const cellHeight = playingField.offsetHeight / 8;
    const gridX = Math.floor(touchX / cellWidth);
    const gridY = Math.floor(touchY / cellHeight);
    const startIndex = gridY * 8 + gridX;

    if (startIndex >= 0 && startIndex < 64) {
        placeShape(startIndex);
    } else {
        clearHighlight();
    }

    draggedShape = null;
    shapeOffsets = [];
}

function handleDragStart(event) {
    draggedShape = event.target;
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
            crystalType: block.dataset.crystalType,
        });
    });

    const cellSize = playingField.querySelector('.cell').offsetWidth;

    // Create the drag image
    const dragImage = draggedShape.cloneNode(true);
    dragImage.style.position = 'absolute';
    dragImage.style.display = 'grid';
    dragImage.style.gridGap = '0';
    dragImage.style.width =
        cellSize * (Math.max(...shapeOffsets.map((offset) => offset.col)) + 1) + 'px';
    dragImage.style.height =
        cellSize * (Math.max(...shapeOffsets.map((offset) => offset.row)) + 1) + 'px';

    // Adjust child block sizes to match the original
    dragImage.querySelectorAll('.block').forEach((block) => {
        block.style.width = cellSize + 'px';
        block.style.height = cellSize + 'px';
        block.style.gridRowStart = parseInt(block.style.gridRowStart);
        block.style.gridColumnStart = parseInt(block.style.gridColumnStart);

        const crystal = block.querySelector('.crystal');
        if (crystal) {
            crystal.style.width = cellSize * 0.5 + 'px';
            crystal.style.height = cellSize * 0.5 + 'px';
        }
    });

    dragImage.style.left = '-9999px'; // Initially hide the drag image
    document.body.appendChild(dragImage);

    // Set the drag image for the event
    event.dataTransfer.setDragImage(dragImage, cellSize / 2, cellSize / 2);

    // Cleanup the drag image after drag starts
    setTimeout(() => {
        document.body.removeChild(dragImage);
    }, 0);

    setTimeout(() => draggedShape.classList.add('dragging'), 0);
}

function handleDragEnd() {
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
                    crystal.classList.add('crystal', offset.crystalType);
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
    if (!draggedShape) return; // Ensure there's a shape being dragged

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
                    crystal.classList.add('crystal', offset.crystalType);
                    cell.appendChild(crystal);
                }
            }
        });

        checkAndClearFullRowsOrColumns();
        draggedShape.style.visibility = 'hidden';

        if ([...shapesContainer.children].every(shape => shape.style.visibility === 'hidden')) {
            regenerateShapes();
        }
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
            const crystalType = cell.querySelector('.crystal').classList[1];
            updateCrystalCount(crystalType);
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

function updateCrystalCount(type) {
    if (type === 'blue' && blueCrystals > 0) {
        blueCrystals--;
        blueGoal.textContent = blueCrystals;
    } else if (type === 'red' && redCrystals > 0) {
        redCrystals--;
        redGoal.textContent = redCrystals;
    } else if (type === 'yellow' && yellowCrystals > 0) {
        yellowCrystals--;
        yellowGoal.textContent = yellowCrystals;
    }
}

window.onload = regenerateShapes;