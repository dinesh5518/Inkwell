import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const NotFoundPage = () => (
  <div className="min-h-screen flex items-center justify-center px-4">
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-center max-w-md"
    >
      <p className="text-8xl font-display font-bold text-gradient mb-4">404</p>
      <h1 className="font-display text-2xl font-bold mb-3">Page not found</h1>
      <p className="text-gray-500 mb-8">The page you're looking for doesn't exist or has been moved.</p>
      <div className="flex gap-3 justify-center">
        <Link to="/" className="btn-primary">Go home</Link>
        <Link to="/blog" className="btn-secondary">Explore articles</Link>
      </div>
    </motion.div>
  </div>
);

export default NotFoundPage;
