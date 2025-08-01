import { useLocation } from "react-router-dom";
import { useEffect } from "react";

const NotFound: React.FC = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
      <div className="text-center px-6 py-12 bg-white rounded-2xl shadow-2xl transform hover:scale-105 transition-all duration-300 max-w-md">
        <div className="flex justify-center mb-6">
          <div className="relative">
            <div className="absolute -top-4 -left-4 bg-red-500 rounded-full h-12 w-12 animate-ping opacity-50"></div>
            <div className="absolute -top-4 -left-4 bg-red-500 rounded-full h-12 w-12"></div>
            <h1 className="text-6xl font-extrabold text-gray-800 relative z-10">404</h1>
          </div>
        </div>
        <p className="text-2xl font-semibold text-gray-700 mb-4">
          Oops! Page Not Found
        </p>
        <p className="text-md text-gray-500 mb-6">
          It seems you've wandered into the unknown. The page you’re looking for
          doesn’t exist or has been moved. Let’s get you back on track!
        </p>
        <a
          href="/"
          className="inline-block bg-blue-600 text-white font-medium py-2 px-6 rounded-lg hover:bg-blue-700 transition-colors duration-300 shadow-md hover:shadow-lg"
        >
          Return to Home
        </a>
      </div>
    </div>
  );
};

export default NotFound;