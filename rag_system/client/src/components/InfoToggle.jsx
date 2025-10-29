import { useState } from "react";
import { Info } from "lucide-react";

export default function InfoToggle() {
  const [showInfo, setShowInfo] = useState(false);

  return (
    <div className="absolute top-4 right-6 text-white z-50">
      {/* Info Icon */}
      <button
        onClick={() => setShowInfo(!showInfo)}
        className="hover:text-gray-400 transition-colors duration-200 shadow-md cursor-pointer"
      >
        <Info className="w-8 h-8" />
      </button>

      {/* Developer Info */}
      <div
        className={`mt-2 w-48 absolute right-0 bg-[#1e1e1e] text-gray-200 text-sm p-4 rounded-lg border border-gray-700 shadow-xl transform transition-all duration-300 ease-out
          ${showInfo ? "opacity-100 scale-100" : "opacity-0 scale-90 pointer-events-none"}
        `}
      >
        <h5 className="font-semibold mb-1 text-gray-100">Developers:</h5>
        <ul className="space-y-1">
          <li>Fuad Sano</li>
          <li>Chala Temesgen</li>
          <li>Kalid Abdulkarim</li>
        </ul>
      </div>
    </div>
  );
}
