import React, { useState, useEffect } from 'react'
import { TouchableWithoutFeedback } from 'react-native'
import { BookmarkBoldIcon, BookmarkLightIcon } from '~/assets/svgs'
import { useBookmarkMutation } from '~/hooks'

interface BookmarkButtonProps {
    size: number;
    id: string;
    type: string;
    initialBookmarked?: boolean;
    activeColor?: string;
    inactiveColor?: string;
    onBookmarkToggle?: (isBookmarked: boolean) => void;
}

const BookmarkButton = ({
    size, 
    id, 
    type, 
    initialBookmarked = false, 
    onBookmarkToggle, 
    activeColor = '#000000', 
    inactiveColor = '#000000' 
}: BookmarkButtonProps) => {
    const [isBookmarked, setIsBookmarked] = useState(initialBookmarked);
    const { createBookmark, deleteBookmark } = useBookmarkMutation();

    useEffect(() => {
        setIsBookmarked(initialBookmarked);
    }, [id, initialBookmarked]);

    const handleBookmark = () => {
        const newIsBookmarked  = !isBookmarked;
        if(isBookmarked){
            deleteBookmark.mutate({targetId: id, targetType: type});
        }else {
            createBookmark.mutate({targetId: id, targetType: type});
        }
        setIsBookmarked(newIsBookmarked);
        if( onBookmarkToggle){
            onBookmarkToggle(newIsBookmarked);
        }
    }
    return (
        <TouchableWithoutFeedback onPress={handleBookmark}>
            {isBookmarked ? (
                <BookmarkBoldIcon width={size} height={size} color={activeColor}/>
            ) : (
                <BookmarkLightIcon width={size} height={size} color={inactiveColor}/>
            )}
        </TouchableWithoutFeedback>
    )
}

export default BookmarkButton