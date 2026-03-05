export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: { sans: ['Inter', 'sans-serif'] },
      colors: {
        primary: { 50:'#eff6ff', 100:'#dbeafe', 500:'#3b82f6', 600:'#2563eb', 700:'#1d4ed8', 900:'#1e3a8a' },
        teal: { 50:'#f0fdfa', 100:'#ccfbf1', 500:'#14b8a6', 600:'#0d9488', 700:'#0f766e' }
      }
    }
  },
  plugins: []
}