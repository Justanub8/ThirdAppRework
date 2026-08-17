import * as React from 'react'
import { create } from 'zustand'
import { CoverLoadingView } from '../loading'
type GlobalLoadingView  = {
    visible: boolean,
    show: () => void;
    hide: () => void;
};

export const useGlobalLoading = create<GlobalLoadingView>(set => ({
    visible: false,
    show: () => set({visible: true}),
    hide: () => set({visible: false}),
}));
const GlobalLoading = () => {
    const {visible} = useGlobalLoading();
    return visible ? <CoverLoadingView/> : null;
}

export default GlobalLoading
const showGlobalLoading = useGlobalLoading.getState().show
const hideGlobalLoading = useGlobalLoading.getState().hide
export {showGlobalLoading, hideGlobalLoading}