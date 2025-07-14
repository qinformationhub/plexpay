# PlexPay Deployment Guide

## Production Build

This guide will help you create a perfect production build of the PlexPay application.

### Prerequisites

- Node.js 18+
- npm or yarn
- All dependencies installed (`npm install`)

### Build Process

1. **Clean and Build**

   ```bash
   npm run clean
   npm run build
   ```

2. **Verify Build Output**
   The build process will create:
   - `dist/index.js` - Server bundle
   - `dist/public/` - Client assets
   - `dist/public/index.html` - Main HTML file
   - `dist/public/assets/` - JavaScript and CSS bundles

### Production Deployment

1. **Start Production Server**

   ```bash
   npm start
   ```

2. **Environment Variables**
   Create a `.env` file with:

   ```
   NODE_ENV=production
   PORT=3000
   # Add your database and other configuration
   ```

3. **Server Configuration**
   - The server runs on port 3000 by default
   - Static files are served from `dist/public/`
   - API routes are available at `/api/*`
   - All other routes serve the React app

### Build Optimizations

The production build includes:

- **Code Splitting**: Vendor, UI, charts, and forms are split into separate chunks
- **Minification**: All JavaScript and CSS is minified using Terser
- **Compression**: Gzip compression enabled for all responses
- **Security**: Helmet.js security headers
- **Performance**: Optimized bundle sizes and caching

### Troubleshooting

**Issue**: Getting static files instead of the app

- **Solution**: Ensure the build completed successfully and `dist/public/index.html` exists

**Issue**: Server not starting

- **Solution**: Check that `dist/index.js` exists and all dependencies are installed

**Issue**: Assets not loading

- **Solution**: Verify the static file serving path in `server/vite.ts`

### File Structure After Build

```
dist/
├── index.js              # Server bundle
└── public/               # Client assets
    ├── index.html        # Main HTML file
    └── assets/           # JavaScript and CSS bundles
        ├── index-*.js    # Main app bundle
        ├── vendor-*.js   # Vendor libraries
        ├── ui-*.js       # UI components
        ├── charts-*.js   # Chart libraries
        ├── forms-*.js    # Form libraries
        └── index-*.css   # Styles
```

### Performance Monitoring

The build script provides:

- Bundle size analysis
- Build verification
- Error reporting

Run `npm run build` to see detailed build information.
