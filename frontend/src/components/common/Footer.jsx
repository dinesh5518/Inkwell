import { Link } from 'react-router-dom';

const Footer = () => (
  <footer className="border-t border-gray-100 dark:border-gray-800 mt-20">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="md:col-span-2">
          <Link to="/" className="flex items-center gap-2 mb-4">
            <span className="w-7 h-7 rounded-lg bg-gradient-to-br from-ink-600 to-purple-500 flex items-center justify-center text-white font-display font-bold text-xs">I</span>
            <span className="font-display font-bold text-lg">ink<span className="text-ink-600">well</span></span>
          </Link>
          <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xs">
            A modern platform for writers and readers. Share your stories, ideas, and expertise with the world.
          </p>
        </div>

        <div>
          <h4 className="font-semibold text-sm mb-3">Platform</h4>
          <ul className="space-y-2 text-sm text-gray-500 dark:text-gray-400">
            <li><Link to="/blog" className="hover:text-ink-600 transition-colors">Explore</Link></li>
            <li><Link to="/write" className="hover:text-ink-600 transition-colors">Write</Link></li>
            <li><Link to="/login" className="hover:text-ink-600 transition-colors">Sign in</Link></li>
            <li><Link to="/register" className="hover:text-ink-600 transition-colors">Get started</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-semibold text-sm mb-3">About</h4>
          <ul className="space-y-2 text-sm text-gray-500 dark:text-gray-400">
            <li><span className="cursor-default">Open source</span></li>
            <li><span className="cursor-default">Built with ❤️</span></li>
            <li><span className="cursor-default">React + Node.js</span></li>
          </ul>
        </div>
      </div>

      <div className="border-t border-gray-100 dark:border-gray-800 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-xs text-gray-400">© {new Date().getFullYear()} Inkwell. All rights reserved.</p>
        <p className="text-xs text-gray-400">Made with React, Node.js & MongoDB</p>
      </div>
    </div>
  </footer>
);

export default Footer;
