function createTutorialShape(shape, shapeOffsets, cellSize) {
    var dragImage = shape.cloneNode(true);
    dragImage.style.position = "absolute";
    dragImage.style.pointerEvents = "none";
    dragImage.style.display = "grid";

    var maxRow = Math.max.apply(null, shapeOffsets.map(function(o) { return o.row; })) + 1;
    var maxCol = Math.max.apply(null, shapeOffsets.map(function(o) { return o.col; })) + 1;

    dragImage.style.gridTemplateRows = "repeat(" + maxRow + ", " + cellSize + "px)";
    dragImage.style.gridTemplateColumns = "repeat(" + maxCol + ", " + cellSize + "px)";
    dragImage.style.width = Math.ceil(cellSize * maxCol) + "px";
    dragImage.style.height = Math.ceil(cellSize * maxRow) + "px";
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

function startTutorialAnimation() {
    // Pick a shape from the shapes container.
    const shape = shapesContainer.querySelector('.shape');
    if (!shape) return;

    // Create (or reuse) the finger element.
    let finger = document.getElementById("tutorialFinger");
    if (!finger) {
        finger = document.createElement('img');
        finger.src = "../images/finger.png";  // Adjust the path as needed.
        finger.id = "tutorialFinger";
        finger.style.position = "absolute";
        finger.style.pointerEvents = "none";
        // Ensure the finger appears above everything.
        finger.style.zIndex = "9999";
        document.body.appendChild(finger);
    }

    function animateCycle() {
        // Determine the starting point: center of the shape.
        const shapeRect = shape.getBoundingClientRect();
        const startX = shapeRect.left + shapeRect.width / 2;
        const startY = shapeRect.top + shapeRect.height / 2;

        // Pick a target cell (for example, cell index 59).
        const targetCell = cells[59];
        const targetRect = targetCell.getBoundingClientRect();
        const endX = targetRect.left;
        const endY = targetRect.top;

        // Reset the finger instantly.
        finger.style.transition = "none";
        finger.style.left = startX + "px";
        finger.style.top = startY + "px";
        finger.style.transform = "none";
        finger.style.opacity = "1";
        void finger.offsetWidth;  // Force reflow.

        // Get the playing field's cell size.
        const cellSize = playingField.querySelector(".cell").offsetWidth;

        // Compute shape offsets from its blocks.
        const blocks = shape.querySelectorAll(".block");
        let shapeOffsets = [];
        blocks.forEach(function(block) {
            const row = parseInt(block.style.gridRowStart) - 1;
            const col = parseInt(block.style.gridColumnStart) - 1;
            shapeOffsets.push({ row, col });
        });

        // Create a scaled clone (the tutorial shape) using the cell size.
        const scaledClone = createTutorialShape(shape, shapeOffsets, cellSize);
        scaledClone.style.opacity = "0.5";
        const maxRow = Math.max(...shapeOffsets.map(o => o.row)) + 1;
        const maxCol = Math.max(...shapeOffsets.map(o => o.col)) + 1;
        const cloneWidth = cellSize * maxCol;
        const cloneHeight = cellSize * maxRow;
        // Position the clone so its center is at the starting point.
        scaledClone.style.left = (startX - cloneWidth / 2) + "px";
        scaledClone.style.top = (startY - cloneHeight / 2) + "px";
        document.body.appendChild(scaledClone);
        void scaledClone.offsetWidth;  // Force reflow for the clone.

        // Compute translation differences.
        const deltaX = endX - startX;
        const deltaY = endY - startY;

        // Set transitions on both the finger and the clone.
        // Both transform and opacity transitions take 1 second.
        const transitionStyle = "transform 1s ease-out, opacity 1s ease-out";
        finger.style.transition = transitionStyle;
        scaledClone.style.transition = transitionStyle;

        // Start the translation.
        finger.style.transform = `translate(${deltaX}px, ${deltaY}px)`;
        scaledClone.style.transform = `translate(${deltaX}px, ${deltaY}px)`;

        // After 1 second (when the translation is done), immediately remove the clone
        // and start fading out the finger.
        setTimeout(() => {
            if (scaledClone.parentNode) {
                scaledClone.parentNode.removeChild(scaledClone);
            }
            finger.style.opacity = "0";
        }, 1000);

        // Listen for the finger's fade-out (opacity transition) to complete before restarting.
        function onFade(e) {
            if (e.propertyName === "opacity") {
                finger.removeEventListener("transitionend", onFade);
                // After a short delay, restart the animation cycle.
                setTimeout(animateCycle, 500);
            }
        }
        finger.addEventListener("transitionend", onFade);
    }

    animateCycle();
}

function stopTutorialAnimation() {
    const finger = document.getElementById("tutorialFinger");
    if (finger) {
        finger.remove();
    }
}
