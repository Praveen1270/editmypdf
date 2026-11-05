import type { Peer } from "peerjs";

// Single PeerJS bootstrap for p2p-share and whiteboard. The dynamic import
// stays here so peerjs is only loaded when a peer connection is started.
export async function createPeer(): Promise<Peer> {
  const { Peer: PeerConstructor } = await import("peerjs");
  return new PeerConstructor();
}
