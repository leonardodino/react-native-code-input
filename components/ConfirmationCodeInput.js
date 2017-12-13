import React, {Component} from 'react'
import PropTypes from 'prop-types'
import {View, TextInput, StyleSheet, Dimensions, Platform, ViewPropTypes} from 'react-native'
import _ from 'lodash'

const defaultKeyboardType = Platform.select({
	ios: 'number-pad',
	android: 'numeric',
})

const CONTAINER_STYLES = {
	left: {justifyContent: 'flex-start'},
	center: {justifyContent: 'center'},
	right: {justifyContent: 'flex-end'},
	'full-width': {justifyContent: 'space-between'},
	default: {justifyContent: 'space-between'},
}

const getContainerStyle = (height, passedStyle, inputPosition) => {
	const style = (CONTAINER_STYLES[inputPosition] || CONTAINER_STYLES.default)
	return [styles.container, {...style, height}, passedStyle]
}

const getInputSpaceStyle = (space, inputPosition) => {
	const positions = {
		left: {marginRight: space},
		center: {marginRight: space / 2, marginLeft: space / 2},
		right: {marginLeft: space},
		'full-width': {marginRight: 0, marginLeft: 0},
		default: {marginRight: 0, marginLeft: 0},
	}
	return positions[inputPosition] || positions.default
}

const getBorderStyle = (cellBorderWidth, borderType) =>{
	const types = {
		clear: {borderWidth: 0},
		square: {borderWidth: cellBorderWidth},
		circle: {borderWidth: cellBorderWidth, borderRadius: 50},
		underline: {borderBottomWidth: cellBorderWidth},
		default: {},
	}
	return types[borderType] || types.default
}

const getBorderTypeStyle = (active, {
	borderType, cellBorderWidth, activeColor,
	inactiveColor, space, inputPosition
}) => ({
	...getInputSpaceStyle(space, inputPosition),
	...getBorderStyle(cellBorderWidth, borderType),
	color: activeColor,
	borderColor: active ? activeColor : inactiveColor,
})

export default class ConfirmationCodeInput extends Component {
	static propTypes = {
		codeLength: PropTypes.number,
		inputPosition: PropTypes.oneOf(Object.keys(CONTAINER_STYLES)),
		size: PropTypes.number,
		space: PropTypes.number,
		borderType: PropTypes.string,
		cellBorderWidth: PropTypes.number,
		activeColor: PropTypes.string,
		inactiveColor: PropTypes.string,
		autoFocus: PropTypes.bool,
		codeInputStyle: TextInput.propTypes.style,
		containerStyle: ViewPropTypes.style,
		onFulfill: PropTypes.func,
		inputComponent: PropTypes.func,
		keyboardType: TextInput.propTypes.keyboardType,
	}

	static defaultProps = {
		codeLength: 5,
		inputPosition: 'center',
		autoFocus: true,
		size: 40,
		borderType: 'border-box',
		cellBorderWidth: 1,
		activeColor: 'rgba(255, 255, 255, 1)',
		inactiveColor: 'rgba(255, 255, 255, 0.2)',
		space: 8,
		inputComponent: TextInput,
		onFulfill: () => undefined,
		keyboardType: defaultKeyboardType,
	}

	constructor(...args) {
		super(...args)
		this.codeInputRefs = []
		this.state = {
			codeArr: new Array(this.props.codeLength).fill(''),
			currentIndex: 0,
		}
	}

	clear = () => {
		this.setState({
			codeArr: new Array(this.props.codeLength).fill(''),
			currentIndex: 0,
		})
		this._setFocus(0)
	}

	_setFocus = (index) => this.codeInputRefs[index].focus()

	_blur = (index) => this.codeInputRefs[index].blur()

	_onFocus = (index) => () => {
		const {codeArr} = this.state
		const currentEmptyIndex = _.findIndex(codeArr, c => !c)
		if (currentEmptyIndex !== -1 && currentEmptyIndex < index) {
			return this._setFocus(currentEmptyIndex)
		}
		const newCodeArr = codeArr.map((v, i) => (i < index ? v : ''))

		this.setState({
			codeArr: newCodeArr,
			currentIndex: index,
		})
	}

	_onKeyPress = (e) => {
		if (e.nativeEvent.key === 'Backspace') {
			const {currentIndex} = this.state
			const nextIndex = currentIndex > 0 ? currentIndex - 1 : 0
			this._setFocus(nextIndex)
		}
	}

	_onInputCode = index => character => {
		const {codeLength, onFulfill} = this.props
		let newCodeArr = _.clone(this.state.codeArr)
		newCodeArr[index] = character

		if (index == codeLength - 1) {
			const code = newCodeArr.join('')
			onFulfill(code)
			this._blur(this.state.currentIndex)
		} else {
			this._setFocus(this.state.currentIndex + 1)
		}

		this.setState(prevState => {
			return {
				codeArr: newCodeArr,
				currentIndex: prevState.currentIndex + 1,
			}
		})
	}

	focus = () => this._setFocus(this.state.currentIndex)

	blur = () => this._blur(this.state.currentIndex)

	render() {
		const {
			codeLength, codeInputStyle, containerStyle,
			inputPosition, autoFocus, size, activeColor,
		} = this.props
		const Component = this.props.inputComponent
		const initialCodeInputStyle = {width: size, height: size}
		const codeInputs = _.range(codeLength).map(id => (
			<Component
				key={id}
				ref={ref => (this.codeInputRefs[id] = ref)}
				style={[
					styles.codeInput,
					initialCodeInputStyle,
					getBorderTypeStyle(this.state.currentIndex == id, this.props),
					codeInputStyle,
				]}
				underlineColorAndroid='transparent'
				selectionColor={activeColor}
				returnKeyType={'done'}
				{...this.props}
				autoFocus={autoFocus && id == 0}
				onFocus={this._onFocus(id)}
				value={this.state.codeArr[id] ? this.state.codeArr[id].toString() : ''}
				onChangeText={this._onInputCode(id)}
				onKeyPress={this._onKeyPress}
				maxLength={1}
			/>
		))

		const viewStyle = getContainerStyle(size, containerStyle, inputPosition)
		return <View style={viewStyle} children={codeInputs}/>
	}
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		flexDirection: 'row',
		marginTop: 20,
	},
	codeInput: {
		backgroundColor: 'transparent',
		textAlign: 'center',
		padding: 0,
	},
})
	