import React, { useMemo } from 'react';
import { AlertTriangle, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const DeadlineAlerts = ({ projects }) => {
  const alerts = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const upcoming = [];
    const overdue = [];

    projects.forEach(p => {
      if (!p.workPending || !p.deadline) return;

      const deadlineDate = new Date(p.deadline);
      // Strip time for accurate day comparison
      deadlineDate.setHours(0, 0, 0, 0);

      const diffTime = deadlineDate.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays < 0) {
        overdue.push({ ...p, days: Math.abs(diffDays) });
      } else if (diffDays <= 3) {
        upcoming.push({ ...p, days: diffDays });
      }
    });

    return { upcoming, overdue };
  }, [projects]);

  if (alerts.upcoming.length === 0 && alerts.overdue.length === 0) {
    return null;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '2rem' }}>
      <AnimatePresence>
        {alerts.overdue.map(p => (
          <motion.div
            key={p.id}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            style={{
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid var(--color-danger)',
              borderRadius: 'var(--radius-md)',
              padding: '1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '1rem'
            }}
          >
            <AlertTriangle className="text-danger" size={24} />
            <div>
              <p style={{ color: 'var(--color-danger)', fontWeight: '600' }}>
                OVERDUE: {p.name} ({p.client})
              </p>
              <p style={{ fontSize: '0.875rem', color: 'var(--color-text-main)' }}>
                Deadline was {p.days} day(s) ago ({p.deadline})
              </p>
            </div>
          </motion.div>
        ))}

        {alerts.upcoming.map(p => (
          <motion.div
            key={p.id}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            style={{
              backgroundColor: 'rgba(245, 158, 11, 0.1)',
              border: '1px solid var(--color-warning)',
              borderRadius: 'var(--radius-md)',
              padding: '1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '1rem'
            }}
          >
            <Clock className="text-warning" size={24} />
            <div>
              <p style={{ color: 'var(--color-warning)', fontWeight: '600' }}>
                UPCOMING: {p.name} ({p.client})
              </p>
              <p style={{ fontSize: '0.875rem', color: 'var(--color-text-main)' }}>
                {p.days === 0 ? 'Due Today!' : `Due in ${p.days} day(s) on ${p.deadline}`}
              </p>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default DeadlineAlerts;
