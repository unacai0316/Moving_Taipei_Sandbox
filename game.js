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

// Google Street View API Key - 記得設定 HTTP Referrer 限制！
const GOOGLE_STREET_VIEW_API_KEY = 'AIzaSyBsCQ7GYN2nUofnKdDonPHFHOWkBSwMQJg';

// === Asset Configuration ===
const assetConfig = {
    vendor: {
        count: 6,
        angles: ['L', 'front', 'R'],
        path: 'assets/vendor/'
    },
    balcony: {
        count: 2,
        angles: ['L', 'front', 'R'],
        path: 'assets/balcony/'
    },
    rain: {
        count: 2,
        angles: ['L', 'front', 'R'],
        path: 'assets/rain/'
    },
    scooter: {
        count: 3,
        angles: ['L', 'front', 'R'],
        path: 'assets/scooter/'
    }
}

// === Object Controls ===
function changeAngle(obj) {
    if (!obj.hasAsset) return;
    
    obj.angleIndex = (obj.angleIndex + 1) % 3;
    let config = assetConfig[obj.type];
    let angleName = config.angles[obj.angleIndex];
    
    if (assetImages[obj.type][obj.styleNum] && assetImages[obj.type][obj.styleNum][angleName]) {
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
    };
}
// === Random Location Generator ===
function generateRandomLocation() {
    // 定義更有可能有街景覆蓋的城市區域
    const cityAreas = [
        // 亞洲主要城市
        { lat: [25.0, 25.1], lng: [121.5, 121.6], region: "East Asia", place: "Taipei" },
        { lat: [35.6, 35.7], lng: [139.6, 139.8], region: "East Asia", place: "Tokyo" },
        { lat: [37.5, 37.6], lng: [126.9, 127.1], region: "East Asia", place: "Seoul" },
        { lat: [22.3, 22.4], lng: [114.1, 114.2], region: "East Asia", place: "Hong Kong" },
        { lat: [1.3, 1.4], lng: [103.8, 103.9], region: "Southeast Asia", place: "Singapore" },
        { lat: [13.7, 13.8], lng: [100.5, 100.6], region: "Southeast Asia", place: "Bangkok" },
        
        // 歐洲主要城市
        { lat: [48.8, 48.9], lng: [2.3, 2.4], region: "Europe", place: "Paris" },
        { lat: [51.5, 51.6], lng: [-0.2, -0.1], region: "Europe", place: "London" },
        { lat: [52.5, 52.6], lng: [13.3, 13.5], region: "Europe", place: "Berlin" },
        { lat: [41.9, 42.0], lng: [12.4, 12.5], region: "Europe", place: "Rome" },
        { lat: [40.4, 40.5], lng: [-3.8, -3.6], region: "Europe", place: "Madrid" },
        
        // 北美主要城市
        { lat: [40.7, 40.8], lng: [-74.1, -74.0], region: "North America", place: "New York" },
        { lat: [37.7, 37.8], lng: [-122.5, -122.4], region: "North America", place: "San Francisco" },
        { lat: [34.0, 34.1], lng: [-118.3, -118.2], region: "North America", place: "Los Angeles" },
        { lat: [43.6, 43.7], lng: [-79.4, -79.3], region: "North America", place: "Toronto" },
        
        // 其他地區主要城市
        { lat: [-33.9, -33.8], lng: [151.1, 151.3], region: "Australia", place: "Sydney" },
        { lat: [-23.6, -23.5], lng: [-46.7, -46.6], region: "South America", place: "São Paulo" },
        { lat: [-34.6, -34.5], lng: [-58.4, -58.3], region: "South America", place: "Buenos Aires" }
    ];
    
    // 70% 的機率選擇城市區域，30% 的機率完全隨機
    if (Math.random() < 0.7) {
        const area = cityAreas[Math.floor(Math.random() * cityAreas.length)];
        const lat = Math.random() * (area.lat[1] - area.lat[0]) + area.lat[0];
        const lng = Math.random() * (area.lng[1] - area.lng[0]) + area.lng[0];
        
        return {
            lat: parseFloat(lat.toFixed(6)),
            lng: parseFloat(lng.toFixed(6)),
            region: area.region,
            suggestedPlace: area.place,
            description: `Near ${area.place}`
        };
    } else {
        // 完全隨機的位置（保留原有邏輯）
        const regions = [
            {
                name: "East Asia",
                latRange: [20, 50],
                lngRange: [100, 150],
                places: ["Taiwan", "Japan", "South Korea", "China"]
            },
            {
                name: "Southeast Asia", 
                latRange: [-10, 25],
                lngRange: [95, 140],
                places: ["Thailand", "Vietnam", "Malaysia", "Singapore", "Indonesia"]
            },
            {
                name: "Europe",
                latRange: [35, 70],
                lngRange: [-10, 40],
                places: ["France", "Germany", "Italy", "Spain", "UK", "Netherlands"]
            },
            {
                name: "North America",
                latRange: [25, 65],
                lngRange: [-130, -60],
                places: ["USA", "Canada", "Mexico"]
            }
        ];
        
        const region = regions[Math.floor(Math.random() * regions.length)];
        const lat = Math.random() * (region.latRange[1] - region.latRange[0]) + region.latRange[0];
        const lng = Math.random() * (region.lngRange[1] - region.lngRange[0]) + region.lngRange[0];
        const place = region.places[Math.floor(Math.random() * region.places.length)];
        
        return {
            lat: parseFloat(lat.toFixed(6)),
            lng: parseFloat(lng.toFixed(6)),
            region: region.name,
            suggestedPlace: place,
            description: `Random location in ${region.name}`
        };
    }
}

// === Geocoding Function ===
function getLocationName(lat, lng) {
    // 如果沒有 API Key 或 API Key 是預設值，就回傳座標
    if (!GOOGLE_STREET_VIEW_API_KEY || GOOGLE_STREET_VIEW_API_KEY === 'YOUR_API_KEY_HERE') {
        return Promise.resolve(`${lat.toFixed(4)}, ${lng.toFixed(4)}`);
    }
    
    return new Promise((resolve) => {
        const geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${GOOGLE_STREET_VIEW_API_KEY}`;
        
        fetch(geocodeUrl)
            .then(response => response.json())
            .then(data => {
                if (data.status === 'OK' && data.results.length > 0) {
                    const result = data.results[0];
                    
                    // 試著找到城市和國家
                    let city = '';
                    let country = '';
                    
                    for (let component of result.address_components) {
                        if (component.types.includes('locality') || component.types.includes('administrative_area_level_1')) {
                            city = component.long_name;
                        }
                        if (component.types.includes('country')) {
                            country = component.long_name;
                        }
                    }
                    
                    if (city && country) {
                        resolve(`${city}, ${country}`);
                    } else if (city) {
                        resolve(city);
                    } else if (country) {
                        resolve(country);
                    } else {
                        resolve(result.formatted_address || `${lat.toFixed(4)}, ${lng.toFixed(4)}`);
                    }
                } else {
                    // Geocoding 失敗，回傳座標
                    resolve(`${lat.toFixed(4)}, ${lng.toFixed(4)}`);
                }
            })
            .catch(error => {
                console.log('Geocoding failed:', error);
                resolve(`${lat.toFixed(4)}, ${lng.toFixed(4)}`);
            });
    });
}

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
    
    // 載入隨機街景
    loadRandomStreetView();
    console.log('🎮 Taipei Sandbox activated with full Street View support!');
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
        // 如果沒有背景圖片，只畫一個簡單的漸層
        drawSimpleBackground();
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
    
    // Draw selection indicators and floating controls
    if (selectedObject && !dragging && !rotating) {
        drawSelectionIndicator();
        drawFloatingControls();
    }
    
    // Draw help panel
    drawHelpPanel();
    
    // Draw no imagery hint if needed
    if (!bgImage) {
        drawNoImageryHint();
    }
}

// === Simple Background for Loading State ===
function drawSimpleBackground() {
    push();
    
    // 簡單的漸層背景，不會干擾提示信息
    for (let i = 0; i <= height; i++) {
        let alpha = map(i, 0, height, 200, 160);
        stroke(alpha, alpha, alpha + 10);
        line(0, i, width, i);
    }
    
    pop();
}

// === Street View Functions ===
function loadRandomStreetView() {
    // 在開始載入前先清空背景，這樣可以顯示提示
    bgImage = null;
    
    // 生成完全隨機的位置
    currentLocation = generateRandomLocation();
    console.log(`🌍 Generated location: ${currentLocation.lat}, ${currentLocation.lng} in ${currentLocation.region}`);
    
    // 嘗試使用真實的 Google Street View
    if (GOOGLE_STREET_VIEW_API_KEY && GOOGLE_STREET_VIEW_API_KEY !== 'YOUR_API_KEY_HERE') {
        console.log('🌍 Attempting to load real street view...');
        tryLoadStreetView(currentLocation);
    } else {
        console.log('🔄 Using fallback street view images');
        loadFallbackStreetView();
    }
}

function tryLoadStreetView(location, attempts = 0) {
    const maxAttempts = 5; // 增加重試次數
    
    // 生成隨機的視角參數
    const heading = Math.floor(Math.random() * 360);
    const pitch = Math.floor(Math.random() * 20 - 10); // -10 到 10 度
    const fov = 90 + Math.floor(Math.random() * 20); // 90 到 110 度
    
    let streetViewUrl = `https://maps.googleapis.com/maps/api/streetview?` +
        `size=1200x800&` +
        `location=${location.lat},${location.lng}&` +
        `heading=${heading}&` +
        `pitch=${pitch}&` +
        `fov=${fov}&` +
        `key=${GOOGLE_STREET_VIEW_API_KEY}`;
    
    console.log(`🔍 Trying street view at ${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}`);
    
    // 創建一個 img 元素來檢查圖片
    let testImg = new Image();
    testImg.crossOrigin = "anonymous";
    
    testImg.onload = function() {
        // 檢查圖片大小 - Google返回的 "no imagery" 圖片通常很小
        if (this.width < 200 || this.height < 150) {
            console.log('⚠️ Received "no imagery" response, trying new location...');
            bgImage = null; // 確保設為 null
            retryOrFallback(attempts);
            return;
        }
        
        // 圖片看起來是有效的，載入到 p5
        loadImage(streetViewUrl,
            (img) => {
                bgImage = img;
                bgImage.filter(GRAY);
                
                // 嘗試獲取地點名稱
                getLocationName(location.lat, location.lng).then(name => {
                    currentLocation.name = name;
                    console.log(`🌍 Loaded real street view: ${currentLocation.name}`);
                });
            },
            (error) => {
                console.log('❌ P5 image loading failed, trying new location...');
                bgImage = null; // 確保設為 null
                retryOrFallback(attempts);
            }
        );
    };
    
    testImg.onerror = function() {
        console.log('❌ Street view loading failed, trying new location...');
        bgImage = null; // 確保設為 null
        retryOrFallback(attempts);
    };
    
    testImg.src = streetViewUrl;
}

function retryOrFallback(attempts) {
    const maxAttempts = 5; // 配合更新的重試次數
    
    if (attempts < maxAttempts) {
        // 重新生成位置並重試
        console.log(`🔄 Generating new random location (attempt ${attempts + 1}/${maxAttempts})`);
        currentLocation = generateRandomLocation();
        bgImage = null; // 在重試期間設為 null 以顯示提示
        setTimeout(() => tryLoadStreetView(currentLocation, attempts + 1), 800);
    } else {
        // 達到最大重試次數，使用備用圖片
        console.log('🏳️ Max attempts reached, using fallback images');
        bgImage = null; // 確保設為 null
        loadFallbackStreetView();
    }
}

function loadFallbackStreetView() {
    // 確保有位置信息
    if (!currentLocation) {
        currentLocation = generateRandomLocation();
    }
    
    // 設定位置名稱
    currentLocation.name = `Random location in ${currentLocation.region}`;
    
    // 更廣泛的街景關鍵字
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
    
    console.log(`🖼️ Loading fallback image: ${keyword}`);
    
    loadImage(imageUrl,
        (img) => {
            bgImage = img;
            bgImage.filter(GRAY);
            console.log(`🖼️ Loaded fallback street scene: ${currentLocation.name}`);
        },
        () => {
            bgImage = null; // 確保設為 null 以顯示提示
            console.log('❌ Fallback image loading failed, showing no imagery hint');
        }
    );
}

function drawLocationInfo() {
    if (!currentLocation) return;
    
    push();
    
    // 多層毛玻璃效果背景
    for(let i = 0; i < 5; i++) {
        fill(255, 255, 255, 25 + i * 8); // 漸層不透明度
        noStroke();
        rect(25, 25, 300 - i, 70 - i, 15 - i/2);
    }
    
    // 主要背景框
    fill(255, 255, 255, 180); // 增加不透明度
    stroke(255, 255, 255, 100);
    strokeWeight(1);
    rect(25, 25, 300, 70, 15);
    
    // 主要位置名稱 - 深灰色
    fill(60, 60, 60, 255); // 深灰色文字
    textAlign(LEFT, TOP);
    textSize(14);
    textStyle(BOLD);
    let displayName = currentLocation.name || 'Loading location...';
    text(displayName, 40, 40);
    
    // 地區信息 - 根據是否為用戶上傳調整顯示
    fill(80, 80, 80, 200);
    textSize(11);
    textStyle(NORMAL);
    if (currentLocation.isUserUpload) {
        text(`📸 ${currentLocation.description}`, 40, 58);
    } else {
        text(`📍 ${currentLocation.region || 'Unknown region'}`, 40, 58);
    }
    
    // 右上角的坐標信息 - 只有非用戶上傳圖片才顯示坐標
    if (!currentLocation.isUserUpload) {
        fill(100, 100, 100, 180);
        textAlign(RIGHT, TOP);
        textSize(9);
        text(`${currentLocation.lat.toFixed(3)}, ${currentLocation.lng.toFixed(3)}`, 315, 42);
    }
    
    // 左下角的指示器 - 根據圖片來源調整
    if (currentLocation.isUserUpload) {
        fill(255, 140, 0, 200); // 橙色表示用戶上傳
        textAlign(LEFT, BOTTOM);
        textSize(8);
        text('📷 Your Photo', 40, 85);
    } else {
        fill(0, 150, 0, 200); // 深綠色表示隨機生成
        textAlign(LEFT, BOTTOM);
        textSize(8);
        text('🎲 Random', 40, 85);
    }
    
    pop();
}

// === Floating Controls ===
function drawFloatingControls() {
    if (!selectedObject) return;
    
    let obj = selectedObject;
    let spacing = 50;
    let controlY = obj.y - 100;
    let startX = obj.x - spacing;
    
    // Constrain to screen
    controlY = constrain(controlY, 50, height - 50);
    startX = constrain(startX, spacing * 2, width - spacing * 3);
    
    // Angle control (if has asset)
    if (obj.hasAsset) {
        drawFloatingButton(startX - spacing, controlY, '↻', 'Change Angle');
        startX += spacing;
    }
    
    // Flip control
    drawFloatingButton(startX, controlY, '⟷', 'Flip Horizontal');
    
    // Layer control
    drawFloatingButton(startX + spacing, controlY, '↑', 'Move to Front');
}

function drawFloatingButton(x, y, icon, tooltip) {
    push();
    
    // Button background
    fill(255, 255, 255, 240);
    stroke(100, 100, 100, 150);
    strokeWeight(1);
    ellipse(x, y, 36);
    
    // Hover effect
    let d = dist(mouseX, mouseY, x, y);
    if (d < 18) {
        stroke(255, 215, 0, 200);
        strokeWeight(2);
        fill(255, 255, 255, 255);
        ellipse(x, y, 40);
    }
    
    // Icon
    fill(50, 50, 50);
    textAlign(CENTER, CENTER);
    textSize(16);
    textStyle(BOLD);
    text(icon, x, y - 1);
    
    pop();
}

// === Help Panel ===
function drawHelpPanel() {
    push();
    
    // 多層毛玻璃效果背景
    for(let i = 0; i < 5; i++) {
        fill(255, 255, 255, 20 + i * 10); // 漸層不透明度
        noStroke();
        rect(width - 280, 25, 250 - i, 140 - i, 12 - i/2); // 增加高度
    }
    
    // 主要背景框
    fill(255, 255, 255, 180); // 增加不透明度
    stroke(255, 255, 255, 100);
    strokeWeight(1);
    rect(width - 280, 25, 250, 140, 12); // 增加高度
    
    // Title - 深灰色
    fill(60, 60, 60, 255);
    textAlign(LEFT, TOP);
    textSize(13);
    textStyle(BOLD);
    text('🎮 Controls', width - 270, 40);
    
    // Instructions - 深灰色
    fill(80, 80, 80, 200);
    textSize(10);
    textStyle(NORMAL);
    let instructions = [
        '• Click object to select',
        '• Drag to move, Shift+drag to rotate', 
        '• Mouse wheel to scale',
        '• F key to flip, R key to rotate 15°',
        '• Delete key to remove object',
        '• Use floating buttons for more options',
        '• Upload your own photos as background'
    ];
    
    for (let i = 0; i < instructions.length; i++) {
        text(instructions[i], width - 270, 58 + i * 12);
    }
    
    pop();
}

// === No Imagery Hint ===
function drawNoImageryHint() {
    push();
    
    // 多層毛玻璃效果背景
    for(let i = 0; i < 5; i++) {
        fill(255, 255, 255, 30 + i * 15); // 漸層不透明度
        noStroke();
        rect(width/2 - 200, height/2 - 40, 400 - i*2, 80 - i, 15 - i/2);
    }
    
    // 主要背景框
    fill(255, 255, 255, 200); // 高不透明度
    stroke(255, 100, 100, 150);
    strokeWeight(2);
    rect(width/2 - 200, height/2 - 40, 400, 80, 15);
    
    // 主要提示文字 - 深灰色
    fill(60, 60, 60, 255);
    textAlign(CENTER, CENTER);
    textSize(16);
    textStyle(BOLD);
    text('📍 No street view available for this location', width/2, height/2 - 10);
    
    // 副標題 - 較淡的深灰色
    textSize(12);
    textStyle(NORMAL);
    fill(80, 80, 80, 200);
    text('Click "Randomize the City" to try a different location!', width/2, height/2 + 12);
    
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
    scale(obj.scale * (obj.flipped ? -1 : 1), obj.scale); // 支援水平翻轉
    
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
        angleIndex: 1, // 從 1 開始 (front)
        flipped: false, // 支援水平翻轉
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
    // Check floating controls first
    if (selectedObject && !dragging) {
        let obj = selectedObject;
        let spacing = 50;
        let controlY = constrain(obj.y - 100, 50, height - 50);
        let startX = constrain(obj.x - spacing, spacing * 2, width - spacing * 3);
        
        // Check angle button (if has asset)
        if (obj.hasAsset) {
            if (dist(mouseX, mouseY, startX - spacing, controlY) < 18) {
                changeAngle(obj);
                return;
            }
            startX += spacing;
        }
        
        // Check flip button
        if (dist(mouseX, mouseY, startX, controlY) < 18) {
            flipObject(obj);
            return;
        }
        
        // Check layer button
        if (dist(mouseX, mouseY, startX + spacing, controlY) < 18) {
            changeLayer(obj);
            return;
        }
    }
    
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
            console.log(`🔄 Rotated 15° - total: ${selectedObject.rotation}°`);
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

function triggerImageUpload() {
    document.getElementById('imageUpload').click();
    console.log('📁 Opening file dialog...');
}

function handleImageUpload(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    // 檢查是否為圖片文件
    if (!file.type.startsWith('image/')) {
        alert('請選擇一個有效的圖片文件！');
        return;
    }
    
    console.log(`📷 Loading user image: ${file.name}`);
    
    // 創建 FileReader 來讀取文件
    const reader = new FileReader();
    reader.onload = function(e) {
        // 使用 p5.js 載入圖片
        loadImage(e.target.result, 
            (img) => {
                bgImage = img;
                bgImage.filter(GRAY); // 應用灰階濾鏡
                
                // 設定用戶上傳圖片的位置信息
                currentLocation = {
                    name: file.name.replace(/\.[^/.]+$/, ""), // 移除副檔名
                    region: "User Upload",
                    description: "Your personal photo",
                    lat: 0,
                    lng: 0,
                    isUserUpload: true
                };
                
                console.log(`✅ User image loaded: ${file.name}`);
            },
            (error) => {
                console.error('❌ Failed to load user image:', error);
                alert('載入圖片失敗，請嘗試其他圖片！');
            }
        );
    };
    
    reader.onerror = function() {
        console.error('❌ FileReader error');
        alert('讀取圖片文件失敗！');
    };
    
    reader.readAsDataURL(file);
    
    // 清空 input 值，這樣用戶可以重複上傳同一個文件
    event.target.value = '';
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