import { useState, useEffect, useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import socket from "../lib/socket";
import { fetchListings } from "../lib/api";
export const useListings = (filters = {}) => {
  const queryClient = useQueryClient();
  const [newListings, setNewListings] = useState([]);
  const [notifications, setNotifications] = useState([]);

  const {
    data: listingsData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["listings", filters],
    queryFn: () => fetchListings(filters),
    refetchInterval: 30000,
    staleTime: 10000,
  });

  const addNotification = useCallback((message, type = "info") => {
    const notification = {
      id: Date.now(),
      message,
      type,
      timestamp: new Date(),
    };
    setNotifications((prev) => [notification, ...prev.slice(0, 4)]);
  }, []);

  const removeNotification = useCallback((id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const clearNewListings = useCallback(() => {
    setNewListings([]);
  }, []);

  useEffect(() => {
    const handleNewListing = (newListing) => {
      console.log("New listing received:", newListing);

      setNewListings((prev) => [newListing, ...prev]);

      queryClient.setQueryData(["listings", filters], (oldData) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          data: [newListing, ...oldData.data],
          pagination: {
            ...oldData.pagination,
            total: oldData.pagination.total + 1,
          },
        };
      });

      addNotification(
        `New ${newListing.listing_type} listing in ${newListing.location}`,
        "success"
      );
    };

    const handleNewImage = (imageData) => {
      console.log("New image received:", imageData);

      queryClient.setQueryData(["listings", filters], (oldData) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          data: oldData.data.map((listing) =>
            listing.id === imageData.listingId
              ? {
                  ...listing,
                  images: [
                    ...(listing.images || []),
                    { url: imageData.imageUrl },
                  ],
                }
              : listing
          ),
        };
      });

      addNotification("New image added to listing", "info");
    };

    const handleConnectionStatus = (status) => {
      if (status.status === "connected") {
        addNotification("Connected to real-time updates", "success");
      }
    };

    socket.on("new_listing", handleNewListing);
    socket.on("new_image", handleNewImage);
    socket.on("connection_status", handleConnectionStatus);

    return () => {
      socket.off("new_listing", handleNewListing);
      socket.off("new_image", handleNewImage);
      socket.off("connection_status", handleConnectionStatus);
    };
  }, [queryClient, filters, addNotification]);

  useEffect(() => {
    const timer = setInterval(() => {
      setNotifications((prev) =>
        prev.filter((n) => Date.now() - n.timestamp.getTime() < 5000)
      );
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return {
    listings: listingsData?.data || [],
    pagination: listingsData?.pagination,
    newListings,
    notifications,
    isLoading,
    error,
    refetch,
    clearNewListings,
    removeNotification,
  };
};
