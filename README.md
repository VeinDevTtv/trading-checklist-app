# A+ Trade Checklist

A comprehensive trading checklist application designed to help traders make confident, data-driven trading decisions. Built with Next.js, TypeScript, and Tailwind CSS, featuring multiple trading strategies, intelligent scoring systems, risk management tools, and persistent data storage.

## 🌟 Live Demo

**[Visit the Live Application](https://trading-checklist-app.vercel.app/)**

## 📋 Table of Contents

- [Features](#-features)
- [Trading Strategies](#-trading-strategies)
- [Scoring System](#-scoring-system)
- [Technology Stack](#-technology-stack)
- [Installation](#-installation)
- [Usage Guide](#-usage-guide)
- [Data Persistence](#-data-persistence)
- [Deployment](#-deployment)
- [Contributing](#-contributing)

## ✨ Features

### 🎯 Core Trading Features

- **Multiple Trading Strategies**: Pre-built strategies for ICT 2022, Price Action, and Supply & Demand
- **Custom Strategy Builder**: Create and edit your own trading strategies with unlimited conditions
- **Intelligent A+ Scoring**: Advanced scoring algorithm that considers condition importance
- **Trade History Tracking**: Complete log of all your trading decisions with timestamps
- **PDF Export**: Export your checklist analysis as professional PDF reports
- **Real-time Scoring**: Live calculation of trade confidence levels
- **Image Attachments**: Add screenshots and charts to your trade analysis with drag-drop support

### 📊 Advanced Analytics & Performance

- **Performance Dashboard**: Comprehensive KPIs including win rate, Sharpe ratio, drawdown analysis
- **Equity Curve Visualization**: Interactive charts showing account growth over time
- **Strategy Comparison**: Side-by-side performance analysis of different trading strategies
- **Calendar Heat-map**: Visual representation of A+ vs non-A+ trading days with performance indicators
- **Drawdown Analysis**: Detailed analysis of losing periods and recovery metrics
- **Risk-Adjusted Returns**: Professional-grade performance metrics and ratios

### 🏷️ Enhanced Organization & Filtering

- **Advanced Trade Filtering**: Filter by strategy, outcome, currency pair, trading session, date range, P&L
- **Smart Tagging System**: Organize trades by session (London, NY, Tokyo, Sydney), setup type, and custom tags
- **Search Functionality**: Full-text search through trade notes and analysis
- **Calendar View**: Monthly calendar with heat-map highlighting profitable vs unprofitable days
- **Session Analysis**: Track performance by trading session and time of day

### 🚀 User Experience & Onboarding

- **Interactive First-run Tour**: Guided walkthrough of all features using react-joyride
- **Strategy Versioning**: Track changes to strategies with full revision history and restore capability
- **Strategy Sharing**: Export/import strategies via JSON files or shareable URLs
- **Chrome Extension**: Overlay checklist directly on TradingView for seamless chart analysis
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices

### 🧮 Risk Management Tools

- **Advanced Risk Calculator**: Calculate position sizes, risk amounts, and reward ratios
- **Dynamic Risk Assessment**: Real-time risk level indicators (Conservative, Moderate, Aggressive, Very High Risk)
- **Risk:Reward Analysis**: Automatic calculation and rating of risk-reward ratios
- **Position Size Calculator**: Precise lot size calculations based on account balance and risk percentage
- **Risk Management Tips**: Built-in educational content for proper risk management

### ⚙️ Application Settings

- **Auto-Save Functionality**: Automatic saving of progress and settings
- **Compact Mode**: Space-efficient layout option
- **Notification System**: Configurable alerts and notifications
- **Data Export/Import**: Backup and restore your settings and data
- **Theme Support**: Light and dark mode with system preference detection
- **Customizable Defaults**: Set default risk percentages and account balances

### 💾 Advanced Data Management

- **IndexedDB Storage**: Efficient storage for images and large datasets
- **Web Worker Integration**: Heavy calculations run off main thread for smooth UI performance
- **Local Storage Integration**: All data persists across browser sessions
- **Strategy Management**: Save custom strategies permanently with version control
- **Trade History**: Complete trading log with advanced search and filter capabilities
- **Settings Backup**: Export/import functionality for settings and configurations
- **Cross-Session Continuity**: Resume exactly where you left off

### 🌐 Chrome Extension Features

- **TradingView Integration**: Floating overlay directly on TradingView charts
- **Auto Currency Pair Detection**: Automatically detects trading pairs from TradingView
- **Real-time Sync**: Seamless synchronization with the main web application
- **Draggable Interface**: Move the overlay anywhere on screen for optimal workflow
- **Quick Trade Saving**: Save trades directly from TradingView without switching tabs

## 🎯 Trading Strategies

### Pre-Built Strategies

#### 1. ICT 2022 Entry Strategy
- **SMT confirmed** (High Importance)
- **BOS after FVG** (High Importance)
- **Killzone timing** (Medium Importance)
- **Clean OB mitigation** (Medium Importance)
- **RR ≥ 1:3** (Low Importance)

#### 2. Regular Price Action Strategy
- **Break / Retest confirmed** (High Importance)
- **Clear trend direction** (Medium Importance)
- **Support/Resistance respected** (Medium Importance)
- **No upcoming red‑folder news** (Low Importance)

#### 3. Supply & Demand Strategy
- **Fresh S/D zone** (High Importance)
- **Liquidity sweep into zone** (High Importance)
- **Lower‑TF BOS out of zone** (Medium Importance)
- **Confluence with HTF imbalance** (Low Importance)

### Custom Strategy Builder

- **Unlimited Conditions**: Add as many conditions as needed
- **Importance Levels**: Assign High (🔴), Medium (🟡), or Low (🟢) importance
- **Edit Existing Strategies**: Modify pre-built or custom strategies
- **Remove Conditions**: Delete unwanted conditions with trash icon
- **Strategy Management**: Create, edit, and organize multiple strategies

## 📊 Scoring System

### Intelligent A+ Algorithm

The application uses an advanced scoring system that considers both the number of conditions met and their relative importance:

#### Importance Weights
- **High Importance**: 3 points
- **Medium Importance**: 2 points  
- **Low Importance**: 1 point

#### A+ Qualification Rules
1. **Automatic A+**: If ALL high-importance conditions are checked
2. **Percentage-Based A+**: If 85% or more of total possible points are achieved
3. **Visual Indicators**: Green checkmark for A+ setups, warning icon for non-A+ setups

#### Score Display
- **Real-time Calculation**: Score updates as you check/uncheck conditions
- **Percentage Display**: Shows current score as percentage of maximum possible
- **Confidence Levels**: "✅ Confident Entry" vs "⚠️ Wait for More Confluences"

## 🛠 Technology Stack

### Frontend Framework
- **Next.js 15.3.3**: React framework with App Router
- **React 19**: Latest React with concurrent features
- **TypeScript**: Full type safety and developer experience

### Styling & UI
- **Tailwind CSS 3.4.17**: Utility-first CSS framework
- **shadcn/ui**: High-quality, accessible component library
- **Radix UI**: Unstyled, accessible UI primitives
- **Lucide React**: Beautiful, customizable icons

### Features & Utilities
- **jsPDF**: PDF generation for trade reports
- **next-themes**: Dark/light mode with system preference
- **react-joyride**: Interactive guided tours and onboarding
- **recharts**: Advanced charting and data visualization
- **dexie**: IndexedDB wrapper for efficient data storage
- **Local Storage**: Client-side data persistence
- **Web Workers**: Background processing for performance calculations
- **Class Variance Authority**: Dynamic styling utilities

### Development Tools
- **ESLint**: Code linting and quality assurance
- **PostCSS**: CSS processing and optimization
- **Autoprefixer**: Automatic vendor prefixing

## 🚀 Installation

### Prerequisites
- Node.js 18 or higher
- npm or yarn package manager

### Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/veindevttv/trading-checklist-app.git
   cd trading-checklist-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Open in browser**
   ```
   http://localhost:3000
   ```

### Build for Production

```bash
# Create production build
npm run build

# Export static files (for GitHub Pages)
npm run export
```

## 📖 Usage Guide

### Getting Started

1. **Select a Strategy**: Choose from pre-built strategies or create your own
2. **Check Conditions**: Mark off conditions as they're met in your analysis
3. **Add Notes**: Document your trade analysis and market observations
4. **Review Score**: Check if you've achieved an A+ setup
5. **Save Trade**: Log your decision for future reference
6. **Export PDF**: Generate professional trade reports

### Strategy Management

#### Creating Custom Strategies
1. Click "New Strategy" button
2. Enter strategy name
3. Add conditions with importance levels
4. Save and start using immediately

#### Editing Strategies
1. Select strategy to edit
2. Click "Edit Strategy" button
3. Modify conditions, importance levels, or strategy name
4. Save changes (existing checked conditions are preserved)

### Risk Calculator Usage

1. **Set Account Details**: Enter account balance and preferred risk percentage
2. **Input Trade Parameters**: Entry price, stop loss, and take profit levels
3. **Review Calculations**: Position size, risk amount, potential profit/loss
4. **Assess Risk Level**: View risk rating and risk:reward ratio
5. **Follow Guidelines**: Built-in risk management tips and best practices

### Chrome Extension Usage

#### Installation
1. **Download Extension**: Get the extension from the `chrome-extension` folder
2. **Enable Developer Mode**: Go to `chrome://extensions/` and toggle developer mode
3. **Load Extension**: Click "Load unpacked" and select the extension folder
4. **Pin Extension**: Pin the A+ Trade Checklist extension to your toolbar

#### Using on TradingView
1. **Open TradingView**: Navigate to any TradingView chart
2. **Launch Overlay**: Click the extension icon or right-click → "Open Trading Checklist"
3. **Select Strategy**: Choose your trading strategy from the dropdown
4. **Complete Analysis**: Check conditions as they're met in your chart analysis
5. **Auto-Detection**: Currency pair is automatically detected from TradingView
6. **Save Trade**: Click "Save Trade" to log your analysis
7. **Sync Data**: Trades automatically sync with the main web application

#### Extension Features
- **Draggable Overlay**: Move the checklist anywhere on screen
- **Real-time Scoring**: Live A+ calculation as you check conditions
- **Strategy Sync**: Access all your custom strategies from the main app
- **Quick Access**: Complete trade analysis without leaving TradingView
- **Notifications**: Optional success/error notifications for actions

### Performance Dashboard

1. **View Analytics**: Navigate to the Performance tab
2. **KPI Overview**: Review win rate, Sharpe ratio, drawdown, and other metrics
3. **Equity Curve**: Visualize account growth over time with interactive charts
4. **Strategy Comparison**: Compare performance across different trading strategies
5. **Drawdown Analysis**: Understand losing periods and recovery patterns
6. **Export Data**: Download performance reports and charts

### Advanced Filtering & Organization

1. **Apply Filters**: Use the filter panel to narrow down trade history
2. **Tag Trades**: Organize trades by session, pair, setup type, or custom tags
3. **Search Notes**: Find specific trades using full-text search
4. **Calendar View**: Toggle calendar heat-map to see daily performance patterns
5. **Date Ranges**: Filter trades by specific time periods
6. **P&L Analysis**: Filter by profit/loss ranges to analyze performance

### Data Management

#### Automatic Saving
- All data saves automatically to browser's local storage
- Strategies, trade history, and settings persist across sessions
- No account creation or login required

#### Manual Backup
- Export settings as JSON files
- Import previously exported settings
- Reset to default settings if needed
- Clear all data option for fresh start

## 💾 Data Persistence

### What Gets Saved
- **Custom Strategies**: All user-created trading strategies
- **Trade History**: Complete log of all saved trades with timestamps
- **Active Strategy**: Currently selected strategy
- **Checked Conditions**: Current checklist state
- **Trade Notes**: Any notes added to current analysis
- **Application Settings**: All preferences and configurations

### Storage Locations
- **Browser Local Storage**: Primary storage for all user data
- **Export Files**: JSON backups for settings and configurations
- **PDF Reports**: Generated trade analysis documents

### Data Security
- All data stored locally in your browser
- No data transmitted to external servers
- Complete privacy and control over your trading information
- Export functionality for backup and portability

## 🌐 Deployment

### GitHub Pages (Recommended)

The application is configured for automatic deployment to GitHub Pages:

1. **Fork the Repository**: Create your own copy on GitHub
2. **Enable GitHub Pages**: Go to Settings → Pages → Source: GitHub Actions
3. **Push Changes**: Any push to main branch triggers automatic deployment
4. **Access Your Site**: Available at `https://[username].github.io/trading-checklist-app/`

### Manual Deployment

For other hosting platforms:

```bash
# Build static export
npm run export

# Deploy the 'out' directory to your hosting provider
```

### Supported Platforms
- GitHub Pages ✅
- Vercel ✅
- Netlify ✅
- Any static hosting service ✅

## 🤝 Contributing

### Development Setup

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes
4. Test thoroughly
5. Commit: `git commit -m 'Add amazing feature'`
6. Push: `git push origin feature/amazing-feature`
7. Open a Pull Request

### Code Standards

- **TypeScript**: All new code must be properly typed
- **ESLint**: Follow the established linting rules
- **Component Structure**: Use the existing shadcn/ui patterns
- **Responsive Design**: Ensure mobile compatibility
- **Accessibility**: Maintain WCAG compliance

### Feature Requests

- Open an issue with the "enhancement" label
- Describe the feature and its benefits
- Include mockups or examples if applicable
- Discuss implementation approach

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🙏 Acknowledgments

- **shadcn/ui**: For the beautiful, accessible component library
- **Radix UI**: For the unstyled, accessible primitives
- **Tailwind CSS**: For the utility-first CSS framework
- **Next.js Team**: For the excellent React framework
- **Trading Community**: For feedback and feature suggestions

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/veindevttv/trading-checklist-app/issues)
- **Discussions**: [GitHub Discussions](https://github.com/veindevttv/trading-checklist-app/discussions)
- **Documentation**: This README and inline code comments

---

**Happy Trading! 📈**

*Remember: This tool is designed to help with analysis and decision-making. Always do your own research and never risk more than you can afford to lose.*
