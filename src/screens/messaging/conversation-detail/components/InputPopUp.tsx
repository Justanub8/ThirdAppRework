import React, {
  ReactNode,
  useState,
  useMemo,
  useCallback,
  useEffect,
  useRef,
} from 'react';
import {
  StyleSheet,
  TouchableOpacity,
  View,
  TextInput,
  ActivityIndicator,
  DimensionValue,
} from 'react-native';
import { BasePopUp, BaseText, BaseTextInput, SizedBox } from '~/components';
import { useTheme, Theme } from '~/hooks';
import { Typography, FONT_FAMILY } from '~/constants';
import { CrossIcon } from '~/assets/svgs';

export interface InputPopUpProps {
  id?: string;
  visible?: boolean;
  onClose?: () => void;
  children?: ReactNode;
  title?: string;
  description?: string;
  placeholder?: string;
  initialValue?: string;
  value?: string;
  onChangeText?: (text: string) => void;
  onConfirm?: (value: string) => void | Promise<void>;
  confirmText?: string;
  cancelText?: string;
  isLoading?: boolean;
  allowEmpty?: boolean;
  maxLength?: number;
  width?: DimensionValue;
  height?: DimensionValue;
}

export const InputPopUp: React.FC<InputPopUpProps> = ({
  id: _id,
  visible: controlledVisible,
  onClose,
  children,
  title = 'Chỉnh sửa',
  description,
  placeholder = 'Nhập nội dung...',
  initialValue = '',
  value,
  onChangeText,
  onConfirm,
  confirmText = 'Lưu',
  cancelText = 'Hủy',
  isLoading = false,
  allowEmpty = false,
  maxLength,
  width = 300,
  height,
}) => {
  const { theme } = useTheme();
  const styles = useMemo(() => getStyles(theme), [theme]);

  const [internalVisible, setInternalVisible] = useState(false);
  const [inputValue, setInputValue] = useState(value ?? initialValue);
  const [isFocused, setIsFocused] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const inputRef = useRef<TextInput>(null);

  const isControlled = typeof controlledVisible === 'boolean';
  const isVisible = isControlled ? controlledVisible : internalVisible;

  useEffect(() => {
    if (value !== undefined) {
      setInputValue(value);
    }
  }, [value]);

  useEffect(() => {
    if (isVisible) {
      setInputValue(value !== undefined ? value : initialValue);
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [isVisible, value, initialValue]);

  const handleOpen = useCallback(() => {
    setInternalVisible(true);
  }, []);

  const handleClose = useCallback(() => {
    if (isControlled && onClose) {
      onClose();
    } else {
      setInternalVisible(false);
    }
  }, [isControlled, onClose]);

  const handleTextChange = useCallback(
    (text: string) => {
      if (value === undefined) {
        setInputValue(text);
      }
      onChangeText?.(text);
    },
    [value, onChangeText],
  );

  const handleClear = useCallback(() => {
    handleTextChange('');
    inputRef.current?.focus();
  }, [handleTextChange]);

  const handleConfirm = useCallback(async () => {
    const textToSubmit = inputValue.trim();
    if (!allowEmpty && !textToSubmit) {
      return;
    }

    if (onConfirm) {
      try {
        setIsSubmitting(true);
        await onConfirm(textToSubmit);
        handleClose();
      } catch {
        // Error handled by onConfirm
      } finally {
        setIsSubmitting(false);
      }
    } else {
      handleClose();
    }
  }, [inputValue, allowEmpty, onConfirm, handleClose]);

  const isConfirmDisabled =
    (!allowEmpty && !inputValue.trim()) || isSubmitting || isLoading;

  const calculatedHeight = height ?? (description ? 210 : 190);

  return (
    <>
      {children && (
        <TouchableOpacity activeOpacity={0.7} onPress={handleOpen}>
          {children}
        </TouchableOpacity>
      )}

      <BasePopUp
        visible={isVisible}
        onClose={handleClose}
        height={calculatedHeight}
        width={width}
      >
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <BaseText
              typography={Typography.bodyBold.large}
              color={theme.text}
              textAlign="center"
            >
              {title}
            </BaseText>
            {!!description && (
              <>
                <SizedBox height={4} />
                <BaseText
                  typography={Typography.bodyRegular.small}
                  color={theme.placeholder}
                  textAlign="center"
                >
                  {description}
                </BaseText>
              </>
            )}
          </View>

          {/* Input field */}
          <View
            style={[
              styles.inputWrapper,
              isFocused && styles.inputWrapperFocused,
            ]}
          >
            <BaseTextInput
              ref={inputRef}
              value={inputValue}
              onChangeText={handleTextChange}
              placeholder={placeholder}
              placeholderTextColor={theme.placeholder}
              maxLength={maxLength}
              autoCapitalize="sentences"
              autoCorrect={false}
              returnKeyType="done"
              onSubmitEditing={handleConfirm}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              style={styles.textInput}
            />
            {inputValue.length > 0 && (
              <TouchableOpacity
                onPress={handleClear}
                style={styles.clearButton}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                activeOpacity={0.6}
              >
                <CrossIcon width={14} height={14} color={theme.placeholder} />
              </TouchableOpacity>
            )}
          </View>

          {/* Action buttons */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={handleClose}
              activeOpacity={0.7}
              disabled={isSubmitting || isLoading}
            >
              <BaseText
                typography={Typography.bodyMedium.medium}
                color={theme.text}
              >
                {cancelText}
              </BaseText>
            </TouchableOpacity>

            <SizedBox width={10} />

            <TouchableOpacity
              style={[
                styles.button,
                styles.confirmButton,
                isConfirmDisabled && styles.confirmButtonDisabled,
              ]}
              onPress={handleConfirm}
              disabled={isConfirmDisabled}
              activeOpacity={0.7}
            >
              {isSubmitting || isLoading ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <BaseText
                  typography={Typography.bodyBold.medium}
                  color="#FFFFFF"
                >
                  {confirmText}
                </BaseText>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </BasePopUp>
    </>
  );
};

const getStyles = (theme: Theme) => {
  const isDark = theme.background === '#000000';

  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isDark ? '#262628' : '#FFFFFF',
      paddingHorizontal: 16,
      paddingTop: 16,
      paddingBottom: 14,
      justifyContent: 'space-between',
    },
    header: {
      alignItems: 'center',
      justifyContent: 'center',
    },
    inputWrapper: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: isDark ? '#1C1C1E' : '#F2F2F7',
      borderRadius: 10,
      borderWidth: 1,
      borderColor: isDark ? '#3A3A3C' : theme.border,
      paddingHorizontal: 12,
      height: 44,
    },
    inputWrapperFocused: {
      borderColor: theme.facebookBlue ?? '#246BFD',
    },
    textInput: {
      flex: 1,
      paddingVertical: 0,
      color: theme.text,
      fontFamily: FONT_FAMILY.regular,
      fontSize: 15,
    },
    clearButton: {
      marginLeft: 8,
      padding: 2,
    },
    buttonContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      width: '100%',
    },
    button: {
      flex: 1,
      height: 40,
      borderRadius: 10,
      justifyContent: 'center',
      alignItems: 'center',
    },
    cancelButton: {
      backgroundColor: isDark ? '#3A3A3C' : '#E5E5EA',
    },
    confirmButton: {
      backgroundColor: theme.facebookBlue ?? '#246BFD',
    },
    confirmButtonDisabled: {
      opacity: 0.5,
    },
  });
};
