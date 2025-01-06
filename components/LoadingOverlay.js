export default function LoadingOverlay() {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white p-4 rounded-lg shadow-lg flex items-center space-x-3">
          <div className="w-6 h-6 border-4 border-t-[#FFB13B] border-r-[#FFB13B] border-b-[#FFB13B] border-l-transparent rounded-full animate-spin"></div>
          <span className="text-gray-700">Loading...</span>
        </div>
      </div>
    );
  }