import { View, StyleSheet } from 'react-native';
import * as React from 'react';
import ActionSheet, { ActionSheetRef } from 'react-native-actions-sheet';
import { SizedBox } from '~/components/separate-components';
import { BaseText } from '~/components/rn-components';
import { Typography } from '~/constants';

interface SlideUpViewProps {
  modalTitle?: string;
  renderComponent: React.ReactNode;
  footerComponent?: React.ReactNode;
  disableScrollView?: boolean;
  snapPoints?: string[];
}

const SlideUpView = React.forwardRef<ActionSheetRef, SlideUpViewProps>(
  ({ modalTitle, renderComponent, footerComponent }, ref) => {
    return (
      <ActionSheet
        ref={ref}
        gestureEnabled={true}
        indicatorStyle={styles.indicator}
      >
        {modalTitle ? (
          <View style={styles.headerContainer}>
            <BaseText typography={Typography.bodyBold.large}>
              {modalTitle}
            </BaseText>
            <SizedBox height={10} />
          </View>
        ) : null}
        <View>{renderComponent}</View>
        {footerComponent}
      </ActionSheet>
    );
  },
);

const styles = StyleSheet.create({
  headerContainer: {
    borderBottomColor: '#bdbdbd',
    borderBottomWidth: 1,
    alignItems: 'center',
    paddingVertical: 12,
  },
  indicator: {
    backgroundColor: '#616161',
    width: 40,
    height: 4,
  },
});

export default SlideUpView;
