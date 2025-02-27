import { X } from 'lucide-react';
import { buttonVariants } from '@/lib/config.ts';
import { Button } from '@/components/ui/button';

interface HelpMenuProps {
    close: () => void;
    page: string;
}

const HelpMenu: React.FC<HelpMenuProps> = ({close, page}) => {
  const currentPage = page;

    return(
        <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-1/2 h-3/4 bg-white dark:bg-[#232528] shadow-xl rounded-lg z-50 border border-[#9facbc]">
            <div className='flex justify-between items-center mb-4 p-2 pl-4 border-b border-[#9facbc] font-bold'>
                {currentPage === 'Tutorial' ? 'Tutorial' : currentPage === 'Credits' ? 'Credits' : ''}
              <span className="cursor-pointer" title='Close' onClick={close}>
                <X size={18} />
              </span>
            </div>
            {currentPage === 'Credits' && (
                <div>
                  <div className='p-4 flex flex-row gap-24 justify-center'>
                      <div>
                          <h2 className="text-lg font-semibold mb-2 flex items-center">
                          <img src={`/logo-light.png`} alt="Logo" className="h-14 p-4" />
                            IMF Editor - 2025 Team
                          </h2>
                        <ul className="list-disc pl-16 space-y-1">
                          <li>Eskil Ekaas Schjong</li>
                          <li>Filip Byrjall Eriksen</li>
                          <li>Lars Fredrik Dramdal Imsland</li>
                          <li>Muhammad Fazlur Rahman</li>
                        </ul>
                      </div>
                      <div>
                      <h2 className="text-lg font-semibold mb-2 flex items-center">
                          <img src={`/logo-2024.png`} alt="Logo" className="h-14 p-4" />
                            Node Editor 3900 - 2024 Team
                          </h2>
                        <ul className="list-disc pl-16 space-y-1">
                          <li>Ali Haider Khan</li>
                          <li>Ali Nasir</li>
                          <li>Håkon Skaftun</li>
                          <li>Mathias Christoffer Kolberg</li>
                          <li>Oliver Berg Preber</li>
                        </ul>
                      </div>
                  </div>
                      <div className='p-4 flex flex-row gap-24 justify-center'>
                      <div>
                      <h2 className="text-lg font-semibold mb-2 flex items-center">
                          <img src={`/logo-oslomet.png`} alt="Logo" className="h-14 p-4" />
                            OsloMet - Internal Supervisor
                          </h2>
                        <ul className="list-disc pl-16 space-y-1">
                          <li>Baifan Zhou</li>
                        </ul>
                      </div>
                      <div>
                          <h2 className="text-lg font-semibold mb-2 flex items-center">
                          <img src={`/logo-siriuslabs.png`} alt="Logo" className="h-14 p-4" />
                            Sirius Labs - Contact Person
                          </h2>
                        <ul className="list-disc pl-16 space-y-1">
                        <li>Yuanwei Qu</li>
                        </ul>
                      </div>
                  </div>
                </div>
            )}
            {currentPage === 'Tutorial' && (
                <div className='p-4'>
                    <h2 className="text-lg font-semibold mb-2">Welcome to IMF Editor</h2>
                </div>
            )}
        </div>
    )
}

export default HelpMenu;