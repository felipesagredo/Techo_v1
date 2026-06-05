import { useState, useEffect } from 'react';
import { getHerramientas } from '@services/Herramientas.service';

export function useGetHerramientas(){
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [herramientas, setHerramientas] = useState([]);

    const refetch = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await getHerramientas();
            if (response.status === 'Success') {
                setHerramientas(response.data || []);
            } else {
                setError(response.message || 'Error al obtener herramientas');
            }
        } catch (error) {
            setError(error.message || 'Error al obtener herramientas');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        refetch();
    }, []);
    
    return { herramientas, loading, error, refetch };
}