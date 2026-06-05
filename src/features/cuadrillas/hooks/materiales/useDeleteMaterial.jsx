import { useState } from "react";
import { deleteMaterial } from '@services/Herramientas.service';
import Swal from 'sweetalert2';

export function useDeleteMaterial() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const deleteMaterialById = async (id) => {
        setLoading(true);
        setError(null);
        try {
            const response = await deleteMaterial(id);
            if (response.status === "Success") {
                Swal.fire({
                    icon: 'success',
                    title: 'Éxito',
                    text: 'Material eliminado correctamente',
                    timer: 2000
                });
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: response.message || 'Error al eliminar el material',
                    timer: 2000
                });
            }
            return response;
        } catch (error) {
            setError(error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: error.message || 'Error al eliminar el material',
                timer: 2000
            });
        } finally {
            setLoading(false);
        }
    };

    return { deleteMaterialById, loading, error };
}
