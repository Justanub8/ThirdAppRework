import { View, Text, StyleSheet } from 'react-native'
import * as React from 'react'
import BottomSheet, { BottomSheetFooter, BottomSheetScrollView, BottomSheetView, BottomSheetFooterProps } from '@gorhom/bottom-sheet';
import { SizedBox } from '../separate-components';
import { BaseText } from '../rn-components';
import { Typography } from '~/constants';
interface SlideUpViewProps {
    modalTitle?: string;
    renderComponent: React.ReactNode;
    footerComponent?: React.ReactNode;
    disableScrollView?: boolean;
    snapPoints?: string[];
}

const SlideUpView = React.forwardRef<BottomSheet, SlideUpViewProps>((
    {modalTitle, renderComponent, footerComponent, disableScrollView = false, snapPoints = ['60%', '80%']}, ref
) => {
    const handleSheetChanges = React.useCallback((index: number) => { 
    },[])
    const renderHeader = () => {
        return (
            <View style={styles.headerContainer}>
                <SizedBox height={12}/>
                <SizedBox height={3} width={40} backgroundColor={'#616161'} borderRadius={9999}/>
                <SizedBox height={18}/>
                <BaseText typography={Typography.bodyBold.large}>
                    {modalTitle}
                </BaseText>
                <SizedBox height={10}/>
            </View>
        )
    }
    const renderFooter = React.useCallback(
    (props: BottomSheetFooterProps) => ( 
        <BottomSheetFooter {...props} bottomInset={24}>
            {footerComponent}
        </BottomSheetFooter>
    ),
    []
    );
  return (
    <BottomSheet
        ref={ref}
        index={0}
        snapPoints={snapPoints}
        onChange={handleSheetChanges}
        enablePanDownToClose={false}
        enableDynamicSizing={false}
        handleComponent={modalTitle? renderHeader : null}
        footerComponent={renderFooter}
    >
        {disableScrollView ? (
            <>
                {renderComponent}
            </>
        ) : (
            <BottomSheetScrollView style={{ flex: 1 }}>
                <View>
                    {renderComponent}
                </View>
            </BottomSheetScrollView>
        )}
    </BottomSheet>
  )
})
const styles = StyleSheet.create({
    headerContainer: {
        borderBottomColor: '#bdbdbd',
        borderBottomWidth: 1,
        alignItems: 'center'
    }
})

export default SlideUpView
