import { useState} from 'react';
import { getHerramientas } from '@services/Herramientas.service';

export function useGetHerramientas(){
    const [loading, setLoading] = useState(false); // Estado para indicar si la operación está en curso
    const [error, setError] = useState(null); // guarda errores por si algo falla
    const [herramienta, setHerramienta] = useState(null); // esto guarda el dato que devuelve la api para mostrarlo

    const handleGetHerramienta = async(id) => { // esta función se llama para obtener los datos de la api
        setLoading(true); // indica que la operación está en curso
        setError(null); // limpia errores anteriores
    try {
        const response = await getHerramientas(id); // llama a la función que hace la petición a la api
        setHerramienta(response.data); // guarda la herramienta
    }catch (error){
        setError(eror); //guarda el error si falla
        } finally { 
            setLoading(false); //indica que la operación ha terminado, ya sea con éxito o con error
        }
    };
    
    return { handleGetHerramienta, loading, error, herramienta }; //devuelve la funcion y el estado para que pueda ser usado
}