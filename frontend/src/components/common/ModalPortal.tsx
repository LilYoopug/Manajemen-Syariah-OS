import React from 'react';
import { createPortal } from 'react-dom';

/**
 * Portal component for rendering modals outside the main app container.
 * This ensures `position: fixed` works correctly even when parent elements
 * have `transform`, `filter`, or `overflow: hidden` properties.
 */
const ModalPortal: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Render directly to body - the modal's own fixed positioning will work correctly
  return createPortal(children, document.body);
};

export default ModalPortal;
