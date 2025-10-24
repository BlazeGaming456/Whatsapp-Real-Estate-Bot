"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  MapPin,
  Bed,
  Square,
  ExternalLink,
  Calendar,
  Tag,
  Building2,
} from "lucide-react";
import ImageGallery from "./ImageGallery";
export default function ListingCard({ listing, isNew = false }) {
  const [showContact, setShowContact] = useState(false);

  // Format price for display
  const formatPrice = (price) => {
    if (!price) return "Price on request";
    const numPrice = parseInt(price);
    if (numPrice >= 10000000) {
      return `₹${(numPrice / 10000000).toFixed(1)} Cr`;
    } else if (numPrice >= 100000) {
      return `₹${(numPrice / 100000).toFixed(1)} L`;
    } else {
      return `₹${numPrice.toLocaleString()}`;
    }
  };

  // Format rent for display
  const formatRent = (rent) => {
    if (!rent) return null;
    const numRent = parseInt(rent);
    return `₹${numRent.toLocaleString()}/month`;
  };

  // Get listing type color
  const getTypeColor = (type) => {
    return type === "sale"
      ? "bg-green-100 text-green-800"
      : "bg-blue-100 text-blue-800";
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`bg-white rounded-lg border border-gray-200 overflow-hidden hover:border-gray-300 hover:shadow-md transition-all ${
        isNew ? "ring-1 ring-green-400" : ""
      }`}
    >
      {/* New Badge */}
      {isNew && (
        <div className="absolute top-3 left-3 z-10">
          <span className="bg-green-500 text-white text-xs font-semibold px-2.5 py-1 rounded-full shadow-sm">
            NEW
          </span>
        </div>
      )}

      {/* Images */}
      <div className="relative h-48 bg-gray-200">
        {listing.images && listing.images.length > 0 ? (
          <ImageGallery images={listing.images} />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Building2 className="w-12 h-12 text-gray-400" />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-gray-900 mb-1 line-clamp-2">
              {listing.bhk ? `${listing.bhk} BHK` : "Property"} in{" "}
              {listing.location}
            </h3>
            <div className="flex items-center text-gray-500 text-sm">
              <MapPin className="w-3.5 h-3.5 mr-1 shrink-0" />
              <span className="truncate">{listing.location}</span>
            </div>
          </div>
          <span
            className={`px-2.5 py-1 rounded-md text-xs font-medium whitespace-nowrap ml-2 ${getTypeColor(
              listing.listing_type
            )}`}
          >
            {listing.listing_type?.toUpperCase()}
          </span>
        </div>

        {/* Price */}
        <div className="mb-3">
          <div className="text-2xl font-bold text-gray-900">
            {listing.listing_type === "sale"
              ? formatPrice(listing.price)
              : formatRent(listing.rentpermonth)}
          </div>
          {listing.area && (
            <div className="text-sm text-gray-500 flex items-center mt-1">
              <Square className="w-3.5 h-3.5 mr-1.5" />
              {listing.area}
            </div>
          )}
        </div>

        {/* Details */}
        <div className="grid grid-cols-2 gap-3 mb-3 text-sm">
          {listing.bhk && (
            <div className="flex items-center text-gray-600">
              <Bed className="w-4 h-4 mr-1.5 shrink-0" />
              <span className="truncate">{listing.bhk} BHK</span>
            </div>
          )}
          {listing.furnished_status && (
            <div className="flex items-center text-gray-600">
              <Tag className="w-4 h-4 mr-1.5 shrink-0" />
              <span className="truncate">{listing.furnished_status}</span>
            </div>
          )}
        </div>

        {/* Broker Info */}
        {listing.broker_name && (
          <div className="mb-3 p-3 bg-gray-50 rounded-md border border-gray-100">
            <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">
              Broker
            </div>
            <div className="font-medium text-gray-900 text-sm">
              {listing.broker_name}
            </div>
          </div>
        )}

        {/* Links */}
        {listing.links && listing.links.length > 0 && (
          <div className="mb-3">
            <div className="text-xs text-gray-500 mb-1.5">Links</div>
            <div className="space-y-1">
              {listing.links.slice(0, 2).map((link, index) => (
                <a
                  key={index}
                  href={link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center text-blue-600 hover:text-blue-700 text-xs truncate"
                >
                  <ExternalLink className="w-3 h-3 mr-1.5 shrink-0" />
                  <span className="truncate">
                    {link.length > 35 ? `${link.substring(0, 35)}...` : link}
                  </span>
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between text-xs text-gray-400 pt-3 border-t border-gray-100">
          <div className="flex items-center">
            <Calendar className="w-3 h-3 mr-1.5" />
            {formatDate(listing.created_at)}
          </div>
          {listing.chat_group && (
            <div className="text-gray-400 truncate ml-2">
              {listing.chat_group}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
