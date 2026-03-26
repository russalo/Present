export function WorldMetrics({ day, tension }) {
  const tensionColor = {
    calm: 'text-leyline',
    moderate: 'text-amber',
    high: 'text-blood',
    critical: 'text-blood',
  }[tension] || 'text-dust';

  return (
    <div className="border-t border-border pt-4 mt-4">
      <div className="text-xs text-dust space-y-1">
        <div><span className="text-amber">Day</span> {day} of 365</div>
        <div>
          <span className="text-amber">Tension</span>{' '}
          <span className={tensionColor + ' font-medium capitalize'}>{tension}</span>
        </div>
      </div>
    </div>
  );
}
