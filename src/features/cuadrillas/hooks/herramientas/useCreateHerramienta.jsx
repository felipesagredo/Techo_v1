import { useState } from "react";
import { createHerramienta } from '@services/Herramientas.service.js';
import Swal from 'sweetalert2';

export function useCreateHerramienta() {
    const [loading, setLoading] = useState(false); // Estado para indicar si la operación está en curso
    const [error, setError] = useState(null); //guarda errores por si algo falla

    const handleCreateHerramienta = async(dataHerramienta) => { //funcion para crear herramienta
        setLoading(true); //la operación está en curso
        setError(null); //limpia errores
        try{
            const response = await createHerramienta(dataHerramienta); //llama a la api para crear herramienta
            if(response.status === "Success") {
                Swal.fire({
                    icon: 'success',
                    title: 'Exito',
                    text: 'Herramienta Agregada Correctamente',
                    timer:2000
                });
            }else {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: response.message || 'Error al agregar la herramienta',
                    timer: 2000
                });
            }
            return response;
        }catch (error) {
            setErrror(error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: error.message || 'Error al agregar la herramienta',
                timer: 2000
            });
        } finally {
            setLoading(false); //indica que ha terminado la op.
        }
    };
}