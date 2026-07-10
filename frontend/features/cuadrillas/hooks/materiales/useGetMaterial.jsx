import { useState, useEffect } from 'react';
import { getMateriales } from '../../services/Materiales.service';

export function useGetMateriales() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [materiales, setMateriales] = useState([]);

    const refetch = async () => { // Función para volver a cargar los materiales
        setLoading(true);
        setError(null);
        try {
            const response = await getMateriales();
            if (response.status === 'Success') {
                setMateriales(response.data || []);
            } else {
                setError(response.message || 'Error al obtener materiales');
            }
        } catch (error) {
            setError(error.message || 'Error al obtener materiales');
        }
        finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        refetch();
    }, []);

    return { materiales, loading, error, refetch };
}