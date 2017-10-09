import React, {Component} from 'react'
import PropTypes from 'prop-types'
import {View, TextInput, StyleSheet, Dimensions, Platform} from 'react-native'
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

const getContainerStyle = (height, passedStyle, position = 'default') => {
	const style = (CONTAINER_STYLES[position] || CONTAINER_STYLES.default)
	return [styles.container, {...style, height}, passedStyle]
}


export default class ConfirmationCodeInput extends Component {
	static propTypes = {
		codeLength: PropTypes.number,
		inputPosition: PropTypes.oneOf(Object.keys(CONTAINER_STYLES)),
		size: PropTypes.number,
		space: PropTypes.number,
		type: PropTypes.string,
		cellBorderWidth: PropTypes.number,
		activeColor: PropTypes.string,
		inactiveColor: PropTypes.string,
		autoFocus: PropTypes.bool,
		codeInputStyle: TextInput.propTypes.style,
		containerStyle: View.propTypes.style,
		onFulfill: PropTypes.func,
		inputComponent: React.PropTypes.func,
	}

	static defaultProps = {
		codeLength: 5,
		inputPosition: 'center',
		autoFocus: true,
		size: 40,
		type: 'border-box',
		cellBorderWidth: 1,
		activeColor: 'rgba(255, 255, 255, 1)',
		inactiveColor: 'rgba(255, 255, 255, 0.2)',
		space: 8,
		inputComponent: TextInput,
		onFulfill: () => undefined,
	}

	constructor(...args) {
		super(...args)
		this.codeInputRefs = []
		this.state = {
			codeArr: new Array(this.props.codeLength).fill(''),
			currentIndex: 0,
		}
	}

	clear() {
		this.setState({
			codeArr: new Array(this.props.codeLength).fill(''),
			currentIndex: 0,
		})
		this._setFocus(0)
	}

	_setFocus(index) {
		this.codeInputRefs[index].focus()
	}

	_blur(index) {
		this.codeInputRefs[index].blur()
	}

	_onFocus(index) {
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


	_getInputSpaceStyle(space) {
		const {inputPosition} = this.props
		switch (inputPosition) {
			case 'left':
				return {
					marginRight: space,
				}
			case 'center':
				return {
					marginRight: space / 2,
					marginLeft: space / 2,
				}
			case 'right':
				return {
					marginLeft: space,
				}
			default:
				return {
					marginRight: 0,
					marginLeft: 0,
				}
		}
	}

	_getTypeStyle(type, active) {
		const {cellBorderWidth, activeColor, inactiveColor, space} = this.props
		const classStyle = {
			...this._getInputSpaceStyle(space),
			color: activeColor,
		}

		switch (type) {
			case 'clear':
				return Object.assign({}, classStyle, {borderWidth: 0})
			case 'border-box':
				return Object.assign({}, classStyle, {
					borderWidth: cellBorderWidth,
					borderColor: active ? activeColor : inactiveColor,
				})
			case 'border-circle':
				return Object.assign({}, classStyle, {
					borderWidth: cellBorderWidth,
					borderRadius: 50,
					borderColor: active ? activeColor : inactiveColor,
				})
			case 'border-b':
				return Object.assign({}, classStyle, {
					borderBottomWidth: cellBorderWidth,
					borderColor: active ? activeColor : inactiveColor,
				})
			case 'border-b-t':
				return Object.assign({}, classStyle, {
					borderTopWidth: cellBorderWidth,
					borderBottomWidth: cellBorderWidth,
					borderColor: active ? activeColor : inactiveColor,
				})
			case 'border-l-r':
				return Object.assign({}, classStyle, {
					borderLeftWidth: cellBorderWidth,
					borderRightWidth: cellBorderWidth,
					borderColor: active ? activeColor : inactiveColor,
				})
			default:
				return type
		}
	}

	_onKeyPress(e) {
		if (e.nativeEvent.key === 'Backspace') {
			const {currentIndex} = this.state
			const nextIndex = currentIndex > 0 ? currentIndex - 1 : 0
			this._setFocus(nextIndex)
		}
	}

	_onInputCode(character, index) {
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

	render() {
		const {
			codeLength, codeInputStyle, containerStyle,
			inputPosition, autoFocus, type, size, activeColor,
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
					this._getTypeStyle(type, this.state.currentIndex == id),
					codeInputStyle,
				]}
				underlineColorAndroid='transparent'
				selectionColor={activeColor}
				keyboardType={defaultKeyboardType}
				returnKeyType={'done'}
				{...this.props}
				autoFocus={autoFocus && id == 0}
				onFocus={() => this._onFocus(id)}
				value={this.state.codeArr[id] ? this.state.codeArr[id].toString() : ''}
				onChangeText={text => this._onInputCode(text, id)}
				onKeyPress={e => this._onKeyPress(e)}
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
	