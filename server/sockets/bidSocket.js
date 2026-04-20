export const setupBidSocket = (io) => {
  io.on('connection', (socket) => {
    const userId = socket.handshake.auth?.userId;
    if (userId) {
      socket.join(userId.toString());
    }

    socket.on('joinAuction', (auctionId) => {
      socket.join(auctionId);
    });

    socket.on('leaveAuction', (auctionId) => {
      socket.leave(auctionId);
    });

    socket.on('newBid', (data) => {
      // Broad cast to all in the auction room
      io.to(data.auctionId).emit('bidUpdate', data);
    });

    socket.on('disconnect', () => {});
  });
};
