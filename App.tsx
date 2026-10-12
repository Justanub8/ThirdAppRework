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
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { CallProvider, SocketProvider, ThemeProvider } from '~/context';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 1000 * 30,
      gcTime: 1000 * 60 * 5,
    },
  },
});
const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <View style={{ flex: 1 }}>
          <SafeAreaProvider>
            <GestureHandlerRootView style={{ flex: 1 }}>
              <BottomSheetModalProvider>
                <SheetProvider>
                  <SocketProvider>
                    <CallProvider>
                      <View style={{ flex: 1 }}>
                        <NavigationContainer
                          ref={navigationRef}
                          onStateChange={() => {
                            SheetManager.hideAll();
                          }}
                        >
                          <RootNavigator />
                        </NavigationContainer>
                        <GlobalToast />
                        <GlobalLoading />
                        <GlobalAlert />
                      </View>
                    </CallProvider>
                  </SocketProvider>
                </SheetProvider>
              </BottomSheetModalProvider>
            </GestureHandlerRootView>
          </SafeAreaProvider>
        </View>
      </ThemeProvider>
    </QueryClientProvider>
  );
};
export default App;
