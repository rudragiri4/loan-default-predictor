import { motion } from 'framer-motion';

export const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.07, duration: 0.4, ease: [0.4, 0, 0.2, 1] } }),
};

export const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07 } },
};

export function PageWrapper({ children, className = '' }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
      className={`page-container ${className}`}
    >
      {children}
    </motion.div>
  );
}

export function FadeUpItem({ children, delay = 0, style = {} }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
      style={style}
    >
      {children}
    </motion.div>
  );
}

export function StaggerGrid({ children, cols = 3, gap = 20 }) {
  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${cols}, 1fr)`,
        gap,
      }}
    >
      {children}
    </motion.div>
  );
}

export function AnimatedCard({ children, delay = 0, style = {}, className = '' }) {
  return (
    <motion.div
      variants={fadeUp}
      custom={delay}
      className={`card card-glow ${className}`}
      style={style}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
    >
      {children}
    </motion.div>
  );
}
