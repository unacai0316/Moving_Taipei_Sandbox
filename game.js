// 超簡單台北拼貼遊戲

let objects = [];
let currentTool = null;
let following = null;
let selectedObject = null;
let dragging = false;
let bgImage = null;

// 每個類別的變化
const objectVariations = {
    vendor: [
        { shape: 'rect', size: [60, 40], color: '#f4d35e' },
        { shape: 'roundRect', size: [55, 45], color: '#ee964b' },
        { shape: 'hexagon', size: [50, 50], color: '#f95738' },
        { shape: 'compound1', size: [65, 35], color: '#33658a' },
        { shape: 'compound2', size: [70, 30], color: '#2f4858' }
    ],
    scooter: [
        { shape: 'ellipse', size: [60, 30], color: '#ee964b' },
        { shape: 'rounded', size: [55, 25], color: '#f4d35e' },
        { shape: 'long', size: [70, 20], color: '#33658a' },
        { shape: 'wide', size: [50, 35], color: '#2f4858' },
        { shape: 'sport', size: [65, 28], color: '#f95738' }
    ],
    rain: [
        { shape: 'triangle', size: [60, 45], color: '#2f4858' },
        { shape: 'arc', size: [70, 40], color: '#33658a' },
        { shape: 'wave', size: [65, 35], color: '#4a90e2' },
        { shape: 'multi', size: [75, 50], color: '#1a2a3a' },
        { shape: 'curved', size: [55, 38], color: '#5a6a7a' }
    ],
    balcony: [
        { shape: 'rect', size: [50, 30], color: '#33658a' },
        { shape: 'extended', size: [60, 25], color: '#2f4858' },
        { shape: 'windowed', size: [55, 35], color: '#f4d35e' },
        { shape: 'modern', size: [65, 28], color: '#ee964b' },
        { shape: 'classic', size: [45, 32], color: '#4a90e2' }
    ]
};

// 街景位置
const taipeiLocations = [
    { lat: 25.0330, lng: 121.5654 },
    { lat: 25.0417, lng: 121.5431 },
    { lat: 25.0478, lng: 121.5170 },
    { lat: 25.0320, lng: 121.5439 },
    { lat: 25.0335, lng: 121.5650 }
];

function setup() {
    createCanvas(windowWidth, windowHeight);
    console.log('遊戲啟動！');
    loadRandomBackground();
    updateStatus('點擊工具開始創作！');
}

function draw() {
    background(30);
    
    // 畫背景圖片
    if (bgImage) {
        let frameX = width * 0.1;
        let frameY = height * 0.15;
        let frameW = width * 0.8;
        let frameH = height * 0.7;
        image(bgImage, frameX, frameY, frameW, frameH);
    } else {
        drawBackground();
    }
    
    // 畫所有物件
    for (let i = 0; i < objects.length; i++) {
        drawObject(objects[i], i);
    }
    
    // 畫跟隨物件
    if (following) {
        drawFollowing();
    }
    
    // 畫框架
    drawFrame();
    
    // 畫物件控制按鈕
    if (selectedObject && !dragging) {
        drawObjectControls();
    }
}

function loadRandomBackground() {
    // 使用 Unsplash 隨機街景圖片
    let keywords = ['taipei+street', 'asian+street', 'urban+street', 'city+street', 'taiwan+street'];
    let keyword = keywords[Math.floor(Math.random() * keywords.length)];
    let imageUrl = `https://source.unsplash.com/1200x800/?${keyword}&sig=${Math.random()}`;
    
    loadImage(imageUrl, 
        (img) => {
            bgImage = img;
            bgImage.filter(GRAY);
            console.log('背景載入成功');
        },
        () => {
            console.log('背景載入失敗，使用預設背景');
            bgImage = null;
        }
    );
}

function drawBackground() {
    // 預設背景
    fill(80);
    noStroke();
    rect(width * 0.1, height * 0.15, width * 0.8, height * 0.7);
    
    // 建築
    fill(60);
    for (let i = 0; i < 4; i++) {
        let x = width * 0.1 + i * (width * 0.2);
        let h = 50 + i * 30;
        rect(x, height * 0.4, width * 0.2, h);
    }
    
    // 街道
    fill(40);
    rect(width * 0.1, height * 0.7, width * 0.8, height * 0.15);
}

function drawFrame() {
    stroke(255, 215, 0);
    strokeWeight(3);
    noFill();
    rect(width * 0.1, height * 0.15, width * 0.8, height * 0.7);
}

function drawObject(obj, index) {
    push();
    translate(obj.x, obj.y);
    rotate(radians(obj.angle + obj.rotation));
    scale(obj.scale);
    
    // 選中高亮
    if (selectedObject === obj) {
        stroke(255, 255, 0);
        strokeWeight(4);
        noFill();
        ellipse(0, 0, 80);
    }
    
    fill(obj.color);
    stroke(255);
    strokeWeight(2);
    
    drawObjectShape(obj);
    pop();
}

function drawObjectShape(obj) {
    let variation = obj.variation;
    let [w, h] = variation.size;
    
    switch (obj.type) {
        case 'vendor':
            switch (variation.shape) {
                case 'rect':
                    rect(-w/2, -h/2, w, h);
                    break;
                case 'roundRect':
                    rect(-w/2, -h/2, w, h, 10);
                    break;
                case 'hexagon':
                    drawHexagon(w/2);
                    break;
                case 'compound1':
                    rect(-w/2, -h/2, w, h);
                    rect(-w/3, -h/3, w/3, h/3);
                    break;
                case 'compound2':
                    rect(-w/2, -h/2, w, h);
                    triangle(-w/2, -h/2, 0, -h, w/2, -h/2);
                    break;
            }
            break;
            
        case 'scooter':
            switch (variation.shape) {
                case 'ellipse':
                    ellipse(0, 0, w, h);
                    break;
                case 'rounded':
                    rect(-w/2, -h/2, w, h, h/2);
                    break;
                case 'long':
                    ellipse(0, 0, w, h);
                    ellipse(-w/4, 0, w/3, h/2);
                    break;
                case 'wide':
                    ellipse(0, 0, w, h);
                    rect(-w/3, -h/4, w/2, h/2);
                    break;
                case 'sport':
                    ellipse(0, 0, w, h);
                    triangle(-w/3, 0, 0, -h/2, w/3, 0);
                    break;
            }
            break;
            
        case 'rain':
            switch (variation.shape) {
                case 'triangle':
                    triangle(-w/2, h/2, 0, -h/2, w/2, h/2);
                    break;
                case 'arc':
                    arc(0, 0, w, h, PI, TWO_PI);
                    break;
                case 'wave':
                    drawWave(w, h);
                    break;
                case 'multi':
                    triangle(-w/3, h/2, -w/6, -h/2, 0, h/2);
                    triangle(0, h/2, w/6, -h/2, w/3, h/2);
                    break;
                case 'curved':
                    arc(0, 0, w, h, PI * 0.8, PI * 1.2);
                    break;
            }
            break;
            
        case 'balcony':
            switch (variation.shape) {
                case 'rect':
                    rect(-w/2, -h/2, w, h);
                    break;
                case 'extended':
                    rect(-w/2, -h/2, w, h);
                    rect(w/3, -h/4, w/4, h/2);
                    break;
                case 'windowed':
                    rect(-w/2, -h/2, w, h);
                    fill(100);
                    rect(-w/3, -h/3, w/4, h/3);
                    rect(w/6, -h/3, w/4, h/3);
                    break;
                case 'modern':
                    rect(-w/2, -h/2, w, h);
                    line(-w/2, 0, w/2, 0);
                    break;
                case 'classic':
                    rect(-w/2, -h/2, w, h);
                    for (let i = -w/3; i < w/3; i += w/8) {
                        line(i, -h/2, i, -h/4);
                    }
                    break;
            }
            break;
    }
}

function drawHexagon(radius) {
    beginShape();
    for (let i = 0; i < 6; i++) {
        let angle = TWO_PI / 6 * i;
        let x = cos(angle) * radius;
        let y = sin(angle) * radius;
        vertex(x, y);
    }
    endShape(CLOSE);
}

function drawWave(w, h) {
    beginShape();
    for (let x = -w/2; x <= w/2; x += 5) {
        let y = sin(x * 0.1) * h/4 - h/4;
        vertex(x, y);
    }
    vertex(w/2, h/2);
    vertex(-w/2, h/2);
    endShape(CLOSE);
}

function drawFollowing() {
    push();
    translate(mouseX, mouseY);
    
    fill(255, 255, 0, 150);
    stroke(255);
    strokeWeight(3);
    
    // 隨機選擇變化
    let variations = objectVariations[following];
    let variation = variations[0]; // 預覽第一種
    let [w, h] = variation.size;
    
    switch (following) {
        case 'vendor':
            rect(-w/2, -h/2, w, h);
            break;
        case 'scooter':
            ellipse(0, 0, w, h);
            break;
        case 'rain':
            triangle(-w/2, h/2, 0, -h/2, w/2, h/2);
            break;
        case 'balcony':
            rect(-w/2, -h/2, w, h);
            break;
    }
    pop();
}

function drawObjectControls() {
    let obj = selectedObject;
    let controlX = obj.x + 40;
    let controlY = obj.y - 60;
    
    // 背景
    fill(0, 0, 0, 200);
    stroke(255, 215, 0);
    strokeWeight(2);
    rect(controlX, controlY, 120, 80, 5);
    
    // 按鈕
    fill(255, 215, 0);
    noStroke();
    
    // 角度按鈕
    rect(controlX + 5, controlY + 5, 30, 20, 3);
    fill(0);
    textAlign(CENTER, CENTER);
    textSize(10);
    text('Angle', controlX + 20, controlY + 15);
    
    // 旋轉按鈕
    fill(255, 215, 0);
    rect(controlX + 40, controlY + 5, 30, 20, 3);
    fill(0);
    text('Rotate', controlX + 55, controlY + 15);
    
    // 縮放按鈕
    fill(255, 215, 0);
    rect(controlX + 75, controlY + 5, 35, 20, 3);
    fill(0);
    text('Scale', controlX + 92, controlY + 15);
    
    // 顯示當前值
    fill(255);
    textAlign(LEFT, CENTER);
    textSize(8);
    text(`角度: ${obj.angle}°`, controlX + 5, controlY + 35);
    text(`旋轉: ${Math.round(obj.rotation)}°`, controlX + 5, controlY + 45);
    text(`縮放: ${obj.scale.toFixed(1)}x`, controlX + 5, controlY + 55);
}

function selectTool(tool) {
    console.log('選擇工具:', tool);
    currentTool = tool;
    following = tool;
    selectedObject = null;
    
    // 更新按鈕樣式
    document.querySelectorAll('.btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    
    updateStatus(`選擇了 ${tool}，移動鼠標並點擊放置！`);
}

function mousePressed() {
    // 檢查是否點擊控制按鈕
    if (selectedObject && !dragging) {
        let obj = selectedObject;
        let controlX = obj.x + 40;
        let controlY = obj.y - 60;
        
        // 角度按鈕
        if (mouseX >= controlX + 5 && mouseX <= controlX + 35 && 
            mouseY >= controlY + 5 && mouseY <= controlY + 25) {
            changeAngle(obj);
            return;
        }
        
        // 旋轉按鈕
        if (mouseX >= controlX + 40 && mouseX <= controlX + 70 && 
            mouseY >= controlY + 5 && mouseY <= controlY + 25) {
            rotateObject(obj);
            return;
        }
        
        // 縮放按鈕
        if (mouseX >= controlX + 75 && mouseX <= controlX + 110 && 
            mouseY >= controlY + 5 && mouseY <= controlY + 25) {
            scaleObject(obj);
            return;
        }
    }
    
    if (following) {
        // 放置物件 - 隨機選擇變化
        let variations = objectVariations[following];
        let variation = variations[Math.floor(Math.random() * variations.length)];
        
        objects.push({
            type: following,
            x: mouseX,
            y: mouseY,
            color: variation.color,
            variation: variation,
            angle: 0,        // 預設角度（-45, 0, 45）
            rotation: 0,     // 自由旋轉
            scale: 1,        // 縮放
            angleIndex: 1    // 角度索引 (0:-45°, 1:0°, 2:45°)
        });
        
        following = null;
        currentTool = null;
        selectedObject = null;
        
        // 移除按鈕高亮
        document.querySelectorAll('.btn').forEach(btn => btn.classList.remove('active'));
        
        updateStatus(`物件已放置！目前有 ${objects.length} 個物件`);
        console.log('放置物件，總數:', objects.length);
    } else {
        // 選擇物件
        selectedObject = null;
        for (let i = objects.length - 1; i >= 0; i--) {
            let obj = objects[i];
            let d = dist(mouseX, mouseY, obj.x, obj.y);
            if (d < 40) {
                selectedObject = obj;
                dragging = true;
                updateStatus(`選中了 ${obj.type}`);
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

function changeAngle(obj) {
    obj.angleIndex = (obj.angleIndex + 1) % 3;
    obj.angle = [-45, 0, 45][obj.angleIndex];
    updateStatus(`角度改為: ${obj.angle}°`);
}

function rotateObject(obj) {
    obj.rotation += 15;
    if (obj.rotation >= 360) obj.rotation -= 360;
    updateStatus(`旋轉: ${Math.round(obj.rotation)}°`);
}

function scaleObject(obj) {
    if (obj.scale === 1) obj.scale = 1.5;
    else if (obj.scale === 1.5) obj.scale = 0.7;
    else obj.scale = 1;
    updateStatus(`縮放: ${obj.scale.toFixed(1)}x`);
}

function randomBG() {
    loadRandomBackground();
    updateStatus('載入新背景中...');
}

function clearAll() {
    objects = [];
    following = null;
    currentTool = null;
    selectedObject = null;
    document.querySelectorAll('.btn').forEach(btn => btn.classList.remove('active'));
    updateStatus('已清空！');
    console.log('清空所有物件');
}

function saveImage() {
    saveCanvas('taipei-collage', 'png');
    updateStatus('圖片已保存！');
    console.log('保存圖片');
}

function updateStatus(msg) {
    document.getElementById('status').textContent = msg;
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
}