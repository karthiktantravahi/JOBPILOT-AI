export const formatSalary = (salary) => {
  if (!salary) return 'Salary undisclosed';
  if (salary.raw && salary.raw.trim()) return salary.raw;
  if (salary.min > 0 && salary.max > 0) {
    return `$${salary.min.toLocaleString()} – $${salary.max.toLocaleString()} / ${salary.period || 'yr'}`;
  }
  if (salary.min > 0) {
    return `From $${salary.min.toLocaleString()} / ${salary.period || 'yr'}`;
  }
  return 'Competitive compensation';
};

export const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

export const timeAgo = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  const now = new Date();
  const diffSec = Math.floor((now - date) / 1000);

  if (diffSec < 60) return 'Just now';
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) return `${diffHour}h ago`;
  const diffDay = Math.floor(diffHour / 24);
  if (diffDay === 1) return 'Yesterday';
  if (diffDay < 30) return `${diffDay}d ago`;
  const diffMonth = Math.floor(diffDay / 30);
  return `${diffMonth}mo ago`;
};

export const getScoreBadgeClass = (score) => {
  if (score >= 85) return 'badge-success text-white font-semibold';
  if (score >= 70) return 'badge-info text-white font-semibold';
  if (score >= 50) return 'badge-warning font-semibold';
  return 'badge-ghost text-base-content/70 font-semibold';
};

export const getStatusBadgeClass = (status) => {
  switch (status?.toUpperCase()) {
    case 'SAVED':
      return 'badge-neutral';
    case 'APPLIED':
      return 'badge-info text-white';
    case 'ASSESSMENT':
      return 'badge-warning';
    case 'INTERVIEW':
      return 'badge-secondary text-white';
    case 'OFFER':
      return 'badge-success text-white';
    case 'REJECTED':
      return 'badge-error text-white';
    case 'WITHDRAWN':
      return 'badge-ghost';
    default:
      return 'badge-outline';
  }
};
