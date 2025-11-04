import { NextResponse } from 'next/server'
import OpenAI from 'openai'

export async function POST(req: Request) {
  try {
    const { text, existingProjects = [] } = await req.json()
    
    // Use server-side environment variable (not NEXT_PUBLIC)
    const apiKey = process.env.OPENAI_API_KEY || process.env.NEXT_PUBLIC_OPENAI_API_KEY
    
    if (!apiKey) {
      return NextResponse.json(
        { error: 'OpenAI API key not configured' }, 
        { status: 500 }
      )
    }

    const openai = new OpenAI({ 
      apiKey,
      // No dangerouslyAllowBrowser needed on server
    })

    const projectsList = existingProjects.length > 0 
      ? `\n\nExisting projects:\n${existingProjects.map((p: any) => `- ${p.name}: ${p.description ?? ''}`).join('\n')}`
      : ''

    const systemPrompt = `You are an AI assistant that helps convert natural language into structured tasks and projects for a CRM system managing a kids cubing program. Always respond with valid JSON only.`

    const userPrompt = `Input text: "${text}"${projectsList}

Please analyze this input and determine if this should:
1. Create individual tasks for an existing project
2. Create a new project with tasks
3. Create standalone tasks

Return a JSON response in this exact format:

For individual tasks:
{
  "type": "tasks",
  "projectId": "existing-project-id-if-applicable",
  "projectName": "project-name-if-specified",
  "tasks": [
    {
      "title": "Clear, actionable task title",
      "description": "Detailed description of what needs to be done",
      "priority": "high|medium|low",
      "estimatedHours": 2.5,
      "dueDate": "2024-01-15",
      "assignedTo": "person-name-if-mentioned",
      "tags": ["tag1", "tag2"],
      "subtasks": [
        {
          "title": "Subtask title",
          "description": "Subtask description",
          "estimated_minutes": 30
        }
      ]
    }
  ]
}

For a new project:
{
  "type": "project", 
  "project": {
    "name": "Project Name",
    "description": "Project description",
    "priority": "high|medium|low",
    "estimatedDuration": "2 weeks",
    "dueDate": "2024-02-01",
    "tags": ["tag1", "tag2"],
    "tasks": [
      // Array of task objects as above
    ]
  }
}

Guidelines:
- Break down complex requests into specific, actionable tasks
- Set realistic priority levels based on urgency indicators
- Extract due dates from phrases like "by Friday", "next week", "urgent"
- Identify assignees from names mentioned
- Create relevant tags based on the content type
- For projects, include 3-8 well-defined tasks
- Estimate hours realistically (simple tasks: 0.5-2h, complex: 4-8h)
- Use clear, professional language
- If dates are relative (e.g., "next Friday"), convert to actual dates

Return ONLY the JSON object, no other text.`

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      max_tokens: 2000,
      temperature: 0.3
    })

    const responseText = completion.choices[0]?.message?.content
    if (!responseText) {
      throw new Error('No response from OpenAI')
    }

    // Parse JSON response defensively
    const jsonStart = responseText.indexOf('{')
    const jsonEnd = responseText.lastIndexOf('}')
    
    if (jsonStart === -1 || jsonEnd === -1) {
      throw new Error('Invalid JSON response from AI')
    }
    
    const jsonStr = responseText.slice(jsonStart, jsonEnd + 1)
    const parsed = JSON.parse(jsonStr)

    return NextResponse.json(parsed)
    
  } catch (error: any) {
    console.error('AI processing error:', error)
    
    // Don't expose internal errors to client
    if (error.message?.includes('API key')) {
      return NextResponse.json(
        { error: 'AI service not configured' },
        { status: 500 }
      )
    }
    
    return NextResponse.json(
      { error: 'Failed to process AI request' },
      { status: 500 }
    )
  }
}

// Handle audio transcription
export async function PUT(req: Request) {
  try {
    const formData = await req.formData()
    const audioFile = formData.get('audio') as File
    
    if (!audioFile) {
      return NextResponse.json(
        { error: 'No audio file provided' },
        { status: 400 }
      )
    }

    const apiKey = process.env.OPENAI_API_KEY || process.env.NEXT_PUBLIC_OPENAI_API_KEY
    
    if (!apiKey) {
      return NextResponse.json(
        { error: 'OpenAI API key not configured' },
        { status: 500 }
      )
    }

    const openai = new OpenAI({ apiKey })

    const transcription = await openai.audio.transcriptions.create({
      file: audioFile,
      model: 'whisper-1',
      language: 'en',
      prompt: 'This is about project management, tasks, deadlines, and work assignments.'
    })

    return NextResponse.json({ text: transcription.text })
    
  } catch (error: any) {
    console.error('Transcription error:', error)
    return NextResponse.json(
      { error: 'Failed to transcribe audio' },
      { status: 500 }
    )
  }
}