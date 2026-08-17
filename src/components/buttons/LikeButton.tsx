import { View, Text } from 'react-native'
import React, { useState, useEffect } from 'react'
import { TouchableWithoutFeedback } from 'react-native';
import { HeartIcon, NotificationIcon } from '~/assets/svgs';
import { useLikeMutation } from '~/hooks';

interface LikeButtonProps {
    size: number;
    id: string;
    type: string;
    initialLiked?: boolean;
    activeColor?: string;
    inactiveColor?: string;
    onLikeToggle?: (isLiked: boolean) => void;
}

const LikeButton = ({ size, id, type, initialLiked = false, activeColor = '#F44336', inactiveColor = '#000000', onLikeToggle }: LikeButtonProps) => {
    const [isLiked, setIsLiked] = useState(initialLiked);
    const { createLike, deleteLike} = useLikeMutation();

    useEffect(() => {
        setIsLiked(initialLiked);
    }, [id, initialLiked]);

    const handleLike = () => {
        const newLikedState = !isLiked;
        if(isLiked){
            deleteLike.mutate({targetId: id, targetType: type});
        }else{
            createLike.mutate({targetId: id, targetType: type})
        }
        setIsLiked(newLikedState);
        if (onLikeToggle) {
            onLikeToggle(newLikedState);
        }
    }

    return (
    <TouchableWithoutFeedback onPress={handleLike}>
        {isLiked ? (
            <HeartIcon width={size} height={size} color={activeColor} />
        ) : (
            <NotificationIcon width={size} height={size} color={inactiveColor} />
        )}
    </TouchableWithoutFeedback>
  )
}

export default LikeButton