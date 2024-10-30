"use client";

import { useState } from "react";

export default function FrameDebug() {
  const [currentImage, setCurrentImage] = useState("/api/poll-image");

  const handleButton = async (buttonIndex: number) => {
    try {
      const response = await fetch("/api/poll-action", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          untrustedData: {
            buttonIndex,
          },
        }),
      });

      const data = await response.json();

      if (data.image) {
        setCurrentImage(data.image);
      }

      if (data.location) {
        window.open(data.location, "_blank");
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl mb-4">Frame Debug View</h1>
      <div className="border-2 border-gray-300 rounded-lg p-4 mb-4">
        <img
          src={currentImage}
          alt="Frame content"
          className="mb-4 w-full max-w-[600px]"
        />

        <div className="flex gap-2">
          <button
            onClick={() => handleButton(1)}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Refresh Polls
          </button>
          <button
            onClick={() => handleButton(2)}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            View Details
          </button>
        </div>
      </div>
    </div>
  );
}
