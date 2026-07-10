import {useState} from 'react';
import {getHerramientasById} from '@services/Herramientas.service';
import Swal from 'sweetalert2';

export function userGetHerramientasById() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [herramienta, setHerramientas] = useState(null);

    const fetchHerramientaById = async (id) => {
        setLoading(true);
        setError(null);
        try{
            const response = await getHerramientasById(id);
            if(response.status === 'Success') {
                Swal.fire({
                    icon: 'success',
                    title: 'Éxito',
                    text: 'Herramienta por id obtenido correctamente',
                    timer: 2000
                });
            }else{
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: response.message || 'Error al obtener la herramienta por id'
                });
            }
            return response;
        }catch (error) {
            setError(error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: error.message || 'Error al obtener la herramienta por Id',
                timer: 2000
            });
        }
    };

    return {material, loading, error, fetchHerramientaById};

}