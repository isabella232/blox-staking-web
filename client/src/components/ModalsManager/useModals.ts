import { useState } from 'react';

const initial: Record<string, any> = { show: false, type: '', params: null };

const useModals = () => {
  const [ modal, setShowModal ] = useState(initial);
  const showModal: ShowModal = (params: Record<string, any>) => setShowModal(params);
  const hideModal: HideModal = () => setShowModal(initial);
  return ({ modal, showModal, hideModal });
};

type ShowModal = (params: Record<string, any>) => void;
type HideModal = () => void;

export default useModals;
