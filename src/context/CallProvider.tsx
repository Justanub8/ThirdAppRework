import React, {
  createContext,
  useContext,
  useState,
  useRef,
  useEffect,
  useCallback,
} from 'react';
import { View } from 'react-native';
import {
  RTCPeerConnection,
  RTCIceCandidate,
  RTCSessionDescription,
  MediaStream,
  mediaDevices,
} from 'react-native-webrtc';
import InCallManager from 'react-native-incall-manager';
import { useSocket } from '~/context/SocketContext';
import { userApi } from '~/api';
import { CallOverlay } from '~/components/call';

export type CallState =
  | 'idle'
  | 'outgoing'
  | 'incoming'
  | 'connecting'
  | 'connected';

export interface CallSession {
  callId: string;
  peerId: string;
  peerName?: string;
  peerAvatar?: string;
  callType: 'audio' | 'video';
  isCaller: boolean;
}

export interface CallContextType {
  state: CallState;
  call: CallSession | null;
  startCall: (
    calleeId: string,
    callType: 'audio' | 'video',
    calleeInfo?: { name?: string; avatarUrl?: string },
  ) => Promise<void>;
  acceptCall: () => Promise<void>;
  rejectCall: () => void;
  endCall: () => void;
  toggleMute: () => void;
  toggleCamera: () => void;
  toggleSpeaker: () => void;
  switchCamera: () => void;
  isMuted: boolean;
  isCameraOff: boolean;
  isSpeakerOn: boolean;
}

const CallContext = createContext<CallContextType>({
  state: 'idle',
  call: null,
  startCall: async () => {},
  acceptCall: async () => {},
  rejectCall: () => {},
  endCall: () => {},
  toggleMute: () => {},
  toggleCamera: () => {},
  toggleSpeaker: () => {},
  switchCamera: () => {},
  isMuted: false,
  isCameraOff: false,
  isSpeakerOn: false,
});

export const useCall = () => useContext(CallContext);

const ICE_SERVERS = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' },
  ],
};

export function CallProvider({ children }: { children: React.ReactNode }) {
  const socket = useSocket();
  const [state, setState] = useState<CallState>('idle');
  const [call, setCall] = useState<CallSession | null>(null);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);

  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isCameraOff, setIsCameraOff] = useState<boolean>(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState<boolean>(false);

  const pcRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const pendingCandidatesRef = useRef<RTCIceCandidate[]>([]);
  const callRef = useRef<CallSession | null>(null);

  useEffect(() => {
    callRef.current = call;
  }, [call]);

  const cleanup = useCallback(() => {
    try {
      InCallManager.stopRingback();
      InCallManager.stopRingtone();
      InCallManager.stop();
    } catch {}

    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => {
        try {
          track.stop();
        } catch {}
      });
      localStreamRef.current = null;
    }

    if (pcRef.current) {
      try {
        pcRef.current.close();
      } catch {}
      pcRef.current = null;
    }

    pendingCandidatesRef.current = [];
    setLocalStream(null);
    setRemoteStream(null);
    setCall(null);
    callRef.current = null;
    setIsMuted(false);
    setIsCameraOff(false);
    setIsSpeakerOn(false);
    setState('idle');
  }, []);

  const flushPendingCandidates = async (pc: RTCPeerConnection) => {
    while (pendingCandidatesRef.current.length > 0) {
      const candidate = pendingCandidatesRef.current.shift();
      if (candidate) {
        try {
          await pc.addIceCandidate(candidate);
        } catch (err) {
          console.warn('Lỗi add pending ICE candidate:', err);
        }
      }
    }
  };

  const createPeerConnection = useCallback(
    async (type: 'audio' | 'video', callId: string) => {
      if (pcRef.current) {
        try {
          pcRef.current.close();
        } catch {}
      }

      const pc = new RTCPeerConnection(ICE_SERVERS);
      pcRef.current = pc;
      pendingCandidatesRef.current = [];

      try {
        const stream = await mediaDevices.getUserMedia({
          audio: true,
          video:
            type === 'video'
              ? {
                  facingMode: 'user',
                  width: { ideal: 1280 },
                  height: { ideal: 720 },
                  frameRate: { ideal: 30 },
                }
              : false,
        });

        localStreamRef.current = stream;
        setLocalStream(stream);

        stream.getTracks().forEach(track => {
          pc.addTrack(track, stream);
        });
      } catch (err) {
        console.error('Lỗi getUserMedia:', err);
        throw err;
      }

      pc.ontrack = (event: any) => {
        if (event.streams && event.streams[0]) {
          setRemoteStream(event.streams[0]);
        }
      };

      pc.onicecandidate = (event: any) => {
        if (event.candidate) {
          socket?.emit('ice', {
            callId,
            candidate: event.candidate,
          });
        }
      };

      pc.onconnectionstatechange = () => {
        if (pc.connectionState === 'connected') {
          setState('connected');
        } else if (
          pc.connectionState === 'failed' ||
          pc.connectionState === 'disconnected'
        ) {}
      };

      return pc;
    },
    [socket],
  );

  useEffect(() => {
    if (!socket) return;

    const handleIncomingCall = async (data: {
      callId: string;
      callerId: string;
      callType: 'audio' | 'video';
    }) => {
      let name = 'Người dùng';
      let avatarUrl = '';

      try {
        const userRes = await userApi.getUser(data.callerId);
        if (userRes.data?.user) {
          name = userRes.data.user.name || userRes.data.user.username || name;
          avatarUrl = userRes.data.user.avatarUrl || '';
        }
      } catch {}

      const session: CallSession = {
        callId: data.callId,
        peerId: data.callerId,
        peerName: name,
        peerAvatar: avatarUrl,
        callType: data.callType,
        isCaller: false,
      };

      setCall(session);
      callRef.current = session;
      setState('incoming');

      socket.emit('ringing', { callId: data.callId });

      try {
        (InCallManager as any).startRingtone(
          '_BUNDLE_',
          [0, 1000, 1000],
          'playback',
          30,
        );
      } catch {}
    };

    const handleRinging = () => {};

    const handleAccepted = async (data: { callId: string }) => {
      const currentCall = callRef.current;
      if (!currentCall || currentCall.callId !== data.callId) return;

      try {
        InCallManager.stopRingback();
        InCallManager.start({ media: currentCall.callType, auto: true });
      } catch {}

      setState('connecting');

      try {
        const pc = await createPeerConnection(
          currentCall.callType,
          data.callId,
        );
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        socket.emit('offer', { callId: data.callId, sdp: offer });
      } catch (err) {
        console.error('Lỗi tạo Offer WebRTC:', err);
        cleanup();
      }
    };

    const handleOffer = async (data: { callId: string; sdp: any }) => {
      const currentCall = callRef.current;
      if (!currentCall || currentCall.callId !== data.callId) return;

      try {
        let pc = pcRef.current;
        if (!pc) {
          pc = await createPeerConnection(currentCall.callType, data.callId);
        }

        await pc.setRemoteDescription(new RTCSessionDescription(data.sdp));
        await flushPendingCandidates(pc);

        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);

        socket.emit('answer', { callId: data.callId, sdp: answer });
        setState('connecting');
      } catch (err) {
        console.error('Lỗi nhận Offer & tạo Answer WebRTC:', err);
        cleanup();
      }
    };

    const handleAnswer = async (data: { callId: string; sdp: any }) => {
      const currentCall = callRef.current;
      if (!currentCall || currentCall.callId !== data.callId) return;

      try {
        const pc = pcRef.current;
        if (pc) {
          await pc.setRemoteDescription(new RTCSessionDescription(data.sdp));
          await flushPendingCandidates(pc);
        }
      } catch (err) {
        console.error('Lỗi xử lý SDP Answer:', err);
      }
    };

    const handleIce = async (data: { callId: string; candidate: any }) => {
      const currentCall = callRef.current;
      if (!currentCall || currentCall.callId !== data.callId) return;

      if (data.candidate) {
        const candidate = new RTCIceCandidate(data.candidate);
        const pc = pcRef.current;
        if (pc && pc.remoteDescription) {
          try {
            await pc.addIceCandidate(candidate);
          } catch (err) {
            console.warn('Lỗi addIceCandidate:', err);
          }
        } else {
          pendingCandidatesRef.current.push(candidate);
        }
      }
    };

    const handleCallEnded = () => {
      cleanup();
    };

    const handleBusy = () => {
      cleanup();
    };

    const handleCallHandled = () => {
      cleanup();
    };

    socket.on('incoming-call', handleIncomingCall);
    socket.on('ringing', handleRinging);
    socket.on('accepted', handleAccepted);
    socket.on('offer', handleOffer);
    socket.on('answer', handleAnswer);
    socket.on('ice', handleIce);
    socket.on('call-ended', handleCallEnded);
    socket.on('busy', handleBusy);
    socket.on('call-handled', handleCallHandled);

    return () => {
      socket.off('incoming-call', handleIncomingCall);
      socket.off('ringing', handleRinging);
      socket.off('accepted', handleAccepted);
      socket.off('offer', handleOffer);
      socket.off('answer', handleAnswer);
      socket.off('ice', handleIce);
      socket.off('call-ended', handleCallEnded);
      socket.off('busy', handleBusy);
      socket.off('call-handled', handleCallHandled);
    };
  }, [socket, cleanup, createPeerConnection]);

  const startCall = async (
    calleeId: string,
    callType: 'audio' | 'video',
    calleeInfo?: { name?: string; avatarUrl?: string },
  ) => {
    if (!socket || state !== 'idle') return;

    socket.emit(
      'call-request',
      { calleeId, callType },
      (res: { ok: boolean; callId?: string; error?: string }) => {
        if (res?.ok && res.callId) {
          const session: CallSession = {
            callId: res.callId,
            peerId: calleeId,
            peerName: calleeInfo?.name,
            peerAvatar: calleeInfo?.avatarUrl,
            callType,
            isCaller: true,
          };
          setCall(session);
          callRef.current = session;
          setState('outgoing');

          try {
            InCallManager.start({ media: callType, ringback: '_BUNDLE_' });
          } catch {}
        } else {
          cleanup();
        }
      },
    );
  };

  const acceptCall = async () => {
    if (!socket || !call || state !== 'incoming') return;

    try {
      InCallManager.stopRingtone();
      InCallManager.start({ media: call.callType, auto: true });
    } catch {}

    socket.emit(
      'accept',
      { callId: call.callId },
      async (res: { ok: boolean }) => {
        if (res?.ok) {
          setState('connecting');
          try {
            await createPeerConnection(call.callType, call.callId);
          } catch (err) {
            console.error('Lỗi khởi tạo WebRTC khi accept:', err);
            cleanup();
          }
        } else {
          cleanup();
        }
      },
    );
  };

  const rejectCall = () => {
    if (socket && call) {
      socket.emit('reject', { callId: call.callId });
    }
    cleanup();
  };

  const endCall = () => {
    if (socket && call) {
      if (state === 'outgoing') {
        socket.emit('cancel', { callId: call.callId });
      } else {
        socket.emit('hangup', { callId: call.callId });
      }
    }
    cleanup();
  };

  const toggleMute = () => {
    if (localStreamRef.current) {
      const nextState = !isMuted;
      localStreamRef.current.getAudioTracks().forEach(track => {
        track.enabled = !nextState;
      });
      setIsMuted(nextState);
      if (call) {
        socket?.emit('media-state', {
          callId: call.callId,
          mic: !nextState,
        });
      }
    }
  };

  const toggleCamera = () => {
    if (localStreamRef.current) {
      const nextState = !isCameraOff;
      localStreamRef.current.getVideoTracks().forEach(track => {
        track.enabled = !nextState;
      });
      setIsCameraOff(nextState);
      if (call) {
        socket?.emit('media-state', {
          callId: call.callId,
          camera: !nextState,
        });
      }
    }
  };

  const toggleSpeaker = () => {
    const nextState = !isSpeakerOn;
    try {
      InCallManager.setSpeakerphoneOn(nextState);
      setIsSpeakerOn(nextState);
    } catch {}
  };

  const switchCamera = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getVideoTracks().forEach(track => {
        const customTrack = track as any;
        if (typeof customTrack._switchCamera === 'function') {
          customTrack._switchCamera();
        }
      });
    }
  };

  return (
    <CallContext.Provider
      value={{
        state,
        call,
        startCall,
        acceptCall,
        rejectCall,
        endCall,
        toggleMute,
        toggleCamera,
        toggleSpeaker,
        switchCamera,
        isMuted,
        isCameraOff,
        isSpeakerOn,
      }}
    >
      <View style={{ flex: 1 }}>
        {children}
        <CallOverlay
          state={state}
          call={call}
          localStream={localStream}
          remoteStream={remoteStream}
          isMuted={isMuted}
          isCameraOff={isCameraOff}
          isSpeakerOn={isSpeakerOn}
          onAccept={acceptCall}
          onReject={rejectCall}
          onEndCall={endCall}
          onToggleMute={toggleMute}
          onToggleCamera={toggleCamera}
          onToggleSpeaker={toggleSpeaker}
          onSwitchCamera={switchCamera}
        />
      </View>
    </CallContext.Provider>
  );
}
