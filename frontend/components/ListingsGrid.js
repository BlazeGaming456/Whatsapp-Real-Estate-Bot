"use client";

import { motion, AnimatePresence } from "framer-motion";
import ListingCard from "./ListingCard";
import { Building2, AlertCircle } from "lucide-react";
export default function ListingsGrid({
  listings,
  newListings,
  isLoading,
  error,
  onClearNewListings,
}) {
  if (error) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Error Loading Listings
        </h3>
        <p className="text-gray-600 mb-6">
          {error.message || "Something went wrong while loading the listings."}
        </p>
        <button
          onClick={() => window.location.reload()}
          className="bg-blue-600 text-white px-6 py-2.5 rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            className="bg-white rounded-lg border border-gray-200 overflow-hidden"
          >
            <div className="animate-pulse">
              {/* Image skeleton */}
              <div className="h-48 bg-gray-200"></div>

              {/* Content skeleton */}
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="h-5 bg-gray-200 rounded mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  </div>
                  <div className="w-16 h-6 bg-gray-200 rounded"></div>
                </div>

                <div className="h-8 bg-gray-200 rounded mb-4"></div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded"></div>
                </div>

                <div className="h-10 bg-gray-200 rounded mb-4"></div>

                <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                  <div className="h-3 bg-gray-200 rounded w-20"></div>
                  <div className="h-3 bg-gray-200 rounded w-16"></div>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    );
  }

  if (!listings || listings.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
        <Building2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          No Listings Found
        </h3>
        <p className="text-gray-600 max-w-md mx-auto">
          No property listings match your current search criteria. Try adjusting
          your filters or check back later for new listings.
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* New Listings Notification */}
      {newListings.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg"
        >
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <p className="text-green-800 font-medium text-sm">
                {newListings.length} new listing
                {newListings.length > 1 ? "s" : ""} received!
              </p>
            </div>
            <button
              onClick={onClearNewListings}
              className="text-green-700 hover:text-green-900 text-sm font-medium transition-colors px-2 py-1 hover:bg-green-100 rounded"
            >
              Clear
            </button>
          </div>
        </motion.div>
      )}

      {/* Listings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence>
          {listings.map((listing, index) => {
            const isNew = newListings.some((nl) => nl.id === listing.id);
            return (
              <motion.div
                key={listing.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <ListingCard listing={listing} isNew={isNew} />
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}
