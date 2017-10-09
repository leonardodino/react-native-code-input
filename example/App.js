import React, { Component } from 'react'
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TextInput,
  Alert,
  KeyboardAvoidingView,
} from 'react-native'

import CodeInput from './_import/ConfirmationCodeInput'

export default class App extends Component {
  state = {code: ''}
  _alert = message => Alert.alert(
    'Confirmation Code',
    message,
    [{text: 'OK'}],
    {cancelable: false}
  )

  _onFulfill1 = (code) => {
    const isValid = code === 'Q234E'
    if(!isValid) this.refs.codeInputRef1.clear()
    this._alert(isValid ? 'Successful!' : 'Code mismatch!')
  }
  
  _onFulfill2 = (code) => {
    const isValid = code.toLowerCase() === 'AsDW2'.toLowerCase()
    this._alert(isValid ? 'Successful!' : 'Code mismatch!')
  }
  
  _onFulfill3 = (code) => {
    const isValid = code === '12345'
    if(isValid) this.setState({code})
    this._alert(isValid ? 'Successful!' : 'Code mismatch!')
  }
  
  render() {
    return (
      <KeyboardAvoidingView behavior='padding' style={styles.container}>
        <ScrollView style={styles.wrapper}>
          <View style={styles.titleWrapper}>
            <Text style={styles.title}>CODE INPUT DEMO</Text>
          </View>
          
          <View style={[styles.inputWrapper, {backgroundColor: '#009C92'}]}>
            <Text style={[styles.inputLabel, {color: '#fff'}]}>
              UNDERLINE CONFIRMATION CODE
            </Text>
            <CodeInput
              ref='codeInputRef1'
              type='border-b'
              space={5}
              size={30}
              inputPosition='left'
              onFulfill={(code) => this._onFulfill1(code)}
            />
          </View>
  
          <View style={[styles.inputWrapper, {backgroundColor: '#E0F8F1'}]}>
            <Text style={[styles.inputLabel, {color: '#31B404', textAlign: 'center'}]}>
              BOX CONFIRMATION CODE
            </Text>
            <CodeInput
              ref='codeInputRef2'
              activeColor='rgba(49, 180, 4, 1)'
              inactiveColor='rgba(49, 180, 4, 1.3)'
              autoFocus={false}
              inputPosition='center'
              size={50}
              onFulfill={(isValid) => this._onFulfill2(isValid)}
              containerStyle={{ marginTop: 30 }}
              codeInputStyle={{ borderWidth: 1.5 }}
            />
          </View>
  
          <View style={[styles.inputWrapper, {backgroundColor: '#2F0B3A'}]}>
            <Text style={[styles.inputLabel, {color: '#fff', textAlign: 'center'}]}>
              CIRCLE CONFIRMATION CODE
            </Text>
            <CodeInput
              ref='codeInputRef3'
              codeLength={5}
              type='border-circle'
              autoFocus={false}
              codeInputStyle={{ fontWeight: '800' }}
              onFulfill={(isValid, code) => this._onFulfill3(isValid, code)}
            />
          </View>
        </ScrollView> 
      </KeyboardAvoidingView>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F6CE'
  },
  titleWrapper: {
    flex: 1,
    justifyContent: 'center',
    flexDirection: 'row',
  },
  title: {
    color: 'red',
    fontSize: 16,
    fontWeight: '800',
    paddingVertical: 30
  },
  wrapper: {
    marginTop: 30
  },
  inputWrapper: {
    paddingVertical: 50,
    paddingHorizontal: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '800'
  },
})
