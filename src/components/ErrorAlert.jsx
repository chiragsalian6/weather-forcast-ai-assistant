import { motion } from 'framer-motion'

const ErrorAlert = ({ message }) => {
  if (!message) return null

  return (
    <motion.div
      className="glass-card-soft border-red-400/40 bg-red-500/20 px-4 py-3 text-red-100"
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
    >
      {message}
    </motion.div>
  )
}

export default ErrorAlert
