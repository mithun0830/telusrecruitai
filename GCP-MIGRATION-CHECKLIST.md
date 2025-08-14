# 🔄 GCP Account Migration Checklist

## 📋 **Migration Overview**

Migrating TelusRecruitAI from expired GCP account to new active account.

### **🔄 Configuration Changes:**

| Component | Old Value | New Value | Status |
|-----------|-----------|-----------|---------|
| **Project ID** | `telusrecruitai` | `telusrecruitai-468907` | ✅ Updated |
| **Project Number** | `865090871947` | `380738819308` | ✅ Updated |
| **Region** | `asia-south1` | `asia-south1` | ✅ Same |
| **Service Name** | `telusrecruitai` | `telusrecruitai` | ✅ Same |
| **Registry** | `gcr.io/telusrecruitai/` | `gcr.io/telusrecruitai-468907/` | ✅ Updated |

## ✅ **Completed Tasks**

### **📁 Configuration Files Updated:**
- ✅ `deploy-cached.sh` - Updated project ID and number
- ✅ `.github/workflows/manual-deploy.yml` - Updated default values
- ✅ `cloudbuild-cached.yaml` - Updated project references and registry
- ✅ `GITHUB-ACTIONS-SETUP.md` - Updated documentation

### **🔧 Technical Changes:**
- ✅ **Project validation** updated for new project
- ✅ **Docker registry URLs** updated to new GCR path
- ✅ **URL patterns** updated for new project number
- ✅ **Service account configuration** added to all deployment scripts
- ✅ **Service account references** updated in documentation

## 🚀 **Next Steps Required**

### **1. 🔐 GitHub Secrets Update**

Navigate to: **GitHub Repository → Settings → Secrets and variables → Actions**

#### **Required Secret Updates:**

| Secret Name | Action | New Value |
|-------------|--------|-----------|
| `GCP_PROJECT_ID` | Update | `telusrecruitai-468907` |
| `GCP_PROJECT_NUMBER` | Update | `380738819308` |
| `GCP_SERVICE_ACCOUNT_KEY` | **Replace** | New service account key (see below) |

#### **Secrets to Keep (No Change):**
- ✅ `REACT_APP_ONELOGIN_CLIENT_ID` - Keep existing
- ✅ `REACT_APP_ONELOGIN_CLIENT_SECRET` - Keep existing
- ✅ `GCP_REGION` - Keep existing (`asia-south1`)
- ✅ `SERVICE_NAME` - Keep existing (`telusrecruitai`)
- ✅ `IMAGE_NAME` - Keep existing (`telusrecruitai`)

### **2. 🛡️ Service Account Setup**

#### **Option A: Use Existing Service Account (Recommended)**
Since you already have `cloud-run-deployer@telusrecruitai-468907.iam.gserviceaccount.com` working for your backend:

```bash
# Set project context
gcloud config set project telusrecruitai-468907

# Create new key for existing service account
gcloud iam service-accounts keys create github-actions-key.json \
    --iam-account=cloud-run-deployer@telusrecruitai-468907.iam.gserviceaccount.com

# Encode for GitHub secret
base64 github-actions-key.json > github-actions-key-base64.txt

# Copy content to GCP_SERVICE_ACCOUNT_KEY secret
cat github-actions-key-base64.txt

# Clean up local files
rm github-actions-key.json github-actions-key-base64.txt
```

#### **Option B: Create New Service Account**
If you prefer a separate service account for frontend:

```bash
# Create new service account
gcloud iam service-accounts create frontend-deployer \
    --description="Service account for frontend deployments" \
    --display-name="Frontend Deployer" \
    --project=telusrecruitai-468907

# Grant required permissions
PROJECT_ID="telusrecruitai-468907"
SERVICE_ACCOUNT="frontend-deployer@${PROJECT_ID}.iam.gserviceaccount.com"

gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:$SERVICE_ACCOUNT" \
    --role="roles/run.admin"

gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:$SERVICE_ACCOUNT" \
    --role="roles/storage.admin"

gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:$SERVICE_ACCOUNT" \
    --role="roles/viewer"

# Create and encode key
gcloud iam service-accounts keys create github-actions-key.json \
    --iam-account=$SERVICE_ACCOUNT

base64 github-actions-key.json > github-actions-key-base64.txt
cat github-actions-key-base64.txt
rm github-actions-key.json github-actions-key-base64.txt
```

### **3. 🧪 Testing & Validation**

#### **Step 1: Test Local Deployment**
```bash
# Ensure you're authenticated to new project
gcloud auth login
gcloud config set project telusrecruitai-468907

# Test optimized deployment script
./deploy-cached.sh
```

**Expected Results:**
- ✅ Project validation passes
- ✅ Docker build completes
- ✅ Image pushes to `gcr.io/telusrecruitai-468907/telusrecruitai`
- ✅ Service deploys successfully
- ✅ URL accessible: `https://telusrecruitai-468907.asia-south1.run.app`

#### **Step 2: Test GitHub Actions**
1. **Update GitHub secrets** with new values
2. **Go to Actions tab** in GitHub repository
3. **Run "Manual Production Deployment"** workflow
4. **Select a test branch** (e.g., `develop` or feature branch)
5. **Monitor deployment** progress

**Expected Results:**
- ✅ Authentication succeeds
- ✅ Project validation passes
- ✅ Build completes with caching
- ✅ Deployment succeeds
- ✅ URL validation passes

### **4. 🔍 Verification Checklist**

#### **Local Deployment Verification:**
- [ ] `gcloud config get-value project` returns `telusrecruitai-468907`
- [ ] `./deploy-cached.sh` completes successfully
- [ ] Service accessible at new URL
- [ ] Performance metrics show ~79% improvement

#### **GitHub Actions Verification:**
- [ ] All secrets updated in GitHub repository
- [ ] Workflow runs without authentication errors
- [ ] Build uses correct project and registry
- [ ] Deployment succeeds to new project
- [ ] URL validation passes

#### **Service Verification:**
- [ ] Frontend application loads correctly
- [ ] OneLogin authentication works
- [ ] API connections function properly
- [ ] All features work as expected

## 🎯 **Expected URLs After Migration**

### **New Service URLs:**
- **Primary**: `https://telusrecruitai-380738819308.asia-south1.run.app`
- **Alternative**: `https://telusrecruitai-zakjibmkga-el.a.run.app` (if different)

### **Registry URLs:**
- **Images**: `gcr.io/telusrecruitai-468907/telusrecruitai:latest`
- **Cache**: Layer caching from same registry

## 🚨 **Troubleshooting**

### **Common Issues:**

#### **1. Authentication Errors**
```
Error: Project not found or access denied
```
**Solution**: Verify you're authenticated to the new project:
```bash
gcloud auth login
gcloud config set project telusrecruitai-468907
```

#### **2. Service Account Permissions**
```
Error: Permission denied on Cloud Run
```
**Solution**: Ensure service account has required roles:
- `roles/run.admin`
- `roles/storage.admin`
- `roles/viewer`

#### **3. GitHub Actions Failures**
```
Error: Invalid service account key
```
**Solution**: Re-create and re-encode service account key:
```bash
gcloud iam service-accounts keys create new-key.json --iam-account=SERVICE_ACCOUNT
base64 new-key.json
```

#### **4. Registry Access Issues**
```
Error: Failed to push to gcr.io
```
**Solution**: Configure Docker authentication:
```bash
gcloud auth configure-docker --quiet
```

## 📊 **Migration Benefits**

### **✅ What You Keep:**
- ✅ **Same performance** (79% faster deployments)
- ✅ **All optimizations** (caching, BuildKit, etc.)
- ✅ **Same workflows** (local + GitHub Actions)
- ✅ **Same service name** and functionality
- ✅ **All documentation** and setup guides

### **🔄 What Changes:**
- 🔄 **Project references** in URLs and configs
- 🔄 **Registry paths** for Docker images
- 🔄 **Service account** credentials
- 🔄 **GitHub secrets** values

## 🎉 **Success Criteria**

Migration is complete when:

1. ✅ **Local deployment** works with `./deploy-cached.sh`
2. ✅ **GitHub Actions** deploys successfully
3. ✅ **Service is accessible** at new URL
4. ✅ **Application functions** correctly
5. ✅ **Performance maintained** (79% improvement)
6. ✅ **All team members** can deploy via GitHub

---

## 🚀 **Ready to Complete Migration?**

Follow the steps above in order:
1. **Update GitHub secrets** (5 minutes)
2. **Set up service account** (10 minutes)
3. **Test local deployment** (5 minutes)
4. **Test GitHub Actions** (10 minutes)
5. **Verify everything works** (10 minutes)

**Total time**: ~40 minutes for complete migration! 🎯

Your optimized CI/CD pipeline will work exactly the same, just pointing to the new active GCP account! 🚀
