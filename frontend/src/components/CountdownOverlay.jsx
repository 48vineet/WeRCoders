function CountdownOverlay({ value }) {
  if (value === null || value === undefined) return null;

  const label = value === 0 ? "Go" : value;

  return (
    <div className="absolute inset-0 flex items-center justify-center bg-black/60 z-50">
      <div className="text-7xl sm:text-8xl font-black text-white animate-pulse">
        {label}
      </div>
    </div>
  );
}

export default CountdownOverlay;
