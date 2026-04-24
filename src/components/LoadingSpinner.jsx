import { motion } from 'framer-motion'

const LoadingSpinner = () => (
  <div className="flex items-center justify-center py-8">
    <motion.div
      className="h-10 w-10 rounded-full border-4 border-cyan-200 border-t-cyan-500"
      animate={{ rotate: 360 }}
      transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }}
    />
  </div>
)

export default LoadingSpinner
