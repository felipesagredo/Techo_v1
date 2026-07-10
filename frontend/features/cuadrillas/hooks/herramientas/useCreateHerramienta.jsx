import { useState } from "react";
import { createHerramienta } from '@services/Herramientas.service.js';
import Swal from 'sweetalert2';

export function useCreateHerramienta() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleCreateHerramienta = async(dataHerramienta) => {
        setLoading(true);
        setError(null);
        try{
            const response = await createHerramienta(dataHerramienta);
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
            setError(error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: error.message || 'Error al agregar la herramienta',
                timer: 2000
            });
            return error.response.data;
        } finally {
            setLoading(false);
        }
    };

    return { handleCreateHerramienta, loading, error };
}