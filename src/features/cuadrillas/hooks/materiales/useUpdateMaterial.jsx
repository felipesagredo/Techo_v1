import { useState } from "react";
import { updateHerramientas } from '@services/Herramientas.service';
import Swal from 'sweetalert2';

export function useUpdateMaterial(){
    const [loading, setLoading] = useState(false); // Estado de carga
    const [error, setError] = useState(null); // Estado de error
    const [material, setMaterial] = useState(null); // Estado para almacenar el material actualizado

    const handleUpdateMaterial = async (id, data) => {
        setLoading(true);
        setError(null);
        try {
            const response = await updateHerramientas(id, data);
            if (response.status === "Success") {
                Swal.fire({
                    icon: 'success',
                    title: "Exito",
                    text: "Material actualizado exitosamente",
                    timer: 2000
                });
            }else{
                Swal.fire({
                    icon: "error",
                    title: "Error",
                    text: response.message || 'Error al actualizar el material',
                    timer: 2000
                });
            }
            setMaterial(response.data); // Guardar el material actualizado en el estado
        }catch (error){
            setError(error); // Guardar el error en el estado
        }finally {
            setLoading(false); // Finalizar el estado de carga
        }
    };

    return { handleUpdateMaterial, loading, error, material}; // Retornar la función de actualización y los estados
}