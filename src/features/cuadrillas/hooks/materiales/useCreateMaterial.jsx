import { useState } from "react";
import { createMaterial } from "../../services/Materiales.service";
import Swal from "sweetalert2";

export function useCreateMaterial() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleCreateMaterial = async(dataMaterial) => {
        setLoading(true);
        setError(null);
        try{
            const response = await createMaterial(dataMaterial);
            if(response.status === "Success") {
                Swal.fire({
                    icon: 'success',
                    title: 'Exito',
                    text: 'Material Agregado Correctamente',
                    timer:2000
                });
            }else {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: response.message || 'Error al agregar el material',
                    timer: 2000
                });
            }
            return response;
        }catch (error) { // Corregido el error de sintaxis aquí
            setError(error); // Guardar el error en el estado
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: error.message || 'Error al agregar el material',
                timer: 2000
            });
            return error.response.data; // Devolver el error para que pueda ser manejado por el componente
        }finally {
            setLoading(false);
        }
    };

    return {handleCreateMaterial, loading, error};
}