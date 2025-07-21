// === Global Variables ===
let objects = [];
let currentTool = null;
let following = null;
let selectedObject = null;
let dragging = false;
let rotating = false;
let scaling = false;
let bgImage = null;
let assetImages = {};

// === Asset Configuration ===
const assetConfig = {
    vendor: {
        count: 2,
        angles: ['L', 'front', 'R'],
        path: 'assets/vendor/'
    },
    balcony: {
        count: 1,
        angles: ['L', 'front', 'R'],
        path: 'assets/balcony/'
    },
    rain: {
        count: 2,
        angles: ['L', 'front', 'R'],
        path: 'assets/rain/'
    },
    scooter: {
        count: 0,
        angles: ['L', 'front', 'R'],
        path: 'assets/scooter/'
    }
};

// === P5.JS PRELOAD ===
function preload() {
    console.log('🚀 Loading assets...');
    
    for (let [type, config] of Object.entries(assetConfig)) {
        if (config.count === 0) continue;
        
        assetImages[type] = {};
        
        for (let i = 1; i <= config.count; i++) {
            let styleNum = String(i).padStart(2, '0');
            assetImages[type][styleNum] = {};
            
            for (let angle of config.angles) {
                let filename = `${type}-${styleNum}-${angle}.png`;
                let filepath = config.path + filename;
                
                assetImages[type][styleNum][angle] = loadImage(
                    filepath,
                    (img) => console.log(`✅ Loaded: ${filepath}`),
                    (error) => console.warn(`⚠️ Failed: ${filepath}`)
                );
            }
        }
    }
}

// === P5.JS SETUP ===
function setup() {
    let canvas = createCanvas(windowWidth, windowHeight);
    canvas.parent(document.body);
    
    loadRandomBackground();
    updateStatus('Ready! Select a tool and click to place objects');
}

// === P5.JS DRAW ===
function draw() {
    background(25, 28, 35);
    
    // Draw background
    if (bgImage) {
        let frameX = width * 0.1;
        let frameY = height * 0.12;
        let frameW = width * 0.8;
        let frameH = height * 0.75;
        
        push();
        tint(255, 180);
        image(bgImage, frameX, frameY, frameW, frameH);
        noTint();
        pop();
    } else {
        drawFallbackBackground();
    }
    
    // Draw objects
    for (let obj of objects) {
        drawObject(obj);
    }
    
    // Draw following object
    if (following) {
        drawFollowing();
    }
    
    // Draw frame
    drawFrame();
    
    // Draw object controls
    if (selectedObject && !dragging && !rotating) {
        drawFloatingControls();
    }
}

// === Background Functions ===
function loadRandomBackground() {
    let imageUrls = [
        'https://picsum.photos/1200/800?random=' + Math.floor(Math.random() * 50),
        'https://picsum.photos/1200/800?random=' + Math.floor(Math.random() * 50 + 50),
        'https://picsum.photos/1200/800?random=' + Math.floor(Math.random() * 50 + 100)
    ];
    
    let imageUrl = imageUrls[Math.floor(Math.random() * imageUrls.length)];
    
    loadImage(imageUrl, 
        (img) => {
            bgImage = img;
            bgImage.filter(GRAY);
            updateStatus('New street scene loaded');
        },
        () => {
            bgImage = null;
            updateStatus('Using fallback background');
        }
    );
}

function drawFallbackBackground() {
    // Gradient background
    for (let i = 0; i <= height * 0.75; i++) {
        let alpha = map(i, 0, height * 0.75, 80, 40);
        stroke(alpha);
        line(width * 0.1, height * 0.12 + i, width * 0.9, height * 0.12 + i);
    }
    
    // Urban silhouettes
    fill(60, 65, 75);
    noStroke();
    for (let i = 0; i < 6; i++) {
        let x = width * 0.1 + i * (width * 0.13);
        let h = 40 + Math.sin(i) * 60;
        rect(x, height * 0.6, width * 0.12, h);
    }
}

function drawFrame() {
    stroke(255, 215, 0, 150);
    strokeWeight(2);
    noFill();
    
    let frameX = width * 0.1;
    let frameY = height * 0.12;
    let frameW = width * 0.8;
    let frameH = height * 0.75;
    
    // Corner brackets
    let cornerSize = 20;
    
    // Top-left
    line(frameX, frameY, frameX + cornerSize, frameY);
    line(frameX, frameY, frameX, frameY + cornerSize);
    
    // Top-right
    line(frameX + frameW, frameY, frameX + frameW - cornerSize, frameY);
    line(frameX + frameW, frameY, frameX + frameW, frameY + cornerSize);
    
    // Bottom-left
    line(frameX, frameY + frameH, frameX + cornerSize, frameY + frameH);
    line(frameX, frameY + frameH, frameX, frameY + frameH - cornerSize);
    
    // Bottom-right
    line(frameX + frameW, frameY + frameH, frameX + frameW - cornerSize, frameY + frameH);
    line(frameX + frameW, frameY + frameH, frameX + frameW, frameY + frameH - cornerSize);
}

// === Object Drawing ===
function drawObject(obj) {
    push();
    translate(obj.x, obj.y);
    rotate(radians(obj.rotation));
    scale(obj.scale * (obj.flipped ? -1 : 1), obj.scale); // Apply horizontal flip
    
    // Selection indicator
    if (selectedObject === obj) {
        stroke(255, 215, 0, 200);
        strokeWeight(3);
        noFill();
        ellipse(0, 0, 120);
        
        // Rotation handle
        stroke(255, 100, 100, 150);
        strokeWeight(2);
        line(0, -60, 0, -80);
        ellipse(0, -80, 12);
        
        // Scale handles
        stroke(100, 255, 100, 150);
        ellipse(60, 0, 10);
        ellipse(-60, 0, 10);
        ellipse(0, 60, 10);
        ellipse(0, -60, 10);
    }
    
    // Draw object
    if (obj.hasAsset && obj.currentImage && obj.currentImage.width > 0) {
        imageMode(CENTER);
        let scale = 0.4;
        image(obj.currentImage, 0, 0, obj.currentImage.width * scale, obj.currentImage.height * scale);
    } else {
        drawGeometricShape(obj);
    }
    
    pop();
}

function drawGeometricShape(obj) {
    fill(obj.color || '#FFD700');
    stroke(255, 255, 255, 200);
    strokeWeight(2);
    
    switch (obj.type) {
        case 'vendor':
            rect(-35, -25, 70, 50, 5);
            fill(255, 100);
            rect(-25, -15, 50, 10);
            break;
        case 'scooter':
            ellipse(0, 0, 80, 40);
            fill(255, 100);
            ellipse(-15, 0, 12);
            ellipse(15, 0, 12);
            break;
        case 'rain':
            triangle(-35, 20, 0, -35, 35, 20);
            fill(255, 100);
            triangle(-25, 10, 0, -20, 25, 10);
            break;
        case 'balcony':
            rect(-30, -20, 60, 40, 3);
            fill(255, 100);
            rect(-25, -15, 50, 8);
            break;
    }
}

function drawFollowing() {
    push();
    translate(mouseX, mouseY);
    
    if (following && assetConfig[following].count > 0 && 
        assetImages[following] && assetImages[following]['01'] && 
        assetImages[following]['01']['front'] && 
        assetImages[following]['01']['front'].width > 0) {
        
        let previewImage = assetImages[following]['01']['front'];
        tint(255, 200);
        imageMode(CENTER);
        let scale = 0.3;
        image(previewImage, 0, 0, previewImage.width * scale, previewImage.height * scale);
        noTint();
    } else {
        tint(255, 150);
        drawGeometricPreview();
        noTint();
    }
    
    pop();
}

function drawGeometricPreview() {
    fill(255, 215, 0, 150);
    stroke(255, 200);
    strokeWeight(3);
    
    switch (following) {
        case 'vendor':
            rect(-35, -25, 70, 50, 5);
            break;
        case 'scooter':
            ellipse(0, 0, 80, 40);
            break;
        case 'rain':
            triangle(-35, 20, 0, -35, 35, 20);
            break;
        case 'balcony':
            rect(-30, -20, 60, 40, 3);
            break;
    }
}

// === Floating Controls ===
function drawFloatingControls() {
    let obj = selectedObject;
    let spacing = 50;
    let controlY = obj.y - 100;
    let startX = obj.x - spacing;
    
    // Constrain to screen
    controlY = constrain(controlY, 30, height - 30);
    startX = constrain(startX, spacing, width - spacing * 2);
    
    // Angle control (if has asset)
    if (obj.hasAsset) {
        drawFloatingButton(startX - spacing, controlY, '↻', 'Change Angle');
        startX += spacing;
    }
    
    // Flip control
    drawFloatingButton(startX, controlY, '⟷', 'Flip');
    
    // Layer control
    drawFloatingButton(startX + spacing, controlY, '↕', 'Layer');
}

function drawFloatingButton(x, y, icon, tooltip) {
    // Button background
    fill(255, 255, 255, 230);
    stroke(100, 100, 100, 150);
    strokeWeight(1);
    ellipse(x, y, 40);
    
    // Icon
    fill(50, 50, 50);
    textAlign(CENTER, CENTER);
    textSize(18);
    textFont('Arial');
    text(icon, x, y);
    
    // Hover effect
    let d = dist(mouseX, mouseY, x, y);
    if (d < 20) {
        stroke(255, 215, 0);
        strokeWeight(2);
        noFill();
        ellipse(x, y, 44);
    }
}

// === Object Creation ===
function createNewObject(type, x, y) {
    let config = assetConfig[type];
    let hasAsset = config.count > 0;
    
    let obj = {
        type: type,
        x: x,
        y: y,
        rotation: 0,
        scale: 1,
        hasAsset: hasAsset,
        angleIndex: 1,
        flipped: false,
        zIndex: objects.length
    };
    
    if (hasAsset && assetImages[type]) {
        let styleNum = String(Math.floor(Math.random() * config.count) + 1).padStart(2, '0');
        obj.styleNum = styleNum;
        let angleName = config.angles[obj.angleIndex];
        
        if (assetImages[type][styleNum] && assetImages[type][styleNum][angleName]) {
            obj.currentImage = assetImages[type][styleNum][angleName];
        } else {
            obj.hasAsset = false;
            obj.color = '#FFD700';
        }
    } else {
        obj.color = '#FFD700';
    }
    
    return obj;
}

// === Interaction Logic ===
function selectTool(tool) {
    currentTool = tool;
    following = tool;
    selectedObject = null;
    
    document.querySelectorAll('.tool-btn').forEach(btn => btn.classList.remove('active'));
    event.target.closest('.tool-btn').classList.add('active');
    
    updateStatus(`Selected ${tool} tool - click to place objects`);
}

function mousePressed() {
    // Check floating controls first
    if (selectedObject && !dragging) {
        let obj = selectedObject;
        let spacing = 50;
        let controlY = constrain(obj.y - 100, 30, height - 30);
        let startX = constrain(obj.x - spacing, spacing, width - spacing * 2);
        
        // Check button clicks
        if (obj.hasAsset) {
            if (dist(mouseX, mouseY, startX - spacing, controlY) < 20) {
                changeAngle(obj);
                return;
            }
            startX += spacing;
        }
        
        if (dist(mouseX, mouseY, startX, controlY) < 20) {
            flipObject(obj);
            return;
        }
        
        if (dist(mouseX, mouseY, startX + spacing, controlY) < 20) {
            changeLayer(obj);
            return;
        }
    }
    
    if (following) {
        // Place object
        let newObj = createNewObject(following, mouseX, mouseY);
        objects.push(newObj);
        
        following = null;
        currentTool = null;
        selectedObject = newObj;
        
        document.querySelectorAll('.tool-btn').forEach(btn => btn.classList.remove('active'));
        updateStatus(`Placed ${newObj.type} - drag to move, scroll to scale`);
    } else {
        // Select object
        selectedObject = null;
        for (let i = objects.length - 1; i >= 0; i--) {
            let obj = objects[i];
            let d = dist(mouseX, mouseY, obj.x, obj.y);
            if (d < 60) {
                selectedObject = obj;
                dragging = !keyIsDown(SHIFT);
                rotating = keyIsDown(SHIFT);
                updateStatus(`Selected ${obj.type} - ${keyIsDown(SHIFT) ? 'drag to rotate' : 'drag to move'}`);
                break;
            }
        }
    }
}

function mouseDragged() {
    if (selectedObject) {
        if (dragging) {
            selectedObject.x = mouseX;
            selectedObject.y = mouseY;
        } else if (rotating) {
            let angle = atan2(mouseY - selectedObject.y, mouseX - selectedObject.x);
            selectedObject.rotation = degrees(angle);
        }
    }
}

function mouseReleased() {
    dragging = false;
    rotating = false;
}

function mouseWheel(event) {
    if (selectedObject) {
        let scaleChange = -event.delta * 0.001;
        selectedObject.scale += scaleChange;
        selectedObject.scale = constrain(selectedObject.scale, 0.2, 3.0);
        updateStatus(`Scale: ${selectedObject.scale.toFixed(2)}x`);
        return false; // Prevent page scroll
    }
}

function keyPressed() {
    if (selectedObject) {
        if (key === 'r' || key === 'R') {
            selectedObject.rotation += 15;
        }
        if (key === 'f' || key === 'F') {
            flipObject(selectedObject);
        }
        if (keyCode === DELETE || keyCode === BACKSPACE) {
            let index = objects.indexOf(selectedObject);
            if (index > -1) {
                objects.splice(index, 1);
                selectedObject = null;
                updateStatus('Object deleted');
            }
        }
    }
}

// === Object Controls ===
function changeAngle(obj) {
    if (!obj.hasAsset) return;
    
    obj.angleIndex = (obj.angleIndex + 1) % 3;
    let config = assetConfig[obj.type];
    let angleName = config.angles[obj.angleIndex];
    
    if (assetImages[obj.type][obj.styleNum][angleName]) {
        obj.currentImage = assetImages[obj.type][obj.styleNum][angleName];
        updateStatus(`Changed angle to ${angleName}`);
    }
}

function flipObject(obj) {
    obj.flipped = !obj.flipped;
    updateStatus(`Object ${obj.flipped ? 'flipped horizontally' : 'restored'}`);
}

function changeLayer(obj) {
    // Move to front
    let index = objects.indexOf(obj);
    if (index > -1) {
        objects.splice(index, 1);
        objects.push(obj);
        updateStatus('Moved to front');
    }
}

// === Utility Functions ===
function randomBG() {
    loadRandomBackground();
    updateStatus('Loading new street scene...');
}

function clearAll() {
    objects = [];
    following = null;
    currentTool = null;
    selectedObject = null;
    document.querySelectorAll('.tool-btn').forEach(btn => btn.classList.remove('active'));
    updateStatus('Canvas cleared - ready for new composition');
}

function saveImage() {
    saveCanvas('taipei-street-collage', 'png');
    updateStatus('Image saved as taipei-street-collage.png');
}

function updateStatus(msg) {
    document.getElementById('status').textContent = msg;
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
}