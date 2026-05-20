# Sanity CMS - Quick Start Checklist

Follow these steps to get your Sanity CMS up and running for product management.

## ✅ Setup Checklist

### 1. Prerequisites

- [ ] Node.js installed (v18 or higher)
- [ ] pnpm package manager installed
- [ ] Git repository cloned
- [ ] Basic understanding of the project structure

### 2. Sanity Account Setup

- [ ] Create account at [sanity.io](https://sanity.io)
- [ ] Verify your email address
- [ ] Login to Sanity dashboard

### 3. Project Configuration

#### Option A: Create New Sanity Project

```bash
# Login to Sanity
pnpm sanity login

# Initialize new project
pnpm sanity init

# Follow prompts:
# - Create new project: Yes
# - Project name: Laptop Point Bangladesh
# - Dataset: production
# - Keep the Project ID that's generated
```

#### Option B: Use Existing Project

```bash
# Login to Sanity
pnpm sanity login

# Link to existing project
pnpm sanity init
# Select: "Select project to use"
# Choose your existing project
```

### 4. Get Your Credentials

- [ ] **Project ID**:
  - Go to [sanity.io/manage](https://sanity.io/manage)
  - Select your project
  - Copy the Project ID

- [ ] **API Token**:
  - In project dashboard, go to "API" tab
  - Click "Tokens" section
  - Click "+ Add API Token"
  - Token name: "Production Write Token"
  - Permissions: **Editor**
  - Copy the token (you'll only see it once!)

### 5. Environment Setup

- [ ] Copy `.env.example` to `.env.local`:

  ```bash
  cp .env.example .env.local
  ```

- [ ] Edit `.env.local` and replace placeholders:

  ```env
  NEXT_PUBLIC_SANITY_PROJECT_ID=abc123xyz  # Your actual project ID
  NEXT_PUBLIC_SANITY_DATASET=production
  NEXT_PUBLIC_SANITY_API_VERSION=2025-01-01
  SANITY_API_TOKEN=sk_xxxxxxxxxxxxx  # Your actual API token
  ```

- [ ] **Important**: Never commit `.env.local` to Git!

### 6. Deploy Schema to Sanity

- [ ] Deploy your product schema:

  ```bash
  pnpm sanity:deploy-schema
  ```

- [ ] Confirm deployment in terminal
- [ ] Verify schema in Sanity dashboard

### 7. Configure CORS (Production Only)

- [ ] Go to [sanity.io/manage](https://sanity.io/manage)
- [ ] Select your project
- [ ] Go to "API" tab → "CORS Origins"
- [ ] Click "+ Add CORS Origin"
- [ ] Add production URL: `https://yourdomain.com`
- [ ] Check "Allow credentials"
- [ ] Save

For local development, add:

- [ ] `http://localhost:3000`
- [ ] Check "Allow credentials"

### 8. Test Your Setup

- [ ] Start development server:

  ```bash
  pnpm dev
  ```

- [ ] Access Sanity Studio:
  - Open browser: `http://localhost:3000/studio`
  - You should see Sanity Studio login

- [ ] Login to Studio:
  - Use your Sanity credentials
  - You should see the dashboard

- [ ] Create test product:
  - Click "Product" in sidebar
  - Click "+ Create"
  - Fill in required fields
  - Upload a test image
  - Click "Publish"

- [ ] Verify on website:
  - Go to your shop page
  - Check if product appears
  - May take 30-60 seconds

### 9. Client Access Setup

- [ ] Create Sanity account for client:
  - Go to [sanity.io/manage](https://sanity.io/manage)
  - Select project
  - Go to "Members" tab
  - Click "+ Add member"
  - Enter client email
  - Role: **Administrator** or **Editor**
  - Send invitation

- [ ] Share documentation with client:
  - [ ] Send `docs/CLIENT_PRODUCT_MANAGEMENT_GUIDE.md`
  - [ ] Provide Studio URL: `https://yourdomain.com/studio`
  - [ ] Share login credentials (from invitation email)

### 10. Production Deployment

- [ ] Add environment variables to hosting platform:
  - Vercel/Netlify dashboard
  - Add all `NEXT_PUBLIC_SANITY_*` variables
  - Add `SANITY_API_TOKEN`

- [ ] Deploy application

- [ ] Test production Studio:
  - Visit `https://yourdomain.com/studio`
  - Login and verify functionality

## 🎯 Quick Commands Reference

```bash
# Login to Sanity
pnpm sanity login

# Deploy schema changes
pnpm sanity:deploy-schema

# Start development server
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start
```

## 🔍 Verification Tests

After setup, verify these work:

1. **Studio Access**:
   - [ ] Can access `/studio` route
   - [ ] Can login successfully
   - [ ] See Product content type

2. **Product Management**:
   - [ ] Can create new product
   - [ ] Can upload images
   - [ ] Can edit product
   - [ ] Can publish product

3. **Website Integration**:
   - [ ] Products appear on shop page
   - [ ] Images load correctly
   - [ ] Product details page works

4. **Client Access**:
   - [ ] Client can login to Studio
   - [ ] Client can manage products
   - [ ] Client changes appear on website

## 🆘 Common Issues

### "Project not found" error

**Solution**: Check `NEXT_PUBLIC_SANITY_PROJECT_ID` in `.env.local`

### "Unauthorized" error

**Solution**: Check `SANITY_API_TOKEN` and verify token has Editor permissions

### Images not uploading

**Solution**: Check CORS settings include your domain

### Changes not appearing on website

**Solution**:

- Wait 30-60 seconds
- Hard refresh browser (Ctrl+Shift+R)
- Check product status is "Active"

### Can't access Studio

**Solution**:

- Verify `.env.local` exists and has correct values
- Restart development server
- Clear browser cache

## 📚 Next Steps

Once setup is complete:

1. **Read Documentation**:
   - [ ] `docs/SANITY_CMS_SETUP.md` - Technical guide
   - [ ] `docs/CLIENT_PRODUCT_MANAGEMENT_GUIDE.md` - Client guide

2. **Import Existing Products** (if applicable):
   - Use Sanity import tools
   - Or manually create products in Studio

3. **Train Client**:
   - Walk through product creation process
   - Show how to upload images
   - Explain product status workflow

4. **Set Up Workflows**:
   - Define who can publish products
   - Set up review process (if needed)
   - Configure notifications

5. **Monitor Usage**:
   - Check Sanity usage dashboard
   - Review API usage
   - Monitor storage limits

## 🎉 Success Criteria

You're all set when:

- ✅ Studio is accessible at `/studio`
- ✅ Products can be created and published
- ✅ Images upload successfully
- ✅ Products appear on website
- ✅ Client has access and knows how to use Studio
- ✅ Production environment is configured

---

**Need help?** Check:

- Sanity docs: https://www.sanity.io/docs
- Project documentation in `/docs` folder
- Sanity community: https://www.sanity.io/exchange/community

**Estimated setup time**: 30-45 minutes
