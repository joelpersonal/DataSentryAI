# DataSentry AI - Deployment Guide

## 🚀 Quick Deployment on Vercel (Free Tier)

### Prerequisites
- GitHub account
- Vercel account (free)
- OpenAI API key

### Step 1: Prepare Your Repository

1. **Push to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit: DataSentry AI"
   git branch -M main
   git remote add origin https://github.com/yourusername/datasentry-ai.git
   git push -u origin main
   ```

### Step 2: Deploy Backend

1. **Connect to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository

2. **Configure Environment Variables**
   ```
   OPENAI_API_KEY=your_openai_api_key_here
   NODE_ENV=production
   FRONTEND_URL=https://your-frontend-url.vercel.app
   ```

3. **Deploy**
   - Vercel will automatically detect the configuration
   - Backend will be deployed to: `https://your-project-api.vercel.app`

### Step 3: Deploy Frontend

1. **Update Frontend Environment**
   Create `frontend/.env.production`:
   ```
   VITE_API_URL=https://your-project-api.vercel.app/api
   VITE_APP_NAME=DataSentry AI
   VITE_ENABLE_AI_COPILOT=true
   ```

2. **Deploy Frontend**
   - Create a separate Vercel project for frontend
   - Set build command: `cd frontend && npm run build`
   - Set output directory: `frontend/dist`
   - Frontend will be deployed to: `https://your-frontend.vercel.app`

### Step 4: Update CORS Settings

Update backend environment variable:
```
FRONTEND_URL=https://your-frontend.vercel.app
```

## 🔧 Alternative Deployment Options

### Option 1: Single Vercel Deployment (Monorepo)

Use the provided `vercel.json` configuration:

1. **Root Level Deployment**
   ```bash
   # Deploy entire project as monorepo
   vercel --prod
   ```

2. **Environment Variables**
   ```
   OPENAI_API_KEY=your_key_here
   NODE_ENV=production
   FRONTEND_URL=https://your-project.vercel.app
   ```

### Option 2: Separate Hosting

**Backend Options:**
- Railway
- Render
- Heroku
- DigitalOcean App Platform

**Frontend Options:**
- Netlify
- GitHub Pages
- Surge.sh
- Firebase Hosting

## 🌐 Custom Domain Setup

1. **Add Custom Domain in Vercel**
   - Go to Project Settings → Domains
   - Add your custom domain
   - Update DNS records as instructed

2. **Update Environment Variables**
   ```
   FRONTEND_URL=https://yourdomain.com
   ```

## 📊 Production Optimizations

### Backend Optimizations

1. **Add Database (Optional)**
   ```javascript
   // Replace in-memory storage with database
   // Options: MongoDB, PostgreSQL, Redis
   ```

2. **Add Caching**
   ```javascript
   // Add Redis for caching analysis results
   const redis = require('redis');
   const client = redis.createClient(process.env.REDIS_URL);
   ```

3. **File Storage**
   ```javascript
   // Use cloud storage instead of local files
   // Options: AWS S3, Google Cloud Storage, Cloudinary
   ```

### Frontend Optimizations

1. **Enable PWA**
   ```bash
   npm install vite-plugin-pwa
   ```

2. **Add Analytics**
   ```javascript
   // Add Google Analytics or similar
   ```

3. **Performance Monitoring**
   ```javascript
   // Add Sentry or similar error tracking
   ```

## 🔒 Security Considerations

### Production Security Checklist

- [ ] Enable HTTPS (automatic with Vercel)
- [ ] Set secure CORS origins
- [ ] Add rate limiting (already included)
- [ ] Validate file uploads
- [ ] Sanitize user inputs
- [ ] Add authentication (if needed)
- [ ] Monitor API usage
- [ ] Set up error logging

### Environment Variables Security

```bash
# Never commit these to git
OPENAI_API_KEY=sk-...
DATABASE_URL=postgresql://...
REDIS_URL=redis://...
JWT_SECRET=your-secret-key
```

## 📈 Monitoring & Analytics

### Health Checks

The app includes a health check endpoint:
```
GET /api/health
```

### Logging

Add structured logging:
```javascript
const winston = require('winston');
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'error.log', level: 'error' })
  ]
});
```

## 🚨 Troubleshooting

### Common Issues

1. **CORS Errors**
   - Check FRONTEND_URL environment variable
   - Verify domain matches exactly

2. **OpenAI API Errors**
   - Verify API key is correct
   - Check API quota and billing

3. **File Upload Issues**
   - Check file size limits
   - Verify multer configuration

4. **Build Failures**
   - Check Node.js version compatibility
   - Verify all dependencies are installed

### Debug Commands

```bash
# Check backend health
curl https://your-api.vercel.app/api/health

# Check frontend build
cd frontend && npm run build

# Test API locally
cd backend && npm run dev
```

## 📞 Support

For deployment issues:
1. Check Vercel deployment logs
2. Review browser console for errors
3. Test API endpoints individually
4. Verify environment variables

## 🎯 Production Checklist

- [ ] Backend deployed and accessible
- [ ] Frontend deployed and accessible
- [ ] Environment variables configured
- [ ] CORS properly configured
- [ ] File uploads working
- [ ] AI features functional
- [ ] Error handling working
- [ ] Performance acceptable
- [ ] Security measures in place
- [ ] Monitoring configured

Your DataSentry AI application is now ready for production use! 🎉