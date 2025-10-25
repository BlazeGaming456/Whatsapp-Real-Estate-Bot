"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useListings } from "../hooks/useListings";
import { fetchStats } from "../lib/api";
import ListingsGrid from "../components/ListingsGrid";

export default function DashboardPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const response = await fetchStats();
        if (response.success) {
          setStats(response.data);
        }
      } catch (error) {
        console.error("Error loading stats:", error);
      } finally {
        setStatsLoading(false);
      }
    };

    loadStats();
  }, []);

  const { listings, newListings, isLoading, error, refetch, clearNewListings } =
    useListings({
      search: searchTerm,
    });

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-10 text-center"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-3">
            Property Listings
          </h1>
          <p className="text-gray-600 text-lg">
            Real-time updates collected from your WhatsApp groups!
          </p>
        </motion.div>

        {stats && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="grid grid-cols-1 md:grid-cols-4 gap-5 mb-8"
          >
            <div className="bg-white rounded-lg border border-gray-200 p-5 hover:border-gray-400 cursor-pointer transition-colors">
              <div className="flex items-center">
                <div className="p-2.5 bg-blue-50 rounded-lg">
                  <svg
                    className="w-5 h-5 text-blue-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Total Listings
                  </p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {stats.total_listings || 0}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-5 hover:border-gray-400 cursor-pointer transition-colors">
              <div className="flex items-center">
                <div className="p-2.5 bg-green-50 rounded-lg">
                  <svg
                    className="w-5 h-5 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                    For Sale
                  </p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {stats.sale_listings || 0}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-5 hover:border-gray-400 cursor-pointer transition-colors">
              <div className="flex items-center">
                <div className="p-2.5 bg-yellow-50 rounded-lg">
                  <svg
                    className="w-5 h-5 text-yellow-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                    For Rent
                  </p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {stats.rent_listings || 0}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-5 hover:border-gray-400 cursor-pointer transition-colors">
              <div className="flex items-center">
                <div className="p-2.5 bg-purple-50 rounded-lg">
                  <svg
                    className="w-5 h-5 text-purple-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Today
                  </p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {stats.today_listings || 0}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 mb-8"
        >
          <div className="flex items-center space-x-3">
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder="Search by location, price, BHK..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              />
            </div>
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="px-4 py-2.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
              >
                Clear
              </button>
            )}
          </div>
        </motion.div>

        <ListingsGrid
          listings={listings}
          newListings={newListings}
          isLoading={isLoading}
          error={error}
          onClearNewListings={clearNewListings}
        />
      </div>
    </div>
  );
}
