import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import BookApp from './BookApp'

function App() {
  const [count, setCount] = useState(0)

  return <BookApp />;

}

export default App
