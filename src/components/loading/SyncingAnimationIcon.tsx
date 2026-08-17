import { View } from 'react-native'
import * as React from 'react'
import Animated  from 'react-native-reanimated'
import Svg , {Path} from 'react-native-svg'
import { commonStyles } from '~/constants'

const AnimatedPath = Animated.createAnimatedComponent(Path);
const SyncingAnimatedIcon = ({
    size = 32,
    progress = 0.99
}:{
    size?: number,
    progress?: number
}) => {
    const strokeWidth = 4;
    const radius = size / 2 - strokeWidth/ 1.2;
    const round = radius * 2 * Math.PI;
    return (
        <View style = {{width: size, height: size, borderRadius: size/2}}>
            <View
                style = {[
                    {
                        width: size,
                        height: size,
                        borderRadius: size/2
                    },
                    commonStyles.alignItemsCenter,
                    commonStyles.justifyCenter,
                ]}
            >
                <Svg height={size} width={size} viewBox={`0 0 ${size} ${size}`}>
                    <AnimatedPath
                    stroke={'#9e9e9e'}
                    strokeWidth = {strokeWidth}
                    fill={'transparent'}
                    d={`M${radius + strokeWidth / 1.2},${
                    strokeWidth / 1.2
                    } a${radius} ${radius} 0 0,1 ${0},${
                    2 * radius
                    } a${radius} ${radius} 0 0,1 ${0},${-2 * radius} z`}/>
                    <AnimatedPath
                    stroke={'#246BFD'}
                    strokeWidth={strokeWidth}
                    fill={'transparent'}
                    strokeDasharray={[
                        round * progress,
                        round * (strokeWidth / 1.2 - progress),
                    ]}
                    d={`M${radius + strokeWidth / 1.2},${
                    strokeWidth / 1.2
                    } a${radius} ${radius} 0 0,1 ${0},${
                    2 * radius
                    } a${radius} ${radius} 0 0,1 ${0},${-2 * radius} z`}
                    />
                </Svg>
            </View>
        </View>
    )
}

export default SyncingAnimatedIcon;