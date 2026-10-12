import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Dimensions,
} from 'react-native';
import { RTCView } from 'react-native-webrtc';
import { Avatar } from '~/components/avatar';
import { BaseText } from '~/components/rn-components';
import { Typography } from '~/constants';
import {
  CallIcon,
  VideoCallIcon,
  MutedIcon,
  UnmutedIcon,
  CrossIcon,
  CameraLightIcon,
} from '~/assets/svgs';
import type { CallSession, CallState } from '~/context/CallProvider';

interface CallOverlayProps {
  state: CallState;
  call: CallSession | null;
  localStream: any;
  remoteStream: any;
  isMuted: boolean;
  isCameraOff: boolean;
  isSpeakerOn: boolean;
  onAccept: () => void;
  onReject: () => void;
  onEndCall: () => void;
  onToggleMute: () => void;
  onToggleCamera: () => void;
  onToggleSpeaker: () => void;
  onSwitchCamera: () => void;
}

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export const CallOverlay: React.FC<CallOverlayProps> = ({
  state,
  call,
  localStream,
  remoteStream,
  isMuted,
  isCameraOff,
  isSpeakerOn,
  onAccept,
  onReject,
  onEndCall,
  onToggleMute,
  onToggleCamera,
  onToggleSpeaker,
  onSwitchCamera,
}) => {
  const [duration, setDuration] = useState<number>(0);

  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    if (state === 'connected') {
      timer = setInterval(() => {
        setDuration(prev => prev + 1);
      }, 1000);
    } else {
      setDuration(0);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [state]);

  if (state === 'idle' || !call) {
    return null;
  }

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const getStatusText = () => {
    switch (state) {
      case 'incoming':
        return call.callType === 'video'
          ? 'Cuộc gọi video đến...'
          : 'Cuộc gọi thoại đến...';
      case 'outgoing':
        return 'Đang đổ chuông...';
      case 'connecting':
        return 'Đang kết nối...';
      case 'connected':
        return formatDuration(duration);
      default:
        return '';
    }
  };

  const isVideo = call.callType === 'video';
  const displayName = call.peerName || 'Người dùng';
  const displayAvatar = call.peerAvatar || undefined;
  if (state === 'incoming') {
    return (
      <View style={styles.overlayContainer}>
        <StatusBar barStyle="light-content" backgroundColor="#0D0D12" />
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.incomingHeader}>
            <View style={styles.avatarWrapper}>
              <Avatar url={displayAvatar} size={110} />
            </View>
            <BaseText
              typography={Typography.bodyBold.xxxLarge}
              color="#FFFFFF"
              style={styles.nameText}
            >
              {displayName}
            </BaseText>
            <BaseText
              typography={Typography.bodyRegular.medium}
              color="#A0A0B0"
              style={styles.statusText}
            >
              {getStatusText()}
            </BaseText>
          </View>

          <View style={styles.incomingActions}>
            <TouchableOpacity
              style={[styles.actionBtn, styles.rejectBtn]}
              onPress={onReject}
              activeOpacity={0.8}
            >
              <CrossIcon width={28} height={28} color="#FFFFFF" />
              <BaseText
                typography={Typography.bodyRegular.small}
                color="#FFFFFF"
                style={styles.btnLabel}
              >
                Từ chối
              </BaseText>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionBtn, styles.acceptBtn]}
              onPress={onAccept}
              activeOpacity={0.8}
            >
              {isVideo ? (
                <VideoCallIcon width={28} height={28} color="#FFFFFF" />
              ) : (
                <CallIcon width={28} height={28} color="#FFFFFF" />
              )}
              <BaseText
                typography={Typography.bodyRegular.small}
                color="#FFFFFF"
                style={styles.btnLabel}
              >
                Trả lời
              </BaseText>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  const hasRemoteVideo = isVideo && remoteStream && state === 'connected';
  const hasLocalVideo = isVideo && localStream && !isCameraOff;

  return (
    <View style={styles.overlayContainer}>
      <StatusBar barStyle="light-content" backgroundColor="#0D0D12" />

      {hasRemoteVideo ? (
        <RTCView
          streamURL={remoteStream.toURL()}
          style={StyleSheet.absoluteFill}
          objectFit="cover"
        />
      ) : null}

      <SafeAreaView style={styles.safeArea}>
        <View
          style={[
            styles.activeHeader,
            hasRemoteVideo && styles.headerVideoFloating,
          ]}
        >
          {!hasRemoteVideo ? (
            <View style={styles.avatarWrapper}>
              <Avatar url={displayAvatar} size={110} />
            </View>
          ) : null}
          <BaseText
            typography={Typography.bodyBold.xxLarge}
            color="#FFFFFF"
            style={styles.nameText}
          >
            {displayName}
          </BaseText>
          <BaseText
            typography={Typography.bodyRegular.medium}
            color="#A0A0B0"
            style={styles.statusText}
          >
            {getStatusText()}
          </BaseText>
        </View>

        {hasLocalVideo ? (
          <View style={styles.localVideoContainer}>
            <RTCView
              streamURL={localStream.toURL()}
              style={styles.localVideo}
              objectFit="cover"
              zOrder={10}
            />
          </View>
        ) : null}

        <View style={styles.activeControls}>
          <TouchableOpacity
            style={[styles.controlBtn, isMuted && styles.controlBtnActive]}
            onPress={onToggleMute}
            activeOpacity={0.8}
          >
            {isMuted ? (
              <MutedIcon width={24} height={24} color="#FFFFFF" />
            ) : (
              <UnmutedIcon width={24} height={24} color="#FFFFFF" />
            )}
            <BaseText
              typography={Typography.bodyRegular.xSmall}
              color="#E0E0E0"
              style={styles.controlLabel}
            >
              {isMuted ? 'Bật mic' : 'Tắt mic'}
            </BaseText>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.controlBtn, isSpeakerOn && styles.controlBtnActive]}
            onPress={onToggleSpeaker}
            activeOpacity={0.8}
          >
            <UnmutedIcon width={24} height={24} color="#FFFFFF" />
            <BaseText
              typography={Typography.bodyRegular.xSmall}
              color="#E0E0E0"
              style={styles.controlLabel}
            >
              {isSpeakerOn ? 'Loa ngoài' : 'Loa trong'}
            </BaseText>
          </TouchableOpacity>

          {isVideo ? (
            <>
              <TouchableOpacity
                style={[
                  styles.controlBtn,
                  isCameraOff && styles.controlBtnActive,
                ]}
                onPress={onToggleCamera}
                activeOpacity={0.8}
              >
                <CameraLightIcon width={24} height={24} color="#FFFFFF" />
                <BaseText
                  typography={Typography.bodyRegular.xSmall}
                  color="#E0E0E0"
                  style={styles.controlLabel}
                >
                  {isCameraOff ? 'Mở cam' : 'Tắt cam'}
                </BaseText>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.controlBtn}
                onPress={onSwitchCamera}
                activeOpacity={0.8}
              >
                <VideoCallIcon width={24} height={24} color="#FFFFFF" />
                <BaseText
                  typography={Typography.bodyRegular.xSmall}
                  color="#E0E0E0"
                  style={styles.controlLabel}
                >
                  Đổi cam
                </BaseText>
              </TouchableOpacity>
            </>
          ) : null}

          <TouchableOpacity
            style={[styles.controlBtn, styles.hangupBtn]}
            onPress={onEndCall}
            activeOpacity={0.8}
          >
            <CrossIcon width={28} height={28} color="#FFFFFF" />
            <BaseText
              typography={Typography.bodyRegular.xSmall}
              color="#FFFFFF"
              style={styles.controlLabel}
            >
              Kết thúc
            </BaseText>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  overlayContainer: {
    ...StyleSheet.absoluteFill,
    backgroundColor: '#0D0D12',
    zIndex: 9999,
    elevation: 9999,
  },
  safeArea: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 20,
  },
  incomingHeader: {
    alignItems: 'center',
    marginTop: SCREEN_HEIGHT * 0.12,
  },
  activeHeader: {
    alignItems: 'center',
    marginTop: SCREEN_HEIGHT * 0.08,
  },
  headerVideoFloating: {
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 20,
    alignSelf: 'center',
    marginTop: 10,
  },
  avatarWrapper: {
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 60,
    padding: 3,
    marginBottom: 16,
  },
  nameText: {
    textAlign: 'center',
    marginBottom: 8,
  },
  statusText: {
    textAlign: 'center',
  },
  incomingActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginBottom: 40,
    paddingHorizontal: 20,
  },
  actionBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 76,
    height: 76,
    borderRadius: 38,
  },
  rejectBtn: {
    backgroundColor: '#E53935',
  },
  acceptBtn: {
    backgroundColor: '#43A047',
  },
  btnLabel: {
    marginTop: 6,
  },
  localVideoContainer: {
    position: 'absolute',
    top: 70,
    right: 20,
    width: 105,
    height: 155,
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.4)',
    backgroundColor: '#1E1E24',
    zIndex: 20,
    elevation: 20,
  },
  localVideo: {
    flex: 1,
  },
  activeControls: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    backgroundColor: 'rgba(24, 24, 32, 0.85)',
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderRadius: 32,
    marginBottom: 20,
  },
  controlBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
    borderRadius: 24,
    minWidth: 54,
  },
  controlBtnActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  hangupBtn: {
    backgroundColor: '#E53935',
    width: 58,
    height: 58,
    borderRadius: 29,
  },
  controlLabel: {
    marginTop: 4,
    fontSize: 11,
  },
});
