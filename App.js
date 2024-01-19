import { StyleSheet, Text, View, TextInput, TouchableOpacity, Alert, Modal, Pressable, Image, ScrollView } from 'react-native';
import { useState, useEffect } from 'react';
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';

export default function App() {

    //const ip = 'http://10.10.0.168';
    const ip = 'http://192.168.1.2';

    //Para los states de la app
    // Definir un estado 'categoria' con su respectiva función de actualización 'setCategoria'
    const [categoria, setCategoria] = useState("");

    // Definir un estado 'descripcion' con su respectiva función de actualización 'setDescripcion'
    const [descripcion, setDescripcion] = useState("");

    // Definir un estado 'modalVisible' con su respectiva función de actualización 'setModalVisible'
    const [modalVisible, setModalVisible] = useState(false);

    // Definir un estado 'updateModalVisible' con su respectiva función de actualización 'setUpdateModalVisible'
    const [updateModalVisible, setUpdateModalVisible] = useState(false);

    // Definir un estado 'idCategoria' con su respectiva función de actualización 'setIdCategoria'
    const [idCategoria, setIdCategoria] = useState(null);

    // Definir un estado 'dataCategoria' con su respectiva función de actualización 'setDataCategoria'
    const [dataCategoria, setDataCategoria] = useState([]);
    // Definir un estado 'imagen' con su respectiva función de actualización 'setImagen'
    const [imagen, setImagen] = useState(null);

    // Definir un estado 'updateImg' con su respectiva función de actualización 'setUpdateImg'
    const [updateImg, setUpdateImg] = useState(null);

    // Definir una función 'cleanState' que restablece todos los estados a sus valores iniciales
    const cleanState = () => {
        setCategoria("");
        setDescripcion("");
        setIdCategoria(null)
        setImagen(null)
        setUpdateImg(null);
    }

    //handleCreate Funcion para manejar la peticion POST para hacer el insert de los datos en la API
    const handleCreate = async () => {
        //logica para guardar imagen
        let localUri = imagen
        let fileName = ""
        let match = ""
        let type = ""
        if (localUri == null || localUri == "") Alert.alert("Selecciona una iamgen")
        else {
            // Extraer el nombre del archivo de la URL localUri
            /* Esta línea de código toma la URL almacenada en la variable localUri, la divide en segmentos utilizando '/'
            como delimitador y luego toma el último segmento usando pop(). Esto se hace para extraer el nombre del archivo de la URL. */
            fileName = localUri.split('/').pop();

            // Buscar una coincidencia para la extensión del archivo en fileName
            /*
            se utiliza una expresión regular (/\.(\w+)$/) para buscar una coincidencia en el nombre del archivo (fileName). 
            La expresión regular busca una secuencia de caracteres que comienza con un punto (.) 
            seguido de uno o más caracteres de palabra (\w+), representando la extensión del archivo. 
            El resultado de exec() es un array que contiene la cadena coincidente y los grupos capturados.
            En este caso, estamos interesados en el segundo grupo capturado, que es la extensión del archivo. */
            match = /\.(\w+)$/.exec(fileName);

            // Determinar el tipo de archivo (MIME type)
            /*
            se utiliza un operador ternario para determinar el tipo de archivo (MIME type). Si match existe (es decir, 
            si se encontró una coincidencia con la expresión regular), entonces type se establece como image/ 
            seguido de la extensión del archivo obtenida del grupo capturado por la expresión regular (match[1]). 
            Si no hay coincidencia, se establece type como simplemente "image". En resumen, 
            esta línea de código se utiliza para determinar el tipo MIME del archivo, que es útil al enviar archivos 
            en una solicitud HTTP, especialmente cuando se trata de imágenes.
            */
            type = match ? `image/${match[1]}` : `image`;
        }
        /* crea una nueva instancia de la clase FormData en JavaScript. 
        FormData es un objeto que se utiliza para construir fácilmente conjuntos de pares clave/valor que representan datos de formulario,
        que luego se pueden enviar a través de una solicitud HTTP, por ejemplo, al realizar una petición POST. */
        const formData = new FormData();
        // Agregar el nombre de la categoría al objeto FormData
        /*
        Aquí se agrega un par clave-valor al objeto FormData. La clave es 'nombreCategoria', y el valor es el contenido de la 
        variable categoria. Esto se utiliza para enviar el nombre de la categoría como parte de la solicitud.
        */
        formData.append('nombreCategoria', categoria);
        
        // Agregar la descripción de la categoría al objeto FormData
        /*
        De manera similar al paso anterior, se agrega otro par clave-valor al objeto FormData. La clave es 'descripcionCategoria',
         y el valor es el contenido de la variable descripcion. Esto se utiliza para enviar la descripción de la categoría como parte de la solicitud.
         */
        formData.append('descripcionCategoria', descripcion);

        // Agregar información sobre la imagen al objeto FormData
        /*En este caso, en lugar de agregar un simple valor, se agrega un objeto más complejo al objeto FormData. 
        Este objeto representa información sobre la imagen asociada a la categoría. Contiene tres propiedades: 'uri' 
        (la URL o ruta local de la imagen), 'name' (el nombre del archivo) y 'type' (el tipo MIME del archivo).
        Este último paso es común cuando se trabaja con archivos en JavaScript, y en este caso, se utiliza para adjuntar 
        la información de la imagen al objeto FormData, lo que permite enviar archivos junto con otros datos en una solicitud HTTP.
        */
        formData.append('imagenCategoria', {
            uri: localUri,
            name: fileName,
            type
        });


        try {
            //utilizar la direccion IP del servidor y no localhost
            const response = await fetch(`${ip}/coffeeshop/api/services/admin/categoria.php?action=createRow`, {
                method: 'POST',
                body: formData
            });

            const data = response;

            if (data.status) {
                Alert.alert('Datos Guardados correctamente');
                cleanState();
                getCategorias();
                setModalVisible(false);

            } else {
                Alert.alert('Error', data.error);
            }
        } catch (error) {
            Alert.alert('Ocurrió un error al intentar guardar la categoria');
        }
    };

    //getCategorias Funcion para consultar por medio de una peticion GET los datos de la tabla categoria que se encuentran en la base de datos
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

    //Uso del React Hook UseEffect para que cada vez que se cargue la vista por primera vez
    //se ejecute la funcion getCategorias
    useEffect(() => {
        getCategorias()
    }, []);

    //funcionalidad para guardar la imagen
    const openGalery = async () => {
        // Lanza la interfaz de selección de imágenes de la biblioteca de imágenes de Expo
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.All, // Permite seleccionar cualquier tipo de archivo multimedia
            allowsEditing: false, // No permite la edición de la imagen seleccionada
            aspect: [8, 8], // Proporción de aspecto para la imagen seleccionada
            quality: 1, // Calidad de la imagen (valor entre 0 y 1)
        });
    
        if (!result.canceled) {
            const imageWidth = result.assets[0].width;
            const imageHeight = result.assets[0].height;
    
            // Validar que las dimensiones de la imagen no sean mayores que 500x500 píxeles
            if (imageWidth <= 500 && imageHeight <= 500) {
                // Establece la imagen en el estado 'imagen'
                setImagen(result.assets[0].uri);
                // Establece la imagen en el estado 'updateImg'
                setUpdateImg(result.assets[0].uri);
                // Imprime en la consola la URI de la imagen seleccionada
                console.log("Valor enviado a imagen \n", result.assets[0].uri);
            } else {
                // Muestra una alerta indicando que la imagen es demasiado grande
                alert('La imagen seleccionada debe tener dimensiones de 500x500 píxeles o menores.');
            }
        }
    };

        /*
        async () => { ... }: Esta función es una función asíncrona, lo que significa que puede contener operaciones asíncronas como la espera (await). En este caso, se utiliza para esperar la respuesta de ImagePicker.launchImageLibraryAsync.

    let result = await ImagePicker.launchImageLibraryAsync({ ... });: Utiliza await para esperar a que se complete la selección de imágenes. La función launchImageLibraryAsync devuelve un objeto result que contiene información sobre la imagen seleccionada.

    mediaTypes: ImagePicker.MediaTypeOptions.All: Permite seleccionar cualquier tipo de archivo multimedia, no solo imágenes.

    allowsEditing: false: No permite la edición de la imagen seleccionada.

    aspect: [8, 8]: Establece una proporción de aspecto de 8:8 para la imagen seleccionada.

    quality: 1: Establece la calidad de la imagen seleccionada en 1 (máxima calidad).

    if (!result.canceled) { ... }: Verifica si la selección de imágenes no fue cancelada por el usuario.

    setImagen(result.assets[0].uri);: Establece la URI de la imagen seleccionada en el estado imagen. Esto probablemente se utiliza para mostrar la imagen seleccionada en la interfaz de usuario.

    setUpdateImg(result.assets[0].uri);: Establece la URI de la imagen seleccionada en el estado updateImg. Puede ser utilizado para realizar actualizaciones específicas cuando la imagen cambia.
        */

    const deleteCategoria = async (id) => {
        const formData = new FormData();
        formData.append('idCategoria', id);
        try {
            //utilizar la direccion IP del servidor y no localhost
            const response = await fetch(`${ip}/coffeeshop/api/services/admin/categoria.php?action=deleteRow`, {
                method: 'POST',
                body: formData
            });
            const data = await response.json();
            if (data.status) {
                Alert.alert('Categoria Eliminada');
                getCategorias();
                cleanState();
            } else {
                Alert.alert('Error', data.error);
            }

        } catch (error) {
            Alert.alert('Ocurrió un error al intentar eliminar la categoria');
        }
    }

    /*
    getUpdateCategoria: Funcion para obtener los datos de la categoria a editar, los cuales son seteados al state
    */
    const getUpdateCategoria = async (id) => {
        try {
            const formData = new FormData();
            formData.append('idCategoria', id);
            const response = await fetch(`${ip}/coffeeshop/api/services/admin/categoria.php?action=readOne`, {
                method: 'POST',
                body: formData
            });
            const data = await response.json();
            const datos = data.dataset
            if (data.status) {
                setIdCategoria(datos.id_categoria)
                setCategoria(datos.nombre_categoria)
                setDescripcion(datos.descripcion_categoria)
                setImagen(`${ip}/coffeeshop/api/images/categorias/${datos.imagen_categoria}`)
            } else {
                Alert.alert('Error al obtener los datos', data.error);
            }
            setUpdateModalVisible(true);

        } catch (error) {
            Alert.alert('Ocurrió un error al consultar la categoria a editar');
        }
    }

    const handleUpdate = async () => {

        try {
            //console.log("Valor de imagen en el editar: \n", imagen)
            let localUri
            let fileName = ""
            let match = ""
            let type = ""
            // if(updateImg!=null) localUri=updateImg 
            //else localUri=imagen
            updateImg != null ? localUri = updateImg : localUri = imagen
            //si no se manda imagen
            //localUri = `${ip}/coffeeshop/api/images/categorias/${imagen}`
            if (localUri == null || localUri == "") {
                Alert.alert("Selecciona una iamgen")
            }
            else {
                fileName = localUri.split('/').pop()
                match = /\.(\w+)$/.exec(fileName)
                type = match ? `image/${match[1]}` : `image`
            }
            console.log("Valor de id update: ", idCategoria)
            console.log("Valor de categoria update: \n", categoria)
            console.log("Valor de descripcion update: \n", descripcion)
            console.log("valor de imagen", {
                uri: localUri,
                name: fileName,
                type
            })
            const formData = new FormData();
            formData.append('idCategoria', idCategoria);
            formData.append('nombreCategoria', categoria);
            formData.append('descripcionCategoria', descripcion);
            formData.append('imagenCategoria', {
                uri: localUri,
                name: fileName,
                type
            });
            //utilizar la direccion IP del servidor y no localhost
                        const response = await fetch(`${ip}/coffeeshop/api/services/admin/categoria.php?action=updateRow`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Accept': 'application/json'
                  },
                body: formData 
            });
            console.log("Despues del Fetch valor response...\n", response.status)
            const data = await response.json();
            //console.log("Despues del Fetch...\n", data)
            if (data.status) {
                Alert.alert('Datos actualizados correctamente');
                getCategorias();
                cleanState();
                setUpdateModalVisible(false)
            } else {
                Alert.alert('Error', data.error);
            }

        } catch (error) {
            Alert.alert('Ocurrió un error al intentar editar la categoria');
            console.log(' eb handelupdate Ocurrió un error al intentar editar la categoria: \n', error);
            console.log(JSON.stringify(error))
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
                                    source={{ uri: imagen }}
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
                                    source={{ uri: imagen }}
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
                            <TextInput style={styles.input}
                                value={descripcion}
                                placeholder='Descripcion...'
                                onChangeText={setDescripcion} />

                            <Text>Seleccionar imagen</Text>

                            <TouchableOpacity style={styles.loadImageButton}
                                title="Escoge una foto de tu librería"
                                onPress={openGalery}>

                                <Text style={styles.buttonText}>Cargar Imagen</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.button}
                                onPress={handleUpdate}><Text style={styles.buttonText}>Editar categoria</Text></TouchableOpacity>
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
                                        <TouchableOpacity style={styles.buttonDelete} 
                                        onPress={() => deleteCategoria(categoria.id_categoria)}>
                                            <Text style={styles.buttonText}>Eliminar Categoria</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity style={styles.buttonUpdate}
                                            onPress={() => getUpdateCategoria(categoria.id_categoria)}>
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
        alignItems: "center"
    },
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
        marginTop: 5,
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
    vista: {
        display: "flex",
        backgroundColor: "lightblue",
        width: 250,
        padding: 15
    }, buttonDelete: {
        borderWidth: 2,
        borderColor: "black",
        width: 175,
        borderRadius: 10,
        backgroundColor: "red",
        marginTop: 10,
        height: 50,
        padding: 10,
        color: "white",
        fontSize: 15
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
        color: "#FFF",
        fontSize: 15
    },
    scrollContainer: {
        flexGrow: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },

});

