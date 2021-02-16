import * as React from "react";
import { Button, Image, View, Platform, Alert, Text, ActionSheetIOS } from "react-native";
import * as ImagePicker from "expo-image-picker";
import * as Permissions from "expo-permissions";

export default class PickImage extends React.Component {
  constructor(){
    super();
    this.state={
      imageData: null,
      imageUri: null,
      prediction: null
    }
  }

  getPermissionsAsync=async()=>{
    if(Platform.OS !== "web"){
      const {status} = await Permissions.askAsync(Permissions.MEDIA_LIBRARY)
      if(status !== "granted"){
        Alert.alert("We need access to camera roll!");
      }
    }
  }

  uploadImage=async(uri)=>{
    const data = new FormData();
    let filename = uri.split("/")[uri.split("/").length - 1];
    let type = `image/${uri.split('.')[uri.split('.').length - 1]}`;
    const fileToUpload = {
      uri: uri,
      name: filename,
      type: type,
    };
    data.append("alphabet", fileToUpload);
    fetch('https://888372942a6e.ngrok.io/predict-letter', {method: 'POST', body: data, headers: {"content-type": "multipart/form-data"}})
    .then((response) => response.json())
    .then((result) => {
      this.setState({prediction: "Prediction: " + result.prediction})
    })
    .catch((error) => {
      console.error("Error:", error);
    });
  }

  pickImg=()=>{
    try{
      /*let result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });
      if (!result.cancelled) {
        this.setState({ imageUri: result.uri, imageData: result.data, prediction: "Loading..." });
        this.uploadImage(result.uri);
      }*/

      ActionSheetIOS.showActionSheetWithOptions({
        options: ['Cancel', 'Take Photo', 'Choose From Library'],
        cancelButtonIndex: 0,
      },

      async(buttonIndex)=>{
        var result;

        var options = {
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: [4, 3],
          quality: 1,
        }

        if(buttonIndex == 1) {
          result = await ImagePicker.launchCameraAsync(options);
        }
        else if(buttonIndex == 2) {
          result = await ImagePicker.launchImageLibraryAsync(options);
        }

        if(buttonIndex > 0 && !result.cancelled) {
          this.setState({ imageUri: result.uri, imageData: result.data, prediction: "Loading..." });
          this.uploadImage(result.uri);
        }
      });
    }
    catch(error){
      console.log(error);
    }
  }

  componentDidMount() {
    this.getPermissionsAsync();
  }

  render(){
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "space-evenly" }}>
        <Button title="Pick Image" onPress={this.pickImg} />

        <Image source={{uri: this.state.imageUri}} style={{width: '80%', height: 200, borderRadius: 10}} />

        <Text>{this.state.prediction}</Text>
      </View>
    )
  }
}