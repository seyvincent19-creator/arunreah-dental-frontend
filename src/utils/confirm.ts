import Swal from 'sweetalert2';

export async function confirmDelete(subject: string): Promise<boolean> {
  const result = await Swal.fire({
    icon: 'warning',
    title: `Delete ${subject}?`,
    text: 'This action cannot be undone.',
    showCancelButton: true,
    confirmButtonText: 'Delete',
    confirmButtonColor: '#dc2626',
    cancelButtonText: 'Cancel',
  });

  return result.isConfirmed;
}

export function notifySuccess(message: string) {
  Swal.fire({ icon: 'success', title: message, timer: 1800, showConfirmButton: false });
}

export function notifyError(message: string) {
  Swal.fire({ icon: 'error', title: message });
}
