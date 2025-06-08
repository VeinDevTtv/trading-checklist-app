# A+ Trade Checklist Chrome Extension

Quick access to your trading checklist while analyzing charts on TradingView.

## Features

- **Overlay Integration**: Floating checklist overlay on TradingView pages
- **Auto-Detection**: Automatically detects currency pairs from TradingView
- **Strategy Sync**: Syncs with the main web application
- **Quick Analysis**: Complete trade analysis without leaving TradingView
- **Real-time Scoring**: Live A+ scoring as you check conditions
- **Trade Saving**: Save trades directly to your trading journal

## Installation

### From Chrome Web Store (Recommended)
*Coming soon - extension will be published to Chrome Web Store*

### Manual Installation (Developer Mode)

1. **Download the Extension**
   - Download or clone this repository
   - Navigate to the `chrome-extension` folder

2. **Enable Developer Mode**
   - Open Chrome and go to `chrome://extensions/`
   - Toggle "Developer mode" in the top right corner

3. **Load the Extension**
   - Click "Load unpacked"
   - Select the `chrome-extension` folder
   - The extension should now appear in your extensions list

4. **Pin the Extension**
   - Click the puzzle piece icon in Chrome toolbar
   - Find "A+ Trade Checklist" and click the pin icon

## Usage

### Quick Start

1. **Open TradingView**
   - Navigate to [TradingView.com](https://www.tradingview.com)
   - Open any chart

2. **Launch Checklist**
   - Click the A+ Trade Checklist extension icon
   - Or right-click on the page and select "Open Trading Checklist"

3. **Select Strategy**
   - Choose from pre-built strategies or your custom ones
   - The overlay will show your strategy conditions

4. **Complete Analysis**
   - Check off conditions as they're met in your analysis
   - Watch the real-time A+ scoring
   - Currency pair is auto-detected from TradingView

5. **Save Trade**
   - Click "Save Trade" to log your analysis
   - Data syncs with the main web application

### Extension Features

#### Popup Interface
- **Current Strategy**: View and switch between strategies
- **Today's Stats**: Quick overview of today's trading activity
- **Settings**: Configure auto-detection and notifications
- **Quick Actions**: Open overlay or full web application

#### Overlay Features
- **Draggable**: Move the overlay anywhere on screen
- **Resizable**: Compact design that doesn't interfere with charts
- **Auto-Detection**: Automatically detects currency pairs
- **Real-time Scoring**: Live A+ calculation as you check conditions
- **Strategy Switching**: Change strategies without closing overlay

#### Settings
- **Auto-detect Currency Pair**: Automatically detect pair from TradingView URL
- **Show Notifications**: Display success/error notifications
- **Overlay Position**: Choose left or right side positioning

## Synchronization

The extension automatically syncs with the main web application:

- **Strategies**: Custom strategies sync from the web app
- **Trade History**: Saved trades appear in both places
- **Settings**: Preferences sync across devices
- **Real-time Updates**: Changes reflect immediately

## Keyboard Shortcuts

- **Ctrl+Shift+T** (Windows) / **Cmd+Shift+T** (Mac): Toggle overlay
- **Escape**: Close overlay
- **Enter**: Save trade (when overlay is focused)

## Troubleshooting

### Extension Not Working
1. Refresh the TradingView page
2. Check if extension is enabled in `chrome://extensions/`
3. Try disabling and re-enabling the extension

### Overlay Not Appearing
1. Make sure you're on a TradingView page
2. Check if the page has finished loading
3. Try clicking the extension icon again

### Data Not Syncing
1. Open the main web application in another tab
2. Check your internet connection
3. Try the "Sync Data" option in the popup

### Currency Pair Not Detected
1. Make sure the TradingView URL contains the symbol
2. Try refreshing the page
3. Manually note the pair in your trade notes

## Privacy & Security

- **Local Storage**: All data is stored locally in your browser
- **No External Servers**: Extension communicates only with the main web app
- **No Tracking**: No analytics or tracking data is collected
- **Secure Communication**: All data transfer uses secure HTTPS

## Permissions Explained

- **Active Tab**: Read the current TradingView page to detect currency pairs
- **Storage**: Save your settings and sync data locally
- **Scripting**: Inject the overlay interface on TradingView pages
- **Host Permissions**: Access TradingView.com and the main web application

## Support

- **Web Application**: [trading-checklist-app.vercel.app](https://trading-checklist-app.vercel.app)
- **Issues**: Report bugs or request features via GitHub issues
- **Documentation**: Full documentation available in the web application

## Version History

### v1.0.0
- Initial release
- TradingView overlay integration
- Strategy synchronization
- Auto currency pair detection
- Real-time A+ scoring
- Trade saving functionality

## Development

### Building from Source

```bash
# Clone the repository
git clone <repository-url>
cd trading-checklist-app/chrome-extension

# No build process required - load directly in Chrome
```

### File Structure

```
chrome-extension/
├── manifest.json          # Extension configuration
├── popup.html             # Extension popup interface
├── popup.css              # Popup styling
├── popup.js               # Popup functionality
├── content.js             # TradingView overlay injection
├── background.js          # Background service worker
├── icons/                 # Extension icons
└── README.md              # This file
```

### Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly on TradingView
5. Submit a pull request

## License

This extension is part of the A+ Trade Checklist project and follows the same license terms. 