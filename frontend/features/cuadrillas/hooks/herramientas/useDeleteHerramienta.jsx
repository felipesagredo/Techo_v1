import { useState } from "react";
import { deleteHerramientas } from '@services/Herramientas.service.js';
import Swal from 'sweetalert2';

export function useDeleteHerramienta() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const deleteHerramienta = async (id) => {
        setLoading(true);
        setError(null);
        try {
            const response = await deleteHerramientas(id);
            if (response.status === "Success") {
                Swal.fire({
                    icon: 'success',
                    title: 'Éxito',
                    text: 'Herramienta eliminada correctamente',
                    timer: 2000
                });
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: response.message || 'Error al eliminar la herramienta',
                    timer: 2000
                });
            }
            return response;
        } catch (error) {
            setError(error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: err.message || 'Error al eliminar la herramienta',
                timer: 2000
            });
        } finally {
            setLoading(false);
        }
    };

    return { deleteHerramienta, loading, error };
}
