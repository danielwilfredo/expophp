import { StyleSheet, Text, View, TextInput, TouchableOpacity, Alert, Modal, Pressable, Image, ScrollView} from 'react-native';
import { useState, useEffect } from 'react';
import * as ImagePicker from 'expo-image-picker';

export default function App() {

    //ip const ip='http://10.10.0.176';
    const ip='http://192.168.1.2';

  //Para los states de la app
  const [categoria, setCategoria] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [updateModalVisible, setUpdateModalVisible] = useState(false);
  const [idCategoria, setIdCategoria]=useState(null)
  const [dataCategoria, setDataCategoria] = useState([]);
  const [imagen, setImagen] = useState(null);
  const [updateImg, setUpdateImg]=useState(null);

  //Funcionalidad para hacer el insert
  const handleCreate = async () => {
    //Verificar si es create o update
//const action="";
    (idCategoria === null ) ? action="createRow" : action ="updateRow"
    //logica para guardar imagen
    let localUri=imagen
    let fileName=""
    let match=""
    let type=""
    if(localUri== null || localUri=="")
    {
      Alert.alert("Selecciona una iamgen")
    }
    else{
      fileName=localUri.split('/').pop();
      match=/\.(\w+)$/.exec(fileName)
      type= match ? `image/${match[1]}` : `image`
    }
    console.log("Creando el formData")
    const formData = new FormData();
    formData.append('nombreCategoria', categoria);
    formData.append('descripcionCategoria', descripcion);
    formData.append('imagenCategoria',     {
        uri: localUri,
        name: fileName,
        type
    });   
console.log(" \n-------------- Este es el formDATA ----------\n")        
console.log("FormData_parts ", formData._parts)
console.log("\n -------------- FIN formDATA ----------\n")     
    try {
        //utilizar la direccion IP del servidor y no localhost
        const response = await fetch(`${ip}/coffeeshop/api/services/admin/categoria.php?action=createRow`, {
            method: 'POST',
            body: formData
        });
        //console.log("Despues del Fetch valor response...\n", response.status)
        const data = response;
        //console.log("Despues del Fetch...\n", data)
        if (data.status) {
            Alert.alert('Datos Guardados correctamente');
        } else {
            Alert.alert('Error', data.error);
        }
    } catch (error) {
        Alert.alert('Ocurrió un error al intentar guardar la categoria');
    }
};

//Funcionalidad para listar las categorias
const getCategorias = async () => {
  try {
      //utilizar la direccion IP del servidor y no localhost

      const response = await fetch(`${ip}/coffeeshop/api/services/admin/categoria.php?action=readAll`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' }
      });

      const data = await response.json();

      console.log("data al obtener categorias  \n", data)
      if (data.status) {
          setDataCategoria(data.dataset)
      } else {
          console.log(data);
          // Alert the user about the error
          Alert.alert('Error', data.error);
      }
  } catch (error) {
      console.error(error, "Error desde Catch");
      Alert.alert('Error', 'Ocurrió un error al listar las categorias');
  }
}

useEffect(() => {
  getCategorias()
}, []);

//funcionalidad para guardar la imagen
const openGalery = async () => {
  let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: false,
      aspect: [8, 8],
      quality: 1,
  });

  if (!result.canceled) {
      setImagen(result.assets[0].uri);
      console.log("Valor enviado a imagen \n", result.assets[0].uri)
  }
};

const deleteCategoria= async(id)=>{

    const formData = new FormData();
    formData.append('idCategoria', id);
    try {
        //utilizar la direccion IP del servidor y no localhost
        const response = await fetch(`${ip}/coffeeshop/api/services/admin/categoria.php?action=deleteRow`, {
            method: 'POST',
            body: formData
        });
        const data = response;
        if (data.status) {
            Alert.alert('Categoria Eliminada');
            getCategorias();
        } else {
            Alert.alert('Error', data.error);
        }

    } catch (error) {
        Alert.alert('Ocurrió un error al intentar eliminar la categoria');
    }
}

const updateCategoria = async(id)=>{

    //primero tengo que obtener la categoria a editar

const formData = new FormData();
formData.append('idCategoria', id);
try {

    const response = await fetch(`${ip}/coffeeshop/api/services/admin/categoria.php?action=readOne`, {
        method: 'POST',
        body: formData
    });

    const data = await response.json();
    const datos=data.dataset
    if (data.status) {
        setIdCategoria(datos.id_categoria)
        setCategoria(datos.nombre_categoria)
        setDescripcion(datos.descripcion_categoria)
        setImagen(datos.imagen_categoria)
        setUpdateImg(datos.imagen_categoria)
        console.log("En obtener categoria valor de img: \n", datos.imagen_categoria)
        
    } else {
        Alert.alert('Error al obtener los datos', data.error);
    }
    setUpdateModalVisible(true);
    
} catch (error) {
    Alert.alert('Ocurrió un error al intentar editar la categoria');
}


}

const handleUpdate = async (id) =>{

    console.log("Valor de imagen en el editar: \n", imagen)

    let localUri=""
    let fileName=""
    let match=""
    let type=""

   localUri=`${ip}/coffeeshop/api/images/categorias/${imagen}` 

    if(localUri== null || localUri=="")
    {
      Alert.alert("Selecciona una iamgen")
    }
    else{
    fileName=localUri.split('/').pop()
      match=/\.(\w+)$/.exec(fileName)
      type= match ? `image/${match[1]}` : `image`
    }
    const formData = new FormData();
    formData.append('idCategoria', id);
    formData.append('nombreCategoria', categoria);
    formData.append('descripcionCategoria', descripcion);
    formData.append('imagenCategoria', {
        uri: localUri,
        name: fileName,
        type
    });   
   
    try {
        //utilizar la direccion IP del servidor y no localhost
        const response = await fetch(`${ip}/coffeeshop/api/services/admin/categoria.php?action=updateRow`, {
            method: 'POST',
            body: formData
        });
        //console.log("Despues del Fetch valor response...\n", response.status)
        const data = response;
        //console.log("Despues del Fetch...\n", data)
        if (data.status) {
            Alert.alert('Datos actualizados correctamente');
        } else {
            Alert.alert('Error', data.error);
        }
    } catch (error) {
        Alert.alert('Ocurrió un error al intentar editar la categoria');
    }

}


  return (
    <>
    <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
            Alert.alert('Modal has been closed.');
            setModalVisible(!modalVisible);
        }}>
        <View style={styles.centeredView}>
            <View style={styles.modalView}>
                <Text style={styles.modalText}>Nuevo Registro</Text>
                <View style={styles.container}>
                {imagen && (
                <Image
                source={{uri: imagen}}
                style={{ width: 100, height: 100, borderRadius: 50 }}
                onError={(error) => console.error("Error al cargar la imagen:", error)}
              />
                )} 
                    <Text>Nombre Categoria</Text>
                    <TextInput style={styles.input}
                     value={categoria} 
                     onChangeText={setCategoria}
                      placeholder='Categoria...' />

                    <Text>Descripción Categoria</Text>
                    <TextInput style={styles.input} value={descripcion} 
                    placeholder='Descripcion...'
                     onChangeText={setDescripcion} />

                    <Text>Seleccionar imagen</Text>
                    <TouchableOpacity style={styles.loadImageButton} 
                    title="Escoge una foto de tu librería" 
                    onPress={openGalery}>

                <Text style={styles.buttonText}>Cargar Imagen</Text>
            </TouchableOpacity>
                    <TouchableOpacity style={styles.button} onPress={handleCreate}><Text style={styles.buttonText}>Crear nueva categoria</Text></TouchableOpacity>
                </View>

                <Pressable
                    style={[styles.button, styles.buttonClose]}
                    onPress={() => setModalVisible(!modalVisible)}>
                    <Text style={styles.textStyle}>Cerrar</Text>
                </Pressable>
            </View>
        </View>
    </Modal>

    <Modal
        animationType="slide"
        transparent={true}
        visible={updateModalVisible}
        onRequestClose={() => {
            Alert.alert('Modal has been closed.');
            setUpdateModalVisible(!updateModalVisible);
        }}>
        <View style={styles.centeredView}>
            <View style={styles.modalView}>
                <Text style={styles.modalText}>Editar Registro</Text>
                <View style={styles.container}>
                {imagen && (
                <Image
                source={{uri: imagen}}
                style={{ width: 50, height: 50, borderRadius: 50 }}
                onError={(error) => console.error("Error al cargar la imagen:", error)}
              />
                )} 
                    <Text>Nombre Categoria</Text>
                    <TextInput style={styles.input}
                     value={categoria} 
                     onChangeText={setCategoria}
                      placeholder='Categoria...' />

                    <Text>Descripción Categoria</Text>
                    <TextInput style={styles.input} value={descripcion} 
                    placeholder='Descripcion...'
                     onChangeText={setDescripcion} />

                    <Text>Seleccionar imagen</Text>
                    <TouchableOpacity style={styles.loadImageButton} 
                    title="Escoge una foto de tu librería" 
                    onPress={openGalery}>

                <Text style={styles.buttonText}>Cargar Imagen</Text>
            </TouchableOpacity>
                    <TouchableOpacity style={styles.button}
                    onPress={()=>handleUpdate(idCategoria)}><Text style={styles.buttonText}>Editar categoria</Text></TouchableOpacity>
                </View>

                <Pressable
                    style={[styles.button, styles.buttonClose]}
                    onPress={() => setUpdateModalVisible(!updateModalVisible)}>
                    <Text style={styles.textStyle}>Cerrar</Text>
                </Pressable>
            </View>
        </View>
    </Modal>
    <ScrollView contentContainerStyle={styles.scrollContainer}>
    <Text style={styles.textStyle}>Categorias:</Text>
    {dataCategoria.map((categoria) => (

!categoria ? <Text> No hay categorias</Text> : 

       (<View key={categoria.id_categoria}>
            <View style={styles.vista} >
                <View>
                {categoria.imagen_categoria && (
                    <Image
  source={{ uri: `${ip}/coffeeshop/api/images/categorias/${categoria.imagen_categoria}` }}
  style={{ width: 50, height: 50, borderRadius: 50 }}
  onError={(error) => console.error("Error al cargar la imagen:", error)}
/>
        )
        }
                    <Text >{categoria.nombre_categoria}</Text>
                    <Text >{categoria.descripcion_categoria}</Text>
                    <View>
                    <TouchableOpacity style={styles.buttonDelete} onPress={() => deleteCategoria(categoria.id_categoria)}>
                        <Text style={styles.buttonText}>Eliminar Categoria</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.buttonUpdate} 
                    onPress={() => updateCategoria(categoria.id_categoria)}>
                        <Text>Editar Categoria</Text>
                    </TouchableOpacity>
                    </View>
                </View>

            </View>
        </View>)
    ))}
</ScrollView>


    <View style={styles.centeredView}>
        <TouchableOpacity
            style={[styles.buttonCreate, styles.buttonOpen]}
            onPress={() => setModalVisible(true)}>
            <Text style={styles.textStyle}>Crear una nueva categoria</Text>
        </TouchableOpacity>
        <TouchableOpacity
            style={[styles.buttonGet]}
            onPress={getCategorias}>
            <Text style={styles.textStyle}>Probar consulta categorias</Text>
        </TouchableOpacity>
        
    </View>   
</>
  );
}

const styles = StyleSheet.create({
  container: {
      flex: 1,
      backgroundColor: '#fff',
      alignItems: 'center',
      justifyContent: 'center',
  }, loadImageButton: {
      backgroundColor: "#b3b2b1",
      padding: 8,
      borderRadius: 10,
      width: "40%",
      justifyContent: "center",
      alignItems: "center"},
  input: {
      borderColor: "black",
      borderWidth: 1,
      borderRadius: 7,
      margin: 10,
      paddingHorizontal: 10,
      width: 200
  },
  button: {
      borderWidth: 2,
      borderColor: "black",
      width: 100,
      borderRadius: 10,
      backgroundColor: "darkblue",
      marginTop: 5
  },
  buttonCreate: {
      borderWidth: 2,
      borderColor: "black",
      width: 200,
      borderRadius: 10,
      backgroundColor: "darkblue",
      marginTop: 10,
      height: 50,
      padding: 10
  },
  buttonGet: {
      borderWidth: 2,
      borderColor: "black",
      width: 200,
      borderRadius: 10,
      backgroundColor: "darkblue",
      marginTop: 100,
      height: 50,
      padding: 10
  },

  buttonText: {
      textAlign: "center",
      color: "white"
  },
  centeredView: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: 22,
  },
  modalView: {
      margin: 20,
      backgroundColor: 'white',
      borderRadius: 20,
      padding: 35,
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: {
          width: 0,
          height: 2,
      },
      shadowOpacity: 0.25,
      shadowRadius: 4,
      elevation: 5,
  },
  buttonOpen: {
      backgroundColor: '#F194FF',
  },
  buttonClose: {
      backgroundColor: '#2196F3',
  },
  textStyle: {
      color: 'white',
      fontWeight: 'bold',
      textAlign: 'center',
  },
  modalText: {
      marginBottom: 15,
      textAlign: 'center',
  },
  vista:{
display:"flex",
      backgroundColor:"green",
     width:250,
     padding:15
  },  buttonDelete: {
    borderWidth: 2,
    borderColor: "black",
    width: 175,
    borderRadius: 10,
    backgroundColor: "red",
    marginTop: 10,
    height: 50,
    padding: 10,
    color:"white",
    fontSize:15
},
buttonUpdate: {
    borderWidth: 2,
    borderColor: "black",
    width: 175,
    borderRadius: 10,
    backgroundColor: "orange",
    marginTop: 10,
    height: 50,
    padding: 10,
    color:"#FFF",
    fontSize:15
},
scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
});

