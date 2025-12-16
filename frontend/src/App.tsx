import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Rsa from './pages/Rsa'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/rsa" element={<Rsa />} />
      </Routes>
    </Router>
  )
}

export default App
