
import React, { useEffect, useState } from 'react';

import { Alert, PermissionsAndroid, Platform, View, Button, StyleSheet } from 'react-native';
import { BleManager } from 'react-native-ble-plx';


function App(){

  const [scanning,setScanning] = useState(false)

  const manager = new BleManager()

  function myBleScanListenner(erro,device){
      console.log(`Device found!!: ${device.id} - ${device.name}`)
  }

  const scanDevices = async () =>{

    if(scanning === false)
    {
      setScanning(true)
      Alert.alert("Scanning Devices !!");
      manager.startDeviceScan(null,null,myBleScanListenner);

    }
    else
    {
       
        manager.stopDeviceScan()
        Alert.alert("Scan terminated");
        setScanning(false)

    }


  }

  const isBluetoothEnabled = async()=>{
    
    const state = await manager.state();

    if(state === "PoweredOn")
    {
      return true;
    }
    else
    {
      return false;
    }
  }


  const  requireAndroidPermissions = async ()=>{

    console.log("Checking for Permissions")

    //valid only for Android devices
    if(Platform.OS === 'ios')
    {
      return true
    }

    //lets take the API level
    const apiLevel = parseInt(Platform.Version.toString(),10)

    if(apiLevel < 31)
    {
        const granted = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION);
        return granted === PermissionsAndroid.RESULTS.GRANTED;
    }
    else
    {
      const result = await PermissionsAndroid.requestMultiple([PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
                                                                PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
                                                                PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION]);

      return( result['android.permission.BLUETOOTH_CONNECT'] === PermissionsAndroid.RESULTS.GRANTED &&
              result['android.permission.BLUETOOTH_SCAN'] === PermissionsAndroid.RESULTS.GRANTED &&
              result['android.permission.ACCESS_FINE_LOCATION'] === PermissionsAndroid.RESULTS.GRANTED);
    }

  }

  useEffect(()=>{

      async function startup(){

        try
        {
          //check for permissions
          const permissionsOk = await requireAndroidPermissions();
          console.log(`Permissions result: ${permissionsOk}`);

          //checking current Bluetooth State
          const state = await isBluetoothEnabled()

          if(state === false)
          {
            Alert.alert("Please, turn on the Bluetooth!")
          }

        }
        catch(err){
          console.log(`Error on permission request: ${err}`);

        }

      }

      startup();



  },[]);

  return (
   <View style={style.button}>
      <Button  title={scanning === true ? 'Stop Scanning' : 'Start Scanning'} onPress={scanDevices}></Button>
   </View>
  );

}

const style = StyleSheet.create({
  button:{
    margin:16,
  }

});
export default App;
