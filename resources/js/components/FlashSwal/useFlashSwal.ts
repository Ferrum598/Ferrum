import { usePage } from '@inertiajs/react';
import { useEffect } from 'react';
import Swal from 'sweetalert2';
import { FlashMensaje } from '../Interfaces/interfaceInventario';

// Muestra con SweetAlert el mensaje flash enviado por el backend
export default function useFlashSwal() {
    const { flash } = usePage<{ flash?: FlashMensaje }>().props;

    useEffect(() => {
        if (flash?.icon) {
            Swal.fire({
                position: 'top-end',
                title: flash.title,
                text: flash.message,
                icon: flash.icon,
                timer: 1800,
                showConfirmButton: false,
            });
        }
    }, [flash]);
}
