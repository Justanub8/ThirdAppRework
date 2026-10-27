import { GlobalAlert, GlobalLoading, GlobalToast } from '~/components/globals';
import { SheetProvider, SheetManager } from 'react-native-actions-sheet';
import '~/components/sheets/sheets';
import { navigationRef } from '~/utils';
import * as React from 'react';
import RootNavigator from '~/navigation/RootNavigator';
import { View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '~/services/queryClient';

import { CallProvider, SocketProvider, ThemeProvider } from '~/context';

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <View style={{ flex: 1 }}>
          <SafeAreaProvider>
            <GestureHandlerRootView style={{ flex: 1 }}>
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
            </GestureHandlerRootView>
          </SafeAreaProvider>
        </View>
      </ThemeProvider>
    </QueryClientProvider>
  );
};
export default App;
