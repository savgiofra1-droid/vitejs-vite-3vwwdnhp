import React from 'react';
import { motion } from 'framer-motion';

export default function Gallery({ messages, userName, partnerName }: any) {
  const photos = messages.filter((msg: any) => msg.imageUrl);

  return (
    <div className="safe-pt h-full flex flex-col p-4 bg-black/70 backdrop-blur-md">
      <h1 className="text-2xl font-bold text-white mb-6 drop-shadow-md">
        La Nostra Galleria
      </h1>
      <div className="flex-1 overflow-y-auto">
        {photos.length === 0 ? (
          <div className="h-full flex items-center justify-center text-white/50 text-lg">
            Nessuna foto scambiata ancora.
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {photos.map((photo: any) => (
              <motion.div
                key={photo.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative aspect-square rounded-2xl overflow-hidden bg-white/10 shadow-md group"
              >
                <img
                  src={photo.imageUrl}
                  alt="Ricordo"
                  className="w-full h-full object-cover transition-transform group-hover:scale-105"
                />
                <div className="absolute bottom-0 left-0 right-0 bg-black/60 backdrop-blur-sm p-3 flex justify-between items-center text-sm font-medium">
                  <span className="text-white">
                    {photo.sender === userName ? 'Tu' : photo.sender}
                  </span>
                  <span className="text-white/50">{photo.time}</span>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
