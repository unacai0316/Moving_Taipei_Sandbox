// Moving Taipei Sandbox - 簡化版本

let placedObjects = [];
let currentTool = null;
let followingObject = null;
let selectedObject = null;
let bgImage = null;
let canvasFrame = { x: 0, y: 0, w: 0, h: 0 };

// 物件顏色
const objectColors = {
  vendor: '#f4d35e',
  scooter: '#ee964b', 
  rain: '#2f4858',
  balcony: '#33658a'
};

function setup() {
  createCanvas(windowWidth, windowHeight);
  console.log('設置完成！');
  
  // 計算畫布框架
  canvasFrame.w = windowWidth * 0.8;
  canvasFrame.h = windowHeight * 0.7;
  canvasFrame.x = (windowWidth - canvasFrame.w) / 2;
  canvasFrame.y = (windowHeight - canvasFrame.h) / 2;
  
  // 創建簡單背景
  createSimpleBackground();
  
  // 設置按鈕
  setupButtons();
  
  document.getElementById('status').textContent = '工具準備好了！點擊工具開始創作！';
}

function createSimpleBackground() {
  bgImage = createGraphics(canvasFrame.w, canvasFrame.h);
  bgImage.background(80);
  
  // 簡單街道
  bgImage.fill(60);
  bgImage.rect(0, bgImage.height * 0.7, bgImage.width, bgImage.height * 0.3);
  
  // 建築物
  bgImage.fill(100);
  for(let i = 0; i < 5; i++) {
    let x = i * (bgImage.width / 5);
    let h = 50 + Math.random() * 100;
    bgImage.rect(x, bgImage.height * 0.3, bgImage.width / 5, h);
  }
  
  console.log('背景創建完成');
}

function setupButtons() {
  // 工具按鈕
  document.querySelectorAll('.tool-btn').forEach(btn => {
    btn.onclick = () => {
      console.log('選擇工具:', btn.dataset.type);
      
      // 清除其他按鈕的 active
      document.querySelectorAll('.tool-btn').forEach(b => b.classList.remove('active'));
      
      currentTool = btn.dataset.type;
      btn.classList.add('active');
      
      // 創建跟隨物件
      createFollowingObject();
      
      document.getElementById('status').textContent = `選擇了 ${currentTool}，移動鼠標並點擊放置！`;
    };
  });
  
  // 動作按鈕
  document.getElementById('randomize-btn').onclick = () => {
    createSimpleBackground();
    document.getElementById('status').textContent = '新背景載入！';
  };
  
  document.getElementById('clear-btn').onclick = () => {
    placedObjects = [];
    selectedObject = null;
    followingObject = null;
    currentTool = null;
    document.querySelectorAll('.tool-btn').forEach(b => b.classList.remove('active'));
    hideControls();
    document.getElementById('status').textContent = '畫布已清空！';
  };
  
  document.getElementById('save-btn').onclick = () => {
    saveCanvas('taipei-collage', 'png');
    document.getElementById('status').textContent = '圖片已保存！';
  };
  
  // 控制按鈕
  document.getElementById('angle-btn').onclick = changeAngle;
  document.getElementById('rotate-btn').onclick = rotateObj;
  document.getElementById('scale-btn').onclick = scaleObj;
}

function createFollowingObject() {
  if (!currentTool) return;
  
  followingObject = {
    type: currentTool,
    x: mouseX,
    y: mouseY,
    rotation: 0,
    scale: 1,
    color: objectColors[currentTool]
  };
  
  console.log('創建跟隨物件:', currentTool);
}

function draw() {
  background(30);
  
  // 畫背景
  if (bgImage) {
    image(bgImage, canvasFrame.x, canvasFrame.y, canvasFrame.w, canvasFrame.h);
  }
  
  // 畫已放置的物件
  for (let obj of placedObjects) {
    drawObject(obj, obj === selectedObject);
  }
  
  // 畫跟隨物件
  if (followingObject) {
    followingObject.x = mouseX;
    followingObject.y = mouseY;
    drawObject(followingObject, false, true);
  }
  
  // 畫框架
  stroke(244, 211, 94);
  strokeWeight(3);
  noFill();
  rect(canvasFrame.x, canvasFrame.y, canvasFrame.w, canvasFrame.h);
}

function drawObject(obj, isSelected = false, isFollowing = false) {
  push();
  translate(obj.x, obj.y);
  rotate(radians(obj.rotation));
  scale(obj.scale);
  
  // 選中高亮
  if (isSelected) {
    stroke(255, 255, 0);
    strokeWeight(4);
    noFill();
    circle(0, 0, 70);
  }
  
  // 跟隨透明度
  if (isFollowing) {
    fill(red(color(obj.color)), green(color(obj.color)), blue(color(obj.color)), 150);
  } else {
    fill(obj.color);
  }
  
  stroke(0);
  strokeWeight(2);
  
  // 簡單形狀
  switch(obj.type) {
    case 'vendor':
      rect(-25, -15, 50, 30); // 矩形攤位
      break;
    case 'scooter':
      ellipse(0, 0, 40, 20); // 橢圓機車
      break;
    case 'rain':
      triangle(-20, 10, 0, -20, 20, 10); // 三角雨棚
      break;
    case 'balcony':
      rect(-20, -10, 40, 20); // 矩形陽台
      break;
  }
  
  pop();
}

function mousePressed() {
  if (followingObject) {
    // 放置物件
    placedObjects.push({...followingObject});
    followingObject = null;
    currentTool = null;
    
    document.querySelectorAll('.tool-btn').forEach(b => b.classList.remove('active'));
    document.getElementById('status').textContent = '物件已放置！點擊物件來選擇。';
    
    console.log('物件已放置，總數:', placedObjects.length);
  } else {
    // 選擇物件
    selectedObject = null;
    
    for (let i = placedObjects.length - 1; i >= 0; i--) {
      let obj = placedObjects[i];
      let d = dist(mouseX, mouseY, obj.x, obj.y);
      if (d < 30) {
        selectedObject = obj;
        showControls(obj.x, obj.y);
        document.getElementById('status').textContent = `選中了 ${obj.type}`;
        break;
      }
    }
    
    if (!selectedObject) {
      hideControls();
    }
  }
}

function mouseDragged() {
  if (selectedObject && !followingObject) {
    selectedObject.x = mouseX;
    selectedObject.y = mouseY;
    showControls(selectedObject.x, selectedObject.y);
  }
}

function showControls(x, y) {
  let controls = document.getElementById('object-controls');
  controls.style.display = 'block';
  controls.style.left = (x + 20) + 'px';
  controls.style.top = (y - 20) + 'px';
}

function hideControls() {
  document.getElementById('object-controls').style.display = 'none';
}

function changeAngle() {
  if (selectedObject) {
    selectedObject.rotation += 45;
    document.getElementById('status').textContent = `角度: ${selectedObject.rotation}°`;
  }
}

function rotateObj() {
  if (selectedObject) {
    selectedObject.rotation += 15;
    document.getElementById('status').textContent = `旋轉: ${selectedObject.rotation}°`;
  }
}

function scaleObj() {
  if (selectedObject) {
    selectedObject.scale = selectedObject.scale === 1 ? 1.5 : selectedObject.scale === 1.5 ? 0.7 : 1;
    document.getElementById('status').textContent = `縮放: ${selectedObject.scale}x`;
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  canvasFrame.w = windowWidth * 0.8;
  canvasFrame.h = windowHeight * 0.7;
  canvasFrame.x = (windowWidth - canvasFrame.w) / 2;
  canvasFrame.y = (windowHeight - canvasFrame.h) / 2;
  createSimpleBackground();
}