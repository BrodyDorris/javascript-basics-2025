let isEditorMode = false;
let selectedObjectType = 'block';
let drag = false; // Used to track continuous placement

function setupEditor() {
    // Event listeners for the object palette buttons
    document.querySelectorAll('.palette-btn').forEach(button => {
        button.addEventListener('click', () => {
            selectedObjectType = button.dataset.objectType;
            console.log(`Selected: ${selectedObjectType}`);
        });
    });

    // Handle saving the level
    document.getElementById('editor-save-button').addEventListener('click', () => {
        const levelName = prompt("Enter a name for your level:");
        if (levelName) {
            localStorage.setItem(`gd_level_${levelName}`, JSON.stringify(levelData));
            alert(`Level "${levelName}" saved!`);
        }
    });

    // Handle deleting objects (right-click)
    canvas.addEventListener('contextmenu', (e) => {
        e.preventDefault(); // Prevent the default context menu
        if (isEditorMode) {
            handleEditorClick(e, cameraX);
        }
    });
}

function handleEditorClick(e, cameraX) {
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const objectX = mouseX + cameraX;
    const objectY = mouseY;

    const existingObjectIndex = levelData.findIndex(obj => 
        objectX >= obj.x && objectX <= obj.x + obj.width &&
        objectY >= obj.y && objectY <= obj.y + obj.height
    );

    if (e.button === 2) { // Right-click to delete
        if (existingObjectIndex > -1) {
            levelData.splice(existingObjectIndex, 1);
        }
    } else if (e.button === 0) { // Left-click to place
        if (existingObjectIndex === -1) { // Only place if no object exists at that spot
            let newObject = { type: selectedObjectType, x: objectX, y: objectY };
            if (selectedObjectType === 'block') {
                newObject.width = 40;
                newObject.height = 40;
                newObject.color = '#fff';
            } else if (selectedObjectType === 'spike') {
                newObject.width = 40;
                newObject.height = 40;
                newObject.color = '#ff0000';
                newObject.shape = 'triangle';
            } else if (selectedObjectType === 'ship-portal') {
                newObject.width = 40;
                newObject.height = 80;
                newObject.color = '#00ffff';
                newObject.shape = 'portal';
                newObject.targetMode = 'ship';
            }
            levelData.push(newObject);
        }
    }
}
