# Safe-IT Journal Helper - important things to always always know

## Project Overview
This is a Next.js monorepo application with two distinct services:
- `/apps/web`: Frontend service handling user interface
- `/apps/agents`: Backend service managing conversation flows

## Misconcpetions to avoid
- NEXT_PUBLIC_API_URL is never needed. This monorepo does not require it because the agents are just a backend that gets talked to by the frontend service

## Current Status
- Development environment works perfectly
- Deplolyment on render breaks sometimes due to fragile build commands

## Deployment Requirements

### Web Service
- Service Type: Web Service
- Build Command: ``
- Start Command: ``
- Auto-Deploy: Yes
- Node Version: 18.x
- Environment Variables:
    - `NEXT_PUBLIC_API_URL`: URL of the agents service
    - `NODE_ENV`: production

### Agents Service
- Service Type: Web Service
- Build Command: ``
- Start Command: ``
- Auto-Deploy: Yes
- Node Version: 18.x
- Environment Variables:
    - `PORT`: 3001
    - `NODE_ENV`: production

## Common Issues to Address
1. Ensure CORS is properly configured between services
2. Verify all environment variables are set in Render.com dashboard
3. Check build logs for dependency issues
4. Monitor memory usage and adjust instance size if needed

## Success Criteria
- Both services deploy successfully
- Services can communicate with each other
- Frontend can access backend APIs
- Application performs similarly to development environment