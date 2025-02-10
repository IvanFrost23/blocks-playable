function createTutorialShape(shape, shapeOffsets, cellSize) {
    var dragImage = shape.cloneNode(true);
    dragImage.classList.add("tutorial-shape");

    var maxRow = Math.max.apply(null, shapeOffsets.map(function(o) {
        return o.row;
    })) + 1;
    var maxCol = Math.max.apply(null, shapeOffsets.map(function(o) {
        return o.col;
    })) + 1;

    dragImage.style.gridTemplateRows = "repeat(" + maxRow + ", " + cellSize + "px)";
    dragImage.style.gridTemplateColumns = "repeat(" + maxCol + ", " + cellSize + "px)";
    dragImage.style.width = Math.ceil(cellSize * maxCol) + "px";
    dragImage.style.height = Math.ceil(cellSize * maxRow) + "px";

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
    var shape = shapesContainer.querySelector(".shape");
    if (!shape) return;

    var finger = document.getElementById("tutorialFinger");
    if (!finger) {
        finger = document.createElement("img");
        finger.src = "../images/finger.png";
        finger.id = "tutorialFinger";
        finger.style.position = "absolute";
        finger.style.pointerEvents = "none";
        finger.style.zIndex = "9999";
        document.body.appendChild(finger);
    }

    function animateCycle() {
        var scaleFactor = getScaleFactor();
        var shapeRect = shape.getBoundingClientRect();
        var startX = shapeRect.left + shapeRect.width / 2;
        var startY = shapeRect.top + shapeRect.height / 2;

        var targetCell = cells[59];
        var targetRect = targetCell.getBoundingClientRect();
        var endX = targetRect.left;
        var endY = targetRect.top;

        finger.style.transition = "none";
        finger.style.left = startX + "px";
        finger.style.top = startY + "px";
        finger.style.opacity = "1";
        finger.style.transformOrigin = "center center";
        finger.style.transform =
            "translate(-50%, -50%) translate(" +
            (40 * scaleFactor) + "px, " + (50 * scaleFactor) +
            "px) scale(" + scaleFactor + ")";

        void finger.offsetWidth;

        var cellSize = playingField.querySelector(".cell").offsetWidth;
        var blocks = shape.querySelectorAll(".block");
        var shapeOffsets = [];

        for (var i = 0; i < blocks.length; i++) {
            var block = blocks[i];
            var row = parseInt(block.style.gridRowStart, 10) - 1;
            var col = parseInt(block.style.gridColumnStart, 10) - 1;
            shapeOffsets.push({ row: row, col: col });
        }

        var scaledClone = createTutorialShape(shape, shapeOffsets, cellSize);
        scaledClone.id = "scaledClone";
        scaledClone.style.opacity = "0.5";
        scaledClone.style.transformOrigin = "center center";
        scaledClone.style.left = startX + "px";
        scaledClone.style.top = startY + "px";
        scaledClone.style.transform =
            "translate(-50%, -50%) scale(" + scaleFactor + ")";

        document.body.appendChild(scaledClone);

        void scaledClone.offsetWidth;

        var deltaX = endX - startX;
        var deltaY = endY - startY;
        var transitionStyle = "transform 1s ease-out, opacity 1s ease-out";

        finger.style.transition = transitionStyle;
        scaledClone.style.transition = transitionStyle;

        finger.style.transform =
            "translate(" + deltaX + "px, " + deltaY +
            "px) translate(-50%, -50%) translate(" +
            (40 * scaleFactor) + "px, " + (50 * scaleFactor) +
            "px) scale(" + scaleFactor + ")";

        scaledClone.style.transform =
            "translate(" + deltaX + "px, " + deltaY +
            "px) translate(-50%, -50%) scale(" + scaleFactor + ")";

        setTimeout(function() {
            if (scaledClone.parentNode) {
                scaledClone.parentNode.removeChild(scaledClone);
            }
            finger.style.opacity = "0";
        }, 1000);

        function onFade(e) {
            if (e.propertyName === "opacity") {
                finger.removeEventListener("transitionend", onFade);
                setTimeout(animateCycle, 500);
            }
        }
        finger.addEventListener("transitionend", onFade);
    }

    animateCycle();
}

function stopTutorialAnimation() {
    var finger = document.getElementById("tutorialFinger");
    var scaledClone = document.getElementById("scaledClone");

    if (finger && finger.parentNode) {
        finger.parentNode.removeChild(finger);
    }
    if (scaledClone && scaledClone.parentNode) {
        scaledClone.parentNode.removeChild(scaledClone);
    }
}
