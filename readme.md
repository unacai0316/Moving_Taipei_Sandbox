# Moving Taipei Sandbox

An interactive web application that celebrates Taipei's improvised street architecture through a creative sandbox experience.

## 🎯 Project Overview

This project is part of the "Moving Taipei: City Style Guide" - an interactive exploration of Taipei's adaptive urban elements like night-market booths, scooter arrangements, rain canopies, and balcony extensions.

## 🚀 Features

- **Interactive Canvas**: Click and drag to place street elements
- **Multiple Object Types**: Vendor stalls, scooters, rain covers, balcony extensions
- **Real-time Manipulation**: Rotate, scale, and delete objects
- **Dynamic Backgrounds**: Randomized Taipei street scenes
- **Export Functionality**: Save your creations as PNG images
- **Responsive Design**: Works on desktop and mobile devices

## 🛠️ Setup & Installation

### Method 1: Local Development
1. Clone or download the project files
2. Ensure you have the following structure:
   ```
   MOVING_TAIPEI_SANDBOX/
   ├── index.html
   ├── sketch.js
   ├── styles.css
   ├── assets/
   └── README.md
   ```
3. Open `index.html` in a web browser
4. Start creating your Taipei street!

### Method 2: Live Server (Recommended)
1. Install Live Server extension in VS Code
2. Right-click on `index.html`
3. Select "Open with Live Server"
4. The application will open in your browser with live reload

### Method 3: GitHub Pages Deployment
1. Push your project to a GitHub repository
2. Go to repository Settings → Pages
3. Select source branch (usually `main`)
4. Your sandbox will be available at `https://yourusername.github.io/repository-name/`

## 🎮 How to Use

### Basic Controls
- **Select Tool**: Click on any tool button (Vendor, Scooter, Rain Cover, Balcony)
- **Place Object**: Click on the canvas where you want to place the object
- **Select Object**: Click on any placed object to select it

### Object Manipulation
- **Rotate**: Press `R` key or `A` key for preset angles
- **Scale**: Press `+` to make bigger, `-` to make smaller
- **Delete**: Press `D` key to remove selected object

### Canvas Controls
- **Randomize Map**: Load a new background image
- **Clear Sandbox**: Remove all placed objects
- **Save Your Taipei**: Export your creation as PNG

### Keyboard Shortcuts
- `C` - Clear canvas
- `S` - Save image
- `R` - Rotate selected object
- `A` - Cycle through angle presets
- `+/=` - Scale up
- `-/_` - Scale down
- `D` - Delete selected object

## 🎨 Customization

### Adding New Object Types
1. Add a new shape function in `sketch.js`:
   ```javascript
   const shapes = {
     newObject: function() {
       // Your drawing code here
       fill('#color');
       rect(x, y, width, height);
     }
   };
   ```

2. Add a new tool button in `index.html`:
   ```html
   <button class="tool" data-type="newObject">🎯 New Object</button>
   ```

### Changing Background Sources
Modify the `bgUrls` array in `sketch.js` to use different image sources:
```javascript
let bgUrls = [
  'your-image-url-1',
  'your-image-url-2',
  // ... more URLs
];
```

## 🌐 Integration with Framer

To embed this sandbox in your Framer project:

1. Deploy the sandbox to a web server or GitHub Pages
2. In Framer, add an HTML Embed component
3. Use this iframe code:
   ```html
   <iframe 
     src="https://your-deployment-url.com" 
     width="100%" 
     height="600" 
     frameborder="0"
     allowfullscreen>
   </iframe>
   ```

## 📱 Browser Support

- Chrome (recommended)
- Firefox
- Safari
- Edge
- Mobile browsers (iOS Safari, Chrome Mobile)

## 🐛 Troubleshooting

### Images Not Loading
- Check internet connection
- Try refreshing the page
- Fallback backgrounds will be generated automatically

### Objects Not Responding
- Make sure you've selected an object first (click on it)
- Check that you're using the correct keyboard shortcuts
- Try refreshing the page

### Mobile Issues
- Use touch gestures instead of mouse clicks
- Some keyboard shortcuts may not work on mobile
- Try landscape orientation for better experience

## 🔧 Technical Details

- **Framework**: p5.js
- **Styling**: CSS3 with modern features
- **Images**: Unsplash API for backgrounds
- **Export**: HTML5 Canvas API
- **Responsive**: CSS Grid and Flexbox

## 👥 Team

- **Una Cai** (MDP – Media Design Practices)
- **Elizabeth Liu** (Product Design)  
- **Coby** (Fine Arts / Visual Art & Photography)

## 📄 License

This project is part of an academic assignment. Please credit the original creators if you use or modify this code.

## 🚀 Next Steps

- [ ] Add more object types (street food, umbrellas, etc.)
- [ ] Implement layers and z-index controls
- [ ] Add collaborative features
- [ ] Integrate with Google Maps Street View
- [ ] Add sound effects and ambient audio
- [ ] Create mobile-specific gestures