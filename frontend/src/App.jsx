import { AuthProvider } from './modules/auth/store/AuthContext'
import AppRouter from './router/AppRouter'

function App() {
  return (
    <AuthProvider>
      <AppRouter />
    </AuthProvider>
  )
}

export default App
