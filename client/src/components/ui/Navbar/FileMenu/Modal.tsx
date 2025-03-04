import { X } from 'lucide-react';
import { useTheme } from '@/hooks';
import ExportFile from './ExportFile';
import ImportFile from './ImportFile';

interface ModalProps {
  close: () => void;
  page: string;
}

const Modal: React.FC<ModalProps> = ({close, page}) => {
  const currentPage = page;
  const { theme } = useTheme();
    return(
        <>
            <div 
          className={`${theme === 'dark' ? 'bg-black' : 'bg-white'} bg-opacity-50 fixed inset-0 z-40`} 
          onClick={close}
            />
            <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-1/4 bg-white dark:bg-[#232528] shadow-xl rounded-lg z-50 border border-[#9facbc]">
          <div className='flex justify-between items-center mb-4 p-2 pl-4 border-b border-[#9facbc] font-bold'>
              {currentPage === 'ExportFile' ? 'Export File' : currentPage === 'ImportFile' ? 'Import File' : ''}
              <span className="cursor-pointer" title='Close' onClick={close}>
            <X size={18} />
              </span>
          </div>
          {currentPage === 'ExportFile' && (
              <ExportFile />
          )}
          {currentPage === 'ImportFile' && (
              <ImportFile close={close}/>
          )}
            </div>
        </>
    )
}

export default Modal;