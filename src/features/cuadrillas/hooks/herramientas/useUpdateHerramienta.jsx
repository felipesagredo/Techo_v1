import { useState } from "react";
import { updateHerramientas } from '@services/Herramientas.service';
import Swal from 'sweetalert2';

export function useUpdateHerramienta(){
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [herramienta, setHerramienta] = useState(null);

    const handleUpdateHerramienta = async (id, data) => {
        setLoading(true);
        setError(null);
        try {
            const response = await updateHerramientas(id, data);
            if (response.status === "Success") {
                Swal.fire({
                    icon: 'success',
                    title: "Exito",
                    text: "Herramienta actualizada exitosamente",
                    timer: 2000
                });
            }else{
                Swal.fire({
                    icon: "error",
                    title: "Error",
                    text: response.message || 'Error al actualizar la herramienta',
                    timer: 2000
                });
            }
            setHerramienta(response.data);
        } catch (error){
            setError(error);
        } finally {
            setLoading(false);
        }
    };
    
    return { handleUpdateHerramienta, loading, error, herramienta};
}