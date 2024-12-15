import React from 'react'
import { CodeBlock } from '../CodeBlock'

const sampleTypeScript = `
interface User {
  id: number
  name: string
  email: string
}

const getUser = async (id: number): Promise<User> => {
  const response = await fetch(\`/api/users/\${id}\`)
  return response.json()
}
`

const sampleJSX = `
function Welcome({ name }) {
  return (
    <div className="greeting">
      <h1>Hello, {name}!</h1>
      <p>Welcome to our app.</p>
    </div>
  )
}
`

export default {
  TypeScript: () => (
    <div className="p-4">
      <CodeBlock code={sampleTypeScript} language="typescript" />
    </div>
  ),
  JavaScript: () => (
    <div className="p-4">
      <CodeBlock code={sampleJSX} language="jsx" showLineNumbers={false} />
    </div>
  ),
  'Custom Styling': () => (
    <div className="p-4">
      <CodeBlock
        code={sampleTypeScript}
        language="typescript"
        className="border-2 border-blue-500"
      />
    </div>
  ),
}
