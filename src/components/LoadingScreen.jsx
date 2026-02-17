const LoadingScreen = ({ loading, error }) => {
    if (!loading && !error) return null;
  
    return (
      <div className="fixed inset-0 z-[300] bg-[#0a0a1a] flex flex-col items-center justify-center gap-4">
        {error ? (
          <>
            <div className="text-4xl">❌</div>
            <div className="text-red-400 text-center max-w-md px-4">
              <p className="text-lg font-bold mb-2">Failed to Load</p>
              <p className="text-sm text-gray-400">{error}</p>
            </div>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
            >
              Retry
            </button>
          </>
        ) : (
          <>
            <div className="spinner"></div>
            <div className="text-gray-400 text-sm">Loading market data...</div>
            <div className="text-gray-600 text-xs">
              Fetching stocks from NSE India
            </div>
          </>
        )}
      </div>
    );
  };
  
  export default LoadingScreen;