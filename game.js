// Taipei Collage Game - Full Version with Asset Loading

// === Global Variables ===
let objects = [];
let currentTool = null;
let following = null;
let selectedObject = null;
let dragging = false;
let bgImage = null;
let assetImages = {}; // Store loaded images

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
        count: 0, // No assets for now
        angles: ['L', 'front', 'R'],
        path: 'assets/scooter/'
    }
};

// === P5.JS PRELOAD - Load Assets ===
function preload() {
    console.log('🚀 Starting to load assets...');
    
    for (let [type, config] of Object.entries(assetConfig)) {
        if (config.count === 0) {
            console.log(`⏭️ Skipping ${type} (no assets)`);
            continue;
        }
        
        assetImages[type] = {};
        console.log(`📂 Loading ${type} type, total ${config.count} styles`);
        
        for (let i = 1; i <= config.count; i++) {
            let styleNum = String(i).padStart(2, '0');
            assetImages[type][styleNum] = {};
            
            for (let angle of config.angles) {
                let filename = `${type}-${styleNum}-${angle}.png`;
                let filepath = config.path + filename;
                
                console.log(`🔍 Loading: ${filepath}`);
                
                assetImages[type][styleNum][angle] = loadImage(
                    filepath,
                    (img) => console.log(`✅ Success: ${filepath} (${img.width}x${img.height})`),
                    (error) => console.error(`❌ Failed: ${filepath}`)
                );
            }
        }
    }
}

// === P5.JS SETUP ===
function setup() {
    createCanvas(windowWidth, windowHeight);
    console.log('🎮 New version asset system activated!');
    
    // Check asset loading
    setTimeout(() => {
        console.log('🖼️ Checking asset status:');
        for (let [type, config] of Object.entries(assetConfig)) {
            if (config.count > 0 && assetImages[type]) {
                for (let [styleNum, angles] of Object.entries(assetImages[type])) {
                    for (let [angle, img] of Object.entries(angles)) {
                        if (img && img.width > 0) {
                            console.log(`✅ ${type}-${styleNum}-${angle}: ${img.width}x${img.height}`);
                        } else {
                            console.log(`❌ ${type}-${styleNum}-${angle}: Not loaded`);
                        }
                    }
                }
            }
        }
    }, 2000);
    
    loadRandomBackground();
    updateStatus('New version loaded! Click tools to test!');
}

// === P5.JS DRAW ===
function draw() {
    background(30);
    
    // Draw background
    if (bgImage) {
        let frameX = width * 0.1;
        let frameY = height * 0.15;
        let frameW = width * 0.8;
        let frameH = height * 0.7;
        image(bgImage, frameX, frameY, frameW, frameH);
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
    
    // Draw control panel
    if (selectedObject && !dragging) {
        drawObjectControls();
    }
}

// === Background Related ===
function loadRandomBackground() {
    let imageUrls = [
        'https://picsum.photos/1200/800?random=1',
        'https://picsum.photos/1200/800?random=2',
        'https://picsum.photos/1200/800?random=3',
        'https://picsum.photos/1200/800?random=4',
        'https://picsum.photos/1200/800?random=5'
    ];
    
    let imageUrl = imageUrls[Math.floor(Math.random() * imageUrls.length)];
    
    loadImage(imageUrl, 
        (img) => {
            bgImage = img;
            bgImage.filter(GRAY);
            console.log('🖼️ Background loaded successfully');
        },
        () => {
            console.log('❌ Background loading failed');
            bgImage = null;
        }
    );
}

function drawFallbackBackground() {
    fill(80);
    noStroke();
    rect(width * 0.1, height * 0.15, width * 0.8, height * 0.7);
    
    fill(60);
    for (let i = 0; i < 4; i++) {
        let x = width * 0.1 + i * (width * 0.2);
        let h = 50 + i * 30;
        rect(x, height * 0.4, width * 0.2, h);
    }
    
    fill(40);
    rect(width * 0.1, height * 0.7, width * 0.8, height * 0.15);
}

function drawFrame() {
    stroke(255, 215, 0);
    strokeWeight(3);
    noFill();
    rect(width * 0.1, height * 0.15, width * 0.8, height * 0.7);
}

// === Object Drawing ===
function drawObject(obj) {
    push();
    translate(obj.x, obj.y);
    rotate(radians(obj.rotation));
    scale(obj.scale);
    
    // Highlight selected
    if (selectedObject === obj) {
        stroke(255, 255, 0);
        strokeWeight(4);
        noFill();
        ellipse(0, 0, 120);
    }
    
    // Draw object
    if (obj.hasAsset && obj.currentImage && obj.currentImage.width > 0) {
        // Use real asset
        imageMode(CENTER);
        let scale = 0.3; // Adjust image size
        image(obj.currentImage, 0, 0, obj.currentImage.width * scale, obj.currentImage.height * scale);
        console.log(`🎨 Drawing asset: ${obj.type} (${obj.currentImage.width}x${obj.currentImage.height})`);
    } else {
        // Use geometric shape
        drawGeometricShape(obj);
    }
    
    pop();
}

function drawGeometricShape(obj) {
    fill(obj.color || '#ee964b');
    stroke(255);
    strokeWeight(2);
    
    switch (obj.type) {
        case 'vendor':
            rect(-30, -20, 60, 40);
            break;
        case 'scooter':
            ellipse(0, 0, 60, 30);
            break;
        case 'rain':
            triangle(-30, 15, 0, -30, 30, 15);
            break;
        case 'balcony':
            rect(-25, -15, 50, 30);
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
        
        // Show asset preview
        let previewImage = assetImages[following]['01']['front'];
        tint(255, 200);
        imageMode(CENTER);
        let scale = 0.25;
        image(previewImage, 0, 0, previewImage.width * scale, previewImage.height * scale);
        noTint();
    } else {
        // Geometric shape preview
        drawGeometricPreview();
    }
    
    pop();
}

function drawGeometricPreview() {
    fill(255, 255, 0, 150);
    stroke(255);
    strokeWeight(3);
    
    switch (following) {
        case 'vendor':
            rect(-30, -20, 60, 40);
            break;
        case 'scooter':
            ellipse(0, 0, 60, 30);
            break;
        case 'rain':
            triangle(-30, 15, 0, -30, 30, 15);
            break;
        case 'balcony':
            rect(-25, -15, 50, 30);
            break;
    }
}

// === Control Panel ===
function drawObjectControls() {
    let obj = selectedObject;
    let controlX = constrain(obj.x + 60, 10, width - 130);
    let controlY = constrain(obj.y - 60, 10, height - 90);
    
    // Background
    fill(0, 0, 0, 200);
    stroke(255, 215, 0);
    strokeWeight(2);
    rect(controlX, controlY, 120, 80, 5);
    
    // Buttons
    fill(255, 215, 0);
    noStroke();
    
    if (obj.hasAsset) {
        rect(controlX + 5, controlY + 5, 30, 20, 3);
        fill(0);
        textAlign(CENTER, CENTER);
        textSize(10);
        text('Angle', controlX + 20, controlY + 15);
    }
    
    fill(255, 215, 0);
    rect(controlX + 40, controlY + 5, 30, 20, 3);
    fill(0);
    text('Rotate', controlX + 55, controlY + 15);
    
    fill(255, 215, 0);
    rect(controlX + 75, controlY + 5, 35, 20, 3);
    fill(0);
    text('Scale', controlX + 92, controlY + 15);
    
    // Status Display
    fill(255);
    textAlign(LEFT, CENTER);
    textSize(8);
    if (obj.hasAsset) {
        text(`Angle: ${obj.angleNames[obj.angleIndex]}`, controlX + 5, controlY + 35);
    }
    text(`Rotation: ${Math.round(obj.rotation)}°`, controlX + 5, controlY + 45);
    text(`Scale: ${obj.scale.toFixed(1)}x`, controlX + 5, controlY + 55);
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
        angleIndex: 1, // 0: L, 1: front, 2: R
        angleNames: ['Left 45°', 'Front', 'Right 45°']
    };
    
    if (hasAsset && assetImages[type]) {
        // Randomly select style and angle
        let styleNum = String(Math.floor(Math.random() * config.count) + 1).padStart(2, '0');
        obj.angleIndex = Math.floor(Math.random() * 3);
        
        obj.styleNum = styleNum;
        let angleName = config.angles[obj.angleIndex];
        
        if (assetImages[type][styleNum] && assetImages[type][styleNum][angleName]) {
            obj.currentImage = assetImages[type][styleNum][angleName];
            console.log(`🎯 Created asset object: ${type}-${styleNum}-${angleName}`);
        } else {
            console.log(`❌ Asset not found: ${type}-${styleNum}-${angleName}`);
            obj.hasAsset = false;
            obj.color = '#ee964b';
        }
    } else {
        obj.color = '#ee964b';
    }
    
    return obj;
}

// === Interaction Logic ===
function selectTool(tool) {
    console.log('🔧 Selected tool:', tool);
    currentTool = tool;
    following = tool;
    selectedObject = null;
    
    document.querySelectorAll('.btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    
    updateStatus(`Selected ${tool}, move and click to place!`);
}

function mousePressed() {
    if (selectedObject && !dragging) {
        let obj = selectedObject;
        let controlX = constrain(obj.x + 60, 10, width - 130);
        let controlY = constrain(obj.y - 60, 10, height - 90);
        
        // Check button clicks
        if (obj.hasAsset && mouseX >= controlX + 5 && mouseX <= controlX + 35 && 
            mouseY >= controlY + 5 && mouseY <= controlY + 25) {
            changeAngle(obj);
            return;
        }
        
        if (mouseX >= controlX + 40 && mouseX <= controlX + 70 && 
            mouseY >= controlY + 5 && mouseY <= controlY + 25) {
            rotateObject(obj);
            return;
        }
        
        if (mouseX >= controlX + 75 && mouseX <= controlX + 110 && 
            mouseY >= controlY + 5 && mouseY <= controlY + 25) {
            scaleObject(obj);
            return;
        }
    }
    
    if (following) {
        // Place object
        let newObj = createNewObject(following, mouseX, mouseY);
        objects.push(newObj);
        
        following = null;
        currentTool = null;
        selectedObject = null;
        
        document.querySelectorAll('.btn').forEach(btn => btn.classList.remove('active'));
        
        updateStatus(`Placed object, total: ${objects.length}`);
        console.log('📍 Placed object, total:', objects.length);
    } else {
        // Select object
        selectedObject = null;
        for (let i = objects.length - 1; i >= 0; i--) {
            let obj = objects[i];
            let d = dist(mouseX, mouseY, obj.x, obj.y);
            if (d < 60) {
                selectedObject = obj;
                dragging = true;
                updateStatus(`Selected ${obj.type}`);
                break;
            }
        }
    }
}

function mouseDragged() {
    if (selectedObject && dragging) {
        selectedObject.x = mouseX;
        selectedObject.y = mouseY;
    }
}

function mouseReleased() {
    dragging = false;
}

// === Object Controls ===
function changeAngle(obj) {
    if (!obj.hasAsset) return;
    
    obj.angleIndex = (obj.angleIndex + 1) % 3;
    let config = assetConfig[obj.type];
    let angleName = config.angles[obj.angleIndex];
    
    if (assetImages[obj.type][obj.styleNum][angleName]) {
        obj.currentImage = assetImages[obj.type][obj.styleNum][angleName];
        updateStatus(`Angle: ${obj.angleNames[obj.angleIndex]}`);
        console.log(`🔄 Changed angle: ${obj.type}-${obj.styleNum}-${angleName}`);
    }
}

function rotateObject(obj) {
    obj.rotation += 15;
    if (obj.rotation >= 360) obj.rotation -= 360;
    updateStatus(`Rotation: ${Math.round(obj.rotation)}°`);
}

function scaleObject(obj) {
    if (obj.scale === 1) obj.scale = 1.5;
    else if (obj.scale === 1.5) obj.scale = 0.7;
    else obj.scale = 1;
    updateStatus(`Scale: ${obj.scale.toFixed(1)}x`);
}

// === Utility Functions ===
function randomBG() {
    loadRandomBackground();
    updateStatus('Loading new background...');
}

function clearAll() {
    objects = [];
    following = null;
    currentTool = null;
    selectedObject = null;
    document.querySelectorAll('.btn').forEach(btn => btn.classList.remove('active'));
    updateStatus('Cleared!');
}

function saveImage() {
    saveCanvas('taipei-collage', 'png');
    updateStatus('Image saved!');
}

function updateStatus(msg) {
    document.getElementById('status').textContent = msg;
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
}