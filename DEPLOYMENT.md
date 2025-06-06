# GitHub Pages Deployment Guide

This guide will help you deploy your Trading Checklist App to GitHub Pages.

## Prerequisites

- A GitHub account
- Your code pushed to a GitHub repository

## Step-by-Step Deployment

### 1. Enable GitHub Pages

1. Go to your GitHub repository
2. Click on **Settings** tab
3. Scroll down to **Pages** section in the left sidebar
4. Under **Source**, select **GitHub Actions**

### 2. Configure Repository Settings

Make sure your repository has the following settings:
- The main branch should be named `main` (not `master`)
- The GitHub Actions workflow file is present at `.github/workflows/deploy.yml`

### 3. Push Your Code

Push your code to the main branch:

```bash
git add .
git commit -m "Configure for GitHub Pages deployment"
git push origin main
```

### 4. Monitor Deployment

1. Go to the **Actions** tab in your GitHub repository
2. You should see a workflow run called "Deploy to GitHub Pages"
3. Wait for it to complete (usually takes 2-3 minutes)

### 5. Access Your Site

Once deployment is complete:
1. Go back to **Settings** → **Pages**
2. You'll see a green checkmark and a link to your live site
3. Your site will be available at: `https://[your-username].github.io/[repository-name]/`

## Troubleshooting

### Common Issues

1. **404 Error**: Make sure GitHub Pages is set to use "GitHub Actions" as the source
2. **Build Fails**: Check the Actions tab for error details
3. **Blank Page**: Ensure all dependencies are properly installed and the build completes successfully

### Manual Testing

To test the build locally before deploying:

```bash
# Build the static export
npm run export

# The files will be in the 'out' directory
# You can serve them locally with any static file server
```

### Force Redeploy

If you need to force a redeploy:
1. Go to Actions tab
2. Click "Re-run all jobs" on the latest workflow run
3. Or make a small commit and push to trigger a new deployment

## Custom Domain (Optional)

To use a custom domain:
1. Add a `CNAME` file to the `public/` directory with your domain name
2. Configure your domain's DNS to point to GitHub Pages
3. Update the repository settings under Pages → Custom domain

## Support

If you encounter issues:
1. Check the GitHub Actions logs for detailed error messages
2. Ensure all dependencies are compatible with static export
3. Verify that no server-side features are being used 