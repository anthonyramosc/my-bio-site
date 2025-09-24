export default function Loading() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="flex items-center">
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-[#98C022] mr-2"></div>
        <span className="text-xs text-gray-500">Cargando...</span>
      </div>
    </div>
  );
}
