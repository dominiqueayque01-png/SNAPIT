# Deploying SNAP! STUDIO to Microsoft Azure
## Architecture: Azure Static Web Apps (Frontend) + Azure Container Apps (Backend) + Azure Blob Storage

This guide deploys:
1. **Azure Blob Storage** — Permanent cloud storage for high-res Polaroid strips, thumbnails, and custom stickers.
2. **Azure Container Apps (ACA)** — Serverless scale-to-zero Node 24 + Express + Sharp API backend.
3. **Azure Static Web Apps (SWA)** — Global CDN hosting for the React 19 + Vite frontend, linked directly to your Container App backend for zero-CORS `/api/*` and `/s/*` routing.

---

## 1. Prerequisites
- [Azure CLI](https://learn.microsoft.com/en-us/cli/azure/install-azure-cli) installed (`az login`).
- An active Azure subscription (Free Tier / Azure for Students works great!).

---

## 2. Create Core Azure Resources

```bash
# Set your preferred names & region
RG="rg-snapit-photobooth"
LOC="eastasia"                      # or southeastasia / eastus
STORAGE="stsnapit$RANDOM"           # must be globally unique, lowercase
ACR="acrsnapit$RANDOM"              # must be globally unique, lowercase
ENV="cae-snapit-env"
APP="ca-snapit-api"
SWA="swa-snapit-studio"

# 1. Create Resource Group
az group create --name $RG --location $LOC

# 2. Create Azure Storage Account + Public Blob Container
az storage account create \
  --name $STORAGE \
  --resource-group $RG \
  --location $LOC \
  --sku Standard_LRS \
  --allow-blob-public-access true

CONN_STR=$(az storage account show-connection-string \
  --name $STORAGE \
  --resource-group $RG \
  --query connectionString -o tsv)

az storage container create \
  --name photobooth-strips \
  --connection-string "$CONN_STR" \
  --public-access blob
```

---

## 3. Build & Deploy the Backend (`Photobooth-backend` Repo) to Azure Container Apps

Clone your separate backend repository (`Photobooth-backend`) in Azure Cloud Shell and run:

```bash
# 3. Create Azure Container Registry (ACR) and build Docker image in the cloud
az acr create --resource-group $RG --name $ACR --sku Basic --admin-enabled true
az acr build --registry $ACR --image snap-studio-api:latest .

# 4. Create Container Apps Environment
az containerapp env create \
  --name $ENV \
  --resource-group $RG \
  --location $LOC

# 5. Deploy Container App (Scale-to-Zero enabled: --min-replicas 0)
az containerapp create \
  --name $APP \
  --resource-group $RG \
  --environment $ENV \
  --image $ACR.azurecr.io/snap-studio-api:latest \
  --registry-server $ACR.azurecr.io \
  --target-port 3001 \
  --ingress external \
  --min-replicas 0 \
  --max-replicas 3 \
  --env-vars \
    STORAGE_DRIVER=azure_blob \
    AZURE_CONTAINER_NAME=photobooth-strips \
    AZURE_STORAGE_CONNECTION_STRING="$CONN_STR"
```

Note the backend FQDN returned by the command (e.g., `https://ca-snapit-api.xxxx.eastasia.azurecontainerapps.io`).
Verify health:
```bash
curl https://<YOUR-ACA-FQDN>/api/v1/health
```

---

## 4. Deploy the Frontend to Azure Static Web Apps & Link Backend

```bash
# 6. Create Azure Static Web App connected to your GitHub repo
az staticwebapp create \
  --name $SWA \
  --resource-group $RG \
  --location $LOC \
  --sku Standard

# 7. Link Container App to Static Web App (Zero CORS — proxies /api/* and /s/*)
ACA_ID=$(az containerapp show --name $APP --resource-group $RG --query id -o tsv)

az staticwebapp backends link \
  --name $SWA \
  --resource-group $RG \
  --backend-resource-id "$ACA_ID" \
  --backend-region $LOC
```

Finally, set `PUBLIC_BASE_URL` on your Container App to your Static Web App URL (e.g. `https://<your-swa>.azurestaticapps.net`) so every QR code points to your unified HTTPS domain:

```bash
SWA_HOST=$(az staticwebapp show --name $SWA --resource-group $RG --query defaultHostname -o tsv)

az containerapp update \
  --name $APP \
  --resource-group $RG \
  --set-env-vars PUBLIC_BASE_URL="https://$SWA_HOST"
```

> **Tip (Free Tier SWA):** If you use the **Free** SKU for Static Web Apps instead of **Standard** (Linked Backends requires Standard), simply set GitHub Repository Variable `VITE_API_BASE_URL=https://<YOUR-ACA-FQDN>` and your frontend will talk directly to your Container App over HTTPS!

---

## 5. Automated GitHub Actions Secrets
Add these in **GitHub Repo → Settings → Secrets and variables → Actions**:
- `AZURE_STATIC_WEB_APPS_API_TOKEN` (from SWA Portal → Manage deployment token)
- `AZURE_CREDENTIALS` (Service Principal JSON from `az ad sp create-for-rbac --sdk-auth`)
- `AZURE_RESOURCE_GROUP`, `AZURE_ACR_NAME`, `AZURE_CONTAINER_APP_NAME`
- Repository Variable: `AZURE_ACA_ENABLED=true`
