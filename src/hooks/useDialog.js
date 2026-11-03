import { useEffect, useRef } from 'react';

export default function useDialog(isOpen, onClose) {
  const ref = useRef(null);
  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (isOpen && !dialog.open) dialog.showModal();
    else if (!isOpen && dialog.open) dialog.close();
    if (!isOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);
  return {
    ref,
    onCancel: (event) => {
      event.preventDefault();
      onClose();
    },
    onClose,
  };
}
