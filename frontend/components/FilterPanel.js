"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sliders, X } from "lucide-react";

export default function FilterPanel({ filters, onFilterChange, onReset }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 768);
    };

    handleResize(); // Initial check
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleFilterChangeLocal = (key, value) => {
    onFilterChange({ ...filters, [key]: value });
  };

  const activeFilterCount = Object.values(filters).filter(
    (value) => value !== "" && value !== null
  ).length;

  return (
    <>
      {/* Mobile Filter Button */}
      {!isDesktop && (
        <div className="block md:hidden mb-4">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="w-full flex items-center justify-between px-4 py-3 bg-white border border-gray-300 rounded-lg hover:border-gray-400 transition-colors"
          >
            <div className="flex items-center gap-2">
              <Sliders className="w-5 h-5 text-gray-600" />
              <span className="font-medium text-gray-700">
                Filters {activeFilterCount > 0 && `(${activeFilterCount})`}
              </span>
            </div>
            {isOpen ? (
              <X className="w-5 h-5 text-gray-600" />
            ) : (
              <div className="w-5 h-5" />
            )}
          </button>
        </div>
      )}

      {/* Filter Panel */}
      <AnimatePresence>
        {(isOpen || isDesktop) && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 mb-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Sliders className="w-5 h-5" />
                Filter Listings
              </h3>
              {activeFilterCount > 0 && (
                <button
                  onClick={onReset}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  Clear All
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Listing Type Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Property Type
                </label>
                <select
                  value={filters.type || ""}
                  onChange={(e) =>
                    handleFilterChangeLocal("type", e.target.value)
                  }
                  className="w-full text-gray-600 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                >
                  <option value="">All Types</option>
                  <option value="sale">For Sale</option>
                  <option value="rent">For Rent</option>
                </select>
              </div>

              {/* Location Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Location
                </label>
                <input
                  type="text"
                  value={filters.location || ""}
                  onChange={(e) =>
                    handleFilterChangeLocal("location", e.target.value)
                  }
                  placeholder="City, Area..."
                  className="w-full text-gray-600 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                />
              </div>

              {/* Furnished Status Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Furnishing
                </label>
                <select
                  value={filters.furnished || ""}
                  onChange={(e) =>
                    handleFilterChangeLocal("furnished", e.target.value)
                  }
                  className="w-full text-gray-600 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                >
                  <option value="">Any</option>
                  <option value="furnished">Furnished</option>
                  <option value="semi-furnished">Semi-Furnished</option>
                  <option value="unfurnished">Unfurnished</option>
                </select>
              </div>

              {/* BHK Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  BHK
                </label>
                <select
                  value={filters.bhk || ""}
                  onChange={(e) =>
                    handleFilterChangeLocal("bhk", e.target.value)
                  }
                  className="w-full text-gray-600 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                >
                  <option value="">Any</option>
                  <option value="1">1 BHK</option>
                  <option value="2">2 BHK</option>
                  <option value="3">3 BHK</option>
                  <option value="4">4 BHK</option>
                  <option value="5">5+ BHK</option>
                </select>
              </div>

              {/* Min Price Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Min Price (₹)
                </label>
                <input
                  type="number"
                  value={filters.min_price || ""}
                  onChange={(e) =>
                    handleFilterChangeLocal("min_price", e.target.value)
                  }
                  placeholder="e.g. 5000000"
                  className="w-full text-gray-600 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                />
              </div>

              {/* Max Price Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Max Price (₹)
                </label>
                <input
                  type="number"
                  value={filters.max_price || ""}
                  onChange={(e) =>
                    handleFilterChangeLocal("max_price", e.target.value)
                  }
                  placeholder="e.g. 10000000"
                  className="w-full text-gray-600 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
