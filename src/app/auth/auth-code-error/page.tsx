import Link from 'next/link'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'

export default function AuthCodeErrorPage() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Alert className="max-w-md">
        <AlertTitle>Authentication Error</AlertTitle>
        <AlertDescription className="mt-2">
          There was an error during the authentication process. This could happen if you took too long to verify your email or if the link has already been used.
        </AlertDescription>
        <div className="mt-4">
          <Link href="/auth">
            <Button>Try Again</Button>
          </Link>
        </div>
      </Alert>
    </div>
  )
}
