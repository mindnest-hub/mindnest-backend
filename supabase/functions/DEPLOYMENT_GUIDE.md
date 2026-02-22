# Supabase Edge Function Deployment Guide

## Prerequisites
- Supabase CLI installed (`npm install -g supabase`)
- Supabase project created
- OpenAI API key

## Step 1: Install Supabase CLI (if not already installed)
```bash
npm install -g supabase
```

## Step 2: Login to Supabase
```bash
supabase login
```

## Step 3: Link to Your Project
```bash
cd african-edu-backend
supabase link --project-ref YOUR_PROJECT_REF
```

## Step 4: Set Environment Secrets
In your Supabase Dashboard:
1. Go to **Project Settings** → **Edge Functions** → **Secrets**
2. Add the following secrets:
   - `OPENAI_API_KEY`: Your OpenAI API key
   - `SUPABASE_URL`: Your Supabase project URL (auto-available)
   - `SUPABASE_SERVICE_ROLE_KEY`: Your service role key (auto-available)

## Step 5: Deploy the Edge Function
```bash
supabase functions deploy chat
```

## Step 6: Test the Function
```bash
curl -i --location --request POST 'https://YOUR_PROJECT_ID.functions.supabase.co/chat' \
  --header 'Content-Type: application/json' \
  --data '{"message":"How can I start a business?","userId":"test-user-id"}'
```

## Step 7: Update Frontend Environment
In `african-edu-app/.env`, ensure you have:
```
VITE_SUPABASE_URL="https://YOUR_PROJECT_REF.supabase.co"
VITE_SUPABASE_ANON_KEY="YOUR_ANON_KEY"
```

## Verification
- Check the Supabase Functions dashboard to see deployment status
- Monitor function logs in the Supabase dashboard
- Verify that conversations appear in the `ai_conversations` table after testing

## Troubleshooting
- If deployment fails, check that you're in the correct directory
- Ensure all environment secrets are set correctly
- Check function logs for runtime errors
