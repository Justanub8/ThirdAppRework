import { GlobalAlert, GlobalLoading, GlobalToast } from '~/components/globals';
import { SheetProvider } from 'react-native-actions-sheet';
import '~/components/sheets/sheets';
import { navigationRef } from '~/utils';
import * as React from 'react';
import RootNavigator from '~/navigation/RootNavigator';
import { View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { NavigationContainer } from '@react-navigation/native';
import { commonStyles } from '~/constants';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient({
        defaultOptions: {
            queries: {retry: false},
        }
    })
const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <View style={commonStyles.container}>
        <SafeAreaProvider>
          <GestureHandlerRootView style={{flex: 1}}>
            <BottomSheetModalProvider>
                <SheetProvider>
                  <View style= {commonStyles.container}>
                      <NavigationContainer ref={navigationRef}>
                          <RootNavigator/>
                      </NavigationContainer>
                      <GlobalToast />
                      <GlobalLoading />
                      <GlobalAlert />
                  </View>
                </SheetProvider>
            </BottomSheetModalProvider>
          </GestureHandlerRootView>
        </SafeAreaProvider>
      </View>
    </QueryClientProvider>
  )
}
export default App