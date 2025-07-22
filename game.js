// === Global Variables ===
let objects = [];
let currentTool = null;
let following = null;
let selectedObject = null;
let dragging = false;
let rotating = false;
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
        count: 2,
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
    console.log('🎮 Clean sandbox version activated!');
}

// === P5.JS DRAW ===
function draw() {
    // Clear background with transparency
    clear();
    
    // Draw background image
    if (bgImage) {
        push();
        tint(255, 150); // Semi-transparent background
        image(bgImage, 0, 0, width, height);
        noTint();
        pop();
    } else {
        drawFallbackBackground();
    }
    
    // Draw all objects
    for (let obj of objects) {
        drawObject(obj);
    }
    
    // Draw following object (preview when placing)
    if (following) {
        drawFollowing();
    }
    
    // Draw selection indicators
    if (selectedObject && !dragging && !rotating) {
        drawSelectionIndicator();
    }
}

// === Background Functions ===
function loadRandomBackground() {
    let imageUrls = [
        'https://picsum.photos/1000/700?random=' + Math.floor(Math.random() * 50),
        'https://picsum.photos/1000/700?random=' + Math.floor(Math.random() * 50 + 50),
        'https://picsum.photos/1000/700?random=' + Math.floor(Math.random() * 50 + 100)
    ];
    
    let imageUrl = imageUrls[Math.floor(Math.random() * imageUrls.length)];
    
    loadImage(imageUrl, 
        (img) => {
            bgImage = img;
            bgImage.filter(GRAY);
            console.log('🖼️ New background loaded');
        },
        () => {
            bgImage = null;
            console.log('❌ Background loading failed');
        }
    );
}

function drawFallbackBackground() {
    // Simple gradient fallback
    for (let i = 0; i <= height; i++) {
        let alpha = map(i, 0, height, 100, 60);
        stroke(alpha, alpha, alpha + 20);
        line(0, i, width, i);
    }
}

// === Object Drawing ===
function drawObject(obj) {
    push();
    translate(obj.x, obj.y);
    rotate(radians(obj.rotation));
    scale(obj.scale * (obj.flipped ? -1 : 1), obj.scale);
    
    // Draw object based on type
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
    stroke(255, 255, 255, 220);
    strokeWeight(2);
    
    switch (obj.type) {
        case 'vendor':
            rect(-35, -25, 70, 50, 8);
            fill(255, 180);
            rect(-25, -15, 50, 10);
            break;
        case 'scooter':
            ellipse(0, 0, 70, 35);
            fill(255, 180);
            ellipse(-15, 0, 12);
            ellipse(15, 0, 12);
            break;
        case 'rain':
            triangle(-30, 15, 0, -30, 30, 15);
            fill(255, 180);
            triangle(-20, 8, 0, -18, 20, 8);
            break;
        case 'balcony':
            rect(-30, -20, 60, 40, 5);
            fill(255, 180);
            // Draw balcony rails
            for(let i = -25; i < 25; i += 5) {
                line(i, -15, i, 15);
            }
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
        tint(255, 180);
        imageMode(CENTER);
        let scale = 0.3;
        image(previewImage, 0, 0, previewImage.width * scale, previewImage.height * scale);
        noTint();
    } else {
        tint(255, 150);
        let previewObj = { type: following, color: '#FFD700' };
        drawGeometricShape(previewObj);
        noTint();
    }
    
    pop();
}

function drawSelectionIndicator() {
    if (!selectedObject) return;
    
    push();
    translate(selectedObject.x, selectedObject.y);
    
    // Selection ring
    stroke(255, 215, 0, 200);
    strokeWeight(3);
    noFill();
    ellipse(0, 0, 100);
    
    // Control handles
    fill(255, 255, 255, 200);
    stroke(100);
    strokeWeight(1);
    
    // Scale handles
    ellipse(50, 0, 12);
    ellipse(-50, 0, 12);
    ellipse(0, 50, 12);
    ellipse(0, -50, 12);
    
    pop();
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
    
    // Update UI
    document.querySelectorAll('.tool-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector('[data-tool="' + tool + '"]').classList.add('active');
    
    console.log(`🔧 Selected tool: ${tool}`);
}

function mousePressed() {
    if (following) {
        // Place new object
        let newObj = createNewObject(following, mouseX, mouseY);
        objects.push(newObj);
        
        following = null;
        currentTool = null;
        selectedObject = newObj;
        
        // Clear active tool
        document.querySelectorAll('.tool-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        
        console.log(`📍 Placed ${newObj.type}, total objects: ${objects.length}`);
    } else {
        // Select existing object
        selectedObject = null;
        for (let i = objects.length - 1; i >= 0; i--) {
            let obj = objects[i];
            let d = dist(mouseX, mouseY, obj.x, obj.y);
            if (d < 50) {
                selectedObject = obj;
                dragging = !keyIsDown(SHIFT);
                rotating = keyIsDown(SHIFT);
                console.log(`🎯 Selected ${obj.type}`);
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
        console.log(`📏 Scale: ${selectedObject.scale.toFixed(2)}x`);
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
                console.log('🗑️ Object deleted');
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
        console.log(`🔄 Changed angle to ${angleName}`);
    }
}

function flipObject(obj) {
    obj.flipped = !obj.flipped;
    console.log(`🔀 Object ${obj.flipped ? 'flipped horizontally' : 'restored'}`);
}

function changeLayer(obj) {
    let index = objects.indexOf(obj);
    if (index > -1) {
        objects.splice(index, 1);
        objects.push(obj);
        console.log('📤 Moved to front');
    }
}

// === Utility Functions ===
function randomBG() {
    loadRandomBackground();
    console.log('🎲 Loading new random background...');
}

function clearAll() {
    objects = [];
    following = null;
    currentTool = null;
    selectedObject = null;
    
    // Clear active tools
    document.querySelectorAll('.tool-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    console.log('🗑️ Canvas cleared - ready for new composition');
}

function saveImage() {
    saveCanvas('moving-taipei-sandbox', 'png');
    console.log('💾 Image saved as moving-taipei-sandbox.png');
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
}