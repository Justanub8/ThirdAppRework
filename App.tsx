import { GlobalAlert, GlobalLoading, GlobalToast } from '~/components/globals';
import { SheetProvider, SheetManager } from 'react-native-actions-sheet';
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
    queries: {
      retry: 1,
      staleTime: 1000 * 30, // Cache tươi trong 30s, tránh fetch trùng lặp khi đổi tab
      gcTime: 1000 * 60 * 5, // Giữ cache 5 phút trong RAM
    },
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
                      <NavigationContainer 
                        ref={navigationRef}
                        onStateChange={() => {
                          SheetManager.hideAll();
                        }}
                      >
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