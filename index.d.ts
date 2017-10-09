import * as React from "react";
import * as ReactNative from "react-native";

declare module "react-native-confirmation-code-input" {

    type InputPositions = 'left' | 'right' | 'center' | 'full-width';
    type BorderTypes = 'clear' | 'square' | 'circle' | 'underline';

    interface CodeInputProps extends ReactNative.TextInputProperties {
        inputComponent?: Function;
        codeLength?: number;
        inputPosition?: InputPositions;
        size?: number;
        space?: number;
        borderType?: BorderTypes;
        cellBorderWidth?: number;
        activeColor?: string;
        inactiveColor?: string;
        codeInputStyle?: any,
        containerStyle?: any;
        onFulfill: Function;
    }

    export default class CodeInput extends React.Component<CodeInputProps, any> { }
}
