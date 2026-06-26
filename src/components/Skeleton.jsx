const SkeletonCard = ({ className = '' }) => {
  return (
    <div className={`bg-gray-800 rounded animate-pulse ${className}`} />
  );
};

const SkeletonTable = ({ rows = 5, cols = 4 }) => {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="flex gap-4">
          {Array.from({ length: cols }).map((_, colIndex) => (
            <SkeletonCard
              key={colIndex}
              className="h-8 flex-1"
            />
          ))}
        </div>
      ))}
    </div>
  );
};

const SkeletonStat = () => {
  return (
    <div className="space-y-2">
      <SkeletonCard className="h-3 w-16" />
      <SkeletonCard className="h-8 w-24" />
    </div>
  );
};

export { SkeletonCard, SkeletonTable, SkeletonStat };
