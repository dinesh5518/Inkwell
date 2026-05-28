export const CardSkeleton = () => (
  <div className="card p-5 space-y-4">
    <div className="skeleton h-44 w-full rounded-xl" />
    <div className="flex items-center gap-2">
      <div className="skeleton w-8 h-8 rounded-full" />
      <div className="skeleton h-3 w-24" />
    </div>
    <div className="skeleton h-5 w-3/4" />
    <div className="skeleton h-3 w-full" />
    <div className="skeleton h-3 w-2/3" />
  </div>
);

export const PostSkeleton = () => (
  <div className="max-w-3xl mx-auto space-y-6 py-10 px-4">
    <div className="skeleton h-8 w-3/4 rounded" />
    <div className="skeleton h-6 w-1/2 rounded" />
    <div className="skeleton h-64 w-full rounded-2xl" />
    {[...Array(5)].map((_, i) => (
      <div key={i} className="skeleton h-4 rounded" style={{ width: `${70 + Math.random() * 30}%` }} />
    ))}
  </div>
);

export const ProfileSkeleton = () => (
  <div className="space-y-6">
    <div className="skeleton h-40 w-full rounded-2xl" />
    <div className="flex items-end gap-4 -mt-12 px-6">
      <div className="skeleton w-24 h-24 rounded-full ring-4 ring-white dark:ring-gray-950" />
    </div>
    <div className="px-6 space-y-2">
      <div className="skeleton h-6 w-40" />
      <div className="skeleton h-4 w-24" />
      <div className="skeleton h-4 w-64" />
    </div>
  </div>
);

export const Spinner = ({ size = 'md', color = 'ink' }) => {
  const sizes = { sm: 'w-4 h-4', md: 'w-8 h-8', lg: 'w-12 h-12' };
  return (
    <div className={`${sizes[size]} border-2 border-gray-200 border-t-${color}-600 rounded-full animate-spin`} />
  );
};

export const FullPageLoader = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="text-center space-y-4">
      <Spinner size="lg" />
      <p className="text-sm text-gray-500">Loading...</p>
    </div>
  </div>
);
