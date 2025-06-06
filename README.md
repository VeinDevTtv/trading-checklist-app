# A+ Trade Checklist

A comprehensive trading checklist application built with Next.js that helps traders make confident trading decisions using multiple strategies with a weighted scoring system.

## Features

- **Multiple Trading Strategies**: Pre-built strategies including ICT 2022 Entry, Regular Price Action, and Supply & Demand
- **Custom Strategy Builder**: Create and edit your own trading strategies
- **Weighted Scoring System**: Conditions are weighted by importance (High, Medium, Low)
- **A+ Trade Verification**: Automatically determines if a setup qualifies as an A+ trade
- **Trade History**: Keep track of all your analyzed trades
- **PDF Export**: Export your checklist analysis as a PDF
- **Responsive Design**: Works on desktop and mobile devices

## Getting Started

### Development

First, install the dependencies:

```bash
npm install
```

Then, run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

### Building for Production

To build the application for production:

```bash
npm run build
```

To export as static files (for GitHub Pages):

```bash
npm run export
```

## Deployment to GitHub Pages

This application is configured for automatic deployment to GitHub Pages using GitHub Actions.

### Setup Instructions

1. **Enable GitHub Pages** in your repository settings:
   - Go to Settings → Pages
   - Set Source to "GitHub Actions"

2. **Push to main branch**: The deployment will trigger automatically when you push to the main branch.

3. **Access your site**: After deployment, your site will be available at:
   ```
   https://[your-username].github.io/[repository-name]/
   ```

### Manual Deployment

If you prefer to deploy manually:

1. Build the static export:
   ```bash
   npm run export
   ```

2. The static files will be generated in the `out/` directory

3. Deploy the contents of the `out/` directory to your hosting provider

## How to Use

1. **Select a Strategy**: Choose from pre-built strategies or create your own
2. **Check Conditions**: Go through each condition and check those that are met
3. **Add Notes**: Include any additional observations or notes
4. **Review Score**: The app calculates a weighted score and determines if it's an A+ trade
5. **Save Trade**: Log the trade for future reference
6. **Export PDF**: Generate a PDF report of your analysis

## Technologies Used

- **Next.js 15** - React framework with App Router
- **TypeScript** - Type safety and better development experience
- **Tailwind CSS** - Utility-first CSS framework
- **Shadcn/ui** - Beautiful and accessible UI components
- **jsPDF** - PDF generation for trade reports
- **Radix UI** - Headless UI components for accessibility

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is open source and available under the [MIT License](LICENSE).
