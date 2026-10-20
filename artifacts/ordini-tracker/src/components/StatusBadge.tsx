import type { ConventionStatus } from '@/data/types';
import { getStatusLabel } from '@/data/utils';

interface StatusBadgeProps {
  status: ConventionStatus;
}

const STATUS_STYLES: Record<ConventionStatus, { bg: string; text: string; dot: string }> = {
  active: {
    bg: '#E8F5E9',
    text: '#2D8A4E',
    dot: '#2D8A4E',
  },
  not_found: {
    bg: '#FFF8E1',
    text: '#B8860B',
    dot: '#B8860B',
  },
  expired: {
    bg: '#FFF8E1',
    text: '#B8860B',
    dot: '#B8860B',
  },
  not_verified: {
    bg: '#F4F4F5',
    text: '#9E9E9E',
    dot: '#9E9E9E',
  },
};

export function StatusBadge({ status }: StatusBadgeProps) {
  const styles = STATUS_STYLES[status] ?? STATUS_STYLES.not_verified;
  return (
    <span
      className="status-badge"
      style={{ backgroundColor: styles.bg, color: styles.text }}
    >
      <span
        className="status-dot"
        style={{ backgroundColor: styles.dot }}
      />
      {getStatusLabel(status)}
    </span>
  );
}
