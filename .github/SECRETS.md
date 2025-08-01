# Required GitHub Secrets

## Vercel
- `VERCEL_TOKEN`: Your Vercel API token
- `VERCEL_ORG_ID`: Your Vercel organization ID
- `VERCEL_PROJECT_ID`: Your Vercel project ID

## Supabase
- `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase anonymous key
- `SUPABASE_SERVICE_KEY`: Your Supabase service role key
- `SUPABASE_ACCESS_TOKEN`: For Supabase CLI
- `SUPABASE_DB_PASSWORD`: Database password
- `SUPABASE_PROJECT_ID`: Your Supabase project ID

## OpenAI
- `OPENAI_API_KEY`: Your OpenAI API key

## Code Quality
- `SONAR_TOKEN`: SonarCloud token (optional)
- `CODECOV_TOKEN`: Codecov token (optional)
- `SNYK_TOKEN`: Snyk token for security scanning (optional)

## Notifications
- `SLACK_WEBHOOK`: Slack webhook URL for notifications (optional)

## AWS (for backups - optional)
- `AWS_S3_BUCKET`: S3 bucket name
- `AWS_ACCESS_KEY_ID`: AWS access key
- `AWS_SECRET_ACCESS_KEY`: AWS secret key

# Branch Protection Rules

## Main Branch
- Require pull request reviews before merging
- Require status checks to pass before merging:
  - lint
  - test
  - build
  - security
- Require branches to be up to date before merging
- Include administrators
- Restrict who can push to matching branches

## Develop Branch
- Require status checks to pass before merging:
  - lint
  - test
- Require branches to be up to date before merging
