import React, { useState, useEffect } from 'react'
import { TouchableWithoutFeedback } from 'react-native'
import { RepostIcon } from '~/assets/svgs'
import { useRepostMutation } from '~/hooks'
interface RepostButtonProps {
    size: number;
    id: string;
    type: string;
    initialReposted?: boolean;
    activeColor?: string;
    inactiveColor?: string;
    onRepostToggle?: (isReposted: boolean) => void;
}

const RepostButton = ({
    size,
    id,
    type,
    initialReposted = false,
    onRepostToggle,
    activeColor = '#23d04e',
    inactiveColor = '#000000'
} : RepostButtonProps) => {
    const [isReposted, setIsReposted] = useState(initialReposted);
    const { createRepost, deleteRepost } = useRepostMutation();

    useEffect(() => {
        setIsReposted(initialReposted);
    }, [id, initialReposted])

    const handleRepost = () => {
        const newIsReposted = !isReposted;
        if(isReposted){
            deleteRepost.mutate({targetId: id, targetType: type})
        }else{
            createRepost.mutate({targetId: id, targetType: type})
        }
        setIsReposted(newIsReposted)
        if( onRepostToggle ){
            onRepostToggle(newIsReposted);
        }
    }
    return (
        <TouchableWithoutFeedback onPress={handleRepost}>
            {isReposted ? (
                <RepostIcon width={size} height={size} color={activeColor} />
            ) : (
                <RepostIcon width={size} height={size} color={inactiveColor}/>
            )}
        </TouchableWithoutFeedback>
    )

}

export default RepostButton