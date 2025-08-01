import { Octokit } from '@octokit/rest'
import { NextResponse } from 'next/server'

const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN,
})

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const action = searchParams.get('action')

  try {
    switch (action) {
      case 'user':
        const { data: user } = await octokit.users.getAuthenticated()
        return NextResponse.json({ user })

      case 'repos':
        const { data: repos } = await octokit.repos.listForAuthenticatedUser({
          sort: 'updated',
          per_page: 10,
        })
        return NextResponse.json({ repos })

      default:
        return NextResponse.json({ error: '잘못된 액션입니다' }, { status: 400 })
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request: Request) {
  const body = await request.json()
  
  try {
    switch (body.action) {
      case 'create-repo':
        const { data: repo } = await octokit.repos.createForAuthenticatedUser({
          name: body.name,
          description: body.description,
          private: body.private || false,
          auto_init: true,
        })
        return NextResponse.json({ repo })

      case 'create-issue':
        const { data: issue } = await octokit.issues.create({
          owner: body.owner,
          repo: body.repo,
          title: body.title,
          body: body.body,
        })
        return NextResponse.json({ issue })

      default:
        return NextResponse.json({ error: '잘못된 액션입니다' }, { status: 400 })
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
