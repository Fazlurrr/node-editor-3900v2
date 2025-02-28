import { X } from 'lucide-react';
import Credits from './Credits';
import Tutorial from './Tutorial';

interface HelpMenuProps {
    close: () => void;
    page: string;
}

const HelpMenu: React.FC<HelpMenuProps> = ({close, page}) => {
  const currentPage = page;

    return(
        <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-1/2 bg-white dark:bg-[#232528] shadow-xl rounded-lg z-50 border border-[#9facbc]">
            <div className='flex justify-between items-center mb-4 p-2 pl-4 border-b border-[#9facbc] font-bold'>
                {currentPage === 'Tutorial' ? 'Tutorial' : currentPage === 'Credits' ? 'Credits' : ''}
              <span className="cursor-pointer" title='Close' onClick={close}>
                <X size={18} />
              </span>
            </div>
            {currentPage === 'Credits' && (
                <Credits />
            )}
            {currentPage === 'Tutorial' && (
                <Tutorial close={close} />
            )}
        </div>
    )
}

export default HelpMenu;