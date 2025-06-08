# A+ Trade Checklist

A comprehensive, professional-grade trading checklist application designed to help traders make confident, data-driven trading decisions. Built with Next.js 15, TypeScript, and modern web technologies, featuring multiple trading strategies, intelligent scoring systems, advanced analytics, risk management tools, and persistent data storage.

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
- **Intelligent A+ Scoring**: Advanced scoring algorithm that considers condition importance with weighted calculations
- **Trade History Tracking**: Complete log of all your trading decisions with timestamps and detailed metadata
- **PDF Export**: Export your checklist analysis as professional PDF reports with jsPDF integration
- **Real-time Scoring**: Live calculation of trade confidence levels with instant feedback
- **Image Attachments**: Add up to 3 screenshots and charts to your trade analysis with drag-drop support and IndexedDB storage
- **Strategy Versioning**: Full revision history with restore capability for all strategy modifications
- **Strategy Sharing**: Export/import strategies via JSON files or shareable URLs with metadata

### 📊 Advanced Analytics & Performance Dashboard

- **Comprehensive Performance Metrics**: 
  - Win Rate, Profit Factor, Sharpe Ratio
  - Maximum Drawdown, Average Win/Loss
  - Risk-Adjusted Returns, Calmar Ratio
  - Total Trades, Winning/Losing Streaks
- **Interactive Equity Curve**: Real-time visualization of account growth with Recharts
- **Strategy Performance Comparison**: Side-by-side analysis of different trading strategies
- **Risk-Reward Distribution Analysis**: Visual breakdown of R:R ratios across all trades
- **Outcome Distribution Charts**: Pie charts showing win/loss/breakeven percentages
- **Monthly Performance Summaries**: Detailed monthly breakdowns with key statistics
- **Web Worker Integration**: Heavy calculations run in background for smooth UI performance
- **Performance Caching**: Intelligent caching system for faster dashboard loading

### 🗓️ Calendar Heat-map & Time Analysis

- **Interactive Trading Calendar**: Monthly view with color-coded performance indicators
- **Daily Performance Heat-map**: Visual representation of profitable vs unprofitable days
- **A+ Setup Tracking**: Highlight days with high-quality setups vs execution days
- **Session-based Analysis**: Performance breakdown by London, New York, Tokyo, Sydney sessions
- **Day-of-Week Analytics**: Identify your most/least profitable trading days
- **Monthly Statistics**: Trading days, average trades per day, monthly P&L summaries
- **Tooltip Details**: Hover over any day to see detailed trade information

### 🏷️ Enhanced Organization & Advanced Filtering

- **Multi-dimensional Filtering System**:
  - Strategy name, verdict (A+ vs non-A+), outcome (win/loss/breakeven)
  - Currency pairs, trading sessions, day of week
  - Date ranges with calendar picker
  - P&L ranges (min/max profit/loss)
  - Full-text search through trade notes
- **Smart Tagging System**: 
  - Pre-built tags for sessions, currency pairs, setups
  - Custom tag creation with color coding
  - Tag categories: session, pair, setup, outcome, custom
- **Advanced Search**: Full-text search through all trade notes and analysis
- **Filter Persistence**: All filter settings saved across browser sessions
- **Quick Filter Toggles**: One-click access to common filter combinations

### 🚀 User Experience & Onboarding

- **Interactive Guided Tour**: Comprehensive walkthrough using @reactour/tour with step-by-step guidance
- **Responsive Design**: Fully optimized for desktop, tablet, and mobile devices
- **Dark/Light Theme**: System preference detection with manual toggle using next-themes
- **Keyboard Shortcuts**: Quick access to common actions
- **Auto-save Functionality**: Automatic saving of all progress and settings
- **Loading States**: Smooth loading indicators for all async operations
- **Error Handling**: Graceful error handling with user-friendly messages
- **Accessibility**: WCAG compliant with proper ARIA labels and keyboard navigation

### 🧮 Advanced Risk Management Calculator

- **Position Size Calculator**: Precise lot size calculations based on account balance and risk percentage
- **Dynamic Risk Assessment**: Real-time risk level indicators:
  - Conservative (≤1%), Moderate (≤2%), Aggressive (≤5%), Very High Risk (>5%)
- **Risk:Reward Analysis**: Automatic calculation and rating of risk-reward ratios:
  - Excellent (≥3:1), Good (≥2:1), Fair (≥1:1), Poor (<1:1)
- **Multi-currency Support**: Pip value calculations for different currency pairs
- **Visual Risk Indicators**: Color-coded risk levels and R:R ratings
- **Real-time Calculations**: Instant updates as you modify trade parameters
- **Educational Content**: Built-in risk management tips and best practices

### ⚙️ Application Settings & Customization

- **Comprehensive Settings Panel**:
  - Auto-save toggle, compact mode, notification preferences
  - Default risk percentages and account balance
  - Theme preferences and display options
- **Data Management**:
  - Export/import settings as JSON files
  - Backup and restore functionality
  - Clear all data option with confirmation
- **Performance Optimization**:
  - Lazy loading of components
  - Efficient re-rendering with React optimizations
  - Memory management for large datasets

### 💾 Advanced Data Management & Storage

- **Multi-layer Storage Architecture**:
  - **LocalStorage**: Settings, strategies, and trade metadata
  - **IndexedDB**: Image storage and large datasets via Dexie
  - **Web Workers**: Background processing for performance calculations
- **Data Integrity**: Automatic data validation and error recovery
- **Cross-session Continuity**: Resume exactly where you left off
- **Storage Optimization**: Efficient data compression and cleanup
- **Backup Systems**: Multiple backup and restore options

### 🌐 Chrome Extension Integration

- **TradingView Overlay**: Floating checklist directly on TradingView charts
- **Auto Currency Pair Detection**: Automatically detects trading pairs from TradingView
- **Real-time Synchronization**: Seamless sync with the main web application
- **Draggable Interface**: Move the overlay anywhere on screen for optimal workflow
- **Quick Trade Saving**: Save trades directly from TradingView without switching tabs
- **Extension Popup**: Quick access to strategies and recent trades
- **Background Processing**: Service worker for efficient data synchronization

## 🎯 Trading Strategies

### Pre-Built Strategies

#### 1. ICT 2022 Entry Strategy
Advanced Inner Circle Trader methodology focusing on:
- **SMT confirmed** (High Importance) - Smart Money Tool confirmation
- **BOS after FVG** (High Importance) - Break of Structure after Fair Value Gap
- **Killzone timing** (Medium Importance) - Optimal entry timing windows
- **Clean OB mitigation** (Medium Importance) - Order Block mitigation analysis
- **RR ≥ 1:3** (Low Importance) - Risk-reward ratio minimum threshold

#### 2. Regular Price Action Strategy
Classic technical analysis approach featuring:
- **Break / Retest confirmed** (High Importance) - Support/resistance break and retest
- **Clear trend direction** (Medium Importance) - Trend alignment confirmation
- **Support/Resistance respected** (Medium Importance) - Key level validation
- **No upcoming red‑folder news** (Low Importance) - High-impact news avoidance

#### 3. Supply & Demand Strategy
Institutional order flow analysis including:
- **Fresh S/D zone** (High Importance) - Untested supply/demand zones
- **Liquidity sweep into zone** (High Importance) - Stop hunt confirmation
- **Lower‑TF BOS out of zone** (Medium Importance) - Lower timeframe confirmation
- **Confluence with HTF imbalance** (Low Importance) - Higher timeframe alignment

### Custom Strategy Builder

- **Unlimited Conditions**: Add as many conditions as needed for your strategy
- **Importance Levels**: Assign High (🔴), Medium (🟡), or Low (🟢) importance with visual indicators
- **Strategy Templates**: Save and reuse strategy templates
- **Condition Reordering**: Drag and drop to reorder conditions
- **Bulk Operations**: Edit multiple conditions simultaneously
- **Strategy Validation**: Automatic validation of strategy completeness

## 📊 Scoring System

### Intelligent A+ Algorithm

The application uses a sophisticated scoring system that considers both the number of conditions met and their relative importance:

#### Importance Weights
- **High Importance**: 3 points (Critical conditions that must be met)
- **Medium Importance**: 2 points (Important but not critical conditions)
- **Low Importance**: 1 point (Nice-to-have confirmations)

#### A+ Qualification Rules
1. **Automatic A+**: If ALL high-importance conditions are checked (ensures critical criteria are met)
2. **Percentage-Based A+**: If 85% or more of total possible points are achieved
3. **Weighted Calculation**: Score = (Σ checked_condition_weights) / (Σ total_possible_weights) × 100

#### Visual Feedback System
- **Real-time Updates**: Score recalculates instantly as conditions are checked/unchecked
- **Color-coded Indicators**: Green for A+ setups, yellow/orange for non-A+ setups
- **Confidence Levels**: 
  - "✅ Confident Entry" for A+ setups
  - "⚠️ Wait for More Confluences" for non-A+ setups
- **Progress Visualization**: Visual progress bar showing completion percentage

## 🛠 Technology Stack

### Frontend Framework & Core
- **Next.js 15.3.3**: Latest React framework with App Router and Turbopack
- **React 19**: Latest React with concurrent features and improved performance
- **TypeScript 5**: Full type safety and enhanced developer experience

### Styling & UI Components
- **Tailwind CSS 3.4.17**: Utility-first CSS framework with custom configuration
- **shadcn/ui**: High-quality, accessible component library built on Radix UI
- **Radix UI**: Unstyled, accessible UI primitives for complex components
- **Lucide React**: Beautiful, customizable icon library
- **Class Variance Authority**: Dynamic styling utilities for component variants
- **Tailwind Merge**: Intelligent Tailwind class merging

### Data Visualization & Charts
- **Recharts 2.15.3**: Advanced charting library for performance analytics
- **Interactive Charts**: Line charts, area charts, bar charts, pie charts
- **Responsive Visualizations**: Charts adapt to different screen sizes
- **Custom Tooltips**: Detailed hover information for all chart elements

### Data Management & Storage
- **Dexie 4.0.11**: Modern IndexedDB wrapper for efficient client-side storage
- **Local Storage**: Browser storage for settings and lightweight data
- **Web Workers**: Background processing for heavy calculations
- **Data Validation**: Runtime type checking and data integrity

### User Experience & Interaction
- **@reactour/tour 3.8.0**: Interactive guided tours and onboarding
- **next-themes 0.4.6**: Dark/light mode with system preference detection
- **jsPDF 3.0.1**: Client-side PDF generation for trade reports
- **Drag & Drop**: Native HTML5 drag and drop for image uploads

### Development & Build Tools
- **ESLint 9**: Advanced code linting with custom rules
- **PostCSS 8.5.4**: CSS processing and optimization
- **Autoprefixer**: Automatic vendor prefixing for CSS
- **TypeScript Strict Mode**: Enhanced type checking and safety

## 🚀 Installation

### Prerequisites
- **Node.js 18+**: Latest LTS version recommended
- **npm 8+** or **yarn 1.22+**: Package manager
- **Modern Browser**: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+

### Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/veindevttv/trading-checklist-app.git
   cd trading-checklist-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Start development server with Turbopack**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

4. **Open in browser**
   ```
   http://localhost:3000
   ```

### Build for Production

```bash
# Create optimized production build
npm run build

# Export static files (for GitHub Pages/static hosting)
npm run export

# Start production server
npm start
```

### Chrome Extension Setup

1. **Navigate to extension directory**
   ```bash
   cd chrome-extension
   ```

2. **Load in Chrome**
   - Open `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked"
   - Select the `chrome-extension` folder

## 📖 Usage Guide

### Getting Started

1. **First Visit**: Complete the interactive guided tour to learn all features
2. **Select a Strategy**: Choose from pre-built strategies or create your own
3. **Complete Analysis**: Check conditions as they're met in your chart analysis
4. **Add Context**: Document your trade analysis and attach relevant screenshots
5. **Review Score**: Verify you've achieved an A+ setup before entering
6. **Save Trade**: Log your decision with all relevant metadata
7. **Track Performance**: Monitor your results in the Performance Dashboard

### Strategy Management

#### Creating Custom Strategies
1. Click "New Strategy" button in the strategy selector
2. Enter a descriptive strategy name
3. Add conditions one by one with appropriate importance levels
4. Use the condition builder to create detailed criteria
5. Save and immediately start using your new strategy

#### Editing Existing Strategies
1. Select the strategy you want to modify
2. Click "Edit Strategy" button
3. Modify conditions, importance levels, or strategy name
4. Add or remove conditions as needed
5. Save changes (existing trade history is preserved)

#### Strategy Sharing & Collaboration
1. **Export Strategy**: Click "Share" → "Export as JSON"
2. **Generate Share URL**: Create a shareable link for your strategy
3. **Import Strategy**: Use "Import from File" or "Import from URL"
4. **Version Control**: Track all changes with automatic versioning

### Risk Calculator Deep Dive

#### Setting Up Your Account
1. **Account Balance**: Enter your current trading account balance
2. **Risk Percentage**: Use the slider to set your risk per trade (0.1% - 10%)
3. **Pip Value**: Adjust based on your broker and account currency

#### Calculating Position Sizes
1. **Entry Price**: Input your planned entry level
2. **Stop Loss**: Set your stop loss level
3. **Take Profit**: Optional take profit target
4. **Review Results**: 
   - Position size in lots
   - Risk amount in dollars
   - Potential profit/loss
   - Risk:reward ratio and rating

### Performance Dashboard Analytics

#### Key Performance Indicators
- **Total P&L**: Overall profit/loss with color coding
- **Win Rate**: Percentage of winning trades
- **Profit Factor**: Ratio of gross profit to gross loss
- **Sharpe Ratio**: Risk-adjusted return measure
- **Maximum Drawdown**: Largest peak-to-trough decline
- **Average Win/Loss**: Mean profit and loss per trade

#### Interactive Charts
- **Equity Curve**: Track account growth over time
- **Strategy Comparison**: Compare performance across strategies
- **Risk-Reward Distribution**: Visualize R:R ratios
- **Monthly Performance**: Month-by-month breakdown

#### Advanced Analytics
- **Drawdown Analysis**: Understand losing periods
- **Winning/Losing Streaks**: Identify patterns
- **Session Performance**: Best/worst trading times
- **Setup Analysis**: Most/least profitable setups

### Advanced Filtering & Search

#### Multi-dimensional Filtering
1. **Basic Filters**: Strategy, verdict, outcome, pair, session
2. **Date Ranges**: Use calendar picker for specific periods
3. **P&L Ranges**: Filter by profit/loss amounts
4. **Tag Filtering**: Select multiple tags for precise filtering
5. **Text Search**: Search through all trade notes

#### Calendar Heat-map Usage
1. **Toggle Calendar**: Show/hide the monthly calendar view
2. **Color Interpretation**:
   - Green: Profitable days with A+ setups
   - Yellow: Breakeven or mixed performance
   - Red: Losing days or poor setups
   - Gray: No trading activity
3. **Detailed Tooltips**: Hover for daily statistics
4. **Navigation**: Switch between months and years

### Chrome Extension Workflow

#### Installation & Setup
1. **Download**: Get the extension from the `chrome-extension` folder
2. **Install**: Load unpacked extension in Chrome
3. **Permissions**: Grant access to TradingView
4. **Pin Extension**: Add to toolbar for quick access

#### Using on TradingView
1. **Open TradingView**: Navigate to any chart
2. **Launch Overlay**: Click extension icon or use right-click menu
3. **Auto-Detection**: Currency pair automatically detected
4. **Complete Analysis**: Use the floating checklist overlay
5. **Save & Sync**: Trades automatically sync with main app
6. **Drag & Position**: Move overlay for optimal chart viewing

### Data Management & Backup

#### Automatic Data Persistence
- **Real-time Saving**: All changes saved immediately
- **Cross-session Continuity**: Resume where you left off
- **Data Integrity**: Automatic validation and error recovery
- **Storage Optimization**: Efficient data compression

#### Manual Backup & Restore
1. **Export Settings**: Download JSON backup of all settings
2. **Export Strategies**: Save individual or all strategies
3. **Import Data**: Restore from previously exported files
4. **Reset Options**: Clear specific data types or everything

## 💾 Data Persistence

### Storage Architecture

#### LocalStorage (Primary)
- **Strategies**: All custom and modified strategies
- **Trade History**: Complete log with metadata
- **Settings**: User preferences and configurations
- **Active State**: Current strategy and checklist progress
- **Filter States**: Saved filter preferences

#### IndexedDB (Secondary)
- **Images**: Trade screenshots and charts (up to 3 per trade)
- **Large Datasets**: Performance calculations and analytics
- **Cache**: Computed metrics and chart data
- **Offline Data**: Full offline functionality

#### Data Security & Privacy
- **Local-only Storage**: No data transmitted to external servers
- **Encryption**: Sensitive data encrypted in storage
- **Privacy First**: Complete control over your trading data
- **GDPR Compliant**: No tracking or data collection

### Data Backup Strategies

#### Automatic Backups
- **Browser Sync**: Data syncs across Chrome instances (if enabled)
- **Extension Sync**: Chrome extension syncs with main app
- **Version Control**: Automatic versioning of strategies

#### Manual Backups
- **JSON Export**: Complete data export in standard format
- **Selective Export**: Export specific strategies or date ranges
- **Cloud Storage**: Save backups to your preferred cloud service
- **Migration Tools**: Easy transfer between devices/browsers

## 🌐 Deployment

### GitHub Pages (Recommended)

The application is optimized for GitHub Pages deployment:

1. **Fork Repository**: Create your own copy on GitHub
2. **Enable Pages**: Settings → Pages → Source: GitHub Actions
3. **Automatic Deployment**: Push to main branch triggers build
4. **Custom Domain**: Optional custom domain configuration
5. **HTTPS**: Automatic SSL certificate provisioning

### Vercel Deployment

For enhanced performance and features:

1. **Connect Repository**: Link your GitHub fork to Vercel
2. **Automatic Builds**: Every push triggers new deployment
3. **Preview Deployments**: Test changes before going live
4. **Analytics**: Built-in performance monitoring
5. **Edge Functions**: Global CDN for optimal performance

### Self-hosted Options

For complete control:

```bash
# Build for production
npm run build

# Serve with any static hosting solution
# Examples: nginx, Apache, Caddy, etc.
```

### Supported Platforms
- **GitHub Pages** ✅ (Free, automatic SSL)
- **Vercel** ✅ (Enhanced performance, analytics)
- **Netlify** ✅ (Form handling, edge functions)
- **AWS S3 + CloudFront** ✅ (Enterprise scale)
- **Any Static Host** ✅ (nginx, Apache, etc.)

## 🤝 Contributing

### Development Setup

1. **Fork & Clone**: Create your own copy of the repository
2. **Install Dependencies**: `npm install` or `yarn install`
3. **Start Development**: `npm run dev` for hot reloading
4. **Create Branch**: `git checkout -b feature/amazing-feature`
5. **Make Changes**: Follow the established patterns and conventions
6. **Test Thoroughly**: Ensure all features work correctly
7. **Submit PR**: Open a pull request with detailed description

### Code Standards & Guidelines

#### TypeScript Requirements
- **Strict Mode**: All code must pass TypeScript strict checks
- **Type Safety**: Proper typing for all functions and components
- **Interface Definitions**: Clear interfaces for all data structures
- **Generic Types**: Use generics for reusable components

#### Component Architecture
- **shadcn/ui Patterns**: Follow established component patterns
- **Composition**: Prefer composition over inheritance
- **Props Interface**: Clear prop interfaces with JSDoc comments
- **Error Boundaries**: Proper error handling in components

#### Performance Guidelines
- **React Optimization**: Use React.memo, useMemo, useCallback appropriately
- **Bundle Size**: Monitor and optimize bundle size
- **Lazy Loading**: Implement code splitting for large components
- **Web Workers**: Use workers for heavy computations

#### Accessibility Standards
- **WCAG 2.1 AA**: Meet accessibility guidelines
- **Keyboard Navigation**: Full keyboard accessibility
- **Screen Readers**: Proper ARIA labels and descriptions
- **Color Contrast**: Ensure sufficient contrast ratios

### Feature Development Process

#### Planning Phase
1. **Issue Creation**: Create detailed GitHub issue
2. **Requirements**: Define clear acceptance criteria
3. **Design Review**: Discuss UI/UX implications
4. **Technical Design**: Plan implementation approach

#### Implementation Phase
1. **Branch Creation**: Use descriptive branch names
2. **Incremental Commits**: Small, focused commits
3. **Testing**: Unit tests and integration tests
4. **Documentation**: Update README and code comments

#### Review Phase
1. **Self Review**: Test all functionality thoroughly
2. **Code Review**: Address reviewer feedback
3. **Testing**: Ensure no regressions
4. **Deployment**: Merge after approval

### Bug Reports & Feature Requests

#### Bug Reports
- **Reproduction Steps**: Clear steps to reproduce
- **Expected Behavior**: What should happen
- **Actual Behavior**: What actually happens
- **Environment**: Browser, OS, version information
- **Screenshots**: Visual evidence when applicable

#### Feature Requests
- **Use Case**: Explain the problem being solved
- **Proposed Solution**: Describe the desired feature
- **Alternatives**: Consider alternative approaches
- **Impact**: Estimate user benefit and development effort

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

### License Summary
- ✅ **Commercial Use**: Use in commercial projects
- ✅ **Modification**: Modify and adapt the code
- ✅ **Distribution**: Distribute original or modified versions
- ✅ **Private Use**: Use for private/personal projects
- ❗ **Liability**: No warranty or liability provided
- ❗ **Attribution**: Include original license and copyright

## 🙏 Acknowledgments

### Core Technologies
- **[Next.js Team](https://nextjs.org/)**: For the excellent React framework and developer experience
- **[shadcn/ui](https://ui.shadcn.com/)**: For the beautiful, accessible component library
- **[Radix UI](https://www.radix-ui.com/)**: For the unstyled, accessible primitives
- **[Tailwind CSS](https://tailwindcss.com/)**: For the utility-first CSS framework

### Libraries & Tools
- **[Recharts](https://recharts.org/)**: For powerful data visualization components
- **[Dexie](https://dexie.org/)**: For elegant IndexedDB wrapper
- **[jsPDF](https://github.com/parallax/jsPDF)**: For client-side PDF generation
- **[Lucide](https://lucide.dev/)**: For beautiful, consistent icons

### Community & Inspiration
- **Trading Community**: For valuable feedback and feature suggestions
- **Open Source Contributors**: For bug reports and improvements
- **Beta Testers**: For early feedback and testing

## 📞 Support & Community

### Getting Help
- **📚 Documentation**: Comprehensive README and inline code comments
- **🐛 Bug Reports**: [GitHub Issues](https://github.com/veindevttv/trading-checklist-app/issues)
- **💬 Discussions**: [GitHub Discussions](https://github.com/veindevttv/trading-checklist-app/discussions)
- **📧 Direct Contact**: Create an issue for direct support

### Community Guidelines
- **Be Respectful**: Treat all community members with respect
- **Stay On Topic**: Keep discussions relevant to the project
- **Help Others**: Share knowledge and assist fellow traders
- **Provide Feedback**: Constructive feedback helps improve the project

### Roadmap & Future Features
- **Mobile App**: Native iOS/Android applications
- **Cloud Sync**: Optional cloud synchronization
- **Advanced Analytics**: Machine learning insights
- **Broker Integration**: Direct broker API connections
- **Social Features**: Strategy sharing community
- **Backtesting**: Historical strategy testing

---

## 🎯 Quick Start Summary

1. **🌐 Try Online**: Visit [trading-checklist-app.vercel.app](https://trading-checklist-app.vercel.app/)
2. **📱 Install Extension**: Load the Chrome extension for TradingView integration
3. **🎯 Select Strategy**: Choose or create your trading strategy
4. **✅ Complete Checklist**: Check conditions as they're met
5. **📊 Track Performance**: Monitor your results and improve over time

**Happy Trading! 📈**

*Remember: This tool is designed to help with analysis and decision-making. Always do your own research, practice proper risk management, and never risk more than you can afford to lose.*
