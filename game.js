// === Global Variables ===
let objects = [];
let currentTool = null;
let following = null;
let selectedObject = null;
let dragging = false;
let rotating = false;
let bgImage = null;
let assetImages = {};
let currentLocation = null;

// === Street View Locations Database ===
const streetViewLocations = [
    { lat: 25.0330, lng: 121.5654, name: "Taipei, Taiwan", description: "Taipei's bustling streets" },
    { lat: 35.6762, lng: 139.6503, name: "Tokyo, Japan", description: "Tokyo urban landscape" },
    { lat: 22.3193, lng: 114.1694, name: "Hong Kong", description: "Hong Kong street scene" },
    { lat: 1.3521, lng: 103.8198, name: "Singapore", description: "Singapore city streets" },
    { lat: 13.7563, lng: 100.5018, name: "Bangkok, Thailand", description: "Bangkok vibrant streets" },
    { lat: 10.8231, lng: 106.6297, name: "Ho Chi Minh City, Vietnam", description: "Ho Chi Minh City" },
    { lat: 14.5995, lng: 120.9842, name: "Manila, Philippines", description: "Manila street view" },
    { lat: -6.2088, lng: 106.8456, name: "Jakarta, Indonesia", description: "Jakarta urban scene" },
    { lat: 3.1390, lng: 101.6869, name: "Kuala Lumpur, Malaysia", description: "Kuala Lumpur streets" },
    { lat: 18.7883, lng: 98.9853, name: "Chiang Mai, Thailand", description: "Chiang Mai old town" },
    { lat: 37.7749, lng: -122.4194, name: "San Francisco, USA", description: "San Francisco streets" },
    { lat: 40.7128, lng: -74.0060, name: "New York, USA", description: "New York City" },
    { lat: 51.5074, lng: -0.1278, name: "London, UK", description: "London street scene" },
    { lat: 48.8566, lng: 2.3522, name: "Paris, France", description: "Paris urban landscape" },
    { lat: 52.5200, lng: 13.4050, name: "Berlin, Germany", description: "Berlin street view" },
    { lat: 41.9028, lng: 12.4964, name: "Rome, Italy", description: "Rome historic streets" },
    { lat: 40.4168, lng: -3.7038, name: "Madrid, Spain", description: "Madrid city center" },
    { lat: 59.3293, lng: 18.0686, name: "Stockholm, Sweden", description: "Stockholm streets" },
    { lat: 55.7558, lng: 37.6173, name: "Moscow, Russia", description: "Moscow urban scene" },
    { lat: -33.8688, lng: 151.2093, name: "Sydney, Australia", description: "Sydney street view" }
];

// Google Street View API Key - 記得設定 HTTP Referrer 限制！
// 限制到你的網域：https://unacai0316.github.io/*
const GOOGLE_STREET_VIEW_API_KEY = 'AIzaSyBsCQ7GYN2nUofnKdDonPHFHOWkBSwMQJg';

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
    
    loadRandomStreetView();
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
    
    // Draw location info
    if (currentLocation) {
        drawLocationInfo();
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

// === Street View Functions ===
async function loadRandomStreetView() {
    // 生成完全隨機的位置
    currentLocation = generateRandomLocation();
    
    if (GOOGLE_STREET_VIEW_API_KEY !== 'YOUR_API_KEY_HERE') {
        // 嘗試載入真實的街景圖片
        await tryLoadStreetView(currentLocation);
    } else {
        // 使用備用圖片
        loadFallbackStreetView();
    }
}

async function tryLoadStreetView(location, attempts = 0) {
    const maxAttempts = 3;
    
    // 生成隨機的視角參數
    const heading = Math.floor(Math.random() * 360);
    const pitch = Math.floor(Math.random() * 30 - 15); // -15 到 15 度
    const fov = 90 + Math.floor(Math.random() * 30); // 90 到 120 度
    
    let streetViewUrl = `https://maps.googleapis.com/maps/api/streetview?` +
        `size=1200x800&` +
        `location=${location.lat},${location.lng}&` +
        `heading=${heading}&` +
        `pitch=${pitch}&` +
        `fov=${fov}&` +
        `key=${GOOGLE_STREET_VIEW_API_KEY}`;
    
    try {
        // 先檢查這個位置是否有街景資料
        const metadataUrl = `https://maps.googleapis.com/maps/api/streetview/metadata?` +
            `location=${location.lat},${location.lng}&` +
            `key=${GOOGLE_STREET_VIEW_API_KEY}`;
        
        const metadataResponse = await fetch(metadataUrl);
        const metadata = await metadataResponse.json();
        
        if (metadata.status === 'OK') {
            // 有街景資料，載入圖片
            loadImage(streetViewUrl,
                async (img) => {
                    bgImage = img;
                    bgImage.filter(GRAY);
                    
                    // 嘗試獲取位置名稱
                    currentLocation.name = await getLocationName(location.lat, location.lng);
                    console.log(`🌍 Loaded random street view: ${currentLocation.name}`);
                },
                (error) => {
                    console.log('❌ Street view image loading failed');
                    retryOrFallback(attempts);
                }
            );
        } else {
            // 沒有街景資料，重新生成位置
            console.log(`⚠️ No street view at ${location.lat}, ${location.lng}, trying new location...`);
            retryOrFallback(attempts);
        }
    } catch (error) {
        console.log('❌ Street view API error:', error);
        retryOrFallback(attempts);
    }
}

function retryOrFallback(attempts) {
    const maxAttempts = 3;
    
    if (attempts < maxAttempts) {
        // 重新生成位置並重試
        console.log(`🔄 Generating new random location (attempt ${attempts + 1}/${maxAttempts})`);
        currentLocation = generateRandomLocation();
        setTimeout(() => tryLoadStreetView(currentLocation, attempts + 1), 500);
    } else {
        // 達到最大重試次數，使用備用圖片
        console.log('🏳️ Max attempts reached, using fallback images');
        loadFallbackStreetView();
    }
}

function loadFallbackStreetView() {
    // 更廣泛的街景關鍵字，對應隨機位置
    let streetKeywords = [
        'street+view+random+city',
        'urban+street+photography',
        'random+street+scene',
        'city+street+view+world',
        'street+photography+urban',
        'random+city+streets',
        'urban+landscape+street',
        'street+scene+worldwide',
        'city+photography+street',
        'random+urban+scene'
    ];
    
    let keyword = streetKeywords[Math.floor(Math.random() * streetKeywords.length)];
    let imageUrl = `https://source.unsplash.com/1200x800/?${keyword}&sig=${Math.random()}`;
    
    loadImage(imageUrl,
        async (img) => {
            bgImage = img;
            bgImage.filter(GRAY);
            
            // 為備用圖片也嘗試獲取位置名稱
            if (currentLocation) {
                currentLocation.name = await getLocationName(currentLocation.lat, currentLocation.lng);
            }
            console.log(`🖼️ Loaded fallback street scene: ${currentLocation?.name || 'Random Location'}`);
        },
        () => {
            bgImage = null;
            console.log('❌ All image loading failed');
        }
    );
}

function drawLocationInfo() {
    if (!currentLocation) return;
    
    push();
    
    // Location info background
    fill(0, 0, 0, 180);
    stroke(255, 215, 0, 200);
    strokeWeight(2);
    rect(20, 20, 320, 90, 10);
    
    // Location name
    fill(255, 215, 0);
    textAlign(LEFT, TOP);
    textSize(16);
    textFont('Arial');
    text(currentLocation.name || 'Loading location...', 35, 35);
    
    // Description/Region
    fill(255, 255, 255, 200);
    textSize(12);
    text(currentLocation.description || `Random location in ${currentLocation.region}`, 35, 55);
    
    // Coordinates
    fill(255, 255, 255, 150);
    textSize(10);
    text(`${currentLocation.lat.toFixed(4)}, ${currentLocation.lng.toFixed(4)}`, 35, 75);
    
    // Random indicator
    fill(100, 255, 100, 150);
    textSize(9);
    text('🎲 Randomly generated location', 35, 90);
    
    pop();
}

// === Background Functions ===
function drawFallbackBackground() {
    // Create a more interesting street-like fallback
    push();
    
    // Sky gradient
    for (let i = 0; i <= height * 0.6; i++) {
        let alpha = map(i, 0, height * 0.6, 180, 120);
        stroke(alpha, alpha, alpha + 10);
        line(0, i, width, i);
    }
    
    // Ground
    fill(80, 80, 90);
    noStroke();
    rect(0, height * 0.6, width, height * 0.4);
    
    // Simple building silhouettes
    fill(60, 65, 75);
    for (let i = 0; i < 8; i++) {
        let x = i * (width / 8);
        let h = 100 + Math.sin(i * 0.5) * 80;
        rect(x, height * 0.6 - h, width / 8, h);
    }
    
    pop();
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
    loadRandomStreetView();
    console.log('🎲 Loading new random street view...');
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

function hideApiInfo() {
    const apiInfo = document.getElementById('api-info');
    if (apiInfo) {
        apiInfo.style.display = 'none';
    }
}