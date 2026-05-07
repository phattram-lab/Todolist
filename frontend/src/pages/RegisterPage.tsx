import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Mail, Lock, User } from 'lucide-react'
import { authApi } from '../api/auth'
import { useAuthStore } from '../store/authStore'
import Button from '../components/ui/Button'
import toast from 'react-hot-toast'

export default function RegisterPage() {
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuthStore()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password !== confirm) { toast.error('Passwords do not match'); return }
    setLoading(true)
    try {
      const { user, token } = await authApi.register(username, email, password)
      login(user, token)
      navigate('/')
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to register')
    } finally {
      setLoading(false)
    }
  }

  const field = (icon: React.ReactNode, type: string, value: string, onChange: (v: string) => void, placeholder: string, label: string) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">{label}</label>
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">{icon}</span>
        <input type={type} value={value} onChange={e => onChange(e.target.value)} required placeholder={placeholder}
          className="w-full pl-10 pr-4 py-2.5 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-400 text-gray-900 dark:text-white placeholder-gray-400 transition-colors" />
      </div>
    </div>
  )

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 via-rose-50 to-fuchsia-50 dark:from-gray-950 dark:via-gray-900 dark:to-pink-950 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <span className="text-5xl">📋</span>
          <h1 className="mt-3 text-3xl font-bold text-gray-900 dark:text-white">Todolist</h1>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800 p-8">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Create your account</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {field(<User className="w-4 h-4" />, 'text', username, setUsername, 'johndoe', 'Username')}
            {field(<Mail className="w-4 h-4" />, 'email', email, setEmail, 'you@example.com', 'Email')}
            {field(<Lock className="w-4 h-4" />, 'password', password, setPassword, '••••••••', 'Password')}
            {field(<Lock className="w-4 h-4" />, 'password', confirm, setConfirm, '••••••••', 'Confirm Password')}
            <Button type="submit" loading={loading} className="w-full py-2.5 mt-2">Create Account</Button>
          </form>

          <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-pink-600 dark:text-pink-400 font-medium hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
