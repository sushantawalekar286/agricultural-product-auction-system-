export const setupBidSocket = (io) => {
  io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    const userId = socket.handshake.auth?.userId;
    if (userId) {
      socket.join(userId.toString());
    }

    socket.on('joinAuction', (auctionId) => {
      socket.join(auctionId);
      console.log(`User ${socket.id} joined auction ${auctionId}`);
    });

    socket.on('leaveAuction', (auctionId) => {
      socket.leave(auctionId);
      console.log(`User ${socket.id} left auction ${auctionId}`);
    });

    socket.on('newBid', (data) => {
      // Broad cast to all in the auction room
      io.to(data.auctionId).emit('bidUpdate', data);
    });

    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
    });
  });
};
