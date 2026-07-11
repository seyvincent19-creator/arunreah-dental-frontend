const PALETTE = ['#0d9488', '#2563eb', '#d97706', '#db2777', '#7c3aed', '#0891b2'];

function colorFor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return PALETTE[Math.abs(hash) % PALETTE.length];
}

function initialsFor(name: string): string {
  const parts = name.trim().split(/\s+/);
  const first = parts[0]?.[0] ?? '';
  const last = parts.length > 1 ? parts[parts.length - 1][0] : '';
  return (first + last).toUpperCase();
}

interface AvatarProps {
  name: string;
  size?: number;
}

export default function Avatar({ name, size = 40 }: AvatarProps) {
  return (
    <span
      className="avatar-circle"
      style={{ backgroundColor: colorFor(name), width: size, height: size, fontSize: size * 0.375 }}
    >
      {initialsFor(name) || '?'}
    </span>
  );
}
